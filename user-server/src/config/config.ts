export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },

  server: {
    PORT: Number(process.env.PORT || 4000),
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
};
