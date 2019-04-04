module.exports = {
  init(app) {
    const staticRoutes = require("../routes/static");
    const userRoutes = require("../routes/users");
    const apiUserRoutes = require("../routes/apiUsers");
    const apiWikiRoutes = require("../routes/apiWikis");
    const wikiRoutes = require("../routes/wikis");
    if(process.env.NODE_ENV === "test"){
      const mockAuth = require("../../spec/support/mock-auth");
      mockAuth.fakeIt(app);
    }
    app.use("/", staticRoutes);
    app.use("/users", userRoutes);
    app.use("/api/users", apiUserRoutes);
    app.use("/api/wikis/", apiWikiRoutes);
    app.use("/wikis", wikiRoutes);
  }
}