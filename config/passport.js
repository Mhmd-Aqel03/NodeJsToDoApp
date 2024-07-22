const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const User = require('../Model/User')

module.exports = function (passport) {
  passport.use(
    new localStrategy(
      { usernameField: "username" },
      async (username, password, done) => {
        //match user
        try {
          let user = await User.findOne({ username: username });
          if (!user) {
            // req.flash("error", "Email is not registered");
            return done(null, false, { msg: "User is not registered" });
          }
          //Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            // if (err) throw err;

            if (isMatch) return done(null, user);
            else {
            //   req.flash("error_msg", "Email is not registered");

              return done(null, false, {
                msg: "Password does not match email",
              });
            }
          });
        } catch (err) {
          console.log(err);
          return done(err, null);
        }
      }
    )
  );
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      let user = await User.findById(id);
      done(null, user);
    } catch (err) {
      console.log(err);
      done(err, null);
    }
  });
};