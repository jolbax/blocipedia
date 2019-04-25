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
    wikiQueries.destroyWiki(req, (err, wiki) => {
      if (err) {
        req.flash(err.type, err.message);
        res.redirect(`/wikis/${req.params.id}`);
      } else {
        req.flash("notice", `Wiki "${wiki.title}" has been deleted`);
        res.redirect(`/wikis/`);
      }
    });
  },
  edit(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err) {
        req.flash(err.type, err.message);
        res.redirect("/wikis");
      } else {
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
      }
    });
  },
  index(req, res, next) {
    wikiQueries.getAllWikis((err, wikis) => {
      if (err) {
        console.log(err);
        req.flash(err.type, err.message);
        res.redirect(500, "/");
      } else {
        res.render("wikis/index", { wikis });
      }
    });
  },
  new(req, res, next) {
    res.render("wikis/new");
  },
  show(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err) {
        req.flash(err.type, err.message);
        res.redirect("/wikis");
      } else {
        if (wiki.private) {
          const authorized = new Authorizer(req.user, wiki).showPrivate();

          if (!authorized) {
            req.flash("notice", "You are not authorized to do that");
            res.redirect("/wikis");
          }
        }
        res.render("wikis/show", { wiki, md });
      }
    });
  },
  update(req, res, next) {
    wikiQueries.updateWiki(req, (err, wiki) => {
      if (err) {
        req.flash(err.type, err.message);
        res.redirect(`/wikis/${req.params.id}/edit`);
      } else {
        res.redirect(`/wikis/${wiki.id}`);
      }
    });
  }
};
