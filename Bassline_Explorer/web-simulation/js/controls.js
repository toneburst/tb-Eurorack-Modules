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

    ///////////////////////
    // MIDI Channel Menu //
    ///////////////////////

    // Handle menu changes
    $("#selectmidichannel").change(function() {
        midi_channel = parseInt($(this).val());
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

    // Setup menu
    var $scalesmenu = $("#selectscale");
    for(var i = 0; i < mpscales.length; i++) {
        var opt = '<option value="' + i + '"';
        if(i === scaleindex)
            opt += " selected";
        opt += '>' + mpscales[i][0] + '</option>';
        $scalesmenu.append(opt);
    };
    // Handle menu changes
    $scalesmenu.change(function() {
        var valInt = parseInt($scalesmenu.val());
        scale = mpscales[valInt][1];
        scaleindex = valInt;
    });

    ////////////////////
    // Transpose Menu //
    ////////////////////

    // Handle menu changes
    $("#selecttranspose").change(function() {
        transpose = 12 + parseInt($(this).val());
    });

    /////////////////////
    // Auto-Reset Menu //
    /////////////////////

    // Setup menu
    var $autoresetmenu = $("#selectautoreset");
    for(var i = 0; i < resetperiodtable.length; i++) {
        var opt = '<option value="' + i + '"';
        if(i === autoresetindex)
            opt += " selected";
        opt += '>' + resetperiodtable[i][0] + '</option>';
        $autoresetmenu.append(opt);
    };
    // Handle menu changes
    $autoresetmenu.change(function() {
        var valInt = parseInt($(this).val())
        autoresetindex = valInt;
        autoreset = resetperiodtable[autoresetindex][1];
        clock.setautoreset(autoreset);
    });

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
        }
    });

    ///////////////////
    // Tempo Control //
    ///////////////////

    var $temposlider = $("#slider_tempo");
    $temposlider.val(bpm);
    $temposlider.on('change', function() {
        bpm = parseInt($(this).val());
        clock.settempo(bpm);
    });

    ///////////////////
    // Record Button //
    ///////////////////

    // MIDIFile download form Submit button
    var $midixmlformsubmit = $("#midixmlformsubmit");
    // Hide Submit button
    //$midixmlformsubmit.hide();
    // Record button
    var $recordbutton = $("#recordbutton");
    // Set initial record status
    $recordbutton.data('recordstatus', '0');
    // Handle mousedown on Record button
    $recordbutton.mousedown(function() {
        // We're not recording, so arm recorder
        if($recordbutton.data('recordstatus') === "0") {
            // Disable record button until recording has started
            $recordbutton.prop('disabled', true).html("Recording Armed");
            clock.bind("beforebar", function() {
                $recordbutton.prop('disabled', false);
                $recordbutton.html("Recording...");
                $midixmlformsubmit.hide();
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
                // Dump recording into hidden form field
                $("#midixmlformhidden").val(recorder.getmidixml());
                // Submit form (target is iFrame)
                $("#midixmlform").submit();
                recorder = null; // Note sure this method of deleting an object instance works...
            });
            $recordbutton.data('recordstatus', "0");
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
