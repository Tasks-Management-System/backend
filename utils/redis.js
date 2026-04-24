let pubClient = null;
let subClient = null;

if (process.env.REDIS_URL) {
  const Redis = (await import("ioredis")).default;

  pubClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  pubClient.on("error", (err) => {
    console.error("Redis pubClient error:", err.message);
  });

  subClient = pubClient.duplicate();

  subClient.on("error", (err) => {
    console.error("Redis subClient error:", err.message);
  });

  try {
    await pubClient.connect();
    await subClient.connect();
    console.log("Redis connected.");
  } catch (err) {
    console.error("Redis connection failed, running without Redis:", err.message);
    pubClient = null;
    subClient = null;
  }
}

export { pubClient, subClient };
