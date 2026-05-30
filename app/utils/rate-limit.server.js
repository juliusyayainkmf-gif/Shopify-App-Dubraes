const buckets = new Map();

const getClientIp = (request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
};

export function checkRateLimit(request, { maxRequests, windowMs }) {
  const now = Date.now();
  const key = getClientIp(request);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
    };
  }

  bucket.count += 1;

  return {
    allowed: true,
    remaining: maxRequests - bucket.count,
    resetAt: bucket.resetAt,
  };
}

export function getRateLimitHeaders(result) {
  return {
    "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetAt / 1000).toString(),
  };
}
