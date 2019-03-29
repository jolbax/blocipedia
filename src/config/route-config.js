module.exports = {
  init(app) {
    const staticRoutes = require("../routes/static");
    const userRoutes = require("../routes/users");
    const apiUserRoutes = require("../routes/apiUsers");
    app.use("/", staticRoutes);
    app.use("/users", userRoutes, );
    app.use("/api", apiUserRoutes, );
  }
}