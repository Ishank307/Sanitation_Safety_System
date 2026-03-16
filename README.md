# Sanitation Safety Backend — SAMVED 2026

Smart Safety and Assistance System for Sanitation Workers of Solapur Municipal Corporation

---

## Setup

```bash
cd sanitation-safety-backend
npm install
cp .env.example .env        # edit JWT_SECRET
npm run dev                 # dev with auto-reload
npm start                   # production
```

---

## API Routes

### Workers
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/workers/register` | None | Register a new worker |
| POST | `/api/workers/login` | None | Login, returns JWT token |
| GET | `/api/workers` | Supervisor | List all workers |
| GET | `/api/workers/:id` | Any | Get worker by ID |

**Register body:**
```json
{ "name": "Raju", "phone": "9876543210", "zone": "Zone-A", "password": "pass123", "medicalHistory": "None" }
```

---

### Shifts
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/shifts/start` | Worker | Log shift start |
| POST | `/api/shifts/end` | Worker | Log shift end (auto flags overwork) |
| GET | `/api/shifts/my` | Worker | Worker's own shift history |
| GET | `/api/shifts` | Supervisor | All shifts |

---

### Sensors (Raspberry Pi / Simulator)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/sensors/reading` | None* | Push sensor reading |
| GET | `/api/sensors/readings` | Supervisor | All readings (filter: `?zone=Zone-A&hazardous=true`) |
| GET | `/api/sensors/latest/:manholeId` | Any | Latest reading for a manhole |

**Sensor reading body:**
```json
{
  "manholeId": "MH-001",
  "zone": "Zone-A",
  "gasH2S": 5.2,
  "gasCO": 20,
  "gasCH4": 0.5,
  "o2Level": 20.5
}
```
*Add API key auth before production

---

### SOS
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/sos` | Worker | Trigger SOS alert |
| GET | `/api/sos` | Supervisor | All SOS (`?status=active`) |
| PATCH | `/api/sos/:id/resolve` | Supervisor | Mark SOS as resolved |

---

### Dashboard (Supervisor)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/dashboard/summary` | Supervisor | City-wide overview |
| GET | `/api/dashboard/zone/:zone` | Supervisor | Zone-wise breakdown |
| GET | `/api/dashboard/alerts` | Supervisor | All system alerts |
| PATCH | `/api/dashboard/alerts/:id/acknowledge` | Supervisor | Acknowledge alert |

---

## Auth
Pass JWT token in header:
```
Authorization: Bearer <token>
```

For supervisor access, register a worker with `"role": "supervisor"` (or manually set in db.js for now).

---

## Safety Thresholds (configurable in `.env`)
| Gas | Safe Limit |
|-----|-----------|
| H2S | < 10 ppm |
| CO  | < 35 ppm |
| CH4 | < 1% |
| O2  | > 19.5% |
| Shift | Max 8 hours |

---

## Next Steps
- [ ] Add real database (PostgreSQL or MongoDB)
- [ ] Add supervisor registration flow
- [ ] Add WebSocket for real-time dashboard updates
- [ ] Add SMS/FCM notifications on SOS/hazard
- [ ] Add Raspberry Pi sensor simulator script
- [ ] Build Worker Mobile App (React Native)
- [ ] Build Supervisor Web Dashboard (React)
