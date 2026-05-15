import { DataSource } from 'typeorm';
import { env } from './environment';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  synchronize: env.NODE_ENV === 'development',
  logging: env.NODE_ENV === 'development',
  entities: ['src/modules/**/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
});
