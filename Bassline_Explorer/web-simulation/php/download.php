<?php
if (isset($_GET['f']) && isset($_GET['n'])) {
	require('lib/midi_class_v178/classes/midi.class.php');
	$srcFile = 'tmp/'.basename($_GET['f']);
	$destFilename  = $_GET['n'];
	$midi = new Midi();
	$midi->downloadMidFile($destFilename, $srcFile);
	sleep(60);
	unlink($srcFile);
}
?>
