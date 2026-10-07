export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const hasAuth =
  hasDatabase &&
  Boolean(process.env.NEXTAUTH_SECRET) &&
  (Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) ||
    Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ||
    Boolean(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM));
