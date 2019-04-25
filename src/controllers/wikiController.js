const md = require("markdown-it")();
const wikiQueries = require("../db/queries.wiki.js");
const Authorizer = require("../policies/wiki");

module.exports = {
  create(req, res, next) {
    const authorizer = new Authorizer(req.user);
    let authorized;
    if (!req.user) {
      req.flash("notice", "You must be signed in to do that");
      res.redirect("/");
    }

    if (req.body.private == "true") {
      authorized = authorizer.newPrivate();
    } else if (req.body.private == "false" || !req.body.private) {
      authorized = authorizer.newPublic();
    }

    if (!authorized) {
      req.flash(
        "notice",
        "This is a premium feature. Please upgrade your account."
      );
      res.redirect("/");
    } else {
      wikiQueries
        .createWiki(req)
        .then(wiki => {
          res.redirect(`/wikis/${wiki.id}`);
        })
        .catch(err => {
          console.log(err);
          req.flash(err.type, err.message);
          res.redirect("/wikis/new");
        });
    }
  },
  delete(req, res, next) {
    wikiQueries
      .getWiki(req.params.id)
      .then(wiki => {
        const authorizer = new Authorizer(req.user, wiki);
        let authorized;
        if (!wiki) throw "Wiki not found";

        if (wiki.private) {
          authorized = authorizer.destroyPrivate();
        } else {
          authorized = authorizer.destroyPublic();
        }

        if (!authorized) {
          req.flash("notice", "You are not authorized to do that");
          res.redirect(`/wikis/${req.params.id}`);
        } else {
          wikiQueries
            .destroyWiki(wiki)
            .then(() => {
              req.flash("notice", `Wiki "${wiki.title}" has been deleted`);
              res.redirect(`/wikis/`);
            })
            .catch(err => {
              console.log(err);
              req.flash("error", err);
              res.redirect("/");
            });
        }
      })
      .catch(err => {
        console.log(err);
        req.flash("error", err);
        res.redirect("/");
      });
  },
  edit(req, res, next) {
    wikiQueries
      .getWiki(req.params.id)
      .then(wiki => {
        if (!wiki) throw "Wiki not found";
        const authorizer = new Authorizer(req.user, wiki);
        let authorized;
        if (wiki.private) {
          authorized = authorizer.editPrivate();
        } else {
          authorized = authorizer.editPublic();
        }
        if (!authorized) {
          req.flash("notice", "You are not authorized to do that");
          res.redirect(req.headers.referer);
        } else {
          res.render("wikis/edit", { wiki });
        }
      })
      .catch(err => {
        req.flash("error", err);
        res.redirect("/wikis");
      });
  },
  index(req, res, next) {
    wikiQueries
      .getAllWikis()
      .then(wikis => {
        if (!wikis) throw "No wikis found";
        res.render("wikis/index", { wikis });
      })
      .catch(err => {
        console.log(err);
        req.flash("error", err);
        res.redirect(500, "/");
      });
  },
  new(req, res, next) {
    res.render("wikis/new");
  },
  show(req, res, next) {
    wikiQueries
      .getWiki(req.params.id)
      .then(wiki => {
        if (!wiki) throw "Wiki not found";
        if (wiki.private) {
          const authorized = new Authorizer(req.user, wiki).showPrivate();
          if (!authorized) {
            req.flash("notice", "You are not authorized to do that");
            res.redirect("/wikis");
          }
        }
        res.render("wikis/show", { wiki, md });
      })
      .catch(err => {
        req.flash("error", err);
        res.redirect("/wikis");
      });
  },
  update(req, res, next) {
    let updatedWiki = {
      title: req.body.title,
      body: req.body.body,
      private: req.body.private || false
    };
    wikiQueries
      .getWiki(req.params.id)
      .then(wiki => {
        if (!wiki) throw "Wiki not found";
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
          req.flash("notice", "You are not authorized to do that");
          res.redirect(`/wikis/${req.params.id}/edit`);
        } else {
          wikiQueries
            .updateWiki(wiki, updatedWiki)
            .then(wiki => {
              res.redirect(`/wikis/${wiki.id}`);
            })
            .catch(err => {
              console.log(err);
              req.flash("error", err);
              req.redirect("/");
            });
        }
      })
      .catch(err => {
        console.log(err);
        req.flash("error", err);
        req.redirect("/");
      });
  }
};
