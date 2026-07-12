<div align="center">

# 🚚 LogiFleet

### Intelligent Fleet & Logistics Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js" alt="NodeJS" />
  <img src="https://img.shields.io/badge/Framework-Express-black?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge" alt="JWT" />
  <img src="https://img.shields.io/badge/UI-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

### Enterprise Fleet Management System for Modern Logistics Companies
**Manage Vehicles • Drivers • Trips • Maintenance • Fuel • Expenses • Reports • Analytics**

---

</div>

# 📖 Table of Contents
- [Introduction](#-introduction)
- [Problem Statement](#-problem-statement)
- [Existing System vs Proposed Solution](#-existing-system-vs-proposed-solution)
- [Objectives](#-objectives)
- [Key Features](#-key-features)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Technology Stack](#-technology-stack)
- [System Architecture & Workflow Design](#-system-architecture--workflow-design)
- [Database Architecture](#-database-architecture)
- [API Documentation](#-api-documentation)
- [Security & Request Validation](#-security--request-validation)
- [Performance Optimizations](#-performance-optimizations)
- [Project Layout](#-project-layout)
- [Future Enhancements](#-future-enhancements)
- [Contributors & License](#-contributors--license)

---

# 🚛 Introduction

Fleet management is one of the most critical components of modern logistics and transportation industries. Organizations managing fleets of vehicles often struggle with maintaining accurate records of drivers, vehicle utilization, maintenance schedules, fuel consumption, operational costs, and overall business analytics.

Traditional fleet management systems rely heavily on spreadsheets, manual records, disconnected software solutions, and human intervention. These methods introduce delays, increase operational costs, and make data-driven decision-making difficult.

**LogiFleet** is a modern full-stack Fleet Management System that digitizes the complete fleet lifecycle. It enables organizations to efficiently manage vehicles, drivers, maintenance activities, trips, fuel usage, expenses, and reports while ensuring secure access through Role-Based Access Control (RBAC). 

The application is built using **React**, **Node.js**, **Express.js**, **Prisma ORM**, and **PostgreSQL**, following a scalable layered architecture suitable for enterprise-grade deployments.

---

# ❗ Problem Statement

Logistics companies today face numerous operational challenges that impact productivity, efficiency, and profitability:
* **Manual Vehicle Management:** Vehicle information is typically stored in Excel sheets or physical registers, making it difficult to track availability, maintenance history, and utilization rates.
* **Driver Mismanagement:** Organizations struggle to monitor driver license expirations, active availabilities, safety metrics, and historical trip logs.
* **Poor Maintenance Tracking:** Maintenance schedules are often managed reactively rather than proactively, resulting in delayed servicing, unexpected on-road breakdowns, and high asset depreciation.
* **Fuel Leakage & Cost Tracking:** Without centralized, trip-tied logging, fuel expenses become difficult to audit, introducing severe vulnerabilities to operational financial losses.
* **Lack of Business Intelligence:** Managers cannot accurately determine critical Key Performance Indicators (KPIs) such as Fleet Utilization rates, Vehicle ROI, exact Operational Cost-per-mile, Fuel Efficiency metrics, and Driver Productivity profiles.
* **Weak Security:** Legacy systems lack granular authentication and authorization mechanisms, exposing highly sensitive logistics data to unauthorized eyes.

---

# 🔍 Existing System vs Proposed Solution

### The Legacy Landscape
`[Vehicle Register] ➔ [Excel Sheets] ➔ [Phone Coordination] ➔ [Paper Invoices] ➔ [Manual Reports] ➔ [No Analytics]`

❌ Duplicate Data Entry & Silos | ❌ Extreme Human Error Margin | ❌ Blind Spot Trip Tracking | ❌ High Operational Waste

### The LogiFleet Ecosystem
LogiFleet provides a centralized digital control platform that automates fleet operations out of a single secure engine.

✔ Unified Asset Registries | ✔ Predictive Status Control | ✔ Algorithmic Validations | ✔ Native Core Cost Analytics

---

# 🎯 Objectives

* **Digitize & Centralize Fleet Operations:** Eliminate manual tracking workflows and unify historical data into a secure engine.
* **Maximize Fleet Utilization:** Gain deep visibility into which vehicles are generating revenue versus sitting idle.
* **Minimize Vehicle Downtime:** Leverage automated maintenance tracking loops to pull vehicles into the shop before catastrophic failure occurs.
* **Ensure Operational Compliance:** Automatically cross-examine driver status indicators and license dates before keys leave the depot.
* **Track Granular Costs:** Gain immediate insights into exact operational costs driven by fuel, maintenance, and auxiliary trip expenses.

---

# ✨ Key Features

* 🔐 **Identity Infrastructure:** JWT-backed state authentication built on top of secure `bcrypt` password hashing algorithms.
* 👥 **Role-Based Access Control (RBAC):** Restrict core API domains to specific organizational positions (Fleet Manager, Driver, Safety Officer, Financial Analyst).
* 🚚 **Vehicle Lifecycle Management:** Full CRUD handling for vehicle inventories mapped against concrete tracking states (`AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `RETIRED`).
* 👨‍✈️ **Driver Registry Controls:** Tracks legal licensing credentials, current operational status, and dynamic safety scores.
* 🚛 **Algorithmic Trip Dispatching:** Automated verification loops checking driver availability, vehicle capacity, cargo restrictions, and licensing validity prior to trip confirmation.
* 🛠️ **Integrated Log Systems:** Separate functional modules for managing maintenance records, fuel purchases, and overall operational expenses (tolls, spare parts).
* 📈 **Dashboard BI & CSV Reporting:** Live dashboard computing fundamental fleet health metrics with integrated reporting handlers allowing clean exports to CSV.

---

# 🔐 Role-Based Access Control (RBAC)

| Feature | Fleet Manager | Driver | Safety Officer | Financial Analyst |
| :--- | :---: | :---: | :---: | :---: |
| **Register / Edit Vehicle** | ✅ | ❌ | ❌ | ❌ |
| **Soft Delete Vehicle** | ✅ | ❌ | ❌ | ❌ |
| **Register Driver Profiles** | ✅ | ❌ | ✅ | ❌ |
| **Suspend Driver Licenses** | ❌ | ❌ | ✅ | ❌ |
| **Create / Dispatch Trips** | ✅ | ✅ | ❌ | ❌ |
| **Submit Fuel & Expense Logs** | ✅ | ✅ | ❌ | ❌ |
| **View Financial Reports** | ✅ | ❌ | ❌ | ✅ |
| **Export Operational Data** | ✅ | ❌ | ❌ | ✅ |

---

# 🛠 Technology Stack

### Frontend Architecture
* **React & Vite:** Component-driven presentation layer paired with an ultra-fast build pipeline.
* **TailwindCSS:** Utility-first interface styling optimized for quick UI construction.
* **Axios:** Context-aware HTTP client with automated interceptors managing authentication tokens.
* **Recharts:** Flexible, lightweight visualization engines powering dashboard analytics.

### Backend Architecture
* **Node.js & Express.js:** Asynchronous, decoupled REST API environment optimized for fast transaction response speeds.
* **Prisma ORM:** Type-safe database client providing predictable queries and explicit relationship declarations.
* **PostgreSQL:** Advanced object-relational database structure ensuring extreme ACID data consistency.
* **Zod:** Runtime validation schemas verifying network layer inputs before hitting database logic.

---

# 🏗 System Architecture & Workflow Design

### High-Level Architecture (HLD)

<p align="center">
  <img src="docs/images/system-architecture.jpeg" width="900" alt="LogiFleet Enterprise System Architecture Diagram" />
</p>

`[React Frontend] ➔ (HTTPS REST API / JWT) ➔ [Express Route Handler] ➔ [Zod Validation Layer] ➔ [Service / Controller Domain] ➔ [Prisma Client] ➔ [PostgreSQL Engine]`

### Core Workflow Cycles

#### 1. Trip Execution Lifecycle
`[Draft Generated] ➔ [Verify Vehicle & Driver Availabilities] ➔ [Check Cargo Capacities] ➔ [Dispatched: Vehicle/Driver status → ON_TRIP] ➔ [Completed: Status → AVAILABLE]`

#### 2. Maintenance Lifecycle
`[Vehicle Flagged] ➔ [Create Log Entry] ➔ [Status shifts → IN_SHOP] ➔ [Repairs Logged] ➔ [Close Request] ➔ [Status shifts → AVAILABLE]`

---

# 🗄 Database Architecture

LogiFleet utilizes a highly relational PostgreSQL architecture, using the Prisma Client for type-safe execution.

<p align="center">
  <img src="docs/images/er-diagram.jpeg" width="750" alt="LogiFleet Entity Relationship Diagram" />
</p>

### Prisma Schema Definition Overview

#### `User`
* `id` (UUID, PK) | `email` (String, Unique) | `passwordHash` (String) | `role` (Enum: `MANAGER`, `DRIVER`, `SAFETY`, `ANALYST`)

#### `Vehicle`
* `id` (UUID, PK) | `vin` (String, Unique) | `model` (String) | `capacity` (Float) | `status` (Enum: `AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `RETIRED`)

#### `Driver`
* `id` (UUID, PK) | `licenseNumber` (String, Unique) | `expiryDate` (DateTime) | `safetyScore` (Int) | `status` (Enum: `AVAILABLE`, `ON_TRIP`, `OFF_DUTY`, `SUSPENDED`)

#### `Trip`
* `id` (UUID, PK) | `vehicleId` (FK) | `driverId` (FK) | `source` (String) | `destination` (String) | `status` (Enum: `DRAFT`, `DISPATCHED`, `COMPLETED`, `CANCELLED`)

#### `FuelLog` / `MaintenanceLog` / `Expense`
* Tied directly to `Vehicle` and `Trip` contexts via target foreign key fields to ensure detailed operational cost attribution.

---

# 🔗 API Documentation

### Authentication Domain
* `POST /api/auth/register` - Creates a new corporate user profile.
* `POST /api/auth/login` - Validates user credentials and issues short-lived JWT signatures.
* `GET /api/auth/me` - Validates active bearer token signatures and returns contextual profile data.

### Fleet & Assets Domain
* `GET /api/vehicles` - Returns a paginated index of fleet entries with custom region/status filtering options.
* `POST /api/vehicles` - Creates a new vehicle asset within the global inventory database. *(Requires Manager Role)*
* `PATCH /api/vehicles/:id` - Dynamic updates to asset states (e.g., manually putting a truck `IN_SHOP`).
* `DELETE /api/vehicles/:id` - Performs an intentional soft-delete to hide the vehicle from operational loops while preserving data safety.

### Logistics Management Domain
* `POST /api/trips` - Creates a `DRAFT` trip record. Run validation protocols against target components.
* `POST /api/trips/:id/dispatch` - Confirms a trip, switching assigned driver and vehicle statuses to `ON_TRIP`.
* `POST /api/trips/:id/complete` - Ends a trip, capturing actual distance figures, updating odometers, and freeing up drivers and vehicles back to `AVAILABLE`.

---

# 🔒 Security & Request Validation

### Network Layer Security
* **JWT Authorization Filters:** API routers isolate functional modules behind customized authentication evaluation middleware.
* **Granular RBAC Guards:** Middleware intercepts queries to confirm that incoming payloads match the privileges assigned to the user's role.

### Strict Validation Rules (Zod Schemas)
* **Vehicles:** Enforces specific alphanumeric structures on VIN strings, requiring positive floating-point values for load limits and vehicle costs.
* **Drivers:** Validates that license expiry inputs sit cleanly in future chronological windows.
* **Trips:** Runs automated cross-entity checks before confirming a trip:

$$\text{Trip Allowed} = (\text{Driver Available} \land \text{Vehicle Available} \land \text{Driver License Valid} \land \text{Cargo Weight} \le \text{Vehicle Capacity})$$

---

# ⚡ Performance Optimizations

* **Database Indexing Strategics:** Custom indexes applied across frequently filtered fields (`vehicleId`, `driverId`, `tripStatus`) to accelerate query performance.
* **Prisma Subquery Selectors:** Queries specify exact required datasets to avoid large `SELECT *` lookups and keep payloads lightweight.
* **Soft Delete Filters:** Global entity queries run through customized Prisma middleware filters that exclude soft-deleted records by default, keeping queries quick.

---

# 📂 Project Layout

```text
LogiFleet/
|── README.md 
├── client/                 # React SPA Client
│   ├── src/
│   │   ├── components/     # Reusable UI Elements (Buttons, Inputs, Modals)
│   │   ├── pages/          # Primary Views (Dashboard, Vehicles, Fleet Tracking)
│   │   ├── services/       # Axios API Communication Classes
│   │   └── routes/         # RBAC Guarded Page Router Setup
└── server/                 # Express REST Engine
    ├── controllers/        # Express Route Interceptors
    ├── services/           # Decoupled Core Business Logic Modules
    ├── middleware/         # Token Parsers, RBAC Guards, Error Catchers
    ├── validators/         # Zod Request Validation Specs
    └── prisma/             # Schema Engine Files & Migration History

```

# ⚡ Performance Optimizations

* **Server-Side Caching Layer:** Implemented custom caching mechanisms to eliminate repetitive database queries, drastically lowering API latency and reducing load on the database engine.
* **Database Indexing Strategies:** Custom indexes applied across frequently filtered fields (`vehicleId`, `driverId`, `tripStatus`) to accelerate query execution speeds.
* **Prisma Subquery Selectors:** Queries explicitly specify required datasets to avoid expensive `SELECT *` lookups and keep network payloads lightweight.
* **Soft Delete Filters:** Global entity queries run through customized Prisma middleware filters that exclude soft-deleted records by default, keeping index scans highly efficient.

# 🌱 Future Enhancements

* 📍 **Real-Time Telematics:** Live GPS integrations paired with custom geofencing alerts using the Google Maps API.
* 🧠 **Predictive AI Maintenance:** Machine Learning workflows tracking vehicle analytics to catch asset degradation ahead of time.
* 📲 **Driver Mobile Application:** Dedicated native companion apps featuring turn-by-turn routing and optical character recognition (OCR) camera captures for automated fuel receipt processing.
* ⚡ **High-Speed Caching:** Layering Redis engines over high-read analytical paths to scale system responsiveness under high operational loads.

---

# 👥 Contributors

| Contributor | Organizational Role Focus |
| :--- | :--- |
| **Jaspreet Kaur** | Data Architecture / API Engine Lead |
| **Manan Bansal** | Authentication / Validation Pipeline Engineer  |
| **Simran Maurya** | State Management / Core View Architecture |
| **Maninder Saini** | Visualization UI / Responsive Design Engineer  |

---

# 📜 License

This project is licensed under the terms of the open-source **MIT License**.

---

<div align="center">

### 🚚 LogiFleet — Smart Fleet Infrastructure for Smarter Logistics Operations
Built with ❤️ by the LogiFleet Open-Source Community. **If this boilerplate accelerates your workflow, consider giving the repository a star!** ⭐

</div>



