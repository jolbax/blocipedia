const apiWikiController = require("../controllers/apiWikiController");
const passport = require("passport");
const router = require("express").Router();

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  apiWikiController.create
);
router.get("/", apiWikiController.getAll);
router.get("/:id([0-9]+)", apiWikiController.getOne);
router.delete(
  "/:id([0-9]+)/delete",
  passport.authenticate("jwt", { session: false }),
  apiWikiController.delete
);
router.put(
  "/:id([0-9]+)/update",
  passport.authenticate("jwt", { session: false }),
  apiWikiController.update
);

module.exports = router;
