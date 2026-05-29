/* eslint-env node */
import { authenticate } from "../shopify.server";
import { listCloudinaryResources } from "../services/cloudinary.server";

export const action = async ({ request }) => {
  await authenticate.admin(request);

  try {
    const result = await listCloudinaryResources();

    return new Response(JSON.stringify({
      success: true,
      count: result.resources.length,
      resources: result.resources,
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("CLOUDINARY ERROR:", err);

    return new Response(JSON.stringify({
      success: false,
      error: err.message,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  }
};
