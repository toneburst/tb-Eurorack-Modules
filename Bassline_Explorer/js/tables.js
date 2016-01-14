/*
 *
 *
 *
 */

//////////////////////////////////////
// Lookup table for x/y coordinates //
//////////////////////////////////////

// Range 0 - 255. Each index contains array cell index | position within cell
var coordtable = [
    [0,0],[0,4],[0,8],[0,12],[0,16],[0,20],[0,24],[0,28],[0,32],[0,36],[0,40],[0,44],[0,48],[0,52],[0,56],[0,60],
    [0,64],[0,68],[0,72],[0,76],[0,80],[0,84],[0,88],[0,92],[0,96],[0,100],[0,104],[0,108],[0,112],[0,116],[0,120],[0,124],
    [0,128],[0,132],[0,136],[0,140],[0,144],[0,148],[0,152],[0,156],[0,160],[0,164],[0,168],[0,172],[0,176],[0,180],[0,184],[0,188],
    [0,192],[0,196],[0,200],[0,204],[0,208],[0,212],[0,216],[0,220],[0,224],[0,228],[0,232],[0,236],[0,240],[0,244],[0,248],[0,252],
    [1,0],[1,4],[1,8],[1,12],[1,16],[1,20],[1,24],[1,28],[1,32],[1,36],[1,40],[1,44],[1,48],[1,52],[1,56],[1,60],
    [1,64],[1,68],[1,72],[1,76],[1,80],[1,84],[1,88],[1,92],[1,96],[1,100],[1,104],[1,108],[1,112],[1,116],[1,120],[1,124],
    [1,128],[1,132],[1,136],[1,140],[1,144],[1,148],[1,152],[1,156],[1,160],[1,164],[1,168],[1,172],[1,176],[1,180],[1,184],[1,188],
    [1,192],[1,196],[1,200],[1,204],[1,208],[1,212],[1,216],[1,220],[1,224],[1,228],[1,232],[1,236],[1,240],[1,244],[1,248],[1,252],
    [2,0],[2,4],[2,8],[2,12],[2,16],[2,20],[2,24],[2,28],[2,32],[2,36],[2,40],[2,44],[2,48],[2,52],[2,56],[2,60],
    [2,64],[2,68],[2,72],[2,76],[2,80],[2,84],[2,88],[2,92],[2,96],[2,100],[2,104],[2,108],[2,112],[2,116],[2,120],[2,124],
    [2,128],[2,132],[2,136],[2,140],[2,144],[2,148],[2,152],[2,156],[2,160],[2,164],[2,168],[2,172],[2,176],[2,180],[2,184],[2,188],
    [2,192],[2,196],[2,200],[2,204],[2,208],[2,212],[2,216],[2,220],[2,224],[2,228],[2,232],[2,236],[2,240],[2,244],[2,248],[2,252],
    [3,0],[3,4],[3,8],[3,12],[3,16],[3,20],[3,24],[3,28],[3,32],[3,36],[3,40],[3,44],[3,48],[3,52],[3,56],[3,60],
    [3,64],[3,68],[3,72],[3,76],[3,80],[3,84],[3,88],[3,92],[3,96],[3,100],[3,104],[3,108],[3,112],[3,116],[3,120],[3,124],
    [3,128],[3,132],[3,136],[3,140],[3,144],[3,148],[3,152],[3,156],[3,160],[3,164],[3,168],[3,172],[3,176],[3,180],[3,184],[3,188],
    [3,192],[3,196],[3,200],[3,204],[3,208],[3,212],[3,216],[3,220],[3,224],[3,228],[3,232],[3,236],[3,240],[3,244],[3,248],[3,252]
];

//////////////////////////////////////////
// Tables for Note/Octave-randomisation //
//////////////////////////////////////////

var noterandomtable = [8,7,6,5,6,3,1,0,8,10,6,9,8,2,7,3];
var octaverandomtable = [5,1,8,4,5,4,9,10,8,8,9,3,9,7,1,1];
var accentrandomtable = [1,0,1,1,1,0,1,0,1,0,0,1,1,0,0,0];
var sliderandomtable = [1,0,0,0,1,1,0,1,0,1,1,1,0,0,1,0];

// Note-length table
var notelengthtable = [
    0.05,0.06406250000000001,0.078125,0.0921875,0.10625000000000001,0.1203125,0.13437500000000002,0.1484375,0.1625,0.1765625,0.190625,0.20468750000000002,0.21875,0.23281250000000003,0.246875,0.2609375,0.275,0.2890625,0.303125,0.3171875,0.33125,0.3453125,0.359375,0.3734375,0.3875,0.4015625,0.415625,0.4296875,0.44375,0.4578125,0.471875,0.4859375
];

/////////////////
// Note Scales //
/////////////////

var scales = Array();
// Chromatic
scales[0] = [0,1,2,3,4,5,6,7,8,9,10,11];
// Major
scales[1] = [0,0,2,2,4,5,5,7,7,9,9,11];
// Minor
scales[2] = [0,0,2,3,3,5,5,7,8,8,10,10];

////////////////////////
// Control LUT curves //
////////////////////////

// Coordinate table for X/Y (cell index/position)
var coordtableLinear = [
    [0,0],[0,4],[0,8],[0,12],[0,16],[0,20],[0,24],[0,28],[0,32],[0,36],[0,40],[0,44],[0,48],[0,52],[0,56],[0,60],
    [0,64],[0,68],[0,72],[0,76],[0,80],[0,84],[0,88],[0,92],[0,96],[0,100],[0,104],[0,108],[0,112],[0,116],[0,120],[0,124],
    [0,128],[0,132],[0,136],[0,140],[0,144],[0,148],[0,152],[0,156],[0,160],[0,164],[0,168],[0,172],[0,176],[0,180],[0,184],[0,188],
    [0,192],[0,196],[0,200],[0,204],[0,208],[0,212],[0,216],[0,220],[0,224],[0,228],[0,232],[0,236],[0,240],[0,244],[0,248],[0,252],
    [1,0],[1,4],[1,8],[1,12],[1,16],[1,20],[1,24],[1,28],[1,32],[1,36],[1,40],[1,44],[1,48],[1,52],[1,56],[1,60],
    [1,64],[1,68],[1,72],[1,76],[1,80],[1,84],[1,88],[1,92],[1,96],[1,100],[1,104],[1,108],[1,112],[1,116],[1,120],[1,124],
    [1,128],[1,132],[1,136],[1,140],[1,144],[1,148],[1,152],[1,156],[1,160],[1,164],[1,168],[1,172],[1,176],[1,180],[1,184],[1,188],
    [1,192],[1,196],[1,200],[1,204],[1,208],[1,212],[1,216],[1,220],[1,224],[1,228],[1,232],[1,236],[1,240],[1,244],[1,248],[1,252],
    [2,0],[2,4],[2,8],[2,12],[2,16],[2,20],[2,24],[2,28],[2,32],[2,36],[2,40],[2,44],[2,48],[2,52],[2,56],[2,60],
    [2,64],[2,68],[2,72],[2,76],[2,80],[2,84],[2,88],[2,92],[2,96],[2,100],[2,104],[2,108],[2,112],[2,116],[2,120],[2,124],
    [2,128],[2,132],[2,136],[2,140],[2,144],[2,148],[2,152],[2,156],[2,160],[2,164],[2,168],[2,172],[2,176],[2,180],[2,184],[2,188],
    [2,192],[2,196],[2,200],[2,204],[2,208],[2,212],[2,216],[2,220],[2,224],[2,228],[2,232],[2,236],[2,240],[2,244],[2,248],[2,252],
    [3,0],[3,4],[3,8],[3,12],[3,16],[3,20],[3,24],[3,28],[3,32],[3,36],[3,40],[3,44],[3,48],[3,52],[3,56],[3,60],
    [3,64],[3,68],[3,72],[3,76],[3,80],[3,84],[3,88],[3,92],[3,96],[3,100],[3,104],[3,108],[3,112],[3,116],[3,120],[3,124],
    [3,128],[3,132],[3,136],[3,140],[3,144],[3,148],[3,152],[3,156],[3,160],[3,164],[3,168],[3,172],[3,176],[3,180],[3,184],[3,188],
    [3,192],[3,196],[3,200],[3,204],[3,208],[3,212],[3,216],[3,220],[3,224],[3,228],[3,232],[3,236],[3,240],[3,244],[3,248],[3,252]
];

// Ease-In Sine lookup table
var easeinsine256 = [
    0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,
    1,1,2,2,2,2,2,3,3,3,3,4,4,4,4,5,
    5,5,6,6,6,7,7,7,8,8,8,9,9,10,10,11,
    11,11,12,12,13,13,14,14,15,15,16,17,17,18,18,19,
    19,20,21,21,22,23,23,24,25,25,26,27,27,28,29,29,
    30,31,32,32,33,34,35,36,36,37,38,39,40,41,41,42,
    43,44,45,46,47,48,49,49,50,51,52,53,54,55,56,57,
    58,59,60,61,62,63,64,65,66,67,68,70,71,72,73,74,
    75,76,77,78,79,81,82,83,84,85,86,88,89,90,91,92,
    94,95,96,97,99,100,101,102,104,105,106,107,109,110,111,112,
    114,115,116,118,119,120,122,123,124,126,127,128,130,131,133,134,
    135,137,138,139,141,142,144,145,147,148,149,151,152,154,155,157,
    158,159,161,162,164,165,167,168,170,171,173,174,176,177,179,180,
    182,183,185,186,188,189,191,192,194,195,197,198,200,201,203,205,
    206,208,209,211,212,214,215,217,218,220,222,223,225,226,228,229,
    231,232,234,236,237,239,240,242,243,245,247,248,250,251,253,254
];
