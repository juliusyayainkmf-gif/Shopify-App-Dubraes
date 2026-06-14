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
    subject?.trim() || "New Dubraes Custom Design Request";

  const mailOptions = {
    from: `"Dubraes Custom Design Form" <${process.env.GMAIL_USER}>`,
    to: "sales@keepmefreshusa.com",
    replyTo: fromEmail,
    subject: `[Dubraes] ${safeSubject}`,

    text: `
New Dubraes Custom Design Request

Name: ${name}
Email: ${fromEmail}
Subject: ${safeSubject}

Message:
${message}
    `.trim(),

    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f4f4;padding:30px;">
        <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">

          <div style="background:#111111;padding:24px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;">
              Dubraes Custom Design Request
            </h1>
          </div>

          <div style="padding:30px;">

            <p style="margin-top:0;color:#555;font-size:15px;">
              A new custom design request has been submitted through the website.
            </p>

            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:12px;border:1px solid #ddd;font-weight:bold;width:140px;">
                  Name
                </td>
                <td style="padding:12px;border:1px solid #ddd;">
                  ${name || "N/A"}
                </td>
              </tr>

              <tr>
                <td style="padding:12px;border:1px solid #ddd;font-weight:bold;">
                  Email
                </td>
                <td style="padding:12px;border:1px solid #ddd;">
                  <a href="mailto:${fromEmail}" style="color:#0066cc;text-decoration:none;">
                    ${fromEmail}
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding:12px;border:1px solid #ddd;font-weight:bold;">
                  Subject
                </td>
                <td style="padding:12px;border:1px solid #ddd;">
                  ${safeSubject}
                </td>
              </tr>
            </table>

            <div
              style="
                margin-top:24px;
                padding:20px;
                background:#fafafa;
                border:1px solid #ddd;
                border-radius:8px;
              "
            >
              <h3 style="margin-top:0;color:#111;">
                Customer Message
              </h3>

              <div style="line-height:1.7;color:#444;">
                ${(message || "").replace(/\n/g, "<br>")}
              </div>
            </div>

            ${
              attachment
                ? `
                <div
                  style="
                    margin-top:20px;
                    padding:15px;
                    background:#f8f8f8;
                    border:1px solid #ddd;
                    border-radius:8px;
                  "
                >
                  📎 Attachment Included:
                  <strong>${attachment.filename || "Uploaded File"}</strong>
                </div>
              `
                : ""
            }

            <div
              style="
                margin-top:30px;
                padding-top:20px;
                border-top:1px solid #eee;
              "
            >
              <p style="margin:0;font-size:12px;color:#888;">
                This email was automatically generated from the
                Dubraes Custom Design Request Form.
              </p>
            </div>

          </div>
        </div>
      </div>
    `,
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
