import { Sequelize } from 'sequelize';
import pg from 'pg';

const databaseUrl = process.env.DATABASE_URL as string;

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {},
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
