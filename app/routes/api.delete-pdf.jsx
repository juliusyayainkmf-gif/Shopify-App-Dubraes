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
    const { public_id } = body;

    if (!public_id) {
      return new Response(JSON.stringify({ error: "Missing public_id" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
      return new Response(
        JSON.stringify({ error: "Failed to delete file", result }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

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
    console.error("DELETE ERROR:", err);

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};