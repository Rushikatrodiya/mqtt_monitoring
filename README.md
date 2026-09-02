# L1 monitoring tool — MQTT Device Monitoring Dashboard

A real-time IoT sensor monitoring system built with **Node.js + Express** (backend) and **React + Vite** (frontend). Devices publish telemetry via MQTT; a watchdog detects stale/offline devices and triggers email alerts; the frontend polls the REST API and renders a live dashboard.

---

## 🔗 Live Demo

- **Dashboard:** https://monitoring.rushikatrodiya.in
- **API:**
  - https://api.rushikatrodiya.in/api/devices
  - https://api.rushikatrodiya.in/api/devices/history

> Hosted on an AWS EC2 instance. If the link is unresponsive, it may have been 
> stopped to save resources — please reach out and I can bring it back up, or 
> see the setup instructions below to run it locally.

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

## 🏛️ Architecture & Key Technical Decisions

This project follows a decoupled, real-time monitoring architecture designed for simplicity and performance:

1. **Decoupled Ingestion & Monitoring:** 
   - The MQTT ingestion layer (`mqtt.client.js` / `mqtt.handler.js`) is solely responsible for receiving messages and rapidly updating the latest timestamp in memory. 
   - A completely separate Watchdog background process (`watchdog.service.js`) loops every 5 seconds to evaluate device freshness (`lastSeenAt` vs `expectedIntervalMs`), making the system highly resilient even under high message throughput.

2. **In-Memory State Management:** 
   - Instead of a traditional database, the backend uses a fast, transient Node.js `Map` (`device.store.js`) for storing the live device states, and a rolling array buffer (`history.store.js`) for the last 5 minutes of fleet health data. This avoids disk I/O bottlenecks and is perfectly suited for an ephemeral monitoring dashboard.

3. **Intelligent Alerting:**
   - The alerting layer (`alert.service.js`) implements a cooldown mechanism so that if a device repeatedly bounces between online and offline, or stays offline for hours, it doesn't spam the administrator's inbox.

4. **Polling vs WebSockets:**
   - The frontend uses short-polling via **TanStack React Query** rather than WebSockets. Since this is an L1 dashboard meant to aggregate states across potentially thousands of nodes, short-polling every few seconds significantly reduces server connection overhead while still providing near real-time feedback.

---

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/)

---

### 1. Set up environment variables

```bash
cd backend
cp .env.example .env
# Fill in your SMTP credentials in .env if you want email alerts
```

---

### 2. Start everything

```bash
cd backend
docker compose up -d --build
```

This single command starts **all three services**:

| Container | What it does |
|---|---|
| `mqtt_broker` | Mosquitto MQTT broker on port `1883` |
| `mqtt_backend` | Express API on `http://localhost:3000` |
| `mqtt_simulator` | Publishes fake sensor data so devices show as online |

---

### 3. Open the frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard available at `http://localhost:5173`.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/devices` | Returns all devices with status, lastSeenAt, type |
| `GET` | `/api/devices/history` | Returns fleet health history (for chart) |
| `POST` | `/api/devices/reset` | Resets all device statuses + clears chart history (demo use) |

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

## 🔄 Restart

### Why does the Pressure Sensor go OFFLINE on its own?

This is **intentional**. The simulator (`simulate-devices.js`) is configured so that `sensor_003` (Pressure Sensor) **stops publishing after its 4th message** — roughly 20 seconds after startup:

```js
{ deviceId: 'sensor_003', interval: 5000, silentAfter: 20000 }
// publishes every 5s, stops after 20s → 4 messages then silence
```

This simulates a real-world scenario where a device goes unresponsive mid-session. The watchdog detects the silence, marks it **OFFLINE**, and (if configured) sends an alert email — demonstrating the core monitoring behaviour of the system.

### The "Restart" button

Because `sensor_003` permanently stops publishing, repeated live demos would always end with a stuck OFFLINE device. To avoid restarting Docker between demos, the dashboard includes a **Reset Demo** button in the top-right of the header.

**What it does when clicked:**

| Action | Details |
|--------|---------|
| ✅ Clears fleet health chart | Removes all historical snapshots so the chart starts fresh |
| ✅ Resets all device statuses | Sets every device back to `ONLINE` with `lastSeenAt = now` |
| ✅ Refreshes the UI instantly | Both the chart and device table reload immediately |

> ⚠️ **For testing / demo purposes only.** It does not restart the simulator — `sensor_003` will go silent again after another 4 publishes (~20 seconds). Simply click Reset Demo again before your next demo run.

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
| Logging | Custom structured logger (`console.log` wrapper) |
| Frontend | React 19, Vite |
| Data Fetching | TanStack React Query |
| Charts | Recharts |
| Styling | Tailwind CSS v4 |
