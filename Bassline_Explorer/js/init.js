/*
*
*
*
*/

//////////////////////
// Global Variables //
//////////////////////

var bpm = 126;
var masterstepcounter = 0;

var valx = 127;
var valy = 127;

// Theshold values
// Updated in controls.js
// Note and Octave Threshold values are currently set to same value
var thresholds = new Array();
thresholds[0] = 127;    // Note Randomisation Threshold
thresholds[1] = 127;    // Octave Randomisation Threshold
thresholds[2] = 127;    // Accent Threshold
thresholds[3] = 127;    // Slide Threshold

// Values for next step
// Updated by getStepVals() function in bassline-explorer.js
var stepvals = new Array();
stepvals[0] = patterns[0][0][0][0]; // Note
stepvals[1] = patterns[0][0][1][0]; // Note-randomisation probability
stepvals[2] = patterns[0][0][2][0]; // Octave
stepvals[3] = patterns[0][0][3][0]; // Octave-randomisation probability
stepvals[4] = patterns[0][0][4][0]; // Accent probability
stepvals[5] = patterns[0][0][5][0]; // Slide probability

// Channel settings
// Channel Length/Offset updated in controls.js, Counters updated in bassline-explorer.js/playStep()
// Pattern channel 1 (note-randomisation probability) shares ch.0 (note) counter
// Pattern channel 3 (octave-randomisation probability) shares ch.2 (octave) counter
var channelstepcount = new Array();
channelstepcount[0] = [16, 0, 0];   // Note channel
channelstepcount[1] = [16, 0, 0];   // Octave channel
channelstepcount[2] = [16, 0, 0];   // Accent channel
channelstepcount[3] = [16, 0, 0];   // Slide channel

// Phase-accumulator and random offset number for random note/octave tables
var randomtablecounter = 0;
var randomtablerandomoffset = Math.round(Math.random() * 31);

// Next note is/isn't slide
var slide = false;

// Master transpose amount
var transpose = 36;

// Start Main Functions at page load
$(document).ready(function() {
    // Setup controls
    setupcontrols();

    // Init MIDI
    setupmidi();

    // Start clock
    //chore();
    start();
});
