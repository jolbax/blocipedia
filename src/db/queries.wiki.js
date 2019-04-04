const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;

module.exports = {
  createWiki(req, callback) {
    if (!req.user) {
      req.flash("notice", "You must be signed in to do that");
      res.redirect("/");
    } else {
      return Wiki.create({
        title: req.body.title,
        body: req.body.body,
        private: req.body.private || false,
        userId: req.user.id
      })
        .then(wiki => {
          callback(null, wiki);
        })
        .catch(err => {
          callback(err);
        });
    }
  },
  destroyWiki(req, callback) {
    if(!req.user) {
      req.flash("notice", "You must be signed in to do that");
      res.redirect("/");
    } else {
      return Wiki.findByPk(req.params.id).then(wiki => {
        if(!wiki){
          callback("Wiki not found");
        }
        wiki
          .destroy()
          .then(res => {
            callback(null, wiki);
          })
          .catch(err => {
            callback(err);
          });
      });
    }
  },
  getAllWikis(callback) {
    return Wiki.findAll({
      include: [{ model: User }]
    })
      .then(wikis => {
        callback(null, wikis);
      })
      .catch(err => {
        callback(err);
      });
  },
  getWiki(id, callback) {
    return Wiki.findByPk(id, { include: [{ model: User }] })
      .then(wiki => {
        if(!wiki) {
          callback("Wiki not found");
        }
        callback(null, wiki);
      })
      .catch(err => {
        callback(err);
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
        private: req.body.private
      };
      return Wiki.findByPk(req.params.id).then(wiki => {
        if(!wiki) {
          callback("Wiki not found");
        }
        wiki
          .update(updatedWiki, { fields: Object.keys(updatedWiki) })
          .then(() => {
            callback(null, wiki);
          })
          .catch(err => {
            callback(err);
          });
      });
    }
  }
};
