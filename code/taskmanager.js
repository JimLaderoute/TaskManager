 

$("document").ready(function () {
 
    var highestNumber = 1, timePeriod = 1000, timerVar = setTimeout(timeoutCallback, timePeriod);
    
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
    
    // we are calling this every 5 seconds
    function timeoutCallback() {
        
        var timeChunk = timePeriod, nOn = 0;
        
        // one traverse to find out how many toggle buttons are ON
        $("#TaskListing table tr td#Begin input").each(function (index, element) {
            if (element.checked) {
                nOn++;
            }
        });
        
        if (nOn > 1) {
            timeChunk = timePeriod / nOn ;
        }
        
        
        // second traverse to add the timeChunk to each that are turned ON
        
        $("#TaskListing table tr td#Begin input").each(function (index, element) {

            // element is a table-row-td input-checkbox
            // See if the toggle button is checked or not-checked
            if (element.checked) {
                
                var theRow = $(element).parent().parent();              // get the parent row of the checkbox
                var currentvalue = $(theRow).data("millisecs");          // get last stored millisec elapsed time
                var newvalue = currentvalue + timeChunk;                // add in the time chunk to get new elapsed time
                $(theRow).data("millisecs", newvalue);                   // save back on the object as data to the row

                var theTimer = $(theRow).children("tr td#Time:first");  // get the Time data field and update                
                theTimer.text(millisecToHrMinSec(newvalue));
                
            }
        });
        
        // Restart the timer for the next N seconds 
        timerVar = setTimeout(timeoutCallback, timePeriod);
    }
    
    function storeElapsed( idnum, elapsed ) {
        $("#TaskListing table tr td#Unique").each(function (index, element) {
            if (element.textContent == idnum) {
                $(element).parent().data("millisecs", elapsed);  //  Update the elapsed time in milliseconds on the row obj
            }
        });
    }
    
    function toggleChanged(evt) {
        /*
        if (this.checked == true) {
          $(this).parent().parent().css( "background",  "#eee");
        } else {
          $(this).parent().parent().css("background", "white");
        }
        */
    }
    
    function addNewRow(startTimer, idnum, catstr, titlestr, elapsed) {
        var ischecked = "";
        if (startTimer) {
            ischecked = "checked";
        }
        
        if (idnum > highestNumber) {
            highestNumber = idnum;
        }
        
        var timeStr = millisecToHrMinSec(elapsed);

        var tableObj = $("#TaskListing table").append(
            "<tr class=rows id=TaskId>" +
              "<td id=Begin><input id=onoff type=checkbox " + ischecked + "></td>" +
              "<td id=Unique>" + idnum + "</td>" +
              "<td id=Cat contenteditable='true'>" + catstr + "</td>" +
              "<td id=Title contenteditable='true'>" + titlestr + "</td>" +
              "<td id=Time ondblclick=\"editElapsedTime(" + idnum + ")\">" + timeStr + "</td>" +
              "<td id=Trash><input name=TrashInput" + idnum + " type=image src=trashcan.jpg height=30 width=30 /></td>" +
            "</tr>"
        );
        
        // store the elapsed time in millisecond units for accuracy
        storeElapsed( idnum, elapsed );
       
        // Add a callback function when the user clicks on the TrashCan icon per row
        $("input[name=TrashInput" + idnum + "]").click(function (ev) {
            // input.td.tr 
           $(this).parent().parent().fadeOut(function () {
                $(this).remove();
            }); // removes the row when user clicks on the trashcan
        });
        
        // Add a callback when the Run Start/Stop checkbox value changes
        $("#TaskId #onoff").change(toggleChanged);
        
        
    }


    function newTask(evt) {
        /* get the strings from the Category and Title input text widgets - TBD */
        
        var catstr = $("#CategoryInput").val();
        var titlestr = $("#TitleInput").val();
        /* Now add a new task to the table */
        addNewRow(true, (highestNumber + 1), catstr, titlestr, 0);
    }
       
    function removeTasks(evt) {
        /* Find all tasks that are checked-on and delete them */
        //var c = confirm('Continue with delete?');
        var c = true;
        if (c) {
            jQuery('input:checkbox:checked').parents("tr").fadeOut(function () {
                var $this = $(this);
                $this.remove();
            });
        }
    }

    function populate() {
        //obj = JSON.parse(data);
        var obj = data;
        for (var i=0; i < obj.length; i++) {
            addNewRow( false, obj[i].idnum, obj[i].category , obj[i].title, obj[i].elapsed );
        }
    }

    populate();
    
    $("#CreateNew").on('click', newTask );      
    $("#RemoveSel").on('click', removeTasks );
  
    
    
});

/*
** this needs to be a global function to work. If it's embedded in the .ready() block, it won't
** be seen and won't get invoked.
*/

function editElapsedTime ( idnum ) {
    // we can popup a dialog box if we wish
    // but for testing just zero out the time

    $("#TaskListing table tr td#Unique").each(function (index, element) {
        
        console.log( "editElapsedTime " + idnum );
        
        if (element.textContent == idnum) {
            $(element).parent().data("millisecs", 0);  //  Update the elapsed time in milliseconds on the row obj
        }
    });
    
}
