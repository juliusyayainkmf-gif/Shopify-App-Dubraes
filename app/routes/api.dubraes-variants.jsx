import { ensureCustomDubraesProduct } from "../services/dubraes-product.server";
import { unauthenticated } from "../shopify.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ success: false, message: "Missing shop parameter." }, 400);
  }

  try {
    const { admin } = await unauthenticated.admin(shop);
    const setup = await ensureCustomDubraesProduct(admin);

    return json({
      success: true,
      product: setup.product,
      variants: {
        withCustomization: Number(
          setup.variants.withCustomization.numericId,
        ),
        withoutCustomization: Number(
          setup.variants.withoutCustomization.numericId,
        ),
      },
    });
  } catch (error) {
    return json(
      {
        success: false,
        message: error.message || "Unable to load Dubraes variants.",
      },
      500,
    );
  }
};

export const action = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  return json({ success: false, message: "Method not allowed." }, 405);
};
