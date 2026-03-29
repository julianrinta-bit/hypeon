# Amazon SP-API Research Report for Hype On Media

**Date:** 2026-03-24
**Purpose:** Determine what we can build to manage an Amazon.ae (UAE) electronics store from Claude Code
**Status:** Research complete — ready for engineering brief

---

## 1. Complete Endpoint Map by Approved Role

### UAE Marketplace Configuration
- **Marketplace ID:** `A2VIGQ35RCS4UG`
- **Domain:** amazon.ae
- **SP-API Endpoint:** `https://sellingpartnerapi-eu.amazon.com` (Europe region)
- **AWS Region:** `eu-west-1`
- **Currency:** AED (UAE Dirham)
- **Note:** UAE is under the EUROPE endpoint group, NOT Far East

### Role: Product Listing

| API | Endpoint/Operation | What It Does | Method | Rate Limit |
|-----|-------------------|--------------|--------|------------|
| **Listings Items API** | `GET /listings/2021-08-01/items/{sellerSku}` | Get a single listing by SKU | REST | ~5 req/sec |
| **Listings Items API** | `PUT /listings/2021-08-01/items/{sellerSku}` | Create or fully replace a listing | REST | ~5 req/sec |
| **Listings Items API** | `PATCH /listings/2021-08-01/items/{sellerSku}` | Partially update listing attributes (title, bullets, description, keywords) | REST | ~5 req/sec |
| **Listings Items API** | `DELETE /listings/2021-08-01/items/{sellerSku}` | Delete a listing | REST | ~5 req/sec |
| **Catalog Items API** | `GET /catalog/2022-04-01/items` | Search catalog items (by keyword, ASIN, etc.) | REST | 2 req/sec, burst 2 |
| **Catalog Items API** | `GET /catalog/2022-04-01/items/{asin}` | Get item details (title, images, classifications, dimensions) | REST | 2 req/sec, burst 2 |
| **Product Type Definitions API** | `GET /definitions/2020-09-01/productTypes` | List available product types for a marketplace | REST | 5 req/sec |
| **Product Type Definitions API** | `GET /definitions/2020-09-01/productTypes/{productType}` | Get JSON schema for a product type (required fields, allowed values) | REST | 5 req/sec |
| **Feeds API** | `POST /feeds/2021-06-30/feeds` | Submit bulk listing updates via `JSON_LISTINGS_FEED` | REST+Feed | 25K SKUs/request, 5 requests/5 min |
| **Feeds API** | `GET /feeds/2021-06-30/feeds/{feedId}` | Check feed processing status | REST | 2 req/sec |

**Key Notes:**
- For single-item updates: use Listings Items API (PATCH for partial updates)
- For bulk updates: use Feeds API with `JSON_LISTINGS_FEED` feed type
- Listings Items API and JSON_LISTINGS_FEED use the same schemas — data is interoperable
- Always use Product Type Definitions API first to get the correct schema for electronics products
- Images: upload via Listings Items API (provide image URLs) or A+ Content API for enhanced brand content

### Role: Pricing

| API | Endpoint/Operation | What It Does | Method | Rate Limit |
|-----|-------------------|--------------|--------|------------|
| **Product Pricing API v2022-05-01** | `POST /batches/products/pricing/2022-05-01/offer/competitiveSummary` | Get competitive pricing for up to 20 ASINs in one call (featured offers, lowest prices, reference prices) | REST (batch) | 0.5 req/sec |
| **Product Pricing API v0** | `GET /products/pricing/v0/price` | Get your current price for a list of ASINs/SKUs | REST | 10 items/request |
| **Product Pricing API v0** | `GET /products/pricing/v0/competitivePrice` | Get competitive pricing (Buy Box price, lowest prices) | REST | 10 items/request |
| **Product Pricing API v0** | `GET /products/pricing/v0/listings/{Sku}/offers` | Get all offers for a specific SKU | REST | 1 req/sec |
| **Listings Items API** | `PATCH` with price attributes | Update price for a SKU | REST | ~5 req/sec |
| **Automated Pricing Rules** | Via Notifications + Listings | Set up rule-based repricing (match featured offer, match lowest, external price match) | Hybrid | N/A |
| **Notifications API** | `ANY_OFFER_CHANGED` subscription | Real-time alerts when top 20 offers change or external price changes | Push (SQS/EventBridge) | Event-driven |

**Key Notes:**
- `getCompetitiveSummary` (v2022-05-01) is the most powerful — batch up to 20 ASINs, gets featured offer price + lowest prices + reference prices in one call
- Price updates go through Listings Items API PATCH (for individual) or JSON_LISTINGS_FEED (for bulk)
- Automated pricing rules can be created/managed via SP-API — Amazon executes them 24/7

### Role: Amazon Fulfillment

| API | Endpoint/Operation | What It Does | Method | Rate Limit |
|-----|-------------------|--------------|--------|------------|
| **FBA Inventory API v1** | `GET /fba/inventory/v1/summaries` | Get inventory summaries (fulfillable, inbound, reserved, unfulfillable, researching) | REST | 2 req/sec, burst 2 |
| **Fulfillment Inbound API v0** | Various operations | Create/manage inbound shipments to FBA warehouses | REST | Varies |
| **Fulfillment Inbound API v2024-03-20** | New version — shipment creation, packing, transport | Create inbound plans, shipments, packing options, transportation | REST | Varies |
| **Fulfillment Outbound API** | `GET /fba/outbound/2020-07-01/fulfillmentOrders` | Get multi-channel fulfillment orders | REST | 2 req/sec |
| **FBA Reports** | Various report types | Inventory health, age, planning, removal recommendations | Report | 1 report/min |

**Key Report Types for FBA:**
- `GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA` — Current FBA inventory (all SKUs, quantities, condition)
- `GET_FBA_MYI_ALL_INVENTORY_DATA` — Includes suppressed/inactive listings
- `GET_FBA_INVENTORY_AGED_DATA` — Inventory age for long-term storage fee planning
- `GET_FBA_FULFILLMENT_REMOVAL_ORDER_DETAIL_DATA` — Removal orders (to check what was removed and why)
- `GET_FBA_FULFILLMENT_REMOVAL_SHIPMENT_DETAIL_DATA` — Removal shipment details
- `GET_FBA_INVENTORY_PLANNING_DATA` — Recommended actions (excess inventory, restock)
- `GET_STRANDED_INVENTORY_UI_DATA` — Stranded inventory (items in FBA but not linked to active listing)

**To check which products were removed from FBA and why:**
1. Request `GET_FBA_FULFILLMENT_REMOVAL_ORDER_DETAIL_DATA` report — shows all removal orders with reasons
2. Request `GET_STRANDED_INVENTORY_UI_DATA` — shows stranded inventory
3. Use `GET_FBA_MYI_ALL_INVENTORY_DATA` vs `GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA` — difference reveals suppressed items
4. Check Listings Items API for listing status — items with `INACTIVE` or `DELETED` status

### Role: Selling Partner Insights

| API | Endpoint/Operation | What It Does | Method | Rate Limit |
|-----|-------------------|--------------|--------|------------|
| **Data Kiosk API** | `POST /dataKiosk/2023-11-15/queries` | Submit GraphQL query for sales/traffic data | REST | Varies |
| **Data Kiosk API** | `GET /dataKiosk/2023-11-15/queries/{queryId}` | Check query status and get results | REST | Varies |
| **Sales API** | `GET /sales/v1/orderMetrics` | Get aggregate sales metrics (units, revenue) by date/ASIN | REST | 0.5 req/sec |
| **Customer Feedback API** | `GET /customerFeedback/2024-06-01/items/{asin}/insights` | Review topics (positive/negative), star rating impact, trends | REST | Varies |

**Data Kiosk Datasets Available:**
- `Analytics_SalesAndTraffic` — Sales and traffic by ASIN or by date (daily, weekly, monthly)
- `Analytics_SellerEconomics` — Revenue, fees, ad spend, net proceeds
- Uses GraphQL — highly flexible querying, returns JSONL format

**Brand Analytics (if enrolled in Brand Registry):**
- Search engagement metrics (impressions, clicks, cart adds, purchases)
- Available at WEEK, MONTH, QUARTER granularity

### Role: Finance and Accounting

| API | Endpoint/Operation | What It Does | Method | Rate Limit |
|-----|-------------------|--------------|--------|------------|
| **Finances API** | `GET /finances/v0/financialEvents` | Get financial events (fees, refunds, adjustments) by date range | REST | 0.5 req/sec, burst 30 |
| **Finances API** | `GET /finances/v0/financialEventGroups` | Get settlement periods/groups | REST | 0.5 req/sec |
| **Finances API** | `GET /finances/v0/orders/{orderId}/financialEvents` | Get financial events for a specific order | REST | 0.5 req/sec |
| **Reports** | `GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE` | Settlement reports (payouts) | Report | Per-report limits |

### Role: Inventory and Order Tracking

| API | Endpoint/Operation | What It Does | Method | Rate Limit |
|-----|-------------------|--------------|--------|------------|
| **Orders API** | `GET /orders/v0/orders` | List orders by date range, status, fulfillment channel | REST | **0.0167 req/sec (1/min)**, burst 20 |
| **Orders API** | `GET /orders/v0/orders/{orderId}` | Get a specific order | REST | 0.0167 req/sec |
| **Orders API** | `GET /orders/v0/orders/{orderId}/orderItems` | Get items in an order | REST | 0.5 req/sec, burst 30 |
| **Orders API** | `GET /orders/v0/orders/{orderId}/address` | Get shipping address (PII restricted) | REST | 0.0167 req/sec |
| **Reports** | `GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE` | Bulk order data by date range | Report | Recommended over API for bulk |
| **Notifications** | `ORDER_STATUS_CHANGE` | Real-time order status notifications | Push | Event-driven |

**CRITICAL:** Orders API has the most restrictive rate limit — 1 request per minute sustained. For any bulk order analysis, ALWAYS use Reports API instead.

### Role: Brand Analytics

| API | Endpoint/Operation | What It Does | Method | Rate Limit |
|-----|-------------------|--------------|--------|------------|
| **Brand Analytics** (via Data Kiosk or Reports) | Search terms, demographics, repeat purchase | Brand-level insights | Report/GraphQL | Varies |
| **Customer Feedback API** | Review insights by ASIN or browse node | Positive/negative review topics, trends | REST | Varies |

### Cross-Role: Notifications API

| Notification Type | What It Does | Delivery |
|-------------------|--------------|----------|
| `ANY_OFFER_CHANGED` | Price/offer changes on your listings | SQS / EventBridge |
| `LISTINGS_ITEM_STATUS_CHANGE` | Listing created, deleted, or buyability changed | SQS / EventBridge |
| `ORDER_STATUS_CHANGE` | Order status updates | SQS / EventBridge |
| `ACCOUNT_STATUS_CHANGED` | Account health status changes (NORMAL/AT_RISK/DEACTIVATED) | SQS / EventBridge |
| `FBA_OUTBOUND_SHIPMENT_STATUS` | FBA shipment status changes | SQS / EventBridge |
| `FEED_PROCESSING_FINISHED` | Feed completed processing | SQS / EventBridge |
| `REPORT_PROCESSING_FINISHED` | Report ready for download | SQS / EventBridge |

**Note:** Notifications require an SQS queue or EventBridge destination. For a CLI-based tool, we'd poll instead. For an MCP server running continuously, notifications are valuable.

---

## 2. Key Operations — How To Do Each

### List All Active Listings
**Best approach:** Request the `GET_MERCHANT_LISTINGS_ALL_DATA` report via Reports API.
- Returns: SKU, ASIN, title, price, quantity, status, fulfillment channel
- One API call gets everything — no pagination needed
- Alternative: Use Catalog Items API to search by seller ID, but reports are more efficient

### Update a Listing (Title, Bullets, Description, Images, Keywords)
**Best approach:** Listings Items API `PATCH` for individual SKUs.
1. Call Product Type Definitions API to get the JSON schema for the product type
2. Build the patch payload with the attributes to update
3. `PATCH /listings/2021-08-01/items/{sellerSku}` with marketplace ID `A2VIGQ35RCS4UG`
4. Monitor via `LISTINGS_ITEM_STATUS_CHANGE` notification or poll feed status

**For bulk updates:** Use `JSON_LISTINGS_FEED` via Feeds API (up to 25K SKUs per request).

### Check Inventory Levels (FBA)
**Best approach:** FBA Inventory API `getInventorySummaries`
- Returns: fulfillable, inbound (working/shipped/receiving), reserved, unfulfillable, researching quantities
- Filter by marketplace, date, granularity
- For detailed inventory health: request `GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA` report

### Get Sales Data (Orders, Revenue, Units)
**Best approach:** Data Kiosk API with `Analytics_SalesAndTraffic` dataset
- GraphQL query for sales by ASIN or by date
- For quick aggregate: Sales API `getOrderMetrics`
- For individual orders: Reports API `GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE` (NOT the Orders API — too slow at 1 req/min)

### Get Account Health
**Best approach:** Reports API `GET_V2_SELLER_PERFORMANCE_REPORT`
- Returns: Order Defect Rate, Late Shipment Rate, Pre-Fulfillment Cancellation Rate, Valid Tracking Rate
- Each metric has a status (GOOD/WARNING/CRITICAL)
- Subscribe to `ACCOUNT_STATUS_CHANGED` notification for real-time alerts

### Manage Pricing
**Read current:** Product Pricing API `getCompetitiveSummary` (batch up to 20 ASINs)
**Update:** Listings Items API `PATCH` with price attributes, or `JSON_LISTINGS_FEED` for bulk
**Automate:** Set up automated pricing rules via SP-API

### PPC/Advertising
**NOT SP-API.** This is the Amazon Advertising API — completely separate system. See Section 5 below.

### Get Reviews/Ratings
**Best approach:** Customer Feedback API (SP-API)
- `GET /customerFeedback/2024-06-01/items/{asin}/insights`
- Returns: most positive and negative review topics, number of mentions, effect on star rating
- Monthly trends available
- Note: You CANNOT get individual review text — only aggregated insights and topics

### Check Products Removed from FBA and Why
**Multi-step approach:**
1. `GET_FBA_FULFILLMENT_REMOVAL_ORDER_DETAIL_DATA` — all removal orders with reasons
2. `GET_STRANDED_INVENTORY_UI_DATA` — items in FBA warehouses but not linked to active listings
3. Compare `GET_FBA_MYI_ALL_INVENTORY_DATA` vs `GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA` — difference reveals suppressed items
4. Listings Items API `getListingsItem` — check `status` field for each SKU

---

## 3. Architecture: MCP Server vs Script Toolkit vs Library

### Option A: MCP Server

**What exists:** `AmazonSeller-mcp-server` by mattcoatsworth (GitHub)
- npm: `amazon-sp-api-mcp-server`
- Covers: catalog, inventory, orders, reports
- Integration: works with Claude Desktop and MCP-compatible clients

Also: `@iflow-mcp/jay-trivedi-amazon_sp_mcp` (published 2026-03-17, very recent)

**Pros:**
- Claude Code can call SP-API tools directly in conversation ("get my inventory levels")
- Stateful — can maintain auth tokens and rate limit tracking
- Natural language interface — ask questions, get structured answers
- Runs continuously — can receive notifications

**Cons:**
- Additional infrastructure to maintain (process running in background)
- Existing MCP servers have limited coverage — we'd need to extend significantly
- Debugging MCP tool calls is less transparent than reading script output
- MCP protocol adds a layer of abstraction that can obscure API errors

**Setup time:** 2-4 hours (if extending existing), 1-2 days (if building from scratch)

### Option B: Node.js CLI Toolkit

**What it looks like:** A set of scripts in the project repo that Claude runs via Bash.
```
scripts/
  amazon/
    list-inventory.js
    update-listing.js
    get-sales.js
    check-health.js
    update-price.js
    get-competitive-prices.js
    request-report.js
    get-reviews.js
```

**Pros:**
- Full transparency — Claude sees exact script output
- Easy to debug — run scripts manually, inspect output
- No background process needed
- Version controlled with the project
- Julian can run scripts independently of Claude
- Fastest to build — just wrap the SDK

**Cons:**
- Each script is a separate invocation (no shared state between calls)
- Auth token management per-call (or cached to file)
- No real-time notifications without a separate process
- Less "conversational" — Claude has to invoke specific scripts

**Setup time:** 4-8 hours for core scripts

### Option C: Use Existing Library Directly

**Best npm packages:**

| Package | Maintainer | Latest | Notes |
|---------|-----------|--------|-------|
| `@amazon-sp-api-release/amazon-sp-api-sdk-js` | **Amazon (official)** | v1.7.3 (2026-03-02) | Official SDK, ESM, full API coverage, typed |
| `amazon-sp-api` | jrl84 (community) | v1.2.0 (2025-11-11) | Most popular community package, handles auth/tokens/rate-limits automatically |
| `@sp-api-sdk/*` (ScaleLeap) | ScaleLeap | Active | Fully typed TypeScript SDK, modular packages per API |

**Pros:**
- Least code to write — libraries handle auth, signing, rate limiting
- Official SDK (`@amazon-sp-api-release`) is maintained by Amazon themselves
- Community package (`amazon-sp-api`) has excellent DX — auto-handles token refresh

**Cons:**
- Still need wrapper scripts for Claude Code to invoke
- Library alone doesn't provide a user interface

### RECOMMENDATION: Option B + C Hybrid

**Build a Node.js CLI toolkit using the official Amazon SDK.**

Rationale:
1. **Use `@amazon-sp-api-release/amazon-sp-api-sdk-js`** (official) as the base library — it's maintained by Amazon, has full coverage, and is actively updated (latest: March 2026)
2. **Wrap it in CLI scripts** that Claude Code invokes via Bash — maximum transparency and debuggability
3. **Later, optionally add an MCP layer** on top of the CLI scripts once the core functionality is proven

This gives us:
- Fast setup (library handles auth complexity)
- Full transparency (Claude sees script output)
- Portability (scripts work with or without Claude)
- Easy upgrade path to MCP if needed

**Do NOT start with an MCP server.** The existing ones are too limited and building a full one is premature. Get the scripts working first, then wrap them in MCP if the workflow justifies it.

---

## 4. UAE-Specific Notes (amazon.ae)

### What Works
- **All core SP-API endpoints work for UAE.** Product Listing, Pricing, FBA Inventory, Orders, Reports, Finances — all supported.
- **Amazon Advertising API supports UAE** (marketplace code: AE). Sponsored Products, Sponsored Brands, Sponsored Display all available.
- **Arabic keyword translations** available for Sponsored Products campaigns (auto-translate feature).

### Marketplace Configuration
- **Region:** Europe (NOT Far East despite being in the Middle East)
- **Endpoint:** `https://sellingpartnerapi-eu.amazon.com`
- **AWS Region:** `eu-west-1` (Ireland)
- **Marketplace ID:** `A2VIGQ35RCS4UG`
- **Currency:** AED
- **Language:** English primary, Arabic secondary. Listing content can be in both languages.

### Fee Implications
- **Private app (self-authorized) = NO new API fees.** The 2026 fee changes ($1,400/year + usage fees) only apply to third-party developer apps. Since this is a private app for our own store, we are exempt.

### Potential Limitations
- **Brand Analytics** may have limited data for UAE compared to US/EU (smaller marketplace = less search data)
- **Some FBA report types** may have delayed availability for UAE vs tier-1 marketplaces
- **A+ Content** availability depends on Brand Registry enrollment status
- **Automated pricing rules** — full feature parity with major marketplaces confirmed
- **Data Kiosk** — GraphQL datasets available for UAE

### Arabic Listings
- SP-API supports multilingual listings. For UAE, you can submit both English and Arabic content
- The Listings Items API PATCH supports language-specific attribute updates
- Arabic keyword optimization is important for UAE market visibility
- Sponsored Products supports Arabic keywords natively

---

## 5. Amazon Advertising API (Separate from SP-API)

### Overview
The Amazon Advertising API is a **completely separate API** from SP-API. Different registration, different credentials, different endpoints, different authentication flow.

### How to Get Access
1. **Go to:** `https://advertising.amazon.com/API/docs/en-us/guides/onboarding/apply-for-access`
2. **Category:** Apply as an "Advertiser" (managing your own campaigns)
3. **Requirements:**
   - Active Amazon Ads account with campaign management permissions
   - You must have run at least one campaign on Amazon
   - OAuth 2.0 authentication
4. **Approval time:** Typically 1-2 weeks for self-service advertisers
5. **Cost:** FREE — no per-call charges (unlike SP-API for third parties)

### What It Can Do

| Capability | API | Notes |
|-----------|-----|-------|
| **Create campaigns** | Sponsored Products, Sponsored Brands, Sponsored Display | Full CRUD on campaigns, ad groups, keywords, ads |
| **Bid management** | Bid adjustment APIs | Set bids, adjust by placement, dayparting |
| **Keyword targeting** | Keyword and negative keyword APIs | Add, remove, adjust match types |
| **Product targeting** | Product targeting APIs | Target specific ASINs or categories |
| **Budget management** | Campaign budget APIs | Set daily budgets, portfolio budgets |
| **Reporting** | Campaign, keyword, search term, placement reports | Performance data: impressions, clicks, spend, sales, ACoS |
| **Search term harvesting** | Search term reports | Find converting search terms for keyword expansion |
| **Bulk operations** | Bulk spreadsheet upload/download | Manage thousands of keywords/campaigns at once |

### UAE Support
- **Confirmed:** UAE (AE) is a supported marketplace for Amazon Advertising API
- **Available ad types:** Sponsored Products, Sponsored Brands, Sponsored Display
- **Arabic keywords:** Keyword translations available — enter in English, Amazon translates to Arabic
- **Reporting:** Full reporting available for UAE marketplace

### How It Connects to SP-API Data
- **ASIN data** from SP-API Catalog Items API feeds into ad campaign creation
- **Sales data** from SP-API can be correlated with **advertising spend** from Ads API to calculate true profitability
- **Inventory data** from SP-API informs ad pause/resume decisions (don't advertise out-of-stock items)
- **Pricing data** from SP-API informs bid strategies (higher margin = can bid more aggressively)

### Libraries
- No official JavaScript SDK for Amazon Ads API (unlike SP-API)
- Community package: `python-amazon-ad-api` (Python only)
- For Node.js: direct REST calls with OAuth 2.0 auth, or build a thin wrapper

---

## 6. Recommended npm Packages

### Tier 1: Must Install

| Package | Why |
|---------|-----|
| `@amazon-sp-api-release/amazon-sp-api-sdk-js` | **Official Amazon SDK.** Full coverage, typed, ESM, actively maintained (v1.7.3, March 2026). Use this as the foundation. |
| `dotenv` | Load SP-API credentials from `.env` file securely |

### Tier 2: Strong Consideration

| Package | Why |
|---------|-----|
| `amazon-sp-api` (by jrl84) | Community package with excellent DX. Auto-handles token refresh, rate limiting, and request signing. Simpler API surface than official SDK. Good alternative if official SDK is too verbose. |
| `commander` or `yargs` | CLI argument parsing for the script toolkit |
| `chalk` | Colored terminal output for better readability |

### Tier 3: Later (if building MCP)

| Package | Why |
|---------|-----|
| `@modelcontextprotocol/sdk` | MCP server SDK — only if we decide to build the MCP layer |
| `amazon-sp-api-mcp-server` | Existing MCP server to fork/extend — evaluate before building from scratch |

### NOT Recommended

| Package | Why Not |
|---------|---------|
| `@sp-api-sdk/*` (ScaleLeap) | Good TypeScript types but less actively maintained than official SDK |
| `amazon-sp-api-node8` | Node 8 compatibility fork — we don't need legacy support |

---

## 7. Priority-Ordered Build Plan

### Phase 1: Foundation (Day 1) — MAXIMUM IMMEDIATE VALUE

**Goal:** See the current state of the store. Read-only operations.

1. **Set up auth** — Configure `.env` with SP-API credentials, test LWA token refresh
2. **`list-inventory.js`** — FBA Inventory API `getInventorySummaries` → Show all products, quantities, status
3. **`list-listings.js`** — Reports API `GET_MERCHANT_LISTINGS_ALL_DATA` → All listings with status
4. **`get-sales.js`** — Sales API `getOrderMetrics` or Data Kiosk → Revenue, units by date range
5. **`check-health.js`** — Reports API `GET_V2_SELLER_PERFORMANCE_REPORT` → Account health metrics

**Outcome:** Complete visibility into store status. Know exactly what's active, what's dormant, what inventory exists.

### Phase 2: Pricing Intelligence (Day 2)

**Goal:** Understand competitive position and optimize prices.

6. **`get-prices.js`** — Product Pricing API `getCompetitiveSummary` → Our price vs Buy Box vs lowest
7. **`update-price.js`** — Listings Items API PATCH → Change price for a SKU
8. **`get-reviews.js`** — Customer Feedback API → Review insights by ASIN

**Outcome:** Can monitor and adjust pricing. Know what customers are saying.

### Phase 3: Listing Optimization (Day 3-4)

**Goal:** Update and optimize listings for better visibility.

9. **`update-listing.js`** — Listings Items API PATCH → Update title, bullets, description, keywords, images
10. **`get-product-schema.js`** — Product Type Definitions API → Get required/optional fields for electronics
11. **`check-listing-issues.js`** — Listings Items API → Check for suppressed or incomplete listings

**Outcome:** Can optimize all listing content programmatically. Fix issues, improve keywords.

### Phase 4: Financial Visibility (Day 4-5)

**Goal:** Understand profitability.

12. **`get-finances.js`** — Finances API → Fees, settlements, refunds
13. **`get-fba-removals.js`** — Reports API → What was removed from FBA and why
14. **`get-stranded.js`** — Reports API → Stranded inventory identification

**Outcome:** Full financial picture. Know where money is going, what FBA is costing.

### Phase 5: Advertising (Week 2) — SEPARATE TRACK

**Goal:** Set up and manage PPC campaigns.

15. **Register for Amazon Advertising API** — separate application, ~1-2 weeks approval
16. **Build `ads/` script folder** — campaign creation, bid management, reporting
17. **Connect ads data to SP-API data** — profitability per ASIN including ad spend

**Outcome:** Programmatic ad management. Campaign creation, keyword harvesting, bid optimization.

### Phase 6: Automation & MCP (Week 3+) — ONLY IF JUSTIFIED

**Goal:** Automate recurring tasks and improve Claude Code ergonomics.

18. **Evaluate MCP conversion** — If we're running the same scripts daily, wrap them in an MCP server
19. **Add notifications** — Set up SQS for real-time alerts (price changes, order status, account health)
20. **Build automated workflows** — Daily health check, weekly pricing review, inventory alerts

---

## Appendix: API Authentication Quick Reference

### SP-API Auth Flow (LWA + IAM)
```
Credentials needed:
- LWA Client ID (from Seller Central Developer Console)
- LWA Client Secret
- Refresh Token (from self-authorization)
- AWS Access Key ID (IAM user)
- AWS Secret Access Key (IAM user)
- IAM Role ARN (for request signing)
- Seller ID / Merchant Token

Token flow:
1. Exchange refresh_token → access_token via LWA endpoint
2. Sign request with AWS SigV4 using IAM credentials
3. Include access_token in request header
4. Official SDK handles all of this automatically
```

### Amazon Ads API Auth Flow (OAuth 2.0)
```
Credentials needed:
- Client ID (from Amazon Ads developer registration)
- Client Secret
- Refresh Token (from OAuth flow)
- Profile ID (per marketplace)

Token flow:
1. Exchange refresh_token → access_token via Amazon auth endpoint
2. Include access_token + profile_id in request headers
3. No AWS signing required (simpler than SP-API)
```

### Environment Variables Template
```env
# SP-API Credentials
SPAPI_LWA_CLIENT_ID=
SPAPI_LWA_CLIENT_SECRET=
SPAPI_REFRESH_TOKEN=
SPAPI_AWS_ACCESS_KEY_ID=
SPAPI_AWS_SECRET_ACCESS_KEY=
SPAPI_IAM_ROLE_ARN=
SPAPI_SELLER_ID=
SPAPI_MARKETPLACE_ID=A2VIGQ35RCS4UG

# Amazon Ads API (separate)
AMAZON_ADS_CLIENT_ID=
AMAZON_ADS_CLIENT_SECRET=
AMAZON_ADS_REFRESH_TOKEN=
AMAZON_ADS_PROFILE_ID=
```

---

## Sources

- [SP-API Endpoints](https://developer-docs.amazon.com/sp-api/docs/sp-api-endpoints)
- [SP-API Rate Limits Guide 2026](https://www.novadata.io/resources/blog/amazon-sp-api-rate-limits-guide)
- [Listings Items API](https://developer-docs.amazon.com/sp-api/docs/listings-items-api)
- [Product Pricing API](https://developer-docs.amazon.com/sp-api/docs/product-pricing-api)
- [FBA Inventory API](https://developer-docs.amazon.com/sp-api/docs/fba-inventory-api)
- [Data Kiosk API](https://developer-docs.amazon.com/sp-api/docs/data-kiosk-api)
- [Customer Feedback API](https://developer-docs.amazon.com/sp-api/docs/customer-feedback-api)
- [Marketplace IDs](https://developer-docs.amazon.com/sp-api/docs/marketplace-ids)
- [Notification Type Values](https://developer-docs.amazon.com/sp-api/docs/notification-type-values)
- [Account Health Blog Post](https://developer-docs.amazon.com/sp-api-blog/docs/ensuring-healthy-seller-account-status)
- [SP-API Pricing Changes 2026](https://ppc.land/amazon-introduces-fees-for-third-party-developer-api-access-in-2026/)
- [Official JS SDK on npm](https://www.npmjs.com/package/@amazon-sp-api-release/amazon-sp-api-sdk-js)
- [Community amazon-sp-api on npm](https://www.npmjs.com/package/amazon-sp-api)
- [AmazonSeller MCP Server](https://github.com/mattcoatsworth/AmazonSeller-mcp-server)
- [Amazon Ads API Overview](https://advertising.amazon.com/API/docs/en-us/reference/api-overview)
- [Amazon Ads API Access Application](https://advertising.amazon.com/API/docs/en-us/guides/onboarding/apply-for-access)
- [SP-API vs Ads API Guide](https://www.sellerlabs.com/blog/amazon-sp-api-vs-ad-api-guide/)
- [Official SP-API SDK on GitHub](https://github.com/amzn/selling-partner-api-sdk)
- [UAE Ads Insights](https://advertising.amazon.com/library/guides/middle-east-ad-insights-tactics)
- [SP-API 2026 Fee Optimization](https://www.deltologic.com/blog/amazon-sp-api-2026-fees-how-to-optimize-your-api-calls-and-save-money)
- [FBA Report Types](https://developer-docs.amazon.com/sp-api/docs/report-type-values-fba)
- [Performance Reports](https://developer-docs.amazon.com/sp-api/docs/report-type-values-performance)
- [Usage Plans and Rate Limits](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits)
