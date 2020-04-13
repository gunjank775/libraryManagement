var flag1=0,flag2=0;

function getstudent() {
    jQuery.ajax({
    url: "/get_student",
    data:'studentid='+$("#studentid").val(),
    method: "POST",
    success:function(data){
        if(data.length==0)
        {
            $("#get_student_name").html( "<p style='color:red'> Invaid Student Id. Please Enter Valid Student id .</p>");
            $('#submit').prop('disabled',true);
            flag1=0;
        }
        else{
            data.forEach(function(result){
              if(result.status==0)
              {
                $("#get_student_name").html( "<span style='color:red'> Student ID Blocked </span> <b>Student Name-</b>"+result.name);
                $('#submit').prop('disabled',true);
                flag1=0;
              }
              else{
                $("#get_student_name").html(result.name);
                if(flag2==1)
                $('#submit').prop('disabled',false);
                flag1=1;
              }
            });
        }
    $("#loaderIcon").hide();
    },
    error:function (){}
    });
    }


    function getbook() {
       
        jQuery.ajax({
        url: "/get_book",
        data:'isbn='+$("#bookid").val(),
        method: "POST",
        success:function(data){
            if(data.length==0)
            {
                $('#get_book_name').html("Invalid ISBN Number");
                $('#submit').prop('disabled',true);
                flag2=0;
            }
            else{
                data.forEach(function(result){
                    if(result.status==1){
                    $('#get_book_name').html(result.BookName);
                    if(flag1==1)
                    $('#submit').prop('disabled',false);
                    flag2=1;
                    }
                    else{
                        $('#get_book_name').html("Book Not Available for issue");
                $('#submit').prop('disabled',true);
                flag2=0;
                    }
                  
                });
            }
        $("#loaderIcon").hide();
        },
        error:function (){}
        });
        }
    

