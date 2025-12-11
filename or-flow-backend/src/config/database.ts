

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DB_URL;

if (!dbUrl) {
    throw new Error("DB_URL is not defined in environment variables.");
}

const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false, 
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

export async function syncModels() {
    await sequelize.sync({ alter: true }); 
    console.log("Database tables synchronized.");
}

export default sequelize;