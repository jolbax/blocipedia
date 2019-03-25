require("dotenv").config();
const path = require("path");
const bodyParse = require("body-parser");
const flash = require("express-flash");
const session = require("express-session");
const viewsFolder = path.join(__dirname, "..", "views");

module.exports = {
  init(app, express) {
    app.set("views", viewsFolder);
    app.set("view engine", "ejs");
    if(process.env.NODE_ENV !== "prod"){
      const logger = require("morgan");
      app.use(logger("dev"));
    }
    app.use(bodyParse.urlencoded({extended: true}));
    app.use(session({
      secret: process.env.cookieSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60000 }
    }));
    app.use(flash());
    app.use(express.static(path.join(__dirname, "..", "assets")));
  }
};