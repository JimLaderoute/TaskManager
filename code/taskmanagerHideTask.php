<?php

    $defaults['taskid'] = 0;
    $defaults['username'] = "noUsername";
    $defaults['visibility'] = 1; // invisible by default  isHidden=1 means invisible, isHidden=0 means visible
   
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

    foreach ( [ 'taskid', 'visibility', 'username' ] as $item ) {
        if( isset($_POST[$item])) {
            $values[$item] = mysqli_real_escape_string( $db, $_POST[$item] ) ;
        } else {
            $values[$item] = $defaults[$item];
        }
    }

    $st0 = "UPDATE tasks, users SET tasks.isHidden=? WHERE tasks.taskid=? AND users.name=? AND users.userid=tasks.userid" ;
    if( !($stmt0 = $db->prepare( $st0 ))) {
        echo "Prepare st0 failed: (" . $db->errno . ") " . $db->error ;
    }
    if ( !$stmt0->bind_param( 'iis', $values['visibility'], $values['taskid'], $values['username'] ) ) {
        echo "Binding parameters failed for stmt0: (" . $stmt0->errno . ") " . $stmt0->error ;        
    }
    if ( !$stmt0->execute() ) {
        echo "Execute failed for stmt0: (" . $stmt0->errno . ") " . $stmt0->error ;
    }

    if ( $db->affected_rows === 0 ) {
        echo "No affected rows for stmt1 - UPDATE tasks, users";
    }
    
    $db->close();


?>
