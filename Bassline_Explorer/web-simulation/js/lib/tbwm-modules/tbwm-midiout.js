/*
 * toneburst 2016
 *
 * Dependencies:
 * WebMIDIAPIShim
 * Microevent.js
 */

function TBMWMIDIOut(initopts) {

    // Check instance ID passes when instance created
    // (Required if multiple instances created)
    this.instanceid = "0";
    if(initopts === undefined || initopts.instanceid === undefined)
        console.log("WARNING: You should specify a unique instance ID when instantiating the TBWMMIDIOut object.");
    else
        this.instanceid = initopts.instanceid;

    // Save settings to cookie true/false
    this.savesettingstocookie = false;
    if(initopts !== undefined && initopts.savesettings === true)
        this.savesettingstocookie = true;

    // IDs for DOM elements
    this.idprefix = "tbwm-ui";

    this.outputselectid = this.idprefix + "-" + "outputdevice";
    if(this.instanceid)
        this.outputselectid += "-" + this.instanceid;

    this.channelselectid = this.idprefix + "-" + "channel";
    if(this.instanceid)
        this.channelselectid += "-" + this.instanceid;

    this.testoutputbuttonid = this.idprefix + "-" + "testoutput";
    if(this.instanceid)
        this.testoutputbuttonid += "-" + this.instanceid;

    this.containerclass = this.idprefix;

    // MIDI system status variables
    this.havemidi           = false;
    this.havemidiout        = false;
    this.midiaccess         = {};
    this.outputs            = {};
    this.testnotenum        = 64;

    this.outputsettings = {
        device : null,
        channel : 1
    };
    this.cookiename = "outputprefs";

    // Return object instance for chaining
    return this;
};

// Mix in Microevent object from microevent.js so our object can emit events
MicroEvent.mixin(TBMWMIDIOut);

//////////////////////
//////////////////////
// Cookie Functions //
//////////////////////
//////////////////////

// Set cookie (don't call directly)
TBMWMIDIOut.prototype.setcookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

// Get cookie (don't call directly)
TBMWMIDIOut.prototype.getcookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0)
            return c.substring(name.length, c.length);
    };
    return null;
};

// Delete cookie (don't call directly)
TBMWMIDIOut.prototype.deletecookie = function(cname) {
    var expires = "Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = name + "=null; " + expires;
};

// Save output settings to cookie if init option set
TBMWMIDIOut.prototype.savesettings = function() {
    if(this.savesettingstocookie) {
        this.setcookie(this.cookiename, JSON.stringify(this.outputsettings), 365);
    };
};

// Get output settings from cookie, and update output settings object
// Won't update previously-set settings, so only to be called at init by instance itself
TBMWMIDIOut.prototype.getsavedsettings = function() {
    if(this.savesettings) {
        var fromcookie = this.getcookie(this.cookiename);
        if(fromcookie) {
            var savedsettings = JSON.parse(this.getcookie(this.cookiename));
            if(savedsettings !== null) {
                if(savedsettings.device)
                    this.outputsettings.device = savedsettings.device;
                if(savedsettings.channel)
                    this.outputsettings.channel = savedsettings.channel;
            };
        };
    };
};

// Delete saved settings cookie
TBMWMIDIOut.prototype.deletesavedsettings = function() {
    this.deletecookie(this.cookiename);
};

//////////////////////////////
//////////////////////////////
// DOM-Manipulation Methods //
//////////////////////////////
//////////////////////////////

TBMWMIDIOut.prototype.checkdomelement = function(elementid) {
    // Check element ID passed
    if(elementid) {
        // Test container DOM element exists
        var domelement = document.getElementById(elementid.replace("#", ""));
        if(!domelement) {
            this.errordomelement(elementid);
            return null;
        } else {
            return domelement;
        };
    } else {
        this.errordomelement();
        return null;
    };
};

//////////////////////////////////////////////
// UI Container DOM element not found error //
//////////////////////////////////////////////

TBMWMIDIOut.prototype.errordomelement = function(elementid) {
    var eid = (elementid) ? "'" + elementid + "'" : "";
    var error = "Error: Container element " + eid + " not found. You need to specify ID of an existing element (with or without leading '#') when calling this method";
    console.log(error);
    return error;
};

//////////////////
//////////////////
// MIDI Methods //
//////////////////
//////////////////

///////////////////
// No MIDI error //
///////////////////

TBMWMIDIOut.prototype.errornomidi = function(e) {
    this.havemidi = false;
    //var error = "Error: No access to MIDI devices: browser does not support WebMIDI API, please use the WebMIDIAPIShim together with the Jazz plugin.";
    var error = e;
    console.log(error);
};

/////////////////////////////////
// No MIDI output device error //
/////////////////////////////////

TBMWMIDIOut.prototype.errornooutputdevice = function() {
    this.havemidiout = false;
    var error = "Error: No MIDI output device is accessible.";
    console.log(error);
};

///////////////////////////////////////
// Calculate MIDI channel message /////
// based on message type and channel //
///////////////////////////////////////

TBMWMIDIOut.prototype.channelmessage = function(messagetype, ch) {
    // List of channel messages
    // Extracted from WebMidi library
    var _channelmessages = {
        "noteoff": 0x8,           // 8
        "noteon": 0x9,            // 9
        "controlchange": 0xB,     // 11
        "channelmode": 0xB,       // 11
        "programchange": 0xC,     // 12
        "channelaftertouch": 0xD, // 13
        "pitchbend": 0xE,         // 14
        "allnotesoff": 0x7B       // 123
    };
    if(!_channelmessages[messagetype]) {
        console.log("Error: MIDI Channel message not found");
    } else {
        return (_channelmessages[messagetype] << 4) + (ch - 1);
    };
};

TBMWMIDIOut.prototype.systemmessage = function(messagetype) {
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

TBMWMIDIOut.prototype.time = function(delay) {
    var now = window.performance.now();
    if(delay)
        return now + delay;
    else
        return now;
};

///////////////////
// Init function //
///////////////////

TBMWMIDIOut.prototype.init = function() {
    // Request MIDI access
    var self = this;
    navigator.requestMIDIAccess().then(onsuccesscallback, onerrorcallback);
    function onsuccesscallback(access) {
        // Set bool for MIDI access
        self.havemidi = true;

        // MIDI access object
        self.midiaccess = access;

        // Get output ports
        self.outputs = self.midiaccess.outputs;

        // Check MIDI output ports found
        if(self.outputs.size > 0) {

            // Get and open first MIDI output port
            self.midiout = self.outputs.values().next().value;
            self.outputsettings.device = self.midiout["id"];
            self.midiout.open();
            self.havemidiout = true;

            // Get and apply saved settings
            self.getsavedsettings();
            self.setoutputdevice(self.outputsettings.device);
            self.setoutmidichannel(self.outputsettings.channel);

        } else {
            // Send error
            self.errornooutputdevice();

            // Set switch false
            self.havemidiout = false;
            return this;
        };

        // Notify MIDI system ready
        console.log("MIDI system successfully initialised.");
        self.trigger("midistatus", "success");
    };

    function onerrorcallback(err) {
        self.havemidi       = false;
        self.havemidiin     = false;
        self.havemidiout    = false;
        console.log( "Uh-oh! Something went wrong! Error code: " + err.code );
        self.trigger("midistatus", "fail");
    };
    return this;
};

////////////////////////////
// Set MIDI Output device //
////////////////////////////

TBMWMIDIOut.prototype.setoutputdevice = function(deviceid) {
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
            console.log("Error: MIDI output port " + deviceid + " not available.");
        };
    } else {
        return this;
    };
    return this;
};

////////////////////////////////////////////////////////
// Append Output device menu to container DOM element //
////////////////////////////////////////////////////////

TBMWMIDIOut.prototype.addoutputselect = function(opts) {
    if(this.havemidi && this.havemidiout) {
        var self = this;

        // Check DOM element exists, return early if not
        var domcontainer = this.checkdomelement(opts.domcontainer);
        if(!domcontainer)
            return this;

        // Check option to add label element and add if set
        if(opts.addlabel === true) {
            var label = document.createElement("label");
            label.setAttribute("for", this.outputselectid);
            label.innerHTML = (opts.labeltext !== undefined) ? opts.labeltext : "MIDI Output Device";
            label.setAttribute("class", this.containerclass);
            domcontainer.appendChild(label);
        };

        // Create <select> element
        var outputsel = document.createElement("select");
        outputsel.setAttribute("id", this.outputselectid);
        outputsel.setAttribute("class", this.containerclass);

        // Add options
        this.outputs.forEach(function(port) {
            var opt = document.createElement("option");
            opt.text = port.name;
            // Try and get previous port from cookie if option set
            if(self.outputsettings.device == port.id) {
                opt.setAttribute("selected", "selected");
            };
            opt.value = port.id;
            outputsel.add(opt);
        });

        // Append select to container DOM element
        domcontainer.appendChild(outputsel);

        // Listen for changes
        outputsel.addEventListener('change', function(){
            // Set output device
            var device = this.value;
            self.setoutputdevice(device);
            self.outputsettings.device = device;
            self.savesettings();
        });
    } else {
        this.errornooutputdevice();
    };
    this.savesettings();
    return this;
};

//////////////////////
// Set MIDI Channel //
//////////////////////

TBMWMIDIOut.prototype.setoutmidichannel = function(channel) {
    this.midichannel = parseInt(channel);
};

//////////////////////////////////
// Add MIDI Channel select menu //
//////////////////////////////////

TBMWMIDIOut.prototype.addoutchannelselect = function(opts) {
    if(this.havemidi && this.havemidiout) {

        // Check DOM element exists, return early if not
        var domcontainer = this.checkdomelement(opts.domcontainer);
        if(!domcontainer)
            return this;

        // Check option to add label element and add if set
        if(opts.addlabel === true) {
            var label = document.createElement("label");
            label.setAttribute("for", this.channelselectid);
            label.innerHTML = (opts.labeltext !== undefined) ? opts.labeltext : "MIDI Output Channel";
            label.setAttribute("class", this.containerclass);
            domcontainer.appendChild(label);
        };

        // Create <select> element
        var channelsel = document.createElement("select");
        channelsel.setAttribute("id", this.channelselectid);
        channelsel.setAttribute("class", this.containerclass);

        // Add options
        for(var i = 1; i < 17; i++) {
            var opt = document.createElement("option");
            opt.text = i;
            opt.value = i;
            // Try and get previous port from cookie if option set
            if(this.outputsettings.channel === i) {
                opt.setAttribute("selected", "selected");
            };
            channelsel.add(opt);
        };

        // Append select to container DOM element
        domcontainer.appendChild(channelsel);

        // Listen for changes
        var self = this;
        channelsel.addEventListener('change', function(){
            // Set output device
            self.outputsettings.channel = parseInt(this.value);
            self.setoutmidichannel(self.outputsettings.channel);
            self.savesettings();
        });

    // No MIDI output device
    } else {
        return this;
    };
    return this;
};

/////////////////////////////////
// Add MIDI Output test button //
/////////////////////////////////

TBMWMIDIOut.prototype.addtestbutton = function(opts) {
    if(this.havemidi && this.havemidiout) {

        // Check DOM element exists, return early if not
        var domcontainer = this.checkdomelement(opts.domcontainer);
        if(!domcontainer)
            return this;

        // Create <button> element
        var testbutton = document.createElement("button");
        testbutton.setAttribute("id", this.testoutputbuttonid);
        testbutton.setAttribute("class", this.containerclass);
        testbutton.innerHTML = 'Test MIDI Out';

        // Append button to container DOM element
        domcontainer.appendChild(testbutton);

        // Listen for changes
        var self = this;
        testbutton.addEventListener("mousedown", function() {
            // Send note-on on default MIDI channel
            self.send_noteon(null, self.testnotenum, 127, null);
        }, false);
        testbutton.addEventListener("mouseup", function() {
            // Send note-off on default MIDI channel
            self.send_noteoff(null, self.testnotenum, 127, null);
        }, false);

    // No MIDI output device
    } else {
        return this;
    };
    return this;
};

///////////////////////
// Send MIDI Note-On //
///////////////////////

TBMWMIDIOut.prototype.send_noteon = function(channel, note, velocity, delay) {
    if(this.havemidi && this.havemidiout) {
        var ch = (channel) ? channel : this.midichannel;
        var time = (delay) ? this.time(delay) : this.time();
        this.midiout.send([this.channelmessage("noteon", ch), note, velocity], time);
    // No MIDI output device
    } else {
        return this;
    };
    return this;
};

////////////////////////
// Send MIDI Note-Off //
////////////////////////

TBMWMIDIOut.prototype.send_noteoff = function(channel, note, velocity, delay) {
    if(this.havemidi && this.havemidiout) {
        var ch = (channel) ? channel : this.midichannel;
        var time = (delay) ? this.time(delay) : this.time();
        this.midiout.send([this.channelmessage("noteoff", ch), note, velocity], time);
    // No MIDI output device
    } else {
        return this;
    };
    return this;
};

////////////////////////
// Send All Notes Off //
////////////////////////

TBMWMIDIOut.prototype.send_allnotesoff = function(channel, delay) {
    if(this.havemidi && this.havemidiout) {
        var ch = (channel) ? channel : this.midichannel;
        var time = (delay) ? this.time(delay) : this.time();
        this.midiout.send([this.channelmessage("allnotesoff", ch), 0, 0], this.time());
    // No MIDI output device
    } else {
        return this;
    };
    return this;
};

//////////////////////////
// Send MIDI controller //
//////////////////////////

TBMWMIDIOut.prototype.send_controller = function(channel, cc, value, delay) {
    if(this.havemidi && this.havemidiout) {
        var ch = (channel) ? channel : this.midichannel;
        var time = (delay) ? this.time(delay) : this.time();
        this.midiout.send([this.channelmessage("controller", ch), cc, value], time);
    // No MIDI output device
    } else {
        return this;
    };
    return this;
};

//////////////////////////
// Send MIDI clock tick //
//////////////////////////

TBMWMIDIOut.prototype.send_clocktick = function() {
    if(this.havemidi && this.havemidiout) {
        this.midiout.send([this.systemmessage("clock")], this.time());
    // No MIDI output device
    } else {
        return this;
    };
    return this;
};

//////////////////////////
// Send MIDI clock stop //
//////////////////////////

TBMWMIDIOut.prototype.send_clockstop= function() {
    if(this.havemidi && this.havemidiout) {
        this.midiout.send([this.systemmessage("stop")], this.time());
    // No MIDI output device
    } else {
        return this;
    };
    return this;
};

//////////////////////////////
// Send MIDI clock continue //
//////////////////////////////

TBMWMIDIOut.prototype.send_clockcontinue = function() {
    if(this.havemidi && this.havemidiout) {
        this.midiout.send([this.systemmessage("continue")], this.time());
    // No MIDI output device
    } else {
        return this;
    };
    return this;
};
