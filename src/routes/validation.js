const { check, validationResult } = require("express-validator/check");

userChecks = [
  check("username", "must be at least 3 chars long").isLength({ min: 3 }).optional(),
  check("email", "must be valid").isEmail(),
  check("password", "must be at least 6 chars long").isLength({ min: 6 }),
  check("passwordConfirmation", "must match password provided")
    .optional()
    .exists()
    .custom((value, { req }) => value === req.body.password)
];

wikiChecks = [
  check("title", "must be at least 6 chars long").isLength({min: 6}),
  check("body", "must be at lease 10 chars long").isLength({min: 10})
]

module.exports = {
  validateForm(req, res, next) {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      req.flash("error", errors.array());
      return res.redirect(303, req.headers.referer);
    } else {
      return next();
    }
  },
  userChecks,
  wikiChecks
};