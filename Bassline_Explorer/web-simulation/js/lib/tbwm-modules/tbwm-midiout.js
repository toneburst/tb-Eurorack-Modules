/*
 * toneburst 2016
 *
 * Dependencies:
 * WebMIDIAPIShim
 * Microevent.js
 */

function TBMWMIDIOut(instanceid, initopts) {

    // Check instance ID passes when instance created
    // (Required if multiple instances created)
    this.instanceid = "0";
    if(instanceid)
        this.instanceid = instanceid;
    else
        console.log("WARNING: You should specify a unique instance ID when instantiating the TBWMMIDIOut object.");

    // Save settings to cookie true/false
    this.savesettingslocal = false;
    if(initopts !== undefined && initopts.savesettings === true)
        this.savesettingslocal = true;

    // IDs for DOM elements
    this.idprefix = "tbwm-ui-midiout";
    // ID of output select element
    this.outputselectid = this.idprefix + "-" + "device";
    if(this.instanceid) this.outputselectid += "-" + this.instanceid;
    // ID of channel select element
    this.channelselectid = this.idprefix + "-" + "channel";
    if(this.instanceid) this.channelselectid += "-" + this.instanceid;
    // ID of ouput test button element
    this.testoutputbuttonid = this.idprefix + "-" + "testoutput";
    if(this.instanceid) this.testoutputbuttonid += "-" + this.instanceid;
	// Class to add to dynamically-created DOM elements
    this.containerclass = "tbwm-ui";

    // MIDI system status variables
    this.havemidi           = false;
    this.havemidiout        = false;
    this.midiaccess         = {};
    this.outputs            = {};
    this.testnotenum        = 64;

    // Settings object (can be saved to/retreived from cookie if option set)
    this.outputsettings = {
        device : null,
        channel : 1
    };

    // Name of cookie to save settings to if option set
    this.cookiename = "tbwm-midioutputprefs";

	// Instantiate utility object
	this.utils = null;
	try {
		if(typeof TBWMSharedfunctions() === undefined)
			throw "TBWMSharedfunctions() Object not available";
		else
			this.utils = new TBWMSharedfunctions();
    }
    catch(err) {
        this.errornoutils(err);
    };

    // Return object instance for chaining
    return this;
};

// Mix in Microevent object from microevent.js so our object can emit events
MicroEvent.mixin(TBMWMIDIOut);

//////////////////////////////////////////
// Utility function not available error //
//////////////////////////////////////////

TBMWMIDIOut.prototype.errornoutils = function(err) {
    var error = (err) ? " Error was: '" + err + "'." : "";
    console.log("Error: No utility function available, exiting." + error);
};

////////////////////////////////////
////////////////////////////////////
// Save/Recall Settings Functions //
////////////////////////////////////
////////////////////////////////////

// Save output settings to cookie if init option set
TBMWMIDIOut.prototype.savesettings = function() {
    if(this.savesettingslocal) {
        this.utils.savesettings(this.cookiename, JSON.stringify(this.outputsettings), 365);
    };
};

// Get output settings from cookie, and update output settings object
// Won't update previously-set settings, so only to be called at init by instance itself
TBMWMIDIOut.prototype.recallsavedsettings = function() {
    if(this.savesettingslocal) {
        var fromcookie = this.utils.getsettings(this.cookiename);
        if(fromcookie) {
            var savedsettings = JSON.parse(fromcookie);
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

//////////////////
//////////////////
// MIDI Methods //
//////////////////
//////////////////

//////////////////////////
// No System MIDI error //
//////////////////////////

TBMWMIDIOut.prototype.errornomidi = function(e) {
    this.havemidi = false;
    //var error = "Error: No access to MIDI devices: browser does not support WebMIDI API, please use the WebMIDIAPIShim together with the Jazz plugin.";
    console.log(e);
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

// MIDI Channel messages
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

// MIDI System messages
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

/////////////////////////////////////
// Get Timestamp with option delay //
/////////////////////////////////////

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

    var self = this;

    // Request MIDI access
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
            self.outputsettings.device = self.midiout["name"];
            self.midiout.open();
            self.havemidiout = true;

            // Get and apply saved settings
            self.recallsavedsettings();
            self.setoutputdevice(self.outputsettings.device);
            self.setoutmidichannel(self.outputsettings.channel);

        // No MIDI output ports found
        } else {
            // Send error
            self.errornooutputdevice();

            // Set switch false
            self.havemidiout = false;

            // Emit event
            self.trigger("midistatus", "fail");

            // Return this instance for chaining
            return this;
        };

        // Notify MIDI system ready
        console.log("MIDI system successfully initialised.");

        // Emit event
        self.trigger("midistatus", "success");
    };

    // MIDI system not available
    function onerrorcallback(err) {
        self.havemidi       = false;
        self.havemidiin     = false;
        self.havemidiout    = false;
        console.log( "Uh-oh! Something went wrong! Error code: " + err.code );
        self.trigger("midistatus", "fail");
    };

    // Return this instance for chaining
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
            this.outputsettings.device = foundport.name;
            this.savesettings();
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
    if(this.havemidi && this.havemidiout && this.utils) {

		var self = this;

		// Check DOM element exists, return early if not
	    var domcontainer = this.utils.DOMcheckelement(opts.domcontainer);
	    if(!domcontainer)
	        return this;

		// Add <label> element to container if option set
		if(opts.addlabel === true) {
			domcontainer.appendChild(this.utils.DOMcreatelabel({
				labelfor : this.outputselectid,
				labeltext : (opts.labeltext !== undefined) ? opts.labeltext : "MIDI Output Device"
			}));
		};

        // Create <select> element
        var outputsel = document.createElement("select");
        outputsel.setAttribute("id", this.outputselectid);
        outputsel.setAttribute("class", this.containerclass);

        // Add options
		var devsarray = [];
		this.outputs.forEach(function(port) {
			devsarray.push({
				text : port.name,
				value : port.name
			});
		});

		var outputsel = this.utils.DOMaddselect({
			id : this.outputselectid,
			options : devsarray,
			selected : self.outputsettings.device
		});

        // Append select to container DOM element
        domcontainer.appendChild(outputsel);

        // Listen for changes
        outputsel.addEventListener('change', function(){
            // Set output device
            var device = this.value;
            self.setoutputdevice(device);
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
    this.savesettings();
};

//////////////////////////////////
// Add MIDI Channel select menu //
//////////////////////////////////

TBMWMIDIOut.prototype.addoutchannelselect = function(opts) {
    if(this.havemidi && this.havemidiout && this.utils) {

		// Check DOM element exists, return early if not
	    var domcontainer = this.utils.DOMcheckelement(opts.domcontainer);
	    if(!domcontainer)
	        return this;

		// Add <label> element to container if option set
		if(opts.addlabel === true) {
			domcontainer.appendChild(this.utils.DOMcreatelabel({
				labelfor : this.channelselectid,
				labeltext : (opts.labeltext !== undefined) ? opts.labeltext : "MIDI Output Channel"
			}));
		};

        // Add options
		var chansarray = [];
		for(var i = 1; i < 17; i++) {
			chansarray.push({text : i, value : i});
		};
		var channelsel = this.utils.DOMaddselect({
			id : this.channelselectid,
			options : chansarray,
			selected : this.outputsettings.channel
		});
        // Append select to container DOM element
        domcontainer.appendChild(channelsel);

        // Listen for changes to appended <select> element
        var self = this;
        channelsel.addEventListener('change', function(){
            // Set output device
            self.outputsettings.channel = parseInt(this.value);
            self.setoutmidichannel(self.outputsettings.channel);
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
    if(this.havemidi && this.havemidiout && this.utils) {

		// Check DOM element exists, return early if not
	    var domcontainer = this.utils.DOMcheckelement(opts.domcontainer);
	    if(!domcontainer)
	        return this;

        // Create <button> element
		var testbutton = this.utils.DOMaddbutton({
			id : this.testoutputbuttonid,
			text : (opts.buttontext !== undefined) ? opts.buttontext : "Test MIDI Out"
		});

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
