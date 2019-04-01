module.exports = {
  init(app) {
    const staticRoutes = require("../routes/static");
    const userRoutes = require("../routes/users");
    const apiUserRoutes = require("../routes/apiUsers");
    if(process.env.NODE_ENV === "test"){
      const mockAuth = require("../../spec/support/mock-auth");
      mockAuth.fakeIt(app);
    }
    app.use("/", staticRoutes);
    app.use("/users", userRoutes, );
    app.use("/api", apiUserRoutes, );
  }
}