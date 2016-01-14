/*
 *
 *
 *
 */

//////////////////////////
// 8-bit blend function //
//////////////////////////

// Olivier Gillet, Grids firmware
// https://github.com/pichenettes/eurorack/blob/master/grids/pattern_generator.cc

function getrandom(max, offset) {
    return Math.round(Math.random() * max) + offset;
}
function U8Mix(a, b, x) {
    return (x == 255)? b : x * b + (255 - x) * a >> 8;
}

///////////////////////////
// 8-bit switch function //
///////////////////////////

function U8Switch(a, b, x) {
    return (x >> 7 == 0)? a : b;
}

/////////////////
// Get corners //
/////////////////

function getcorners(pat, x, y, ch, stp) {
    // Lookup cell indices
    var indx = [coordtable[x][0], coordtable[y][0]];
    // Get corner values
    var a = pat[indx[1]     ][indx[0]    ][ch][stp];
    var b = pat[indx[1]     ][indx[0] + 1][ch][stp];
    var c = pat[indx[1] + 1 ][indx[0]    ][ch][stp];
    var d = pat[indx[1] + 1 ][indx[0] + 1][ch][stp];
    // Return corner values
    return [a, b, c, d];
}

////////////////////////////
// Bilinear Interpolation //
////////////////////////////

function bilinear(pat, ch, x, y, stp) {
    // Get corner values
    var corners = getcorners(pat, x, y, ch, stp);
    // Lookup positions of X and Y coords within cell
    var pos = [coordtable[x][1], coordtable[y][1]];
    // Blend values from 4 corners
    return U8Mix(U8Mix(corners[0], corners[1], pos[0]), U8Mix(corners[2], corners[3], pos[0]), pos[1]);
}

/////////////////////
// Bilinear Switch //
/////////////////////

function cornerswitch(pat, ch, x, y, stp) {
    var step = channelstepcount[ch][1];
    // Get corner values
    var corners = getcorners(pat, x, y, ch, stp);
    // Lookup positions of X and Y coords within cell
    var pos = [coordtable[x][1], coordtable[y][1]];
    return U8Switch(U8Switch(corners[0], corners[1], pos[0]), U8Switch(corners[2], corners[3], pos[0]), pos[1]);
}

////////////////////////
////////////////////////
//// Step Functions ////
////////////////////////
////////////////////////

///////////////
// Play step //
///////////////

function playStep() {
    var note         = stepvals[0];
    var noteprob     = stepvals[1];
    var notethresh   = thresholds[0]
    var octave       = stepvals[2];
    var octaveprob   = stepvals[3];
    var octavethresh = thresholds[1]
    var accentprob   = stepvals[4];
    var accentthresh = thresholds[2]
    var slideprob    = stepvals[5];
    var slidethresh  = thresholds[3]

    // Calculate note-number based on theshold and probability values
    // and conditionally apply random offset
    if(notethresh < 127) {
        if(noteprob > notethresh)
            note = 0;
    } else if(notethresh >= 127) {
        if(noteprob < (notethresh - 127)) {
            // Calculate lookup index for random note/octave tables
            var rtableindex = (channelstepcount[0][2] + randomtablecounter);
            // If note randomisation threshold is high, add random offset to lookup index
            if(notethresh < 250)
                rtableindex += randomtablerandomoffset;
            // Wrap index to table length
            rtableindex = rtableindex % (noterandomtable.length - 1);
            note = (note + noterandomtable[rtableindex]) % 11;
        }
    }

    // Calculate octave based on theshold and probability values
    // and conditionally apply random offset
    if(octavethresh < 127) {
        if(octaveprob > octavethresh)
            octave = 1;
    } else if(octavethresh >= 127) {
        if(octaveprob < (octavethresh - 127)) {
            // Calculate lookup index for random note/octave tables
            var rtableindex = (channelstepcount[1][2] + randomtablecounter);
            // If octave randomisation threshold is high, add random offset to lookup index
            if(octavethresh < 250)
                rtableindex += randomtablerandomoffset;
            // Wrap index to table length
            rtableindex = rtableindex % (octaverandomtable.length - 1);
            octave = (octave + octaverandomtable[rtableindex]) % 2;
        }
    }
    // Calculate MIDO note-number (looking up note number from scale table)
    var midi_notenum = scale[note] + (12 * octave) + transpose;

    // Set note-on velocity
    var midi_velocity = midi_lowvelocity;

    if(accentprob < accentthresh) {
        midi_velocity = midi_highvelocity;
    };
    if(accentthresh >= 192) {
        if((accentprob >> 2) < (accentthresh - 192)) {
            // Calculate lookup index for random note/octave tables
            var rtableindex = (channelstepcount[2][2] + randomtablecounter);
            // If note randomisation threshold is high, add random offset to lookup index
            if(accentthresh > 250)
                rtableindex += randomtablerandomoffset;
            // Wrap index to table length
            rtableindex = rtableindex % (accentrandomtable.length - 1);

            if(accentrandomtable[rtableindex] === 0)
                midi_velocity = midi_lowvelocity;
        };
    };

    // Determine if note is tied (ie slide enabled and note number same as previous note)
    var tied = (slide && midi_notenum == midi_previousnotes[midi_previousnotes.length - 1]) ? true : false;

    // If note isn't tied, send Note-On
    if(!tied) {
        Jazz.MidiOut(0x90,midi_notenum,midi_velocity);
    };

    // Add note number to playing notes array
    midi_previousnotes.push(midi_notenum);

    // Update channel step-counters
    // Add offset and mod channel length with master step counter
    for(i = 0; i < channelstepcount.length; i++) {
        var length = channelstepcount[i][0];
        var offset = channelstepcount[i][1];
        channelstepcount[i][2] = (masterstepcounter + offset) % length;
    };

    // Update random table step-counter
    if(masterstepcounter % channelstepcount[0][0] == 0) {
        // Increment/reset random table counter
        randomtablecounter = (randomtablecounter < (channelstepcount[0][0] - 1)) ? randomtablecounter + 1 : 0;
        // Generate new random offset
        randomtablerandomoffset = getrandom(noterandomtable.length -1, 0);
    };

};

////////////////////////////////////
// Calculate values for next step //
// And send note-offs if required //
////////////////////////////////////

function getStepVals() {

    // Calculate interpolated values for next step
    // Note | Note probability | Octave | Octave probability | Accent probability | Slide probability
    var counterchs = [0, 0, 1, 1, 2, 3];
    for(i = 0; i < stepvals.length; i++) {
        var ctc = counterchs[i];
        if(i == 2) {
            stepvals[i] = cornerswitch(patterns, i, valx, valy, channelstepcount[ctc][2]);
        } else {
            stepvals[i] = bilinear(patterns, i, valx, valy, channelstepcount[ctc][2]);
        };
    };

    // Determine if next note is slide
    slide = (stepvals[5] < easeinsine256[thresholds[3]]) ? true : false;

    if(slide) {
        // Ensure max 2 notes playing
        if(midi_previousnotes.length > 2)
            Jazz.MidiOut(0x80,midi_previousnotes.shift());
    } else {
    // Send note-offs for all previously-playing notes
        for(i = 0; i < midi_previousnotes.length; i++) {
            Jazz.MidiOut(0x80,midi_previousnotes[i],0);
        };
        // Clear previous notes array
        midi_previousnotes = [];
    };
};
