const mailer = require("../auth/mailHelper");
const passport = require("passport");
const userQueries = require("../db/queries.user.js");

module.exports = {
  singUp(req, res, next) {
    res.render("users/sign_up");
  },
  create(req, res, next) {
    let newUser = {
      username: req.body.username.toLowerCase(),
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    userQueries.createUser(newUser, (err, user) => {
      if (req.originalUrl === "/users/create") {
        if (err) {
          req.flash("error", err);
          res.redirect("/users/sign_up");
        } else {
          req.flash("notice", "Your user has been successfully created");
          mailer.sendConfirmation(newUser, mailer.noReplyAddress);
          res.redirect("/");
        }
      }
      if (req.originalUrl === "/api/users/create") {
        if (err) {
          res.status(500).json({ error: err });
        } else {
          res.status(200).json({ user });
          mailer.sendConfirmation(newUser, mailer.noReplyAddress);
        }
      }
    });
  },
  logIn(req, res, next) {
    passport.authenticate("local", {
      failureRedirect: "/",
      failureFlash: true
    })(req, res, () => {
      if (!req.user) {
        req.flash("error", "Log in failed. Please try again.");
      } else {
        req.flash("notice", " You've successfully logged in!");
      }
      res.redirect(req.headers.referer);
    });
  },
  logOut(req, res, next) {
    req.logout();
    req.flash("notice", "You've successfully logged out!");
    res.redirect(req.headers.referer);
  }
};
