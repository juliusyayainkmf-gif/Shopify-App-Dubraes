import { json } from "@remix-run/node";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const action = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const configId = formData.get("configId");

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          public_id: `configs/${configId}`,
        },
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      );

      stream.end(buffer);
    });

    return json({ url: result.secure_url });
  } catch (err) {
    return json({ error: err.message }, { status: 500 });
  }
};