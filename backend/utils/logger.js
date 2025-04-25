// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'socket-events.log' })
  ]
});

module.exports = logger;

// config/socketConfig.js
module.exports = {
  CORS_OPTIONS: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  },
  PING_TIMEOUT: 60000,
  PING_INTERVAL: 25000
};