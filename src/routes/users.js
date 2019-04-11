const express = require("express");
const authHelper = require("../auth/authHelper");
const router = express.Router();
const userController = require("../controllers/userController");
const validation = require("./validation");

router.get("/sign_up", userController.singUp);
router.get("/log_out", authHelper.ensureAuthenticated, userController.logOut);
router.post("/payment/charge", authHelper.ensureAuthenticated, userController.charge);
router.get("/profile", authHelper.ensureAuthenticated, userController.show);
router.get("/profile/downgrade", authHelper.ensureAuthenticated, userController.downgrade);
router.get("/profile/edit", authHelper.ensureAuthenticated, userController.edit);
router.post("/profile/pwreset", authHelper.ensureAuthenticated, userController.resetPassword);
router.post("/log_in", validation.userChecks, validation.validateForm, userController.logIn);
router.post("/create", validation.userChecks, validation.validateForm, userController.create);

module.exports = router;