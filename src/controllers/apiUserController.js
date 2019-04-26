const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailer = require("../auth/mailHelper");
const passport = require("passport");
const userQueries = require("../db/queries.user.js");
const Authorizer = require("../policies/user");

module.exports = {
  create(req, res, next) {
    let hashedPassword;
    if (req.body.password === req.body.passwordConfirmation) {
      const salt = bcrypt.genSaltSync();
      hashedPassword = bcrypt.hashSync(req.body.password, salt);
    } else {
      throw "Password does not match confirmation";
    }
    let newUser = {
      username: req.body.username ? req.body.username.toLowerCase() : null,
      email: req.body.email ? req.body.email.toLowerCase() : null,
      password: hashedPassword
    };
    userQueries
      .createUser(newUser)
      .then(user => {
        res.json({ status: "ok", user });
        mailer.sendConfirmation(user, mailer.noReplyAddress);
      })
      .catch(err => {
        res.status(400).json({ error: err });
      });
  },
  apiLogin(req, res, next) {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        message: "Something is not right with your input"
      });
    }

    passport.authenticate("local", { session: false })(req, res, err => {
      if (err) {
        res.status(500).json({ err });
      }
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        process.env.jwtSecret
      );
      return res.status(200).json({ user: req.user.username, token });
    });
  },
  resetPassword(req, res, next) {
    let hashedPassword;
    userQueries
      .getUser(req.params.id)
      .then(user => {
        if (req.body.password === req.body.passwordConfirmation) {
          const salt = bcrypt.genSaltSync();
          hashedPassword = {
            password: bcrypt.hashSync(req.body.password, salt)
          };
        } else {
          throw "Password does not match confirmation";
        }

        const authorized = new Authorizer(req.user, user).update();
        console.log(authorized);
        console.log(req.user);


        if (!authorized) throw "You are not authorized to do that";
        userQueries
          .updateUser(hashedPassword, user)
          .then(user => {
            res.json({ status: "ok" });
          })
          .catch(err => {
            res.json({ status: "failed", message: err });
          });
      })
      .catch(err => {
        console.log(err);
        res.json({ status: "failed", message: err });
      });
  }
};
