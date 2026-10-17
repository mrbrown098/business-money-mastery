# MizanFlow - Business Money Mastery

**MizanFlow** is a FREE, offline-first business management web application built specifically for small chemical repacking businesses.

**Live Application URL**: [https://mrbrown098.github.io/business-money-mastery/](https://mrbrown098.github.io/business-money-mastery/)

It enables businesses to buy chemicals in bulk, repack them into smaller container sizes, sell to customers (including credit sales), track expenses, and manage net profitability without relying on external servers or paid APIs.

---

## Key Features

- **Offline-First Storage**: All data is stored locally in the user's browser via IndexedDB (Dexie). No database servers or cloud accounts required.
- **Integer Minor Unit Currency Engine**: All monetary values are calculated internally as integer minor units (e.g., paisas or cents), avoiding floating-point rounding errors. Default currency is PKR, fully configurable in settings.
- **Append-Only Stock Movements**: Inventory balances are derived by summing append-only ledger entries for total auditability.
- **Repack Batch Wastage Tracking**: Calculates chemical output volume, wastage quantity, and wastage percentage for every repacking batch.
- **Data Export & Import**: Export full database state to JSON, or restore backups validated against Zod schemas.
- **Progressive Web App (PWA)**: Accessible offline on mobile and desktop devices.

---

## Local Development Setup

### Requirements
- **Node.js**: v18+ or v20+ or v22+
- **npm**: v9+ or v10+ or v11+

### Installation & Running

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mrbrown098/business-money-mastery.git
   cd business-money-mastery
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/business-money-mastery/` in your browser.

4. **Run Quality Checks**:
   ```bash
   # Typecheck TypeScript
   npm run typecheck

   # Lint codebase
   npm run lint

   # Execute Vitest unit test suite
   npm run test

   # Build production assets
   npm run build
   ```

---

## Deployment Instructions

### GitHub Pages Setup

1. In the GitHub repository settings (`Settings -> Pages`), set **Source** to **GitHub Actions**.
2. The `.github/workflows/deploy.yml` workflow automatically builds and deploys static assets to GitHub Pages on every push to `main`.
3. Access the live PWA at [https://mrbrown098.github.io/business-money-mastery/](https://mrbrown098.github.io/business-money-mastery/).

---

## License

This project is licensed under the [MIT License](LICENSE).
