const wikiQueries = require("../db/queries.wiki.js");
const Authorizer = require("../policies/wiki");

module.exports = {
  create(req, res, next) {
    const authorizer = new Authorizer(req.user);
    let authorized;
    if (req.body.private == "true") {
      authorized = authorizer.newPrivate();
    } else if (req.body.private == "false" || !req.body.private) {
      authorized = authorizer.newPublic();
    }

    if (!authorized) {
      res.status(401).json({ message: "You are not authorized to do that" });
    } else {
      wikiQueries
        .createWiki(req)
        .then(wiki => {
          res.status(200).json({ status: "ok", wiki });
        })
        .catch(err => {
          console.log(err);
          res.status(400).json({ error: err });
        });
    }
  },
  delete(req, res, next) {
    wikiQueries
      .getWiki(req.params.id)
      .then(wiki => {
        const authorizer = new Authorizer(req.user, wiki);
        let authorized;
        if (!wiki) {
          res.status(404).json({ message: "Wiki not found" });
          return;
        }
        if (wiki.private) {
          authorized = authorizer.destroyPrivate();
        } else {
          authorized = authorizer.destroyPublic();
        }
        if (!authorized) {
          res
            .status(401)
            .json({ message: "You are not authorized to do that" });
        } else {
          wikiQueries
            .destroyWiki(wiki)
            .then(wiki => {
              res.json({ status: "ok" });
            })
            .catch(err => res.status(400).json({ error: err }));
        }
      })
      .catch(err => {
        console.log(err);
        res.status(400).json({ error: err });
      });
  },
  getAll(req, res, next) {
    wikiQueries
      .getAllWikis()
      .then(wikis => {
        if (!wikis) throw "No wikis found";
        res.status(200).json({ wikis });
      })
      .catch(err => {
        res.status(400).json({ error: err });
      });
  },
  getOne(req, res, next) {
    wikiQueries
      .getWiki(req.params.id)
      .then(wiki => {
        if (!wiki) throw "Wiki not found";
        const authorizer = new Authorizer(req.user, wiki);
        let authorized;
        if (wiki.private) {
          authorized = authorizer.showPrivate();
        } else {
          authorized = authorizer.show();
        }
        if (!authorized) {
          res
            .status(404)
            .json({ message: "You are not authorized to do that" });
        } else {
          res.json({ wiki });
        }
      })
      .catch(err => {
        res.status(400).json({ error: err });
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
          res
            .status(401)
            .json({ message: "You are not authorized to do that" });
        } else {
          wikiQueries
            .updateWiki(wiki, updatedWiki)
            .then(wiki => {
              res.json({ status: "ok", wiki });
            })
            .catch(err => {
              console.log(err);
              res.status(400).json({"error": err});
            });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(400).json({"error": err});
      });
  }
};
