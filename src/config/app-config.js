require("dotenv").config();
const bodyParser = require("body-parser");
const flash = require("express-flash");
const passportConfig = require("./passport-config");
const path = require("path");
const session = require("express-session");
const viewsFolder = path.join(__dirname, "..", "views");

module.exports = {
  init(app, express) {
    app.set("views", viewsFolder);
    app.set("view engine", "ejs");
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NODE_ENV !== "test"
    ) {
      const logger = require("morgan");
      app.use(logger("dev"));
    }
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(
      session({
        secret: process.env.cookieSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1.21e9 }
      })
    );
    app.use(flash());
    passportConfig.init(app);
    app.use((req, res, next) => {
      res.locals.currentUser = req.user;
      next();
    });
    app.use(express.static(path.join(__dirname, "..", "assets")));
  }
};
