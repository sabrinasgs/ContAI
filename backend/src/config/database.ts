import { DataSource } from 'typeorm';
import { Lancamento } from '../entities/Lancamento';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true, // apenas em desenvolvimento
  logging: false,
  entities: [Lancamento],
});