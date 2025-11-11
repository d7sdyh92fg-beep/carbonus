# 📊 CARBONUS - COMPLETE GOOGLE ANALYTICS STRATEGY

## 🎯 BUSINESS OBJECTIVES & KPIs

### Primary Business Objective
**Increase car rental bookings and revenue through online channels**

### Key Performance Indicators (KPIs)

#### 1. **Revenue Metrics**
- Monthly Revenue: €5,000 - €20,000
- Average Booking Value: €150 - €300
- Revenue per Session: €3 - €8
- Conversion Rate: 2% - 5%

#### 2. **Traffic Metrics**
- Monthly Sessions: 2,000 - 10,000
- Organic Traffic: 60% - 70%
- Direct Traffic: 15% - 20%
- Referral Traffic: 10% - 15%
- Social Traffic: 5% - 10%

#### 3. **Engagement Metrics**
- Average Session Duration: 2:30 - 4:00 minutes
- Pages per Session: 3 - 6 pages
- Bounce Rate: 40% - 60%

#### 4. **Conversion Metrics**
- Booking Completion Rate: 60% - 80%
- Quote Request Rate: 5% - 10%
- Phone Call Rate: 3% - 7%
- WhatsApp Message Rate: 2% - 5%

---

## 🎯 GOOGLE ANALYTICS 4 (GA4) SETUP

### Step 1: Create GA4 Property (Detailed)

1. **Go to Google Analytics**
   - Visit: https://analytics.google.com/
   - Sign in with your Google account

2. **Create Account**
   ```
   Account Name: Carbonus
   Account Data Sharing Settings:
   ✅ Google products & services
   ✅ Benchmarking
   ✅ Technical support
   ✅ Account specialists
   ```

3. **Create Property**
   ```
   Property Name: Carbonus.lt
   Reporting time zone: (GMT+02:00) Eastern European Time - Vilnius
   Currency: Euro (EUR)
   ```

4. **Industry & Business Size**
   ```
   Industry category: Automotive
   Business size: Small (1-10 employees)
   ```

5. **Business Objectives** (Select all that apply)
   ```
   ✅ Get baseline reports
   ✅ Generate leads
   ✅ Raise brand awareness
   ✅ Examine user behavior
   ```

6. **Data Stream Setup**
   ```
   Platform: Web
   Website URL: https://carbonus.lt
   Stream name: Carbonus Website
   
   Enhanced measurement (enable all):
   ✅ Page views
   ✅ Scrolls
   ✅ Outbound clicks
   ✅ Site search
   ✅ Video engagement
   ✅ File downloads
   ```

7. **Copy Measurement ID**
   - Format: G-XXXXXXXXXX
   - Save this for later!

---

## 📈 CONVERSION GOALS SETUP

### Goal 1: Booking Completion (Primary)
```
Event name: booking_complete
Conversion: Yes
Value: €200 (average booking)

Details:
- When: Reservation reaches "payment success" page
- Trigger: Payment confirmation
- Value: Actual booking amount
```

### Goal 2: Quote Request
```
Event name: quote_request
Conversion: Yes
Value: €50 (potential value)

Details:
- When: User submits booking calendar selection
- Trigger: Date selection completed
- Value: Estimated booking value
```

### Goal 3: Phone Call Click
```
Event name: phone_call_click
Conversion: Yes
Value: €30 (lead value)

Details:
- When: User clicks phone number
- Trigger: tel: link clicked
- Value: Fixed lead value
```

### Goal 4: WhatsApp Message
```
Event name: whatsapp_click
Conversion: Yes
Value: €25 (lead value)

Details:
- When: User clicks WhatsApp button
- Trigger: WhatsApp link clicked
- Value: Fixed lead value
```

### Goal 5: Email Click
```
Event name: email_click
Conversion: Yes
Value: €15 (lead value)

Details:
- When: User clicks email link
- Trigger: mailto: link clicked
- Value: Fixed lead value
```

### Goal 6: Contact Form Submission
```
Event name: contact_form_submit
Conversion: Yes
Value: €20 (lead value)

Details:
- When: User submits contact form
- Trigger: Form submission successful
- Value: Fixed lead value
```

### Goal 7: Car View
```
Event name: view_car
Conversion: No
Value: €5 (engagement value)

Details:
- When: User views car detail page
- Trigger: Car detail page loaded
- Parameters: car_id, car_name
```

### Goal 8: Blog Post Read
```
Event name: read_article
Conversion: No
Value: €2 (engagement value)

Details:
- When: User reads blog post for 30+ seconds
- Trigger: Time on page threshold
- Parameters: article_title, article_category
```

---

## 🎨 CUSTOM EVENTS TRACKING

### E-commerce Events

#### 1. View Car List
```javascript
gtag('event', 'view_item_list', {
  item_list_id: "car_fleet",
  item_list_name: "Available Cars",
  items: [
    {
      item_id: "1",
      item_name: "BMW 3 series",
      item_category: "Sedanas",
      price: 30.00
    },
    // ... more cars
  ]
});
```

#### 2. View Car Details
```javascript
gtag('event', 'view_item', {
  currency: "EUR",
  value: 30.00,
  items: [
    {
      item_id: "1",
      item_name: "BMW 3 series",
      item_category: "Sedanas",
      item_variant: "2017",
      price: 30.00
    }
  ]
});
```

#### 3. Begin Checkout
```javascript
gtag('event', 'begin_checkout', {
  currency: "EUR",
  value: 150.00,
  items: [
    {
      item_id: "1",
      item_name: "BMW 3 series",
      rental_days: 5,
      start_date: "2024-12-20",
      end_date: "2024-12-25",
      price: 30.00,
      quantity: 5
    }
  ]
});
```

#### 4. Purchase (Booking Complete)
```javascript
gtag('event', 'purchase', {
  transaction_id: "RES_12345",
  currency: "EUR",
  value: 150.00,
  tax: 0,
  items: [
    {
      item_id: "1",
      item_name: "BMW 3 series",
      rental_days: 5,
      price: 30.00,
      quantity: 5
    }
  ]
});
```

### Lead Generation Events

#### 5. Generate Lead
```javascript
gtag('event', 'generate_lead', {
  currency: "EUR",
  value: 50.00,
  method: "booking_form"
});
```

#### 6. Contact Events
```javascript
// Phone call
gtag('event', 'contact', {
  method: 'phone',
  phone_number: '+370698187
81'
});

// WhatsApp
gtag('event', 'contact', {
  method: 'whatsapp',
  phone_number: '+37069818781'
});

// Email
gtag('event', 'contact', {
  method: 'email',
  email_address: 'info@carbonus.lt'
});
```

### User Engagement Events

#### 7. Search
```javascript
gtag('event', 'search', {
  search_term: "bmw",
  search_location: "car_page"
});
```

#### 8. Filter Cars
```javascript
gtag('event', 'filter_cars', {
  filter_type: "category",
  filter_value: "Sedanas"
});
```

#### 9. View Blog Post
```javascript
gtag('event', 'view_blog_post', {
  article_id: "savings-tips",
  article_title: "10 patarimu kaip sutaupyti",
  article_category: "Tips"
});
```

#### 10. Newsletter Signup
```javascript
gtag('event', 'newsletter_signup', {
  method: "footer_form"
});
```

---

## 📊 CUSTOM DIMENSIONS & METRICS

### Custom Dimensions

#### User-Level Dimensions
```
1. User Type
   - Values: New Customer, Returning Customer, VIP
   - Scope: User
   
2. Customer Segment
   - Values: Individual, Corporate, Tourist
   - Scope: User
   
3. Preferred Language
   - Values: Lithuanian, English
   - Scope: User
```

#### Session-Level Dimensions
```
4. Device Category
   - Values: Mobile, Desktop, Tablet
   - Scope: Session
   
5. Traffic Source Detail
   - Values: Organic, Paid, Direct, Referral, Social
   - Scope: Session
   
6. Geographic Location
   - Values: Druskininkai, Vilnius, Kaunas, Other
   - Scope: Session
```

#### Event-Level Dimensions
```
7. Car Category
   - Values: Sedanas, Miniautobusas, Universalas, Hecbekas
   - Scope: Event
   
8. Booking Duration
   - Values: 1-3 days, 4-7 days, 8+ days
   - Scope: Event
   
9. Lead Source
   - Values: Phone, WhatsApp, Email, Contact Form
   - Scope: Event
```

### Custom Metrics

```
1. Average Booking Value (EUR)
2. Booking Completion Rate (%)
3. Lead Conversion Rate (%)
4. Revenue per Session (EUR)
5. Cost per Acquisition (EUR)
```

---

## 🎯 AUDIENCE SEGMENTS

### 1. Hot Leads
```
Definition: Users who viewed 3+ car pages in last 7 days
Use: Remarketing campaigns
Value: High conversion potential
```

### 2. Cart Abandoners
```
Definition: Started booking but didn't complete
Use: Recovery email campaigns
Value: Medium conversion potential
```

### 3. Blog Readers
```
Definition: Read 2+ blog posts in last 30 days
Use: Newsletter campaigns
Value: Brand awareness
```

### 4. High-Value Customers
```
Definition: Completed booking worth €300+
Use: VIP offers, loyalty program
Value: Repeat business
```

### 5. Mobile Users from Vilnius
```
Definition: Mobile traffic from Vilnius area
Use: Local mobile ads
Value: Geographic targeting
```

### 6. Corporate Visitors
```
Definition: Visitors during business hours (9-17)
Use: B2B campaigns
Value: Corporate bookings
```

---

## 📱 ENHANCED ECOMMERCE TRACKING

### Funnel Stages

```
Stage 1: Homepage Visit
↓
Stage 2: View Car List (/automobiliai)
↓ (30% drop-off)
Stage 3: View Car Details (/automobiliai/1)
↓ (40% drop-off)
Stage 4: Select Dates (Booking Calendar)
↓ (25% drop-off)
Stage 5: Payment Page
↓ (15% drop-off)
Stage 6: Booking Complete ✅
```

### Drop-off Analysis
```
Measure:
- Where users leave the funnel
- Time spent at each stage
- Device-specific drop-offs
- Geographic drop-offs

Action:
- Optimize high drop-off pages
- A/B test improvements
- Add exit-intent popups
```

---

## 🔍 ATTRIBUTION MODELING

### Models to Use

#### 1. Data-Driven Attribution (Primary)
```
Weight: Based on actual conversion data
Use: Overall attribution
Best for: Understanding full customer journey
```

#### 2. Last Click (Secondary)
```
Weight: 100% to last interaction
Use: Direct conversion tracking
Best for: ROI calculations
```

#### 3. First Click (Secondary)
```
Weight: 100% to first interaction
Use: Awareness campaigns
Best for: Top-of-funnel analysis
```

#### 4. Linear (Comparison)
```
Weight: Equal across all touchpoints
Use: Comprehensive view
Best for: Multi-touch campaigns
```

---

## 📊 CUSTOM REPORTS TO CREATE

### 1. Booking Performance Report
```
Metrics:
- Total Bookings
- Booking Value
- Conversion Rate
- Average Days to Book

Dimensions:
- Car Category
- Booking Duration
- Traffic Source
- Device

Filters:
- Status = Completed
- Date Range = Last 30 days
```

### 2. Lead Generation Report
```
Metrics:
- Total Leads
- Lead Source
- Lead Conversion Rate
- Cost per Lead

Dimensions:
- Lead Type (Phone, WhatsApp, Email, Form)
- Traffic Source
- Landing Page
- Device

Filters:
- Event = Lead Generated
```

### 3. Car Performance Report
```
Metrics:
- Views
- Booking Rate
- Revenue
- Average Rental Days

Dimensions:
- Car ID
- Car Name
- Car Category

Sort by: Revenue (Descending)
```

### 4. Traffic Source Performance
```
Metrics:
- Sessions
- Bookings
- Revenue
- Conversion Rate
- CPA (Cost per Acquisition)

Dimensions:
- Source/Medium
- Campaign
- Keyword (if available)

Filters:
- Date Range = Last 90 days
```

### 5. Geographic Performance
```
Metrics:
- Sessions
- Bookings
- Revenue
- Conversion Rate

Dimensions:
- City
- Country
- Region

Map Overlay: Yes
Filter: Lithuania focus
```

### 6. Device & Browser Report
```
Metrics:
- Sessions
- Bookings
- Revenue
- Conversion Rate by Device

Dimensions:
- Device Category
- Browser
- Operating System
- Screen Resolution

Use: Optimize for top devices
```

### 7. Content Performance Report
```
Metrics:
- Page Views
- Unique Visitors
- Average Time on Page
- Bounce Rate
- Exit Rate

Dimensions:
- Page Path
- Page Title
- Content Group

Sort by: Most Valuable Content
```

### 8. Real-Time Dashboard
```
Metrics:
- Active Users (Now)
- Active Pages
- Events in Last 30 Minutes
- Conversions Today

Dimensions:
- Real-time location
- Device
- Traffic source

Refresh: Auto (60 seconds)
```

---

## 🎯 GOALS & BENCHMARKS

### Monthly Targets

#### Traffic Goals
```
Month 1-3:
- 500-1,000 sessions
- 300-600 users
- 2-3 min avg session duration

Month 4-6:
- 2,000-3,000 sessions
- 1,200-1,800 users
- 3-4 min avg session duration

Month 7-12:
- 5,000-8,000 sessions
- 3,000-5,000 users
- 4-5 min avg session duration
```

#### Conversion Goals
```
Month 1-3:
- 10-20 bookings
- 2-3% conversion rate
- €1,500-€3,000 revenue

Month 4-6:
- 40-60 bookings
- 3-4% conversion rate
- €6,000-€12,000 revenue

Month 7-12:
- 100-150 bookings
- 4-5% conversion rate
- €15,000-€30,000 revenue
```

#### Lead Generation Goals
```
Month 1-3:
- 50-100 leads
- 10% lead rate
- €5-€10 cost per lead

Month 4-6:
- 150-250 leads
- 8-10% lead rate
- €3-€7 cost per lead

Month 7-12:
- 400-600 leads
- 7-10% lead rate
- €2-€5 cost per lead
```

---

## 📧 AUTOMATED REPORTS

### Weekly Report (Monday 9 AM)
```
Recipients: Owner, Manager
Format: PDF + Email

Include:
- Last 7 days performance
- Week-over-week comparison
- Top performing cars
- Conversion rate
- Revenue summary
- Top traffic sources
```

### Monthly Report (1st of Month)
```
Recipients: Owner, Stakeholders
Format: PDF + Dashboard Link

Include:
- Monthly performance summary
- Month-over-month trends
- Goal achievement
- Top 10 pages
- Device breakdown
- Geographic analysis
- Recommendations
```

### Real-Time Alerts
```
Alert 1: Booking Completed
- Trigger: Purchase event
- Notification: Email + SMS
- Info: Booking details, customer, amount

Alert 2: High Traffic Spike
- Trigger: 50% above average
- Notification: Email
- Info: Traffic source, device

Alert 3: Low Conversion Rate
- Trigger: Below 1% for 24 hours
- Notification: Email
- Action: Check for technical issues

Alert 4: Revenue Milestone
- Trigger: €1,000, €5,000, €10,000 reached
- Notification: Email + Slack
- Info: Celebration message!
```

---

## 🔐 DATA PRIVACY & COMPLIANCE

### GDPR Compliance
```
✅ Cookie consent banner (already implemented)
✅ Privacy policy page (already exists)
✅ Data retention: 14 months (GA4 default)
✅ IP anonymization: Enabled
✅ User deletion requests: Supported
✅ Data export: Available in GA4
```

### Cookie Settings
```
Required Cookies:
- Session management
- Authentication

Analytics Cookies (Consent Required):
- Google Analytics
- Event tracking
- Conversion tracking

Marketing Cookies (Consent Required):
- Remarketing pixels
- Ad platform tracking
```

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Setup (Day 1)
- [ ] Create Google Analytics 4 account
- [ ] Create property for carbonus.lt
- [ ] Get Measurement ID
- [ ] Add Measurement ID to website (Admin Panel)
- [ ] Verify tracking is working (Real-time report)

### Phase 2: Goals (Day 2-3)
- [ ] Mark key events as conversions
- [ ] Set up enhanced ecommerce
- [ ] Configure event parameters
- [ ] Test all conversion goals

### Phase 3: Custom Dimensions (Week 1)
- [ ] Create custom dimensions
- [ ] Implement tracking code
- [ ] Test data collection
- [ ] Verify in GA4 reports

### Phase 4: Audiences (Week 1)
- [ ] Create 6 audience segments
- [ ] Set up remarketing lists
- [ ] Link to Google Ads (if using)
- [ ] Test audience membership

### Phase 5: Reports (Week 2)
- [ ] Create 8 custom reports
- [ ] Set up dashboards
- [ ] Configure automated reports
- [ ] Set up alerts

### Phase 6: Integration (Week 2)
- [ ] Link Google Search Console
- [ ] Link Google Ads (if using)
- [ ] Link Google Optimize (for A/B testing)
- [ ] Set up BigQuery export (optional)

---

## 📖 QUICK REFERENCE

### Key URLs
```
Analytics Dashboard:
https://analytics.google.com/

Real-Time Report:
https://analytics.google.com/analytics/web/#/realtime/

Conversions Report:
https://analytics.google.com/analytics/web/#/report/conversions

Acquisition Report:
https://analytics.google.com/analytics/web/#/report/acquisition
```

### Important Metrics
```
Primary:
- Sessions
- Users
- Conversion Rate
- Revenue

Secondary:
- Bounce Rate
- Pages/Session
- Avg Session Duration
- Goal Completions

Advanced:
- ROAS (Return on Ad Spend)
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)
```

---

## 💡 PRO TIPS

### 1. Use UTM Parameters
```
Format all marketing links:
https://carbonus.lt/?utm_source=facebook&utm_medium=social&utm_campaign=summer2024

Benefits:
- Track exactly where traffic comes from
- Measure campaign performance
- Calculate ROI accurately
```

### 2. Set Up A/B Testing
```
Test:
- Different CTAs
- Booking form layouts
- Pricing displays
- Image variations

Tool: Google Optimize (free)
```

### 3. Monitor Regularly
```
Daily: Check real-time + conversions
Weekly: Review top pages + sources
Monthly: Analyze trends + optimize
```

### 4. Use Annotations
```
Mark important events:
- Website updates
- Marketing campaigns
- Seasonal changes
- External events (holidays)
```

---

## 🎉 EXPECTED RESULTS

### After 1 Month
```
✅ Full visibility into website traffic
✅ Understanding of user behavior
✅ Conversion tracking working
✅ First optimization insights
```

### After 3 Months
```
✅ Clear traffic trends
✅ Accurate conversion data
✅ ROI on marketing efforts
✅ Audience segments performing
```

### After 6 Months
```
✅ Predictable booking patterns
✅ Optimized conversion funnel
✅ Profitable marketing channels identified
✅ Data-driven business decisions
```

---

**Your Next Action:** Go to https://analytics.google.com/ and create your account following this strategy! 🚀

**Questions?** Refer to GOOGLE-SUBMISSION-GUIDE.md for step-by-step setup instructions.
