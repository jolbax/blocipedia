const Authorizer = require("../policies/collaborator");
const { Collaborator, User, Wiki } = require("./models");

module.exports = {
  createCollaborator(userId, req, callback) {
    Wiki.findByPk(req.params.wikiId).then(wiki => {
      const authorized = new Authorizer(req.user, wiki).create();
      if (!authorized) {
        callback({
          type: "notice",
          message: "You are not authorized to do that"
        });
      } else {
        Collaborator.findOne({
          where: {
            userId: userId,
            wikiId: req.params.wikiId
          }
        }).then(collaborator => {
          if (!collaborator) {
            Collaborator.create({
              userId: userId,
              wikiId: req.params.wikiId
            })
              .then(collaborator => {
                callback(null, collaborator);
              })
              .catch(err => {
                callback({ type: "error", message: err });
              });
          } else {
            callback({
              type: "error",
              message:
                "There is already a collaborator associated with this user and wiki"
            });
          }
        });
      }
    });
  },
  deleteCollaborator(userId, req, callback) {
    Wiki.findByPk(req.params.wikiId).then(wiki => {
      const authorized = new Authorizer(req.user, wiki).destroy();
      if (!authorized) {
        callback({
          type: "notice",
          message: "You are not authorized to do that"
        });
      } else {
        Collaborator.findOne({
          where: {
            userId: userId,
            wikiId: wiki.id
          }
        }).then(collaborator => {
          if (!collaborator) {
            callback({ type: "error", message: "Collaborator not found" });
          }
          collaborator
            .destroy()
            .then(count => {
              callback(null, count);
            })
            .catch(err => {
              callback({ type: "error", message: err });
            });
        });
      }
    });
  },
  getCollaborators(wikiId, callback) {
    Wiki.findByPk(wikiId, {
      include: [
        {
          model: Collaborator,
          as: "collaborators",
          include: [
            {
              model: User
            }
          ]
        }
      ]
    }).then(wiki => {
      User.findAll()
        .then(users => {
          callback(null, wiki, users);
        })
        .catch(err => {
          callback({ type: "error", message: err });
        });
    });
  }
};
