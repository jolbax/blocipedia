const base = "http://localhost:3000/wikis";
const request = require("request");
const server = require("../../src/server");
const sequelize = require("../../src/db/models/index").sequelize;
const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;

describe("routes : wikis", () => {
  beforeEach(done => {
    this.user;
    this.wiki;

    sequelize.sync({ force: true }).then(res => {
      User.create({
        username: "morpheus",
        email: "morpheus@matrix.net",
        password: "password"
      }).then(user => {
        this.user = user;
        Wiki.create({
          title: "How old is Mr. Smith",
          body: "A biography of the super agent",
          private: false,
          userId: this.user.id
        })
          .then(wiki => {
            this.wiki = wiki;
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
  });

  // Guest context
  describe("Guest context", () => {
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

    describe("GET /wikis", () => {
      it("should render a list with all public wikis", done => {
        request.get(`${base}`, (err, res, body) => {
          expect(body).toContain("Public Wikis");
          expect(body).toContain("How old is Mr. Smith");
          done();
        });
      });
    });

    describe("GET /wikis/:id", () => {
      it("should render a wiki page with the associated ID", done => {
        request.get(`${base}/${this.wiki.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("How old is Mr. Smith");
          expect(body).toContain("A biography of the super agent");
          done();
        });
      });
    });

    describe("GET /wikis/new", () => {
      it("should not render a wiki create page", done => {
        request.get(`${base}/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Just another Wiki");
          done();
        });
      });
    });

    describe("GET /wikis/:id/edit", () => {
      it("should not render a wiki edit page with the associated ID", done => {
        request.get(`${base}/${this.wiki.id}/edit`, (err, res, body) => {
          expect(body).toContain("Just another Wiki");
          done();
        });
      });
    });

    describe("POST /wikis/create", () => {
      it("should not create a new wiki", done => {
        let options = {
          url: `${base}/create`,
          form: {
            title: "Sentinels",
            body: "Crazy machines!",
            private: false,
            userId: 0
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Wiki.findOne({
            where: {
              title: "Sentinels"
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

    describe("POST /wikis/:id/update", () => {
      it("should not update the wiki associated with the ID", done => {
        let options = {
          url: `${base}/${this.wiki.id}/update`,
          form: {
            title: "How strong is Mr. Smith",
            body: "A biography of a chick program",
            private: true
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Wiki.findOne({
            where: {
              title: "How strong is Mr. Smith"
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

    describe("GET /wikis/:id/delete", () => {
      it("should not delete the wiki associated with the ID", done => {
        let options = {
          url: `${base}/${this.wiki.id}/delete`
        };
        let wikisCountBeforeDelete;

        Wiki.findAll().then(wikis => {
          wikisCountBeforeDelete = wikis.length;
          request.get(options, (err, res, body) => {
            expect(err).toBeNull();
            Wiki.findAll()
              .then(wikis => {
                expect(wikis.length).toBe(wikisCountBeforeDelete);
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

  // Standard account context
  describe("Standard account context", () => {
    beforeEach(done => {
      let options = {
        url: "http://localhost:3000/auth/fake",
        form: {
          username: this.user.username,
          email: this.user.email,
          userId: this.user.id,
          role: "member"
        }
      };
      request.get(options, (err, res, body) => {
        done();
      });
    });

    describe("GET /wikis", () => {
      it("should render a list with all public wikis", done => {
        request.get(`${base}`, (err, res, body) => {
          expect(body).toContain("Public Wikis");
          expect(body).toContain("How old is Mr. Smith");
          expect(body).toContain("Add Wiki");
          done();
        });
      });
    });

    describe("GET /wikis/:id", () => {
      it("should render a wiki page with the associated ID", done => {
        request.get(`${base}/${this.wiki.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit");
          expect(body).toContain("Delete");
          expect(body).toContain("How old is Mr. Smith");
          expect(body).toContain("A biography of the super agent");
          done();
        });
      });
    });

    describe("GET /wikis/new", () => {
      it("should render a wiki create page", done => {
        request.get(`${base}/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Title");
          expect(body).toContain("Body");
          expect(body).toContain("Submit");
          expect(body).toContain("Cancel");
          done();
        });
      });
    });

    describe("GET /wikis/:id/edit", () => {
      it("should render a wiki edit page with the associated ID", done => {
        request.get(`${base}/${this.wiki.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Submit");
          expect(body).toContain("Cancel");
          expect(body).toContain("How old is Mr. Smith");
          expect(body).toContain("A biography of the super agent");
          done();
        });
      });
    });

    describe("POST /wikis/create", () => {
      it("should create a new wiki", done => {
        let options = {
          url: `${base}/create`,
          form: {
            title: "Sentinels",
            body: "Crazy machines!",
            private: false,
            userId: this.user.id
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Wiki.findOne({
            where: {
              title: "Sentinels"
            }
          })
            .then(wiki => {
              expect(wiki.title).toContain("Sentinels");
              expect(wiki.body).toContain("Crazy machines!");
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });

    describe("POST /wikis/:id/update", () => {
      it("should update the wiki associated with the ID", done => {
        let options = {
          url: `${base}/${this.wiki.id}/update`,
          form: {
            title: "How strong is Mr. Smith",
            body: "A biography of a chick program",
            private: true
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Wiki.findOne({
            where: {
              title: "How strong is Mr. Smith"
            }
          })
            .then(wiki => {
              expect(wiki.title).toContain("How strong is Mr. Smith");
              expect(wiki.body).toContain("A biography of a chick program");
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });

    describe("GET /wikis/:id/delete", () => {
      it("should delete the wiki associated with the ID", done => {
        let wikisCountBeforeDelete;
        Wiki.findAll().then(wikis => {
          wikisCountBeforeDelete = wikis.length;
          request.get(`${base}/${this.wiki.id}/delete`, (err, res, body) => {
            expect(err).toBeNull();
            Wiki.findAll()
              .then(wikis => {
                expect(wikis.length).toBe(wikisCountBeforeDelete - 1);
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


  xdescribe("Premium account context", () => {});
});
