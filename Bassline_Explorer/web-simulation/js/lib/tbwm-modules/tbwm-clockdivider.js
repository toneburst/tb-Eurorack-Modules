/*
 *
 *
 */

function TBMWClockdivider() {
    this.autoreset = null;
    this.counter = 0;
};

// Mix in Microevent object from microevent.js so our Clock object can emit events
MicroEvent.mixin(TBMWClockdivider);

///////////////
// Set Reset //
///////////////

TBMWClockdivider.prototype.reset = function() {
    this.counter = 0;
};

////////////////////
// Set Auto-Reset //
////////////////////

TBMWClockdivider.prototype.setautoreset = function(bars) {
    if(bars !== 0)
        this.autoreset = 96 * bars;
    else
        this.autoreset = null;
};

/////////////////
// Start Clock //
/////////////////

TBMWClockdivider.prototype.tick = function() {
    var self = this;
    self.trigger('tick', 'tick');
    if(this.counter % 3 == 0) {
        self.trigger('32nd', '32nd');
    };
    if(this.counter % 6 == 0) {
        self.trigger('16th', '16th');
    };
    if(this.counter % 12 == 0) {
        self.trigger('8th', '8th');
    };
    if(this.counter % 24 == 0) {
        self.trigger('quarter', 'quarter');
    };
    if(this.counter % 48 == 0) {
        self.trigger('half', 'half');
    };
    if(this.counter % 96 == 0) {
        self.trigger('bar', 'bar');
    };
    this.counter++;
    // Triggers on tick before new bar
    if(this.counter % 96 == 0) {
        self.trigger('beforebar', 'bar');
    };
    if(self.autoreset) {
        if(this.counter % (self.autoreset) == 0) {
            self.trigger('reset', 'reset');
            this.counter = 0;
        };
    };
};
