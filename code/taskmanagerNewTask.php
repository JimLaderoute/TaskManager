<?php

    $defaults['username'] =  "noUsername";
    $userid = 0;
    $defaults['taskid'] = 0;
    $defaults['category'] = "noCategory" ;
    $defaults['title'] = "noTitle" ;
    $defaults['elapsed'] = 0;
    $defaults['day'] = date('Y-m-d');  // Today


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

    foreach ( [ 'username', 'taskid', 'category', 'title', 'elapsed', 'day' ] as $item ) {
        if( isset($_POST[$item])) {
            $values[$item] = mysqli_real_escape_string( $db, $_POST[$item] ) ;
        } else {
            $values[$item] = $defaults[$item];
        }
    }


    /*
    **  Get userid given the username
    */
    $st0 = "SELECT userid FROM users WHERE name=? LIMIT 1";
    if( !($stmt0 = $db->prepare( $st0 ))) {
        echo "Prepare st0 failed: (" . $db->errno . ") " . $db->error ;
    }
    if ( !$stmt0->bind_param( 's', $values['username'] ) ) {
        echo "Binding parameters failed for stmt0: (" . $stmt0->errno . ") " . $stmt0->error ;        
    }
    if ( !$stmt0->execute() ) {
        echo "Execute failed for stmt0: (" . $stmt0->errno . ") " . $stmt0->error ;
    }
    if ( !($res = $stmt0->get_result())) {
        echo "Getting result set failed: (" . $stmt0->errno . ") " . $stmt0->error ;
    }
    for ($row_no = ( $res->num_rows - 1); $row_no >= 0; $row_no--) {
        $res->data_seek($row_no);
        $rowInfo = $res->fetch_assoc();
        $userid = $rowInfo['userid'] ;
    }
    $res->close();

    if ( $userid === 0 ) {
        echo "Unable to locate user " . $values['username'] . " in the users table " ;
    }

    /*
    ** REPLACE INTO:  If the record exists, it will be overwritten; if it does not yet exist, it will be created 
    */
    $st1 = "REPLACE INTO tasks (taskid, userid, category, title) VALUES ( ?, ?, ?, ?)";
    if ( !($stmt1 = $db->prepare( $st1 ))) {
        echo "Prepare failed: (" . $db->errno . ") " . $db->error ;
    }
    if ( !$stmt1->bind_param( 'iiss', $values['taskid'], $userid, $values['category'], $values['title'] ) ) {
        echo "Binding parameters failed for stmt1: (" . $stmt1->errno . ") " . $stmt1->error ;        
    }
    if ( !$stmt1->execute() ) {
        echo "Execute failed for stmt1: (" . $stmt1->errno . ") " . $stmt1->error ;
    } else {
        if ( $db->affected_rows === 0 ) {
            echo "No affected rows for stmt1 - REPLACE INTO tasks";
        }
    }

    $st2 = "REPLACE INTO elapsed ( taskid, milliseconds, day) VALUES (?, ?, ?)";
    if ( !($stmt2 = $db->prepare( $st2 ))) {
        echo "Prepare failed: (" . $db->errno . ") " . $db->error ;
    }
    if ( !$stmt2->bind_param( 'iis', $values['taskid'], $values['elapsed'], $values['day'] ) ) {
         echo "Binding parameters failed for stmt2: (" . $stmt2->errno . ") " . $stmt2->error ;       
    }
    if ( !$stmt2->execute() ) {
        echo "Execute failed for stmt2: (" . $stmt2->errno . ") " . $stmt2->error ;
    } else {
        if ( $db->affected_rows === 0 ) {
            echo "No affected rows for stmt2 - REPLACE INTO elapsed";
        }
    }


//$nbytes = file_put_contents( "taskdata.sql.txt" , $mystring );
    $db->close();


?>
