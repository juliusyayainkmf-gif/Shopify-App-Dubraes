/* eslint-env node */
import { uploadConfiguratorPdf } from "../services/cloudinary.server";

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

    if (file.type !== "application/pdf") {
      return new Response(JSON.stringify({ error: "Only PDF allowed" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Max 5MB only" }), {
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

    const result = await uploadConfiguratorPdf(buffer, safeConfigId);

    return new Response(JSON.stringify({ url: result.secure_url }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
