var express=require("express");
var router=express.Router();
const bcrypt=require("bcrypt");
var passport         =require("passport");
var mysql = require('mysql');
var dbconfig=require('../database');
var connection=mysql.createConnection(dbconfig.connection);

require('../passportAdmin')(passport);


router.get("/adminlogin",function(req,res){
    res.render('admin/adminlogin');
});

///admin login ////

router.post("/adminlogin", passport.authenticate('local-adminlogin',{
  successRedirect: "/admin/dashboard",
  failureRedirect: "/adminlogin",
  failureFlash: true
}),
function(req,res){
  if(req.body.remember){
    req.session.cookie.maxAge=1000*60*3;

  }
  else{
    req.session.cookie.expires=false;
  }
  res.redirect("/adminlogin");
}
)

////////////////////--------------////////////

/// Dashboard////////

router.get("/admin/dashboard",isLoggedInAdmin,function(req,res){
  var sql1 ="select count(*) AS rowcount1 from book";
  connection.query(sql1,function(err,result){
    if(err)console.log(err);
    else{
      var sql2 ="select count(*) AS rowcount2 from issuedbook";
  connection.query(sql2,[req.user.StudentId,0],function(err,results){
    if(err)console.log(err);
    else{
      var sql3 ="select count(*) AS rowcount3 from issuedbook where RetrunStatus=?";
      connection.query(sql3,[1],function(err,result3){
        if(err) console.log(err);
        else {
           var sql4="select count(*) AS rowcount4 from student";
           connection.query(sql4,function(err,result4){
             if(err) console.log(err);
             else {
              var sql5="select count(*) AS rowcount5 from author";
              connection.query(sql5,function(err,result5){
                if(err) console.log(err);
                else {
                  var sql6="select count(*) AS rowcount6 from category";
                  connection.query(sql6,function(err,result6){
                    if(err)console.log(err)
                    else{
                      res.render('admin/dashboard',{booklisted:result[0].rowcount1,timesbookissued:results[0].rowcount2,
                        timesbookreturned:result3[0].rowcount3,totalstudent:result4[0].rowcount4,
                        totalauthor:result5[0].rowcount5,totalcat:result6[0].rowcount6});
                    }
                  })
                }
              })
             }
           })
        }
      })
    }
  })
    }
  })
  
    
});


//////////---------------//////////////

/// List of register students /////

router.get("/admin/regstudents",isLoggedInAdmin,function(req,res){
  var count=1;
  var sql = "select * from student";
  connection.query(sql, function (err, results) {
    if (err) {
      console.log(err)
    }
    else{
      res.render('admin/regstudents',{results:results,count:count});
    } 
  });
});


//// update regstudents ////


router.post("/admin/regstudents/:id",isLoggedInAdmin,function(req,res){
    var x=req.params.id;
   // console.log(x);
    var sql="select * from student where id=?";
    connection.query(sql,[x], function (err, results) {
        if (err) {
          console.log(err)
        }
        else{
            var status=results[0].status;   
            var sql2 = "UPDATE student set status =? where id=?";
            connection.query(sql2,[1-status,x],function(err,rows){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(rows.affectedRows + " record(s) updated");
                   res.redirect("/admin/regstudents");
                }
            })
             } 
      });
});



//// category
router.get("/admin/addcategory",isLoggedInAdmin,function(req,res){
  res.render('admin/addcategory');
});

router.get("/admin/managecategory",function(req,res){
   var count=1;
    var sql = "select * from category";
    connection.query(sql, function (err, results) {
      if (err) {
        console.log(err)
      }
      else{
        res.render('admin/managecategory',{results:results,count:count});
      } 
    });
  });

  router.get("/admin/editcategory/:id",isLoggedInAdmin,function(req,res){
      var id1=req.params.id;
      var sql="select * from category where id=?";
      connection.query(sql,[id1], function (err, results) {
        if (err) {
          console.log(err)
        }
        else{
            res.render('admin/editcategory',{results:results });
             } 
      });
    
  });


  router.post("/admin/editcategory/:id",isLoggedInAdmin,function(req,res){
   
    var newCategory={
        id1:req.params.id,
        category:req.body.category,
        status:req.body.status
    };

    var sql = "UPDATE category set CategoryName=?, Status =? where id=?";
    connection.query(sql,[newCategory.category,newCategory.status,newCategory.id1],function(err,rows){
        if(err){
            console.log(err);
        }
        else{
            console.log(rows.affectedRows + " record(s) updated");
           res.redirect("/admin/managecategory");
        }
    })
  
});


router.post("/admin/addcategory",isLoggedInAdmin,function(req,res){
    var newCategory={
        category:req.body.category,
        status:req.body.status
    };
    var insertQuery="INSERT INTO category (CategoryName, Status) values(?, ?)";

    connection.query(insertQuery,[newCategory.category,newCategory.status],
        function(err,rows){
            if(err)
            {
                console.log(err);
            }
            else{
                res.redirect("/admin/managecategory");
            }
        });
  });


  router.post("/admin/deletecategory/:id",isLoggedInAdmin,function(req,res){
    var catid=req.params.id;
    var sql="delete  from category where id=?";
    connection.query(sql,[catid],function(err,result){
      if(err)console.log(err);
      else {
        var sql2="delete  from book where Catid=?";
        connection.query(sql2,[catid],function(err,results){
          if(err)
          console.log(err);
          else  res.redirect("/admin/managecategory");
        })
      }
    })
  });

///  author////
router.get("/admin/addauthor",isLoggedInAdmin,function(req,res){
  res.render('admin/addauthor');
});


router.post("/admin/addauthor",isLoggedInAdmin,function(req,res){
    var author=req.body.author;
    var insertQuery="INSERT INTO author (AuthorName) values(?)";

    connection.query(insertQuery,[author],
        function(err,rows){
            if(err)
            {
                console.log(err);
            }
            else{
                res.redirect("/admin/manageauthor");
            }
        });
  });

  router.get("/admin/manageauthor",isLoggedInAdmin,function(req,res){
    var count=1;
    var sql = "select * from author";
    connection.query(sql, function (err, results) {
      if (err) {
        console.log(err)
      }
      else{
        res.render('admin/manageauthor',{results:results,count:count});
      } 
    });
  });


  router.get("/admin/editauthor/:id",isLoggedInAdmin,function(req,res){
    var id1=req.params.id;
    var sql="select * from author where id=?";
    connection.query(sql,[id1], function (err, results) {
      if (err) {
        console.log(err)
      }
      else{
          res.render('admin/editauthor',{results:results });
           } 
    });
  
});

router.post("/admin/editauthor/:id",isLoggedInAdmin,function(req,res){
   
    var newCategory={
        id1:req.params.id,
        author:req.body.author
    };

    var sql = "UPDATE author set AuthorName=? where id=?";
    connection.query(sql,[newCategory.author,newCategory.id1],function(err,rows){
        if(err){
            console.log(err);
        }
        else{
            console.log(rows.affectedRows + " record(s) updated");
           res.redirect("/admin/manageauthor");
        }
    })
  
});


router.post("/admin/deleteauthor/:id",isLoggedInAdmin,function(req,res){
  var idauthor=req.params.id;
  var sql="delete  from author where id=?";
  connection.query(sql,[idauthor],function(err,result){
    if(err)console.log(err);
    else
    {
      var sql2="delete  from book where AuthorId=?";
        connection.query(sql2,[idauthor],function(err,results){
          if(err){
          console.log(err);
          }
          else  {res.redirect("/admin/manageauthor");}
        });
    }
     
  });
});




//////adding book ///

router.get("/admin/addbook",isLoggedInAdmin,function(req,res){
  var sql = "select * from category";
    connection.query(sql, function (err, category) {
      if (err) {
        console.log(err)
      }
      else{
        var sql2 = "select * from author";
      connection.query(sql2, function (err, author) {
      if (err) {
        console.log(err)
      }
      else{
        res.render('admin/addbook',{category:category,author:author});
      } 
    });
      } 
    });
 
});


router.post("/admin/addbook",isLoggedInAdmin,function(req,res){

    var newBook={
      bookname:req.body.bookname,
      catid:req.body.category,
      authorid:req.body.author,
      isbn:req.body.isbn,
      price:req.body.price
  };
  var insertQuery="INSERT INTO book (BookName, Catid, AuthorId, ISBNNumber, BookPrice) values(?, ?, ?, ?, ?)";

  connection.query(insertQuery,[newBook.bookname,newBook.catid,newBook.authorid,newBook.isbn,newBook.price],
      function(err,rows){
        if(err)
        {
          console.log(err);
        }
          else{
            res.redirect("/admin/managebook");
          }
      });
});


router.get("/admin/managebook",isLoggedInAdmin,function(req,res){
  var count=1;
  var sql = "SELECT book.BookName,category.CategoryName,author.AuthorName,book.ISBNNumber,book.BookPrice,book.id as bookid from  book join category on category.id=book.Catid join author on author.id=book.AuthorId";
  connection.query(sql, function (err, results) {
    if (err) {
      console.log(err)
    }
    else{
      res.render('admin/managebook',{results:results,count:count});
    } 
  });
});


router.get("/admin/editbook/:id",isLoggedInAdmin,function(req,res){
  var idbook=req.params.id;
  var sql = "SELECT book.BookName,category.CategoryName,category.id as cid,author.AuthorName,author.id as athrid,book.ISBNNumber,book.BookPrice,book.id as bookid from  book join category on category.id=book.CatId join author on author.id=book.AuthorId where book.id=?";
  connection.query(sql,[idbook], function (err, results) {
    if (err) {
      console.log(err)
    }
    else{
      var sql2 = "select * from category";
      connection.query(sql2, function (err, categories) {
        if (err) {
          console.log(err)
        }
        else{
          var sql3 = "select * from author";
           connection.query(sql3, function (err, authors) {
        if (err) {
        console.log(err)
      }
      else{
        res.render('admin/editbook',{results:results,categories:categories,authors:authors});
      } 
    });
        } 
      });
     
    } 
  });
 });

 router.post("/admin/editbook/:id",isLoggedInAdmin,function(req,res){
 var idbook=req.params.id;
  var updatebook={
    bookname:req.body.bookname,
    catid:req.body.category,
    authorid:req.body.author,
    isbn:req.body.isbn,
    price:req.body.price
  };

  var sql = "UPDATE book set BookName=?,Catid=?,AuthorId=?,ISBNNumber=?,BookPrice=? where id=?";
  connection.query(sql,[updatebook.bookname,updatebook.catid,updatebook.authorid,updatebook.isbn,updatebook.price,idbook],function(err,rows){
      if(err){
          console.log(err);
      }
      else{
          console.log(rows.affectedRows + " record(s) updated");
         res.redirect("/admin/managebook");
      }
  })
  
});


router.post("/admin/deletebook/:id",isLoggedInAdmin,function(req,res){
      var idbook=req.params.id;
      var sql="delete  from book where id=?";
      connection.query(sql,[idbook],function(err,result){
        if(err)console.log(err);
        else res.redirect("/admin/managebook");
      })
});

////issue book///
router.get("/admin/issuebook",isLoggedInAdmin,function(req,res){
  res.render('admin/issuebook.html');
});


router.post("/get_student",isLoggedInAdmin,function(req,res){
     var studentid=req.body.studentid;
     var sql = "select * from student where StudentId=?";
     connection.query(sql,[studentid], function (err, results) {
       if (err) {
         console.log(err);
       }
       else{
        res.send(results);
       } 
     });
    
});

router.post("/get_book",isLoggedInAdmin,function(req,res){
  var isbn=req.body.isbn;
  var sql = "select * from book where ISBNNumber=?";
  connection.query(sql,[isbn], function (err, results) {
    if (err) {
      console.log(err);
    }
    else{
     res.send(results);
    } 
  });
 
});


router.post("/admin/issuebook",isLoggedInAdmin,function(req,res){
    var isbn=req.body.bookid;
    var sql = "select * from book where ISBNNumber=?";
    connection.query(sql,[isbn], function (err, results) {
      if (err) {
        console.log(err);
      }
      else{
        var status=results[0].status;
        var sql2 = "UPDATE book SET status=? where ISBNNumber=?";
        connection.query(sql2,[0,isbn], function (err, result) {
          if (err) throw err;
          console.log(result.affectedRows + " record(s) updated");
        });
         var issuebook={
          bookid:results[0].id,
          studentid:req.body.studentid,
        };

        var insertQuery="INSERT INTO issuedbook (BookId,StudentID) values(?, ?)";
  connection.query(insertQuery,[issuebook.bookid,issuebook.studentid],function(err,rows){
      if(err){
          console.log(err);
      }
      else{
          console.log(rows.affectedRows + " record(s) updated");
          console.log(issuebook.studentid);
          console.log(issuebook.bookid);
          res.redirect("/admin/manageissuebook");
      }
  });
      
      } 
    });
});

router.get("/admin/manageissuebook",isLoggedInAdmin,function(req,res){
  var count=1;
  var sql = "SELECT student.name,book.BookName,book.ISBNNumber,issuedbook.IssuesDate,issuedbook.ReturnDate,issuedbook.id as rid from  issuedbook join student on student.StudentId=issuedbook.StudentId join book on book.id=issuedbook.BookId order by issuedbook.id desc";
  connection.query(sql,function(err,results){
    if(err){
        console.log(err);
    }
    else{
        
      res.render("admin/manageissuedbooks",{results:results,count:count});
    }
});
});

router.get("/admin/updateissuedbook/:id",isLoggedInAdmin,function(req,res){
  var issuedbookid=req.params.id;
 var sql = "SELECT student.name,book.BookName,book.ISBNNumber,issuedbook.IssuesDate,issuedbook.ReturnDate,issuedbook.id as rid,issuedbook.fine,issuedbook.RetrunStatus from  issuedbook join student on student.StudentId=issuedbook.StudentId join book on book.id=issuedbook.BookId where issuedbook.id=?";
 connection.query(sql,[issuedbookid],function(err,results){
   if(err){
     console.log(err);
   }
   else{
    res.render('admin/updateissuedbook',{results:results});
   }
 })   
 
})

router.post("/admin/updateissuedbook/:id",isLoggedInAdmin,function(req,res){
    var issuedbookid=req.params.id;
    var fine=req.body.fine;
    var RetrunStatus=1;
    var sql="update issuedbook set fine=?, RetrunStatus=? where id=?";
     connection.query(sql,[fine,RetrunStatus,issuedbookid],function(err,results){
      if(err)
      console.log(err);
      else res.redirect("/admin/manageissuedbooks");
    })

})

router.get('/logout', function(req, res) {
  req.logOut();
        res.redirect('/adminlogin');
 
});

function isLoggedInAdmin(req,res,next)
{
   if(req.isAuthenticated())
   return next();
   res.redirect('/adminlogin');
}


module.exports =router;