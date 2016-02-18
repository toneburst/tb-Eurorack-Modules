/*
 *
 *
 *
 */

function TBWMSharedfunctions() {
	this.idprefix = "tbwm-ui";
	this.containerclass = this.idprefix;
};

////////////////////////////////
////////////////////////////////
// DOM-Manipulation Functions //
////////////////////////////////
////////////////////////////////

//////////////////////////////////////////
// Check DOM element exists in document //
//////////////////////////////////////////

TBWMSharedfunctions.prototype.DOMcheckelement = function(elementid) {
    // Check element ID passed
    if(elementid) {
        // Test container DOM element exists
        var domelement = document.getElementById(elementid.replace("#", ""));
        if(!domelement) {
            this.DOMelementerror(elementid);
            return null;
        } else {
            return domelement;
        };
    } else {
        this.errordomelement();
        return null;
    };
};

/////////////////////////////////
// Error DOM element not found //
/////////////////////////////////

TBWMSharedfunctions.prototype.DOMelementerror = function(elementid) {
    var eid = (elementid) ? "'" + elementid + "'" : "";
    var error = "Error: Container element " + eid + " not found. You need to specify ID of an existing element (with or without leading '#') when calling this method";
    console.log(error);
 };

///////////////////////////////////////////
// Create <label> element and add to DOM //
///////////////////////////////////////////

TBWMSharedfunctions.prototype.DOMcreatelabel = function(opts) {
	var label = document.createElement("label");
	label.setAttribute("for", opts.labelfor);
	label.innerHTML = opts.labeltext;
	label.setAttribute("class", this.containerclass);
	return label;
};

////////////////////////////////////////
// Create <select> element and return //
////////////////////////////////////////

TBWMSharedfunctions.prototype.DOMaddselect = function(opts) {
	var select = document.createElement("select");
    select.setAttribute("id", opts.id);
	var clss = (opts.selectclass !== undefined) ? opts.selectclass : this.containerclass;
	select.setAttribute("class", clss);
	for(var i = 0; i < opts.options.length; i++) {
        var option = document.createElement("option");
        option.text = opts.options[i].text;
        option.value = opts.options[i].value;
		if(opts.options[i].value === opts.selected)
			option.setAttribute("selected", "selected");
        select.add(option);
    };
	return select;
};

///////////////////////////////////////
// Create <range> element and return //
///////////////////////////////////////

TBWMSharedfunctions.prototype.DOMaddrange = function(opts) {
	var range = document.createElement("input");
    range.setAttribute("id", opts.id);
	var clss = (opts.rangeclass !== undefined) ? opts.rangeclass : this.containerclass;
	range.setAttribute("class", clss);
    range.setAttribute("type", "range");
    range.setAttribute("min", opts.min);
    range.setAttribute("max", opts.max);
    range.setAttribute("step", opts.step);
    range.setAttribute("value", opts.value);
	return range
};

////////////////////////////////////////
// Create <button> element and return //
////////////////////////////////////////

TBWMSharedfunctions.prototype.DOMaddbutton = function(opts) {
	var button = document.createElement("button");
	button.setAttribute("id", opts.id);
	var clss = (opts.buttonclass !== undefined) ? opts.buttonclass : this.containerclass;
	button.setAttribute("class", clss);
	button.innerHTML = opts.text;
	return button;
};

TBWMSharedfunctions.prototype.DOMchangebuttontext = function(opts) {
	opts.button.innerHTML = opts.text;
	return opts.button;
};

///////////////////
///////////////////
// Save / Recall //
///////////////////
///////////////////

// Currently uses cookies. May be better to use localStorage?
// TODO: Look into using localStorage instead of cookies

// Set cookie (don't call directly)
TBWMSharedfunctions.prototype.savesettings = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

// Get cookie (don't call directly)
TBWMSharedfunctions.prototype.getsettings = function(cname) {
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
TBWMSharedfunctions.prototype.deletesettings = function(cname) {
    document.cookie = name + "=expired; Thu, 01 Jan 1970 00:00:01 GMT";
};
