const bcrypt = require("bcryptjs");
const mailer = require("../auth/mailHelper");
const passport = require("passport");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const userQueries = require("../db/queries.user.js");
const Authorizer = require("../policies/user");

module.exports = {
  create(req, res, next) {
    let hashedPassword;
    const authorized = new Authorizer(req.user).create();
    if (!authorized) {
      req.flash("notice", "You are not authorized to do that");
      res.redirect("/");
    } else {
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
          passport.authenticate("local")(req, res, () => {
            req.flash(
              "info",
              "Welcome to Wikix, upgrade your account to use Premiums features!"
            );
            mailer.sendConfirmation(user, mailer.noReplyAddress);
            res.redirect(`/users/profile`);
          });
        })
        .catch(err => {
          console.log(err);
          req.flash("error", err);
          res.redirect("/users/sign_up");
        });
    }
  },
  charge(req, res, next) {
    var wikix_amount = { amount: 15.0, currency: "USD" };
    let amount = wikix_amount.amount * 100;

    stripe.customers
      .create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken
      })
      .then(customer => {
        stripe.charges
          .create({
            amount,
            description: "Premium subscription fee",
            currency: wikix_amount.currency,
            customer: customer.id
          })
          .then(charge => {
            userQueries
              .getUser(req.user.id)
              .then(user => {
                userQueries
                  .updateUser({ role: 1 }, user)
                  .then(user => {
                    req.flash(
                      "info",
                      `Payment of ${wikix_amount.currency} ${
                        wikix_amount.amount
                      } successfully done. Enjoy your Premium account ${
                        user.username
                      }`
                    );
                    res.redirect("/");
                  })
                  .catch(err => {
                    console.log(err);
                    req.flash("error", err);
                    res.redirect(req.headers.referer);
                  });
              })
              .catch(err => {
                console.log(err);
                req.flash("error", err);
                res.redirect(req.headers.referer);
              });
          });
      });
  },
  downgrade(req, res, next) {
    userQueries.getUser(req.user.id).then(user => {
      const authorized = new Authorizer(req.user, user).update();
      if (authorized) {
        userQueries
          .updateUser({ role: 0 }, user)
          .then(user => {
            req.flash("info", "Your account has been successfully downgraded.");
            userQueries.updateUserWikis(req, (err, updatedWikisCount) => {
              if (err) {
                req.flash(err.type, err.message);
                res.redirect("/users/profile");
              } else {
                if (updatedWikisCount) {
                  req.flash(
                    "notice",
                    `All your private wikis have been made public. (Total: ${updatedWikisCount})`
                  );
                }
                res.redirect("/users/profile");
              }
            });
          })
          .catch(err => {
            console.log(err);
            req.flash("error", err);
            res.redirect("/");
          });
      } else {
        req.flash("error", "You are not authorized to do that");
        res.redirect("/users/profile");
      }
    });
  },
  edit(req, res, next) {
    userQueries
      .getUser(req.user.id)
      .then(user => {
        const authorized = new Authorizer(req.user, user).edit();
        if (!authorized) {
          req.flash("error", "You are not authorized to do that");
          res.redirect("/");
        } else {
          res.render("users/edit", { user });
        }
      })
      .catch(err => {
        req.flash("error", err);
        res.redirect("/");
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
        req.flash("info", " You've successfully logged in!");
      }
      res.redirect(req.headers.referer);
    });
  },
  logOut(req, res, next) {
    req.logout();
    req.flash("notice", "You've successfully logged out!");
    res.redirect("/");
  },
  resetPassword(req, res, next) {
    let hashedPassword;
    userQueries
      .getUser(req.user.id)
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
        if (!authorized) throw "You are not authorized to do that";
        userQueries
          .updateUser(hashedPassword, user)
          .then(user => {
            req.logout();
            req.flash(
              "notice",
              "Update successful. Login again with your new password."
            );
            res.redirect("/");
          })
          .catch(err => {
            console.log(err);
            req.flash("error", err);
            res.redirect("/users/profile/edit");
          });
      })
      .catch(err => {
        console.log(err);
        req.flash("error", err);
        res.redirect("/users/profile/edit");
      });
  },
  show(req, res, next) {
    userQueries
      .getUser(req.user.id)
      .then(user => {
        const authorized = new Authorizer(req.user, user).show();
        if (!authorized) {
          req.flash("error", "You are not authorized to do that");
          res.redirect("/");
        }
        res.render("users/show", { user });
      })
      .catch(err => {
        req.flash("error", err);
        res.redirect("/");
      });
  },
  singUp(req, res, next) {
    const authorized = new Authorizer(req.user).signUp();
    if (!authorized) {
      req.flash("notice", "You already own an account");
      res.redirect("/");
    } else {
      res.render("users/sign_up");
    }
  }
};
