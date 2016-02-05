/*
 *
 *
 */

function TBMWClockdivider() {
    this.autoreset = null;
    this.counting = 0;  // Counts continue until reset
};

// Mix in Microevent object from microevent.js so our Clock object can emit events
MicroEvent.mixin(TBMWClockdivider);

TBMWClockdivider.prototype.init = function(opts) {
    if(opts) {
        if(opts.autoreset)
            this.setautoreset(opts.autoreset);
        if(opts.counting && opts.counting === 'bar')
            this.counting = 1;
        else if(opts.counting && opts.counting === 'continuous')
            this.counting = 0;
    };
    this.reset();
};

////////////////////
// Reset Counters //
////////////////////

TBMWClockdivider.prototype.reset = function() {

    this.tickcounter = 0;   // Ticks (1/24)
    this.counter0 = 0;      // 1/32
    this.counter1 = 0;      // 1/16
    this.counter2 = 0;      // 1/8
    this.counter3 = 0;      // 1/4
    this.counter4 = 0;      // 1/2
    this.counter5 = 0;      // Bar
    return this;
};

////////////////////
// Set Auto-Reset //
////////////////////

TBMWClockdivider.prototype.setautoreset = function(bars) {
    if(bars !== 0)
        this.autoreset = 96 * bars;
    else
        this.autoreset = null;
    return this;
};

/////////////////////
// Update Counters //
/////////////////////

TBMWClockdivider.prototype.updatecounter = function(count, reset) {
    if(this.counting === 0) {
        return count + 1;
    } else {
        return (count === reset) ? 0 : count + 1;
    };
};

////////////////
// Tick Clock //
////////////////

TBMWClockdivider.prototype.tick = function() {
    var self = this;
    self.trigger('tick', this.tickcounter);
    if(this.tickcounter % 3 == 0) {
        self.trigger('1/32', self.counter0);
        self.counter0 = self.updatecounter(self.counter0, 31);
    };
    if(this.tickcounter % 6 == 0) {
        self.trigger('1/16', self.counter1);
        self.counter1 = self.updatecounter(self.counter1, 15);
    };
    if(this.tickcounter % 12 == 0) {
        self.trigger('1/8', self.counter2);
        self.counter2 = self.updatecounter(self.counter2, 7);
    };
    if(this.tickcounter % 24 == 0) {
        self.trigger('1/4', self.counter3);
        self.counter3 = self.updatecounter(self.counter3, 3);
    };
    if(this.tickcounter % 48 == 0) {
        self.trigger('1/2', self.counter4);
        self.counter4 = self.updatecounter(self.counter4, 1);
    };
    if(this.tickcounter % 96 == 0) {
        self.trigger('bar', self.counter5);
        self.counter5++;
    };
    this.tickcounter++;
    // Triggers on tick before new bar
    if(this.tickcounter % 96 == 0) {
        self.trigger('beforebar', 'bar');
    };
    if(self.autoreset) {
        if(this.tickcounter % (self.autoreset) == 0) {
            self.trigger('reset', 'reset');
            self.reset();
        };
    };
    return this;
};
