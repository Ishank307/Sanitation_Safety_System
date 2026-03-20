# Sanitation Safety Backend — SAMVED 2026

Smart Safety and Assistance System for Sanitation Workers of Solapur Municipal Corporation

---

## Setup

```bash
cd sanitation-safety-backend
npm install
# Create your .env file
cp .env.example .env

# Important: Add your MongoDB Atlas connection string to .env:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster...

npm run dev                 # dev with auto-reload
npm start                   # production
```

---

## Roles & Authentication

The system supports three distinct user hierarchical roles:
1. `admin`: Global access. Views dashboard and alerts across all zones.
2. `zonal_coordinator`: Zone-level access. Views dashboard and alerts strictly only for their assigned `zone`.
3. `worker`: Worker-level access. Can start/end shifts and trigger emergency SOS.

Pass the JWT token in your request headers to access protected routes:
```
Authorization: Bearer <token>
```

---

## API Routes

### Users (`/api/users`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/users/register` | None | Register a new user (`worker`, `zonal_coordinator`, `admin`) |
| POST | `/api/users/login` | None | Login, returns JWT token |
| GET | `/api/users` | Coordinator/Admin | List users (filtered by zone for Coordinators) |
| GET | `/api/users/:id` | Any | Get user by ID |

**Register worker example:**
```json
{ 
  "role": "worker", 
  "name": "Raju", 
  "phone": "9876543210", 
  "zone": "Zone-A", 
  "password": "pass123", 
  "medicalHistory": "None" 
}
```

---

### Shifts (`/api/shifts`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/shifts/start` | Worker | Log shift start |
| POST | `/api/shifts/end` | Worker | Log shift end (auto flags overwork) |
| GET | `/api/shifts/my` | Worker | Worker's own shift history |
| GET | `/api/shifts` | Coordinator/Admin | All shifts |

---

### Sensors (Raspberry Pi / Hardware) (`/api/sensors`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/sensors/reading` | None* | Push hardware sensor reading |
| GET | `/api/sensors/readings` | Coordinator/Admin | All readings (filtered by zone) |
| GET | `/api/sensors/latest/:manholeId`| Any | Latest reading for a specific manhole |

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
*\*Add API key authentication here before production*

---

### Emergency SOS (`/api/sos`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/sos` | Worker | Trigger SOS alert |
| GET | `/api/sos` | Coordinator/Admin | All SOS alerts |
| PATCH | `/api/sos/:id/resolve` | Coordinator/Admin | Mark SOS as resolved |

---

### Dashboard (`/api/dashboard`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/dashboard/summary` | Admin | Global system overview across all zones |
| GET | `/api/dashboard/zone/:zone` | Coordinator/Admin | Geographic zone-wise breakdown |
| GET | `/api/dashboard/alerts` | Coordinator/Admin | Actionable system alerts |
| PATCH | `/api/dashboard/alerts/:id/acknowledge`| Coordinator/Admin | Acknowledge hardware alert |

---

## Safety Thresholds (configurable in `.env`)
| Trigger | Safe Limit |
|---------|-----------|
| H2S | < 10 ppm |
| CO  | < 35 ppm |
| CH4 | < 1% |
| O2  | > 19.5% |
| Shift | Max 8 hours |

---

## Next Steps
- [x] Integrate real database (MongoDB Atlas)
- [x] Add hierarchy and roles (Worker, Zonal Coordinator, Admin)
- [ ] Add WebSocket for real-time dashboard updates
- [ ] Add SMS/FCM notifications on SOS/hazard
- [ ] Build Worker Mobile App (React Native)
- [ ] Build Dashboard Web Application (React)
