const Authorizer = require("../policies/wiki");
const { Collaborator, User, Wiki } = require("../../src/db/models");

module.exports = {
  createWiki(req) {
    return Wiki.create({
      title: req.body.title,
      body: req.body.body,
      private: req.body.private || false,
      userId: req.user.id
    });
  },
  destroyWiki(wiki) {
    return wiki.destroy();
  },
  getAllWikis(callback) {
    return Wiki.findAll({
      include: [{ model: User }, { model: Collaborator, as: "collaborators" }]
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
    return Wiki.findByPk(id, {
      include: [{ model: Collaborator, as: "collaborators" }]
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
      return Wiki.findByPk(req.params.id, {
        include: [{ model: Collaborator, as: "collaborators" }]
      }).then(wiki => {
        if (!wiki) {
          callback({ type: "error", message: "Wiki was not found" });
        }

        const authorizer = new Authorizer(req.user, wiki);
        let authorized;
        if (wiki.private) {
          authorized = authorizer.updatePrivate();
          if (
            authorizer._isCollaborator() &&
            (!req.body.private || req.body.private == "false")
          ) {
            authorized = false;
          }
        } else {
          authorized = authorizer.updatePublic(updatedWiki);
        }

        if (!authorized) {
          callback({
            type: "notice",
            message: "You are not authorized to do that"
          });
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
