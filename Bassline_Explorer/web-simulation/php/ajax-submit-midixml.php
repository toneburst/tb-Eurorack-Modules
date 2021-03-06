<?php
if($_REQUEST["mxml"]) {
    $mxml = urldecode($_REQUEST["mxml"]);
    // Require PHP MIDI class
    require('lib/midi_class_v178/classes/midi.class.php');
    // TMP save directory
    $save_dir = 'tmp/';
    // Random filename string
    srand((double)microtime()*1000000);
    $tmpfile = $save_dir.rand().'.mid';
    // Time-limit
    @set_time_limit (600); # 10 minutes
    // Convert XMP and save MIDI file
    $midi = new Midi();
    $midi->importXml($mxml);
    $midi->saveMidFile($tmpfile, 0666);
    // Download file
    $destfilename  = 'bassline_explorer.mid';
    echo "php/download.php?f=" . urlencode($tmpfile) . "&n=" . urlencode($destfilename);
} else {
    // No post data
    echo "Error: No MIDIXML data received";
};
?>
