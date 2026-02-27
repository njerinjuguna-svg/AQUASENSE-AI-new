const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const sequelize = require('./config/database');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' }
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' }
});

// ─── Import Models & Define Relationships ─────────────────────────────────────
const User    = require('./models/User');
const Sensor  = require('./models/Sensor');
const Reading = require('./models/Reading');
const Alert   = require('./models/Alert');

User.hasMany(Sensor,      { foreignKey: 'userId',    onDelete: 'CASCADE' });
Sensor.belongsTo(User,    { foreignKey: 'userId' });
Sensor.hasMany(Reading,   { foreignKey: 'sensorId',  onDelete: 'CASCADE' });
Reading.belongsTo(Sensor, { foreignKey: 'sensorId' });
Reading.hasOne(Alert,     { foreignKey: 'ReadingId', onDelete: 'CASCADE' });
Alert.belongsTo(Reading,  { foreignKey: 'ReadingId' });

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/users',    authLimiter, require('./routes/routes_users'));
app.use('/api/sensors',  require('./routes/routes_sensors'));
app.use('/api/readings', require('./routes/routes_readings'));
app.use('/api/alerts',   require('./routes/routes_alerts'));
app.use('/api/ai',       require('./routes/routes_ai'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'AquaSense AI API', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error.', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');

    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 AquaSense AI API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
