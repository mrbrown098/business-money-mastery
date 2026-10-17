# BRIEF: Money Mastery / MizanFlow

Project: "Money Mastery" (internal name: MizanFlow) — a free, offline-capable business system (installable web app / PWA) for a small pesticide and chemical repacking shop in Pakistan.

THE BUSINESS
We buy bulk raw material (liquid in litres, powder in kg) from companies, repack it into small packs (50g, 100ml, 250ml, 1L ...) and sell to agri/chemical stores, mostly on credit (udhaar). The app must show raw material cost, packing cost (pouch/bottle, label, sticker), labour (mazduri), petrol/transport, sales, who owes money, and real profit.

HARD CONSTRAINTS (non-negotiable)
1. Zero cost forever: no paid hosting, server, database or API. No Firebase, Supabase, Vercel or any backend.
2. Hosting is GitHub Pages (static files only) on this repo's free github.io link. A GitHub Actions workflow builds and deploys on every push to main.
3. Login is "Sign in with Google" (Google Identity Services, browser only). No passwords of our own. No client secret anywhere in the repo.
4. All data lives in the OWNER's Google Drive (a folder created by the app). Data files and invoice PDFs are stored there. Narrowest scopes only: openid, email, profile and https://www.googleapis.com/auth/drive.file. Never ask for full Drive access.
5. Offline-first: after the first online visit the app must open and work fully with no internet (service worker precache + IndexedDB local database + queued changes). When internet returns it syncs to Drive automatically. Show a clear status badge: Offline / Syncing / All saved / Needs sign-in. An expired Google token must never block offline work.
6. Mobile-first, installable, big buttons. Currency PKR, timezone Asia/Karachi, dates dd-mm-yyyy. UI in English with Roman-Urdu-friendly labels.
7. The repo is public: never commit secrets or real business data. (OAuth Client ID is public by design and may live in config.)
8. At runtime the app may talk ONLY to Google APIs. No external analytics/trackers/CDNs.

ARCHITECTURE PRINCIPLES
- Static site build (Vite + TypeScript + React) with base set to '/business-money-mastery/'. Use hash routing or 404 fallback for Pages if required. PWA service worker + IndexedDB local DB (Dexie).
- IndexedDB is working copy; Google Drive is backup/sync target. Records have UUID id, createdAt, updatedAt, deleted flag.
- No running totals: compute stock, balances and profit from records.
- Sync design: newest updatedAt wins but preserve history and keep a sync log. Split big collections by month in Drive.
- Drive layout: folder "Money Mastery" with data files and "Invoices" subfolder with PDFs.
- Staff access: owner shares Drive folder, staff uses Google Picker to select it. Explain limits in docs.

FEATURES (full list to be implemented across phases)
1. Raw material purchases
2. Products (pack sizes) and cost computation
3. Packing batches
4. Customers and sales/invoices (credit support)
5. Payments and Khata ledger
6. Expenses
7. Stock page with low stock alerts
8. Dashboard with month picker and charts
9. Printable invoice PDF saved to Drive
10. WhatsApp share links with Roman-Urdu messages
11. Roles: owner and staff (staff cannot see cost/profit or delete)

BUSINESS RULES (examples)
- Material cost per unit = (total cost + transport) / quantity, weighted average over purchases.
- Cost per pack = material per pack x avg material cost + packaging + labour.
- Finished stock = packs made - packs sold.
- Net profit = sales (after discount) - COGS - expenses.
- Customer balance = opening + bills - payments.
- Overdue days = days since oldest unpaid bill.

TEAM RULES (short)
1. One task = one branch = one PR. Main must always build and deploy. CI runs build+tests on PRs.
2. Lanes by folder: Lead owns .github/, config, src/core (auth, storage, sync), src/ui and styles, app shell and routing. Jules works in src/domain, src/pdf, src/export and feature pages under src/features/*.
3. MERGE GATE: CI green, respects HARD CONSTRAINTS, small/focused, justified deps, docs/PROGRESS.md updated, no .github/workflows change unless lead approved, use squash merge.
4. SAFETY: Never commit secrets or force-push main.
5. PROMPTS FOR JULES: self-contained, list allowed and forbidden files, acceptance criteria, tests required, open ONE PR only.
6. Tests required for money logic, stock, balances, overdue days, sync merge.

STEPS (short plan)
1. Project skeleton + PWA shell + Pages deploy + CI + docs [Lead or accept Jules's PR]
2. Design system + app shell [Lead]
3. Google sign-in + GCP guide + Drive folder creation [Lead]
4. Local DB + offline-first sync engine with Drive + tests [Lead]
5. Business logic (cost, stock, balances) + tests [Jules]
6. Materials, suppliers, purchases, products pages
7. Packing batches + stock pages
8. Customers, sales/invoices, payments, khata
9. Expenses, recovery page, dashboard and charts
10. Invoice PDF to Drive + WhatsApp sharing [Jules-friendly]
11. Staff access and roles
12. Polish: backup/import, PIN lock, Roman Urdu labels, user guide

(End of BRIEF)
