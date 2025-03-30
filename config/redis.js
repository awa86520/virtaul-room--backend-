const { createClient } = require("redis");

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  },
});

redisClient.on("error", (err) => console.error(" Redis Error:", err));

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Connected to Redis");
    }
  } catch (err) {
    console.error(" Redis Connection Failed:", err);
  }
};


connectRedis();

module.exports = { redisClient, connectRedis };




