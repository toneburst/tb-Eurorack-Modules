/*
 *
 *
 *
 */

// https://github.com/aterrien/jQuery-Knob

/////////////////////////////
// Setup Playback controls //
/////////////////////////////

function setupplaybackcontrols() {

    //////////////////////
    // Parse URL Params //
    //////////////////////

    /*var regex = /[?&]([^=#]+)=([^&#]*)/g,
        url = window.location.href,
        params = {},
        match;
    while(match = regex.exec(url)) {
        params[match[1]] = match[2];
    };*/

    ///////////////////////////////////
    // Output Device / Channel Menus //
    ///////////////////////////////////

    midiout.bind("midistatus", function(e) {
        midiout.addoutputselect({savetocookie: false});
        midiout.addoutchannelselect({savetocookie: false});
        midiout.addtestbutton();
    });

    /////////////////////////////////
    // MIDI Low/High Note Velocity //
    /////////////////////////////////

    $lowvelocityslider = $("#slidermidilowvelocity");
    // Set initial value
    $lowvelocityslider.val(midi_lowvelocity);
    // Handles changes
    $lowvelocityslider.change(function() {
        midi_lowvelocity = parseInt($(this).val());
    });

    $highvelocityslider = $("#slidermidihighvelocity");
    // Set initial value
    $highvelocityslider.val(midi_highvelocity);
    // Handles changes
    $highvelocityslider.change(function() {
        midi_highvelocity = parseInt($(this).val());
    });

    /////////////////
    // Scales Menu //
    /////////////////

    quantiser.addscaleselect("#midi-scalesettings");

    ////////////////////
    // Transpose Menu //
    ////////////////////

    quantiser.addtransposeselect("#midi-scalesettings");

    /////////////////////
    // Auto-Reset Menu //
    /////////////////////

    var $autoresetselect = $("#clock-autoreset");
    $autoresetselect.val(autoreset);
    $autoresetselect.change(function() {
        autoreset = parseInt($(this).val());
        clock.setautoreset(autoreset);
    });

    // clock.setautoreset();

    /////////////////
    // Play Button //
    /////////////////

    $("button#playbutton").click(function() {
        if(ticker.isplaying == false) {
            ticker.start();
            $(this).text("Stop sequencer");
        } else {
            ticker.stop();
            clock.reset();
            $(this).text("Start sequencer");
            //midiout.send_allnotesoff(null, null);
        }
    });

    ///////////////////
    // Tempo Control //
    ///////////////////

    var $temposlider = $("#slider_tempo");
    $temposlider.val(bpm);
    $temposlider.on('change', function() {
        bpm = parseInt($(this).val());
        ticker.settempo(bpm);
    });

    ///////////////////
    // Record Button //
    ///////////////////

    // MIDIFile download form Submit button
    var $getmidixmlbutton = $("#getmidixmlbutton");
    // Hide Submit button
    //$getmidixmlbutton.hide();
    // Record button
    var $recordbutton = $("#recordbutton");
    // Set initial record status
    $recordbutton.data('recordstatus', '0');
    // Hide get MIDI File button
    $getmidixmlbutton.hide();
    // MIDI XML string
    var midixml = null;
    // Handle mousedown on Record button
    $recordbutton.mousedown(function() {
        // We're not recording, so arm recorder
        if($recordbutton.data('recordstatus') === "0") {
            // Disable record button until recording has started
            $recordbutton.prop('disabled', true).html("Recording Armed");
            clock.bind("beforebar", function() {
                $recordbutton.prop('disabled', false);
                $recordbutton.html("Recording...");
                recorder = new MIDIXMLRecorder();
                recorder.settempo(bpm);
                recorder.startrecording();
                clock.unbind("beforebar");
            });
            $recordbutton.data('recordstatus', "1");
        // We are recording, so stop recording
        } else {
            $recordbutton.prop('disabled', true).html("Recording Disarmed");
            clock.bind("beforebar", function() {
                $recordbutton.prop('disabled', false).html("Record");
                clock.unbind("beforebar");
                recorder.stoprecording();
                // Get XML string from recorder
                midixml = recorder.getmidixml();
                recorder = null; // Note sure this method of deleting an object instance works...
                $getmidixmlbutton.show();
            });
            $recordbutton.data('recordstatus', "0");
        };
    });
    // Ajax submit MIDI XML string
    $getmidixmlbutton.mousedown(function() {
        if(midixml) {
            var request = $.ajax({
                url: "php/ajax-submit-midixml.php",
                method: "POST",
                data: {mxml : midixml},
                dataType: "text"
            });
            request.done(function(url) {
                if(url.substring(0, 5) == "Error:") {
                    console.log(url);
                } else {
                    $getmidixmlbutton.hide();
                    $("#midifileiframe").attr('src', url);
                };
            });
            request.fail(function(jqXHR, textStatus) {
                alert("Ajax request failed: " + textStatus);
            });
        };
    });
};

//////////////////////////////////
// Setup controls for sequencer //
//////////////////////////////////

function setupcontrols() {
    var knobwidth = 75;
    var knobheight = knobwidth;
    var controlcolors = ['#ff0000','#ff00ff','#00ff00','#0000ff','#666'];

    /////////////////////////////////
    // X and Y Navigation controls //
    /////////////////////////////////

    // X Coordinate
    var $knob_x = $("#knob_x");
    $knob_x.knob({
        width : knobwidth,
        height : knobwidth,
        fgColor : controlcolors[4],
        inputColor : controlcolors[4],
        lineCap : "round",
        change : function (value) {
            valx = parseInt(value);
        }
    });
    $knob_x.val(valx).trigger("change");

    // Y Coordinate
    var $knob_y = $("#knob_y");
    $knob_y.knob({
        width : knobwidth,
        height : knobwidth,
        fgColor : controlcolors[4],
        inputColor : controlcolors[4],
        lineCap : "round",
        value : valy,
        change : function (value) {
            valy = parseInt(value);
        }
    });
    $knob_y.val(valy).trigger("change");

    ////////////////////////
    // Threshold Controls //
    ////////////////////////

    // Note Threshold
    var $knob_threshold_note = $("#knob_threshold_note");
    $knob_threshold_note.knob({
        width : knobwidth,
        height : knobwidth,
        lineCap : "round",
        fgColor : controlcolors[0],
        inputColor : controlcolors[0],
        change : function (value) {
            intval = parseInt(value)
            thresholds[0] = intval;
        }
    });
    $knob_threshold_note.val(thresholds[0]).trigger("change");

    // Octave Threshold
    var $knob_threshold_octave = $("#knob_threshold_octave");
    $knob_threshold_octave.knob({
        width : knobwidth,
        height : knobwidth,
        lineCap : "round",
        fgColor : controlcolors[1],
        inputColor : controlcolors[1],
        change : function (value) {
            intval = parseInt(value)
            thresholds[1] = intval;
        }
    });
    $knob_threshold_octave.val(thresholds[1]).trigger("change");

    // Accent Threshold
    var $knob_threshold_accent = $("#knob_threshold_accent");
    $knob_threshold_accent.knob({
        width : knobwidth,
        height : knobwidth,
        fgColor : controlcolors[2],
        inputColor : controlcolors[2],
        lineCap : "round",
        change : function (value) {
            thresholds[2] = parseInt(value);
        }
    });
    $knob_threshold_accent.val(thresholds[2]).trigger("change");

    // Slide Threshold
    var $knob_threshold_slide = $("#knob_threshold_slide");
    $knob_threshold_slide.knob({
        width : knobwidth,
        height : knobwidth,
        fgColor : controlcolors[3],
        inputColor : controlcolors[3],
        lineCap : "round",
        change : function (value) {
            thresholds[3] = parseInt(value);
        }
    });
    $knob_threshold_slide.val(thresholds[3]).trigger("change");

    ///////////////////////////////
    // Length and Shift controls //
    ///////////////////////////////

    // Length Control
    var $knob_length = $("#knob_length");
    $knob_length.knob({
        width : knobwidth,
        height : knobwidth,
        fgColor : controlcolors[lnshiftchannel],
        inputColor : controlcolors[lnshiftchannel],
        lineCap : "round",
        change : function (value) {
            channelstepcount[lnshiftchannel][0] = parseInt(value);
        }
    });
    $knob_length.val(channelstepcount[lnshiftchannel][0]).trigger("change");

    // Shift Control
    var $knob_shift = $("#knob_shift");
    $knob_shift.knob({
        width : knobwidth,
        height : knobwidth,
        fgColor : controlcolors[lnshiftchannel],
        inputColor : controlcolors[lnshiftchannel],
        lineCap : "round",
        change : function (value) {
            channelstepcount[lnshiftchannel][1] = parseInt(value);
        }
    });
    $knob_shift.val(channelstepcount[lnshiftchannel][1]).trigger("change");

    // Length | Shift Channel-Select
    $("input[type='radio']").click(function() {
        var radioValue = $("input[name='lnshft-function']:checked").val();
        if(radioValue) {
            // Set channel global variable
            lnshiftchannel = parseInt(radioValue);
            // Update Length Knob color and value
            $knob_length.val(channelstepcount[lnshiftchannel][0]).trigger('change');
            $knob_length.trigger('configure', {"fgColor":controlcolors[lnshiftchannel],"inputColor":controlcolors[lnshiftchannel]});
            // Same for Shift
            $knob_shift.val(channelstepcount[lnshiftchannel][1]).trigger('change');
            $knob_shift.trigger('configure', {"fgColor":controlcolors[lnshiftchannel],"inputColor":controlcolors[lnshiftchannel]});
        }
    });
};
