$(document).ready(function(){	
    
    /*show value when change the sidebar */
    
    document.getElementById("range").innerHTML= $('#slidbar').attr('value');
    $('#slidbar').change(function(){
       document.getElementById("range").innerHTML= this.value;
     
    });
    /*submit the grade when click grade buttom*/
    
    $('#grade').click(function(){
        //var gradeValue = $('#range').html();
         var submitby = $('#directory-data').attr('submit-by');
         var assignid = $('.content').attr('assignment');
        $.ajax({
            url: "server/_submission.php",
            data: {action: "submitGrade",gradeValue:$('#range').html(),submitby:submitby,assignid:assignid},
            success: function(data){ 
                if(data == "true"){
                     $('#range').append('<img src ="image/gradeDone.png" width = "28px" hight = "28px" alt="gradedone" title="graded"/>');
                }
                /* do something if grade worng on server side*/
            }
        });
        
    });
    
    
    var uploadHandler = function(event){
         if($('#attachment').val()){
            event.preventDefault();
            var file = document.getElementById('attachment').files[0];
            var fd = new FormData();

            fd.append('action', 'submit');
            fd.append('attachment', file);
            fd.append('course_id', $('.content').attr('course'));
            fd.append('assignment_id', $('.content').attr('assignment'));
            fd.append('submittype', $('.content').attr('submittype'));

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
                if(xhr.readyState == 4){
                    if(xhr.status == 200) {
                        var message = xhr.responseText;
                       //alert(message);
                        if(message == "true"){
                            //refresh the page
                            $('#refresh').trigger('click');
                        }
                    }
                }
            }
            xhr.open('POST', 'server/_submission.php', true);
            xhr.send(fd);
       }
  };	

//fetch directories information for the specified submission
var dirHandler= function(event){
    var courseID = $('.content').attr('course');
    var assignID = $('.content').attr('assignment');
    var submitType = $('.content').attr('submittype');
    var submitBy = $(this).attr('submitby');
    /*add extra attr in order that specify whoes work*/
    $('#directory-data').attr('submit-by',submitBy);
    /* fecth grade value and update the siderbar value */
    $.ajax({
        url:"server/_submission.php",
        data:{action:"getGrade",submitername:submitBy,assignid:assignID},
        async: false,
        success:function(data){
           /*make sure return data is not null*/
           if(data == -1){
               $('#slidbar').attr('value',0);
               $('#range').html("not grade yet");
           }else{
            $('#slidbar').attr('value',data);
            $('#range').html(data);
            }
        }
    });
    
    
    
    
    //send ajax request to get directory information of the submission
    $.ajax({
            url: "server/_submission.php",
            data: {action: "ls", course_id: courseID, assign_id: assignID, submit_type: submitType, submit_by: submitBy},
            async: false,
            success: function(data){

                    var thtml = data;
                    if(data.length ==9 ){
                            thtml = "<p> No submissions found!</p>";

                    }

                    $('#directory-data').html(thtml);

                    //hide all the sub-directories
                    $("span.toggle").next().hide();

                    //add a link nudging animation effect to each link
                    $('#directory-data a, #directory-data span.toggle').hover(function() {
                            $(this).stop().animate( {
                                    fontSize: "17px",
                                    paddingLeft:"10px",
                                    color: "orange"
                            }, 300);
                    }, function() {
                            $(this).stop().animate( {
                                    fontSize: "14px",
                                    paddingLeft: "0",
                                    color: "black"
                            }, 300);
                    });

                    //set the cursor of the toggling span elements
                    $('span.toggle').css("cursor", "pointer");

                    //prepend a plus sign to signify that the sub-direcotry is not expended
                    $('span.toggle').prepend("+ ");

                    //span element is clicked
                    $('span.toggle').click(function(){
                            $(this).next().toggle(1000);

                            //switch the plus to minus sign or vice-versea
                            var v = $(this).html().substring(0, 1);
                            if (v == "+")
                                    $(this).html( "-" + $(this).html().substring(1));
                            else if (v == "-")
                                    $(this).html( "+" + $(this).html().substring(1));
                    });
                     $('a.file').on("click", fileHandler);
            }
        });
};

    //fetch file contents
    var fileHandler = function(){
            var filePath = $(this).attr('path');
            //bind current file to the view comment button
            $('#view-comment').attr('file',filePath);

            //get which lines have comments associated
            var line = new Array();
            $.ajax({
                    url: 'server/_comments.php',
                    data: {action: 'lsall', file: filePath, line: 0},
                    async: false,
                    dataType: 'json',
                    success: function(data){
                            for(var i = 0; i < data.length; i++){
                                    line[i] = data[i];
                            }
                    }
            });

            $.ajax({
                    url: 'server/_submission.php',
                    data: {action: 'file', path: filePath},
                    async: false,
                    success: function(data){
                            result = data;
                            result = result.replace(/</g,"&lt");
                            result = result.replace(/>/g,"&gt");
                            var tstring = "<table>";
                            var array = result.split("\n\r");
                            var j = 0;
                            for(var i = 1 ; i <= array.length; i ++){
                                    tstring += "<tr>" + "<td>" + i + "</td>";
                                    tstring += "<td><pre><a id = 'add-comment' href = '#comment-box' line = '" + i + "' ";

                                    //mark the line which has comments associated with different color
                                    if (i == line[j]){
                                            tstring += "class = 'comment'";
                                            j++;
                                            tstring += ">" + array[i] + "</a>";
                                            //tstring += "<table class = 'comments' id='comment-details-" + i + "'></table>";
                                    }
                                    else {
                                    tstring += ">" + array[i] + "</a>";
                                    }
                                    tstring += "</pre></td></tr>";
                            }
                            tstring += "</table>";
                            $('#file-data').html(tstring);
                    }
            });

            //pop up add comment box when click on the line
            $('a#add-comment').on("click", function(event){
                    var inLine = $(this).attr('line');
                    //set course_id to the pop up box
                    $('input#in-line').attr("value", inLine);

                    //Getting the variable's value from a link 
                    var popupbox = $(this).attr('href');

                    //Fade in the Popup
                    $(popupbox).fadeIn(300);

                    //Set the center alignment padding + border see css style
                    var popMargTop = ($(popupbox).height() + 24) /2; 
                    var popMargLeft = ($(popupbox).width() + 24) / 2; 

                    $(popupbox).css({ 
                            'margin-top' : -popMargTop,
                            'margin-left' : -popMargLeft
                    });

                    // Add the mask to body
                    $('body').append('<div id="mask"></div>');
                    $('#mask').fadeIn(300);

                    $(this).addClass('selected');

                    return false;

            });

            //shows the comments that associated with the line where the mouse hovers
            var mouseEnter = function(event){
                    //query server to get the comments for this line
                    var inline = $(this).attr('line');
                    $.ajax({
                            url: "server/_comments.php",
                            data: {action: "list", file: $('#view-comment').attr('file'), line: $(this).attr('line')},
                            async: false,
                            dataType: 'json',

                            success: function(data){
                                    var thtml = "<tr><th>Line</th><th>Issue</th><th>Suggested Solution</th><th>Severity</th><th>Category</th><th>Raised by</th></tr>";
                                    for(var i = 0; i < data.length; i++){
                                            thtml += "<tr>";
                                            thtml += "<td>" + data[i].line +"</td>";
                                            thtml += "<td>" + data[i].issue +"</td>";
                                            thtml += "<td>" + data[i].solution +"</td>";
                                            thtml += "<td>" + data[i].severity +"</td>";
                                            thtml += "<td>" + data[i].category +"</td>";
                                            thtml += "<td>" + data[i].author +"</td>";
                                            //thtml += "<td><a class='edit'><img src='image/edit.png'/></a></td>";
                                            thtml += "<td><a class='delete'><img src='image/delete.gif' comment='"+data[i].id+"'/></a></td>";
                                            thtml += "</tr>";
                                    }
                                    $('#comment-details').html(thtml);
                                    //$('.comments').css("top", event.pageY+15);
                                    $('#comment-details').css("left", event.pageX-100);
                                    $('#comment-details').css("top", event.pageY-100);
                            }
                    });
            };
            var mouseLeave = function(event){
                    $('#comment-details').css("left", "-999999px");
            };
            //$('a.comment').hover(mouseEnter, mounseLeave);
            $('a.comment').mouseover(mouseEnter);

           /* $('#comment-details').mouseenter(function(event){
                    $('#comment-details').css("left", event.pageX);
                    $('#comment-details').css("top", event.pageY);
            });*/
            $('#comment-details').mouseleave(function(event){
                    $('#comment-details').css("left", "-999999px");
            });

            //add a comment for the specified line
            $('#update').on('click', function(event){
                    var inline = $('#in-line').val();
                    $.ajax({
                            url: 'server/_comments.php',
                            data: {action: 'add', file: $('#view-comment').attr('file'), line: inline,
                            issue: $('#issue').val(), solution: $('#solution').val(), severity: $('#severity').val(),
                            category: $('#category').val()},
                            async: false,
                            success: function(data){
                                    $('a.close').trigger('click');
                                    $('a.selected').addClass('comment');
                                    $('a.selected').removeClass('selected');
                                    $('a.comment').on('hover',mouseEnter);

                            }
                    });
            });

    }; //end of fileHandler

    // When clicking on the button close or the mask layer the popup closed
    $('a.close').live('click', function() { 
            $('#reset').trigger('click');
            $('#mask , .popup-box').fadeOut(300 , function() {
                    $('#mask').remove();  
            }); 

            return false;
    });

    
    $('#view-comment').on("click", function(){
        var fileName = $(this).attr('file');
        if(fileName != "dummy"){
            $.ajax({
                url: 'server/_comments.php',
                data: {action: 'list', file: fileName, line: 0},
                async: false,
                dataType: 'json',
                success: function(data){
                    var thtml = "<tr><th>Line</th><th>Issue</th><th>Suggested Solution</th><th>Severity</th><th>Category</th><th>Raised by</th></tr>";
                    for(var i = 0; i < data.length; i++){
                            thtml += "<tr>";
                             thtml += "<td>" + data[i].line +"</td>";
                            thtml += "<td>" + data[i].issue +"</td>";
                            thtml += "<td>" + data[i].solution +"</td>";
                            thtml += "<td>" + data[i].severity +"</td>";
                            thtml += "<td>" + data[i].category +"</td>";
                            thtml += "<td>" + data[i].author +"</td>";
                            //thtml += "<td><a class='edit'><img src='image/edit.png'/></a></td>";
                            thtml += "<td><a class='delete'><img src='image/delete.gif' comment='"+data[i].id+"'/></a></td>";
                            thtml += "</tr>";
                    }
                    $('#comment-details').html(thtml);
                    //$('.comments').css("top", event.pageY+15);
                    $('#comment-details').css("left", event.pageX-100);
                    $('#comment-details').css("top", event.pageY-100);

                }
          });
        }
        
    });
    
    
    
    //delete the comment for the specified line
    $('#delete').on('click', function(event){
    });

    $('#refresh').on("click", dirHandler);
    $('.submission').on("click", dirHandler);
    $('#upload-submission').on("click", uploadHandler);
    //fetch the updates for submission directory and file whenever the page is refreshed
    $('#refresh').trigger('click');
	
});


