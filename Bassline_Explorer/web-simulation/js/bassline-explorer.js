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

//////////////////////////////////////
// Randomise Trigger (Accent/Slide) //
//////////////////////////////////////

function calculatetrigger(chan, prob, thresh, randincr) {
    var result = (prob < thresh) ? 1 : 0;
    if(thresh > 191) {
        if((prob >> 2) < (thresh - 192)) {
            // Calculate lookup index for random accent/slide arrays, wrap to array length
            var rtableindex = (channelstepcount[chan][3]) % (randomtable[chan].length - 1);
            // If note randomisation threshold is high, randomise random table counter increment
            channelstepcount[chan][3] += (thresh > 238) ? randincr : 1;
            // Return 0 if looked up value is 0
            result = randomtable[chan][rtableindex];
        };
    };
    return result;
};

///////////////////////////
// Calculate Note/Octave //
///////////////////////////

function calculatenoteoct(chan, prob, thresh, def, rtabindx, randincr, modulo) {
    var result;
    if(thresh < 127) {
        if(prob > thresh)
            result = def;
    } else if(thresh >= 127) {
        if(prob < (thresh - 127)) {
            // Calculate lookup index for random note/octave tables
            var rtableindex = (channelstepcount[chan][2] + randomtablecounter);
            // If note randomisation threshold is high, add random offset to lookup index
            if(thresh < 250)
                rtableindex += randincr;
            // Wrap index to table length
            rtableindex = rtableindex % (randomtable[rtabindx].length - 1);
            result = (result + randomtable[0][rtableindex]) % modulo;
        };
    };
    return result;
};

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
    var accentthresh = thresholds[2];

    // Calculate note-number based on threshold and probability values
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
                rtableindex += randomtablerandomincrement;
            // Wrap index to table length
            rtableindex = rtableindex % (randomtable[0].length - 1);
            note = (note + randomtable[0][rtableindex]) % 11;
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
                rtableindex += randomtablerandomincrement;
            // Wrap index to table length
            rtableindex = rtableindex % (randomtable[1].length - 1);
            octave = (octave + randomtable[1][rtableindex]) % 2;
        }
    }
    // Calculate MIDI note-number (looking up note number from scale table)
    var midi_notenum = scale[note] + (12 * octave) + transpose;

    // Set note-on velocity
    var midi_velocity = (calculatetrigger(2, accentprob, accentthresh, randomtablerandomincrement) === 0) ? midi_lowvelocity : midi_highvelocity;


    // Determine if note is tied (ie slide enabled and note number same as previous note)
    var tied = (slide && midi_notenum == midi_previousnotes[midi_previousnotes.length - 1]) ? true : false;

    // If note isn't tied, send Note-On
    if(!tied) {
        var notenum = quantiser.applyscale(midi_notenum);
        midiout.send_noteon(null, notenum, midi_velocity, null);
        // Add note number to playing notes array
        midi_previousnotes.push(notenum);
    };

    // Update channel step-counters
    // Add offset and % (mod) channel length with master step counter to get channel step-count
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
        randomtablerandomincrement = getrandom(7, 0);
    };
};

////////////////////////////////////
// Calculate values for next step //
// And send note-offs if required //
////////////////////////////////////

function getStepVals() {

    // Determine if next note is slide
    slide = false;//(calculatetrigger(3, stepvals[5], thresholds[3], randomtablerandomincrement) === 0) ? false : true;

    if(slide) {
        // Ensure max 2 notes playing
        if(midi_previousnotes.length > 1)
            midiout.send_noteoff(null, midi_previousnotes.shift(), 0, null);
    } else {
        // Send note-offs for all previously-playing notes
        for(i = 0; i < midi_previousnotes.length - 1; i++) {
            // null, notenum, midi_velocity, null
            midiout.send_noteoff(null, midi_previousnotes.shift(), 0, null);
        };
        // Clear previous notes array
        midi_previousnotes = [];
    };

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
};
