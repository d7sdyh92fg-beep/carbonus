# Carbonus Business Audit — Execution Plan

**Deliverable:** single Markdown file at `docs/audit-2026.md` (no app code changes).
**Depth:** full — DB analytics, competitor research, SEO/Semrush, GBP review, growth strategy, action plans.

---

## Phase 1 — Data collection (read-only, ~15–20 min)

### 1a. Internal data (Supabase)
Run read-only SQL against `reservations`, `customers`, `cars`, `invoices`, `car_blocked_dates`, `newsletter_subscribers`:
- Booking volume by month, weekday, season
- Revenue: total, by car, by month; average booking value; average rental days
- Conversion funnel: pending → confirmed → cancelled ratios
- Payment mix (Stripe vs pay_at_counter vs Montonio)
- Fleet utilization per car (booked days / available days)
- Repeat-customer rate, top customers, geographic spread (from address)
- Lead-time distribution (days between booking and pickup)
- Cancellation reasons/timing
- Email send success (`last_email_sent_status`)

### 1b. Website + product review
Read key routes/components: home, fleet listing, individual car page, booking flow (`ReservationReview` etc.), pricing logic, blog, contact, i18n strings. Note UX friction, missing trust signals, SEO on-page issues.

### 1c. First-party analytics (user to connect)
- **GA4** via connector → sessions, sources, landing pages, conversion rate, device split, geo, top exits, funnel drop-off
- **Google Search Console** via connector → queries, impressions, CTR, positions, top pages, indexing state, mobile issues
- If a connector doesn't authorise, note the gap and continue with Semrush estimates.

### 1d. External SEO/market data
- Semrush: `domain_analysis`, `top_pages`, `backlink_analysis`, `seo_trend`, `competitive_analysis` for carbonus.lt (LT database)
- SEO scan via `seo_chat--trigger_scan` for on-page findings
- Google Business Profile: fetch via web (reviews count, rating, photos, categories, posts) — user can share GBP URL if not auto-found

### 1e. Competitor scan
Since no competitors were named, I'll auto-discover via Semrush + local search:
- Druskininkai-local: search "automobilių nuoma Druskininkai", scrape top 5–8 results
- Regional LT: rentcars.lt, addcarrental.lt, sixt.lt, europcar.lt, topcar.lt, and any Kaunas/Vilnius operators delivering to Druskininkai
- Shared-mobility substitutes: CityBee, Bolt Drive (relevant as alternative, not direct)
For each: fleet, price ranges, min rental, deposit, insurance, delivery, booking UX (screenshot key steps via Playwright), Google rating/review count, social presence, USPs.

---

## Phase 2 — Analysis
Cross-reference internal data vs competitors vs market signals. Tag every finding as **Confirmed / Assumption / Missing data**. Identify:
- Revenue leaks (low utilisation cars, cancelled-flow drop-off, no-email bookings)
- Pricing gaps vs competitors (over/under-priced per car segment)
- Conversion barriers (booking flow, trust, payment, mobile)
- SEO opportunities (keyword gaps, missing landing pages, GBP weaknesses)
- Positioning angle for Druskininkai (spa tourists, business, locals, long-term)

---

## Phase 3 — Report writing (`docs/audit-2026.md`)

Structure the user requested, in this order:

1. **Executive summary** (1 page)
2. **Methodology & data sources** (what was pulled, what's missing)
3. **Current state — what's already done well** (features shipped, DB maturity, brand assets)
4. **Confirmed findings** — DB metrics, revenue, utilisation, conversion, seasonality (tables + charts as ASCII/markdown tables)
5. **Problems, weaknesses, wasted opportunities** (prioritised)
6. **Competitive advantages** (Carbonus-specific)
7. **Druskininkai market analysis** — tourist flows (Aqua/Snow Arena/spas), seasonality, buyer personas
8. **Competitor comparison table** — fleet, price, deposit, min rental, delivery, UX, GBP rating, USPs
9. **Ideal customer segments** (4 personas: spa tourists, active/family tourists, business/corporate, locals & long-term)
10. **Pricing & fleet strategy** — per-car recommendations, package/upsell ideas (child seat, extra driver, full-tank, ski/bike rack, airport delivery, spa-hotel bundle)
11. **Direct-booking growth strategy** — reduce OTA/aggregator dependency, on-site conversion levers
12. **Local SEO + GBP strategy** — target queries, city landing pages, GBP posts/photos/Q&A/review flow, schema.org, sitemap gaps
13. **Social media + paid ads strategy** — channels, content calendar template, Meta/Google Ads campaign structure with budgets
14. **Partnerships** — specific Druskininkai targets (Grand SPA, Europa Royale, Upa, Aqua Park, Snow Arena, restaurants, apartment hosts, event organisers, wedding planners)
15. **Segment plays** — tourists / locals / business / long-term rentals
16. **Website + booking-flow improvements** — concrete, referencing actual files/steps
17. **Data, CRM, automation, email, remarketing** — abandoned-booking flow, post-rental review request, win-back, GA4 events, Meta Pixel/CAPI, newsletter automation
18. **Action plan** — 30 / 90 / 180 / 365 days, each item tagged **Impact / Difficulty / Cost / Priority**
19. **Priority matrix** — Immediate fixes / High-impact / Medium-term / Long-term
20. **KPI dashboard** — weekly + monthly metrics with definitions and target ranges
21. **Experiment backlog** — 10–15 concrete A/B tests with hypothesis, metric, duration
22. **Appendix** — assumptions log, missing-data list with collection method, raw SQL used, competitor URLs

Every section separates **Confirmed / Assumption / Missing / Recommendation**.

---

## Deliverables checklist
- [ ] `docs/audit-2026.md` (main report, ~15–25k words)
- [ ] `docs/audit-2026-competitors.md` (raw competitor notes, optional split if main file gets too large)
- [ ] No code, DB, or config changes

## Approvals I'll need mid-run
- Connect GA4 + GSC connectors (one modal each) — you already approved
- SEO scan trigger (one approval)
- Semrush queries (built-in, no approval)

Once you approve this plan I'll switch to build mode, pull the data, and write the report. I'll post progress checkpoints after Phase 1 and Phase 2 so you can steer before the final write-up.
