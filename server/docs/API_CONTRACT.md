# TransitOps — API contract

Base URL: `/api`. All routes except `/auth/register` and `/auth/login` require:

```
Authorization: Bearer <jwt>
```

JWT payload: `{ "sub": "<userId>", "role": "<Role>" }`

## Response envelope

Every response uses the same shape.

Success:
```json
{ "success": true, "data": { } }
```

Error:
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "cargoWeight exceeds vehicle capacity" } }
```

## Standard error codes

| Code | HTTP status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed schema/business validation |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Valid JWT, wrong role for this action |
| `NOT_FOUND` | 404 | Resource id doesn't exist |
| `CONFLICT` | 409 | State conflict — e.g. vehicle/driver already `ON_TRIP`, duplicate `regNumber` |

## Roles (from spec section 2)

`FLEET_MANAGER` · `DRIVER` · `SAFETY_OFFICER` · `FINANCIAL_ANALYST`

Default posture: any authenticated role can **read**. Writes are restricted per table below. Tighten further if your team has time; this is the minimum that satisfies the spec's actor descriptions.

---

## BE1 — Auth, Vehicles, Drivers, Maintenance

### Auth

| Method | Endpoint | Roles | Body | Success data |
|---|---|---|---|---|
| POST | `/auth/register` | public | `{ name, email, password, role }` | `{ user, token }` |
| POST | `/auth/login` | public | `{ email, password }` | `{ user, token }` |
| GET | `/auth/me` | any | — | `{ user }` |

### Vehicles

| Method | Endpoint | Roles | Body / Query | Success data | Notes |
|---|---|---|---|---|---|
| GET | `/vehicles` | any | `?status=&type=&region=&search=` | `{ vehicles: [] }` | |
| GET | `/vehicles/available` | any | — | `{ vehicles: [] }` | `status = AVAILABLE` only — this is the dispatch pool |
| GET | `/vehicles/:id` | any | — | `{ vehicle }` | |
| POST | `/vehicles` | `FLEET_MANAGER` | `{ regNumber, name, model, type, maxLoadCapacity, acquisitionCost, region? }` | `{ vehicle }` | 409 if `regNumber` already exists |
| PATCH | `/vehicles/:id` | `FLEET_MANAGER` | partial fields | `{ vehicle }` | Direct status edits to `ON_TRIP`/`IN_SHOP` should go through trip/maintenance endpoints, not this one |
| DELETE | `/vehicles/:id` | `FLEET_MANAGER` | — | `{ vehicle }` | Soft delete — sets `status = RETIRED`, don't hard-delete (breaks trip history) |

### Drivers

| Method | Endpoint | Roles | Body / Query | Success data | Notes |
|---|---|---|---|---|---|
| GET | `/drivers` | any | `?status=&licenseCategory=&search=` | `{ drivers: [] }` | |
| GET | `/drivers/available` | any | — | `{ drivers: [] }` | `status = AVAILABLE` **and** `licenseExpiry > now` — dispatch pool |
| GET | `/drivers/:id` | any | — | `{ driver }` | |
| POST | `/drivers` | `FLEET_MANAGER`, `SAFETY_OFFICER` | `{ name, licenseNumber, licenseCategory, licenseExpiry, contactNumber }` | `{ driver }` | 409 if `licenseNumber` exists |
| PATCH | `/drivers/:id` | `FLEET_MANAGER`, `SAFETY_OFFICER` | partial fields | `{ driver }` | Only `SAFETY_OFFICER` should be able to set `status = SUSPENDED` — enforce in service layer |

### Maintenance

| Method | Endpoint | Roles | Body / Query | Success data | Notes |
|---|---|---|---|---|---|
| GET | `/maintenance` | any | `?vehicleId=&status=` | `{ logs: [] }` | |
| POST | `/maintenance` | `FLEET_MANAGER` | `{ vehicleId, type, description?, cost }` | `{ log }` | **Side effect**: sets `vehicle.status = IN_SHOP` in the same transaction |
| PATCH | `/maintenance/:id/close` | `FLEET_MANAGER` | — | `{ log }` | **Side effect**: sets `vehicle.status = AVAILABLE`, unless vehicle is `RETIRED` |

---

## BE2 — Trips, Fuel/Expense, Dashboard, Reports

### Trips

| Method | Endpoint | Roles | Body | Success data | Notes |
|---|---|---|---|---|---|
| GET | `/trips` | any | `?status=&vehicleId=&driverId=` | `{ trips: [] }` | |
| GET | `/trips/:id` | any | — | `{ trip }` | |
| POST | `/trips` | `DRIVER`, `FLEET_MANAGER` | `{ source, destination, vehicleId, driverId, cargoWeight, plannedDistance }` | `{ trip }` (status `DRAFT`) | Validates `cargoWeight <= vehicle.maxLoadCapacity` at creation |
| POST | `/trips/:id/dispatch` | `DRIVER`, `FLEET_MANAGER` | — | `{ trip }` | See validation table below. Transaction: `trip.status = DISPATCHED`, `vehicle.status = ON_TRIP`, `driver.status = ON_TRIP` |
| POST | `/trips/:id/complete` | `DRIVER`, `FLEET_MANAGER` | `{ actualDistance, fuelConsumed, finalOdometer, revenue? }` | `{ trip }` | Transaction: `trip.status = COMPLETED`, `vehicle.status = AVAILABLE`, `driver.status = AVAILABLE`, `vehicle.odometer = finalOdometer` |
| POST | `/trips/:id/cancel` | `DRIVER`, `FLEET_MANAGER` | — | `{ trip }` | Only from `DRAFT` or `DISPATCHED`. If it was `DISPATCHED`, restore vehicle + driver to `AVAILABLE` |

**Dispatch validation — reject with `CONFLICT` or `VALIDATION_ERROR` if any fail:**

| Rule | Code |
|---|---|
| `vehicle.status !== AVAILABLE` | `CONFLICT` |
| `driver.status !== AVAILABLE` | `CONFLICT` |
| `driver.status === SUSPENDED` | `FORBIDDEN` |
| `driver.licenseExpiry < now` | `VALIDATION_ERROR` |
| `trip.cargoWeight > vehicle.maxLoadCapacity` | `VALIDATION_ERROR` |

Run these checks and the three status updates inside one DB transaction (ideally with `SELECT ... FOR UPDATE` on the vehicle/driver rows) so two simultaneous dispatch requests can't both grab the same vehicle or driver.

### Fuel logs

| Method | Endpoint | Roles | Body | Success data |
|---|---|---|---|---|
| GET | `/fuel-logs` | any | `?vehicleId=` | `{ logs: [] }` |
| POST | `/fuel-logs` | `DRIVER`, `FLEET_MANAGER` | `{ vehicleId, tripId?, liters, cost, date }` | `{ log }` |

### Expenses

| Method | Endpoint | Roles | Body | Success data |
|---|---|---|---|---|
| GET | `/expenses` | any | `?vehicleId=&type=` | `{ expenses: [] }` |
| POST | `/expenses` | `DRIVER`, `FLEET_MANAGER` | `{ vehicleId, type, amount, date, description? }` | `{ expense }` |

### Dashboard

| Method | Endpoint | Roles | Query | Success data |
|---|---|---|---|---|
| GET | `/dashboard/kpis` | any | `?type=&status=&region=` | `{ activeVehicles, availableVehicles, vehiclesInMaintenance, activeTrips, pendingTrips, driversOnDuty, fleetUtilizationPct }` |

`fleetUtilizationPct = (vehicles with status ON_TRIP) / (total non-RETIRED vehicles) * 100`

### Reports & analytics

| Method | Endpoint | Roles | Query | Success data |
|---|---|---|---|---|
| GET | `/reports/vehicle/:id` | any | — | `{ fuelEfficiency, operationalCost, roi, utilizationPct }` |
| GET | `/reports/fleet-summary` | any | — | `{ vehicles: [{ vehicleId, regNumber, fuelEfficiency, operationalCost, roi }] }` |
| GET | `/reports/export.csv` | `FINANCIAL_ANALYST`, `FLEET_MANAGER` | `?scope=fleet\|vehicle&id=` | CSV file stream, not JSON |

**Formulas** (mirrors spec section 3.8):
- `fuelEfficiency = totalActualDistance / totalFuelLiters` (per vehicle, across completed trips)
- `operationalCost = sum(fuelLogs.cost) + sum(maintenanceLogs.cost)` (per vehicle)
- `roi = (sum(trips.revenue) - operationalCost) / vehicle.acquisitionCost`

---

## Getting started

```bash
# BE1 and BE2 share one repo/one schema — agree on this before splitting up
npm install prisma @prisma/client
npx prisma generate
npx prisma db push   # against your Neon DATABASE_URL

# FE1 and FE2: point axios/fetch base URL at BE's deployed URL once it's live;
# until then, mock these exact response shapes with MSW or a static json-server.
```
