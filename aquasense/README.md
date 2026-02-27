# AquaSense AI — Backend API

Water quality monitoring API that converts raw sensor data into plain-language risk insights.

---

## Setup

```bash
npm install
cp .env.example .env
# Fill in .env values
npm run dev
```

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register` | None | Create account |
| POST | `/api/users/login` | None | Step 1: Submit credentials → get OTP in terminal |
| POST | `/api/users/verify-otp` | None | Step 2: Submit OTP → get JWT token |
| GET  | `/api/users/profile` | JWT | Get logged-in user profile |

### Sensors
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/sensors/register` | JWT | Register a new sensor, get API key |
| GET  | `/api/sensors/my-sensors` | JWT | List your sensors |
| GET  | `/api/sensors/analytics/:sensorId` | JWT | 24-hour analytics + trends |

### Readings (Hardware)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/readings/upload` | API Key (in body) | Submit a sensor reading |
| GET  | `/api/readings/sensor/:sensorId` | JWT | View reading history |

### Alerts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET   | `/api/alerts/my-alerts` | JWT | View your alerts |
| PATCH | `/api/alerts/resolve/:id` | JWT | Mark alert as resolved |

### AI Analysis
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/analyze` | JWT | Analyze readings without saving |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | Server health check (for Render) |

---

## Usage Flow (Postman / Frontend)

### 1. Register
```json
POST /api/users/register
{
  "username": "manager1",
  "email": "manager@company.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "organization_type": "pharmaceutical"
}
```

### 2. Login
```json
POST /api/users/login
{ "email": "manager@company.com", "password": "SecurePass123" }
```
→ Check server terminal for OTP

### 3. Verify OTP → get token
```json
POST /api/users/verify-otp
{ "email": "manager@company.com", "otp": "482910" }
```
→ Returns `token`. Use this in all future requests as:
`Authorization: Bearer <token>`

### 4. Register a Sensor
```json
POST /api/sensors/register
Authorization: Bearer <token>
{ "sensor_name": "Main Borehole", "location": "Building A" }
```
→ Returns `apiKey`. Save this — your hardware sends it with readings.

### 5. Upload a Reading (from hardware)
```json
POST /api/readings/upload
{
  "api_key": "AQ-abc123...",
  "ph": 6.2,
  "turbidity": 12,
  "temperature": 24,
  "dissolved_oxygen": 4.8,
  "tds": 350
}
```
→ Returns risk level, AI explanation, and compliance classification.

---

## Deploying to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set environment variables:
   - `DATABASE_URL` — your Postgres connection string (Render provides a free Postgres DB)
   - `JWT_SECRET` — a long random string (use [randomkeygen.com](https://randomkeygen.com))
   - `NODE_ENV` — `production`
5. Build command: `npm install`
6. Start command: `npm start`
7. Deploy!

Alternatively, commit `render.yaml` to your repo root and Render will auto-configure everything.
