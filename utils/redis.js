// utils/redis.js
import Redis from "ioredis";

export const pubClient = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

export const subClient = pubClient.duplicate();