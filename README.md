# SOVRCOR // BASALT_CORE

![SOVRCOR System Status](https://img.shields.io/badge/STATUS-COMMISSIONED-a3ff00?style=for-the-badge)
![NISTIR 8202](https://img.shields.io/badge/COMPLIANCE-NISTIR_8202-00f2ff?style=for-the-badge)
![UCC-9](https://img.shields.io/badge/PERFECTION-UCC_9-00f2ff?style=for-the-badge)

**SOVRCOR** (Basalt Core Engine) is a high-fidelity sovereignty engine. 

Designed to bypass the narrative promise of commercial banking, SOVRCOR introduces the mechanical truth of a private, distributed ledger. Through robust **Role-Based Access Control (RBAC)**, strictly partitioned **TigerBeetle** double-entry logic, and pure **deterministic state management**, the application provides a zero-risk environment for the origination, perfection, and settlement of sovereign credit.

---

## 🎯 Executive Doctrine

> *“The Era of Narrative Finance is Over.”*

By grounding operations in **UCC-9 Compliance**, strictly interpreting the **Uniform Commercial Code (UCC)**, and running a sandboxed implementation of a two-phase private ledger, SOVRCOR strips away counter-party risk. 

## 🏗 System Architecture & Stack

- **Framework:** React 18 / Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (Custom `basalt` brutally dark theme system)
- **Animation Engine:** Framer Motion (State-driven transitions)
- **Data Visualization:** D3.js (Force-directed node topology mapping)
- **Ledger Engine:** Simulated TigerBeetle two-phase commit wrapper
- **UI Tooling:** Lucide React (Iconography)

## ✨ Core Features & Modules

### 1. Dual-Role Mechanics (RBAC)
- **Treasury / CFO Admin (`CFO_Admin`)**: Full access to global node health, TigerBeetle ledgers, macro topology, tax strategies, and external SWIFT/FEDWIRE bridging.
- **Vendor Portal (`Supply_Chain`)**: Strictly sandboxed ingestion UI to onboard entities, upload invoices, pledge non-cash performance deliverables, and request digital attestations.

### 2. The Truth Engine & TigerBeetle Core
- **Mechanical Double-Entry**: Native adherence to debits and credits without floating point loss.
- **Two-Phase Commits**: Enforces the gap between `PENDING` states and `POSTED` clearings. 
- **Truth Stream**: Right-hand column (available to Treasury) displaying real-time deterministic changes, block hashes, and system audits.

### 3. Macro Node Topology (D3.js)
- Force-directed graph representation of ledger nodes, simulated instrument attachments, and system-wide asset routing.
- Injectable **Quorum Fault** simulators to test network resilience (`INJECT_FAULT` / `CLEAR_FAULT`).

### 4. UCC-9 Securitization & Legal Oracle
- Converts uncollateralized liabilities into mathematically perfected **General Intangibles**.
- Tracks **priority conflicts**, live syncs with collateral control agreements, and dynamically visualizes **NOL** (Net Operating Loss) asset limits.

### 5. Seigniorage & Treasury Hud
- **Liquid Health Ratio (LHR)** monitoring.
- Quorum-gated staging sequences requiring multiple cryptographic signatures to execute atomic minting phases.

---

## 🚀 Initialization & Setup

### Requirements
- Node.js (v18.x or above recommended)
- `npm` or `yarn`

### Installation Procedure

1. **Clone the repository** (if applicable):
    ```bash
    git clone https://github.com/organization/sovrcor-basalt.git
    cd sovrcor-basalt
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Initialize the local Vite gateway**:
    ```bash
    npm run dev
    ```

4. **Access the Core**:
    Navigate to `http://localhost:3000` to interact with the entry system.

---

## 🛠 Directory Topology

```text
/src/
 ├── components/
 │    ├── Dashboard/     # Liability ingestion & ISO 20022 mechanics
 │    ├── Performance/   # Performance Oracles & Verification Bridges
 │    ├── PrivateLedger/ # Sidebar routing, Ledger logs, and Truth Streams
 │    ├── TaxEngine/     # Corporate strategic tax mitigation interfaces
 │    ├── TopologyMap/   # D3 Data visualizers and Ledger Topology
 │    ├── Treasury/      # UCC-9 Backing, the Quorum Mint, and Exit Bridges
 │    ├── TruthStream/   # Granular modal and settlement viewers
 │    └── Vendor/        # Sandboxed onboarding gateways
 │
 ├── lib/
 │    ├── email-service.ts  # Simulated SMTP attestation delivery
 │    ├── schemas.ts        # Global TS Interfaces, Unions
 │    ├── tigerbeetle.ts    # The mock implementation of the two-phase ledger
 │    ├── truth-engine.ts   # Mocks system noise and clearing events
 │    └── truth-gate.ts     # Verification gatekeepers for the ledger
 │
 ├── App.tsx          # Master routing & RBAC execution context
 ├── index.css        # Basalt theme & mechanical glitch animations
 └── main.tsx         # React render gateway
```

---

## 🤝 Contribution Guidelines

This repository operates under a strict **Zero-Narrative policy**. All contributions must enforce mechanical truth:
1. **No hidden state.** All transitions must be visible to the `TruthStream`.
2. **No floating-point math for ledgers.** All underlying state modifications must utilize integer wrappers or strictly validated double-entry logic via the `TigerBeetleSimulator`.
3. **Typography & Styling:** Adhere to the `font-mono`, uppercase, tight-tracking aesthetic defined in the global CSS.

**To propose changes:**
1. Maintain your branch off `HEAD`.
2. Ensure D3 force graphs and Framer Motion elements do not conflict or cause hardware acceleration repaints.
3. Submit a Pull Request outlining the **deterministic impact** of the change.

---

*“In truth we trust. In mechanics we conquer.”*
