<?php

    $contents = file_get_contents('php://input');
    $data = json_decode( $contents );

    file_put_contents( "taskdata.json",  "data=".$contents );

    echo "<br>done</br>";

?>
