export default () => ({
    PORT: parseInt(process.env.PORT, 10) || 3000,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    GRAPHQL_PLAYGROUND: process.env.GRAPHQL_PLAYGROUND === 'true',
    GRAPHQL_DEBUG: process.env.GRAPHQL_DEBUG === 'true',
    CORS_ENABLED: process.env.CORS_ENABLED === 'true',
    CORS_ORIGIN: process.env.CORS_ORIGIN,
  });
  