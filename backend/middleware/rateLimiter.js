const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: {
    message: "Too many requests, slow down...",
  },
});

module.exports = { apiLimiter };