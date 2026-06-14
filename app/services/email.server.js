const mailOptions = {
  from: `"Dubraes Custom Design Form" <${process.env.GMAIL_USER}>`,
  to: "julius.yayain.kmf@gmail.com", // change to sales@keepmefreshusa.com later
  replyTo: fromEmail,
  subject: `[Dubraes] ${safeSubject}`,

  text: `
New Dubraes Custom Design Request

Name: ${name}
Email: ${fromEmail}
subject: [Dubraes] ${safeSubject}

Message:
${message}
`.trim(),

  html: `
  <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:30px;">
    <div style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">

      <div style="background:#111111;padding:24px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:24px;">
          Dubraes Custom Design Request
        </h1>
      </div>

      <div style="padding:30px;">
        <p style="margin-top:0;font-size:15px;color:#555;">
          A new custom design request has been submitted through the Dubraes website.
        </p>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:12px;font-weight:bold;border:1px solid #ddd;width:150px;">
              Name
            </td>
            <td style="padding:12px;border:1px solid #ddd;">
              ${name}
            </td>
          </tr>

          <tr>
            <td style="padding:12px;font-weight:bold;border:1px solid #ddd;">
              Email
            </td>
            <td style="padding:12px;border:1px solid #ddd;">
              <a
                href="mailto:${fromEmail}"
                style="color:#0066cc;font-weight:bold;text-decoration:none;"
              >
                ${fromEmail}
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:12px;font-weight:bold;border:1px solid #ddd;">
              Subject
            </td>
            <td style="padding:12px;border:1px solid #ddd;">
              ${safeSubject}
            </td>
          </tr>
        </table>

        <div style="margin-top:24px;padding:20px;border:1px solid #ddd;border-radius:8px;background:#fafafa;">
          <h3 style="margin-top:0;">Customer Message</h3>
          <p style="white-space:pre-wrap;line-height:1.7;color:#444;">
            ${message.replace(/\n/g, "<br>")}
          </p>
        </div>

        ${
          attachment
            ? `
          <div style="margin-top:20px;padding:15px;background:#f8f8f8;border:1px solid #ddd;border-radius:8px;">
            📎 Image attachment included:
            <strong>${attachment.filename}</strong>
          </div>
        `
            : ""
        }

        <div style="margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#888;">
            This email was automatically generated from the Dubraes Custom Design Request form.
          </p>
        </div>
      </div>

    </div>
  </div>
  `,
};