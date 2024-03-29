const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const dotenv = require('dotenv');

dotenv.config();

const clientID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

module.exports = (passport) => {
  passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL: '/user/login/callback',
  }, (accessToken, refreshToken, profile, done) => {
    // find if user exists exists
    User.findOne({ email: profile.emails[0].value })
      .then((user) => {
        if (user) {
          // user exists
          return done(null, user);
        }
        const googleEmail = profile.emails[0].value;
        if (googleEmail.substring(googleEmail.length - 11) === '@hawaii.edu') {
          User({
            email: googleEmail,
            displayName: profile.displayName,
            displayPhoto: profile.photos[0].value,
            dateCreated: new Date(),
            deliveryHistory: [],
          }).save()
            .then((err, usr) => done(null, usr));
        } else {
          return done(null);
        }
        return false;
      })
      .catch(err => console.log(err));
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user, err) => {
        done(err, user);
      })
      .catch(err => {
        console.log(err);
      });
  });
};
