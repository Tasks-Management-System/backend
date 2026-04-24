// // utils/redis.js
// import Redis from "ioredis";

// export const pubClient = new Redis({
//   host: "127.0.0.1",
//   port: 6379,
// });

// export const subClient = pubClient.duplicate();



// utils/redis.js

let pubClient = null;
let subClient = null;

if (process.env.REDIS_URL) {
  const Redis = (await import("ioredis")).default;

  pubClient = new Redis(process.env.REDIS_URL);

  pubClient.on("error", (err) => {
    console.error("Redis Error:", err);
  });

  subClient = pubClient.duplicate();
}

export { pubClient, subClient };