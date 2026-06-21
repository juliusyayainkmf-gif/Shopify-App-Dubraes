const allowedOrigins = [
  "https://dubraes-inventory-dashboard.myshopify.com",
  "https://www.dubraes.com",
  "https://dubraes.com",
  "https://www.keepmefreshusa.com",
  "https://keepmefreshusa.com",
];

export function getCorsHeaders(request) {
  const origin = request.headers.get("origin");

  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
      ? origin
      : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function isAllowedOrigin(request) {
  return allowedOrigins.includes(request.headers.get("origin"));
}
