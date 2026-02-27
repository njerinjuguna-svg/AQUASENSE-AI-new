const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define('Alert', {
  message: { type: DataTypes.TEXT, allowNull: false },
  severity: { type: DataTypes.STRING, defaultValue: 'WARNING' },
  status: { type: DataTypes.ENUM('active', 'resolved'), defaultValue: 'active' },
  resolvedAt: { type: DataTypes.DATE, allowNull: true }
});

module.exports = Alert;
