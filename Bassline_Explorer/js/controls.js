/*
 *
 *
 *
 */

// https://github.com/aterrien/jQuery-Knob

function setupcontrols() {

    $("#knob_x").knob({
        width : 100,
        height : 100,
        lineCap : "round",
        change : function (value) {
            valx = parseInt(value);
        }
    });

    $("#knob_y").knob({
        width : 100,
        height : 100,
        lineCap : "round",
        change : function (value) {
            valy = parseInt(value);
        }
    });

    $("#length").knob({
        width : 100,
        height : 100,
        lineCap : "round",
        change : function (value) {
            //valx = parseInt(value);
        }
    });

    $("#shift").knob({
        width : 100,
        height : 100,
        lineCap : "round",
        change : function (value) {
            //valy = parseInt(value);
        }
    });

    $("#knob_threshold_note").knob({
        width : 50,
        height : 50,
        lineCap : "round",
        change : function (value) {
            intval = parseInt(value)
            thresholds[0] = intval;
            thresholds[1] = intval;
        }
    });

    $("#knob_threshold_accent").knob({
        width : 50,
        height : 50,
        lineCap : "round",
        change : function (value) {
            thresholds[2] = parseInt(value);
        }
    });

    $("#knob_threshold_slide").knob({
        width : 50,
        height : 50,
        lineCap : "round",
        change : function (value) {
            thresholds[3] = parseInt(value);
        }
    });
};
