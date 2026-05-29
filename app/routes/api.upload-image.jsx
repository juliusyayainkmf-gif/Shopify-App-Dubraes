/* eslint-env node */
import { uploadConfiguratorImage } from "../services/cloudinary.server";

const allowedOrigins = [
  "https://dubraes-inventory-dashboard.myshopify.com",
  "https://www.dubraes.com",
];

const getCorsHeaders = (request) => {
  const origin = request.headers.get("origin");

  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
      ? origin
      : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
};

const isAllowedOrigin = (request) =>
  allowedOrigins.includes(request.headers.get("origin"));

export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }

  return new Response(null, {
    headers: getCorsHeaders(request),
  });
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
    return new Response(JSON.stringify({ error: "Forbidden origin" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const configId = formData.get("configId");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: "Invalid image type" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (file.size > 3 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Max 3MB only" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!configId) {
      return new Response(JSON.stringify({ error: "Missing configId" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const safeConfigId = configId.replace(/[^a-zA-Z0-9_-]/g, "");

    if (!safeConfigId) {
      return new Response(JSON.stringify({ error: "Invalid configId" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("Buffer size:", buffer.length);

    const result = await uploadConfiguratorImage(buffer, safeConfigId);

    return new Response(
      JSON.stringify({
        url: result.secure_url,
        public_id: result.public_id,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (err) {
    console.error("IMAGE UPLOAD ERROR:", {
      message: err.message,
      stack: err.stack,
    });

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
