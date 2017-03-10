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

    //  $contents equals  [{"idnum":"1","category":"HOUSEHOLD","title":"DISHES","elapsed":"10000"},{"idnum":"2","category":"HOUSEHOLD","title":"CLEAN FLOORS","elapsed":"10000"}]
    
	$filename = "taskdata.json.save.txt";
    $nbytes = file_put_contents( $filename,  "data=".$contents );

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

    $strSQL = "UPDATE elapsed, users, tasks SET elapsed.elapsed=? WHERE elapsed.day=? AND elapsed.taskid=? AND tasks.taskid=elapsed.taskid AND users.name=? AND users.userid=tasks.userid" ;
    if ( !($stmt = $db->prepare( $strSQL ))) {
        echo "Prepare failed: (" . $db->errno . ") " . $db->error ;
        $mystring = $mystring . " Prepare failed "  . $db->errno . ") " . $db->error . "\r\n";
    }

    foreach ( $data as $jsonObj ) {
        $taskid  =    $jsonObj->{'idnum'} ;
        $elapsedMS =  $jsonObj->{'elapsed'}; // in milliseconds
        $catname =    $jsonObj->{'category'}; 
        $title =   $jsonObj->{'title'};
        
        $mystring = $mystring . "=================\r\n" ;
        $mystring = $mystring . "UPDATE using $taskid, $catname, $title, elapsed=$elapsedMS \r\n" ;

        if ( !$stmt->bind_param( "isis", $elapsedMS,  $safeDay, $taskid, $safeUser ) ) {
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
