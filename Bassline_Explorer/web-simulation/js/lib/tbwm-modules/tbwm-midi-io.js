/*
 * toneburst 2016
 * Dependencies:
 * WebMIDIAPIShim
 */

function TBMWMIDIio() {
    this.uicontainer        = null;
    this.containerclass     = "midiui";
    this.idprefix           = "tbwm-io";
    this.outputselectid     = this.idprefix + "-" + "outputdevice";
    this.channelselectid    = this.idprefix + "-" + "channel";
    this.testoutputbutton   = this.idprefix + "-" + "testoutput";
    this.havemidi           = false;
    this.havemidiin         = false;
    this.havemidiout        = false;
    this.havecontainer      = false;
    this.midiaccess         = {};
    this.outputs            = {};
    this.inputs             = {};
    this.midiout            = {};
    this.midiin             = {};
    this.midichannel        = 1;
};

// Mix in Microevent object from microevent.js so our Clock object can emit events
MicroEvent.mixin(TBMWMIDIio);

//////////////////////////////
//////////////////////////////
// DOM-Manipulation Methods //
//////////////////////////////
//////////////////////////////

//////////////////////////////////////////////
// UI Container DOM element not found error //
//////////////////////////////////////////////

TBMWMIDIio.prototype.errordomelement = function() {
    var error = "Error: Container element not found. You need to specify ID of an existing element (with or without leading '#') when initialising this instance or calling this method";
    console.log(error);
    return error;
};

////////////////////////////////
// Create <label> DOM element //
////////////////////////////////

TBMWMIDIio.prototype.createlabel = function(labelfor, labeltext) {
    var label = document.createElement("label");
    label.setAttribute("for", labelfor);
    label.innerHTML = labeltext;
    return label;
};

//////////////////
//////////////////
// MIDI Methods //
//////////////////
//////////////////

///////////////////
// No MIDI error //
///////////////////

TBMWMIDIio.prototype.errornomidi = function(e) {
    this.havemidi = false;
    //var error = "Error: No access to MIDI devices: browser does not support WebMIDI API, please use the WebMIDIAPIShim together with the Jazz plugin.";
    var error = e;
    console.log(error);
};

/////////////////////////////////
// No MIDI output device error //
/////////////////////////////////

TBMWMIDIio.prototype.errornooutputdevice = function() {
    this.havemidiout = false;
    var error = "Error: No MIDI output device is accessible.";
    console.log(error);
};

////////////////////////////////
// No MIDI input device error //
////////////////////////////////

TBMWMIDIio.prototype.errornoinputdevice = function() {
    this.havemidi = false;
    var error = "Error: No MIDI input device is accessible.";
    console.log(error);
};

///////////////////////////////////////
// Calculate MIDI channel message /////
// based on message type and channel //
///////////////////////////////////////

TBMWMIDIio.prototype.channelmessage = function(messagetype, ch) {
    // List of channel messages
    // Extracted from WebMidi library
    var _channelmessages = {
        "noteoff": 0x8,           // 8
        "noteon": 0x9,            // 9
        "controlchange": 0xB,     // 11
        "channelmode": 0xB,       // 11
        "programchange": 0xC,     // 12
        "channelaftertouch": 0xD, // 13
        "pitchbend": 0xE          // 14
    };
    if(!_channelmessages[messagetype]) {
        console.log("Error: MIDI Channel message not found");
    } else {
        return (_channelmessages[messagetype] << 4) + (ch - 1);
    };
};

TBMWMIDIio.prototype.systemmessage = function(messagetype) {
    var _systemmessages = {
        "sysex": 0xF0,            // 240
        "timecode": 0xF1,         // 241
        "songposition": 0xF2,     // 242
        "songselect": 0xF3,       // 243
        "tuningrequest": 0xF6,    // 246
        "sysexend": 0xF7,         // 247 (never actually received - simply ends a sysex)
        "clock": 0xF8,            // 248
        "start": 0xFA,            // 250
        "continue": 0xFB,         // 251
        "stop": 0xFC,             // 252
        "activesensing": 0xFE,    // 254
        "reset": 0xFF,            // 255
    };
    if(!_systemmessages[messagetype]) {
        console.log("Error: MIDI System message not found");
    } else {
        return (_systemmessages[messagetype] << 4) + (ch - 1);
    };
};

///////////////
// Timestamp //
///////////////

TBMWMIDIio.prototype.time = function(delay) {
    var now = window.performance.now();
    if(delay)
        return now + delay;
    else
        return now;
};

///////////////////
// Init function //
///////////////////

TBMWMIDIio.prototype.init = function(uicontainer) {
    // Test container DOM element exists
    if(uicontainer) {
        this.uicontainer = document.getElementById(uicontainer.replace("#", ""));
        if(!this.uicontainer)
            return this.errordomelement();
    } else {
        return this.errordomelement();
    };
    // Container element found, and valid DOM element, so set property
    this.havecontainer = true;
    // Add class to container
    this.uicontainer.classList.add(this.containerclass);

    var self = this;
    navigator.requestMIDIAccess().then(onsuccesscallback, onerrorcallback);
    function onsuccesscallback(access) {
        // Set bool for MIDI access
        self.havemidi = true;

        // MIDI access object
        self.midiaccess = access;

        /*
        // Get input ports
        self.inputs = self.midiaccess.inputs;

        // Check MIDI input ports found
        if(self.inputs.size > 0) {
            // Get and open first MIDI input port
            self.midiin = self.inputs.values().next().value;
            self.midiin.open();
            self.havemidiin = true;
        } else {
            self.errornoinputdevice();
            self.havemidiin = false;
        };*/

        // Get output ports
        self.outputs = self.midiaccess.outputs;

        // Check MIDI output ports found
        if(self.outputs.size > 0) {
            // Get and open first MIDI output port
            self.midiout = self.outputs.values().next().value;
            self.midiout.open();
            self.havemidiout = true;
        } else {
            // Send error
            self.errornooutputdevice();
            // Set switch false
            self.havemidiout = false;
        };

        // Notify MIDI system ready
        console.log("MIDI system success!");
        self.trigger("midistatus", "success");
    };

    function onerrorcallback(err) {
        self.havemidi       = false;
        self.havemidiin     = false;
        self.havemidiout    = false;
        console.log( "Uh-oh! Something went wrong! Error code: " + err.code );
        self.trigger("midistatus", "fail");
    };
};

////////////////////////////
// Set MIDI Output device //
////////////////////////////

TBMWMIDIio.prototype.setoutputdevice = function(deviceid) {
    if(this.havemidiout) {
        // Close previously-open port
        this.midiout.close();
        // Get and open new output port
        this.midiout = this.outputs.get(deviceid);
        this.midiout.open();
    } else {
        this.errornooutputdevice();
        return;
    };
};

///////////////////////////
// Set MIDI Input device //
///////////////////////////

/*TBMWMIDIio.prototype.setinputdevice = function(deviceid) {
    if(this.havemidiout) {
        // Close previously-open port
        this.midiin.close();
        // Get and open new output port
        this.midiin = this.outputs.get(deviceid);
        this.midiin.open();
    } else {
        this.errornoinputdevice();
        return;
    };
};*/

////////////////////////////////////////////////////////
// Append Output device menu to container DOM element //
////////////////////////////////////////////////////////

TBMWMIDIio.prototype.addoutputselect = function() {
    if(this.havemidi && this.havemidiout) {
        // Create <label> element
        var label = this.createlabel(this.outputselectid, "Select MIDI Output Device");
        // Create <select> element
        var sel = document.createElement("select");
        sel.setAttribute("id", this.outputselectid);
        // Add options
        this.outputs.forEach(function(port) {
            var opt = document.createElement("option");
            opt.text = port.name;
            opt.value = port.id;
            sel.add(opt);
        });
        // Append label and select to container DOM element
        this.uicontainer.appendChild(label);
        this.uicontainer.appendChild(sel);
        // Listen for changes
        var self = this;
        sel.addEventListener('change', function(){
            // Set output device
            self.setoutputdevice(this.value);
        });
    } else {
        this.errornooutputdevice();
    };
};

//////////////////////
// Set MIDI Channel //
//////////////////////

TBMWMIDIio.prototype.setoutmidichannel = function(channel) {
    this.midichannel = parseInt(channel);
};

//////////////////////////////////
// Add MIDI Channel select menu //
//////////////////////////////////

TBMWMIDIio.prototype.addoutchannelselect = function() {
    if(this.havemidi && this.havemidiout) {
        // Create <label> element
        var label = this.createlabel(this.channelselectid, "Select MIDI Channel");
        // Create <select> element
        var sel = document.createElement("select");
        sel.setAttribute("id", this.channelselectid);
        // Add options
        for(var i = 1; i < 17; i++) {
            var opt = document.createElement("option");
            opt.text = i;
            opt.value = i;
            sel.add(opt);
        };
        // Append label and select to container DOM element
        this.uicontainer.appendChild(label);
        this.uicontainer.appendChild(sel);
        // Listen for changes
        var self = this;
        sel.addEventListener('change', function(){
            // Set output device
            self.setoutmidichannel(parseInt(this.value));
        });
    } else {
        this.errornooutputdevice();
        return;
    };
};

/////////////////////////////////
// Add MIDI Output test button //
/////////////////////////////////

TBMWMIDIio.prototype.addtestbutton = function() {
    if(this.havemidi && this.havemidiout) {
        // Create <button> element
        var button = document.createElement("button");
        button.setAttribute("id", this.testoutputbutton);
        button.innerHTML = 'Test MIDI Out';
        // Append button to container DOM element
        this.uicontainer.appendChild(button);
        // Listen for changes
        var self = this;
        button.addEventListener("mousedown", function() {
            // Send note-on on default MIDI channel
            self.noteon(null, 64, 127, null);
        }, false);
        button.addEventListener("mouseup", function() {
            // Send note-off on default MIDI channel
            self.noteoff(null, 64, 127, null);
        }, false);
    } else {
        this.errornooutputdevice();
        return;
    };
};

///////////////////////
// Send MIDI note-on //
///////////////////////

TBMWMIDIio.prototype.noteon = function(channel, note, velocity, delay) {
    if(this.havemidi && this.havemidiout) {
        var ch = (channel) ? channel : this.midichannel;
        var time = (delay) ? this.time(delay) : this.time();
        this.midiout.send([this.channelmessage("noteon", ch), note, velocity], time);
    } else {
        this.errornooutputdevice();
        return;
    };
};

////////////////////////
// Send MIDI note-off //
////////////////////////

TBMWMIDIio.prototype.noteoff = function(channel, note, velocity, delay) {
    if(this.havemidi && this.havemidiout) {
        var ch = (channel) ? channel : this.midichannel;
        var time = (delay) ? this.time(delay) : this.time();
        this.midiout.send([this.channelmessage("noteoff", ch), note, velocity], time);
    } else {
        this.errornooutputdevice();
        return;
    };
};

//////////////////////////
// Send MIDI clock tick //
//////////////////////////

TBMWMIDIio.prototype.clocktick = function() {
    self.midiout.send([this.systemmessage("clock")], this.time());
};

//////////////////////////
// Send MIDI clock stop //
//////////////////////////

TBMWMIDIio.prototype.clockstop= function() {
    self.midiout.send([this.systemmessage("stop")], this.time());
};

//////////////////////////////
// Send MIDI clock continue //
//////////////////////////////

TBMWMIDIio.prototype.clockcontinue = function() {
    self.midiout.send([this.systemmessage("continue")], this.time());
};
