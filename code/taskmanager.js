 

$("document").ready(function () {
 
    var number=1;
    
    function addNewRow (startTimer, catstr, titlestr) {
        var ischecked = "";
        if (startTimer) {
            ischecked = "checked";
        }

        $("#TaskListing table").append(
            "<tr class=rows id=TaskId>" +
              "<td id=Begin><input id=onoff type=checkbox " + ischecked + "></td>" +
              "<td id=Cat>" + catstr + "</td>" +
              "<td it=Title>" + titlestr + "</td>" +
              "<td id=Time>0:0:0</td>" +
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
        addNewRow(true, catstr, titlestr);
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
        
       
        for (var i=0; i < 5; i++) {
            addNewRow( false, "Cat"+i , "Title "+i);
        }
        addNewRow( false, "Category1", "1st Title String");
        addNewRow( false, "Category2", "2nd Title String");    
        addNewRow( false, "Category3", "3rd Title String");

    }

    populate();
    
    $("#CreateNew").on('click', newTask );      
    $("#RemoveSel").on('click', removeTasks );
    
})