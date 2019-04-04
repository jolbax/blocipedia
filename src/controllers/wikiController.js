const wikiQueries = require("../db/queries.wiki.js");

module.exports = {
  create(req, res, next) {
    wikiQueries.createWiki(req, (err, wiki) => {
      if (err) {
        req.flash("error", err);
        res.redirect("/wikis/new");
      } else {
        res.redirect(`/wikis/${wiki.id}`);
      }
    });
  },
  delete(req, res, next) {
    wikiQueries.destroyWiki(req, (err, wiki) => {
      if (err) {
        req.flash("error", err);
        res.redirect(`/wikis/${req.params.id}`);
      } else {
        req.flash("notice", `Wiki "${wiki.title}" has been deleted`);
        res.redirect(`/wikis/`);
      }
    })
  },
  edit(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err) {
        req.flash("error", err);
        res.redirect("/wikis");
      } else {
        res.render("wikis/edit", { wiki });
      }
    })
  },
  index(req, res, next) {
    wikiQueries.getAllWikis((err, wikis) => {
      if (err) {
        console.log(err);
        req.flash("error", err);
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
      if(err || !wiki) {
        req.flash("error", "Wiki not found");
        res.redirect("/wikis");
      } else {
        res.render("wikis/show", { wiki });
      }
    })
  },
  update(req, res, next) {
    wikiQueries.updateWiki(req, (err, wiki) => {
      if (err) {
        req.flash("error", err);
        res.redirect(`/wikis/${req.params.id}/edit`);
      } else {
        res.redirect(`/wikis/${wiki.id}`);
      }
    })
  }
};
