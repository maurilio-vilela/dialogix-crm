import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs'; // Importar o módulo fs

config();

const databasePassword = fs.readFileSync(process.env.DATABASE_PASSWORD_FILE || '', 'utf8').trim();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: databasePassword,
  database: process.env.DATABASE_NAME,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
