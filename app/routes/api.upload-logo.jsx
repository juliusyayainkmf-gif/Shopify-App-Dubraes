import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { authenticate } from "../shopify.server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageFromBuffer = (buffer, configId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "custom-logos",
        public_id: configId,
        overwrite: true,

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

export const loader = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://admin.shopify.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    console.log(admin);
    
    const formData = await request.formData();
    const file = formData.get("file");
    const configId = formData.get("configId");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://admin.shopify.com",
        },
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadImageFromBuffer(buffer, configId);

    return new Response(
      JSON.stringify({
        url: result.secure_url,
        public_id: result.public_id,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://admin.shopify.com",
        },
      }
    );
  } catch (err) {
    console.error("UPLOAD LOGO ERROR:", err);

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://admin.shopify.com",
      },
    });
  }
};