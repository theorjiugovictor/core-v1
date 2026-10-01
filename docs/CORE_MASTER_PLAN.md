# CORE Product Ideas
**Mission: Infrastructure for the Smallest Businesses on Earth**

---

## Executive Summary
These are product ideas, not a release schedule or a description of shipped features. Check the application and current issues before planning work from this document.

The sections are grouped by increasing implementation scope, not priority or delivery date.

---

## Near-term ideas

### 1. Frictionless Onboarding & Email-Only Auth
* **Goal:** Zero barrier to entry.
* **Mechanism:** 
  * Only require email + password (or magic link) and business name.
  * Use AI to infer the business sector and starter inventory from the business name (e.g., *"Mama Tunde Kitchen"* -> Food & Catering; *"Chidi Electronics"* -> Accessories & Gadgets).
  * Immediately land the user in the prompt console with pre-seeded sample inventory items.

### 2. Generous Free Tier with Smart Cost Guardrails
* **Goal:** Maximum active daily usage with zero customer acquisition friction.
* **Mechanism:**
  * Explore cost-aware limits for transactional commands and advisory chat based on measured usage and provider costs.
  * Apply abuse protection to expensive operations.

### 3. Fast-Path Deterministic Regex & Catalog Matcher
* **Goal:** Reduce latency and model usage for repeat, well-formed sales.
* **Mechanism:**
  * Cache the merchant's top 30 active inventory items on the client / edge.
  * If a command follows a standard pattern (e.g., *"Sold 2 rice at 1500"* or shorthand *"s 2 r 1500"*), match the SKU locally using fuzzy string distance.
  * Bypass the cloud LLM entirely for repeat, clean sales.

### 4. Compound / Split Transaction Parsing
* **Goal:** Capture how merchants actually speak when money and goods move simultaneously.
* **Mechanism:**
  * Allow compound commands in a single message:
    > *"Sold 1 bag of sugar for 85k, paid 50k transfer, 35k debt to Mama Nkechi, and spent 2k for transport."*
  * The harness parses and executes this across 4 independent ledgers simultaneously:
    1. Inventory deduction (-1 Sugar)
    2. Revenue credit (+₦85,000)
    3. Accounts Receivable / Debt (+₦35,000 owed by Mama Nkechi)
    4. Expense ledger (₦2,000 Transport)

---

## Medium-term ideas

### 5. Inverse Accounting ("The Leftover Count")
* **Goal:** Reconcile high-velocity micro-merchants (bakeries, food stalls, provision kiosks) without forcing them to log individual ₦500 sales.
* **Mechanism:**
  * **Morning:** Merchant logs opening stock (*"Started with 50 loaves of bread"*).
  * **Evening:** Merchant logs remaining stock (*"4 loaves left on the shelf. 46k in the drawer"*).
  * **Harness Calculation:** Deduces 46 units sold = ₦46,000 expected revenue. Cross-checks against recorded bank transfers and flags any cash shortfall.

### 6. Stateful Customer Entity Graph ("The Digital Tab")
* **Goal:** Turn CORE into the merchant’s external brain for debts and customer relationships.
* **Mechanism:**
  * Maintain persistent debt state across days:
    * Day 1: *"Tunde took 5 bags cement on book."* (Debt: ₦45,000)
    * Day 2: *"Tunde returned 1 damaged bag."* (Auto-adjusts debt to ₦36,000; damaged stock +1)
    * Day 4: *"Tunde sent 20k."* (Debt drops to ₦16,000)
  * Querying *"How much does Tunde have left?"* instantly returns full context and payment history.

### 7. Voice Memo & Audio Ingestion (WhatsApp & Browser)
* **Goal:** Hands-free sales logging for merchants packing goods or in noisy market stalls.
* **Mechanism:**
  * Merchants send short voice notes directly via WhatsApp or the web app microphone.
  * Direct audio-to-text pipeline into the transaction harness.

---

## Infrastructure ideas

### 8. Bank Alert & Transfer Ingestion
* **Goal:** Close the reconciliation loop using the primary payment method in Nigeria (instant transfers).
* **Mechanism:**
  * Ingest SMS bank notifications, push alerts, or transfer screenshots (OPay, PalmPay, Moniepoint, Kuda, GTBank).
  * Automatically correlate incoming credits with pending sales:
    > *"Credit alert received: ₦15,000 from Chinedu Okeke. Is this for the 3 cartons of Indomie?"*
  * Merchant confirms with one tap; sale is locked and verified.

### 9. Market-Proof Offline-First Engine
* **Goal:** Zero downtime in congested physical markets (Balogun, Computer Village, Onitsha Main Market) where mobile networks throttle.
* **Mechanism:**
  * Local IndexedDB/SQLite on-device storage.
  * Common transactions and balance updates execute optimistically on-device with zero internet.
  * Background queue synchronizes transactions to the server as soon as connectivity resumes.

---

## Longer-term ideas

### 10. Contextual Supply Chain Procurement (The "Ad" Pivot)
* **Goal:** Monetize through B2B commerce take-rates instead of intrusive display ads.
* **Mechanism:**
  * Discard generic banner ads.
  * When inventory hits reorder thresholds (e.g., *"Flour stock low: 2 bags left"*), display contextual restock offers:
    > *"Top-rated distributor in Trade Fair has Golden Penny Flour at ₦48,500/bag. [Order Restock via WhatsApp]"*
  * Charge wholesale FMCG distributors a lead-generation fee or a 1–2% transaction fee.

### 11. Verifiable Financial Identity & Working Capital Underwriting
* **Goal:** Convert daily bookkeeping data into an uncollateralized lending engine.
* **Mechanism:**
  * 6+ months of audited sales, inventory velocity, and debt recovery creates a proprietary **CORE Merchant Score**.
  * Partner with microfinance institutions and commercial banks to underwrite working capital loans and inventory financing directly inside the app.
