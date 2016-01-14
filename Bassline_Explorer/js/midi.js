/*
 *
 *
 *
 */

// MIDI output variables
var midi_channel = 0;
var Jazz;
var midi_lowvelocity = 64;
var midi_highvelocity = 127;
var scale = mpscales[0][1];

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
            Jazz.MidiOut(0x90,60,127);
        }).mouseup(function() {
            Jazz.MidiOut(0x80,60,0);
        });

        Jazz.MidiOut(0x44);
    }
    catch(err) {}
};
