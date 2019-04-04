const apiUserController = require("../controllers/apiUserController");
const express = require("express");
const passport = require("passport");
const router = express.Router();

router.post("/create", passport.authenticate("jwt", { session: false }), apiUserController.create);
router.post("/log_in", apiUserController.apiLogin);

module.exports = router;