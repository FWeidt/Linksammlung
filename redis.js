const { v4: uuidv4 } = require('uuid');
const Redis = require("ioredis");

const redis = new Redis({
  port: 6379,
  host: "192.168.2.125",
  family: 4,
  db: 0,
});
exports.redis = redis;
