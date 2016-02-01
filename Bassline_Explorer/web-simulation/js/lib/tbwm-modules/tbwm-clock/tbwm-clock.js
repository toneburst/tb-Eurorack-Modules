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

function TBWMClock(tempo) {
    this.tempo = tempo;
    this.audioContext = null;
    this.isPlaying = false;         // Are we currently playing?
    this.startTime;                 // The start time of the entire sequence.
    this.lookahead = 10.0;			// How frequently to call scheduling function
    this.scheduleAheadTime = 0.1;	// How far ahead to schedule audio (sec)
    								// This is calculated from lookahead, and overlaps
    								// with next interval (in case the timer is late)
    this.nextTickTime = 0.0;	    // when the next note is due.
    this.timerWorker = null;
    this.secondsPerTick = 2.5 / this.tempo;
    this.newTempo = this.tempo;

    // Path to web-worker
    // RELATIVE to HTML document to which this script is attached.
    // Will probably need to be changed
    this.workerurl = null;
};

// Mix in Microevent object from microevent.js so our Clock object can emit events
MicroEvent.mixin(TBWMClock);

////////////////////
// Set worker URL //
////////////////////

TBWMClock.prototype.setWorkerURL = function(url) {
    this.workerurl = url;
};

///////////////
// Set tempo //
///////////////

TBWMClock.prototype.setTempo = function(newtempo) {
    this.newTempo = newtempo;
};

/////////////////////
// Setup next tick //
/////////////////////

TBWMClock.prototype.nextTick = function() {
    var self = this;
    // Schedule tick
    this.nextTickTime += this.secondsPerTick
    // Update tempo if required
    if(this.tempo != this.newTempo) {
        this.tempo = this.newTempo;
        this.secondsPerTick = 2.5 / this.tempo;
    };
};

///////////////////
// Schedule tick //
///////////////////

TBWMClock.prototype.scheduleTick = function(time) {
    var self = this;
    // Emit tick
    self.trigger('tick', 'Tick!');
};

TBWMClock.prototype.scheduler = function() {
    // While there are notes that will need to play before the next interval,
    // Schedule them and advance the pointer.
    while(this.nextTickTime < this.audioContext.currentTime + this.scheduleAheadTime) {
        this.scheduleTick(this.nextTickTime);
        this.nextTick();
    };
};

/////////////////
// Start Clock //
/////////////////

TBWMClock.prototype.start = function() {
    this.nextTickTime = this.audioContext.currentTime;
    this.timerWorker.postMessage("start");
    console.log("Starting 96ppqn Clock");
    this.isPlaying = true;
};

////////////////
// Stop Clock //
////////////////

TBWMClock.prototype.stop = function() {
    this.timerWorker.postMessage("stop");
    console.log("Stopping 96ppqn Clock");
    this.isPlaying = false;
};

//////////////////////
// Initialise Clock //
//////////////////////

TBWMClock.prototype.init = function() {
    // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
    // http://cwilso.github.io/metroAudioContext-MonkeyPatch/metroAudioContextMonkeyPatch.js
    // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
    // spec-compliant, and work on Chrome, Safari and Firefox.
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
            console.log("message: " + e.data);
    }, false);
    this.timerWorker.postMessage({"interval":this.lookahead});
};
