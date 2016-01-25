/*
 *
 *
 */

function NoteClock(bpm) {
    this.bpm = bpm;
    this.autoreset = null;
    this.clock = new Clock24PPQN(this.bpm);
    this.isplaying = false;
};

// Mix in Microevent object from microevent.js so our Clock object can emit events
MicroEvent.mixin(NoteClock);

NoteClock.prototype.settempo = function(tempo) {
    this.clock.setTempo(tempo);
};

NoteClock.prototype.setautoreset = function(bars) {
    if(bars !== 0)
        this.autoreset = 96 * bars;
    else
        this.autoreset = null;
};

NoteClock.prototype.start = function() {
    var self = this;
    var counter = 0;
    this.clock.init();
    this.clock.play();
    this.isplaying = true;
    this.clock.bind('tick', function(e) {
        self.trigger('tick', 'tick');
        if(counter % 3 == 0) {
            self.trigger('32nd', '32nd');
        };
        if(counter % 6 == 0) {
            self.trigger('16th', '16th');
        };
        if(counter % 12 == 0) {
            self.trigger('8th', '8th');
        };
        if(counter % 24 == 0) {
            self.trigger('quarter', 'quarter');
        };
        if(counter % 48 == 0) {
            self.trigger('half', 'half');
        };
        if(counter % 96 == 0) {
            self.trigger('bar', 'bar');
        };
        counter++;
        // Triggers on tick before new bar
        if(counter % 96 == 0) {
            self.trigger('beforebar', 'bar');
        };
        if(self.autoreset) {
            if(counter % (self.autoreset) == 0) {
                self.trigger('reset', 'reset');
                counter = 0;
            };
        };
    });
};

NoteClock.prototype.stop = function() {
    this.clock.stop();
    this.isplaying = false;
};
