import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { getCorsHeaders } from "../utils/cors.server";

const uploadFromBuffer = (buffer, configId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "configs",
        public_id: configId,
        type: "upload",
        access_mode: "public",
        format: "pdf",
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const loader = async ({ request }) => {
  return new Response(null, {
    headers: getCorsHeaders(request),
  });
};

export const action = async ({ request }) => {
  const corsHeaders = getCorsHeaders(request);

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

    const result = await uploadFromBuffer(buffer, safeConfigId);

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