<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Bassline Explorer MIDIFile Downloader</title>
		<script src="../js/lib/jquery-2.1.4.min.js"></script>
		<link rel="stylesheet" type="text/css" href="../styles.min.css">
		<script type="text/javascript">
			$(document).ready(function($) {
				$("#downloadbutton").click(function() {
				   $(this).hide();
			   });
			});
		</script>
	</head>
	<body id="midifile-downloader">
		<?php
		if($_POST["midixmlformhidden"]) {
			// Require PHP MIDI class
			require('lib/midi_class_v178/classes/midi.class.php');
			// Decode post data
			$mxml =  urldecode($_POST["midixmlformhidden"]);
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
			//$midi->downloadMidFile($destFilename, $tmpfile);
			// Delete tmp file (not working)
			//sleep(30);
			//unlink($tmpfile);
		} else {
			// No post data
			echo "Error: No MIDIXML data received";
		};
		?>
		<input id="downloadbutton" type="button" name="download" value="Download MIDI File" onclick="self.location.href='download.php?f=<?php echo urlencode($tmpfile)?>&n=<?php echo urlencode($destfilename)?>'" />
	</body>
</html>
