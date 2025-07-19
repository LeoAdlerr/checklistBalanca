export default () => ({
  port: parseInt(process.env.PORT || '8080', 10),
  cors: {
    origins: process.env.CORS_ORIGINS || 'http://localhost:5173',
  },
  db: {
    host: process.env.DB_HOST || 'test',
    port: parseInt(process.env.DB_PORT || '3333', 10),
    username: process.env.DB_USERNAME || 'teste',
    password: process.env.DB_PASSWORD || 'teste',
    database: process.env.DB_DATABASE || 'teste',
    synchronize: process.env.DB_SYNCHRONIZE === 'teste',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'teste',
  },
});