# BRIEF - the business and the rules (source of truth)

## Business
Small pesticide/chemical repacking shop in Pakistan. It buys bulk raw material (liquid in litres, powder in kg) from companies, repacks it into small packs (50g, 100ml, 250ml, 1L ...) and sells to agri/chemical stores, mostly on credit (udhaar). The owner must know: raw material cost, packing cost (pouch/bottle, label, sticker), labour (mazduri), petrol/transport, sales, who owes money, and the real profit.

## Hard constraints
1. Zero cost forever: no paid hosting, server, database or API. No Firebase, Supabase, Vercel or any backend.
2. Hosting: GitHub Pages (static files) deployed by GitHub Actions.
3. Login: "Sign in with Google" (Google Identity Services, browser only). No own passwords. No client secret in the repo.
4. Cloud data lives in the OWNER'S Google Drive: a visible folder "Money Mastery" created by the app, with an "Invoices" subfolder for PDFs. Scopes: openid, email, profile and https://www.googleapis.com/auth/drive.file ONLY. NOT drive.appdata (it cannot be shared with staff and cannot hold visible PDFs) and NOT full drive.
5. Offline-first PWA: works fully with no internet after the first visit and syncs to Drive when online. Status badge: Offline / Syncing / All saved / Needs sign-in. An expired Google token must never block offline work.
6. Mobile-first and installable. Currency PKR, timezone Asia/Karachi, dates dd-mm-yyyy. English UI with Roman-Urdu-friendly labels (Khata, Udhaar, Bachat, Mazduri). PDFs: English/Roman Urdu only.
7. The repo is public: no secrets, no real business data. The Google OAuth Client ID is public by design.
8. At runtime talk ONLY to Google APIs. No analytics, trackers, ads, third-party CDN scripts or fonts (self-host everything).
9. WhatsApp: only wa.me click-to-chat links with pre-written Roman Urdu messages. No unofficial libraries.

## Money and quantity rules
- Money = integer minor units (paisas). Raw-material quantities = integer grams / millilitres. Packs = integer counts.
- Never store running totals. Stock, balances and profit are computed from records.
- Material cost per unit = (total cost + transport) / quantity, weighted average over all purchases of that material.
- Cost per pack = material per pack x average material cost + packaging + labour.
- Finished stock = packs made - packs sold. Raw stock = purchased - used in packing. Overselling is blocked.
- Each sale line saves the cost per pack at the time of sale, so old profit never changes.
- Net profit = sales (after discount) - cost of goods sold - expenses.
- Customer balance = opening balance + all bills - all payments.
- Overdue days = days since the oldest bill that is still (partly) unpaid; payments are applied to the oldest bills first (opening balance first).

## Features (built step by step)
Raw material purchases; products per pack size with cost/profit/margin; packing batches; customers and sales/invoices (discount; cash/credit/partial); payments and khata ledger; udhaar recovery with one-tap WhatsApp reminder; expenses (petrol, labour, rent, electricity, transport, misc); stock with low-stock alerts; dashboard with month picker (sales, cash received, udhaar, cost of goods sold, expenses, net bachat, profit %, 6-month trend, expense pie, top 5 products by profit, top 5 debtors); invoice PDF saved to Drive and shareable; roles owner/staff (staff: add sales/payments/expenses, no cost/profit, no delete; explain Drive limits honestly); Excel/CSV export and import backup.

## Way of working
One task = one branch = one PR. main must always build and deploy. Run typecheck, lint, test and build and report real results.
