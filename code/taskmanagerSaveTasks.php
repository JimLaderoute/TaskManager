<?php

    $whichDay = date('Y-m-d'); // this gets you today's date - but on the server which could be in a different timezone!
    $whichUser = 'anybody';    // there is no anybody user unless one is created in the database ; maybe allow this for testing?
    $data = [];

    if(isset($_POST['whichUser'])) {
        $whichUser = $_POST['whichUser'];
    }

    if(isset($_POST['whichDay'])) {
        $whichDay = $_POST['whichDay'];
    }

    if(isset($_POST['jsonData'])) {
        $contents = $_POST['jsonData'];
        $data = json_decode( $contents );
    }

    //  $contents equals  [{"idnum":"1","category":"HOUSEHOLD","title":"DISHES","milliseconds":"10000"},{"idnum":"2","category":"HOUSEHOLD","title":"CLEAN FLOORS","elapsed":"10000"}]
    
	$filename = "taskdata.json.save.txt";
    $nbytes = file_put_contents( $filename,  "whichDay=" . $whichDay . " data=".$contents );

    $host = "localhost";  // localhost; 127.0.0.1 port =  55394 asof 3/9/17
    $username = "my_user";
    $password = "my_password";
    $database = "taskmanager";

    try {
        $db = new mysqli( $host, $username, $password, $database);
        if ( ! $db ) {
            echo "Error: call to mysqli with $host, $username, $password, $database failed";
            exit;
        }
    }
    catch (Exception $e) {
        echo "Exception Message: " . $e->getMessage();
        exit;
    }

    if ($db->connect_error > 0) {
        die('Unable to connect to database [' . $db->connect_error . ']');
    }

    $safeUser = mysqli_real_escape_string( $db, $whichUser) ;
    $safeDay  =  mysqli_real_escape_string( $db, $whichDay) ;
    $mystring = '';
    $mystring = $mystring . "[$whichUser] , [$whichDay] \r\n";

    /*
    ** Is there an elapsed record for the task that has some milliseconds associated with it? If not, then we have to INSERT a new record for elapsed on this day
    */

    $str0SQL = "SELECT elapsed.elapsedid FROM elapsed, tasks WHERE elapsed.taskid=tasks.taskid AND elapsed.day=? AND tasks.userid=? AND tasks.taskid=?";
    if ( !($stmt0 = $db->prepare( $str0SQL ))) {
        echo "Prepare failed: (" . $db->errno . ") " . $db->error ;
        $mystring = $mystring . " Prepare failed "  . $db->errno . ") " . $db->error . "\r\n";
    }

    $strSQL = "UPDATE elapsed, users, tasks SET elapsed.milliseconds=?, tasks.title=? WHERE elapsed.day=? AND elapsed.taskid=? AND tasks.taskid=elapsed.taskid AND users.name=? AND users.userid=tasks.userid" ;
    if ( !($stmt = $db->prepare( $strSQL ))) {
        echo "Prepare failed: (" . $db->errno . ") " . $db->error ;
        $mystring = $mystring . " Prepare failed "  . $db->errno . ") " . $db->error . "\r\n";
    }

    foreach ( $data as $jsonObj ) {
        $taskid  =    $jsonObj->{'idnum'} ;
        $elapsedMS =  $jsonObj->{'milliseconds'}; // in milliseconds
        $catname =    $jsonObj->{'category'};
        $title =   $jsonObj->{'title'};
        
        $mystring = $mystring . "=================\r\n" ;
        $mystring = $mystring . "UPDATE using $taskid, $catname, $title, milliseconds=$elapsedMS \r\n" ;
        
        if ( $elapsedMS > 0 ) {
            if (!$stmt0->bind_param( "ssi", $safeDay, $safeUser, $taskid )) {
                $mystring = $mystring . " Binding stmt0 parameters failed " . $stmt0->errno . ") " . $stmt0->error . "\r\n" ;
            }
            if ( ! $stmt0->execute()) {
                $mystring = $mystring . "execute stmt0 failed " . $stmt0->errno . ") " . $stmt0->error . "\r\n";
            }
            if ( !($res = $stmt0->get_result())) {
                echo "Getting result for stmt0  failed: (" . $stmt0->errno . ") " . $stmt0->error  ;
            }
            if ( $res->num_rows == 0 ) {
                /* insert new record */
                $insertSQL = "INSERT INTO elapsed (taskid, milliseconds, day) VALUES (?, ?, ?)";
                $mystring = $mystring . " " . $insertSQL . " " . $taskid . "," . $elapsedMS . "," . $whichDay . "\r\n";
                $insertstmt = $db->prepare( $insertSQL );
                $insertstmt->bind_param( "iis", $taskid, $elapsedMS, $whichDay );
                $insertstmt->execute() ;
            }
        }

        if ( !$stmt->bind_param( "issis", $elapsedMS, $title,  $safeDay, $taskid, $safeUser ) ) {
            echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error ;
            $mystring = $mystring . " Binding parameters failed " . $stmt->errno . ") " . $stmt->error . "\r\n" ;
        }
        
        if ( !$stmt->execute()) {
            echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error ;
            $mystring = $mystring . "execute failed " . $stmt->errno . ") " . $stmt->error . "\r\n";
        }
        
       $mystring = $mystring . "  affected_rows=" . $db->affected_rows . "\r\n" ;
        
   
    }

$nbytes = file_put_contents( "taskdata.sql.txt" , $mystring );


$db->close();


?>
