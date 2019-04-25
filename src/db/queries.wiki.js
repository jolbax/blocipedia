const { Collaborator, User, Wiki } = require("../../src/db/models");

module.exports = {
  createWiki(req) {
    return Wiki.create({
      title: req.body.title,
      body: req.body.body,
      private: req.body.private || false,
      userId: req.user.id
    });
  },
  destroyWiki(wiki) {
    return wiki.destroy();
  },
  getAllWikis() {
    return Wiki.findAll({
      include: [{ model: User }, { model: Collaborator, as: "collaborators" }]
    });
  },
  getWiki(id) {
    return Wiki.findByPk(id, {
      include: [{ model: Collaborator, as: "collaborators" }]
    });
  },
  updateWiki(wiki, updatedWiki) {
    return wiki.update(updatedWiki, { fields: Object.keys(updatedWiki) });
  }
};
