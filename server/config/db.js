const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'code_genius',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL connected: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);

    // Keep startup sync safe by default.
    // Set DB_SYNC_ALTER=true only when you intentionally want schema alterations.
    const shouldAlter = process.env.DB_SYNC_ALTER === 'true';
    await sequelize.sync(shouldAlter ? { alter: true } : undefined);
    console.log('Database tables synchronized.');
  } catch (error) {
    console.error(`MySQL connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
