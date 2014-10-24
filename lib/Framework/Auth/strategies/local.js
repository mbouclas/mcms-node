module.exports = (function(App,userModel,passport,options){
    var lodash = require('lodash');
    var localStrategy = require('passport-local').Strategy;
    //var flash = require('connect-flash');


    options = lodash.merge({
        loginUrl : '/login',
        successRedirect : '/',
        failureRedirect : '/login',
        passReqToCallback : true,
        failureFlash: true
    },options);

    var handler = options.handlers;
    var settings = {
        passReqToCallback : true,
        failureFlash: true,
        usernameField: App.Config.auth.credentials.usernameField,
        passwordField: App.Config.auth.credentials.passwordField
    };
    passport.use('local', new localStrategy(settings,
        function(req,username, password, done) {
            var lookUp = {};

            lookUp[App.Config.auth.credentials.usernameField] = username;
            lookUp[App.Config.auth.credentials.passwordField] = password;//need to encrypt it first

            handler.findByCredentials(lookUp,function(err,user){

                if (err) {
                    console.log('err : ',err)
                    return done(err)
                }
                if (!user) {
                    return done(null, false, req.flash('message', 'Unknown user ' + username));
                }
                if (user.password != password) {

                    return done(null, false, req.flash('message', 'invalid password'));
                }

                done(null,user);
            });
        }
    ));

/*    passport.manualLogin = function(username,password,callback){
        passport.authenticate('local',function(err, user, info) {

            if (err) {
                console.log('err : ',err)
                return callback(err)
            }
            if (!user) {
                console.log('no user found')
                return callback(null, false, { message: 'Unknown user ' + username });
            }
            if (user.password != password) {
                console.log('wrong pass',user.password, password);
                return callback(null, false, { message: 'Invalid password' });
            }

            callback(null,user);
        })({body : {username:username,password:password}});
    };*/

    passport.middleware.local = function(settings){
        settings = lodash.merge(options,settings);
        return passport.authenticate('local',{
            successRedirect: settings.successRedirect,
            failureRedirect: settings.failureRedirect
        });
    }

});