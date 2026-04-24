let pubClient = null;
let subClient = null;

if (process.env.REDIS_URL) {
  const Redis = (await import("ioredis")).default;

  // Upstash requires TLS — upgrade redis:// to rediss:// automatically
  const redisUrl = process.env.REDIS_URL.replace(/^redis:\/\//, "rediss://");

  pubClient = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    tls: {},
  });

  pubClient.on("error", (err) => {
    console.error("Redis pubClient error:", err.message);
  });

  pubClient.on("connect", () => {
    console.log("Redis connected.");
  });

  subClient = pubClient.duplicate();

  subClient.on("error", (err) => {
    console.error("Redis subClient error:", err.message);
  });
}

export { pubClient, subClient };
