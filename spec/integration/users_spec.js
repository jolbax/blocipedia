const base = "http://localhost:3000/users/";
const request = require("request");
const server = require("../../src/server");
const sequelize = require("../../src/db/models/index").sequelize;
const User = require("../../src/db/models").User;

describe("route: users", () => {
  beforeEach((done) => {
    sequelize.sync({ force: true})
    .then((res) => {
      done();
    });
  });

  describe("Unregistered user context", () => {
    beforeEach((done) => {
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
      it("should render a sign-up form", (done) => {
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
      }
      it("should create a new user on with the provided data", (done) => {
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          User.findOne({
            where: {
              username: "morpheus"
            }
          })
          .then((user) => {
            expect(user.username).toBe("morpheus");
            expect(user.email).toBe("morpheus@matrix.net");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          })
        });
      });
    });
  });

  describe("Registered user context", () => {
    beforeEach((done) => {
      User.create({
        username: "tank",
        email: "tank@matrix.net",
        password: "123123123"
      })
      .then((user) => {
        this.user = user;
        let options = {
          url: "http://localhost:3000/auth/fake",
          form: {
            userId: this.user.id,
            username: this.user.username,
            email: this.user.email,
            role: "member"
          }
        };

        request.get(options, (err, res, body) => {
          done();
        });
      })
      .catch((err) => {
        console.log(err);
        done();
      })
    });

    // not possible, test with logout
    describe("GET /users/sign_up", () => {
      it("should render a sign-up form", (done) => {
        request.get(`${base}sign_up`, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(body).toContain("Log Out");
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
      }
      it("should not create a new user on with the provided data", (done) => {
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          User.findOne({
            where: {
              username: "morpheus"
            }
          })
          .then((user) => {
            expect(user.username).toBe("morpheus");
            expect(user.email).toBe("morpheus@matrix.net");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          })
        });
      });
    });
  });
});