const jwt = require("jsonwebtoken");
const mailer = require("../auth/mailHelper");
const passport = require("passport");
const userQueries = require("../db/queries.user.js");

module.exports = {
  create(req, res, next) {
    let newUser = {
      username: req.body.username ? req.body.username.toLowerCase():null,
      email: req.body.email ? req.body.email.toLowerCase():null,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    userQueries.createUser(newUser, (err, user) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({ user });
        mailer.sendConfirmation(newUser, mailer.noReplyAddress);
      }
    });
  },
  apiLogin(req, res, next) {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        message: "Something is not right with your input"
      });
    }

    passport.authenticate('local', { session: false })(req, res, (err) => {
      if (err) {
        res.status(500).json({ err });
      }
      const token = jwt.sign({ id: req.user.id, email: req.user.email }, process.env.jwtSecret);
      return res.status(200).json({ user: req.user.username, token });
    });
  }
};
