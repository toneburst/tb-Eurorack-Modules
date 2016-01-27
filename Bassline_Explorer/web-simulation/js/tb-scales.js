

function TBScales() {
    // Scales from Mutable Instruments MIDIPal firmware
    // Olivier Gillet
    // NAMES MAY BE WRONG!
    this.mpscales = Array();
    this.mpscales[0]  = {name:"Chromatic", notes:[0,1,2,3,4,5,6,7,8,9,10,11]};
    this.mpscales[1]  = {name:"Ionian",notes:[0,0,2,2,4,5,5,7,7,9,9,11]};
    this.mpscales[2]  = {name:"Dorian",notes:[0,0,2,3,3,5,5,7,7,10,10]};
    this.mpscales[3]  = {name:"Phrygian",notes:[0,1,1,3,3,5,5,7,8,8,10,10]};
    this.mpscales[4]  = {name:"Lydian",notes:[0,0,2,2,4,4,6,7,7,9,11]};
    this.mpscales[5]  = {name:"Mixolydian",notes:[0,0,2,2,4,5,5,7,7,9,10,10]};
    this.mpscales[6]  = {name:"Aeolian Minor",notes:[0,0,2,3,3,5,5,7,8,8,10,10]};
    this.mpscales[7]  = {name:"Locrian",notes:[0,1,1,3,3,5,6,6,8,8,10,10]};
    this.mpscales[8]  = {name:"Blues Major",notes:[0,0,3,3,4,4,7,7,7,9,10,10]};
    this.mpscales[9]  = {name:"Blues Minor",notes:[0,0,3,3,3,5,6,7,7,10,10,10]};
    this.mpscales[10] = {name:"Pentatonic Major",notes:[0,0,2,2,4,4,7,7,7,9,9,9]};
    this.mpscales[11] = {name:"Pentatonic Minor",notes:[0,0,3,3,3,5,5,7,7,10,10,10]};
    this.mpscales[12] = {name:"Raga Bhiarav",notes:[0,1,1,4,4,5,5,7,8,8,11,11]};
    this.mpscales[13] = {name:"Raga Shri",notes:[0,1,1,4,4,4,6,7,8,8,11,11]};
    this.mpscales[14] = {name:"Raga Rupatavi",notes:[0,1,1,3,3,5,5,7,7,10,10,11]};
    this.mpscales[15] = {name:"Raga Todi",notes:[0,1,1,3,3,6,6,7,8,8,11,11]};
    this.mpscales[16] = {name:"Raga Kaafi",notes:[0,0,2,2,4,5,5,5,9,9,10,11]};
    this.mpscales[17] = {name:"Raga Meg",notes:[0,0,2,2,5,5,5,7,7,9,9,9]};
    this.mpscales[18] = {name:"Raga Malkauns",notes:[0,0,3,3,3,5,5,8,8,8,10,10]};
    this.mpscales[19] = {name:"Raga Deepak",notes:[0,0,3,3,4,4,6,6,8,8,10,10]};
    this.mpscales[20] = {name:"Folkish",notes:[0,1,1,3,4,5,5,7,8,8,10,10]};
    this.mpscales[21] = {name:"Japanese",notes:[0,1,1,1,5,5,5,7,8,8,8,8]};
    this.mpscales[22] = {name:"Gamelan",notes:[0,1,1,3,3,3,7,7,8,8,8,8]};
    this.mpscales[23] = {name:"Whole Tones",notes:[0,0,2,2,4,4,6,6,8,8,10,10]};

    // Scale Index
    this.scaleindex = 0; // Chromatic
    this.scale = this.mpscales[this.scaleindex]["notes"];

    if (!window.jQuery) {
        return "Error: jQuery required!"
    };
};

///////////////////////////////////////////////////////////
// Dump scale indices and names to the JavaScrpt console //
///////////////////////////////////////////////////////////

TBScales.prototype.logscales = function() {
    for(var i = 0; i < this.mpscales.length; i++) {
        console.log(i + ": " + this.mpscales[i]["name"]);
    };
};

///////////////
// Set scale //
///////////////

TBScales.prototype.setscale = function(index) {
    this.scaleindex = Math.min(this.mpscales.length - 1, index);
    this.scale = this.mpscales[this.scaleindex]["notes"];
};

////////////////////////////////////////
// Add select control to choose scale //
////////////////////////////////////////

TBScales.prototype.addscaleselect = function(container) {
    if(!container)
        return "Error: You must specify a container element when calling this function";

    var notescaleselect_str = '<p>Select Scale</p><p><select id="selectnotescale"></select></p>';
    $(container).append(notescaleselect_str);
    var $notescaleselect = $("#selectnotescale");
    var self = this;
    for(var i = 0; i < this.mpscales.length; i++) {
        $notescaleselect.append($('<option>', {
            value: i,
            text : self.mpscales[i]["name"]
        }));
    };
    $notescaleselect.change(function() {
        self.setscale(parseInt($(this).val()));
    });
};

////////////////////////////////////////////////
// Apply scale to MIDI note and return result //
////////////////////////////////////////////////

TBScales.prototype.applyscale = function(note) {
    return this.scale[note % 12];
};