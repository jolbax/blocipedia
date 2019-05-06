const { Collaborator, User, Wiki } = require("./models");

module.exports = {
  createCollaborator(userId, wikiId) {
    return Collaborator.create({
        userId: userId,
        wikiId: wikiId
      });
  },
  deleteCollaborator(userId, wikiId){
    return Collaborator.destroy({where: { userId, wikiId }})
  },
  getCollaborator(userId, wikiId) {
    return Collaborator.findOne({
      where: {
        userId: userId,
        wikiId: wikiId
      }
    });
  },
  getCollaborators(wikiId) {
    return Wiki.findByPk(wikiId, {
      include: [
        {
          model: Collaborator,
          as: "collaborators",
          include: [
            {
              model: User
            }
          ]
        }
      ]
    });
  }
};
