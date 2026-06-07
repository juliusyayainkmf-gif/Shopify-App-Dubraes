const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";

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
  if (!process.env.RESEND_API_KEY) {
    throw new EmailSetupError("Missing RESEND_API_KEY");
  }

  const to = "julius.yayain.kmf@gmail.com";
  const from = "Dubraes Design Requests <onboarding@resend.dev>";
  const replyTo = fromEmail;
  const safeSubject = subject?.trim() || "New Dubraes custom design request";

  const response = await fetch(RESEND_EMAILS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "Dubraes Shopify App",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: replyTo,
      subject: safeSubject,
      text: [
        `Name: ${name}`,
        `Email: ${fromEmail}`,
        `Subject: ${safeSubject}`,
        "",
        message,
      ].join("\n"),
      attachments: attachment ? [attachment] : undefined,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new EmailSetupError(
      `Email provider error: ${response.status} ${errorBody}`,
      `Email provider error: ${response.status}. ${errorBody}`,
    );
  }

  return response.json();
}
