/*
 *
 *
 */

// Based on
// https://github.com/cwilso/metronome
// By Chris Wilson
// Requires Microevents.js

//Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
//MIT License

function Metronome(tempo, resolution, notelength) {
    this.tempo = tempo;
    this.noteResolution = resolution;
    this.noteLength = notelength;
    this.enableBeeps = false;
    this.audioContext = null;
    this.isPlaying = false;         // Are we currently playing?
    this.startTime;                 // The start time of the entire sequence.
    this.current16thNote;			// What note is currently last scheduled?
    this.lookahead = 25.0;			// How frequently to call scheduling function
    this.scheduleAheadTime = 0.1;	// How far ahead to schedule audio (sec)
    								// This is calculated from metroLookahead, and overlaps
    								// with next interval (in case the timer is late)
    this.nextNoteTime = 0.0;	    // when the next note is due.
    this.notesInQueue = [];
    this.notesCounter = 0;
    this.timerWorker = null;
};

// Mix in Microevent object so our Metronome object can emit events
MicroEvent.mixin(Metronome);

Metronome.prototype.setTempo = function(tempo) {
    this.tempo = tempo;
};

Metronome.prototype.setNoteResolution = function(resolution) {
    this.noteResolution = resolution;
};

Metronome.prototype.setNoteLength = function(length) {
    this.noteLength = length;
};

Metronome.prototype.enableBeeps = function(enable) {
    if(enable === true)
        this.enableBeeps = true;
    else
        this.enableBeeps = false;
};

Metronome.prototype.nextNote = function() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / this.tempo;         // Notice this picks up the CURRENT
                                                    // metroTempo value to calculate beat length.
    this.nextNoteTime += 0.25 * secondsPerBeat;     // Add beat length to last beat time
    this.current16thNote++;                         // Advance the beat number, wrap to zero
    if (this.current16thNote == 16) {
        this.current16thNote = 0;
    }
    this.notesCounter++;
};

Metronome.prototype.scheduleNote = function(beatNumber, time) {
    // Push the note on the queue, even if we're not playing.
    this.notesInQueue.push({note: beatNumber, time: time});

    if ((this.noteResolution==1) && (beatNumber%2))
        return; // We're not playing non-8th 16th notes
    if ((this.noteResolution==2) && (beatNumber%4))
        return; // We're not playing non-quarter 8th notes

    // Create an oscillator
    var osc = this.audioContext.createOscillator();
    //osc.connect(this.audioContext.destination);
    //osc.frequency.value = 220.0;

    //osc.start(time);
    //osc.stop(time + this.noteLength);

    var self = this;
    self.trigger('tick', beatNumber);
    self.trigger('counter', this.notesCounter);
};

Metronome.prototype.scheduler = function() {
    // While there are notes that will need to play before the next interval,
    // Schedule them and advance the pointer.
    while(this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
        this.scheduleNote(this.current16thNote, this.nextNoteTime);
        this.nextNote();
    };
};

Metronome.prototype.play = function() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) { // Start playing
        this.current16thNote = 0;
        this.nextNoteTime = this.audioContext.currentTime;
        this.timerWorker.postMessage("start");
        return "stop";
    } else {
        this.timerWorker.postMessage("stop");
        return "play";
    };
};

Metronome.prototype.init = function() {
    // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
    // http://cwilso.github.io/metroAudioContext-MonkeyPatch/metroAudioContextMonkeyPatch.js
    // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
    // spec-compliant, and work on Chrome, Safari and Firefox.

    var self = this;    // Handle to object instance context, used below.
    this.audioContext = new AudioContext();

    this.timerWorker = new Worker("js/lib/metronome/metronomeworker.min.js");

    this.timerWorker.addEventListener('message', function(e) {
        if (e.data == "tick") {
            self.scheduler();
        } else
            console.log("message: " + e.data);
    }, false);

    this.timerWorker.postMessage({"interval":this.lookahead});
};
