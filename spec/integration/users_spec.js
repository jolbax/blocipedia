const base = "http://localhost:3000/users/";
const request = require("request");
const server = require("../../src/server");
const sequelize = require("../../src/db/models/index").sequelize;
const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;

describe("route: users", () => {
  beforeEach(done => {
    sequelize.sync({ force: true }).then(res => {
      done();
    });
  });

  // Unregistered user context
  describe("Unregistered user context", () => {
    beforeEach(done => {
      let options = {
        url: "http://localhost:3000/auth/fake",
        form: {
          userId: 0
        }
      };

      request.get(options, (err, res, body) => {
        done();
      });
    });

    describe("GET /users/sign_up", () => {
      it("should render a sign-up form", done => {
        request.get(`${base}sign_up`, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(body).toContain("Log In");
          expect(body).toContain("User name:");
          expect(body).toContain("Email:");
          expect(body).toContain("Password:");
          done();
        });
      });
    });

    describe("POST /users/create", () => {
      let options = {
        url: `${base}create`,
        form: {
          username: "morpheus",
          email: "morpheus@matrix.net",
          password: "password",
          passwordConfirmation: "password"
        }
      };
      it("should create a new user on with the provided data", done => {
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          User.findOne({
            where: {
              username: "morpheus"
            }
          })
            .then(user => {
              expect(user.username).toBe("morpheus");
              expect(user.email).toBe("morpheus@matrix.net");
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

  // Registered standard user context
  describe("Registered user context", () => {
    beforeEach(done => {
      this.standardUser;
      User.create({
        username: "tank",
        email: "tank@matrix.net",
        password: "123123123"
      })
        .then(user => {
          this.standardUser = user;
          let options = {
            url: "http://localhost:3000/auth/fake",
            form: {
              userId: this.standardUser.id,
              username: this.standardUser.username,
              email: this.standardUser.email,
              role: 0
            }
          };

          request.get(options, (err, res, body) => {
            done();
          });
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });

    describe("GET /users/sign_up", () => {
      it("should not render a sign-up form", done => {
        request.get(`${base}sign_up`, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(body).not.toContain("User name:");
          expect(body).not.toContain("Email:");
          expect(body).not.toContain("Password:");
          done();
        });
      });
    });

    describe("POST /users/create", () => {
      let options = {
        url: `${base}create`,
        form: {
          username: "morpheus",
          email: "morpheus@matrix.net",
          password: "password",
          passwordConfirmation: "password"
        }
      };
      it("should not create a new user on with the provided data", done => {
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          User.findOne({
            where: {
              username: "morpheus"
            }
          })
            .then(user => {
              expect(user).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });

    describe("GET /users/profile", () => {
      it("should render a user's profile page", done => {
        request.get(`${base}profile`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Upgrade");
          expect(body).toContain("Standard User Account: tank");
          done();
        });
      });
    });
  });

  // Registered premium user context
  describe("Registered user context", () => {
    beforeEach(done => {
      this.premiumUser;
      this.privateWiki;

      (async () => {
        try {
          this.premiumUser = await User.create({
            username: "cipher",
            email: "cipher@matrix.net",
            password: "123123123",
            role: 1
          });
          this.privateWiki = await Wiki.create({
            title: "How to fly a space ship",
            body: "It needs a log of muscles!",
            private: true,
            userId: this.premiumUser.id
          });
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
        } catch (err) {
          console.log(err);
          done();
        }
      })();
    });

    describe("GET /users/profile", () => {
      it("should render a user's profile page", done => {
        request.get(`${base}profile`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Downgrade");
          expect(body).toContain("Premium User Account: cipher");
          done();
        });
      });
    });

    describe("GET /users/profile/downgrade", () => {
      it("should set user's role to 0 and publish all private wikis", done => {
        User.findByPk(this.premiumUser.id, {
          include: [{ model: Wiki, as: "wikis" }]
        }).then(user => {
          expect(user.role).toBe(1);
          let privateWikisBefore = user.getPrivateWikis().length;
          let publicWikisBefore = user.getPublicWikis().length;
          request.get(`${base}profile/downgrade`, (err, res, body) => {
            expect(err).toBeNull();
            User.findByPk(this.premiumUser.id, {
              include: [{ model: Wiki, as: "wikis" }]
            })
              .then(updatedUser => {
                expect(updatedUser.role).toBe(0);
                expect(updatedUser.getPrivateWikis().length).toBe(
                  privateWikisBefore - 1
                );
                expect(updatedUser.getPublicWikis().length).toBe(
                  publicWikisBefore + 1
                );
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

    describe("POST /users/profile/pwreset", () => {
      it("should reset the user password", done => {
        let options = {
          url: `${base}profile/pwreset`,
          form: {
            password: "newpassword",
            passwordConfirmation: "newpassword"
          }
        };
        User.findByPk(this.premiumUser.id).then(user => {
          let passwordHashBefore = user.password;
          request.post(options, (err, res, body) => {
            expect(err).toBeNull();
            User.findByPk(this.premiumUser.id)
              .then(updatedUser => {
                expect(updatedUser.password).not.toBeNull();
                expect(updatedUser.password).not.toBe("newpassword");
                expect(updatedUser.password).not.toBe(passwordHashBefore);
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
});
