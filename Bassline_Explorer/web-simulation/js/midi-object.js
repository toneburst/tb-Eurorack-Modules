function MIDI() {
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

MIDI.prototype.init = function(uicontainer) {
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

MIDI.prototype.errornooutputdevice = function() {
    console.log("Can't get MIDI output");
};

MIDI.prototype.setoutputdevice = function(device) {
    if(this.havejazz) {
        this.jazz.MidiOutOpen(device);
    } else {
        this.errornooutputdevice();
        return;
    };
};

MIDI.prototype.addoutputselect = function() {
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

MIDI.prototype.setmidichannel = function(channel) {
    this.midichannel = channel;
};

MIDI.prototype.addchannelselect = function() {
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

MIDI.prototype.addtestbutton = function() {
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

MIDI.prototype.selectscale = function() {
    // Scales from Mutable Instruments MIDIPal firmware
    // Olivier Gillet
    // NAMES MAY BE WRONG!
    this.mpscales = Array();
    this.mpscales[0]  = ["Chromatic",[0,1,2,3,4,5,6,7,8,9,10,11]];
    this.mpscales[1]  = ["Ionian",[0,0,2,2,4,5,5,7,7,9,9,11]];
    this.mpscales[2]  = ["Dorian",[0,0,2,3,3,5,5,7,7,10,10]];
    this.mpscales[3]  = ["Phrygian",[0,1,1,3,3,5,5,7,8,8,10,10]];
    this.mpscales[4]  = ["Lydian",[0,0,2,2,4,4,6,7,7,9,11]];
    this.mpscales[5]  = ["Mixolydian",[0,0,2,2,4,5,5,7,7,9,10,10]];
    this.mpscales[6]  = ["Aeolian Minor",[0,0,2,3,3,5,5,7,8,8,10,10]];
    this.mpscales[7]  = ["Locrian",[0,1,1,3,3,5,6,6,8,8,10,10]];
    this.mpscales[8]  = ["Blues Major",[0,0,3,3,4,4,7,7,7,9,10,10]];
    this.mpscales[9]  = ["Blues Minor",[0,0,3,3,3,5,6,7,7,10,10,10]];
    this.mpscales[10] = ["Pentatonic Major",[0,0,2,2,4,4,7,7,7,9,9,9]];
    this.mpscales[11] = ["Pentatonic Minor",[0,0,3,3,3,5,5,7,7,10,10,10]];
    this.mpscales[12] = ["Raga Bhiarav",[0,1,1,4,4,5,5,7,8,8,11,11]];
    this.mpscales[13] = ["Raga Shri",[0,1,1,4,4,4,6,7,8,8,11,11]];
    this.mpscales[14] = ["Raga Rupatavi",[0,1,1,3,3,5,5,7,7,10,10,11]];
    this.mpscales[15] = ["Raga Todi",[0,1,1,3,3,6,6,7,8,8,11,11]];
    this.mpscales[16] = ["Raga Kaafi",[0,0,2,2,4,5,5,5,9,9,10,11]];
    this.mpscales[17] = ["Raga Meg",[0,0,2,2,5,5,5,7,7,9,9,9]];
    this.mpscales[18] = ["Raga Malkauns",[0,0,3,3,3,5,5,8,8,8,10,10]];
    this.mpscales[19] = ["Raga Deepak",[0,0,3,3,4,4,6,6,8,8,10,10]];
    this.mpscales[20] = ["Folkish",[0,1,1,3,4,5,5,7,8,8,10,10]];
    this.mpscales[21] = ["Japanese",[0,1,1,1,5,5,5,7,8,8,8,8]];
    this.mpscales[22] = ["Gamelan",[0,1,1,3,3,3,7,7,8,8,8,8]];
    this.mpscales[23] = ["Whole Tones",[0,0,2,2,4,4,6,6,8,8,10,10]];

    // Scale Index
    this.scaleindex = 2; // Dorian
    this.scale = this.mpscales[this.scaleindex][0];
};

MIDI.prototype.noteon = function(channel, note, velocity) {
    if(this.havejazz) {
        this.jazz.MidiOut(channel + 144, note, velocity);
        /*if(recorder)
            recorder.recordnote("NoteOn", midi_channel, note, velocity);*/
    } else {
        this.errornooutputdevice();
        return;
    };
};

MIDI.prototype.noteoff = function(channel, note) {
    if(this.havejazz) {
        this.jazz.MidiOut(channel + 128, note, 0);
        /*if(recorder)
            recorder.recordnote("NoteOff", midi_channel, note, 0);*/
    } else {
        this.errornooutputdevice();
        return;
    };
};
