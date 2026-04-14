# BASALT CORE: Mechanical Truth & Distributed Ledger System

![BASALT CORE](https://img.shields.io/badge/STATUS-ACTIVE-00f2ff?style=for-the-badge&logoColor=black&color=0b101e&labelColor=00f2ff)
![UCC-9](https://img.shields.io/badge/COMPLIANCE-UCC--9-00f2ff?style=for-the-badge&logoColor=black&color=0b101e&labelColor=00f2ff)
![NISTIR](https://img.shields.io/badge/SECURITY-NISTIR_8202-00f2ff?style=for-the-badge&logoColor=black&color=0b101e&labelColor=00f2ff)

## Overview
**BASALT CORE** is a high-performance, closed-loop settlement system designed to enforce "Mechanical Truth" through distributed consensus, cryptographic staging, and strict UCC-9 compliance. It replaces traditional, error-prone financial reconciliation with an immutable, mathematically verifiable ledger. 

Built with a strict brutalist, terminal-inspired UI, the system emphasizes data density, transparency, and mechanical reliability over superficial aesthetics.

---

## Core Doctrines
1. **Mechanical Truth**: Data is not accepted; it is verified. Every transaction must pass through the `truth-gate` before entering the ledger.
2. **Distributed Oversight**: Single points of failure are eliminated. Critical operations, such as minting new assets, require a multi-signature quorum (Vector Gamma).
3. **Immutable Auditability**: Every action, fault, and signature is permanently logged with a cryptographic hash in the Session Audit Log.
4. **Brutalist Transparency**: The UI hides nothing. Hashes, routing traces, and system states are exposed directly to the operator.

---

## System Modules & Features

### 1. Ingestion Dashboard (`/Dashboard/Ingestion`)
The entry point for raw financial data. It simulates the ingestion of high-velocity data streams (e.g., ISO 20022 messages) and passes them to the Truth Gate for verification. Features real-time buffer monitoring and fault injection capabilities.

### 2. Ledger Topology (`/TopologyMap/LedgerTopology`)
A real-time D3.js visualizer mapping the relationships between Authority Nodes, Instruments (e.g., Promissory Notes), and Accounts. It provides a visual representation of the UCC-9 perfection status and system faults.

### 3. UCC Engine (`/UccEngine/Compliance`)
Monitors and enforces Uniform Commercial Code Article 9 (UCC-9) compliance. It tracks the perfection status of collateral and ensures that the system's collateral coverage ratio remains within acceptable bounds.

### 4. Treasury Authority (`/Treasury/Hud` & `QuorumStaging`)
The heart of the system's seigniorage capabilities. 
*   **Vector Gamma Implementation**: Minting requires initiating a "Quorum Sequence" where 3 out of 5 distributed Authority Nodes must cryptographically sign the transaction before collateral is locked and tokens are minted.

### 5. Tax Engine (`/TaxEngine/TaxStrategy`)
Simulates real-time tax strategy and optimization, calculating Net Operating Loss (NOL) offsets and ensuring compliance with tax regulations during settlement.

### 6. Vendor Portal (`/Vendor/Portal`)
A secure interface for vendor management and performance processing.
*   **Onboarding**: Secure registration generating unique vendor codes.
*   **Performance Portal**: Vendors upload proof of performance, triggering a smart contract burn sequence. Tokens are destroyed, and a cryptographic attestation is generated and emailed to the vendor.

### 7. Distributed Ledger & Client Views (`/PrivateLedger/LedgerHistory`)
An account-styled distributed ledger view combining all live, pending, and completed transactions.
*   **Global Ledger**: View all system transactions with status indicators (Pending Approval vs. Processing Settlement).
*   **Client-Specific Drilldown**: Clicking on a client in a transaction modal filters the ledger to show only that entity's history, complete with generated wallet addresses and specific routing traces.
*   **Transaction Modals**: Deep-dive modals showing cryptographic hashes, compliance checks, and API gateway routing traces.

---

## Architecture & Data Flow

1. **The Truth Stream**: Raw events enter the system via the `generateMockClearingEvent` engine.
2. **The Truth Gate**: Events are passed through `verifyMechanicalTruth()`, which validates schemas using Zod and ensures UCC-9 compliance.
3. **State Management**: Verified events are stored in the `rawBuffer` and rendered across the UI (Truth Stream, Ledger History, Topology Map).
4. **Audit Logging**: Every significant state change (tab switches, minting, burning, fault injections) is recorded in the `SessionAuditLog` with a unique cryptographic hash.

---

## Tech Stack
*   **Core Framework**: React 18+ / Vite
*   **Styling**: Tailwind CSS v4 (Custom Brutalist Theme: `basalt-bg`, `basalt-panel`, `authority-cyan`, `basalt-green`)
*   **Animations**: Framer Motion (`motion/react`) for layout transitions and quorum sequencing.
*   **Data Visualization**: D3.js for force-directed topology graphs.
*   **Icons**: Lucide React
*   **Validation**: Zod for strict schema enforcement.

---

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/StavoMidnite661/BASALTCORE.git
   cd BASALTCORE
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite).

---

## UI/UX Philosophy: Brutalist & Monospace

BASALT CORE rejects modern, soft UI trends in favor of a highly technical, brutalist aesthetic:
*   **Sharp Edges**: No rounded corners (`rounded-none`).
*   **Monospace Typography**: Heavy use of `font-mono`, `tracking-widest`, and `uppercase` for data labels.
*   **High Contrast**: Deep blacks (`#060913`, `#0b101e`) contrasted with stark neon accents (Cyan, Green, Orange, Red).
*   **Information Density**: Borders and grid layouts are used to separate dense blocks of technical data, hashes, and timestamps.

---

## Security & Compliance
This system is designed to simulate compliance with **NISTIR 8202** DLT standards for stored value vaults. All cryptographic hashes generated in this staging environment are mock representations of ECDSA signatures. The system enforces strict separation of concerns between the API Gateway, Compliance Engine, and Ledger Storage.
