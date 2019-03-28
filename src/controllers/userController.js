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
      if(err) {
        req.flash("error", err);
        res.redirect("/users/sign_up");
      } else {
        req.flash("notice", "Your user has been successfully created");
        mailer.sendConfirmation(newUser,mailer.noReplyAddress);
        res.redirect("/");
      }
    })
  }
}