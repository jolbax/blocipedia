const mailer = require("@sendgrid/mail");

mailer.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  noReplyAddress: "no-reply@wikix.io",
  sendMail(to, from, subject, text) {
    const msg = {
      to: to,
      from: from,
      subject: subject,
      text: text
    }
    mailer.send(msg)
  },
  sendConfirmation(user, from) {
    mailer.send({
      to: user.email,
      from: from,
      subject: "Thanks for registering on Wikix!",
      html: `Hi ${user.username}, \n
      \n
      Your new account on Wikix is already active.\n
      Sign in and start creating, collaborating and sharing!\n

      http://wikix.io/my-fake-sign-in-uri\n

      Kind regards,\n
      Your Wikix Team`
    })
  },
}