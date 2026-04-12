const nodemailer = require("nodemailer");

function createTransport() {
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1"
      : port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * @param {{ to: string; subject: string; text: string; html?: string }} opts
 */
async function sendMail(opts) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  if (!from || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Mail is not configured");
  }

  const transporter = createTransport();
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}

module.exports = { sendMail };
