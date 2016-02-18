/*
 * toneburst 2016
 *
 *
 */

function TBWMNotequantiser(instanceid, initopts) {

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

	// Scales from Mutable Instruments MIDIPal firmware
    // Olivier Gillet
    // NAMES MAY BE WRONG!
    this.mpscales = Array();
    this.mpscales[0]  = {name:"Chromatic", notes:[0,1,2,3,4,5,6,7,8,9,10,11]};
    this.mpscales[1]  = {name:"Ionian",notes:[0,0,2,2,4,5,5,7,7,9,9,11]};
    this.mpscales[2]  = {name:"Dorian",notes:[0,0,2,3,3,5,5,7,7,10,10]};
    this.mpscales[3]  = {name:"Phrygian",notes:[0,1,1,3,3,5,5,7,8,8,10,10]};
    this.mpscales[4]  = {name:"Lydian",notes:[0,0,2,2,4,4,6,7,7,9,11]};
    this.mpscales[5]  = {name:"Mixolydian",notes:[0,0,2,2,4,5,5,7,7,9,10,10]};
    this.mpscales[6]  = {name:"Aeolian Minor",notes:[0,0,2,3,3,5,5,7,8,8,10,10]};
    this.mpscales[7]  = {name:"Locrian",notes:[0,1,1,3,3,5,6,6,8,8,10,10]};
    this.mpscales[8]  = {name:"Blues Major",notes:[0,0,3,3,4,4,7,7,7,9,10,10]};
    this.mpscales[9]  = {name:"Blues Minor",notes:[0,0,3,3,3,5,6,7,7,10,10,10]};
    this.mpscales[10] = {name:"Pentatonic Major",notes:[0,0,2,2,4,4,7,7,7,9,9,9]};
    this.mpscales[11] = {name:"Pentatonic Minor",notes:[0,0,3,3,3,5,5,7,7,10,10,10]};
    this.mpscales[12] = {name:"Raga Bhiarav",notes:[0,1,1,4,4,5,5,7,8,8,11,11]};
    this.mpscales[13] = {name:"Raga Shri",notes:[0,1,1,4,4,4,6,7,8,8,11,11]};
    this.mpscales[14] = {name:"Raga Rupatavi",notes:[0,1,1,3,3,5,5,7,7,10,10,11]};
    this.mpscales[15] = {name:"Raga Todi",notes:[0,1,1,3,3,6,6,7,8,8,11,11]};
    this.mpscales[16] = {name:"Raga Kaafi",notes:[0,0,2,2,4,5,5,5,9,9,10,11]};
    this.mpscales[17] = {name:"Raga Meg",notes:[0,0,2,2,5,5,5,7,7,9,9,9]};
    this.mpscales[18] = {name:"Raga Malkauns",notes:[0,0,3,3,3,5,5,8,8,8,10,10]};
    this.mpscales[19] = {name:"Raga Deepak",notes:[0,0,3,3,4,4,6,6,8,8,10,10]};
    this.mpscales[20] = {name:"Folkish",notes:[0,1,1,3,4,5,5,7,8,8,10,10]};
    this.mpscales[21] = {name:"Japanese",notes:[0,1,1,1,5,5,5,7,8,8,8,8]};
    this.mpscales[22] = {name:"Gamelan",notes:[0,1,1,3,3,3,7,7,8,8,8,8]};
    this.mpscales[23] = {name:"Whole Tones",notes:[0,0,2,2,4,4,6,6,8,8,10,10]};
    // Scale Settings
	this.scalesettings = {
		scaleindex        : 0,
		scaleshift        : 0,
		scalerandomise    : 0,
		scaleflatten      : 0,
        scaletranspose    : 0
	};
    this.scale = this.mpscales[this.scalesettings.scaleindex]["notes"];

    // Element IDs
    this.idprefix = "tbwm-ui-notequantiser";
    // ID of Scale-Select select element
    this.scalesselectid = this.idprefix + "-scale";
	if(this.instanceid) this.scalesselectid += "-" + this.instanceid;
    // ID of Scale-Randomise range element
	this.randomiserangeid = this.idprefix + "-random";
	if(this.instanceid) this.randomiserangeid += "-" + this.instanceid;
    // ID of Shift range element
	this.shiftrangeid = this.idprefix + "-shift";
	if(this.instanceid) this.shiftrangeid += "-" + this.instanceid;
    // ID of Flatten range element
	this.flattenrangeid = this.idprefix + "-flatten";
	if(this.instanceid) this.flattenrangeid += "-" + this.instanceid;
    // ID of Transpose range element
	this.transposerangeid = this.idprefix + "-transpose";
	if(this.instanceid) this.transposerangeid += "-" + this.instanceid;

	// Instantiate utility object from shared library
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

    // Name of cookie to save settings to if option set
    this.cookiename = "tbwm-quantiserprefs";

    // Recall saved settings if option set
    if(this.savesettingslocal) {
        this.recallsavedsettings();
    };

	// Load in settings if object passed in to init function
    // (will override settings recalled from local storage)
    if(initopts)
        this.mergesettings(initopts);

	return this;
};

//////////////////////////////////////////
// Utility function not available error //
//////////////////////////////////////////

TBWMNotequantiser.prototype.errornoutils = function(err) {
    var error = (err) ? " Error was: '" + err + "'." : "";
    console.log("Error: No utility function available, exiting." + error);
};

/////////////////////////////////
// Get current settings object //
/////////////////////////////////

TBWMNotequantiser.prototype.getsettings = function() {
    return this.scalesettings;
};

///////////////////////////////////////////////////////
// Merge passed settings with existing settings ///////
// Don't use directly, use pushsettings() method to //
// push options to instance after init ////////////////
///////////////////////////////////////////////////////

TBWMNotequantiser.prototype.mergesettings = function(settings) {
    if(settings) {
        if(settings.scaleindex) {
            this.scalesettings.scaleindex = settings.scaleindex;
            this.scale = this.mpscales[this.scalesettings.scaleindex]["notes"];
        };
        if(settings.scaleshift)
            this.scalesettings.scaleshift = settings.scaleshift;
        if(settings.scalerandomise)
            this.scalesettings.scalerandomise = settings.scalerandomise;
		if(settings.scaleflatten)
			this.scalesettings.scaleflatten = settings.scaleflatten;
		if(settings.scaletranspose)
            this.scalesettings.scaletranspose = settings.scaletranspose;
    } else {
        console.log("Error: You need to pass in a settings object containing some or all of the following options: {scaleindex:[val],scaleshift:[val],scalerandomise:[val],scaleflatten:[val]},scaletranspose:[val]");
    };
    return this;
};

///////////////////////////////////////////////////////////////
// Public function: push settings to instance and optionally //
// save them to local storage (if local storage option set)  //
///////////////////////////////////////////////////////////////

TBWMNotequantiser.prototype.pushsettings = function(settings, save) {
    this.mergesettings(settings);
    if(save === true)
        this.savesettings();
    this.updateui();
    return this;
};

////////////////////////////////////
// Save settings to local storage //
////////////////////////////////////

TBWMNotequantiser.prototype.savesettings = function() {
    if(this.savesettingslocal) {
        this.utils.savesettings(this.cookiename, JSON.stringify(this.scalesettings), 365);
    };
};

//////////////////////////////////////
// Load settings from local storage //
//////////////////////////////////////

TBWMNotequantiser.prototype.recallsavedsettings = function() {
    if(this.savesettingslocal) {
        var fromcookie = this.utils.getsettings(this.cookiename);
        if(fromcookie) {
            var savedsettings = JSON.parse(fromcookie);
            if(savedsettings !== null) {
                this.mergesettings(savedsettings);
            };
        };
    };
};

//////////////////////////////////////////////
// TODO: Update UI elements with new values //
//////////////////////////////////////////////

TBWMNotequantiser.prototype.updateui = function() {

};

///////////////
// Set scale //
///////////////

TBWMNotequantiser.prototype.setscale = function(index) {
    this.scalesettings.scaleindex = Math.min(this.mpscales.length - 1, index);
    this.scale = this.mpscales[index]["notes"];
    this.savesettings();
};

///////////////////////////////////////////////
// Add select control to choose scale to DOM //
///////////////////////////////////////////////

TBWMNotequantiser.prototype.addscaleselect = function(opts) {

	// Return early with error if Utils object not available
	if(!this.utils)
		return this;

    // Check DOM element exists, return early if not
    var domcontainer = this.utils.DOMcheckelement(opts.domcontainer);
    if(!domcontainer)
        return this;

	// Add <label> element to container if option set
	if(opts.addlabel === true) {
		domcontainer.appendChild(this.utils.DOMcreatelabel({
			labelfor : this.scalesselectid,
			labeltext : (opts.labeltext !== undefined) ? opts.labeltext : "Select Scale"
		}));
	};

    // Create new <select> element
	var optsarray = [];
	for(var i = 0; i < this.mpscales.length; i++) {
		optsarray.push({
			text : this.mpscales[i]["name"],
			value : i
		});
    };
	var select = this.utils.DOMaddselect({
		id : this.scalesselectid,
		options : optsarray,
		selected : this.scalesettings.scaleindex
	});

    // Append Select to container element
    domcontainer.appendChild(select);

    // Listen for changes
    var self = this;
    select.addEventListener('change', function(){
        // Set scale
        self.setscale(parseInt(this.value));
    });

    // Return object for chaining
    return this;
};

///////////////////////////
// Set note-shift amount //
///////////////////////////

TBWMNotequantiser.prototype.setshift = function(amount) {
    this.scalesettings.scaleshift = Math.max(amount, 0) % 11;
    this.savesettings();
    return this;
};

///////////////////////////////////////////////////
// Add shift-select amount slider element to DOM //
///////////////////////////////////////////////////

TBWMNotequantiser.prototype.addshiftselect = function(opts) {

	// Return early with error if Utils object not available
	if(!this.utils)
		return this;

	// Check DOM element exists, return early if not
    var domcontainer = this.utils.DOMcheckelement(opts.domcontainer);
    if(!domcontainer)
        return this;

	// Add <label> element to container if option set
	if(opts.addlabel === true) {
		domcontainer.appendChild(this.utils.DOMcreatelabel({
			labelfor : this.shiftrangeid,
			labeltext : (opts.labeltext !== undefined) ? opts.labeltext : "Scale Shift Amount"
		}));
	};

	// Create new <range> element
	var range = this.utils.DOMaddrange({
		id : this.shiftrangeid,
		min : 0,
		max : 11,
		step : 1,
		value : this.scalesettings.scaleshift
	});
	domcontainer.appendChild(range);

	// Listen for changes
    var self = this;
    range.addEventListener('change', function() {
        // Set shift amount
        self.setshift(parseInt(this.value));
    });

	return this;
};

////////////////////////////////////////////////
// Set randomise note-lookup threshold amount //
////////////////////////////////////////////////

TBWMNotequantiser.prototype.setrandomise = function(amount) {
    this.scalesettings.scalerandomise = amount;
    this.savesettings();
    return this;
};

////////////////////////////////////////////
// Add slider for randomise amount to DOM //
////////////////////////////////////////////

TBWMNotequantiser.prototype.addrandomrange = function(opts) {

	// Return early with error if Utils object not available
	if(!this.utils)
		return this;

    // Check DOM element exists, return early if not
    var domcontainer = this.utils.DOMcheckelement(opts.domcontainer);
    if(!domcontainer)
        return this;

	// Add <label> element to container if option set
	if(opts.addlabel === true) {
		domcontainer.appendChild(this.utils.DOMcreatelabel({
			labelfor : this.randomiserangeid,
			labeltext : (opts.labeltext !== undefined) ? opts.labeltext : "Scale Randomise Amount"
		}));
	};

	// Create new <range> element
	var range = this.utils.DOMaddrange({
		id : this.randomiserangeid,
		min : 0,
		max : 1,
		step : 0.01,
		value : this.scalesettings.scalerandomise
	});
    // Append Range element to container
    domcontainer.appendChild(range);

    // Listen for changes
    var self = this;
    range.addEventListener('change', function() {
        // Set random amount
        self.setrandomise(parseFloat(this.value));
    });

    // Return object for chaining
    return this;
};

///////////////////////////////////////
// Set note-flatten threshold amount //
///////////////////////////////////////

TBWMNotequantiser.prototype.setflatten = function(amount) {
    this.scalesettings.scaleflatten = amount;
    this.savesettings();
    return this;
};

//////////////////////////////////////////
// Add slider for flatten amount to DOM //
//////////////////////////////////////////

TBWMNotequantiser.prototype.addflattenrange = function(opts) {

	// Return early if Utils object not available
	if(!this.utils) {
		return this;
	};

    // Check DOM element exists, return early if not
    var domcontainer = this.utils.DOMcheckelement(opts.domcontainer);
    if(!domcontainer)
        return this;

	// Add <label> element to container if option set
	if(opts.addlabel === true) {
		domcontainer.appendChild(this.utils.DOMcreatelabel({
			labelfor : this.flattenrangeid,
			labeltext : (opts.labeltext !== undefined) ? opts.labeltext : "Scale Flatten Amount"
		}));
	};

	// Create new <range> element
	var range = this.utils.DOMaddrange({
		id : this.flattenrangeid,
		min : 0,
		max : 1,
		step : 0.01,
		value : this.scalesettings.scaleflatten
	});
    // Append Range element to container
    domcontainer.appendChild(range);

    // Listen for changes
    var self = this;
    range.addEventListener('change', function() {
        // Set random amount
        self.setflatten(parseFloat(this.value));
    });

    // Return object for chaining
    return this;
};

//////////////////////////
// Set transpose amount //
//////////////////////////

TBWMNotequantiser.prototype.settranspose = function(amount) {
    this.scalesettings.scaletranspose = parseInt(amount);
    this.savesettings();
    return this;
};

//////////////////////////////////
// Add Transpose control to DOM //
//////////////////////////////////

TBWMNotequantiser.prototype.addtransposeselect = function(opts) {

	// Return early if Utils object not available
	if(!this.utils) {
		return this;
	};

    // Check DOM element exists, return early if not
    var domcontainer = this.utils.DOMcheckelement(opts.domcontainer);
    if(!domcontainer)
        return this;

	// Add <label> element to container if option set
	if(opts.addlabel === true) {
		domcontainer.appendChild(this.utils.DOMcreatelabel({
			labelfor : this.transposerangeid,
			labeltext : (opts.labeltext !== undefined) ? opts.labeltext : "Transpose Amount"
		}));
	};

	// Create new <range> element
	var range = this.utils.DOMaddrange({
		id : this.transposerangeid,
		min : -12,
		max : 12,
		step : 1,
		value : this.scalesettings.scaletranspose
	});
    // Append Select to container element
    domcontainer.appendChild(range);

    // Listen for changes
    var self = this;
    range.addEventListener('change', function() {
        // Set transpose amount
        self.settranspose(parseInt(this.value));
    });

    // Return object for chaining
    return this;
};

////////////////////////////////////////////////
// Apply scale to MIDI note and return result //
////////////////////////////////////////////////

TBWMNotequantiser.prototype.applyscale = function(note) {
    // Get octave
    var oct = Math.floor(note / 12);

    // Index of note within octave
    var index = (note + this.scalesettings.scaleshift) % 12;

    // Randomise note-lookup index if threshold set
    if((this.scalesettings.scalerandomise > 0) && (Math.random() <= this.scalesettings.scalerandomise))
        index = Math.round(Math.random() * 11);

    if((this.scalesettings.scaleflatten > 0) && (Math.random() <= this.scalesettings.scaleflatten))
		index = 0;

    // Return note
    return Math.max(Math.min(12 * oct + this.scale[index] + this.scalesettings.scaletranspose, 127), 0);
};

//////////////////////
// Get scales array //
//////////////////////

TBWMNotequantiser.prototype.getscales = function() {
    return this.mpscales;
};

////////////////////////////////////////////////////////////
// Dump scale indices and names to the JavaScript console //
////////////////////////////////////////////////////////////

TBWMNotequantiser.prototype.logscales = function() {
    for(var i = 0; i < this.mpscales.length; i++) {
        console.log(i + ": " + this.mpscales[i]["name"]);
    };
};

////////////////////
// Get scale info //
////////////////////

TBWMNotequantiser.prototype.getscaleinfo = function() {
    // Return current scale info:
    // Scale Index (number) | Scale Name (string) | Scale Notes (array)
    return {index:this.scaleindex, name:this.scalesettings.mpscales[this.scaleindex]["name"], scale:this.scale};
};

///////////////////////////////////////////
// Dump scale info to Javascript console //
///////////////////////////////////////////

TBWMNotequantiser.prototype.logscaleinfo = function() {
    // Return current scale info:
    // Scale Index (number) | Scale Name (string) | Scale Notes (array)
    console.log({index:this.scaleindex, name:this.scalesettings.mpscales[this.scaleindex]["name"], scale:this.scale});
};
