import { v2 as cloudinary } from "cloudinary";

export const action = async () => {
  try {
    // cloudinary.config({
    //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //   api_key: process.env.CLOUDINARY_API_KEY,
    //   api_secret: process.env.CLOUDINARY_API_SECRET,
    // });

    cloudinary.config({
      cloud_name: "djhh5ylhc",
      api_key: "151814683284192",
      api_secret: "F7xR5W-WITmur6qLZYWXE6tsdho",
    });

    const result = await cloudinary.api.resources({
      max_results: 50,
    });

    console.log("CLOUDINARY RAW:", result);

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