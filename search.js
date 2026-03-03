import fetch from 'node-fetch';

// ─── Read query from command line args ───────────────────────────────────────
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log(`
Usage:
  node search.js "your search query"
  node search.js "your query" --city Abuja
  node search.js "your query" --city Lagos --bedrooms 3 --max-price 5000000 --type rent --limit 10

Examples:
  node search.js "cheap apartment for a single person"
  node search.js "luxury duplex with a pool" --city Lagos --type rent
  node search.js "family home near schools" --bedrooms 3 --max-price 8000000
`);
    process.exit(0);
}

// ─── Parse flags ─────────────────────────────────────────────────────────────
const query = args[0];

// Safe: returns null if flag is missing (indexOf returns -1, -1+1=0 would grab the query!)
function getFlag(flag) {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const city = getFlag('--city');
const listingType = getFlag('--type');
const bedrooms = getFlag('--bedrooms') ? Number(getFlag('--bedrooms')) : null;
const maxPrice = getFlag('--max-price') ? Number(getFlag('--max-price')) : null;
const limit = getFlag('--limit') ? Number(getFlag('--limit')) : 5;

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// ─── Run search ───────────────────────────────────────────────────────────────
console.log(`\n🔍 Searching: "${query}"`);
if (city) console.log(`   City:         ${city}`);
if (bedrooms) console.log(`   Bedrooms:     ${bedrooms}`);
if (maxPrice) console.log(`   Max price:    ₦${maxPrice.toLocaleString()}`);
if (listingType) console.log(`   Type:         ${listingType}`);
console.log(`   Showing top:  ${limit} results\n`);

const body = { query, limit };
if (city) body.city = city;
if (bedrooms) body.bedrooms = bedrooms;
if (maxPrice) body.max_price = maxPrice;
if (listingType) body.listing_type = listingType;

try {
    const res = await fetch(`${BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
        console.error('❌ Error:', data.error || res.statusText);
        process.exit(1);
    }

    if (data.results.length === 0) {
        console.log('No results found. Try a different query or fewer filters.');
        process.exit(0);
    }

    data.results.forEach((p, i) => {
        const score = (p.similarity * 100).toFixed(1);
        console.log(`─────────────────────────────────────────`);
        console.log(`#${i + 1}  ${p.title}  [${score}% match]`);
        console.log(`    📍 ${p.area}, ${p.city}`);
        console.log(`    🛏  ${p.bedrooms} bed  🛁 ${p.bathrooms} bath  •  ${p.listing_type.toUpperCase()}`);
        console.log(`    💰 ₦${Number(p.price).toLocaleString()}`);
        console.log(`    📝 ${p.description}`);
    });
    console.log(`─────────────────────────────────────────\n`);

} catch (err) {
    console.error('❌ Could not connect to server. Is it running?');
    console.error('   Start it with: npm start\n');
}
