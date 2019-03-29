const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../db/models").User;
const authHelper = require("../auth/authHelper");
const { Strategy, ExtractJwt } = require("passport-jwt");

module.exports = {
  init(app) {
    // Needed just if passport is used as middleware (Express-based app)
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
      new LocalStrategy(
        {
          usernameField: "email"
        },
        (email, password, done) => {
          User.findOne({
            where: { email }
          })
            .then(user => {
              if (
                !user ||
                !authHelper.comparePassword(password, user.password)
              ) {
                return done(null, false, {
                  message: "Invalid email or password"
                });
              }
              return done(null, user);
            })
            .catch(err => {
              console.log(err);
              done(err);
            });
        }
      )
    );

    // Serialize and deserialize user to and from session
    passport.serializeUser((user, callback) => {
      callback(null, user.id);
    });

    passport.deserializeUser((id, callback) => {
      User.findByPk(id)
        .then(user => {
          callback(null, user);
        })
        .catch(err => {
          callback(err);
        });
    });

    const opts = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.jwtSecret,
    };

    passport.use(
      new Strategy(opts,
        (payload, done) => {
          User.findByPk(payload.id)
          .then(user => {
            if (user) {
              return done(null, user);
            }
            return done(null, false);
          })
          .catch(err => {
            console.log(err);
            return done(err);
          });
        }
      )
    );
  }
};
