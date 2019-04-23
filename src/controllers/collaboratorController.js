const collaboratorQueries = require("../db/queries.collaborator.js");
const Authorizer = require("../policies/collaborator");

module.exports = {
  show(req, res, next) {
    collaboratorQueries.getCollaborators(
      req.params.wikiId,
      (error, wiki, users) => {
        if (error) {
          console.log(error);
        }
        const authorized = new Authorizer(req.user, wiki).show();
        if (!authorized) {
          req.flash("notice", "You are not authorized to do that");
          res.redirect("/");
        } else {
          res.render("wikis/collaborators", { wiki, users });
        }
      }
    );
  },
  create(req, res, next) {
    collaboratorQueries.createCollaborator(
      req.params.userId,
      req,
      (err, collaborator) => {
        if (err) {
          req.flash(err.type, err.message);
          res.redirect("/");
        } else {
          res.json(collaborator);
        }
      }
    );
  },
  destroy(req, res, next) {
    collaboratorQueries.deleteCollaborator(
      req.params.userId,
      req,
      (err, collaboratorCount) => {
        if (err) {
          req.flash(err.type, err.message);
          res.redirect("/");
        } else {
          res.json(collaboratorCount);
        }
      }
    );
  }
};
