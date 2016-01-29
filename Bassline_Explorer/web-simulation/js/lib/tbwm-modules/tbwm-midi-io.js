/*
 * toneburst 2016
 *
 *
 */

function TBMIDI() {
    this.midichannel    = 0;
    // Jazz object
    this.jazz           = null;
    this.havemidi       = false;
    this.havecontainer  = false;
    this.$uicontainer   = null;
    this.uicontainer    = null;
    this.containerclass = "midiui";

    this.idprefix       = "tbmio";
    this.outputselectid = this.idprefix + "-" + "outputdevice";
};

//////////////////////////////////////////////
// UI Container DOM element not found error //
//////////////////////////////////////////////

TBMIDI.prototype.errordomelement = function() {
    var error = "Error: Container element not found. You need to specify ID of an existing element (with or without leading '#') when initialising this instance or calling this method";
    console.log(error);
    return error;
};

/////////////////////////////////
// No MIDI output device error //
/////////////////////////////////

TBMIDI.prototype.errornooutputdevice = function() {
    this.havemidi = false;
    var error = "Error: No MIDI or no MIDI output device found";
    console.log(error);
    return error;
};

////////////////////////////////
// Create <label> DOM element //
////////////////////////////////

TBMIDI.prototype.createlabel = function(labelfor, labeltext) {
    var label = document.createElement("label");
    label.setAttribute("for", labelfor);
    label.innerHTML = labeltext;
    return label;
};

///////////////////
// Init function //
///////////////////

TBMIDI.prototype.init = function(uicontainer) {
    if(uicontainer) {
        this.$uicontainer = $(uicontainer);
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

    var jazz1 = document.createElement("object");
    jazz1.setAttribute("id", "jazz1");
    jazz1.setAttribute("classid", "CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90");
    jazz1.setAttribute("class", "hidden");

    var jazz2 = document.createElement("object");
    jazz2.setAttribute("id", "jazz2");
    jazz2.setAttribute("class", "hidden");
    jazz2.setAttribute("type", "audio/x-jazz");
    jazz2.innerHTML = "This page requires the ";

    var jazzlnk = document.createElement("a");
    jazzlnk.setAttribute("href","http://jazz-soft.net");
    jazzlnk.setAttribute("target","_blank");
    jazzlnk.innerHTML = "Jazz MIDI Plugin";
    jazz2.appendChild(jazzlnk);

    jazz1.appendChild(jazz2);

    var cntnr = document.getElementById(uicontainer.replace("#","")).appendChild(jazz1);

    this.jazz = (jazz1.isJazz) ? jazz1 : jazz2;
    if(this.jazz.isJazz)
        this.havemidi = true;
};

TBMIDI.prototype.setoutputdevice = function(device) {
    if(this.havemidi) {
        this.jazz.MidiOutOpen(device);
    } else {
        this.errornooutputdevice();
        return;
    };
};

TBMIDI.prototype.addoutputselect = function() {

    if(this.havemidi) {

        var midi_devicelist = this.jazz.MidiOutList();

        if(midi_devicelist.length > 0) {

            // Create <label> element
            var label = this.createlabel(this.outputselectid, "Select MIDI Output Device");

            // Create <select> element
            var sel = document.createElement("select");
            sel.setAttribute("id", this.outputselectid);
            // Add options
            if(midi_devicelist) {
                for(var i = 0; i < midi_devicelist.length; i++) {
                    var opt = document.createElement("option");
                    opt.text = midi_devicelist[i];
                    opt.value = midi_devicelist[i];
                    sel.add(opt);
                };
            };

            // Append label and select to container DOM element
            this.uicontainer.appendChild(label);
            this.uicontainer.appendChild(sel);

            // Listen for changes
            var self = this;
            sel.addEventListener('change', function(){
                // Set scale
                self.setoutputdevice(this.value);
            });
        } else {
            this.errornooutputdevice();
        };
    };
};

TBMIDI.prototype.setmidichannel = function(channel) {
    this.midichannel = channel;
};

TBMIDI.prototype.addchannelselect = function() {
    if(this.havemidi) {
        var midichannelselect_str = '<p>MIDI Channel</p><p><select id="selectmidichannel"><option value="select">Select MIDI Channel</option></select></p>';
        this.$uicontainer.append(midichannelselect_str);
        var $midichannelselect = $("#selectmidichannel");
        for(var i = 0; i < 16; i++) {
            $midichannelselect.append($('<option>', {
                value: i,
                text : i + 1
            }));
        };
        var self = this;
        $midichannelselect.change(function() {
            if($midichannelselect.val() !== "select")
                self.setmidichannel(parseInt($midichannelselect.val()));
        });
    } else {
        this.errornooutputdevice();
        return;
    };
};

TBMIDI.prototype.addtestbutton = function() {
    if(this.havemidi) {
        var midiouttestbutton_str = '<p>Test Output</p><p><button type="button" id="testmidioutbutton">test MIDI</button></p>';
        this.$uicontainer.append(midiouttestbutton_str);
        var $midiouttestbutton = $("#testmidioutbutton");
        var self = this;
        $midiouttestbutton.mousedown(function() {
            self.noteon(self.midichannel,36,127);
        }).mouseup(function() {
            self.noteoff(self.midichannel,36,0);
        });
    } else {
        this.errornooutputdevice();
        return;
    };
};

TBMIDI.prototype.noteon = function(channel, note, velocity) {
    if(this.havemidi) {
        var ch = (channel) ? channel : this.midichannel;
        this.jazz.MidiOut(ch + 144, note, velocity);
    } else {
        this.errornooutputdevice();
        return;
    };
};

TBMIDI.prototype.noteoff = function(channel, note) {
    if(this.havemidi) {
        var ch = (channel) ? channel : this.midichannel;
        this.jazz.MidiOut(channel + 128, note, 0);
    } else {
        this.errornooutputdevice();
        return;
    };
};
