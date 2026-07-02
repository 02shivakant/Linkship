# ✂️ LinkSnip — Smart Link Management Platform

A full-stack URL shortener with click analytics, built with the MERN stack.

> **Resume Project** — demonstrates REST API design, MongoDB schema design, React state management, rate limiting, and analytics aggregation.

---

## 🚀 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Recharts |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Extras | Rate Limiting, NanoID, Validator |

---

## ⚡ Quick Start (Step by Step)

### Prerequisites
- Node.js v18+ installed
- MongoDB running locally on port 27017

### Step 1 — Clone / unzip the project
```bash
cd linksnip
```

### Step 2 — Install all dependencies
```bash
npm run install:all
```

### Step 3 — Configure environment
The `.env` file in `/server` is already set up for local development:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/linksnip
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```
No changes needed for local run.

### Step 4 — Start MongoDB
Make sure MongoDB is running:
```bash
# On Windows
net start MongoDB

# On macOS (Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### Step 5 — Run the full app
```bash
npm run dev
```

This starts:
- Backend at **http://localhost:5000**
- Frontend at **http://localhost:5173**

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
linksnip/
├── package.json              ← root scripts (dev, install:all)
├── server/
│   ├── index.js              ← Express app entry point
│   ├── .env                  ← environment variables
│   ├── models/
│   │   └── Link.js           ← Mongoose schema
│   ├── routes/
│   │   ├── links.js          ← CRUD + stats API
│   │   └── redirect.js       ← short code → redirect
│   ├── middleware/
│   │   └── rateLimiter.js    ← express-rate-limit
│   └── utils/
│       └── helpers.js        ← nanoid, validation
└── client/
    ├── vite.config.js
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── CreateLink.jsx ← form to shorten URLs
    │   │   ├── LinkTable.jsx  ← list with copy/delete
    │   │   └── StatsModal.jsx ← bar chart analytics
    │   ├── hooks/
    │   │   └── useLinks.js    ← data fetching hook
    │   └── utils/
    │       └── api.js         ← axios config
```

---

## 🔌 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/links` | Create a short link |
| GET | `/api/links` | Get all links (paginated) |
| GET | `/api/links/:id/stats` | Get click stats + chart data |
| DELETE | `/api/links/:id` | Deactivate a link |
| GET | `/:code` | Redirect to original URL |
| GET | `/health` | Health check |

---

## 🎯 Features

- ✅ Shorten any URL to a 6-character code
- ✅ Custom aliases (e.g. `/my-link`)
- ✅ Optional link expiry (TTL via MongoDB index)
- ✅ Click tracking with timestamp, IP, referrer
- ✅ Bar chart analytics (last 7 days)
- ✅ Rate limiting on create + redirect routes
- ✅ Collision-safe short code generation
- ✅ Pagination on link listing

---

## 💡 Interview Talking Points

- **Short code generation**: Used `nanoid` with a collision-check loop before saving
- **Analytics**: MongoDB `$push` with `$slice` to keep last 500 clicks per link, aggregated server-side by day
- **Rate limiting**: `express-rate-limit` — 20 creates/15min, 60 redirects/min
- **Expiry**: MongoDB TTL index on `expiresAt` field — auto-deletes expired docs at DB level
- **Redirect**: HTTP 301 (permanent) for caching; analytics recorded non-blocking before redirect
- **Scale up**: Would add Redis cache for hot links, consistent hashing for short codes

---

## 🔮 What You Can Add Next

- [ ] User auth (JWT) so each user owns their links
- [ ] QR code generation per link
- [ ] Browser/device breakdown in analytics
- [ ] Redis caching for popular links
- [ ] Deploy: Railway (backend) + Vercel (frontend)
