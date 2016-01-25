/*
 *
 *
 *
 */

//////////////////////////////////////
// Object Definition and Properties //
//////////////////////////////////////

function MIDIXMLRecorder() {
    this.isrecording    = false;
    this.tempo          = 500000;   // Default tempo 120bpm
    this.trackname      = "Bassline Explorer Clip"
    this.lastnotes      = [];
    this.ticks          = 0;
    // MIDIXML Strings
    this.midixmlheader  = '<?xml version="1.0"?><!DOCTYPE MIDIFile SYSTEM "http://www.musicxml.org/dtds/midixml.dtd"><MIDIFile><Format>1</Format><TrackCount>2</TrackCount><TicksPerBeat>8</TicksPerBeat><TimestampType>Absolute</TimestampType>';
    this.midixmltrk0    = '<Track Number="0"><Event><Absolute>0</Absolute><TimeSignature Numerator="4" LogDenominator="2" MIDIClocksPerMetronomeClick="24" ThirtySecondsPer24Clocks="8" CopyrightNotice="toneburst 2016"/></Event><Event><Absolute>0</Absolute><SetTempo Value="' + this.tempo + '"/></Event><Event><Absolute>0</Absolute><EndOfTrack/></Event></Track>';
    this.midixmltrk1    = null;
    this.midixmlclose   = "</MIDIFile>";
    this.midixml        = null;
};

/////////////////////////////////////////////////
// Mix in Microevent object from microevent.js //
// so our Clock object can emit events //////////
/////////////////////////////////////////////////

MicroEvent.mixin(MIDIXMLRecorder);

////////////////////////
// Set Tempo (in BPM) //
////////////////////////

MIDIXMLRecorder.prototype.settempo = function(bpm) {
    // Calculate 1 beat (1/4 note) in microseconds
    this.tempo = (60 / bpm) * 1000000;
    // Update Track0 string with new tempo
    this.midixmltrk0 = '<Track Number="0"><Event><Absolute>0</Absolute><TimeSignature Numerator="4" LogDenominator="2" MIDIClocksPerMetronomeClick="24" ThirtySecondsPer24Clocks="8"/></Event><Event><Absolute>0</Absolute><SetTempo Value="' + this.tempo + '"/></Event><Event><Absolute>0</Absolute><EndOfTrack/></Event></Track>';
};

//////////////////////////////
// Set MIDI Clip Track Name //
//////////////////////////////

MIDIXMLRecorder.prototype.settrackname = function(trackname) {
    this.trackname = trackname;
};

/////////////////////
// Start Recording //
/////////////////////

MIDIXMLRecorder.prototype.startrecording = function() {
    this.midixmltrk1 = '<Track Number="1"><Event><Absolute>0</Absolute><TrackName>' + this.trackname + '</TrackName></Event>';
    if(!this.isrecording) {
        this.isrecording = true;
        this.ticks = 0;
    };
};

/////////////////
// Update time //
/////////////////

MIDIXMLRecorder.prototype.updateticks = function() {
    this.ticks++;
};

///////////////////////
// Record MIDI Event //
///////////////////////

MIDIXMLRecorder.prototype.recordnote = function(notetype, channel, note, velocity) {
    if(this.isrecording) {
        // MIDI XML note-off events seem to be just note-on events with velocity of 0
        // so set velocity of 0 if notetype is "NoteOff"
        var vel = (notetype === "NoteOn") ? velocity : 0;
        // Create Event string
        var midievent = '<Event>';
        midievent += '<Absolute>' + this.ticks + '</Absolute>';
        midievent += '<NoteOn ';
        // Always record on MIDI ch.1
        midievent += 'Channel="1" ';
        midievent += 'Note="' + note + '" ';
        midievent += 'Velocity="' + vel + '"/>';
        midievent += "</Event>";
        // Concatenate event to XML string
        this.midixmltrk1 += midievent;
        // Add notes to lastnotes array, removing 1 item each time, to ensure only last 2 notes kept
        // (we only need to keep 2 notes in the array because only two notes should ever be playing at a given time)
        // This might have to be changed if this object were to be used as a generic MIDI XMLrecorder
        if(notetype == 'NoteOn') {
            this.lastnotes.push(note);
            if(this.lastnotes.length > 1)
                this.lastnotes.shift();
        };
    };
};

////////////////////
// Stop Recording //
////////////////////

MIDIXMLRecorder.prototype.stoprecording = function() {
    if(this.isrecording) {
        this.isrecording = false;
        // Record note-off for last notes
        if(this.lastnotes.length > 0) {
            for(var i = 0; i < this.lastnotes.length; i++) {
                this.midixmltrk1 += '<Event><Absolute>' + this.ticks + '</Absolute><NoteOn Channel="1" Note="' + this.lastnotes[i] + '" Velocity="0"/></Event>';
            };
        };
        // Finish track string
        this.midixmltrk1 += '<Event><Absolute>' + this.ticks + '</Absolute><EndOfTrack/></Event>';
        this.midixmltrk1 += '</Track>';
        this.midixml = this.midixmlheader + this.midixmltrk0 + this.midixmltrk1 + this.midixmlclose;
    };
};

////////////////////////
// Get MIDIXML String //
////////////////////////

MIDIXMLRecorder.prototype.getmidixml = function() {
    return (this.midixml) ? this.midixml : "No MIDIXML string to return. You must call this method After 'stoprecording' method.";
};
