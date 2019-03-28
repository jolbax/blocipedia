const bcrypt = require("bcryptjs");
const User = require("../db/models").User;

module.exports = {
  createUser(user, callback) {
    if(user.password === user.passwordConfirmation){
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
          if (err.name === 'SequelizeUniqueConstraintError') {
            callback([{
              param: err.errors[0].path,
              msg: "already taken, choose another one."
            }]);
          } else {
            callback(err);
          }
        });
    } else {
      callback("Password confirmation does not match");
    }
  }
};
