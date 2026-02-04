export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },

  server: {
    PORT: Number(process.env.PORT || 4000),
    NODE_ENV: process.env.NODE_ENV || 'development',
    ADMIN_FE_ORIGIN: process.env.ADMIN_FE_ORIGIN!,
  },

  credentials: {
    superAdminEmail: process.env.SUPERADMIN_EMAIL!,
    superAdminPassword: process.env.SUPERADMIN_PASSWORD!,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'it_is_just_a_secret_kmg_news_dev_local_1234567890',
  },

  linode: {
    region: process.env.LINODE_REGION!,
    endpoint: process.env.LINODE_ENDPOINT!,
    accessKey: process.env.LINODE_ACCESS_KEY!,
    bucket: process.env.LINODE_BUCKET!,
    secretKey: process.env.LINODE_SECRET_KEY!,
  }
};
