const express = require("express");
const authHelper = require("../auth/authHelper");
const router = express.Router();
const userController = require("../controllers/userController");
const validation = require("./validation");

router.get("/users/sign_up", userController.singUp);
router.get("/users/log_out", authHelper.ensureAuthenticated, userController.logOut);
router.post("/users/log_in", validation.userChecks, validation.validateForm, userController.logIn);
router.post("/users/create", validation.userChecks, validation.validateForm, userController.create);
router.post("/api/users/create", validation.userChecks, validation.validateForm, userController.create);

module.exports = router;