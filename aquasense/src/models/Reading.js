const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reading = sequelize.define('Reading', {
  ph: { type: DataTypes.FLOAT },
  turbidity: { type: DataTypes.FLOAT },
  temperature: { type: DataTypes.FLOAT },
  tds: { type: DataTypes.FLOAT },
  dissolved_oxygen: { type: DataTypes.FLOAT },
  flow_rate: { type: DataTypes.FLOAT },
  risk_level: { type: DataTypes.STRING },
  ai_explanation: { type: DataTypes.TEXT }
});

module.exports = Reading;
