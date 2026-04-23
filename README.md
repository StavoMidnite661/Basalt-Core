# SOVRCOR: High-Fidelity Sovereignty Engine

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Compliance: NIST IR 8202](https://img.shields.io/badge/Compliance-NIST%20IR%208202-blue.svg)](#security--compliance)
[![Engine: TigerBeetle Simulated](https://img.shields.io/badge/Engine-TigerBeetle%20Simulated-orange.svg)](#ledger-architecture)
[![Backend: Node.js/Express](https://img.shields.io/badge/Backend-Node.js%2FExpress-brightgreen.svg)](#project-structure)

**SOVRCOR** is a real-time, distributed ledger treasury system designed for atomic settlement, UCC-9 asset securitization, and private credit issuance. It bridges the gap between physical world performance (mechanical truth) and digital financial instruments through a high-integrity, persistent backend and a brutalist, terminal-inspired interface.

---

## 📖 Overview

The era of narrative finance is over. SOVRCOR provides a high-fidelity alternative to traditional commercial banking promises by utilizing a private, distributed ledger. Driven by "mechanical truth" rather than manual entries, the system validates vendor performance telemetry—GPS pings, scale telemetry, cryptographic proofs—to mint and manage sovereign private credit (SVT).

### Core Pillars
- **Atomic Settlement:** Purely atomic ledger accounting capable of high-volume, dual-entry transfers.
- **Asset Perfection:** Autonomous UCC-9 monitoring and Net Operating Loss (NOL) conversions into compliant general intangibles.
- **Systemic Sovereignty:** Zero external exposure. Every transaction is logged, hashed, and persistent.

---

## ✨ Key Features

### 🏛️ Treasury Quorum & Seigniorage
- **Consensus Mechanism:** 5-node distributed quorum visualizing real-time net-equity calculation.
- **Multi-Sig Minting:** Requires threshold signatures for fresh SVT issuance.
- **Liquidity Oscillation:** Real-time visualization of capital lifecycle and minting capacity.

### 🚚 Vendor & Supply Chain Oracle
- **Mechanical Verification:** Portals for vendor onboarding and upload of performance instruments.
- **Telemetry Evaluation:** Evaluates physical world logistics against atomic condition precedents.
- **SVT Burn Protocol:** Secure token destruction in exchange for performance recognition.

### 📊 Node Topology Viewer
- **D3.js Visualization:** Interactive graphical representation of the network (Accounts, Instruments, Authority nodes).
- **Fault Injection:** Native monitoring for network health and discrepancy alerts.

### 🔐 Security & Compliance
- **NIST AU (Audit & Accountability):** SHA-256 hashed audit trail ensures immutable history.
- **NIST IA/AC (Identification & Access):** JWT-based session management with Role-Based Access Control (RBAC).
- **NIST SC/SI (System Integrity):** Use of cryptographically secure UUIDs and strict Zod schema validation.

---

## 🏗️ Project Structure

The project follows a decoupled architecture with a React frontend and a Node.js/Express backend.

```text
sovrcor/
├── server/                     # Persistent Express Backend
│   ├── middleware/             # Auth & RBAC logic (JWT)
│   ├── models/                 # SQLite Schema (better-sqlite3)
│   ├── routes/                 # REST API endpoints (Ledger, Performance, Auth)
│   ├── services/               # Atomic Ledger & Audit services
│   └── index.ts                # Server entry point
├── src/                        # React Frontend
│   ├── components/             # Atomic UI Components
│   │   ├── Treasury/           # Minting & Hud controls
│   │   ├── Vendor/             # Performance & Onboarding portals
│   │   ├── TopologyMap/        # D3.js Network visualization
│   │   └── PrivateLedger/      # Audit & History streams
│   ├── lib/                    # Shared Logic
│   │   ├── api-client.ts       # Typed REST client
│   │   ├── schemas.ts          # Zod validation models
│   │   └── protocols.ts        # ISO 20022 & Legacy rail translations
│   ├── App.tsx                 # Application state & Routing
│   └── main.tsx                # Entry point
├── .env                        # Production configuration
├── vite.config.ts              # Frontend build & Proxy config
└── package.json                # Dependencies & Scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Installation
1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd sovrcor
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   SERVER_PORT=3001
   JWT_SECRET=your-deep-basalt-secret
   DB_PATH=sovrcor.db
   NODE_ENV=development
   ```

4. **Initialize Database**
   The system automatically initializes the SQLite database and seeds default accounts on the first boot.

### Execution
- **Run in Development**
  ```bash
  # Start Backend
  npx tsx server/index.ts

  # Start Frontend (in a new terminal)
  npm run dev
  ```
  The frontend will proxy `/api` requests to `localhost:3001`.

- **Build for Production**
  ```bash
  npm run build
  ```

---

## ⚙️ Technical Protocols

### Ledger Architecture (Simulated TigerBeetle)
SOVRCOR implements a Two-Phase Commit protocol for ledger transfers:
1. **PENDING:** Funds are reserved in the source account.
2. **POST_PENDING (Commit):** Reservation is cleared and funds are permanently transferred.
3. **VOID_PENDING (Rollback):** Reservation is released without transfer.

### Legacy Rail Translation
The system supports translating atomic ledger events into legacy formats for external interoperability:
- **ISO 20022:** `pain.001` and `pacs.008` parsing logic.
- **NACHA (ACH):** Fixed-width record generation.
- **SWIFT:** MT103 message block construction.

---

## 🤝 Contribution Guidelines

1. **Immutable Philosophy:** Never implement soft-deletions or retroactive history modifications.
2. **Atomic Logic:** All financial operations must go through the `LedgerService` to ensure atomicity.
3. **Responsive Brutalism:** Maintain the basalt color palette and ensure components are mobile-responsive (`sm:` utilities).
4. **Security First:** New endpoints must be protected with `authenticateJWT` and appropriate RBAC middleware.

---

## 📜 License

Copyright (c) 2026. All rights reserved.
Licensed under proprietary terms. Distribution without explicit authorization is strictly prohibited.
