/*
 *
 *
 *
 */

// https://github.com/aterrien/jQuery-Knob

function setupcontrols() {
    var controlcolors = ['#ff0000','#ff00ff','#00ff00','#0000ff','#666'];

    /////////////////
    // Scales Menu //
    /////////////////

    $scalesmenu = $("#selectscale");
    for(var i = 0; i < mpscales.length; i++) {
        $scalesmenu.append($('<option>', {
            value: i,
            text : mpscales[i][0]
        }));
    };

    $scalesmenu.change(function() {
        scale = mpscales[parseInt($scalesmenu.val())][1];
    });

    /////////////////
    // Play Button //
    /////////////////

    $("button#playbutton").click(function() {
        if(clock.isPlaying == false) {
            $(this).text("Stop sequencer");
            clock.play();
        } else {
            $(this).text("Start sequencer");
            clock.stop();
        }
    });

    /////////////////////////////////
    // X and Y Navigation controls //
    /////////////////////////////////

    $("#knob_x").knob({
        width : 100,
        height : 100,
        fgColor : controlcolors[4],
        inputColor : controlcolors[4],
        lineCap : "round",
        change : function (value) {
            valx = parseInt(value);
        }
    });

    $("#knob_y").knob({
        width : 100,
        height : 100,
        fgColor : controlcolors[4],
        inputColor : controlcolors[4],
        lineCap : "round",
        change : function (value) {
            valy = parseInt(value);
        }
    });

    ///////////////////////////////
    // Length and Shift controls //
    ///////////////////////////////

    $("#length").knob({
        width : 100,
        height : 100,
        fgColor : controlcolors[lnshiftchannel],
        inputColor : controlcolors[lnshiftchannel],
        lineCap : "round",
        change : function (value) {
            channelstepcount[lnshiftchannel][0] = parseInt(value);
        }
    });

    $("#shift").knob({
        width : 100,
        height : 100,
        fgColor : controlcolors[lnshiftchannel],
        inputColor : controlcolors[lnshiftchannel],
        lineCap : "round",
        change : function (value) {
            channelstepcount[lnshiftchannel][1] = parseInt(value);
        }
    });

    $("input[type='radio']").click(function() {
        var radioValue = $("input[name='lnshft-function']:checked").val();
        if(radioValue) {
            lnshiftchannel = parseInt(radioValue);

            $('#length').val(channelstepcount[lnshiftchannel][0]).trigger('change')
            $('#length').trigger('configure', {"fgColor":controlcolors[lnshiftchannel],"inputColor":controlcolors[lnshiftchannel]});

            $('#shift').val(channelstepcount[lnshiftchannel][1]).trigger('change');
            $('#shift').trigger('configure', {"fgColor":controlcolors[lnshiftchannel],"inputColor":controlcolors[lnshiftchannel]});
        }
    });

    ////////////////////////
    // Threshold Controls //
    ////////////////////////

    $("#knob_threshold_note").knob({
        width : 100,
        height : 100,
        lineCap : "round",
        fgColor : controlcolors[0],
        inputColor : controlcolors[0],
        change : function (value) {
            intval = parseInt(value)
            thresholds[0] = intval;
        }
    });

    $("#knob_threshold_octave").knob({
        width : 100,
        height : 100,
        lineCap : "round",
        fgColor : controlcolors[1],
        inputColor : controlcolors[1],
        change : function (value) {
            intval = parseInt(value)
            thresholds[1] = intval;
        }
    });

    $("#knob_threshold_accent").knob({
        width : 100,
        height : 100,
        fgColor : controlcolors[2],
        inputColor : controlcolors[2],
        lineCap : "round",
        change : function (value) {
            thresholds[2] = parseInt(value);
        }
    });

    $("#knob_threshold_slide").knob({
        width : 100,
        height : 100,
        fgColor : controlcolors[3],
        inputColor : controlcolors[3],
        lineCap : "round",
        change : function (value) {
            thresholds[3] = parseInt(value);
        }
    });
};
