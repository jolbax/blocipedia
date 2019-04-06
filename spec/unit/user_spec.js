const sequelize = require("../../src/db/models/index").sequelize;
const User = require("../../src/db/models").User;

describe("User", () => {
  beforeEach(done => {
    this.user;
    sequelize.sync({ force: true }).then(res => {
      User.create({
        username: "neo",
        email: "neo@matrix.net",
        password: "password"
      })
        .then(user => {
          this.user = user;
          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });
  });

  describe("#create()", () => {
    it("should create a new user", done => {
      User.create({
        username: "trinity",
        email: "trinity@matrix.net",
        password: "passcode"
      })
        .then(user => {
          expect(user.id).not.toBeNull();
          expect(user.username).toBe("trinity");
          expect(user.email).toBe("trinity@matrix.net");
          expect(user.role).toBe(0);
          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });

    it("should not create a new user with missing values", done => {
      User.create({
        username: "trinity",
        password: "passcode"
      })
        .then(user => {
          done();
        })
        .catch(err => {
          expect(err).not.toBeNull();
          expect(err.message).toContain("cannot be null");
          done();
        });
    });

    it("should not create a new user with repeated values", done => {
      User.create({
        username: "neo",
        email: "neo@matrix.net",
        password: "password"
      })
        .then(user => {
          done();
        })
        .catch(err => {
          expect(err).not.toBeNull();
          expect(err.message).toContain("must be unique");
          done();
        });
    });
  });

  describe("#destroy()", () => {
    it("should delete a specific user", (done) => {
      let userCountBeforeDelete;

      User.findAll()
      .then((users) => {
        userCountBeforeDelete = users.length;
        expect(userCountBeforeDelete).toBe(1);
        User.destroy({
          where: {
            username: "neo"
          }
        })
        .then((user) => {
          User.findAll()
          .then((users) => {
            expect(users.length).toBe(userCountBeforeDelete - 1);
            done();
          })
        })
        .catch((err) => {
          console.log(err);
          done();
        })
      })
    })
  })
});
