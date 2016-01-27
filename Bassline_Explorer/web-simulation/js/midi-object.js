function TBMIDI() {
    this.midichannel = 0;

    // Master transpose amount
    this.transpose = 24;

    this.enablerecord = false;
    this.recording = [];

    this.scale = null;

    // Jazz object
    this.jazz = null;
    this.havejazz = false;
    this.$uicontainer = null;
};

TBMIDI.prototype.init = function(uicontainer) {
    if(uicontainer) {
        this.$uicontainer = $(uicontainer);
        this.$uicontainer.addClass("midiui");
    } else {
        return "You must specify a container element for MIDI setup controls";
    };

    var jazzobject = '<object id="Jazz1" classid="CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90" class="hidden"><object id="Jazz2" type="audio/x-jazz" class="hidden"><p>This page requires <a href=http://jazz-soft.net>Jazz-Plugin</a> ...</p></object></object>';
    this.$uicontainer.append(jazzobject);

    // Set Jazz object
    this.jazz = $("#Jazz1")[0];
    if(this.jazz) {
        if(this.jazz.isJazz) {
            this.havejazz = true;
        } else if($("#Jazz2")[0].isJazz) {
            this.jazz = $("#Jazz2")[0];
            this.havejazz = true;
        } else {
            this.havejazz = false;
        };
    };
};

TBMIDI.prototype.errornooutputdevice = function() {
    console.log("Can't get MIDI output");
};

TBMIDI.prototype.setoutputdevice = function(device) {
    if(this.havejazz) {
        this.jazz.MidiOutOpen(device);
    } else {
        this.errornooutputdevice();
        return;
    };
};

TBMIDI.prototype.addoutputselect = function() {
    if(this.havejazz) {
        var midioutselect_str = '<p>MIDI Output</p><p><select id="selectmidiout"><option value="select">Select MIDI Output</option></select></p>';
        this.$uicontainer.append(midioutselect_str);
        var $midioutselect = $("#selectmidiout");
        var midi_devicelist = this.jazz.MidiOutList();
        $.each(midi_devicelist, function(i, item) {
            $midioutselect.append($('<option>', {
                value: item,
                text : item
            }));
        });
        var self = this;
        $midioutselect.change(function() {
            if($midioutselect.val() !== "select")
                self.setoutputdevice($midioutselect.val());
        });
    } else {
        this.errornooutputdevice();
        return;
    };
};

TBMIDI.prototype.setmidichannel = function(channel) {
    this.midichannel = channel;
};

TBMIDI.prototype.addchannelselect = function() {
    if(this.havejazz) {
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
    if(this.havejazz) {
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
    if(this.havejazz) {
        this.jazz.MidiOut(channel + 144, note, velocity);
        /*if(recorder)
            recorder.recordnote("NoteOn", midi_channel, note, velocity);*/
    } else {
        this.errornooutputdevice();
        return;
    };
};

TBMIDI.prototype.noteoff = function(channel, note) {
    if(this.havejazz) {
        this.jazz.MidiOut(channel + 128, note, 0);
        /*if(recorder)
            recorder.recordnote("NoteOff", midi_channel, note, 0);*/
    } else {
        this.errornooutputdevice();
        return;
    };
};
