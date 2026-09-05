import { Sequelize } from 'sequelize';
import pg from 'pg';

let databaseUrl: string;

if (process.env.NODE_ENV === 'production') {
  databaseUrl = process.env.PROD_DATABASE_URL as string;
}
else {
  databaseUrl = process.env.DATABASE_URL as string;
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: process.env.NODE_ENV === 'production'
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
