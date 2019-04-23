const base = "http://localhost:3000/wikis";
const request = require("request");
const server = require("../../src/server");
const sequelize = require("../../src/db/models/index").sequelize;
const { Wiki, Collaborator, User } = require("../../src/db/models");

describe("routes: collaborators", () => {
  beforeEach(done => {
    this.premiumUser;
    this.standardUser;
    this.wiki;
    this.collaborator;

    sequelize.sync({ force: true }).then(res => {
      (async () => {
        try {
          this.premiumUser = await User.create({
            username: "morpheus",
            email: "morpheus@matrix.net",
            role: 1,
            password: "password"
          });
          this.standardUser = await User.create({
            username: "tank",
            email: "tank@matrix.net",
            role: 0,
            password: "password"
          });
          this.wiki = await Wiki.create({
            title: "Leveling up people",
            body: "- The way to learn everything",
            private: true,
            userId: this.premiumUser.id
          });
          this.collaborator = await Collaborator.create({
            userId: this.standardUser.id,
            wikiId: this.wiki.id
          });
          done();
        } catch (error) {
          console.log(error);
          done();
        }
      })();
    });
  });

  // Premium Use context
  describe("Premium user context", () => {
    beforeEach(done => {
      let options = {
        url: "http://localhost:3000/auth/fake",
        form: {
          userId: this.premiumUser.id,
          username: this.premiumUser.username,
          email: this.premiumUser.email,
          role: this.premiumUser.role
        }
      };
      request.get(options, (err, res, body) => {
        done();
      });
    });

    describe("GET /wikis/:wikiId", () => {
      it("should render a private-shared wiki", done => {
        request(`${base}/${this.wiki.id}`, (err, res, body) => {
          expect(body).toContain("Leveling up people");
          expect(body).toContain("Edit");
          expect(body).toContain("Delete");
          expect(body).toContain("Collaborators");
          done();
        });
      });
    });
    describe("GET /wikis/:wikiId/collaborator", () => {
      it("should render a collaborator list for the associated wiki", done => {
        request.get(
          `${base}/${this.wiki.id}/collaborator`,
          (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("@tank");
            expect(body).toContain("tank@matrix.net");
            done();
          }
        );
      });
    });
    describe("GET /wikis/:wikiId/collaborator/:userId/create", () => {
      it("should create a new collaborator for the associated wiki", done => {
        User.create({
          username: "cipher",
          email: "cipher@matrix.net",
          role: 0,
          password: "password"
        }).then(user => {
          let options = {
            url: `${base}/${this.wiki.id}/collaborator/${user.id}/create`
          };
          request.get(options, (err, res, body) => {
            expect(err).toBeNull();
            Collaborator.findOne({
              where: {
                userId: user.id,
                wikiId: this.wiki.id
              }
            })
              .then(collaborator => {
                expect(collaborator.id).not.toBeNull();
                expect(collaborator.userId).toBe(user.id);
                expect(collaborator.wikiId).toBe(this.wiki.id);
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          });
        });
      });
    });
    describe("GET /wikis/:wikiId/collaborator/:userId/destroy", () => {
      it("should delete a collaborator associated with the wiki", done => {
        let options = {
          url: `${base}/${this.wiki.id}/collaborator/${
            this.standardUser.id
          }/destroy`
        };
        let collaboratorCount;

        Collaborator.findAll().then(collaborators => {
          collaboratorCount = collaborators.length;
          request.get(options, (err, res, body) => {
            expect(err).toBeNull();
            Collaborator.findAll()
              .then(collaborators => {
                expect(collaborators.length).toBe(collaboratorCount - 1);
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          });
        });
      });
    });
  });
  // Standard Use context
  describe("Standard user context", () => {
    beforeEach(done => {
      let options = {
        url: "http://localhost:3000/auth/fake",
        form: {
          userId: this.standardUser.id,
          username: this.standardUser.username,
          email: this.standardUser.email,
          role: this.standardUser.role
        }
      };
      request.get(options, (err, res, body) => {
        done();
      });
    });

    describe("GET /wikis", () => {
      it("should render list containing the private-shared wiki associated with the logged in user", done => {
        request.get(`${base}`, (err, res, body) => {
          expect(body).toContain("Public and Shared Wikis");
          expect(body).toContain("Leveling up people");
          done();
        });
      });
    });
    describe("GET /wikis/:wikiId", () => {
      it("should render a private-shared wiki associated with the logged in user", done => {
        request.get(`${base}/${this.wiki.id}`, (err, res, body) => {
          expect(body).toContain("Leveling up people");
          expect(body).toContain("Edit");
          expect(body).not.toContain("Delete");
          done();
        });
      });
    });
    describe("GET /wikis/:wikiId/edit", () => {
      it("should render a private-shared edit wiki page", done => {
        request.get(`${base}/${this.wiki.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Leveling up people");
          expect(body).toContain("- The way to learn everything");
          expect(body).toContain("Submit");
          done();
        });
      });
    });
    describe("GET /wikis/:wikiId/collaborator", () => {
      it("should not render a collaborator list for the associated wiki", done => {
        request.get(
          `${base}/${this.wiki.id}/collaborator`,
          (err, res, body) => {
            expect(err).toBeNull();
            expect(body).not.toContain("@tank");
            expect(body).not.toContain("tank@matrix.net");
            done();
          }
        );
      });
    });
    describe("GET /wikis/:wikiId/collaborator/:userId/create", () => {
      it("should not create a new collaborator for the associated wiki", done => {
        User.create({
          username: "cipher",
          email: "cipher@matrix.net",
          role: 0,
          password: "password"
        }).then(user => {
          let options = {
            url: `${base}/${this.wiki.id}/collaborator/${user.id}/create`
          };
          request.get(options, (err, res, body) => {
            expect(err).toBeNull();
            Collaborator.findOne({
              where: {
                userId: user.id,
                wikiId: this.wiki.id
              }
            })
              .then(collaborator => {
                expect(collaborator).toBeNull();
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          });
        });
      });
    });
    describe("GET /wikis/:wikiId/collaborator/:userId/destroy", () => {
      it("should not delete a collaborator associated with the wiki", done => {
        let options = {
          url: `${base}/${this.wiki.id}/collaborator/${
            this.standardUser.id
          }/destroy`
        };
        let collaboratorCount;

        Collaborator.findAll().then(collaborators => {
          collaboratorCount = collaborators.length;
          request.get(options, (err, res, body) => {
            expect(err).toBeNull();
            Collaborator.findAll()
              .then(collaborators => {
                expect(collaborators.length).toBe(collaboratorCount);
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          });
        });
      });
    });
    describe("POST /wikis/:wikiId/update", () => {
      it("should update private-shared wiki", done => {
        let options = {
          url: `${base}/${this.wiki.id}/update`,
          form: {
            title: "Leveling up people with recorded tapes",
            body: "- The way to learn everything in just about minutes",
            private: true
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(302);
          Wiki.findOne({
            where: {
              title: "Leveling up people with recorded tapes",
              body: "- The way to learn everything in just about minutes"
            }
          }).then(wiki => {
            expect(wiki).not.toBeNull();
            expect(wiki.title).toContain(
              "Leveling up people with recorded tapes"
            );
            done();
          });
        });
      });
      it("should not update the private attribute of a private-shared wiki", done => {
        let options = {
          url: `${base}/${this.wiki.id}/update`,
          form: {
            title: "Leveling up people with recorded tapes",
            body: "- The way to learn everything in just about minutes",
            private: false
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Wiki.findOne({
            where: {
              title: "Leveling up people with recorded tapes",
              body: "- The way to learn everything in just about minutes"
            }
          })
            .then(wiki => {
              expect(wiki).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });
  });
});
