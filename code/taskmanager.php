<?php

    $contents = file_get_contents('php://input');
    $data = json_decode( $contents );
	$filename = "taskdata.json";

    $nbytes = file_put_contents( $filename,  "data=".$contents );
    if ( $nbytes === FALSE ) {
		echo "<br>Failed to update $filename file</br>";
	} else {
		echo "<br>Wrote $nbytes bytes to $filename</br>";
	}

?>
