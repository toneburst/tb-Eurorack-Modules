/*
 *
 *
 *
 */

///////////////////////////
// MIDI Output Variables //
///////////////////////////

var Jazz;

var midi_channel = 0;
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
var midi_previousnotes = [0];

function setupmidi() {
    Jazz = document.getElementById("Jazz1");
    if(!Jazz || !Jazz.isJazz) Jazz = document.getElementById("Jazz2");
    try {
        var midi_devicelist = Jazz.MidiOutList();

        var $select = $("#selectmidi");
        $.each(midi_devicelist, function(i, item) {
            $select.append($('<option>', {
                value: item,
                text : item
            }));
        });

        $select.change(function() {
            Jazz.MidiOutOpen($select.val());
        });

        $("button#testmidibutton").mousedown(function() {
            Jazz.MidiOut(midi_channel + 144,24,127);
        }).mouseup(function() {
            Jazz.MidiOut(midi_channel + 128,24,0);
        });

        Jazz.MidiOut(0x44);
    }
    catch(err) {}
};

//////////////////////////////////
// ADD MIDI PLAY/STOP FUNCTIONS //
//////////////////////////////////

function midi_noteon(channel, note, velocity) {
    Jazz.MidiOut(midi_channel + 144, note, velocity);
    if(recorder)
        recorder.recordnote("NoteOn", midi_channel, note, velocity);
};

function midi_noteoff(channel, note, velocity) {
    Jazz.MidiOut(midi_channel + 128, note, velocity);
    if(recorder)
        recorder.recordnote("NoteOff", midi_channel, note, 0);
};
