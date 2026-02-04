export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },

  server: {
    PORT: Number(process.env.PORT || 4000),
    NODE_ENV: process.env.NODE_ENV || 'development',
    USER_FE_ORIGIN: process.env.USER_FE_ORIGIN,
  },

  redis: {
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT || 6379),
    db: Number(process.env.REDIS_DB || 0),
    password: process.env.REDIS_PASSWORD,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'kmg-fact-check:',
  },
};
