# 💧 AquaSense AI — Water Quality Monitoring API

A production-ready REST API for real-time water quality monitoring, AI-driven risk analysis, and automated alerting. Built for industries including pharmaceuticals, food processing, aquaculture, and schools.

**Live API:** [https://aquasense-ai-api.onrender.com](https://aquasense-ai-api.onrender.com)  
**GitHub:** [https://github.com/AquaSenseApp/aquasense-backend](https://github.com/AquaSenseApp/aquasense-backend)

---

## 🚀 Features

- **JWT Authentication** — Secure login with 24-hour token expiry
- **Password Reset** — Secure token-based reset via email (Resend)
- **Sensor Management** — Register sensors with hashed API keys
- **AI Risk Analysis** — Real-time water quality classification (LOW / MEDIUM / HIGH / CRITICAL)
- **Auto Alerting** — Alerts generated automatically on unsafe readings
- **Analytics** — 24-hour trend detection per sensor
- **Rate Limiting** — Brute-force protection on all auth endpoints
- **Compliance Engine** — pH, turbidity, dissolved oxygen, temperature classification

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js >= 18 |
| Framework | Express.js |
| Database | PostgreSQL (Sequelize ORM) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Email | Resend |
| Security | Helmet, CORS, express-rate-limit |
| Deployment | Render |

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the project:

```env
# Database
DATABASE_URL=postgres://user:password@host:5432/dbname

# Auth
JWT_SECRET=your_jwt_secret_here

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development

# Seed (set to true on first deploy only)
RUN_SEED=false
```

---

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/AquaSenseApp/aquasense-backend.git
cd aquasense-backend

# Install dependencies
npm install

# Set up your .env file (see above)

# Run in development
npm run dev

# Run in production
npm start
```

---

## 📡 API Endpoints

Base URL: `https://aquasense-ai-api.onrender.com`

### 🔐 Auth — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/users/register` | None | Register a new user |
| POST | `/api/users/login` | None | Login and receive JWT token |
| GET | `/api/users/profile` | Bearer Token | Get logged-in user profile |
| POST | `/api/users/forgot-password` | None | Send password reset email |
| POST | `/api/users/reset-password` | None | Reset password using token |

#### Register
```json
POST /api/users/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "organization_type": "pharmaceutical"
}
```

#### Login
```json
POST /api/users/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```
Returns a `token` — include it as `Authorization: Bearer <token>` on all protected routes.

#### Forgot Password
```json
POST /api/users/forgot-password
{
  "email": "john@example.com"
}
```

#### Reset Password
```json
POST /api/users/reset-password
{
  "token": "token_from_reset_email",
  "newPassword": "NewSecurePass123"
}
```

---

### 📡 Sensors — `/api/sensors`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/sensors/register` | Bearer Token | Register a new sensor |
| GET | `/api/sensors/my-sensors` | Bearer Token | Get all sensors for logged-in user |
| GET | `/api/sensors/:sensorId` | Bearer Token | Get a single sensor by ID |
| GET | `/api/sensors/analytics/:sensorId` | Bearer Token | Get 24hr analytics for a sensor |

#### Register Sensor
```json
POST /api/sensors/register
{
  "sensor_name": "Main Borehole Sensor",
  "location": "Nairobi, Kenya"
}
```
Returns a one-time API key — **save it immediately**, it will not be shown again.

---

### 📊 Readings — `/api/readings`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/readings/upload` | API Key (body) | Upload a sensor reading |
| GET | `/api/readings/sensor/:sensorId` | Bearer Token | Get reading history for a sensor |

#### Upload Reading (called by hardware sensor)
```json
POST /api/readings/upload
{
  "api_key": "AQ-xxxxxxxxxxxxxxxx",
  "ph": 7.2,
  "turbidity": 3.5,
  "temperature": 22.4,
  "tds": 340,
  "dissolved_oxygen": 8.1,
  "flow_rate": 1.5
}
```

---

### 🚨 Alerts — `/api/alerts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/alerts/my-alerts` | Bearer Token | Get all alerts for logged-in user |
| PATCH | `/api/alerts/resolve/:id` | Bearer Token | Resolve an alert by ID |

---

### 🤖 AI Analysis — `/api/ai`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/analyze` | Bearer Token | Analyze water quality without saving to DB |

#### Analyze Water Quality
```json
POST /api/ai/analyze
{
  "ph": 5.1,
  "turbidity": 65,
  "temperature": 31,
  "dissolved_oxygen": 2.8,
  "organization_type": "pharmaceutical"
}
```

---

### ❤️ Health Check

```
GET /health
```
```json
{
  "status": "OK",
  "service": "AquaSense AI API",
  "timestamp": "2026-02-27T12:00:00.000Z"
}
```

---

## 🧠 AI Risk Levels

| Level | Description |
|---|---|
| `LOW` | All parameters within safe range |
| `MEDIUM` | Some parameters slightly outside optimal range |
| `HIGH` | Elevated risk — treatment recommended |
| `CRITICAL` | Dangerous — do not use water without treatment |

---

## 🌱 Seed Data

To populate the database with demo data on first deploy, set `RUN_SEED=true` in your environment variables. This creates 5 demo organizations, 5 sensors, 500 readings, and associated alerts.

**Demo credentials (all use password `Aqua@1234`):**

| Organization | Email |
|---|---|
| GreenField Pharmaceuticals | greenfield@aquasense.com |
| BlueWater Processing Ltd | bluewater@aquasense.com |
| RiverFresh Aquaculture | riverfresh@aquasense.com |
| City Central School | cityschool@aquasense.com |
| Sunrise Bottling Company | sunrise@aquasense.com |

> ⚠️ Set `RUN_SEED=false` after first deploy to prevent duplicate data.

---

## 🔒 Security

- Passwords hashed with bcryptjs (salt rounds: 10)
- Sensor API keys stored as SHA-256 hashes
- JWT tokens expire after 24 hours
- Rate limiting: 100 requests/15min globally, 10 requests/15min on auth routes
- Helmet.js security headers on all responses
- Sensitive fields excluded from all API responses

---

## 📄 License

MIT
