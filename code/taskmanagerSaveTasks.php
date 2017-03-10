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

    $host = "localhost";  // 127.0.0.1 port =  55394 asof 3/9/17
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
    foreach ( $data as $jsonObj ) {
        $taskid  =    $jsonObj->{'idnum'} ;
        $elapsedMS =  $jsonObj->{'elapsed'}; // in milliseconds
        $mystring = $mystring . "=================\r\n" ;
       
        $selStrSQL = <<<SQL1
        SELECT * FROM elapsed AS e, tasks AS t, users AS u 
        WHERE e.day='$safeDay' AND e.taskid=$taskid AND t.taskid=e.taskid
              AND u.name='$safeUser' AND u.userid=t.userid ;
SQL1;
        
/*        
        $strSQL = <<<SQL
        UPDATE elapsed, users, tasks
           SET elapsed=$elapsedMS
           WHERE elapsed.day='$safeDay' AND elapsed.taskid=$taskid AND tasks.taskid=elapsed.taskid
                 AND users.name='$safeUser' AND users.userid=tasks.userid ;
SQL;
*/
        

        $strSQL = "UPDATE elapsed, users, tasks SET elapsed=" . $elapsedMS . " WHERE elapsed.day='" . $safeDay ."' AND elapsed.taskid=" . $taskid . " AND tasks.taskid=elapsed.taskid AND users.name='" . $safeUser . "' AND users.userid=tasks.userid ;" ;
        
  //      $mystring = $mystring . $strSQL . "\r\n" ;

        $result = $db->query( $strSQL );
        if ( $result === false ) {
            echo "Error updating record: " . $db->error ;
            $mystring = $mystring . " error " . $db->error . "\r\n" ;  
        } else {
            echo "Record update successfully affected=" . $db->affected_rows . "\r\n";
            $mystring = $mystring . " success affected=" . $db->affected_rows . "\r\n" ;
        }
    }

$nbytes = file_put_contents( "taskdata.sql.txt" , $mystring );


$db->close();


?>
