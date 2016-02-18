/*
 * Emit 96PPQN pulses for set tempo
 * Requires
 */

// (now loosely) Based on
// https://github.com/cwilso/Clock
// By Chris Wilson
// Requires Microevents.js

// NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
// http://cwilso.github.io/metroAudioContext-MonkeyPatch/metroAudioContextMonkeyPatch.js
// TO WORK ON CURRENT CHROME!!  But this means our code can be properly
// spec-compliant, and work on Chrome, Safari and Firefox.

function TBWMClock(initopts) {

    // Path to web-worker
    // RELATIVE to HTML document to which this script is attached.
    // Will probably need to be changed
    this.workerurl = null;
    if(initopts.workerurl) {
        this.workerurl = initopts.workerurl;
    } else {
        console.log("Error: Webworker URL must be set relative to HTML page by passing object {workerurl : '<url>'} when instantiating this object");
        return this;
    };

    this.tempo = 120;
    if(initopts.bpm)
        this.tempo = initopts.bpm;

    this.audioContext = null;
    this.isplaying = false;         // Are we currently playing?
    this.startTime;                 // The start time of the entire sequence.
    this.lookahead = 10.0;			// How frequently to call scheduling function
    this.scheduleAheadTime = 0.1;	// How far ahead to schedule audio (sec)
    								// This is calculated from lookahead, and overlaps
    								// with next interval (in case the timer is late)
    this.nexttickTime = 0.0;	    // when the next note is due.
    this.timerWorker = null;
    this.secondsPerTick = 2.5 / this.tempo;
    this.newTempo = this.tempo;

    // ID of play/stop button
    this.playbuttonid = "tbwm-clock-playbutton";
    this.temporangeid = "tbwm-clock-temporange"

    // Instantiate utility object
	this.utils = null;
	try {
		if(typeof TBWMSharedfunctions() === undefined)
			throw "TBWMSharedfunctions() Object not available";
		else
			this.utils = new TBWMSharedfunctions();
    }
    catch(err) {
        this.errornoutils(err);
    };

    // Run init method
    this.init();

    // Return object for chaining
    return this;
};

// Mix in Microevent object from microevent.js so our Clock object can emit events
MicroEvent.mixin(TBWMClock);

/////////////////////
// Setup next tick //
/////////////////////

TBWMClock.prototype.nexttick = function() {
    var self = this;
    // Schedule tick
    this.nexttickTime += this.secondsPerTick
    // Update tempo if required
    if(this.tempo != this.newTempo) {
        this.tempo = this.newTempo;
        this.secondsPerTick = 2.5 / this.tempo;
    };
};

///////////////////
// Schedule tick //
///////////////////

TBWMClock.prototype.scheduletick = function(time) {
    var self = this;
    // Emit tick
    self.trigger('tick', 'tick');
};

TBWMClock.prototype.scheduler = function() {
    // While there are notes that will need to play before the next interval,
    // Schedule them and advance the pointer.
    while(this.nexttickTime < this.audioContext.currentTime + this.scheduleAheadTime) {
        this.scheduletick(this.nexttickTime);
        this.nexttick();
    };
};

///////////////
// Set tempo //
///////////////

TBWMClock.prototype.settempo = function(newtempo) {
    this.newTempo = newtempo;
    return this;
};

/////////////////
// Start Clock //
/////////////////

TBWMClock.prototype.start = function() {
    this.nexttickTime = this.audioContext.currentTime;
    this.timerWorker.postMessage("start");
    console.log("TBWMClock: Starting 24PPQN Clock");
    this.isplaying = true;
    return this;
};

////////////////
// Stop Clock //
////////////////

TBWMClock.prototype.stop = function() {
    this.timerWorker.postMessage("stop");
    console.log("TBWMClock: Stopping 24PPQN Clock");
    this.isplaying = false;
    return this;
};

////////////////////////////////////
// Add button to start/stop clock //
////////////////////////////////////

TBWMClock.prototype.addplaybutton = function(opts) {
    if(this.utils && opts && opts.domcontainer) {

		// Check DOM element exists, return early if not
	    var domcontainer = this.utils.DOMcheckelement(opts.domcontainer);
	    if(!domcontainer)
	        return this;

        // Start and Stop button text (default value, value from passed-in options)
        var starttext = "Start Clock";
        if(opts.starttext)
            starttext = opts.starttext;

        var stoptext = "Stop Clock";
        if(opts.starttext)
            stoptext = opts.stoptext;

        // Create <button> element
		var playbutton = this.utils.DOMaddbutton({
			id : this.playbuttonid,
			text : (opts.buttontext !== undefined) ? opts.buttontext : starttext
		});

        // Append button to container DOM element
        domcontainer.appendChild(playbutton);

        // Listen for changes
        var self = this;
        playbutton.addEventListener("mouseup", function() {
            // Toggle clock start/stop
            if(!self.isplaying) {
                self.utils.DOMchangebuttontext({
                    button : this,
                    text : stoptext
                });
                self.start();
            } else {
                self.utils.DOMchangebuttontext({
                    button : this,
                    text : starttext
                });
                self.stop();
                self.trigger("reset", "reset");
            };
        }, false);

    // No utility instance found
    } else {
        return this;
    };
    return this;
};

//////////////////////
// Add Tempo slider //
//////////////////////

TBWMClock.prototype.addtemporange = function(opts) {

    // Return early if Utils object not available
	if(!this.utils) {
		return this;
	};

    // Check DOM element exists, return early if not
    var domcontainer = this.utils.DOMcheckelement(opts.domcontainer);
    if(!domcontainer)
        return this;

	// Add <label> element to container if option set
	if(opts.addlabel === true) {
		domcontainer.appendChild(this.utils.DOMcreatelabel({
			labelfor : this.temporangeid,
			labeltext : (opts.labeltext !== undefined) ? opts.labeltext : "Tempo"
		}));
	};

	// Create new <range> element
	var range = this.utils.DOMaddrange({
		id : this.temporangeid,
		min : 50,
		max : 200,
		step : 1,
		value : this.tempo
	});
    // Append Select to container element
    domcontainer.appendChild(range);

    // Listen for changes
    var self = this;
    range.addEventListener('change', function() {
        // Set transpose amount
        self.settempo(parseInt(this.value));
    });

    // Return object for chaining
    return this;
};


//////////////////////
// Initialise Clock //
//////////////////////

TBWMClock.prototype.init = function() {
    var self = this;    // Handle to object instance context, used below.
    this.audioContext = new AudioContext();
    // Create an oscillator
    // Necessary in order for audioContext to increment it's time property
    var osc = this.audioContext.createOscillator();
    this.timerWorker = new Worker(this.workerurl);
    this.timerWorker.addEventListener('message', function(e) {
        if (e.data == "tick") {
            self.scheduler();
        } else
            console.log("TNWMClock: message: " + e.data);
    }, false);
    this.timerWorker.postMessage({"interval":this.lookahead});
    return this;
};
