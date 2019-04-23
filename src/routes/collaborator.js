const router = require("express").Router();
const collaboratorController = require("../controllers/collaboratorController");

router.get("/:wikiId([0-9]+)/collaborator", collaboratorController.show);
router.get("/:wikiId([0-9]+)/collaborator/:userId([0-9]+)/create", collaboratorController.create);
router.get("/:wikiId([0-9]+)/collaborator/:userId([0-9]+)/destroy", collaboratorController.destroy);

module.exports = router;
