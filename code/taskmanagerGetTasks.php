<?php

/*

    ARGUMENTs: whichUser   ( like  jamesladeroute )
               whichDay   ( in form of YYY-MM-DD )
    
    SELECT tasks.taskid, tasks.category, tasks.title, elapsed.milliseconds FROM elapsed, tasks, users WHERE  elapsed.day=thisDay AND users.userid=tasks.userid AND users.name = 'jimladeroute' ORDER BY 1,2,3;
    
*/

    $whichDay = date('Y-m-d'); // this gets you today's date - but on the server which could be in a different timezone!
    $whichUser = 'anybody';    // there is no anybody user unless one is created in the database ; maybe allow this for testing?

    if(isset($_GET['whichDay'])) {
        $whichDay = $_GET['whichDay'] ;
    }
    
    if(isset($_GET['whichUser'])) {
        $whichUser = $_GET['whichUser'];
    }

    $host = "localhost"; // port =  55394 asof 3/9/17
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

    /*
    ** Get all tasks associated with the user, even if they don't have elapsed time associated with them for today
    ** and store them into a hash table (associative table)
    */
    if ( !($stmt0 = $db->prepare("SELECT t.taskid, t.category, t.title FROM tasks AS t, users AS u WHERE u.userid=t.userid AND u.name=? ORDER BY 1,2,3"))) {
        echo "Prepare stmt0 failed: (" . $db->errno . ") " . $db->error ;
    }


    if ( !$stmt0->bind_param("s",  $whichUser )) {
        echo "Binding parameters stmt0 failed: (" . $stmt0->errno . ") " . $stmt0->error  ;
    }

    /*
    ** This runs the Query
    */
    if ( !$stmt0->execute()) {
        echo "Execute failed: (" . $stmt0->errno . ") " . $stmt0->error  ;
    }


    /*
    ** This gets the results from the Query
    */
    if ( !($res = $stmt0->get_result())) {
        echo "Getting result set from stmt0 failed: (" . $stmt0->errno . ") " . $stmt0->error  ;
    }
        
    /*
    ** And this processes the results, storing the info into an array to be passed to the client
    */
    $data = array();

    for ($row_no = ($res->num_rows - 1); $row_no >= 0; $row_no--) {
        $res->data_seek($row_no);
        $row = $res->fetch_assoc();
        $row['milliseconds'] = 0;
        
        $data[ $row['taskid'] ] = $row ; //  'username', 'taskid', 'category', 'title', 'elapsed', 'day'
    }
    $res->close();


    if ( !($stmt = $db->prepare("SELECT t.taskid, t.category, t.title, e.milliseconds FROM elapsed AS e, tasks AS t, users AS u WHERE e.day=? AND e.taskid=t.taskid AND u.userid=t.userid AND u.name=? ORDER BY 1,2,3"))) {
        echo "Prepare failed: (" . $db->errno . ") " . $db->error ;
    }

    /* 
    ** binding the question marks to actual values with data-types associated with them.
    ** i = int,  d = double,  s = string, b = blob
    ** NOTE: do NOT pass the variables by reference or you will get an error ; some resources say to pass by reference
    */
    if ( !$stmt->bind_param("ss", $whichDay, $whichUser )) {
        echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error  ;
    }

    /*
    ** This runs the Query
    */
    if ( !$stmt->execute()) {
        echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error  ;
    }

    /*
    ** This gets the results from the Query
    */
    if ( !($res = $stmt->get_result())) {
        echo "Getting result set failed: (" . $stmt->errno . ") " . $stmt->error  ;
    }
        
    /*
    ** And this processes the results, storing the info into an array to be passed to the client
    */
    //$data = array();
    for ($row_no = ($res->num_rows - 1); $row_no >= 0; $row_no--) {
        $res->data_seek($row_no);
        $row = $res->fetch_assoc();
        $data[ $row['taskid']]['milliseconds'] = $row['milliseconds'];
    }

    $res->close();
    $db->close();

    /*
    ** The client is expecting json encoded data
    */
    echo json_encode( array_values($data) );


?>
