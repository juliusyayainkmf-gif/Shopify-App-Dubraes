const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";

export async function sendContactEmail({
  fromEmail,
  name,
  subject,
  message,
  attachment,
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const to = process.env.CONTACT_EMAIL_TO || "sales@dubraes.com";
  const from = process.env.CONTACT_EMAIL_FROM || "Dubraes Contact <no-reply@dubraes.com>";
  const replyTo = fromEmail;
  const safeSubject = subject?.trim() || "New Dubraes contact form submission";

  const response = await fetch(RESEND_EMAILS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
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
    throw new Error(`Email provider error: ${response.status} ${errorBody}`);
  }

  return response.json();
}
