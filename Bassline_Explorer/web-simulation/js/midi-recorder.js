/*
 *
 *
 *
 */

function Recorder() {
    this.isrecording    = false;
    this.ticks          = 0;
    this.midixmlheader  = '<?xml version="1.0" encoding="ISO-8859-1"?><!DOCTYPE MIDIFile SYSTEM "http://www.musicxml.org/dtds/midixml.dtd"><MIDIFile><Format>1</Format><TrackCount>2</TrackCount><TicksPerBeat>8</TicksPerBeat><TimestampType>Absolute</TimestampType>';
    this.midixmltrk0    = '<Format>1</Format><TrackCount>2</TrackCount><TicksPerBeat>120</TicksPerBeat><TimestampType>Absolute</TimestampType><Track Number="0"><Event><Absolute>0</Absolute><TimeSignature Numerator="4" LogDenominator="2" MIDIClocksPerMetronomeClick="24" ThirtySecondsPer24Clocks="8"/></Event><Event><Absolute>0</Absolute><KeySignature Fifths="0" Mode="0"/></Event><Event><Absolute>0</Absolute><SetTempo Value="371520"/></Event><Event><Absolute>0</Absolute><EndOfTrack/></Event></Track>';
    this.midixmltrk1    = null;
    this.midixmlclose   = '</Track></MIDIFile>';
};

// Mix in Microevent object from microevent.js so our Clock object can emit events
MicroEvent.mixin(Recorder);

Recorder.prototype.startrecording = function() {
    this.midixmltrk1 = '<Track Number="1">';
    if(!this.isrecording) {
        this.isrecording = true;
    };
};

Recorder.prototype.recordstep = function(messagetype, channel, note, velocity) {
    if(this.isrecording) {
        // Create Event string
        var noteevent = '<Event>'
        noteevent += '<Absolute>' + ticks + '</Absolute>';
        noteevent += '<';
        noteevent += messagetype + ' ';
        noteevent += 'Channel="' + channel + '" ';
        noteevent += 'Note="' + note + '" ';
        noteevent += 'Velocity="' + velocity + '" ';
        noteevent += '/>';
        noteevent += '</Event>';
        // Emit event so we can bind to it in controls.js
        var self = this;
        self.trigger('midievent', noteevent);
        // Concatenate event to XML string
        this.midixmltrk1 += noteevent;
        // Update ticks
        this.ticks++;
    };
};

Recorder.prototype.stoprecording = function() {
    // Wait for end of bar then add closing tags to XML string
    if(this.isrecording) {
        this.isrecording = false;
        this.midixmltrk1 += '<Event><Absolute>' + ticks + '</Absolute><EndOfTrack/></Event>';
        this.midixmltrk1 += this.midixmlclose;
        this.submitxml();
    };
};

Recorder.prototype.submitxml = function() {
    console.log(this.midixmltrk1);
};
