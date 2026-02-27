const { Sequelize } = require("sequelize");
require("dotenv").config();

const dbUri = process.env.DATABASE_URL;

if (!dbUri) {
  console.error("CRITICAL: No DATABASE_URL found in environment");
  process.exit(1);
}

const sequelize = new Sequelize(dbUri, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
      ? { require: true, rejectUnauthorized: false }
      : false
  }
});

module.exports = sequelize;
