const apiUserController = require("../controllers/apiUserController");
const express = require("express");
const passport = require("passport");
const router = express.Router();

router.post("/create", apiUserController.create);
router.post("/log_in", apiUserController.apiLogin);
router.put(
  "/:id([0-9]+)/reset_password",
  passport.authenticate("jwt", { session: false }),
  apiUserController.resetPassword
);

module.exports = router;
