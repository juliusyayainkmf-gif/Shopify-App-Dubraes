import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { authenticate } from "../shopify.server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getCorsHeaders = () => ({
  "Access-Control-Allow-Origin": "https://admin.shopify.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});

const uploadImageFromBuffer = (buffer, configId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "custom-logos",
        public_id: `${configId}-${Date.now()}`, 
        overwrite: false,

        transformation: [
          { width: 1024, crop: "limit" },
          { quality: "auto" },
        ],
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ✅ Handle preflight
export const loader = async () => {
  return new Response(null, {
    headers: getCorsHeaders(),
  });
};

export const action = async ({ request }) => {
  const corsHeaders = getCorsHeaders();

  try {
    // 🔒 Shopify Admin authentication (KEEP THIS)
    await authenticate.admin(request);

    const formData = await request.formData();
    const file = formData.get("file");
    const configId = formData.get("configId");

    // ✅ Validation
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!file.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "Only images allowed" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (file.size > 2 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Max 2MB only" }), {
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

    const result = await uploadImageFromBuffer(buffer, safeConfigId);

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
    console.error("UPLOAD LOGO ERROR:", err);

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};