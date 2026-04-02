import { v2 as cloudinary } from "cloudinary";
import { getCorsHeaders } from "../utils/cors.server";

export const loader = async ({ request }) => {
  return new Response(null, {
    headers: getCorsHeaders(request),
  });
};

export const action = async ({ request }) => {
  const corsHeaders = getCorsHeaders(request);

  try {
    const body = await request.json();
    const { public_id, new_name } = body;

    if (!public_id || !new_name) {
      return new Response(
        JSON.stringify({ error: "Missing fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ sanitize new name
    const safeName = new_name.replace(/[^a-zA-Z0-9_-]/g, "");
    if (!safeName) {
      return new Response(
        JSON.stringify({ error: "Invalid name" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ keep same folder (configs/)
    const folder = public_id.split("/")[0];
    const new_public_id = `${folder}/${safeName}`;

    // ⚠️ IMPORTANT: you used resource_type: "image" for PDFs
    const result = await cloudinary.uploader.rename(
      public_id,
      new_public_id,
      {
        resource_type: "image",
        overwrite: true,
      }
    );

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