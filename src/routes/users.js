const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validation = require("./validation");

router.get("/users/sign_up", userController.singUp);
router.post("/users/create", validation.userChecks, validation.validateForm, userController.create);
router.post("/api/users/create", validation.userChecks, validation.validateForm, userController.create);

module.exports = router;