import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';

config();

// Extrair senha do DATABASE_URL ou usar DATABASE_PASSWORD/DATABASE_PASSWORD_FILE
let databasePassword: string;
let databaseHost: string;
let databasePort: number;
let databaseUser: string;
let databaseName: string;

if (process.env.DATABASE_URL) {
  // Extrair componentes do DATABASE_URL
  const urlMatch = process.env.DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!urlMatch) {
    throw new Error('Invalid DATABASE_URL format');
  }
  const [_, user, password, host, port, name] = urlMatch;
  databaseUser = user;
  databasePassword = password;
  databaseHost = host;
  databasePort = parseInt(port, 10);
  databaseName = name;
} else if (process.env.DATABASE_PASSWORD_FILE) {
  databasePassword = fs.readFileSync(process.env.DATABASE_PASSWORD_FILE, 'utf8').trim();
  databaseHost = process.env.DATABASE_HOST || 'localhost';
  databasePort = Number(process.env.DATABASE_PORT) || 5432;
  databaseUser = process.env.DATABASE_USER;
  databaseName = process.env.DATABASE_NAME;
} else if (process.env.DATABASE_PASSWORD) {
  databasePassword = process.env.DATABASE_PASSWORD;
  databaseHost = process.env.DATABASE_HOST || 'localhost';
  databasePort = Number(process.env.DATABASE_PORT) || 5432;
  databaseUser = process.env.DATABASE_USER;
  databaseName = process.env.DATABASE_NAME;
} else {
  throw new Error('DATABASE_URL or (DATABASE_PASSWORD + DATABASE_HOST) must be set');
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: databaseHost,
  port: databasePort,
  username: databaseUser,
  password: databasePassword,
  database: databaseName,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
