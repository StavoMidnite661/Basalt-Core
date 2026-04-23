# SOVRCOR: High-Fidelity Sovereignty Engine

[![Compliance: NIST IR 8202](https://img.shields.io/badge/Compliance-NIST%20IR%208202-blue.svg)](#security--compliance)
[![Backend: Node.js/Express](https://img.shields.io/badge/Backend-Node.js%2FExpress-brightgreen.svg)](#project-structure)

**SOVRCOR** is a real-time, distributed ledger treasury system for atomic settlement, UCC-9 asset securitization, and private credit issuance.

---

## ✨ Key Features
- **Treasury Quorum**: 5-node distributed quorum for real-time equity and SVT minting.
- **Supply Chain Oracle**: Mechanical verification of vendor performance telemetry.
- **Security & Compliance**: NIST AU (hashed audit trails), NIST IA/AC (JWT RBAC), NIST SC/SI (UUID integrity).

---

## 🏗️ Project Structure
- `server/`: Persistent Express backend (SQLite).
- `src/`: React frontend with typed `ApiClient`.

---

## 🚀 Getting Started
1. `npm install`
2. Configure `.env` (see `.env.example`).
3. `npx tsx server/index.ts` (Backend)
4. `npm run dev` (Frontend)
