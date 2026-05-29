import { getCorsHeaders } from "../utils/cors.server";
import { authenticate } from "../shopify.server";
import { renameCloudinaryResource } from "../services/cloudinary.server";

const allowedFolders = ["configs", "configs/images"];

const getAllowedFolder = (publicId) => {
  if (typeof publicId !== "string") return null;
  return allowedFolders.find(
    (folder) => publicId === folder || publicId.startsWith(`${folder}/`),
  );
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

  await authenticate.admin(request);

  try {
    const body = await request.json();
    const { public_id, new_name } = body;

    if (!public_id || !new_name) {
      return new Response(
        JSON.stringify({ error: "Missing fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const folder = getAllowedFolder(public_id);
    if (!folder) {
      return new Response(
        JSON.stringify({ error: "Invalid public_id" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const safeName = new_name.replace(/[^a-zA-Z0-9_-]/g, "");
    if (!safeName) {
      return new Response(
        JSON.stringify({ error: "Invalid name" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const new_public_id = `${folder}/${safeName}`;

    const result = await renameCloudinaryResource(public_id, new_public_id);

    return new Response(
      JSON.stringify({
        success: true,
        result,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (err) {
    console.error("RENAME ERROR:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
};
