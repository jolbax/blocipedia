const Authorizer = require("../policies/collaborator");
const { Collaborator, User, Wiki } = require("./models");

module.exports = {
  createCollaborator(userId, wikiId) {
    return Collaborator.create({
        userId: userId,
        wikiId: wikiId
      });
  },
  deleteCollaborator(collaborator) {
    return collaborator.destroy();
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
