/* eslint-env node */
import { uploadConfiguratorPdf } from "../services/cloudinary.server";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../utils/rate-limit.server";
import { getCorsHeaders, isAllowedOrigin } from "../utils/cors.server";

const uploadRateLimit = {
  maxRequests: 100,
  windowMs: 60 * 1000,
};

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

  const rateLimit = checkRateLimit(request, uploadRateLimit);
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: "Too many uploads" }), {
      status: 429,
      headers: {
        ...corsHeaders,
        ...getRateLimitHeaders(rateLimit),
      },
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
