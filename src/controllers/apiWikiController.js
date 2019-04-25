const wikiQueries = require("../db/queries.wiki.js");
const Authorizer = require("../policies/wiki");

module.exports = {
  create(req, res, next) {
    const authorizer = new Authorizer(req.user);
    let authorized;
    if (req.body.private === true) {
      authorized = authorizer.newPrivate();
    } else if (req.body.private === false || !req.body.private) {
      authorized = authorizer.newPublic();
    }
    if (!authorized) {
      res.status(401).json({ message: "You are not authorized to do that" });
    } else {
      wikiQueries
        .createWiki(req)
        .then(wiki => {
          res.status(200).json({ wiki });
        })
        .catch(err => {
          console.log(err);
          res.status(400).json({ error: err });
        });
    }
  },
  delete(req, res, next) {
    wikiQueries.destroyWiki(req, (err, wiki) => {
      if (err || !wiki) {
        res.status(400).json({ error: err });
      } else {
        res.status(200).json({ wiki });
      }
    });
  },
  getAll(req, res, next) {
    wikiQueries.getAllWikis((err, wikis) => {
      if (err || !wikis) {
        res.status(400).json({ error: err });
      } else {
        res.status(200).json({ wikis });
      }
    });
  },
  getOne(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || !wiki) {
        res.status(400).json({ error: err });
      } else {
        res.status(200).json({ wiki });
      }
    });
  },
  update(req, res, next) {
    wikiQueries.updateWiki(req, (err, wiki) => {
      if (err || !wiki) {
        res.status(400).json({ error: err });
      } else {
        res.status(200).json({ wiki });
      }
    });
  }
};
