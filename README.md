# ProfitGuard

> **"Clarity behind every profit."**

ProfitGuard is a financial intelligence and profitability management platform for e-commerce businesses. It turns complex order economics, cost of goods sold (COGS), shipping fees, returns, and ad spend into clear, actionable financial intelligence.

---

## 🚀 Core Philosophy: Real-First, Empty-By-Default

ProfitGuard is **NOT** a static demo dashboard. 
- **Real Default**: The standard user journey begins with a clean, secure organization and workspace, displaying informative empty states and guided setup until a store is connected or data is imported.
- **Opt-in Sample Mode**: Demo mode is an explicit, opt-in feature available from Settings or empty states. It provisions an isolated sample workspace with deterministic test fixtures, strictly separated from live operational stores.
- **Unified Engine**: Both live and sample workspaces evaluate profitability through the exact same financial calculation engine, validation rules, and schema structures.

---

## 🛠️ Tech Stack

- **Client**: React 18, TypeScript, Vite, Tailwind CSS
- **Design System**: Oyster canvas (`#F1EEE5`), Deep Ink text & surfaces (`#111916`), Electric Lime accents (`#C6E86B`), Sage (`#2D5446`), and Muted Clay warning accents (`#963815`).
- **Typography**: Sora (Headings), Inter (UI Body), IBM Plex Mono (Financial Data, SKUs, Currency).
- **Backend / Engine**: Modular TypeScript services, normalized financial pipeline, multi-tenant RBAC enforcement.
- **Testing**: Vitest automated regression & adversarial edge-case test suites.

---

## 🏃 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd profitguard

# Install dependencies
npm install --legacy-peer-deps
```

### Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the application.

### Running Tests

```bash
# Run Vitest test suite
npm test

# Run tests with UI
npm run test:ui
```

### Building for Production

```bash
npm run build
```

---

## 🔒 Security & Multi-Tenancy

ProfitGuard enforces strict multi-tenant isolation:
1. **Organization & Workspace Hierarchy**: Every financial entity (`Order`, `Product`, `Expense`, `Store`) is partitioned by `workspaceId` and scoped to its parent `organizationId`.
2. **Server-Side RBAC**: Roles (`owner`, `admin`, `financial_analyst`, `viewer`) are enforced server-side on every query and mutation.
3. **Session Verification**: All API requests validate active user status and tenant boundary membership. Workspace ID tampering is immediately blocked.
4. **Isolated Demo Partitions**: Sample workspaces are flagged with `isDemo: true`, blocking write mutations and preventing sample data from contaminating live financial reporting.

---

## 📄 License

Proprietary and Confidential. Built for ProfitGuard Inc.
