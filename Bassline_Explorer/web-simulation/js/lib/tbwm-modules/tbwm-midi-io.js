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

//////////////////////
//////////////////////
// Cookie Functions //
//////////////////////
//////////////////////

TBMWMIDIio.prototype.setcookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

TBMWMIDIio.prototype.getcookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    };
    return "";
};

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

////////////////////////////
// Set MIDI Output device //
////////////////////////////

TBMWMIDIio.prototype.setoutputdevice = function(deviceid) {
    if(this.havemidiout) {
        // Loop through available ports, trying to find port by id or name
        var foundport = null;
        this.outputs.forEach(function(item) {
            if(item.id === deviceid || item.name === deviceid) {
                // Set found port to current port (if not already set)
                if(!foundport)
                    foundport = item;
            };
        });
        // Port found
        if(foundport) {
            // Close previously-open port
            this.midiout.close();
            // Set and open new port
            this.midiout = foundport;
            this.midiout.open();
        } else {
            // Port not found
            console.log("Error: MIDI output port " + deviceid + " not available");
        };
    } else {
        this.errornooutputdevice();
        return;
    };
};

////////////////////////////////////////////////////////
// Append Output device menu to container DOM element //
////////////////////////////////////////////////////////

TBMWMIDIio.prototype.addoutputselect = function(savetocookie) {
    if(this.havemidi && this.havemidiout) {
        // If setcookie option set, attempt to read cookie
        var savedoutputportname = null;
        if(savetocookie === true) {
            savedoutputportname = this.getcookie("midioutportname");
            if(savedoutputportname)
                this.setoutputdevice(savedoutputportname);
        };

        // Create <label> element
        var label = this.createlabel(this.outputselectid, "Select MIDI Output Device");
        // Create <select> element
        var sel = document.createElement("select");
        sel.setAttribute("id", this.outputselectid);
        // Add options
        this.outputs.forEach(function(port) {
            var opt = document.createElement("option");
            opt.text = port.name;
            // Try and get previous port from cookie if option set
            if(savedoutputportname && savedoutputportname === port.name) {
                opt.setAttribute("selected", "selected");
            };
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
            // Set cookie if option set
            if(savetocookie === true)
                self.setcookie("midioutportname", sel.options[sel.selectedIndex].text, 365);
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

TBMWMIDIio.prototype.addoutchannelselect = function(savetocookie) {
    if(this.havemidi && this.havemidiout) {
        // If setcookie option set, attempt to read cookie
        var savedoutputchannel = null;
        if(savetocookie === true) {
            savedoutputchannel = this.getcookie("midioutchannel");
            if(savedoutputchannel) {
                this.setoutmidichannel(savedoutputchannel);
            };
        };
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
            // Try and get previous port from cookie if option set
            if(savedoutputchannel && parseInt(savedoutputchannel)  === i) {
                opt.setAttribute("selected", "selected");
            };
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
            // Set cookie if option set
            if(savetocookie === true)
                self.setcookie("midioutchannel", sel.options[sel.selectedIndex].text, 365);
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
            self.send_noteon(null, 64, 127, null);
        }, false);
        button.addEventListener("mouseup", function() {
            // Send note-off on default MIDI channel
            self.send_noteoff(null, 64, 127, null);
        }, false);
    } else {
        this.errornooutputdevice();
        return;
    };
};

///////////////////////
// Send MIDI note-on //
///////////////////////

TBMWMIDIio.prototype.send_noteon = function(channel, note, velocity, delay) {
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

TBMWMIDIio.prototype.send_noteoff = function(channel, note, velocity, delay) {
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
// Send MIDI controller //
//////////////////////////

TBMWMIDIio.prototype.send_controller = function(channel, cc, value, delay) {
    if(this.havemidi && this.havemidiout) {
        var ch = (channel) ? channel : this.midichannel;
        var time = (delay) ? this.time(delay) : this.time();
        self.midiout.send([this.channelmessage("controller", ch), cc, value], time);
    } else {
        this.errornooutputdevice();
        return;
    };
};

//////////////////////////
// Send MIDI clock tick //
//////////////////////////

TBMWMIDIio.prototype.send_clocktick = function() {
    if(this.havemidi && this.havemidiout) {
        self.midiout.send([this.systemmessage("clock")], this.time());
    } else {
        this.errornooutputdevice();
        return;
    };
};

//////////////////////////
// Send MIDI clock stop //
//////////////////////////

TBMWMIDIio.prototype.send_clockstop= function() {
    if(this.havemidi && this.havemidiout) {
        self.midiout.send([this.systemmessage("stop")], this.time());
    } else {
        this.errornooutputdevice();
        return;
    };
};

//////////////////////////////
// Send MIDI clock continue //
//////////////////////////////

TBMWMIDIio.prototype.send_clockcontinue = function() {
    if(this.havemidi && this.havemidiout) {
        self.midiout.send([this.systemmessage("continue")], this.time());
    } else {
        this.errornooutputdevice();
        return;
    };
};
