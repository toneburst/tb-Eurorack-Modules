/*
 *
 *
 */

// (now loosely) Based on
// https://github.com/cwilso/metronome
// By Chris Wilson
// Requires Microevents.js

//Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
//MIT License

function Metronome(tempo, notelength) {
    this.tempo = tempo;
    this.audioContext = null;
    this.isPlaying = false;         // Are we currently playing?
    this.startTime;                 // The start time of the entire sequence.
    this.lookahead = 5.0;			// How frequently to call scheduling function
    this.scheduleAheadTime = 0.1;	// How far ahead to schedule audio (sec)
    								// This is calculated from lookahead, and overlaps
    								// with next interval (in case the timer is late)
    this.nextNoteTime = 0.0;	    // when the next note is due.
    this.notesCounter = 0;
    this.timerWorker = null;
    this.noteOn = 1;
    this.secondsPerNote = 15.0 / this.tempo;
    this.noteLength = notelength * this.secondsPerNote;
};

// Mix in Microevent object from microevent.js so our Metronome object can emit events
MicroEvent.mixin(Metronome);

Metronome.prototype.setTempo = function(tempo) {
    this.tempo = tempo;
    this.secondsPerNote = 30.0 / this.tempo;
};

Metronome.prototype.setNoteLength = function(length) {
    this.noteLength = Math.min(length, 0.9);
};

Metronome.prototype.nextNote = function() {
    if(this.noteOn === 1) {
        // Schedule note-off to notelength from now
        this.nextNoteTime += this.noteLength;
        // Only increment counter on note-ons (every other pulse)
        this.notesCounter++;
        if(this.notesCounter === 256)
            this.notesCounter = 0;
    } else {
        // Schedule next note-on
        this.nextNoteTime += this.secondsPerNote - this.noteLength;
    }
    this.noteOn = 1 - this.noteOn;
};

Metronome.prototype.scheduleNote = function(time) {
    var self = this;
    if(this.noteOn === 1)
        self.trigger('tick', this.notesCounter);
    else
        self.trigger('note-off', "Note Off");
};

Metronome.prototype.scheduler = function() {
    // While there are notes that will need to play before the next interval,
    // Schedule them and advance the pointer.
    while(this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
        this.scheduleNote(this.nextNoteTime);
        this.nextNote();
    };
};

Metronome.prototype.play = function() {
    this.nextNoteTime = this.audioContext.currentTime;
    this.notesCounter = 0;
    this.timerWorker.postMessage("start");
    console.log("Starting clock");
    this.isPlaying = true;
};

Metronome.prototype.stop = function() {
    this.timerWorker.postMessage("stop");
    console.log("Stopping clock");
    this.isPlaying = false;
};

Metronome.prototype.init = function() {
    // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
    // http://cwilso.github.io/metroAudioContext-MonkeyPatch/metroAudioContextMonkeyPatch.js
    // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
    // spec-compliant, and work on Chrome, Safari and Firefox.
    var self = this;    // Handle to object instance context, used below.
    this.audioContext = new AudioContext();
    // Create an oscillator
    // This seems to be necessary in order for audioContext to increment it's time property
    var dummyosc = this.audioContext.createOscillator();
    this.timerWorker = new Worker("js/lib/metronome/metronomeworker.min.js");
    this.timerWorker.addEventListener('message', function(e) {
        if (e.data == "tick") {
            self.scheduler();
        } else
            console.log("message: " + e.data);
    }, false);
    this.timerWorker.postMessage({"interval":this.lookahead});
};
