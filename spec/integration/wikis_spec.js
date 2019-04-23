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
        password: "password",
        role: 0
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
          expect(body).toContain("Public and Shared Wikis");
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
          email: this.user.email,
          userId: this.user.id,
          role: 0
        }
      };
      request.get(options, (err, res, body) => {
        done();
      });
    });

    describe("GET /wikis", () => {
      it("should render a list with all public wikis", done => {
        request.get(`${base}`, (err, res, body) => {
          expect(body).toContain("Public and Shared Wikis");
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
              expect(wiki).not.toBeNull();
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
      it("should update the public wiki associated with the ID", done => {
        let options = {
          url: `${base}/${this.wiki.id}/update`,
          form: {
            title: "How strong is Mr. Smith",
            body: "A biography of a chick program"
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
              expect(wiki).not.toBeNull();
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

      it("should not update the public wiki associated with the ID to be private", done => {
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

      it("should update a wiki own by other user", done => {
        let options = {
          url: `${base}/${this.wiki.id}/update`,
          form: {
            title: "How strong is Mr. Smith",
            body: "A biography of a chick program"
          }
        };
        request.get(
          {
            url: "http://localhost:3000/auth/fake",
            form: {
              userId: 0
            }
          },
          (err, res, body) => {
            User.create({
              username: "oracle",
              email: "oracle@matrix.net",
              password: "password",
              role: 0
            }).then(newUser => {
              request.get(
                {
                  url: "http://localhost:3000/auth/fake",
                  form: {
                    userId: newUser.id,
                    email: newUser.email,
                    role: 0
                  }
                },
                (err, res, body) => {
                  request.post(options, (err, res, body) => {
                    expect(err).toBeNull();
                    Wiki.findOne({
                      where: {
                        title: "How strong is Mr. Smith"
                      }
                    })
                      .then(wiki => {
                        expect(wiki).not.toBeNull();
                        expect(wiki.title).toContain("How strong is Mr. Smith");
                        expect(wiki.body).toContain(
                          "A biography of a chick program"
                        );
                        done();
                      })
                      .catch(err => {
                        console.log(err);
                        done();
                      });
                  });
                }
              );
            });
          }
        );
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

      it("should not delete a wiki owned by another user", done => {
        let wikisCountBeforeDelete;
        request.get(
          {
            url: "http://localhost:3000/auth/fake",
            form: {
              userId: 0
            }
          },
          (err, res, body) => {
            User.create({
              username: "oracle",
              email: "oracle@matrix.net",
              password: "password",
              role: 0
            }).then(newUser => {
              request.get(
                {
                  url: "http://localhost:3000/auth/fake",
                  form: {
                    userId: newUser.id,
                    email: newUser.email,
                    role: 0
                  }
                },
                (err, res, body) => {
                  Wiki.findAll().then(wikis => {
                    wikisCountBeforeDelete = wikis.length;
                    request.get(
                      `${base}/${this.wiki.id}/delete`,
                      (err, res, body) => {
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
                      }
                    );
                  });
                }
              );
            });
          }
        );
      });
    });
  });

  // Premium user context
  describe("Premium account context", () => {
    this.premiumUser;
    this.privateWiki;
    beforeEach(done => {
      User.create({
        username: "cipher",
        email: "cipher@matrix.net",
        password: "password",
        role: 1
      }).then(user => {
        this.premiumUser = user;
        Wiki.create({
          title: "Learning Kung-Fu",
          body: "With a Sony MiniDisc",
          private: true,
          userId: this.premiumUser.id
        }).then(privateWiki => {
          this.privateWiki = privateWiki;
          let options = {
            url: "http://localhost:3000/auth/fake",
            form: {
              email: this.premiumUser.email,
              userId: this.premiumUser.id,
              role: this.premiumUser.role
            }
          };
          request.get(options, (err, res, body) => {
            done();
          });
        });
      });
    });

    describe("POST /wikis/create", () => {
      it("should create a new private wiki", done => {
        let options = {
          url: `${base}/create`,
          form: {
            title: "Sentinels",
            body: "Crazy machines!",
            private: true,
            userId: this.premiumUser.id
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
      it("should update the private wiki associated with the ID (no private attribute)", done => {
        Wiki.create({
          title: "Follow the white rabbit",
          body: "But first of all, you have to find it",
          private: true,
          userId: this.premiumUser.id
        }).then(wiki => {
          let options = {
            url: `${base}/${wiki.id}/update`,
            form: {
              title: "The rabbit is white.. follow it!",
              body: "It is in the lady's shoulder",
              private: true
            }
          };
          request.post(options, (err, res, body) => {
            expect(err).toBeNull();
            Wiki.findOne({
              where: {
                title: "The rabbit is white.. follow it!"
              }
            })
              .then(wiki => {
                expect(wiki.title).toContain(
                  "The rabbit is white.. follow it!"
                );
                expect(wiki.body).toContain("It is in the lady's shoulder");
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          });
        });
      });

      it("should update the private wiki associated with the ID (with private attribute)", done => {
        Wiki.create({
          title: "Follow the white rabbit",
          body: "But first of all, you have to find it",
          private: true,
          userId: this.premiumUser.id
        }).then(wiki => {
          let options = {
            url: `${base}/${wiki.id}/update`,
            form: {
              title: "The rabbit is white.. follow it!",
              body: "It is in the lady's shoulder",
              private: false
            }
          };
          request.post(options, (err, res, body) => {
            expect(err).toBeNull();
            Wiki.findOne({
              where: {
                title: "The rabbit is white.. follow it!"
              }
            })
              .then(wiki => {
                expect(wiki.title).toContain(
                  "The rabbit is white.. follow it!"
                );
                expect(wiki.body).toContain("It is in the lady's shoulder");
                expect(wiki.private).toBe(false);
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          });
        });
      });

      it("should not update a private wiki own by other premium user", done => {
        Wiki.create({
          title: "Follow the white rabbit",
          body: "But first of all, you have to find it",
          private: true,
          userId: this.premiumUser.id
        }).then(wiki => {
          let options = {
            url: `${base}/${wiki.id}/update`,
            form: {
              title: "The rabbit is white.. follow it!",
              body: "It is in the lady's shoulder",
              private: true
            }
          };
          request.get(
            {
              url: "http://localhost:3000/auth/fake",
              form: {
                userId: 0
              }
            },
            (err, res, body) => {
              User.create({
                username: "oracle",
                email: "oracle@matrix.net",
                password: "password",
                role: 1
              }).then(newUser => {
                request.get(
                  {
                    url: "http://localhost:3000/auth/fake",
                    form: {
                      userId: newUser.id,
                      email: newUser.email,
                      role: newUser.role
                    }
                  },
                  (err, res, body) => {
                    request.post(options, (err, res, body) => {
                      expect(err).toBeNull();
                      Wiki.findOne({
                        where: {
                          title: "The rabbit is white.. follow it!"
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
                  }
                );
              });
            }
          );
        });
      });
    });

    describe("GET /wikis/:id/delete", () => {
      it("should delete the private wiki associated with the specific user", done => {
        let wikisCountBeforeDelete;
        Wiki.findAll().then(wikis => {
          wikisCountBeforeDelete = wikis.length;
          request.get(
            `${base}/${this.privateWiki.id}/delete`,
            (err, res, body) => {
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
            }
          );
        });
      });

      it("should not delete a wiki owned by another user", done => {
        let wikisCountBeforeDelete;
        request.get(
          {
            url: "http://localhost:3000/auth/fake",
            form: {
              userId: 0
            }
          },
          (err, res, body) => {
            User.create({
              username: "oracle",
              email: "oracle@matrix.net",
              password: "password",
              role: 1
            }).then(newUser => {
              request.get(
                {
                  url: "http://localhost:3000/auth/fake",
                  form: {
                    userId: newUser.id,
                    email: newUser.email,
                    role: newUser.role
                  }
                },
                (err, res, body) => {
                  Wiki.findAll().then(wikis => {
                    wikisCountBeforeDelete = wikis.length;
                    request.get(
                      `${base}/${this.privateWiki.id}/delete`,
                      (err, res, body) => {
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
                      }
                    );
                  });
                }
              );
            });
          }
        );
      });
    });
  });

  // Admin user context
  describe("Admin account context", () => {
    this.adminUser;
    this.privateWiki;
    beforeEach(done => {
      User.create({
        username: "cipher",
        email: "cipher@matrix.net",
        password: "password",
        role: 10
      }).then(user => {
        this.adminUser = user;
        Wiki.create({
          title: "Learning Kung-Fu",
          body: "With a Sony MiniDisc",
          private: true,
          userId: this.adminUser.id
        }).then(privateWiki => {
          this.privateWiki = privateWiki;
          let options = {
            url: "http://localhost:3000/auth/fake",
            form: {
              email: this.adminUser.email,
              userId: this.adminUser.id,
              role: this.adminUser.role
            }
          };
          request.get(options, (err, res, body) => {
            done();
          });
        });
      });
    });

    describe("POST /wikis/create", () => {
      it("should create a new private wiki", done => {
        let options = {
          url: `${base}/create`,
          form: {
            title: "Sentinels",
            body: "Crazy machines!",
            private: true,
            userId: this.adminUser.id
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
      it("should update the private wiki associated with the ID (no private attribute)", done => {
        Wiki.create({
          title: "Follow the white rabbit",
          body: "But first of all, you have to find it",
          private: true,
          userId: this.adminUser.id
        }).then(wiki => {
          let options = {
            url: `${base}/${wiki.id}/update`,
            form: {
              title: "The rabbit is white.. follow it!",
              body: "It is in the lady's shoulder",
              private: true
            }
          };
          request.post(options, (err, res, body) => {
            expect(err).toBeNull();
            Wiki.findOne({
              where: {
                title: "The rabbit is white.. follow it!"
              }
            })
              .then(wiki => {
                expect(wiki.title).toContain(
                  "The rabbit is white.. follow it!"
                );
                expect(wiki.body).toContain("It is in the lady's shoulder");
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          });
        });
      });

      it("should update the private wiki associated with the ID (with private attribute)", done => {
        Wiki.create({
          title: "Follow the white rabbit",
          body: "But first of all, you have to find it",
          private: true,
          userId: this.adminUser.id
        }).then(wiki => {
          let options = {
            url: `${base}/${wiki.id}/update`,
            form: {
              title: "The rabbit is white.. follow it!",
              body: "It is in the lady's shoulder",
              private: false
            }
          };
          request.post(options, (err, res, body) => {
            expect(err).toBeNull();
            Wiki.findOne({
              where: {
                title: "The rabbit is white.. follow it!"
              }
            })
              .then(wiki => {
                expect(wiki.title).toContain(
                  "The rabbit is white.. follow it!"
                );
                expect(wiki.body).toContain("It is in the lady's shoulder");
                expect(wiki.private).toBe(false);
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          });
        });
      });

      it("should update a private wiki own by other premium user", done => {
        User.create({
          username: "oracle",
          email: "oracle@matrix.net",
          password: "password",
          role: 1
        }).then(newUser => {
          Wiki.create({
            title: "Follow the white rabbit",
            body: "But first of all, you have to find it",
            private: true,
            userId: newUser.id
          }).then(wiki => {
            let options = {
              url: `${base}/${wiki.id}/update`,
              form: {
                title: "The rabbit is white.. follow it!",
                body: "It is in the lady's shoulder",
                private: true
              }
            };
            request.post(options, (err, res, body) => {
              expect(err).toBeNull();
              Wiki.findOne({
                where: {
                  title: "The rabbit is white.. follow it!"
                }
              })
                .then(wiki => {
                  expect(wiki.title).toContain(
                    "The rabbit is white.. follow it!"
                  );
                  expect(wiki.body).toContain("It is in the lady's shoulder");
                  expect(wiki.private).toBe(true);
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

    describe("GET /wikis/:id/delete", () => {
      it("should delete the private wiki associated with the specific user", done => {
        let wikisCountBeforeDelete;
        Wiki.findAll().then(wikis => {
          wikisCountBeforeDelete = wikis.length;
          request.get(
            `${base}/${this.privateWiki.id}/delete`,
            (err, res, body) => {
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
            }
          );
        });
      });

      it("should not delete a wiki owned by another user", done => {
        User.create({
          username: "oracle",
          email: "oracle@matrix.net",
          password: "password",
          role: 1
        }).then(newUser => {
          Wiki.create({
            title: "Follow the white rabbit",
            body: "But first of all, you have to find it",
            private: true,
            userId: newUser.id
          }).then(wiki => {
            let wikisCountBeforeDelete;
            Wiki.findAll().then(wikis => {
              wikisCountBeforeDelete = wikis.length;
              request.get(`${base}/${wiki.id}/delete`, (err, res, body) => {
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
    });
  });
});
