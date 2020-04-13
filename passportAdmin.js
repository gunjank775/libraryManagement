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
    passport.deserializeUser((id,done) => { 
        connection.query("SELECT * from admin WHERE id=?",[id],
        function(err,rows){
            done(err,rows[0]);
        });
    })
 
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