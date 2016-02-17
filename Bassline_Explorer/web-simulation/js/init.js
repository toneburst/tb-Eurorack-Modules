/*
*
*
*
*/

//////////////////////
// Global Variables //
//////////////////////

////////////////////////////////
// * Updated in controls.js * //

var settings = {
    valx            : 0,
    valy            : 0,
    thresholdnote   : 0,
    thresholdoctave : 0,
    thresholdaccent : 0,
    thresholdslide  : 0,
    lnshiftchannel  : 0,
    pttnlennote     : 16,
    pttnoffsnote    : 0,
    pttnlenoctave   : 16,
    pttnoffsoctave  : 0,
    pttnlenaccent   : 16,
    pttnoffsaccent  : 0,
    pttnlenslide    : 16,
    pttnoffsslide   : 0,
    scaleindx       : 0,
    transpose       : 0,
    autoreset       : 1
};

// Coordinates
var valx = 0;
var valy = 0;

// Auto-reset period (index into resetperiodtable array in tables.js)
//var autoresetindex = 2;
//var autoreset = 16;

// Selected channel for Length and Shift controls
var lnshiftchannel = 0;

// Theshold values
var thresholds = new Array();
thresholds[0] = 0;    // Note Threshold
thresholds[1] = 0;    // Octave Threshold
thresholds[2] = 0;    // Accent Threshold
thresholds[3] = 0;    // Slide Threshold

// Init values for first step
// Updated by getStepVals() function in bassline-explorer.js
var stepvals = new Array();
stepvals[0] = patterns[0][0][0][0]; // Note Channel
stepvals[1] = patterns[0][0][1][0]; // Note Channel-randomisation probability
stepvals[2] = patterns[0][0][2][0]; // Octave Channel
stepvals[3] = patterns[0][0][3][0]; // Octave Channel-randomisation probability
stepvals[4] = patterns[0][0][4][0]; // Accent Channel probability
stepvals[5] = patterns[0][0][5][0]; // Slide Channel probability

// Channel settings
// Length | Offset | Step-Counter | Random Index Counter
// Channel Length/Offset updated in controls.js, Counters updated in bassline-explorer.js/playStep()
// Pattern channel 1 (note-randomisation probability) shares ch.0 (note) counter
// Pattern channel 3 (octave-randomisation probability) shares ch.2 (octave) counter
var channelstepcount = new Array();
channelstepcount[0] = [16, 0, 0, 0];   // Note channel
channelstepcount[1] = [16, 0, 0, 0];   // Octave channel
channelstepcount[2] = [16, 0, 0, 0];   // Accent channel
channelstepcount[3] = [16, 0, 0, 0];   // Slide channel

// Phase-accumulator and random offset number for random note/octave tables
var randomtablecounter = 0;
var randomtablerandomincrement = Math.round(Math.random() * 31);

// Next note is/isn't slide
var slide = false;

// Clock var (instance of Clock object)
var bpm = 120;
var ticker = new TBWMClock(bpm);
var clock = new TBMWClockdivider();
var masterstepcounter = 0;

var midi_lowvelocity = 63;
var midi_highvelocity = 127;

// Master transpose amount
var transpose = 24;

var enablerecord = false;
var recording = [];

// Scale Index (index into mpscales array in tables.js)
var scaleindex = 2; // Dorian
var scale = mpscales[scaleindex][1];

// Previous note number(s)
// Required to prevent retrigger of slide notes when new and previous note-numbers are same (ie tied notes))
var midi_previousnotes = [];

// Var to hold MIDI note-recorder object
var recorder = null;

// Init MIDI output object
var midiout = null;

// Note/Scale
var quantiser = null;

///////////////////////////////////////
// Start Main Functions at page load //
///////////////////////////////////////

$(document).ready(function() {

    // Setup Sequencer controls
    setupcontrols();

    // Init quantiser
    quantiser = new TBWMNotequantiser();

    // Init MIDI
    midiout = new TBMWMIDIio();
    midiout.init("#midi-outputsettings");

    // Setup Playback controls
    setupplaybackcontrols();

    clock.init({
        autoreset: autoreset,
        counting: "continuous"
    });

    ticker.init({
        bpm: bpm,
        workerurl: "js/lib/tbwm-modules/tbwm-clock/clockworker.min.js"
    }).bind("tick", function(e) {
        clock.tick();
    });

    // Bind to clock-divider 16th notes to update step-counter
    clock.bind("1/16", function(e) {
        masterstepcounter = e;
    });

    // Note On/Off switch
    var onoff = 0;

    // Bind to clock-divider 1/32nd note for note-on/off
    clock.bind("1/32", function(e) {
        // Note-On
        if(onoff === 0) {
            if(recorder)
                recorder.updateticks();
            playStep();
        // Note-Off
        } else {
            if(recorder)
                recorder.updateticks();
            getStepVals();
        };
        // Toggle note on/off switch var
        onoff = 1 - onoff;
    });
});
