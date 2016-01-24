/*
 * Emit 96PPQN pulses for set tempo
 *
 */

// (now loosely) Based on
// https://github.com/cwilso/Clock
// By Chris Wilson
// Requires Microevents.js

function Clock24PPQN(tempo) {
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
};

// Mix in Microevent object from microevent.js so our Clock object can emit events
MicroEvent.mixin(Clock24PPQN);

Clock24PPQN.prototype.setTempo = function(newtempo) {
    this.newTempo = newtempo;
};

Clock24PPQN.prototype.nextTick = function() {
    var self = this;
    // Schedule tick
    this.nextTickTime += this.secondsPerTick
    // Update tempo if required
    if(this.tempo != this.newTempo) {
        this.tempo = this.newTempo;
        this.secondsPerTick = 2.5 / this.tempo;
    };
};

Clock24PPQN.prototype.scheduleTick = function(time) {
    var self = this;
    // Emit tick
    self.trigger('tick', 'Tick!');
};

Clock24PPQN.prototype.scheduler = function() {
    // While there are notes that will need to play before the next interval,
    // Schedule them and advance the pointer.
    while(this.nextTickTime < this.audioContext.currentTime + this.scheduleAheadTime) {
        this.scheduleTick(this.nextTickTime);
        this.nextTick();
    };
};

Clock24PPQN.prototype.play = function() {
    this.nextTickTime = this.audioContext.currentTime;
    this.timerWorker.postMessage("start");
    console.log("Starting 96ppqn Clock");
    this.isPlaying = true;
};

Clock24PPQN.prototype.stop = function() {
    this.timerWorker.postMessage("stop");
    console.log("Stopping 96ppqn Clock");
    this.isPlaying = false;
};

Clock24PPQN.prototype.init = function() {
    // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
    // http://cwilso.github.io/metroAudioContext-MonkeyPatch/metroAudioContextMonkeyPatch.js
    // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
    // spec-compliant, and work on Chrome, Safari and Firefox.
    var self = this;    // Handle to object instance context, used below.
    this.audioContext = new AudioContext();
    // Create an oscillator
    // Necessary in order for audioContext to increment it's time property
    var osc = this.audioContext.createOscillator();
    this.timerWorker = new Worker("js/lib/clock/clockworker.min.js");
    this.timerWorker.addEventListener('message', function(e) {
        if (e.data == "tick") {
            self.scheduler();
        } else
            console.log("message: " + e.data);
    }, false);
    this.timerWorker.postMessage({"interval":this.lookahead});
};
