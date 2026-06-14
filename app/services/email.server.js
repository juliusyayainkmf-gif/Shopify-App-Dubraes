import nodemailer from "nodemailer";

class EmailSetupError extends Error {
  constructor(message, publicMessage = message) {
    super(message);
    this.name = "EmailSetupError";
    this.code = "EMAIL_SETUP_ERROR";
    this.publicMessage = publicMessage;
  }
}

export async function sendContactEmail({
  fromEmail,
  name,
  subject,
  message,
  attachment,
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new EmailSetupError(
      "Missing GMAIL_USER or GMAIL_APP_PASSWORD"
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const safeSubject =
    subject?.trim() || "New Dubraes custom design request";

  const mailOptions = {
    from: `"Dubraes Design Requests" <${process.env.GMAIL_USER}>`,
    to: "julius.yayain.kmf@gmail.com",
    replyTo: fromEmail,
    subject: safeSubject,
    text: `
Name: ${name}
Email: ${fromEmail}
Subject: ${safeSubject}

${message}
    `.trim(),
  };

  if (attachment) {
    mailOptions.attachments = [
      {
        filename: attachment.filename,
        content: Buffer.from(attachment.content, "base64"),
      },
    ];
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new EmailSetupError(
      `Email provider error: ${error.message}`,
      `Email provider error: ${error.message}`
    );
  }
}