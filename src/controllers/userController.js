const userQueries = require("../db/queries.user.js");
const mailer = require("../auth/mailHelper");

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
  }
};
