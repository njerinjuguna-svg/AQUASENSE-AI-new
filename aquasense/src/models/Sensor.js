const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sensor = sequelize.define('Sensor', {
  sensor_name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING },
  api_key: { type: DataTypes.STRING, unique: true, allowNull: false },
  api_key_hash: { type: DataTypes.STRING, allowNull: false }, // Security spec: store hashed key
  userId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
});

module.exports = Sensor;
