const mailer = require("../auth/mailHelper");
const passport = require("passport");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const userQueries = require("../db/queries.user.js");
const Authorizer = require("../policies/user");

module.exports = {
  create(req, res, next) {
    const authorized = new Authorizer(req.user).create();
    if (!authorized) {
      req.flash("notice", "You are not authorized to do that");
      res.redirect("/");
    } else {
      let newUser = {
        username: req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        password: req.body.password,
        passwordConfirmation: req.body.passwordConfirmation
      };

      userQueries.createUser(newUser, (err, user) => {
        if (err) {
          req.flash("error", err);
          res.redirect("/users/sign_up");
        } else {
          passport.authenticate("local")(req, res, () => {
            req.flash(
              "info",
              "Welcome to Wikix, upgrade your account to use Premiums features!"
            );
            mailer.sendConfirmation(newUser, mailer.noReplyAddress);
            res.redirect(`/users/profile`);
          });
        }
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
            userQueries.updateUser({ role: 1 }, req, (err, updatedUser) => {
              if (err) {
                req.flash(err.type, err.message);
                res.redirect(req.headers.referer);
              } else {
                req.flash(
                  "info",
                  `Payment of ${wikix_amount.currency} ${
                    wikix_amount.amount
                  } successfully done. Enjoy your Premium account ${
                    updatedUser.username
                  }`
                );
                res.redirect("/");
              }
            });
          });
      });
  },
  downgrade(req, res, next) {
    userQueries.updateUser({ role: 0 }, req, (err, updatedUser) => {
      if (err) {
        req.flash(err.type, err.message);
        res.redirect(req.headers.referer);
      } else {
        userQueries.updateUserWikis(req, (err, updatedWikisCount) => {
          req.flash("info", "Your account has been successfully downgraded.");
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
      }
    });
  },
  edit(req, res, next) {
    userQueries.getUser(req.user.id, (err, user) => {
      const authorized = new Authorizer(req.user, user).edit();
      if (err) {
        req.flash(err.type, err.message);
        res.redirect("/");
      } else {
        if (!authorized) {
          req.flash("error", "You are not authorized to do that");
          res.redirect("/");
        } else {
          res.render("users/edit", { user });
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
    let updatePassword = {
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };
    userQueries.resetUserPassword(updatePassword, req, (err, user) => {
      if (err) {
        req.flash(err.type, err.message);
        res.redirect("/users/profile/edit");
      } else {
        req.logout();
        req.flash(
          "notice",
          "Update successful. Login again with your new password."
        );
        res.redirect("/");
      }
    });
  },
  show(req, res, next) {
    userQueries.getUser(req.user.id, (err, user) => {
      if (err) {
        req.flash(err.type, err.message);
        res.redirect("/");
      } else {
        const authorized = new Authorizer(req.user, user).show();
        if (!authorized) {
          req.flash("error", "You are not authorized to do that");
          res.redirect("/");
        }
        res.render("users/show", { user });
      }
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
