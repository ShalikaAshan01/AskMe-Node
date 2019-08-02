const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');

const google ={
    //    option
    clientID:"830237647770-iqh4hk483u64t5do76jd0544g2vs3aia.apps.googleusercontent.com",
    clientSecret:"XmywL2ZJR1gDJOFKaoOecR5o",
    callbackURL:"/users/auth/google/redirect"
};
const facebook={
    //    option
    clientID:"715136948949733",
    clientSecret:"34c90a0a81d838b82fad835a31ddcccc",
    callbackURL:"https://askme-248409.appspot.com/users/auth/facebook/redirect",
    profileFields: ['id', 'emails', 'name']
};



passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(
    new GoogleStrategy(
        google
        ,function (accessToken, refreshToken, profile, cb){
    //    callback
            let user = {
                firstName:profile._json.given_name,
                lastName:profile._json.family_name,
                email:profile._json.email,
            };
            cb(null,user)
        }
    )
);

passport.use(
    new FacebookStrategy(
        facebook
        ,function (accessToken, refreshToken, profile, cb){
            //    callback
            let user = {
                firstName:profile._json.first_name,
                lastName:profile._json.last_name,
                email:profile._json.email,
            };
            cb(null,user)
        }
    )
);