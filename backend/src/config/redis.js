import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  enableAutoPipelining: true,
  lazyConnect: false,
});

redis.on("error", (e) => {
  console.error("[Redis] error:", e.message);
});
redis.on("connect", () => {
  console.log("[Redis] connected");
});
