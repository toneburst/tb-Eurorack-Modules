/*
*
*
*
*/

function scheduler() {
    var noteoffcounter16ths = 0;
    clock.setautoreset(autoreset);
    clock.start();

    // Note-Off 16ths
    clock.bind('tick', function() {
        if(noteoffcounter16ths == 3) {
            getStepVals();
            if(recorder)
                recorder.updateticks();
        };
        noteoffcounter16ths++;
    });

    // Note-On 16ths
    clock.bind('16th', function() {
        playStep();
        if(recorder)
            recorder.updateticks();
        masterstepcounter++;
        noteoffcounter16ths = 0;
    });

    // Reset if set
    clock.bind('reset', function() {
        masterstepcounter = 0;
    });
};
