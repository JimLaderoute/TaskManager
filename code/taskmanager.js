 

$("document").ready(function () {
 
    var highestNumber = 1, timePeriod = 1000, timerVar = setTimeout(timeoutCallback, timePeriod);
    var globalEnableSave = false;
    var globalForceSaveData = false;
    var globalUserName = 'jimladeroute';
    var globalShowState = "Visible"; //   Visible|Hidden|Both
    
    
    function convertToMillisec(hr_min_sec) {
        var timearr = hr_min_sec.split(":"), ms = 0;
        
        ms = ms + parseInt(timearr[2], 10) * 1000;             // seconds to milliseconds
        ms = ms + parseInt(timearr[1], 10) * 60 * 1000;        // minutes to milliseconds
        ms = ms + parseInt(timearr[0], 10) * 60 * 60 * 1000;    // hours to milliseconds
        
        return ms;
    }
    
    function millisecToHrMinSec(nMillisec) {
        var nHours = parseInt(nMillisec / (60 * 60 * 1000), 10);
        nMillisec -= (nHours * 60 * 60 * 1000);
        
        var nMin = parseInt(nMillisec / (60 * 1000), 10);
        nMillisec -= (nMin * 60 * 1000);
        
        var nSec = parseInt(nMillisec / 1000, 10);
        
        
        return nHours + ":" + nMin + ":" + nSec;
    }
    
    /*
    ** This is the timer callback function. It fires off at a set interval and
    ** resets itself at the end to fire off at the same interval.
    */
    
    function timeoutCallback() {
        
        var timeChunk = timePeriod, nChecked = 0, totalTimeMs = 0;
        console.log("HighestNumber is " + highestNumber);
        
        if ( globalForceSaveData == true ) {
            saveTaskData( globalUserName, todaysDate() );
            globalForceSaveData = false;
        }
        
        // First we traverse to find out how many toggle buttons are ON
        $("#TaskListing table tr td#Begin input").each(function (index, element) {
            if (element.checked) {
                nChecked++;
            }
            
            var theRow = $(element).parent().parent();              // get the parent row of the checkbox
            var currentvalue = $(theRow).data("millisecs");         // get last stored millisec elapsed time
            totalTimeMs = parseInt(totalTimeMs) + parseInt(currentvalue) ;  // keep track of the total millisecs for all tasks
        });
        
        if (nChecked > 1) {
            timeChunk = timePeriod / nChecked ;            
        } 
        
        if ( nChecked > 0 ) {
            $("input[name=delete]").removeAttr('disabled');
            $("input[name=AddMS]").removeAttr('disabled');
            $("input[name=SubtractMS]").removeAttr('disabled');
        }
        else {
            $("input[name=delete]").attr('disabled','disabled');
            $("input[name=AddMS]").attr('disabled','disabled');
            $("input[name=SubtractMS]").attr('disabled','disabled');
        }
              
        // second traverse to add the timeChunk to each that are turned ON
        changeMS( timeChunk ) ;
        
        timerVar = setTimeout(timeoutCallback, timePeriod); // Restart the timer for the next N seconds 
    }
    
    /*
    ** loadTaskData( userName , searchDay )
    **
    ** This calls the server script to access and return all the rows of
    ** the taskdata owned by username 'forThisUser' and list elapsed time that happened
    ** on 'onThisDay' date.
    */
    
    function loadTaskData( forThisUser, onThisDay ) {
        
        isHidden = 0; // default to showing Not Hidden tasks
        if ( globalShowState == "Hidden" ) {
            isHidden = 1;
        } else if ( globalShowState == "Both" ) {
            isHidden = 3;
        }
        
        /*
        ** NOTE: to set the checked value
        **
        **   $("#showOnlyHidden").prop("checked", true) 
        */
 
        $.ajax({
            url : "taskmanagerGetTasks.php" ,     // server side script
            type : 'GET',                        // NOTE:  type: is an alias for method:  -- you must use method: prior to jQuery 1.9.0
            cache: false, 
            data : {'whichUser' : forThisUser, 'whichDay': onThisDay, 'isHidden' : isHidden },
            dataType : 'json',                   // NOTE:  dataType: is the type of data that you're expecting back from the server
            success : function(json) {
                // Successfully got data
                console.log(json);
                $.each(json, function(i, item) {
                    if(typeof item == 'object') {
                        // taskid category  title elapsed(ms) 
                        addNewRow( false, item['taskid'], forThisUser, item['category'], item['title'], item['isHidden'], item['milliseconds'] );
                    }
                    else {
                        return false;
                    }
                }) // end $.each() loop
            },
            
            
            error: function(err) {
                // Unable to send data
                  console.log(err);
                  // pop up an HTML error window or write to error area jimbo
                
                $('#feedback').html("<b>Error calling the php function</b><br>RESPONSE: " + err.responseText + "<br>STATUS: " + err.status + "<br>statusText: " + err.statusText    );
                
            }
        });  // end of $.ajax
    } // end of getTaskData()

    function saveTaskData( forThisUser, onThisDay ) {
        /*
        ** currently (as of 1/30/2017) the html file includes taskmanager.json file that represents the tasks
        ** and the state of each task (such as elapsed time) for today.
        **
        ** We need to save this task information to a specific DATE file (or databse, etc...) so we can
        ** go backwards in history to see what we have done. Plus, we have to update the taskmanager.json file
        ** in case the user closes the web-application and wants to pick up from where he/she left off. 
        **
        */
        var dataStore = [];
        
        if ( globalEnableSave == false ) {
            return;
        }
        
        /*
        ** Build up the dataStore array with current data in the table
        */
        
        $("#TaskListing table tr").each(function (index, element) {
            
            /*
            ** Get each field of the task and stuff it into an array (JSON format) that we will then save
            */
            elapsed = $(this).data("millisecs"); 
            
            // store each td for each iterated rows
            var tds = $( this ).find( 'td' );
            // .eq(1) is a zero-based, then start with 1 for column no 2
            if ( tds.eq(1).text() == "" ) {
                return true; // this is how to continue to next item in the .each loop
            }
            
            var idClmn = tds.eq(1); // id column
            var catClmn = tds.eq(2);  // category column
            var titClmn = tds.eq(3);  // title column
            var obj = {};

            // getting text
            //console.log( idClmn.text(), catClmn.text(), titClmn.text() );

            // here continue populate data into object or else
            obj.idnum = idClmn.text();
            obj.category = catClmn.text();
            obj.title = titClmn.text();
            obj.milliseconds = elapsed;
            
            // push onto 
            dataStore.push( obj );
            
  
        });
        
       // console.log( JSON.stringify(dataStore));
        $.ajax({
            url : "taskmanagerSaveTasks.php" ,
            type : 'POST',
            cache: false,
            data : {'whichUser' : forThisUser, 'whichDay': onThisDay, 'jsonData' : JSON.stringify(dataStore)  },
            success : function(res) {
                    // Successfully sent data
                  console.log(res);
                var secs = new Date().getTime();
                $('#feedback').html("<b>success calling taskmanagerSaveTasks.php</b><br>RESPONSE: " + secs + " : " + res   );
            },
            error: function(err) {
                // Unable to send data
                  console.log(err);
                  $('#feedback').html("<b>Error calling taskmanagerSaveTasks.php</b><br>RESPONSE: " + err.responseText + "<br>STATUS: " + err.status + "<br>statusText: " + err.statusText    );
            }
        });
        
    }
    
    /*
    ** This function loops thru all of the current tasks and updates their 
    ** percent finished column.
    */
    
    function refreshPercent(  ) {
        var totalTimeMs = 0,  fnumber=0.0, currentvalue = 0, changes = 0;
        
        /*
        ** Get the count of total number of tasks in the table (and how many of the rows have been modified since last saved)
        */
        $("#TaskListing table tr td#Begin input").each(function (index, element) {
           var theRow = $(element).parent().parent();
           currentvalue = $(theRow).data("millisecs");         // get last stored millisec elapsed time
           changes = changes + $(theRow).data("changedSinceLastSave");      // any change made since last save operation
           $(theRow).data( "changedSinceLastSave", 0);                      // clear change counter
           totalTimeMs = totalTimeMs + parseInt(currentvalue) ;   // add to total elapsed time (so we can figure percent per task)
        });

        /*
        ** Now update the percentage column with the new value
        */
        $("#TaskListing table tr td#Begin input").each(function (index, element) {           
            var theRow = $(element).parent().parent();
            var thePercent = $(theRow).children("tr td#Percent:first");
              currentvalue = $(theRow).data("millisecs");
              fnumber = parseInt(currentvalue) / totalTimeMs;
            thePercent.text( (100 * fnumber).toFixed(2));
            

        });
        
        /*
        ** If changes were detected , then we want to save the changes so we don't loose them.
        */
        
        if ( changes > 0 ) {
            saveTaskData( globalUserName, todaysDate() );
        }
    }

    /*
    ** This function adds a new row of task information to the table
    */
    function addNewRow(startTimer, idnum, thisUserName, catstr, titlestr, hiddenValue, elapsed) {
        var ischecked = "", totalTimeMs = 0;
        
        if (startTimer) {
            ischecked = "checked";
        }
        
        visState = "visibleState"; //  hiddenState
        if ( hiddenValue == 1) {
            visState = "hiddenState";
        }
        
        //console.log("calling addNewRow with param idnum=" + idnum );
        
        /*
        ** Every task item has a unique number associated with it.
        ** It's just the highest id number to date plus 1
        */
        if (idnum > highestNumber) {
            highestNumber = idnum;
            console.log( "addNewRow Line 213: idnum is " + idnum)
        }
        
        var timeStr = millisecToHrMinSec(elapsed);  // create a hh:mm:ss string from the elapsed milliseconds

        var tableObj = $("#TaskListing table").append(
            "<tr class=rows id=TaskId>" +
              "<td class=Begin id=Begin><input class=onoff id=onoff" + idnum + " type=checkbox " + ischecked + "></td>" +
              "<td class=Unique id=Unique>" + idnum + "</td>" +
              "<td class=Cat id=Cat contenteditable='true'>" + catstr + "</td>" +
              "<td class=Title id=Title contenteditable='true'>" + titlestr + "</td>" +
              "<td class=Time id=Time ondblclick=\"editElapsedTime(" + idnum + ")\">" + timeStr + "</td>" +
              "<td class=Percent id=Percent>0</td>" +
              "<td class=Hide  id=Hide><input name=HideInput" + idnum + " type=image src=" + visState + ".png height=30 width=30 /></td>" +
              "<td class=Trash id=Trash><input name=TrashInput" + idnum + " type=image src=trashcan.png height=30 width=30 /></td>" +
            "</tr>"
        );
        
         
        storeElapsed( idnum, elapsed ); // store the elapsed time in millisecond units for accuracy
        
        if ( startTimer ) {
            insertRecordIntoDatabase( thisUserName, idnum, catstr, titlestr, elapsed );
        }
        
        if ( elapsed > 0 ) {
            refreshPercent(); // and since we have added a new task, the percentages might be different , so update
        }
        
        // Add a callback function when the user clicks on the TrashCan icon per row
        $("input[name=TrashInput" + idnum + "]").click(function (ev) {
            // input.td.tr 
           $(this).parent().parent().fadeOut(function () {
                removeRecordFromDatabase( idnum ); // this removes the item from the database
                $(this).remove();
            }); // removes the row when user clicks on the trashcan
            
        });
        
        // Add a callback function when the user clicks on the Hide icon per row
        $("input[name=HideInput" + idnum + "]").click(function (ev) {
            // input.td.tr 
            var showStateOption = globalShowState ;      // what is the SHOWING: option set to
            var hiddenState = getVisState( idnum )  ;         // What is the visible state of THIS task
            var newState ;
            switch( hiddenState ) {
                case 0:
                    newState = 1;
                    break;
                case 1:
                    newState = 0;
                    break;
                default:
                    newState = 1;
                    break;
            }
            
            hideRecordFromDatabase( thisUserName, idnum, newState ); // this marks it as hidden in the database but does not delete it

            if ( showStateOption != "Both" ) {
                $(this).parent().parent().fadeOut(function () {
                    $(this).remove(); // this removes the row from the UI
                });
            } else {
                // change the VisibleState icon {@tbd@}
                //"<td class=Hide  id=Hide><input name=HideInput" + idnum + " type=image src=" + visState + ".png height=30 width=30 /></td>" +
                var newSrc ="visibleState.png";
                if ( newState == 1) {
                    newSrc = "hiddenState.png";
                }
                $("input[name=HideInput" + idnum + "]").attr('src', newSrc);
            }
            

        });
        

        
        
    }
    
    function getVisState( idnum ) {
        // returns 0=visible 1=hidden 
        var retState;
        var srcName = $("input[name=HideInput" + idnum + "]").attr('src');
        console.log( "srcName: " + srcName  );
        
        switch( srcName ) {
            case 'visibleState.png':
                retState = 0;  // visible  isHidden=0
                break;
            case 'hiddenState.png':
                retState = 1; //  hidden isHidden=1
                break;
            default:
                retState = 0; // default to visible if we don't know
        }
        
        return retState;
    }
    
    function removeRecordFromDatabase( taskid ) {
        $.ajax({
            url : "taskmanagerDeleteTask.php" ,     // server side script
            type : 'POST',                        // NOTE:  type: is an alias for method:  -- you must use method: prior to jQuery 1.9.0
            cache: false, 
            data : {  'taskid' : taskid },
            success : function(res) {
                // Successfully got data
                $('#feedback').html( res );
                console.log(res);

            },     
            error: function(err) {
                // Unable to send data
                console.log(err);
                $('#feedback').html("<b>Error calling taskmanagerDeleteTask</b><br>RESPONSE: " + err.responseText + "<br>STATUS: " + err.status + "<br>statusText: " + err.statusText    );
            }
        });  // end of $.ajax  
        
    }
    
    /*
    **  Params:
    **      userName : string
    **      taskId : number
    **      newVisState : TINYINT 0,1
    */
    function hideRecordFromDatabase(  userName, taskid, newVisState ) {
        $.ajax({
            url : "taskmanagerHideTask.php" ,     // server side script
            type : 'POST',                        // NOTE:  type: is an alias for method:  -- you must use method: prior to jQuery 1.9.0
            cache: false, 
            data : {  'taskid' : taskid , 'username' : userName, 'visibility' : newVisState },
            success : function(res) {
                // Successfully got data
                $('#feedback').html( res );
                console.log(res);

            },     
            error: function(err) {
                // Unable to send data
                console.log(err);
                $('#feedback').html("<b>Error calling taskmanagerHideTask</b><br>RESPONSE: " + err.responseText + "<br>STATUS: " + err.status + "<br>statusText: " + err.statusText    );
            }
        });  // end of $.ajax  
        
    }

    
    function insertRecordIntoDatabase( userName, newTaskid , newCat, newTitle, newElapsed ) {

        onThisDay = todaysDate() ;

        $.ajax({
            url : "taskmanagerNewTask.php" ,     // server side script
            type : 'POST',                        // NOTE:  type: is an alias for method:  -- you must use method: prior to jQuery 1.9.0
            cache: false, 
            data : { 'username' : userName, 'taskid' : newTaskid, 'category' : newCat,  'title':newTitle, 'elapsed':newElapsed,  'day' : onThisDay },
            success : function(res) {
                // Successfully got data
                $('#feedback').html( res );
                console.log(res);

            },     
            error: function(err) {
                // Unable to send data
                console.log(err);
                $('#feedback').html("<b>Error calling the php function</b><br>RESPONSE: " + err.responseText + "<br>STATUS: " + err.status + "<br>statusText: " + err.statusText    );
            }
        });  // end of $.ajax  

        
      
    } /* insert record into database */


    function newTask(evt) {
        var catstr = $("#CategoryInput").val();
        var titlestr = $("#TitleInput").val();
        var usernamestr = globalUserName ;
        var hiddenValue = 0;  // not hidden
        
        /* Now add a new task to the table */
        addNewRow(true, ( parseInt(highestNumber,10) + 1), usernamestr, catstr, titlestr, hiddenValue, 0);
    }
    
    function changeMS( timeChunk ) {
    
        $("#TaskListing table tr td#Begin input").each(function (index, element) {

            // element is a table-row-td input-checkbox
            // See if the toggle button is checked or not-checked
            if (element.checked) {

                var theRow = $(element).parent().parent();              // get the parent row <tr> of the checkbox-input
                var currentvalue = $(theRow).data("millisecs");         // get last stored millisec elapsed time
                var newvalue = parseInt(currentvalue) + timeChunk;      // add in the time chunk to get new elapsed time
                if ( newvalue < 0 ) {
                    newvalue = 0;
                }
                $(theRow).data("millisecs", newvalue);                  // save back on the object as data to the row
                $(theRow).data("changedSinceLastSave", 1);              // marks this row as changed (ie. updated)

                var theTimer = $(theRow).children("tr td#Time:first");  // get the Time data field and update
                theTimer.text(millisecToHrMinSec(newvalue));

                globalForceSaveData = true;

            }
        });
        
        refreshPercent(); // Updates the percent column for every task in the table
    }
    
    function addTimeFromSel(evt) {
        var nChecked = $('input:checkbox:checked').length;
        if ( nChecked == 0 ) {
            return ;
        }
        changeMS( 1000 * 60 * 60 ) ; // one hour::  1000ms x 60 = 1 minute x 60 = 1 hour
    }
    function subtractTimeFromSel(evt) {
        var nChecked = $('input:checkbox:checked').length;
        if ( nChecked == 0 ) {
            return ;
        }
        changeMS( -1000 * 60 * 60 ) ; // one hour
    }
       
    function removeTasks(evt) {
        /* Find all tasks that are checked-on and delete them */
       
        // count up how many checkboxes are checked
        var nRemoved = $('input:checkbox:checked').length;
        var r = confirm("Are You Sure You Want To Delete?");
        if ( r == true ) {
            
            if ( nRemoved > 0 ) {
                globalForceSaveData = true;
            }

            globalEnableSave = false;


            // This fadeOut happens asynchronously
            jQuery('input:checkbox:checked').parents("tr").fadeOut(function () {

                globalEnableSave = false; 

                var $athis = $(this);
                var $idnum = $athis.data("idnum");

                removeRecordFromDatabase($idnum);

                $(this).remove();

                globalEnableSave = true;

            });

            /*
            ** Disable the Delete button - we only re-enable it when a task's elapsed time is changing
            */
            $("input[name=delete]").attr('disabled','disabled');           
        }


    }
    
    /*
    **  Return's todays date in the format expected by the MySQL database.
    **  YYYY-MM-DD
    */
    function todaysDate() {
        var today = new Date(); 
        var ltoday = today.toLocaleDateString();
        //console.log( ltoday ); // 3/19/2017

        // split string up
        var res = ltoday.split("/");
        var dd = res[1];
        var mm = res[0];   
        var yyyy = res[2];  
        if(dd<10)
        {  
            dd='0'+dd;  
        }   

        if(mm<10)   
        {  
            mm='0'+mm;  
        }
        
        return( yyyy+'-'+mm+'-'+dd );
    }
    
    function showHiddenStateChanged() {
        
    }

    /*
    ** Read the JSON data and display it
    */
    function populate( thisUserName ) {
        globalEnableSave = false;
        
        $("#tm tbody").empty();
        
        loadTaskData( thisUserName, todaysDate() ) ;
        
        globalEnableSave = true;
    }

    populate(globalUserName);
    
    $("#CreateNew").on('click', newTask );      
    $("#RemoveSel").on('click', removeTasks );
    $("#AddMS").on('click', addTimeFromSel );
    $("#SubtractMS").on('click', subtractTimeFromSel ) ;
    $("select").change( function() {
        var str = "";
        $( "select option:selected").each(function() {
            str += $(this).text() ; // if doing multiple selection then add '+ " "' each time
        });
        
        globalShowState = str;
    
        populate(globalUserName);
    });

    /*
    ** The following code causes updates to tasks if the TITLE
    ** string gets modified by the user.
    */
    
    $('body').on('focus', '[contenteditable]', function () {
        var $this = $(this);
        $this.data('before', $this.html());
        console.log( "focus " + $this.html());
        return $this;
    }).on('blur focusout', '[contenteditable]', function() {
          var $this = $(this);
         if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            //alert( "focusout" );
            console.log( "focusout " + $this.html() );
            globalForceSaveData = true; // causes next timer update to save all the data
            return $this;
        }
    });

        
    
});

/*
** Let the client modify the elapsed time information (to fix errors)
** 
** NOTE: this needs to be a global function to work. If it's embedded in the .ready() block, it won't
** be seen and won't get invoked.
*/

function editElapsedTime ( idnum ) {
    // we can popup a dialog box if we wish
    // but for testing just zero out the time

    $("#TaskListing table tr td#Unique").each(function (index, element) {
        
        //console.log( "editElapsedTime " + idnum );
        
        if (element.textContent == idnum) {
            var lastvalue = $(element).parent().data("millisecs");
            $(element).parent().data("millisecs", 0);              //  Update the elapsed time in milliseconds on the row obj
            
            if ( lastvalue != 0) {
                $(element).parent().data("changedSinceLastSave", 1);   //  Mark the item as changed (ie. modified) used to trigger saving data to database
            }
        }
    });
    
}

/*
** Store the elapsed time onto the row (ie. the 'tr' object)
*/
function storeElapsed( idnum, elapsed ) {
    $("#TaskListing table tr td#Unique").each(function (index, element) {
        if (element.textContent == idnum) {
            lastvalue = $(element).parent().data("millisecs");
            $(element).parent().data("millisecs", elapsed);         //  Update the elapsed time in milliseconds on the row obj
            $(element).parent().data("idnum", idnum);               //  set the idnum if we didn't already
            if ( lastvalue != elapsed) {
                $(element).parent().data("changedSinceLastSave", 1);    //  Mark the item as changed (ie. modified) used to trigger saving data to database
            }
        }
    });
}

