/* eslint-env node */
import { sendContactEmail } from "../services/email.server";
import { getCorsHeaders, isAllowedOrigin } from "../utils/cors.server";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../utils/rate-limit.server";

const contactRateLimit = {
  maxRequests: 5,
  windowMs: 60 * 1000,
};

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 5 * 1024 * 1024;

const json = (body, { status = 200, headers = {} } = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

const getRequiredText = (formData, key) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }

  return json(
    { ok: true },
    {
      headers: getCorsHeaders(request),
    },
  );
};

export const action = async ({ request }) => {
  const corsHeaders = getCorsHeaders(request);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (!isAllowedOrigin(request)) {
    return json(
      { error: "Forbidden origin" },
      {
        status: 403,
        headers: corsHeaders,
      },
    );
  }

  const rateLimit = checkRateLimit(request, contactRateLimit);
  if (!rateLimit.allowed) {
    return json(
      { error: "Too many submissions. Please try again later." },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          ...getRateLimitHeaders(rateLimit),
        },
      },
    );
  }

  try {
    const formData = await request.formData();
    const website = getRequiredText(formData, "website");

    if (website) {
      return json({ ok: true }, { headers: corsHeaders });
    }

    const name = getRequiredText(formData, "name");
    const email = getRequiredText(formData, "email");
    const subject = getRequiredText(formData, "subject");
    const message = getRequiredText(formData, "message");
    const image = formData.get("image");

    if (!name || !email || !message) {
      return json(
        { error: "Name, email, and message are required." },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(
        { error: "Please enter a valid email address." },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    let attachment;

    if (image && typeof image.arrayBuffer === "function" && image.size > 0) {
      if (!allowedImageTypes.includes(image.type)) {
        return json(
          { error: "Only JPG, PNG, and WEBP images are allowed." },
          {
            status: 400,
            headers: corsHeaders,
          },
        );
      }

      if (image.size > maxImageSize) {
        return json(
          { error: "Image must be 5MB or smaller." },
          {
            status: 400,
            headers: corsHeaders,
          },
        );
      }

      const buffer = Buffer.from(await image.arrayBuffer());
      attachment = {
        filename: image.name || "contact-image",
        content: buffer.toString("base64"),
      };
    }

    await sendContactEmail({
      fromEmail: email,
      name,
      subject,
      message,
      attachment,
    });

    return json(
      { ok: true, message: "Your message was sent." },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("CONTACT FORM ERROR:", error);

    if (error.code === "EMAIL_SETUP_ERROR") {
      return json(
        {
          error: error.publicMessage,
        },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    return json(
      { error: "Unable to send message right now." },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
};
