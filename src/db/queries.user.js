const bcrypt = require("bcryptjs");
const Authorizer = require("../policies/user");
const User = require("../db/models").User;
const Wiki = require("../db/models").Wiki;

module.exports = {
  createUser(user, callback) {
    if (user.password === user.passwordConfirmation) {
      const salt = bcrypt.genSaltSync();
      const hashedPassword = bcrypt.hashSync(user.password, salt);
      return User.create({
        username: user.username,
        email: user.email,
        password: hashedPassword
      })
        .then(user => {
          callback(null, user);
        })
        .catch(err => {
          if (err.name === "SequelizeUniqueConstraintError") {
            callback([
              {
                param: err.errors[0].path,
                msg: "already taken, choose another one."
              }
            ]);
          } else {
            callback(err);
          }
        });
    } else {
      callback("Password confirmation does not match");
    }
  },
  getUser(id, callback) {
    return User.findByPk(id, { include: [{ model: Wiki, as: "wikis" }] })
      .then(user => {
        callback(null, user);
      })
      .catch(err => {
        console.log(err);
        callback({ type: "error", message: err });
      });
  },
  resetUserPassword(updatedPassword, req, callback) {
    if (!req.user) {
      callback({ type: "error", message: "You must be signed in to do that" });
    } else {
      if (updatedPassword.password === updatedPassword.passwordConfirmation) {
        const salt = bcrypt.genSaltSync();
        const hashedPassword = {
          password: bcrypt.hashSync(updatedPassword.password, salt)
        };
        return User.findByPk(req.user.id).then(user => {
          const authorized = new Authorizer(req.user, user).update();
          if (authorized) {
            user
              .update(hashedPassword, {
                fields: Object.keys(hashedPassword)
              })
              .then(user => {
                callback(null, user);
              })
              .catch(err => {
                console.log(err);
                callback({ type: "error", message: err });
              });
          } else {
            callback({
              type: "error",
              message: "You are not authorized to do that"
            });
          }
        });
      } else {
        callback({
          type: "error",
          message: "Password confirmation does not match"
        });
      }
    }
  },
  updateUser(updatedUser, req, callback) {
    if (!req.user) {
      callback({ type: "error", message: "You must be signed in to do that" });
    } else {
      return User.findByPk(req.user.id, {
        include: [{ model: Wiki, as: "wikis" }]
      }).then(user => {
        const authorized = new Authorizer(req.user, user).update();
        if (authorized) {
          user
            .update(updatedUser, {
              fields: Object.keys(updatedUser)
            })
            .then(user => {
              callback(null, user);
            })
            .catch(err => {
              console.log(err);
              callback({ type: "error", message: err });
            });
        } else {
          callback({
            type: "error",
            message: "You are not authorized to do that"
          });
        }
      });
    }
  },
  updateUserWikis(req, callback) {
    return this.getUser(req.user.id, (err, user) => {
      if (err) {
        callback({ type: "error", message: err });
      } else {
        let userPrivateWikis = user.getPrivateWikis();
        if (!userPrivateWikis.length > 0) {
          callback(null, null);
        }
        userPrivateWikis.forEach(privateWiki => {
          privateWiki
            .update({ private: false }, { fields: ["private"] })
            .catch(err => {
              callback({ type: "error", message: err });
            });
        });
        callback(null, userPrivateWikis.length);
      }
    });
  }
};
