# SOVRCOR

A real-time, distributed ledger treasury system demonstrating atomic settlement, UCC-9 asset securitization, and private credit issuance through simulated TigerBeetle logic and interactive topological validation.

## Overview

SOVRCOR represents a comprehensive, multi-phase supply chain and seigniorage module designed to run natively on the web. Driven by "mechanical truth" rather than manual entries, the system bridges performance verifications from vendors with the minting of sovereign private credit (SVT). It visualizes capital lifecycle, UCC-9 legal perfection, and high-velocity stable transfers seamlessly. 

## Key Features

- **Vendor & Supply Chain Oracle:** Portals for vendor onboarding and upload of performance instruments which mechanically verify physical world logistics (e.g., GPS pings, scale telemetry) against atomic conditions.
- **TigerBeetle Simulated Core:** Dual-entry, purely atomic ledger accounting architecture capable of logging high-volume transfers in batches via condition precedent logic.
- **UCC-9 Securitization Engine:** Autonomous monitoring of filed liens, tax-assets, and Net Operating Loss (NOL) conversions into compliant general intangibles.
- **Treasury Quorum & Seigniorage:** 5-node distributed consensus mechanism visualizing real-time net-equity calculation, liquidity oscillation, and multi-signature sequence minting.
- **Node Topology Viewer:** Interactive D3.js powered graphical representation of real-time distributed ledgers featuring Accounts, Instruments, and Authority node networking.
- **Responsive "Brutalist" Interface:** Terminal-inspired deep-basalt styling with robust Tailwind CSS adaptation spanning ultra-wide desktop monitors to compact mobile phone screens. 

## Project Architecture

```
sovrcor/
├── package.json
├── vite.config.ts
├── src/
│   ├── App.tsx                   # Main layout and system state provider
│   ├── main.tsx                  # React DOM lifecycle entry
│   ├── index.css                 # Global brutalist styles & Tailwind config
│   ├── lib/
│   │   ├── tigerbeetle.ts        # Ledger memory implementation & flag schemas
│   │   ├── schemas.ts            # Core TypeScript model architectures
│   │   ├── truth-engine.ts       # Performance simulation event emitters
│   │   ├── parsers.ts            # ISO 20022 parsing utilities
│   │   └── truth-gate.ts         # Consensus thresholds and fault injection
│   └── components/
│       ├── LandingPage.tsx       # External Entry & Authentication router
│       ├── Dashboard/            # Ingestion processing GUI
│       ├── Performance/          # mechanical condition gateways
│       ├── PrivateLedger/        # Sidebar navigation and ledger streams
│       ├── TaxEngine/            # NOL asset tracking logic
│       ├── TopologyMap/          # D3.js visualization matrix
│       ├── Treasury/             # Sovereign credit minting HUB
│       └── Vendor/               # Interfacing node for 3rd Party suppliers
```

## Setup & Installation

To run this application locally, ensure you have **Node.js** (v18+) installed.

1. **Clone the Source**: Receive or checkout the codebase into your desired directory.
2. **Install Dependencies**: Execute `npm install` within the project root to fetch React, Tailwind CSS, Lucide, Framer Motion, and D3.js.
3. **Boot the Dev Server**: Run `npm run dev` to launch the Vite live-server on port 3000. 
4. **Compile for Production**: Execute `npm run build` to tree-shake and statically compile the bundle into `dist/`.

## Application Lifecycle Flow

1. **Landing Module:** Identifies the active node class. Admins enter the macro dashboard, while external entities enter restricted Vendor Portals.
2. **Phase 1 (Origin):** ISO 20022 parsing via the Ingestion Dashboard or direct Document upload from the Vendor Portal creating "Pending" transfers.
3. **Phase 2 (Performance):** The Oracle Gate evaluates required telemetry parameters. Successful evaluations transform Pending credits into atomic settlements.
4. **Phase 3 (Securitization):** The UCC-9 dashboard validates liens and guarantees performance values can be properly secured into net equity.
5. **Phase 4 (Seigniorage):** Treasury nodes vote via signature arrays. Upon reaching the consensus threshold, Treasury mints fresh Stored Value Tokens (SVT) equivalent to secured collateral. 
6. **Oversight:** A macro topological view displays network structure health, and error flags (fault injections) alert nodes of discrepancies natively. 

## Contribution Guidelines

1. **Atomic Philosophy:** Do not implement features relying on soft-deletions or retroactive history modifications. Adhere strictly to the `tigerbeetle.ts` paradigms of immutable ledgers.
2. **UI Component Styling:** Stick strictly to utility styling. New components must be responsive to small viewports (`sm:` classes) without triggering horizontal scrolling (`overflow-x-hidden`).
3. **Theme Variables:** Respect the `basalt` color palette outlined in `index.css`. Neutrality interspersed with warning colors (`mechanical-red`, `authority-cyan`, `basalt-orange`).

## License

Copyright (c) 2026. All rights reserved. Do not distribute without explicit licensing agreements.
