const LocalStrategy    =require("passport-local").Strategy;
var mysql = require('mysql');
const bcrypt=require("bcrypt");
var dbconfig=require('./database');
var connection=mysql.createConnection(dbconfig.connection);

//var mysql = require('mysql');

  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

//connection.query(dbconfig.database);
module.exports=function(passport)
{
    passport.serializeUser((user,done) => { done(null,user.id);})
    // passport.serializerUser(function(user,done){
    //       done(null,user.id);
    // });
    passport.deserializeUser((id,done) => { 
        connection.query("SELECT * from student WHERE id=?",[id],
        function(err,rows){
            done(err,rows[0]);
        });
    })
    // passport.deserializerUser(function(id,done){
    //      connection.query("SELECT * from student WHERE id=?",[id],
    //      function(err,rows){
    //          done(err,rows[0]);
    //      });
    // });
    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField: 'username',
            passwordField:'password',
            passReqToCallback:true
        },
        function(req,username,password,done){
            connection.query("SELECT * FROM student WHERE username= ? ",
            [username],function(err,rows){
                if(err)
                return done(err)
                if(rows.length){
                    console.log("user already taken");
                    return done(null,false);
                }
                else{
                    var newUserMysql={
                        username:username,
                        studentid:req.body.studentid,
                        name:req.body.fullname,
                        mobile:req.body.mobileno,
                        email:req.body.email,
                        password:bcrypt.hashSync(password,10,null),

                    };
                    var insertQuery="INSERT INTO student (StudentId,username, name, mobile_no, email, password) values(?,?, ?, ?, ?, ?)";

                    connection.query(insertQuery,[newUserMysql.studentid,newUserMysql.username,newUserMysql.name,newUserMysql.mobile,newUserMysql.email,newUserMysql.password],
                        function(err,rows){
                           newUserMysql.id=rows.insertId;

                           return done(null,newUserMysql);
                        });
                }
            }
            )
        }
        )
    );

    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField:'username',
            passwordField:'password',
            passReqToCallback:true

        },
        function(req,username,password,done){
            connection.query("SELECT * from student WHERE username= ? ",[username],
             function(err,rows){
                 if(err)
                 return done(err);
                 if(!rows.length || rows[0].status==0){
                    console.log("no user");
                     return done(null,false);
                 }
                 if(!bcrypt.compareSync(password,rows[0].password))
                 {
                    console.log("wrong password");
                 return done(null,false);
                 }

                 return done(null,rows[0]);
             });
        }
        )

    );

    passport.use(
        'local-adminlogin',
        new LocalStrategy({
            usernameField:'username',
            passwordField:'password',
            passReqToCallback:true

        },
        function(req,username,password,done){
            connection.query("SELECT * from admin WHERE username= ? ",[username],
             function(err,rows){
                 if(err)
                 return done(err);
                 if(!rows.length){
                    console.log("no user");
                     return done(null,false);
                 }
                 if(!bcrypt.compareSync(password,rows[0].password))
                 {
                    console.log("wrong password");
                 return done(null,false);
                 }

                 return done(null,rows[0]);
             });
        }
        )

    );

};