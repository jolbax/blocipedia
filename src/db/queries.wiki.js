const Authorizer = require("../policies/wiki");
const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;

module.exports = {
  createWiki(req, callback) {
    if (!req.user) {
      req.flash("notice", "You must be signed in to do that");
      res.redirect("/");
    } else {
      if (req.body.private === true) {
        const authorized = new Authorizer(req.user).newPrivate();
        if (!authorized) {
          return callback({ type: "notice", message: "This is a premium feature. Please upgrade your account." })
        }
      }
      return Wiki.create({
        title: req.body.title,
        body: req.body.body,
        private: req.body.private || false,
        userId: req.user.id
      })
        .then(wiki => {
          callback(null, wiki);
        })
        .catch(err => {
          console.log(err);
          callback({ type: "error", message: err });
        });
    }
  },
  destroyWiki(req, callback) {
    if (!req.user) {
      req.flash("notice", "You must be signed in to do that");
      res.redirect("/");
    } else {
      return Wiki.findByPk(req.params.id).then(wiki => {
        if (!wiki) {
          callback({ type: "error", message: "Wiki was not found" });
        }

        let authorized;
        if(wiki.private) {
          authorized = new Authorizer(req.user, wiki).destroyPrivate();

        } else {
          authorized = new Authorizer(req.user, wiki).destroyPublic();
        }

        if (!authorized) {
          callback({type: "notice", message: "You are not authorized to do that"});
        } else {
          wiki
            .destroy()
            .then(res => {
              callback(null, wiki);
            })
            .catch(err => {
              console.log(err);
              callback({type: "error", message: err});
            });
        }
      });
    }
  },
  getAllWikis(callback) {
    return Wiki.findAll({
      include: [{ model: User }]
    })
      .then(wikis => {
        callback(null, wikis);
      })
      .catch(err => {
        console.log(err);
        callback({ type: "error", message: err });
      });
  },
  getWiki(id, callback) {
    return Wiki.findByPk(id, { include: [{ model: User }] })
      .then(wiki => {
        if (!wiki) {
          callback({type: "error", message: "Wiki was not found"});
        }
        callback(null, wiki);
      })
      .catch(err => {
        console.log(err);
        callback({ type: "error", message: err });
      });
  },
  updateWiki(req, callback) {
    if (!req.user) {
      req.flash("notice", "You must be signed in to do that");
      res.redirect("/");
    } else {
      let updatedWiki = {
        title: req.body.title,
        body: req.body.body,
        private: req.body.private || false
      };
      return Wiki.findByPk(req.params.id).then(wiki => {
        if (!wiki) {
          callback({ type: "error", message: "Wiki was not found" });
        }

        let authorized;
        if(wiki.private){
          authorized = new Authorizer(req.user, wiki).updatePrivate();
        } else {
          authorized = new Authorizer(req.user, wiki).updatePublic(updatedWiki) ;

        }

        if (!authorized) {
          callback({ type: "notice", message: "You are not authorized to do that" });
        } else {
          wiki
            .update(updatedWiki, { fields: Object.keys(updatedWiki) })
            .then(() => {
              callback(null, wiki);
            })
            .catch(err => {
              console.log(err);
              callback({ type: "error", message: err });
            });
        }
      });
    }
  }
};
