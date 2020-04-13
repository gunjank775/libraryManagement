const express =require ("express");
const session   =require('express-session');
const bodyParser=require('body-parser');
const app =express();
const path   =require('path');
const bcrypt=require("bcrypt");
var passport         =require("passport");
var cookieParser=require('cookie-parser')
var flash=   require('connect-flash');

const LocalStrategy    =require("passport-local");
var mysql = require('mysql');
var dbconfig=require('./database');
var connection=mysql.createConnection(dbconfig.connection);

var studentroutes=  require("./routes/student");
var adminroutes=  require("./routes/admin");

app.use(flash());


app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false })); //For body parser
app.use(bodyParser.json());
app.set("view engine","ejs");
  
app.use(session({
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: true,
        cookie: { secure: false }
      }))

app.use(passport.initialize());
app.use(passport.session());


app.use(express.static("public"));
app.use("/static", express.static('./static/'));
app.set('views', './views');
var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));


app.engine('html', require('ejs').renderFile);

app.use(function(req,res,next){
  res.locals.currentUser=req.user;
  // res.locals.error=req.flash("error");
  // res.locals.success=req.flash("success");
  next();
});

app.use(studentroutes);
app.use(adminroutes);


// var connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database:'librarysys'
// });

function print()
{
  var newUserMysql={
    adminemail:'admin@gmail.com',
    name:'gunjan kumar',
    username:'admin',
    password:bcrypt.hashSync('gunjan1997',10,null),

};
var insertQuery="INSERT INTO admin (adminemail, admin_name, username,password) values(?, ?, ?,?)";

connection.query(insertQuery,[newUserMysql.adminemail,newUserMysql.name,newUserMysql.username,newUserMysql.password],
    function(err,rows){
       if(err)
       {
         console.log(err);
       }
       else{
         console.log("created");
       }
    });
}
//print();

app.get('/logout', function(req, res) {
     req.logOut();
           res.redirect('/');
    
  });

 

app.listen(3000,()=>{
  console.log("Server is running")
})