<?php

/*

    ARGUMENT: thisDay   (in form of YYY-MM-DD )
              userName  (like  jamesladeroute )
    
    SELECT tasks.taskid, tasks.category, tasks.title, elapsed.milliseconds FROM elapsed, tasks, users WHERE  elapsed.day=thisDay AND users.userid=tasks.userid AND users.name = 'jimladeroute' ORDER BY 1,2;
    
    $con = mysqli_connect('localhost', 'my_user', 'my_password', 'my_db');
    if (!$con) {
        echo "Error: Unable to connect to MySQL." .PHP_EOL;
        echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
        echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
        exit;
    }
    
    mysqli_select_db($con, "taskmanager");
    $strSQL = "SELECT tasks.taskid, tasks.category, tasks.title, elapsed.milliseconds FROM elapsed, tasks, users WHERE elapsed.day='" . $thisDay ."' AND users.userid=tasks.userid AND users.name = '". $userName . "' ORDER BY 1,2";
    $result = mysqli_query($con, $strSQL);
    while( $row = mysqli_fetch_array($result)) {
         echo $row['taskid'] . "," . $row['category'] . "," . $row['title'] . "," . $row['elapsed'] ;
    }
    mysqli_close($con);
    

*/
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
