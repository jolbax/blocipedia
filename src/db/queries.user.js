const { User, Wiki } = require("../db/models");

module.exports = {
  createUser(user) {
    return User.create({
      username: user.username,
      email: user.email,
      password: user.password
    });
  },
  getUser(id) {
    return User.findByPk(id, { include: [{ model: Wiki, as: "wikis" }] });
  },
  getUsers() {
    return User.findAll();
  },
  updateUser(updatedUser, user) {
    return user.update(updatedUser, { fields: Object.keys(updatedUser) });
  },
  updateUserWikis(req, callback) {
    return this.getUser(req.user.id)
      .then(user => {
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
      })
      .catch(err => {
        callback(err);
      });
  }
};
