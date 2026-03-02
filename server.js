import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// ─── Express App ────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// ─── Supabase Client ─────────────────────────────────────────────────────────
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ─── Gemini Embedding Helper ──────────────────────────────────────────────────
/**
 * Calls the Gemini embedding API and returns a 768-dimensional vector.
 * @param {string} text - The text to embed.
 * @returns {Promise<number[]>} - The embedding vector.
 */
async function getEmbedding(text) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: {
                parts: [{ text }],
            },
            outputDimensionality: 768,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    // Shape: { embedding: { values: [number, ...] } }
    return data.embedding.values;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'pd_semantic_search server is running' });
});

/**
 * POST /embed
 * Body: { "text": "some string to embed" }
 * Returns: { "embedding": [768 numbers] }
 */
app.post('/embed', async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: '`text` field (string) is required.' });
    }

    try {
        const embedding = await getEmbedding(text);
        return res.json({ embedding });
    } catch (err) {
        console.error('Error generating embedding:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

/**
 * POST /search
 *
 * Body:
 * {
 *   "query": "3 bedroom apartment in Abuja near schools under 5 million",  // required
 *   "bedrooms": 3,          // optional filter
 *   "max_price": 5000000,   // optional filter
 *   "city": "Abuja",        // optional filter
 *   "listing_type": "rent", // optional filter: "rent" | "sale"
 *   "limit": 5              // optional, default 5
 * }
 *
 * Returns: { results: [ { id, title, city, area, bedrooms, bathrooms, price, listing_type, description, similarity } ] }
 */
app.post('/search', async (req, res) => {
    const {
        query,
        bedrooms,
        max_price,
        city,
        listing_type,
        limit = 5,
    } = req.body;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: '`query` field (string) is required.' });
    }

    try {
        // 1. Embed the user's natural language query
        const queryEmbedding = await getEmbedding(query);

        // 2. Call the Supabase RPC function for vector similarity search
        const { data, error } = await supabase.rpc('match_properties', {
            query_embedding: queryEmbedding,
            match_count: limit,
            filter_bedrooms: bedrooms ?? null,
            filter_max_price: max_price ?? null,
            filter_city: city ?? null,
            filter_listing_type: listing_type ?? null,
        });

        if (error) {
            console.error('Supabase RPC error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        return res.json({ results: data });
    } catch (err) {
        console.error('Search error:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
