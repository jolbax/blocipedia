const { sequelize } = require("../../src/db/models/index");
const { Collaborator, User, Wiki } = require("../../src/db/models");

describe("Collaborator", () => {
  beforeEach(done => {
    this.ownerUser;
    this.collaboratingUser;
    this.collaborator;
    this.wiki;

    sequelize.sync({ force: true }).then(res => {
      (async () => {
        try {
          this.ownerUser = await User.create({
            username: "neo",
            email: "neo@matrix.net",
            password: "password"
          });
          this.collaboratingUser = await User.create({
            username: "trinity",
            email: "trinity@matrix.net",
            password: "password"
          });
          this.wiki = await Wiki.create({
            title: "It is all about team work",
            body: "# The beginning of an alliance\n - One\n - Two\n - Three",
            private: true,
            userId: this.ownerUser.id
          });
          this.collaborator = await Collaborator.create({
            userId: this.collaboratingUser.id,
            wikiId: this.wiki.id
          });
          done();
        } catch (err) {
          console.log(err);
          done();
        }
      })();
    });
  });

  describe("#create()", () => {
    it("should create a new collaborator association", done => {
      (async () => {
        try {
          const collaborator = await Collaborator.create({
            userId: this.collaboratingUser.id,
            wikiId: this.wiki.id
          });
          expect(collaborator.userId).toBe(this.collaboratingUser.id);
          expect(collaborator.wikiId).toBe(this.wiki.id);
          done();
        } catch (err) {
          console.log(err);
          done();
        }
      })();
    });
    it("should not create a new collaborator association", done => {
      (async () => {
        try {
          const collaborator = await Collaborator.create({
            userId: this.collaboratingUser
          });
          expect(collaborator).toBeNull();
          done();
        } catch (err) {
          expect(err).not.toBeNull();
          expect(err.message).toContain("Collaborator.wikiId cannot be null");
          done();
        }
      })();
    });
  });

  describe("#destroy()", () => {
    it("should delete a collaborator association", done => {
      (async () => {
        try {
          let collaboratorBeforeDelete = await Collaborator.findAll();
          let newCollaborator = await Collaborator.create({
            userId: this.collaboratingUser.id,
            wikiId: this.wiki.id
          });
          expect(newCollaborator.userId).toBe(this.collaboratingUser.id);
          expect(newCollaborator.wikiId).toBe(this.wiki.id);
          let destroyCollaboratorCount = await Collaborator.destroy({
            where: { userId: newCollaborator.id }
          });
          let collaboratorAfterDelete = await Collaborator.findAll();
          expect(collaboratorAfterDelete.length).toBe(
            collaboratorBeforeDelete.length - 1
          );
          done();
        } catch (err) {
          console.log(err);
          done();
        }
      })();
    });
  });

  describe("#update()", () => {
    it("should update a collaborator association", done => {
      (async () => {
        try {
          const collaborator = await Collaborator.create({
            userId: this.collaboratingUser.id,
            wikiId: this.wiki.id
          });
          const otherUser = await User.create({
            username: "tank",
            email: "tank@matrix.net",
            password: "password"
          });
          expect(collaborator.userId).toBe(this.collaboratingUser.id);
          expect(collaborator.wikiId).toBe(this.wiki.id);
          collaborator
            .update({ userId: otherUser.id }, { fields: ["userId"] })
            .then(collaborator => {
              expect(collaborator.userId).toBe(otherUser.id);
              done();
            });
        } catch (err) {
          console.log(err);
          done();
        }
      })();
    });
  });
});
