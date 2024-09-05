var passport = require('passport');
var User = require('../model/user');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
   
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: "193631796977-kekaduca2ss1l1gndf0ah56imq2qn86k.apps.googleusercontent.com",
    clientSecret : "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",
    callbackURL: "http://localhost:4000/auth/google/callback"
}, (accessToken,refreshToken, profile, next)=>{

    console.log("MyProfile", profile);
    User.findOne({googleId: profile.id}).then((currentUser)=>{
        if(currentUser){
            console.log("User is: ", currentUser);
            next(null, currentUser);
        }else{
            User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id
            }).then((newUser)=>{
                console.log("New User created: ", newUser);
                next(null, newUser);
            }).catch((err)=>{
                console.log("Error creating new user: ", err);
                
            });
        }

    
    })
}))



