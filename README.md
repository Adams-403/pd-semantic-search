# 🏠 PropaBridge Semantic Search API

Intelligent property search engine powered by **Google Gemini AI embeddings** and **pgvector** cosine similarity. Users can search in plain English and get semantically ranked results — not just keyword matches.

> **Live API:** `https://pd-semantic-search-production.up.railway.app`

---

## How It Works

```
User types: "3 bedroom apartment in Abuja near schools under 5 million"
        ↓
Gemini AI converts query → 768-dimensional vector
        ↓
pgvector compares it against every property's stored vector (cosine similarity)
        ↓
Results ranked by semantic relevance + optional structured filters
        ↓
Returns top 5 matching properties with similarity scores
```

---

## Architecture

| Layer | Technology |
|-------|------------|
| **AI Embeddings** | Google Gemini `gemini-embedding-001` (768-dim vectors) |
| **Database** | Supabase PostgreSQL + pgvector extension |
| **Vector Search** | Cosine similarity (`<=>` operator) via SQL RPC |
| **Backend** | Node.js + Express |
| **Deployment** | Railway (auto-deploys from GitHub `main` branch) |

---

## API Reference

### Base URL
```
https://pd-semantic-search-production.up.railway.app
```

---

### `GET /`
Health check.

**Response:**
```json
{
  "status": "ok",
  "message": "pd_semantic_search server is running"
}
```

---

### `POST /search`
Main search endpoint. Accepts a natural language query and optional filters.

**Request Body:**
```json
{
  "query": "3 bedroom apartment in Abuja near schools under 5 million",
  "bedrooms": 3,
  "max_price": 5000000,
  "city": "Abuja",
  "listing_type": "rent",
  "limit": 5
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | `string` | ✅ Yes | Natural language search query |
| `bedrooms` | `number` | ❌ No | Filter by exact bedroom count |
| `max_price` | `number` | ❌ No | Filter by maximum price (in Naira) |
| `city` | `string` | ❌ No | Filter by city (e.g. `"Abuja"`, `"Lagos"`) |
| `listing_type` | `string` | ❌ No | `"rent"` or `"sale"` |
| `limit` | `number` | ❌ No | Number of results to return (default: `5`) |

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Spacious 3 Bedroom Flat in Gwarinpa",
      "city": "Abuja",
      "area": "Gwarinpa",
      "bedrooms": 3,
      "bathrooms": 2,
      "price": 4500000,
      "listing_type": "rent",
      "description": "3 bedroom apartment in Gwarinpa Abuja near schools and shopping malls.",
      "similarity": 0.786
    }
  ]
}
```

The `similarity` score is between `0` and `1` — closer to `1` means a stronger semantic match.

---

### `POST /embed`
Utility endpoint — returns the raw 768-dimensional embedding vector for any text. Useful for debugging or pre-computing embeddings.

**Request Body:**
```json
{
  "text": "luxury duplex in Lagos"
}
```

**Response:**
```json
{
  "embedding": [0.023, -0.041, 0.118, "...768 numbers total"]
}
```

---

## Framer Integration Guide

The search API is a simple HTTP endpoint — Framer can call it using a **Code Component** or a **Code Override**.

### Option 1: Code Component (Recommended)

In Framer, go to **Assets → Code → New Component**, and paste this:

```jsx
import { useState } from "react"

export default function PropertySearch() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)

    const API_URL = "https://pd-semantic-search-production.up.railway.app"

    async function handleSearch() {
        if (!query.trim()) return
        setLoading(true)

        try {
            const res = await fetch(`${API_URL}/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            })
            const data = await res.json()
            setResults(data.results || [])
        } catch (err) {
            console.error("Search failed:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 600 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="e.g. 3 bedroom near schools in Abuja..."
                    style={{
                        flex: 1,
                        padding: "12px 16px",
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        fontSize: 15,
                    }}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    style={{
                        padding: "12px 24px",
                        background: "#0066FF",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 15,
                        cursor: "pointer",
                    }}
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {results.map((p) => (
                <div
                    key={p.id}
                    style={{
                        border: "1px solid #eee",
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                    }}
                >
                    <h3 style={{ margin: "0 0 4px" }}>{p.title}</h3>
                    <p style={{ margin: "0 0 8px", color: "#555", fontSize: 14 }}>
                        {p.city} · {p.area} · {p.bedrooms} bed · {p.bathrooms} bath
                    </p>
                    <p style={{ margin: "0 0 8px", fontSize: 14 }}>{p.description}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ color: "#0066FF" }}>
                            ₦{Number(p.price).toLocaleString()}
                        </strong>
                        <span style={{ fontSize: 12, color: "#999", textTransform: "uppercase" }}>
                            {p.listing_type}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}
```

### Option 2: Call the API from any existing Framer button

Use a **Code Override** on your search button:

```js
// overrides/search.ts
import { Override } from "framer"

const API = "https://pd-semantic-search-production.up.railway.app"

export function SearchButton(): Override {
    return {
        onClick: async () => {
            const query = document.querySelector("#search-input")?.value
            if (!query) return

            const res = await fetch(`${API}/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            })

            const data = await res.json()
            console.log("Results:", data.results)
            // Pass results to your Framer CMS list or state variable here
        },
    }
}
```

### With Filters

To pass structured filters alongside the query:

```js
const res = await fetch(`${API}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        query: "quiet apartment for a young professional",
        city: "Lagos",
        bedrooms: 2,
        max_price: 3000000,
        listing_type: "rent",
        limit: 10,
    }),
})
```

---

## Local Development

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project with `pgvector` enabled
- A [Google AI Studio](https://aistudio.google.com/app/apikey) API key

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/Adams-404/pd-semantic-search.git
cd pd-semantic-search

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Fill in your keys

# 4. Set up the database (run in Supabase SQL Editor)
# See: Database Setup section below

# 5. Seed the database
node seed.js

# 6. Start the server
npm start
```

### Environment Variables

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_ai_studio_api_key
```

---

## Testing the Search Locally

### Option A — CLI Tool (easiest)

A `search.js` script is included. Make sure the server is running (`npm start`) in a separate terminal, then:

```bash
# Basic natural language search
node search.js "cheap apartment for one person"

# With city filter
node search.js "quiet apartment near schools" --city Abuja

# With multiple filters
node search.js "family home near schools" --bedrooms 3 --max-price 8000000 --type rent

# More results
node search.js "luxury duplex with pool" --limit 10

# Hit the live Railway URL instead of localhost
API_URL=https://pd-semantic-search-production.up.railway.app node search.js "studio flat in Lekki"
```

**Available flags:**

| Flag | Description | Example |
|------|-------------|---------|
| `--city` | Filter by city | `--city Lagos` |
| `--bedrooms` | Filter by bedroom count | `--bedrooms 3` |
| `--max-price` | Maximum price in Naira | `--max-price 5000000` |
| `--type` | `rent` or `sale` | `--type rent` |
| `--limit` | Number of results (default: 5) | `--limit 10` |

---

### Option B — curl

```bash
# Basic search
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "3 bedroom apartment in Abuja near schools under 5 million"}'

# With filters
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "cheap apartment for a single person",
    "bedrooms": 1,
    "max_price": 1500000,
    "city": "Abuja",
    "listing_type": "rent"
  }'

# Against the live Railway URL
curl -X POST https://pd-semantic-search-production.up.railway.app/search \
  -H "Content-Type: application/json" \
  -d '{"query": "luxury duplex with pool in Lagos"}'
```

---



## Database Setup

Run these SQL statements in your Supabase **SQL Editor** in order:

```sql
-- 1. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create properties table
CREATE TABLE properties (
  id           BIGSERIAL PRIMARY KEY,
  title        TEXT,
  description  TEXT,
  city         TEXT,
  area         TEXT,
  price        NUMERIC,
  bedrooms     INT,
  bathrooms    INT,
  listing_type TEXT,
  embedding    vector(768)
);

-- 3. Create vector similarity index
CREATE INDEX properties_embedding_idx
ON properties
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. Create the search function
CREATE OR REPLACE FUNCTION match_properties(
  query_embedding      vector(768),
  match_count          int     DEFAULT 5,
  filter_bedrooms      int     DEFAULT NULL,
  filter_max_price     numeric DEFAULT NULL,
  filter_city          text    DEFAULT NULL,
  filter_listing_type  text    DEFAULT NULL
)
RETURNS TABLE (
  id           bigint,
  title        text,
  city         text,
  area         text,
  bedrooms     int,
  bathrooms    int,
  price        numeric,
  listing_type text,
  description  text,
  similarity   float
)
LANGUAGE sql STABLE AS $$
  SELECT
    p.id, p.title, p.city, p.area, p.bedrooms, p.bathrooms,
    p.price, p.listing_type, p.description,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM properties p
  WHERE
    (filter_bedrooms     IS NULL OR p.bedrooms     = filter_bedrooms)
    AND (filter_max_price    IS NULL OR p.price        <= filter_max_price)
    AND (filter_city         IS NULL OR lower(p.city)  = lower(filter_city))
    AND (filter_listing_type IS NULL OR p.listing_type = filter_listing_type)
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## Deployment (Railway)

This project auto-deploys to Railway on every push to `main`.

**Required environment variables in Railway:**
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `GEMINI_API_KEY`

**Target port:** `8080` (Railway injects `PORT=8080` automatically, which the server reads via `process.env.PORT`)

---

## Project Structure

```
pd-semantic-search/
├── server.js      # Express app — /search and /embed endpoints
├── seed.js        # One-time script to populate DB with embedded properties
├── search.js      # CLI tool for testing searches locally
├── package.json
├── .env           # Local secrets (never committed)
├── .env.example   # Template for required environment variables
├── .gitignore
└── README.md
```

---

*Built by Muhammad — semantic search infrastructure for PropaBridge.*
