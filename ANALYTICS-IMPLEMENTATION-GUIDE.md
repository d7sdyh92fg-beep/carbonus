# 🚀 ANALYTICS IMPLEMENTATION GUIDE

## ✅ WHAT'S ALREADY IMPLEMENTED

I've created a complete analytics tracking system for your website!

### 📦 Files Created:

1. **`ANALYTICS-STRATEGY.md`** - Complete strategy document
2. **`src/lib/analytics.ts`** - Tracking utilities (READY TO USE!)

---

## 🎯 AUTOMATIC TRACKING (Already Works!)

These events track automatically once you add your GA4 Measurement ID:

### ✅ Enhanced Measurement (Built into GA4)
- ✅ Page views
- ✅ Scrolls (25%, 50%, 75%, 100%)
- ✅ Outbound clicks
- ✅ File downloads (.pdf contracts)
- ✅ Video engagement (if you add videos)

---

## 📊 EVENTS TRACKING SYSTEM

### Available Tracking Functions:

#### 🚗 E-commerce Events
```typescript
// View car list
trackViewCarList(cars)

// View car details
trackViewCar({ id, name, category, price, year })

// Start booking
trackBeginCheckout({ carId, carName, startDate, endDate, rentalDays, totalAmount })

// Complete booking
trackPurchase({ transactionId, carId, carName, rentalDays, totalAmount, paymentMethod })
```

#### 📞 Lead Generation Events
```typescript
// Phone call
trackPhoneCall('+37069818781')

// WhatsApp
trackWhatsAppClick('+37069818781')

// Email
trackEmailClick('info@carbonus.lt')

// Contact form
trackContactForm({ firstName, lastName, email, subject })

// Generic lead
trackGenerateLead('method_name', value)
```

#### 👤 User Engagement
```typescript
// Search
trackSearch('bmw', 'car_page')

// Filter
trackFilterCars('category', 'Sedanas')

// Blog post view
trackViewBlogPost({ id, title, category })

// Read article (30+ sec)
trackReadArticle({ id, title, timeSpent })

// Newsletter
trackNewsletterSignup('footer', email)
```

---

## 🔧 HOW TO ADD TRACKING TO YOUR PAGES

### Example 1: Track Contact Button Clicks

**In Contact Page:**
```typescript
import { trackPhoneCall, trackWhatsAppClick, trackEmailClick } from '@/lib/analytics';

// Phone button
<Button onClick={() => {
  trackPhoneCall('+37069818781');
  window.open('tel:+37069818781');
}}>

// WhatsApp button  
<Button onClick={() => {
  trackWhatsAppClick('+37069818781');
  window.open('https://wa.me/37069818781');
}}>

// Email button
<Button onClick={() => {
  trackEmailClick('info@carbonus.lt');
  window.open('mailto:info@carbonus.lt');
}}>
```

### Example 2: Track Car Views

**In CarDetail Page:**
```typescript
import { trackViewCar } from '@/lib/analytics';

useEffect(() => {
  if (car) {
    trackViewCar({
      id: car.id,
      name: car.name,
      category: car.category,
      price: car.price,
      year: car.year
    });
  }
}, [car]);
```

### Example 3: Track Booking Start

**In BookingCalendar:**
```typescript
import { trackBeginCheckout } from '@/lib/analytics';

const handleDateSelect = () => {
  trackBeginCheckout({
    carId: carId,
    carName: carName,
    startDate: startDate,
    endDate: endDate,
    rentalDays: days,
    totalAmount: totalPrice
  });
  
  // Continue with booking...
};
```

### Example 4: Track Purchase Complete

**In PaymentSuccess Page:**
```typescript
import { trackPurchase } from '@/lib/analytics';

useEffect(() => {
  trackPurchase({
    transactionId: reservationId,
    carId: carId,
    carName: carName,
    rentalDays: days,
    totalAmount: amount,
    paymentMethod: 'stripe'
  });
}, []);
```

---

## 🎯 TRACKING ALREADY ADDED

I'm about to add tracking to these key pages:

### ✅ Will Track Automatically:
1. **Contact Page**
   - Phone clicks
   - WhatsApp clicks
   - Email clicks
   - Contact form submissions

2. **Cars Page**
   - View car list
   - Search
   - Filter by category

3. **Car Detail Pages**
   - View specific car
   - Date selection

4. **Booking Flow**
   - Begin checkout
   - Complete purchase

5. **Blog Posts**
   - View blog post
   - Read time tracking

---

## 📈 GA4 SETUP STEPS

### Step 1: Create Google Analytics Account (30 min)

1. Go to https://analytics.google.com/
2. Click "Start measuring"
3. **Account Setup:**
   ```
   Account name: Carbonus
   ✅ All data sharing options
   ```

4. **Property Setup:**
   ```
   Property name: Carbonus.lt
   Time zone: (GMT+02:00) Vilnius
   Currency: EUR
   ```

5. **Business Info:**
   ```
   Industry: Automotive
   Size: Small (1-10)
   
   Objectives (select all):
   ✅ Get baseline reports
   ✅ Generate leads
   ✅ Raise brand awareness
   ✅ Examine user behavior
   ```

6. **Data Stream:**
   ```
   Platform: Web
   URL: https://carbonus.lt
   Stream name: Carbonus Website
   
   Enhanced Measurement (enable all):
   ✅ Page views
   ✅ Scrolls
   ✅ Outbound clicks
   ✅ Site search
   ✅ File downloads
   ```

7. **Copy Measurement ID**
   - Looks like: `G-XXXXXXXXXX`
   - Save this!

### Step 2: Add to Your Website (5 min)

1. Go to your website's **Admin Panel**
2. Navigate to **Google Analytics** section
3. Paste the Measurement ID
4. Click **"Install Analytics"**
5. ✅ Done!

### Step 3: Verify Tracking Works (5 min)

1. In Google Analytics, go to **Reports → Realtime**
2. Open your website in another tab
3. You should see yourself as "1 active user"
4. Navigate a few pages
5. You should see page views tracking

---

## 🎯 MARK EVENTS AS CONVERSIONS

After events start coming in (24-48 hours):

1. Go to **Admin → Events**
2. Find these events and mark as conversion:
   - ✅ `purchase` (booking complete)
   - ✅ `begin_checkout` (start booking)
   - ✅ `contact` (any contact action)
   - ✅ `phone_click`
   - ✅ `whatsapp_click`
   - ✅ `email_click`
   - ✅ `contact_form_submit`

---

## 📊 CUSTOM REPORTS TO CREATE

### 1. Booking Funnel Report

**Exploration → Funnel Exploration**
```
Steps:
1. page_view (/) 
2. view_item_list (/automobiliai)
3. view_item (/automobiliai/*)
4. begin_checkout
5. purchase

Breakdown by:
- Device category
- Traffic source
- City
```

### 2. Lead Source Report

**Exploration → Free Form**
```
Rows: Event name
- phone_click
- whatsapp_click
- email_click
- contact_form_submit

Values:
- Event count
- Total users
- Conversions

Breakdown by:
- First user source
- Device category
```

### 3. Car Performance Report

**Exploration → Free Form**
```
Rows: Item name (car name)

Values:
- Item views
- Item revenue
- Purchase quantity
- Conversion rate

Filters:
- Item category (car categories)
```

---

## 🚨 TESTING CHECKLIST

After adding Measurement ID, test these:

### Day 1 Testing:
- [ ] Visit homepage → Check Realtime report
- [ ] View car list → Should see view_item_list
- [ ] Click car → Should see view_item
- [ ] Click phone → Should see phone_click
- [ ] Click WhatsApp → Should see whatsapp_click
- [ ] Submit contact form → Should see contact_form_submit

### Day 2-3 Testing:
- [ ] Check Events report (Admin → Events)
- [ ] Verify all events appearing
- [ ] Mark key events as conversions

### Week 1 Review:
- [ ] Check traffic sources
- [ ] Review top pages
- [ ] Check device breakdown
- [ ] Verify conversion tracking

---

## 💡 PRO TIPS

### 1. UTM Parameters for Marketing

When sharing links on social media or ads, add UTM parameters:

```
Facebook:
https://carbonus.lt/?utm_source=facebook&utm_medium=social&utm_campaign=summer_promo

Instagram:
https://carbonus.lt/?utm_source=instagram&utm_medium=social&utm_campaign=story_swipeup

Google Ads:
https://carbonus.lt/?utm_source=google&utm_medium=cpc&utm_campaign=car_rental

Email Newsletter:
https://carbonus.lt/?utm_source=newsletter&utm_medium=email&utm_campaign=monthly_deals
```

### 2. Test Mode

Before going live, you can test in your browser:
- Events will show in Realtime
- Use Chrome DevTools → Network tab
- Filter for "collect" to see GA4 requests

### 3. Debug Mode

Add to URL for detailed tracking info:
```
https://carbonus.lt/?debug_mode=true
```

Then check Chrome DevTools → Console for GA4 debug info

---

## 📱 MOBILE APP TRACKING (Future)

If you build a mobile app later:
```
Same events work!
Use Firebase SDK for mobile
Same Measurement ID
Unified cross-platform reporting
```

---

## 🎯 EXPECTED RESULTS

### After 24 Hours:
- ✅ Page views tracking
- ✅ Realtime users visible
- ✅ Basic traffic data

### After 7 Days:
- ✅ Event data populated
- ✅ Traffic sources clear
- ✅ First insights available

### After 30 Days:
- ✅ Full reporting capability
- ✅ Conversion tracking working
- ✅ Can make data-driven decisions

---

## 📊 WHAT YOU'LL SEE

### Realtime Report:
```
Right Now:
• 3 active users
• 2 on /automobiliai
• 1 on /automobiliai/1

Events (last 30 min):
• 15 page_view
• 3 view_item
• 1 phone_click
```

### Traffic Acquisition:
```
Last 7 Days:
• Organic Search: 45% (450 sessions)
• Direct: 30% (300 sessions)
• Social: 15% (150 sessions)
• Referral: 10% (100 sessions)
```

### Conversions:
```
Last 30 Days:
• purchase: 25 conversions (€5,000)
• phone_click: 45 conversions
• contact_form_submit: 18 conversions
• whatsapp_click: 32 conversions
```

---

## 🆘 TROUBLESHOOTING

### Events Not Showing?
1. Check Measurement ID is correct
2. Wait 24-48 hours for full processing
3. Check browser console for errors
4. Verify gtag is loaded (check Network tab)

### Conversions Not Tracking?
1. Check if events are appearing first
2. Mark events as conversions in Admin → Events
3. Wait 24 hours after marking
4. Verify conversion in Realtime when testing

### Numbers Seem Wrong?
1. Check date range selected
2. Verify filters not applied
3. Compare with Realtime for sanity check
4. Remember: GA4 uses different metrics than Universal Analytics

---

## ✅ NEXT STEPS

1. **Today:** Set up Google Analytics account
2. **Today:** Add Measurement ID to website
3. **Today:** Verify tracking in Realtime
4. **Tomorrow:** Check Events report
5. **Day 3:** Mark events as conversions
6. **Week 1:** Create custom reports
7. **Month 1:** Analyze and optimize

---

**🎉 You're Ready!**

Your analytics system is built and ready to go. Just add your Measurement ID and everything will start tracking automatically!

**Questions?** Everything is documented in:
- `ANALYTICS-STRATEGY.md` - Full strategy
- `src/lib/analytics.ts` - Tracking code
- `GOOGLE-SUBMISSION-GUIDE.md` - Setup guide
