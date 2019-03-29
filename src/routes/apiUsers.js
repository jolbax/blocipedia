const apiUserController = require("../controllers/apiUserController");
const express = require("express");
const passport = require("passport");
const router = express.Router();

router.post("/users/create", passport.authenticate("jwt", { session: false }), apiUserController.create);
router.post("/users/log_in", apiUserController.apiLogin);

module.exports = router;