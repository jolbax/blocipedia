const wikiQueries = require("../db/queries.wiki.js");

module.exports = {
  create(req, res, next) {
    wikiQueries.createWiki(req, (err, wiki) => {
      if (err) {
        res.status(400).json({ error: err });
      } else {
        res.status(200).json({ wiki });
      }
    });
  },
  delete(req, res, next) {
    wikiQueries.destroyWiki(req, (err, wiki) => {
      if (err || !wiki) {
        res.status(400).json({ error: err });
      } else {
        res.status(200).json({ wiki });
      }
    })
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
