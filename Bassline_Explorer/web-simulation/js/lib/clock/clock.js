/*
 *
 *
 */

// (now loosely) Based on
// https://github.com/cwilso/Clock
// By Chris Wilson
// Requires Microevents.js

//Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
//MIT License

function Clock(tempo, gateLength) {
    this.tempo = tempo;
    this.audioContext = null;
    this.isPlaying = false;         // Are we currently playing?
    this.startTime;                 // The start time of the entire sequence.
    this.lookahead = 10.0;			// How frequently to call scheduling function
    this.scheduleAheadTime = 0.1;	// How far ahead to schedule audio (sec)
    								// This is calculated from lookahead, and overlaps
    								// with next interval (in case the timer is late)
    this.nextNoteTime = 0.0;	    // when the next note is due.
    this.notesCounter = 0;
    this.timerWorker = null;
    this.noteOn = 1;
    this.secondsPerNote = 15.0 / this.tempo;
    this.gateLength = gateLength * this.secondsPerNote;
    this.newGateLength = this.gateLength;
    this.newTempo = this.tempo;
    this.resetPeriod = 15;
    this.autoReset = false;
};

// Mix in Microevent object from microevent.js so our Clock object can emit events
MicroEvent.mixin(Clock);

Clock.prototype.log = function(message) {
    console.log(message);
}

Clock.prototype.setTempo = function(newtempo) {
    this.newTempo = newtempo;
};

Clock.prototype.setGateLength = function(length) {
    this.newGateLength = Math.min(length, 0.9);
};

Clock.prototype.setResetPeriod = function(steps) {
    if(steps !== "0") {
        this.resetPeriod = Math.round(steps);
        this.autoReset = true;
    } else {
        autoReset = false;
    };
}

Clock.prototype.isRunning = function() {
    return this.isPlaying;
}

Clock.prototype.nextNote = function() {
    // Note-On
    var self = this;
    if(this.noteOn === 1) {
        // Schedule note-off to gateLength from now
        this.nextNoteTime += this.gateLength;
        // Only increment counter on note-ons (every other pulse)
        this.notesCounter++;
        if(this.autoReset && (this.notesCounter % this.resetPeriod) === 0) {
            this.notesCounter = 0;
            // Emit reset tick
            self.trigger('reset');
        };
    // Note-Off
    } else {
        // Schedule next note-on
        this.nextNoteTime += this.secondsPerNote - this.gateLength;
        // Update tempo and note-length if required
        if(this.tempo != this.newTempo) {
            this.tempo = this.newTempo;
            this.secondsPerNote = 15.0 / this.tempo;
        }
        if(this.gateLength != this.newGateLength) {
            this.gateLength = this.newGateLength  * this.secondsPerNote;
        }
    };
    this.noteOn = 1 - this.noteOn;
};

Clock.prototype.scheduleNote = function(time) {
    var self = this;
    if(this.noteOn === 1) {
        // Emit event on new bar
        if(self.notesCounter % 16 === 0)
            self.trigger('bar');
        // Send note-on tick
        self.trigger('tick', this.notesCounter);
    } else {
        // Emit note-off tick
        self.trigger('note-off', "Note Off");
    };
};

Clock.prototype.scheduler = function() {
    // While there are notes that will need to play before the next interval,
    // Schedule them and advance the pointer.
    while(this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
        this.scheduleNote(this.nextNoteTime);
        this.nextNote();
    };
};

Clock.prototype.play = function() {
    this.nextNoteTime = this.audioContext.currentTime;
    this.notesCounter = 0;
    this.timerWorker.postMessage("start");
    console.log("Starting clock");
    this.isPlaying = true;
};

Clock.prototype.stop = function() {
    this.timerWorker.postMessage("stop");
    console.log("Stopping clock");
    this.isPlaying = false;
};

Clock.prototype.init = function() {
    // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
    // http://cwilso.github.io/metroAudioContext-MonkeyPatch/metroAudioContextMonkeyPatch.js
    // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
    // spec-compliant, and work on Chrome, Safari and Firefox.
    var self = this;    // Handle to object instance context, used below.
    this.audioContext = new AudioContext();
    // Create an oscillator
    // This seems to be necessary in order for audioContext to increment it's time property
    var dummyosc = this.audioContext.createOscillator();
    this.timerWorker = new Worker("js/lib/clock/clockworker.min.js");
    this.timerWorker.addEventListener('message', function(e) {
        if (e.data == "tick") {
            self.scheduler();
        } else
            console.log("message: " + e.data);
    }, false);
    this.timerWorker.postMessage({"interval":this.lookahead});
};
