import redis, { REDIS_KEYS, TTL } from "@/lib/redis";

export interface LinkData {
  id: string;
  originalUrl: string;
  userId: string;
  title?: string;
  createdAt: string;
}

export class RedisService {
  /**
   * Store a short link mapping in Redis
   * @param shortCode The shortened code/path
   * @param linkData The original link data
   */
  static async storeShortLink(
    shortCode: string,
    linkData: LinkData,
  ): Promise<void> {
    try {
      // Store the full link data as JSON
      await redis.set(
        `${REDIS_KEYS.LINK}${shortCode}`,
        JSON.stringify(linkData),
        "EX",
        TTL.LINK,
      );

      // Also add this link to the user's links set
      // This helps quickly retrieve all links for a user
      await redis.sadd(`${REDIS_KEYS.USER_LINKS}${linkData.userId}`, shortCode);

      // Set expiry on the user links set
      await redis.expire(
        `${REDIS_KEYS.USER_LINKS}${linkData.userId}`,
        TTL.USER_LINKS,
      );
    } catch (error) {
      console.error("Redis storeShortLink error:", error);
      // Don't throw error - if Redis fails, we still have the database
    }
  }

  /**
   * Get the original URL for a short code
   * @param shortCode The shortened code/path
   * @returns The original link data or null if not found
   */
  static async resolveShortLink(shortCode: string): Promise<LinkData | null> {
    try {
      const data = await redis.get(`${REDIS_KEYS.LINK}${shortCode}`);
      if (!data) return null;

      return JSON.parse(data) as LinkData;
    } catch (error) {
      console.error("Redis resolveShortLink error:", error);
      return null;
    }
  }

  /**
   * Cache QR code data for a short link
   * @param shortCode The shortened code/path
   * @param qrCodeData The QR code data (typically a base64 string or URL)
   */
  static async storeQRCode(
    shortCode: string,
    qrCodeData: string,
  ): Promise<void> {
    try {
      await redis.set(
        `${REDIS_KEYS.QR_CODE}${shortCode}`,
        qrCodeData,
        "EX",
        TTL.QR_CODE,
      );
    } catch (error) {
      console.error("Redis storeQRCode error:", error);
    }
  }

  /**
   * Get cached QR code data for a short link
   * @param shortCode The shortened code/path
   * @returns The QR code data or null if not cached
   */
  static async getQRCode(shortCode: string): Promise<string | null> {
    try {
      return await redis.get(`${REDIS_KEYS.QR_CODE}${shortCode}`);
    } catch (error) {
      console.error("Redis getQRCode error:", error);
      return null;
    }
  }

  /**
   * Implement rate limiting for link creation
   * @param userId The user ID
   * @param limit The maximum number of requests allowed in the window
   * @param windowSecs The time window in seconds
   * @returns Object containing success status and remaining limit
   */
  static async rateLimit(
    userId: string,
    action: string = "create_link",
    limit: number = 100,
    windowSecs: number = 3600,
  ): Promise<{ success: boolean; remaining: number }> {
    const key = `${REDIS_KEYS.RATE_LIMIT}${userId}:${action}`;

    try {
      // Get current count
      const count = await redis.incr(key);

      // Set expiry if this is the first operation in this window
      if (count === 1) {
        await redis.expire(key, windowSecs);
      }

      // Check if we're over the limit
      if (count > limit) {
        return { success: false, remaining: 0 };
      }

      // Calculate remaining operations
      const remaining = Math.max(0, limit - count);
      return { success: true, remaining };
    } catch (error) {
      console.error("Redis rateLimit error:", error);
      // If Redis fails, allow the operation
      return { success: true, remaining: limit };
    }
  }

  /**
   * Cache analytics data for a link
   * @param linkId The link ID
   * @param data The analytics data to cache
   */
  static async cacheAnalytics(linkId: string, data: any): Promise<void> {
    try {
      await redis.set(
        `${REDIS_KEYS.ANALYTICS}${linkId}`,
        JSON.stringify(data),
        "EX",
        TTL.ANALYTICS_DASHBOARD,
      );
    } catch (error) {
      console.error("Redis cacheAnalytics error:", error);
    }
  }

  /**
   * Get cached analytics data for a link
   * @param linkId The link ID
   * @returns The analytics data or null if not cached
   */
  static async getAnalytics(linkId: string): Promise<any | null> {
    try {
      const data = await redis.get(`${REDIS_KEYS.ANALYTICS}${linkId}`);
      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error("Redis getAnalytics error:", error);
      return null;
    }
  }

  /**
   * Track a click on a link and increment stats
   * @param shortCode The shortened code/path
   * @param metadata Click metadata like device, location, etc.
   */
  static async trackClick(
    shortCode: string,
    metadata: any = {},
  ): Promise<void> {
    try {
      // Increment total clicks in a sorted set
      await redis.zincrby(`${REDIS_KEYS.TRENDING}`, 1, shortCode);

      // If we have detailed metadata, store it temporarily for batch processing
      if (Object.keys(metadata).length > 0) {
        const clickData = {
          shortCode,
          timestamp: new Date().toISOString(),
          ...metadata,
        };

        // Add to a list for batch processing later
        await redis.lpush(
          `${REDIS_KEYS.ANALYTICS}clicks`,
          JSON.stringify(clickData),
        );
      }
    } catch (error) {
      console.error("Redis trackClick error:", error);
    }
  }

  /**
   * Get trending links based on click counts
   * @param limit The maximum number of links to return
   * @returns Array of short codes and their click counts
   */
  static async getTrendingLinks(
    limit: number = 10,
  ): Promise<Array<{ shortCode: string; clicks: number }>> {
    try {
      // Get the top links with their scores
      const results = await redis.zrevrange(
        `${REDIS_KEYS.TRENDING}`,
        0,
        limit - 1,
        "WITHSCORES",
      );

      // Parse the results (comes as [member1, score1, member2, score2, ...])
      const trending = [];
      for (let i = 0; i < results.length; i += 2) {
        trending.push({
          shortCode: results[i],
          clicks: parseInt(results[i + 1], 10),
        });
      }

      return trending;
    } catch (error) {
      console.error("Redis getTrendingLinks error:", error);
      return [];
    }
  }

  /**
   * Cache paginated links results
   * @param userId The user ID
   * @param cursor The pagination cursor
   * @param limit The page size
   * @param data The paginated data
   */
  static async cachePaginatedLinks(
    userId: string,
    cursor: string | null,
    limit: number,
    data: any,
  ): Promise<void> {
    try {
      const key = `${REDIS_KEYS.PAGINATION}${userId}:${cursor || "null"}:${limit}`;
      await redis.set(key, JSON.stringify(data), "EX", TTL.PAGINATION);
    } catch (error) {
      console.error("Redis cachePaginatedLinks error:", error);
    }
  }

  /**
   * Get cached paginated links
   * @param userId The user ID
   * @param cursor The pagination cursor
   * @param limit The page size
   * @returns The cached paginated data or null
   */
  static async getCachedPaginatedLinks(
    userId: string,
    cursor: string | null,
    limit: number,
  ): Promise<any | null> {
    try {
      const key = `${REDIS_KEYS.PAGINATION}${userId}:${cursor || "null"}:${limit}`;
      const data = await redis.get(key);
      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error("Redis getCachedPaginatedLinks error:", error);
      return null;
    }
  }

  /**
   * Clear the cache for a specific link when it's updated
   * @param shortCode The short code to clear from cache
   */
  static async invalidateLinkCache(
    shortCode: string,
    userId: string,
  ): Promise<void> {
    try {
      // Delete the link mapping
      await redis.del(`${REDIS_KEYS.LINK}${shortCode}`);

      // Delete associated QR code if exists
      await redis.del(`${REDIS_KEYS.QR_CODE}${shortCode}`);

      // Invalidate user's links cache
      await redis.del(`${REDIS_KEYS.USER_LINKS}${userId}`);

      // Invalidate pagination cache keys for this user
      // We need to get all pagination keys for this user
      const paginationPattern = `${REDIS_KEYS.PAGINATION}${userId}:*`;
      const keys = await redis.keys(paginationPattern);

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Redis invalidateLinkCache error:", error);
    }
  }
}
