const router = require("express").Router();
const wikiController = require("../controllers/wikiController");
const authHelper = require("../auth/authHelper");
const validation = require("./validation");

router.get("/", wikiController.index);
router.get("/new", authHelper.ensureAuthenticated, wikiController.new);
router.post("/create", authHelper.ensureAuthenticated, validation.wikiChecks, validation.validateForm, wikiController.create);
router.get("/:id([0-9]+)", wikiController.show);
router.get("/:id([0-9]+)/delete", wikiController.delete);
router.get("/:id([0-9]+)/edit",authHelper.ensureAuthenticated, wikiController.edit);
router.post("/:id([0-9]+)/update", wikiController.update);

module.exports = router;
