/*
 *
 *
 *
 */

//////////////////////////////////////
// Object Definition and Properties //
//////////////////////////////////////

function Recorder() {
    this.isrecording    = false;
    this.ticks          = 0;
    // MIDIXML Strings
    this.midixmlheader  = '<?xml version="1.0" encoding="ISO-8859-1"?><!DOCTYPE MIDIFile SYSTEM "http://www.musicxml.org/dtds/midixml.dtd"><MIDIFile><Format>1</Format><TrackCount>2</TrackCount><TicksPerBeat>8</TicksPerBeat><TimestampType>Absolute</TimestampType>' + "\n";
    this.midixmltrk0    = '<Format>1</Format><TrackCount>2</TrackCount><TicksPerBeat>8</TicksPerBeat><TimestampType>Absolute</TimestampType><Track Number="0"><Event><Absolute>0</Absolute><TimeSignature Numerator="4" LogDenominator="2" MIDIClocksPerMetronomeClick="24" ThirtySecondsPer24Clocks="8"/></Event><Event><Absolute>0</Absolute><KeySignature Fifths="0" Mode="0"/></Event><Event><Absolute>0</Absolute><SetTempo Value="371520"/></Event><Event><Absolute>0</Absolute><EndOfTrack/></Event></Track>' + "\n";
    this.midixmltrk1    = null;
    this.midixmlclose   = "\n</MIDIFile>";
    this.midixml        = null;
};

/////////////////////////////////////////////////
// Mix in Microevent object from microevent.js //
// so our Clock object can emit events //////////
/////////////////////////////////////////////////

MicroEvent.mixin(Recorder);

/////////////////////
// Start Recording //
/////////////////////

Recorder.prototype.startrecording = function() {
    this.midixmltrk1 = '<Track Number="1">' + "\n";
    if(!this.isrecording) {
        this.isrecording = true;
        this.ticks = 0;
    };
};

/////////////////
// Update time //
/////////////////

Recorder.prototype.updateticks = function() {
    this.ticks++;
};

///////////////////////
// Record MIDI Event //
///////////////////////

Recorder.prototype.recordevent = function(messagetype, channel, note, velocity) {
    if(this.isrecording) {
        // Create Event string
        var midievent = '<Event>';
        midievent += '<Absolute>' + this.ticks + '</Absolute>';
        if(messagetype == "NoteOn" || messagetype == "NoteOff") {
            midievent += '<';
            midievent += '"' + messagetype + '" ';
            // Always record on MIDI ch.1
            midievent += 'Channel="0" ';
            midievent += 'Note="' + note + '" ';
            midievent += 'Velocity="' + velocity + '" ';
            midievent += '/>';
        };
        //
        midievent += "</Event>\n";
        // Concatenate event to XML string
        this.midixmltrk1 += midievent;
    };
};

////////////////////
// Stop Recording //
////////////////////

Recorder.prototype.stoprecording = function() {
    if(this.isrecording) {
        this.isrecording = false;
        this.midixmltrk1 += '<Event><Absolute>' + this.ticks + '</Absolute><EndOfTrack/></Event>' + "\n";
        this.midixmltrk1 += '</Track>';
        this.midixml = this.midixmlheader + this.midixmltrk0 + this.midixmltrk1 + this.midixmlclose;
    };
};

////////////////////////
// Get MIDIXML String //
////////////////////////

Recorder.prototype.getmidixml = function() {
    return (this.midixml) ? this.midixml : "No MIDIXML string to return. You must call this method After 'stoprecording' method.";
};
