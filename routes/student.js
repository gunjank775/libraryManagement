var express=require("express");
var router=express.Router();
const bcrypt=require("bcrypt");
var passport         =require("passport");
var mysql = require('mysql');
var dbconfig=require('../database');
var connection=mysql.createConnection(dbconfig.connection);

require('../passport')(passport);


router.get("/",redirectDashboard,function(req,res){
    res.render('index');
});

router.get("/usersignup",function(req,res){
   res.render('signup');
});

router.post('/usersignup',passport.authenticate('local-signup',{
 successRedirect: '/userdashboard',
 failureRedirect: '/usersignup',
 failureFlash: true
})
 );

 router.post("/", passport.authenticate('local-login',{
    successRedirect: '/userdashboard',
    failureRedirect: '/',
    failureFlash: true
  }),
     function(req,res){
       if(req.body.remember){
         req.session.cookie.maxAge=1000*60*3;
       }
       else{
         req.session.cookie.expires=false;
       }
       res.redirect("/");
     }
  )

  router.get("/userdashboard",isLoggedIn,function(req,res){
    
    var sql1 ="select count(*) AS rowcount1 from issuedbook where StudentID=?";
    connection.query(sql1,[req.user.StudentId],function(err,result){
      if(err)console.log(err);
      else{
        var sql2 ="select count(*) AS rowcount2 from issuedbook where StudentID=? and RetrunStatus=?";
    connection.query(sql2,[req.user.StudentId,0],function(err,results){
      if(err)console.log(err);
      else{
        res.render('dashboard',{bookissued:result[0].rowcount1,booknotreturned:results[0].rowcount2});
      }
    })
      }
    })

    

   
   
});

router.get("/userprofile",isLoggedIn,function(req,res){
    res.render('userprofile');
});

router.post("/userupdate",isLoggedIn,function(req,res){
  connection.connect(function(err) {
    if (err) throw err;
    var newUserMysql={
      username:req.user.username,
      name:req.body.fullname,
      mobile:req.body.mobileno,
      email:req.body.email
  };
  var sql = "UPDATE student set name =? , mobile_no =? ,email=?  WHERE username = ?";

  var query = connection.query(sql, [newUserMysql.name,newUserMysql.mobile,newUserMysql.email,newUserMysql.username], function(err, result) {
    if (err){
      console.log(err);
      res.redirect("/userdashboard");
     } 
     else{
      console.log(result.affectedRows + " record(s) updated");
      res.redirect("/userprofile");
       }
});
  });
  console.log(req.body.fullname)
});

router.get("/userchangepassword",function(req,res){
    res.render('userchangepassword');
});

router.get("/userissuedbooks",isLoggedIn,function(req,res){
  var count=1;
  var studentid= req.user.StudentId;
 var sql="SELECT book.BookName,book.ISBNNumber,issuedbook.IssuesDate,issuedbook.ReturnDate,issuedbook.id as rid,issuedbook.fine from  issuedbook join student on student.StudentId=issuedbook.StudentId join book on book.id=issuedbook.BookId where student.StudentId=? order by issuedbook.id desc";
 connection.query(sql,[studentid],function(err,results){
   if(err)console.log(err);
   else{ 
     res.render('userissuedbooks',{results:results,count:count}); 
 }
 });
 
   
});

router.get("/userforgotpassword",function(req,res){
    res.render('userforgotpassword');
});


router.get('/logout', function(req, res) {
    req.logOut();
          res.redirect('/');
   
 });

 function redirectDashboard(req,res,next){
   if(req.isAuthenticated()){
     res.redirect("/userdashboard")
   }
   else next();
 }

function isLoggedIn(req,res,next)
{
   if(req.isAuthenticated())
   return next();
   res.redirect('/');
}


module.exports =router;