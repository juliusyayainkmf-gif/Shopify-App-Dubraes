/* eslint-env node */
import { uploadConfiguratorImage } from "../services/cloudinary.server";
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
