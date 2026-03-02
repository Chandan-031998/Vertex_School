const nodemailer = require("nodemailer");
const env = require("../config/env");

function enabled() {
  return !!(env.SMTP.HOST && env.SMTP.USER && env.SMTP.PASS);
}

async function sendMail({ to, subject, html }) {
  if (!enabled()) return { skipped: true };
  const transporter = nodemailer.createTransport({
    host: env.SMTP.HOST,
    port: env.SMTP.PORT,
    secure: false,
    auth: { user: env.SMTP.USER, pass: env.SMTP.PASS }
  });
  const info = await transporter.sendMail({ from: env.SMTP.FROM, to, subject, html });
  return { messageId: info.messageId };
}

module.exports = { sendMail, enabled };
