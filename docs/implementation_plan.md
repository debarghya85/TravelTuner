# 🧭 AI Travel Itinerary Generator — MVP Documentation

---

## 1. 📌 Project Overview

### Problem Statement

Planning a trip is time-consuming, fragmented, and often unrealistic in terms of budget, logistics, and time constraints.

### Solution

A web application that generates **AI-powered, budget-aware, practical travel itineraries** instantly based on user inputs.

### Target Users

* Budget travelers
* Families planning trips
* Couples & solo travelers
* Last-minute planners
* Travel content creators

### USP (Unique Selling Proposition)

* Strict budget control
* Structured JSON itinerary
* Instant generation
* OTP-based user validation
* Offbeat + practical suggestions

---

## 2. 🧩 Features Breakdown

### ✅ MVP Features

* User input form
* OTP-based login (mobile)
* Dynamic AI prompt generation
* AI-based itinerary generation
* JSON response parsing
* UI display (day-wise itinerary)
* Save user data + itinerary

### 🚀 Future Features (V2 / Pro)

* Google Maps integration
* Hotel booking APIs
* Flight APIs
* PDF export
* Multi-language support
* AI chat refinement
* Saved trips dashboard

---

## 3. 🏗️ System Architecture

### High-Level Architecture

```
[ User Browser ]
       ↓
[ Next.js Frontend ]
       ↓
[ Next.js API Routes ]
       ↓
 ┌───────────────┬───────────────┬───────────────┐
 |               |               |               |
[ OpenAI API ] [ MongoDB ] [ Firebase Auth ]
```

### Components

#### Frontend

* Next.js (App Router)
* Tailwind CSS

#### Backend

* Next.js API Routes

#### Database

* MongoDB Atlas (Free Tier)

#### AI Integration

* OpenAI API (or compatible LLM)

---

## 4. 🛠️ Tech Stack (FREE FIRST)

| Layer      | Tech                    |
| ---------- | ----------------------- |
| Frontend   | Next.js + Tailwind CSS  |
| Backend    | Next.js API Routes      |
| Database   | MongoDB Atlas (Free)    |
| Auth (OTP) | Firebase Authentication |
| Hosting    | Vercel                  |

---

## 5. 📂 Folder Structure (Next.js App Router)

```
/app
  /page.tsx
  /form/page.tsx
  /result/page.tsx

/components
  Form.tsx
  OTPInput.tsx
  ItineraryCard.tsx

/lib
  mongodb.ts
  firebase.ts
  ai.ts

/app/api
  /send-otp/route.ts
  /verify-otp/route.ts
  /generate-itinerary/route.ts
  /save-data/route.ts

/models
  User.ts
  Itinerary.ts
  Request.ts

/utils
  buildPrompt.ts
  parseResponse.ts
```

---

## 6. 🔄 Application Flow

1. User enters trip details
2. User enters mobile number
3. OTP sent via Firebase
4. OTP verification success
5. Build dynamic AI prompt
6. Call AI API
7. Parse JSON response
8. Display itinerary
9. Save data to MongoDB

---

## 7. 🔐 Authentication (OTP Flow)

### Firebase Setup

* Enable Phone Authentication
* Add web app config

### Flow

```
User enters phone →
Firebase sends OTP →
User enters OTP →
Firebase verifies →
Return ID Token →
Allow API access
```

---

## 8. 🗄️ Database Design (MongoDB)

### users

```json
{
  "_id": "ObjectId",
  "name": "Debarghya",
  "mobile": "9876543210",
  "createdAt": "Date"
}
```

### itineraries

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "input": {},
  "response": {},
  "createdAt": "Date"
}
```

### requests

```json
{
  "_id": "ObjectId",
  "mobile": "9876543210",
  "status": "success",
  "timestamp": "Date"
}
```

---

## 9. 🔌 API Design

### 1. /api/send-otp

POST

```json
{
  "mobile": "9876543210"
}
```

### 2. /api/verify-otp

```json
{
  "otp": "123456"
}
```

### 3. /api/generate-itinerary

```json
{
  "input": {}
}
```

### Response

```json
{
  "summary": "",
  "days": []
}
```

### 4. /api/save-data

```json
{
  "user": {},
  "input": {},
  "response": {}
}
```

---

## 10. 🤖 AI Integration

### Prompt Builder (Dynamic)

Replace placeholders with user inputs dynamically.

---

### 📌 PROMPT TEMPLATE

```
You are an expert travel planner specializing in realistic, budget-aware itineraries.

Create a detailed, practical travel plan.

INPUT:
- Source: {city}
- Destination: {destination}
- Number of days: {days}
- Budget: {total budget}
- Travel style: {budget / mid-range / luxury}
- Interests: {nature / adventure / food / culture / nightlife / family / spiritual}
- Travelers: {solo / couple / family / group}
- Travel month: {month}
- Special preferences: {veg food / avoid long travel / kid-friendly / senior-friendly}
- No of Person (Adult + children)

RULES:
1. Total trip cost must NOT exceed the given budget.
2. Provide a complete cost breakdown:
   - Transport
   - Stay
   - Food
   - Activities
3. Suggest realistic transport with pricing and duration
4. Suggest accommodation with price per night
5. Suggest food options with per meal cost
6. Provide day-wise plan
7. Include offbeat places
8. Add cost-saving tips

OUTPUT FORMAT (STRICT JSON):
{
  "summary": "",
  "destination": "",
  "bestTimeToVisit": "",
  "totalEstimatedCost": 0,
  "costBreakdown": {
    "transport": 0,
    "stay": 0,
    "food": 0,
    "activities": 0
  },
  "travelOptions": {
    "toDestination": [],
    "localTransport": []
  },
  "stayOptions": [],
  "foodOptions": [],
  "days": [],
  "tips": []
}
```

---

### AI Call Example (Node.js)

```ts
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  })
});
```

---

### JSON Parsing Strategy

* Use JSON.parse()
* Fallback: extract JSON block via regex
* Validate keys before rendering

---

### Error Handling

* Retry API (max 2 times)
* Show fallback UI
* Log errors

---

## 11. 🎨 UI/UX Design

### Pages

#### Landing Page

* Hero section
* CTA: Plan My Trip

#### Form Page

* Multi-step form
* Mobile-friendly

#### Result Page

* Summary card
* Cost breakdown
* Day-wise plan
* Stay & food sections

### UI Suggestions

* Clean, modern design
* Mobile-first
* Tailwind UI components
* Progress indicators

---

## 12. 🔒 Privacy Policy

* Collects name, mobile number, travel inputs
* Used only for itinerary generation
* No data sold to third parties
* Secure storage in MongoDB
* Users can request deletion

---

## 13. 💰 Monetization Plan

### Phase 1

* Free itinerary generation
* Lead collection

### Phase 2

* Paid itineraries (₹49–₹199)
* Razorpay integration

### Pro Features

* Detailed plans
* Google Maps integration
* PDF download
* Priority generation

---

## 14. 🚀 Deployment Guide (FREE)

### Vercel

* Push code to GitHub
* Import into Vercel
* Deploy

### MongoDB Atlas

* Create free cluster
* Get connection string

### Firebase

* Enable phone authentication
* Add domain

---

## 15. 📈 Scaling Plan

* Upgrade MongoDB
* Add Redis caching
* Queue system (BullMQ)
* Rate limiting
* CDN integration

---

## 16. ⚠️ Risks & Challenges

| Risk          | Solution          |
| ------------- | ----------------- |
| AI Cost       | Limit requests    |
| Spam Users    | OTP + rate limit  |
| OTP Abuse     | Firebase controls |
| Data Accuracy | Prompt tuning     |

---

## 17. 🧠 Future Enhancements

* Travel agent lead marketplace
* Affiliate hotel bookings
* AI personalization engine
* WhatsApp itinerary delivery
* Community reviews

---

# 🎯 FINAL NOTE

This MVP can be built in 1–2 days using:

* Next.js
* Firebase OTP
* MongoDB
* OpenAI API

Start simple → validate → monetize → scale.
