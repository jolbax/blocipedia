const collaboratorQueries = require("../db/queries.collaborator.js");
const userQueries = require("../db/queries.user.js");
const wikiQueries = require("../db/queries.wiki.js");
const Authorizer = require("../policies/collaborator");

module.exports = {
  show(req, res, next) {
    collaboratorQueries
      .getCollaborators(req.params.wikiId)
      .then(wiki => {
        const authorized = new Authorizer(req.user, wiki).show();
        if (!authorized) {
          req.flash("notice", "You are not authorized to do that");
          res.redirect("/");
        } else {
          userQueries
            .getUsers()
            .then(users => {
              res.render("wikis/collaborators", { wiki, users });
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
  },
  create(req, res, next) {
    collaboratorQueries
      .getCollaborator(req.params.userId, req.params.wikiId)
      .then(collaborator => {
        if (collaborator) {
          throw new Error("There is already a collaborator associated with this user and wiki");
        } else {
          wikiQueries
            .getWiki(req.params.wikiId)
            .then(wiki => {
              const authorized = new Authorizer(req.user, wiki).create();
              if (!authorized) {
                req.flash("notice", "You are not authorized to do that");
                res.redirect("/");
              } else {
                collaboratorQueries
                  .createCollaborator(req.params.userId, wiki.id)
                  .then(collaborator => {
                    res.json({status: "ok", collaborator});
                  })
                  .catch(err => console.log(err));
              }
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => {
        console.log(err);
        req.flash("error", err.message);
        res.redirect("/");
      });
  },
  destroy(req, res, next) {
    wikiQueries
      .getWiki(req.params.wikiId)
      .then(wiki => {
        const authorized = new Authorizer(req.user, wiki).destroy();
        if (!authorized) {
          req.flash("notice", "You are not authorized to do that");
          res.redirect("/");
        } else {
          collaboratorQueries.deleteCollaborator(req.params.userId, wiki.id)
          .then(count => {
            res.json({status: "ok", message: `${count} collaborator/s deleted`});
          })
          .catch(err => {
            console.log(err);
          })
        }
      })
      .catch(err => console.log(err));
  }
};
