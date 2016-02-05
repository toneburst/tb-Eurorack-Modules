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

// Coordinates
var valx = 0;
var valy = 0;

// Auto-reset period (index into resetperiodtable array in tables.js)
var autoresetindex = 2;
var autoreset = resetperiodtable[autoresetindex][1];

// Selected channel for Length and Shift controls
var lnshiftchannel = 0;

// Theshold values
var thresholds = new Array();
thresholds[0] = 127;    // Note Threshold
thresholds[1] = 127;    // Octave Threshold
thresholds[2] = 127;    // Accent Threshold
thresholds[3] = 127;    // Slide Threshold

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

// Var to hold MIDI note-recorder object
var recorder = null;

///////////////////////////////////////
// Start Main Functions at page load //
///////////////////////////////////////

$(document).ready(function() {

    // Setup Sequencer controls
    setupcontrols();

    // Setup Playback controls
    setupplaybackcontrols();

    // Init MIDI
    //setupmidi();

    // Init Clock
    //var noteoffcounter16ths = 0;
    //clock.setautoreset(autoreset);

    ticker.init({
        bpm: bpm,
        workerurl: "js/lib/tbwm-modules/tbwm-clock/clockworker.min.js"
    }).bind("tick", function(e) {
        clock.tick();
    });

    clock.init({
        autoreset: autoreset,
        counting: "continuous"
    });

    
    clock.bind("1/16", function(e) {
        console.log(e);
    });

    clock.bind("1/32", function(e) {

    });

    /*// Note-Off 16ths
    clock.bind('tick', function() {
        if(noteoffcounter16ths == 3) {
            getStepVals();
            if(recorder)
                recorder.updateticks();
        };
        noteoffcounter16ths++;
    });

    // Note-On 16ths
    clock.bind('16th', function() {
        playStep();
        if(recorder)
            recorder.updateticks();
        masterstepcounter++;
        noteoffcounter16ths = 0;
    });

    // Reset if set
    clock.bind('reset', function() {
        masterstepcounter = 0;
    });*/
});
