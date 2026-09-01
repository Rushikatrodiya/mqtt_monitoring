# Fleet Pulse — MQTT Device Monitoring Dashboard

A real-time IoT sensor monitoring system built with **Node.js + Express** (backend) and **React + Vite** (frontend). Devices publish telemetry via MQTT; a watchdog detects stale/offline devices and triggers email alerts; the frontend polls the REST API and renders a live dashboard.

---

## 📁 Project Structure

```
MQTT_Monitoring/
├── backend/                        # Node.js Express API
│   ├── src/
│   │   ├── app.js                  # Express app setup, middleware, routes
│   │   ├── server.js               # Entry point — starts HTTP server, MQTT, Watchdog
│   │   ├── config/
│   │   │   ├── env.config.js       # Environment variables loaded via dotenv
│   │   │   └── devices.config.js   # Static device registry (ID, type, interval)
│   │   ├── features/
│   │   │   ├── mqtt-ingestion/
│   │   │   │   ├── mqtt.client.js  # Connects to Mosquitto broker, subscribes to topics
│   │   │   │   └── mqtt.handler.js # Processes incoming MQTT messages → updates store
│   │   │   ├── device-monitoring/
│   │   │   │   ├── device.store.js # In-memory store of all device states
│   │   │   │   ├── device.service.js# Business logic — merge config + store data
│   │   │   │   ├── device.routes.js# REST routes: GET /api/devices, GET /api/devices/history
│   │   │   │   └── history.store.js# Circular buffer of fleet health snapshots (for chart)
│   │   │   └── alerting/
│   │   │       ├── watchdog.service.js # Polls device store, marks ONLINE/OFFLINE, records history
│   │   │       ├── alert.service.js    # Decides when to fire an alert (cooldown logic)
│   │   │       └── email.service.js    # Sends alert emails via Nodemailer/SMTP
│   │   └── shared/
│   │       └── logger.js           # Winston logger
│   ├── simulator/
│   │   └── simulate-devices.js     # Publishes fake MQTT messages to test the system
│   ├── mosquitto/
│   │   └── mosquitto.conf          # Mosquitto broker config
│   ├── .env                        # Environment variables (not committed)
│   ├── docker-compose.yml          # Runs Mosquitto broker via Docker
│   ├── Dockerfile                  # Docker image for backend
│   └── package.json
│
└── frontend/                       # React + Vite dashboard
    ├── src/
    │   ├── main.jsx                # Entry point — React Query provider
    │   ├── App.jsx                 # Root component
    │   ├── index.css               # Global styles + CSS variables
    │   ├── api/
    │   │   └── deviceApi.js        # Axios calls to backend REST API
    │   ├── hooks/
    │   │   ├── useDevices.js       # Fetches + sorts devices, dynamic poll interval
    │   │   ├── useFleetHistory.js  # Fetches history data for fleet health chart
    │   │   └── useQueryData.js     # Shared React Query wrapper
    │   ├── components/
    │   │   ├── Dashboard.jsx       # Main layout container
    │   │   ├── DashboardHeader.jsx # Title, live clock, online/total stats
    │   │   ├── BrokerStatus.jsx    # Broker connection indicator
    │   │   ├── FleetHealthChart.jsx# Recharts area chart — online nodes over time
    │   │   ├── DeviceTable.jsx     # Table shell with column headers
    │   │   ├── DeviceRow.jsx       # Individual device row with status
    │   │   ├── FreshnessRing.jsx   # SVG arc showing how fresh the last message is
    │   │   └── LiveClock.jsx       # Ticking HH:MM:SS clock
    │   └── utils/
    │       └── formatters.js       # formatTime() and timeAgo() helpers
    └── package.json
```

---

## ⚙️ How It Works

```
Simulator → MQTT Broker (Mosquitto) → mqtt.client.js → mqtt.handler.js → device.store.js
                                                                                  ↓
                                                               watchdog.service.js (every 2s)
                                                               ├── marks ONLINE / OFFLINE
                                                               ├── records history snapshot
                                                               └── fires alert email if offline

Frontend → GET /api/devices        → device.service.js → device.store.js + devices.config.js
         → GET /api/devices/history → history.store.js
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/) (for Mosquitto broker)

---

### 1. Start the MQTT Broker

```bash
cd backend
docker-compose up -d
```

This starts a Mosquitto MQTT broker on `mqtt://localhost:1883`.

---

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

API will be available at `http://localhost:3000`.

**Backend `.env` file** (`backend/.env`):
```env
PORT=3000
MQTT_URL=mqtt://localhost:1883

# Email alerts (optional)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
ALERT_EMAIL_FROM=alerts@example.com
ALERT_EMAIL_TO=admin@example.com
```

---

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard will open at `http://localhost:5173`.

---

### 4. Run the Device Simulator (optional)

```bash
cd backend
node simulator/simulate-devices.js
```

Simulates `sensor_001`, `sensor_002`, and `sensor_003` publishing MQTT messages at their configured intervals.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/devices` | Returns all devices with status, lastSeenAt, type |
| `GET` | `/api/devices/history` | Returns fleet health history (for chart) |

### Example response — `GET /api/devices`

```json
[
  {
    "deviceId": "sensor_001",
    "type": "Temperature",
    "status": "ONLINE",
    "lastSeenAt": "2026-09-01T15:30:00.000Z",
    "expectedIntervalMs": 10000
  },
  {
    "deviceId": "sensor_002",
    "type": "Humidity",
    "status": "ONLINE",
    "lastSeenAt": "2026-09-01T15:30:02.000Z",
    "expectedIntervalMs": 15000
  },
  {
    "deviceId": "sensor_003",
    "type": "Pressure",
    "status": "OFFLINE",
    "lastSeenAt": "2026-09-01T15:10:00.000Z",
    "expectedIntervalMs": 5000
  }
]
```

---

## 🔧 Device Configuration

Devices are registered in `backend/src/config/devices.config.js`:

```js
const devices = [
  { deviceId: 'sensor_001', type: 'Temperature', expectedIntervalMs: 10000 },
  { deviceId: 'sensor_002', type: 'Humidity',    expectedIntervalMs: 15000 },
  { deviceId: 'sensor_003', type: 'Pressure',    expectedIntervalMs: 5000  },
];
```

To add a new device, just add an entry here. The watchdog will automatically monitor it.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| MQTT Broker | Mosquitto (Docker) |
| Backend | Node.js, Express 5, MQTT.js |
| Email Alerts | Nodemailer |
| Logging | Winston |
| Frontend | React 19, Vite |
| Data Fetching | TanStack React Query |
| Charts | Recharts |
| Styling | Tailwind CSS v4 |
