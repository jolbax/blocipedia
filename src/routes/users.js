const express = require("express");
const authHelper = require("../auth/authHelper");
const router = express.Router();
const userController = require("../controllers/userController");
const validation = require("./validation");

router.get("/sign_up", userController.singUp);
router.get("/log_out", authHelper.ensureAuthenticated, userController.logOut);
router.post("/log_in", validation.userChecks, validation.validateForm, userController.logIn);
router.post("/create", validation.userChecks, validation.validateForm, userController.create);

module.exports = router;