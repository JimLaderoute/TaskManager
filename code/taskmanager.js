 

$("document").ready(function () {
 
    var number= 1;
    var timerVar = setTimeout( timeoutCallback, 5000);
    
    function convertToMillisec( hr_min_sec ) {
        var timearr = hr_min_sec.split(":");
        var ms = 0;
        
        ms = ms + parseInt(timearr[2]) * 1000;             // seconds to milliseconds
        ms = ms + parseInt(timearr[1]) * 60 * 1000;        // minutes to milliseconds
        ms = ms + parseInt(timearr[0]) * 60 * 60 * 1000;    // hours to milliseconds
        
        return ms;
    }
    
    function millisecToHrMinSec( nMillisec ) {
        var nHours = parseInt( nMillisec / ( 60 * 60 * 1000) );
        nMillisec -= (nHours * 60 * 60 * 1000) ;
        
        var nMin = parseInt( nMillisec / ( 60 * 1000) );
        nMillisec -= (nMin * 60 * 1000);
        
        var nSec = parseInt( nMillisec / 1000 );
        
        return ""+nHours+":"+nMin+":"+nSec+"";
    }
    
    // we are calling this every 5 seconds
    function timeoutCallback () {
        
        // get all checkbox objects
        $("#TaskListing table tr td#Begin input").each(function (index, element) {
            
            var theRow = $(element).parent().parent(); // get the parent row of the checkbox
            var theTimer = $(theRow).children("tr td#Time:first");
            
            // element is a table-row-td input-checkbox
            if (element.checked) {
                // add timeperiod to elapsed (5000 ms)
                var currentvalue = convertToMillisec( theTimer.text() );
                var newvalue = millisecToHrMinSec( currentvalue + 5000 );

                $(theRow).css( "background", "#eee");
                
               // var theTimer = $(theRow).select
                theTimer.text( newvalue );
            } else {
                $(theRow).css("background", "white");
            }
        });
        
        timerVar = setTimeout(timeoutCallback, 5000);
    }
    
    
    function addNewRow (startTimer, catstr, titlestr, elapsed) {
        var ischecked = "";
        if (startTimer) {
            ischecked = "checked";
        }

        $("#TaskListing table").append(
            "<tr class=rows id=TaskId>" +
              "<td id=Begin><input id=onoff type=checkbox " + ischecked + "></td>" +
              "<td id=Cat>" + catstr + "</td>" +
              "<td it=Title>" + titlestr + "</td>" +
              "<td id=Time><p>0:0:0</p></td>" +
              "<td id=Trash ><input name=TrashInput" + number + " type=image src=trashcan.jpg height=30 width=30 /></td>" +
            "</tr>"
        );
        
        $("input[name=TrashInput" + number + "]").click( function (ev) {
           $(this).parent().parent().fadeOut(function () {  
                $(this).remove();
            }); // removes the row
        });
    
        number++;
    }


    function newTask (evt) {
        /* get the strings from the Category and Title input text widgets - TBD */
        
        var catstr = $("#CategoryInput").val();
        var titlestr = $("#TitleInput").val();
        /* Now add a new task to the table */
        addNewRow(true, catstr, titlestr, "0:0:0");
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
        obj = data;
        
        for (var i=0; i < obj.length; i++) {
            addNewRow( false, obj[i].category , obj[i].title, obj[i].elapsed );
        }
//        addNewRow( false, "Category3", "3rd Title String", "0:0:0");

    }

    populate();
    
    $("#CreateNew").on('click', newTask );      
    $("#RemoveSel").on('click', removeTasks );
//    $(":checkbox").change( toggleTimer );
    
})