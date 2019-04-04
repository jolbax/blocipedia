const sequelize = require("../../src/db/models").sequelize;
const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;

describe("Wiki", () => {
  beforeEach((done) => {
    this.user;
    sequelize.sync({ force: true })
      .then((res) => {
        User.create({
          username: "neo",
          email: "neo@matrix.net",
          password: "password"
        })
          .then((user) => {
            this.user = user;
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          })
      });
  });

  describe("#create()", () => {
    it("should create a new wiki", (done) => {
      Wiki.create({
        title: "Choose a pill",
        body: "The blue one or the red one",
        private: false,
        userId: this.user.id
      })
      .then((wiki) => {
        expect(wiki.id).not.toBeNull();
        expect(wiki.title).toBe("Choose a pill");
        expect(wiki.body).toBe("The blue one or the red one");
        expect(wiki.userId).toBe(this.user.id);
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      })
    });
  });

  describe("#getUser()", () => {
    it("should get the associated user", (done) => {
      Wiki.create({
        title: "Choose a pill",
        body: "The blue one or the red one",
        private: false,
        userId: this.user.id
      })
      .then((wiki) => {
        wiki.getUser()
        .then((user) => {
          expect(user.username).toBe("neo");
          expect(user.email).toBe("neo@matrix.net");
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        })
      });
    });
  });

  describe("#setUser()", () => {
    it("should set a new user id to the wiki", (done) => {
      Wiki.create({
        title: "Choose a pill",
        body: "The blue one or the red one",
        private: false,
        userId: this.user.id
      })
      .then((wiki) => {
        User.create({
          username: "trinity",
          email: "trinity@matrix.net",
          password: "password"
        })
        .then((newUser) => {
          expect(newUser.username).toBe("trinity");
          expect(wiki.userId).toBe(this.user.id);
          wiki.setUser(newUser)
          .then((wiki) => {
            expect(wiki.userId).toBe(newUser.id);
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });
  });
});