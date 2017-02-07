 

$("document").ready(function () {
 
    var highestNumber = 1, timePeriod = 1000, timerVar = setTimeout(timeoutCallback, timePeriod);
    var globalEnableSave = false;
    var globalForceSaveData = false;

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
            saveTaskData();
            globalForceSaveData = false;
        }
        
        // First we traverse to find out how many toggle buttons are ON
        $("#TaskListing table tr td#Begin input").each(function (index, element) {
            if (element.checked) {
                nChecked++;
            }
            
            var theRow = $(element).parent().parent();              // get the parent row of the checkbox
            var currentvalue = $(theRow).data("millisecs");         // get last stored millisec elapsed time
            totalTimeMs = totalTimeMs + currentvalue ;              // keep track of the total millisecs for all tasks
        });
        
        if (nChecked > 1) {
            timeChunk = timePeriod / nChecked ;
            
        } 
        
        if ( nChecked > 0 ) {
            $("input[name=delete]").removeAttr('disabled');
        }
        else {
            $("input[name=delete]").attr('disabled','disabled');
        }
              
        // second traverse to add the timeChunk to each that are turned ON
        
        $("#TaskListing table tr td#Begin input").each(function (index, element) {

            // element is a table-row-td input-checkbox
            // See if the toggle button is checked or not-checked
            if (element.checked) {
                
                var theRow = $(element).parent().parent();              // get the parent row <tr> of the checkbox-input
                var currentvalue = $(theRow).data("millisecs");         // get last stored millisec elapsed time
                var newvalue = currentvalue + timeChunk;                // add in the time chunk to get new elapsed time
                $(theRow).data("millisecs", newvalue);                  // save back on the object as data to the row
                $(theRow).data("changedSinceLastSave", 1);              // marks this row as changed (ie. updated)
                
                var theTimer = $(theRow).children("tr td#Time:first");  // get the Time data field and update
                theTimer.text(millisecToHrMinSec(newvalue));
                
            }
        });
        
        refreshPercent(); // Updates the percent column for every task in the table
        
        timerVar = setTimeout(timeoutCallback, timePeriod); // Restart the timer for the next N seconds 
    }
    

    function saveTaskData() {
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
            obj.elapsed = elapsed;
            
            // push onto 
            dataStore.push( obj );
            
  
        });
        
       // console.log( JSON.stringify(dataStore));
        $.ajax({
            url : "taskmanager.php" ,
            type : 'POST',
            data : JSON.stringify(dataStore),
            success : function(res) {
                    // Successfully sent data
                  console.log(res);
            },
            error: function(err) {
                // Unable to send data
                  console.log(err);
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
           totalTimeMs = totalTimeMs + currentvalue ;          // add to total elapsed time (so we can figure percent per task)
        });

        /*
        ** Now update the percentage column with the new value
        */
        $("#TaskListing table tr td#Begin input").each(function (index, element) {           
            var theRow = $(element).parent().parent();
            var thePercent = $(theRow).children("tr td#Percent:first");
              currentvalue = $(theRow).data("millisecs");
              fnumber = currentvalue / totalTimeMs;
            thePercent.text( (100 * fnumber).toFixed(2));
            

        });
        
        /*
        ** If changes were detected , then we want to save the changes so we don't loose them.
        */
        
        if ( changes > 0 ) {
            saveTaskData();
        }
    }

    /*
    ** This function adds a new row of task information to the table
    */
    function addNewRow(startTimer, idnum, catstr, titlestr, elapsed) {
        var ischecked = "", totalTimeMs = 0;
        
        if (startTimer) {
            ischecked = "checked";
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
              "<td id=Begin><input id=onoff type=checkbox " + ischecked + "></td>" +
              "<td id=Unique>" + idnum + "</td>" +
              "<td id=Cat contenteditable='true'>" + catstr + "</td>" +
              "<td id=Title contenteditable='true'>" + titlestr + "</td>" +
              "<td id=Time ondblclick=\"editElapsedTime(" + idnum + ")\">" + timeStr + "</td>" +
              "<td id=Percent>0</td>" +
              "<td id=Trash><input name=TrashInput" + idnum + " type=image src=trashcan.jpg height=30 width=30 /></td>" +
            "</tr>"
        );
         
        storeElapsed( idnum, elapsed ); // store the elapsed time in millisecond units for accuracy
        
        if ( elapsed > 0 ) {
            refreshPercent(); // and since we have added a new task, the percentages might be different , so update
        }
        
        // Add a callback function when the user clicks on the TrashCan icon per row
        $("input[name=TrashInput" + idnum + "]").click(function (ev) {
            // input.td.tr 
           $(this).parent().parent().fadeOut(function () {
                $(this).remove();
               globalForceSaveData = true; // next refresh will save the data
            }); // removes the row when user clicks on the trashcan
            
        });
        
        
    }


    function newTask(evt) {
        var catstr = $("#CategoryInput").val();
        var titlestr = $("#TitleInput").val();
        /* Now add a new task to the table */
        addNewRow(true, ( parseInt(highestNumber,10) + 1), catstr, titlestr, 0);
    }
       
    function removeTasks(evt) {
        /* Find all tasks that are checked-on and delete them */
       
        // count up how many checkboxes are checked
        var nRemoved = $('input:checkbox:checked').length;
        if ( nRemoved > 0 ) {
            globalForceSaveData = true;
        }
        
        // This fadeOut happens asynchronously
        jQuery('input:checkbox:checked').parents("tr").fadeOut(function () {
            $(this).remove();
        });

        /*
        ** Disable the Delete button - we only re-enable it when a task's elapsed time is changing
        */
        $("input[name=delete]").attr('disabled','disabled');

    }

    /*
    ** Read the JSON data and display it
    */
    function populate() {
        globalEnableSave = false;
        var obj = data;
        for (var i=0; i < obj.length; i++) {
            addNewRow( false, obj[i].idnum, obj[i].category , obj[i].title, obj[i].elapsed );
        }
        
        globalEnableSave = true;
    }

    populate();
    
    $("#CreateNew").on('click', newTask );      
    $("#RemoveSel").on('click', removeTasks );
 
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
            if ( lastvalue != elapsed) {
                $(element).parent().data("changedSinceLastSave", 1);    //  Mark the item as changed (ie. modified) used to trigger saving data to database
            }
        }
    });
}

