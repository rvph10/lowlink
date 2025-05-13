import Redis from "ioredis";

// Environment variables with fallbacks
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Redis connection options
const options = {
  // Maximum number of retries
  maxRetriesPerRequest: 5,
  // Enable automatic error recovery
  enableOfflineQueue: true,
  // Reconnect strategy
  reconnectOnError: (err: { message: string }) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true;
    }
    return false;
  },
};

// Create a singleton Redis instance
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    // Create a new Redis instance if one doesn't exist
    redis = new Redis(redisUrl, options);

    // Handle connection events for debugging in development
    if (process.env.NODE_ENV === "development") {
      redis.on("connect", () => {
        console.log("Connected to Redis");
      });

      redis.on("error", (err) => {
        console.error("Redis connection error:", err);
      });
    }
  }

  return redis;
}

// Key prefixes for different types of data to avoid key collisions
export const REDIS_KEYS = {
  LINK: "link:", // For storing short link mappings
  ANALYTICS: "analytics:", // For analytics data
  RATE_LIMIT: "ratelimit:", // For rate limiting
  QR_CODE: "qrcode:", // For storing QR code data
  PAGINATION: "pagination:", // For caching pagination results
  TRENDING: "trending:", // For sorted set of trending links
  USER_LINKS: "user-links:", // For caching a user's links
};

// Cache TTL values (in seconds)
export const TTL = {
  LINK: 86400 * 7, // 7 days for link mapping
  ANALYTICS_DASHBOARD: 300, // 5 minutes for analytics dashboards
  QR_CODE: 86400 * 30, // 30 days for QR codes
  PAGINATION: 60, // 1 minute for pagination results
  USER_LINKS: 300, // 5 minutes for user's links list
};

export default getRedisClient();
