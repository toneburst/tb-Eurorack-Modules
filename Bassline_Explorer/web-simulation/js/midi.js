/*
 *
 *
 *
 */

///////////////////////////
// MIDI Output Variables //
///////////////////////////

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
