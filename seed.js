import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// ─── Clients ─────────────────────────────────────────────────────────────────
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ─── Gemini Embedding ─────────────────────────────────────────────────────────
async function getEmbedding(text) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: { parts: [{ text }] },
            outputDimensionality: 768,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.embedding.values; // 768 numbers
}

// ─── Fake Properties ──────────────────────────────────────────────────────────
const properties = [
    // ── Abuja ──────────────────────────────────────────────────────────────────
    { title: 'Spacious 3 Bedroom Flat in Gwarinpa', city: 'Abuja', area: 'Gwarinpa', bedrooms: 3, bathrooms: 2, price: 4500000, listing_type: 'rent', description: '3 bedroom apartment in Gwarinpa Abuja near schools and shopping malls. Fully tiled with modern kitchen.' },
    { title: 'Luxury 4 Bedroom Duplex in Maitama', city: 'Abuja', area: 'Maitama', bedrooms: 4, bathrooms: 4, price: 18000000, listing_type: 'rent', description: 'Executive 4 bedroom duplex in Maitama Abuja. Swimming pool, BQ, and 24-hour security. Suitable for diplomats and executives.' },
    { title: '2 Bedroom Apartment in Wuse 2', city: 'Abuja', area: 'Wuse 2', bedrooms: 2, bathrooms: 2, price: 3500000, listing_type: 'rent', description: 'Affordable 2 bedroom apartment in Wuse 2 Abuja close to banks and restaurants. Quiet estate with good road.' },
    { title: 'Studio Apartment in Garki', city: 'Abuja', area: 'Garki', bedrooms: 1, bathrooms: 1, price: 1800000, listing_type: 'rent', description: 'Cozy studio apartment in Garki Area 11 Abuja. Perfect for a single professional. Close to ministries and offices.' },
    { title: '5 Bedroom Mansion in Asokoro', city: 'Abuja', area: 'Asokoro', bedrooms: 5, bathrooms: 5, price: 45000000, listing_type: 'sale', description: '5 bedroom fully detached mansion in Asokoro Abuja. Governors neighborhood. Private pool, cinema room, and large compound.' },
    { title: '3 Bedroom Bungalow in Kubwa', city: 'Abuja', area: 'Kubwa', bedrooms: 3, bathrooms: 2, price: 2500000, listing_type: 'rent', description: '3 bedroom bungalow in Kubwa Abuja near main market and schools. Spacious compound with parking.' },
    { title: '1 Bedroom Self-contain in Karu', city: 'Abuja', area: 'Karu', bedrooms: 1, bathrooms: 1, price: 900000, listing_type: 'rent', description: 'Affordable self-contain apartment in Karu Abuja. Good for a single person on a budget. Close to Nyanya motor park.' },
    { title: '4 Bedroom Terrace in Jabi', city: 'Abuja', area: 'Jabi', bedrooms: 4, bathrooms: 3, price: 12000000, listing_type: 'rent', description: '4 bedroom terrace duplex in Jabi Abuja near Jabi Lake Mall. Serviced apartment with generator and water tan.' },
    { title: '2 Bedroom Flat in Lugbe', city: 'Abuja', area: 'Lugbe', bedrooms: 2, bathrooms: 2, price: 1500000, listing_type: 'rent', description: '2 bedroom flat in Lugbe Abuja near airport road. Affordable family house with tiled floors and fitted kitchen.' },
    { title: '3 Bedroom Apartment in Katampe Extension', city: 'Abuja', area: 'Katampe Extension', bedrooms: 3, bathrooms: 3, price: 6000000, listing_type: 'rent', description: '3 bedroom apartment in Katampe Extension Abuja. Brand new, never been occupied. Excellent finishing, panoramic views.' },

    // ── Lagos ───────────────────────────────────────────────────────────────────
    { title: '2 Bedroom Flat in Lekki Phase 1', city: 'Lagos', area: 'Lekki Phase 1', bedrooms: 2, bathrooms: 2, price: 4000000, listing_type: 'rent', description: '2 bedroom flat in Lekki Phase 1 Lagos. Serviced apartment in a gated estate with swimming pool and gym.' },
    { title: '3 Bedroom Apartment in Victoria Island', city: 'Lagos', area: 'Victoria Island', bedrooms: 3, bathrooms: 3, price: 12000000, listing_type: 'rent', description: 'Luxury 3 bedroom apartment in Victoria Island Lagos. Walking distance to bars, restaurants, and the beach. 24 hour power.' },
    { title: '4 Bedroom Duplex in Ikeja GRA', city: 'Lagos', area: 'Ikeja GRA', bedrooms: 4, bathrooms: 3, price: 9000000, listing_type: 'rent', description: '4 bedroom detached duplex in Ikeja GRA Lagos. Large compound, BQ, and reliable electricity. Close to international airport.' },
    { title: '1 Bedroom Apartment in Yaba', city: 'Lagos', area: 'Yaba', bedrooms: 1, bathrooms: 1, price: 1200000, listing_type: 'rent', description: 'Neat 1 bedroom apartment in Yaba Lagos near University of Lagos and tech hubs. Great for young professionals.' },
    { title: 'Studio Apartment in Oniru', city: 'Lagos', area: 'Oniru', bedrooms: 1, bathrooms: 1, price: 2400000, listing_type: 'rent', description: 'Modern studio apartment in Oniru Lagos near Bar Beach. Fully furnished option available. Serviced estate.' },
    { title: '5 Bedroom Detached House in Banana Island', city: 'Lagos', area: 'Banana Island', bedrooms: 5, bathrooms: 6, price: 350000000, listing_type: 'sale', description: 'Ultra-luxury 5 bedroom mansion in Banana Island Lagos. Private jetty access, elevator, smart home system. Nigeria most exclusive address.' },
    { title: '3 Bedroom Flat in Ajah', city: 'Lagos', area: 'Ajah', bedrooms: 3, bathrooms: 2, price: 2800000, listing_type: 'rent', description: '3 bedroom flat in Ajah Lagos near Abraham Adesanya Estate. Good estate with security, close to Shoprite Sangotedo.' },
    { title: '2 Bedroom Flat in Surulere', city: 'Lagos', area: 'Surulere', bedrooms: 2, bathrooms: 1, price: 1600000, listing_type: 'rent', description: '2 bedroom apartment in Surulere Lagos. Classic neighborhood, close to National Stadium and Costain bus stop.' },
    { title: '4 Bedroom Terrace in Ikoyi', city: 'Lagos', area: 'Ikoyi', bedrooms: 4, bathrooms: 4, price: 25000000, listing_type: 'rent', description: 'Luxury 4 bedroom terrace in Ikoyi Lagos. High-spec finishing, private pool, excellent security. Ideal for families.' },
    { title: '1 Bedroom Self-contain in Ikorodu', city: 'Lagos', area: 'Ikorodu', bedrooms: 1, bathrooms: 1, price: 600000, listing_type: 'rent', description: 'Budget-friendly self-contain in Ikorodu Lagos. Good for a single person. Close to Ikorodu town market and bus stops.' },

    // ── Port Harcourt ───────────────────────────────────────────────────────────
    { title: '3 Bedroom Flat in GRA Phase 2', city: 'Port Harcourt', area: 'GRA Phase 2', bedrooms: 3, bathrooms: 3, price: 5000000, listing_type: 'rent', description: '3 bedroom flat in GRA Phase 2 Port Harcourt. Standard finishing, large compound, BQ, and uninterrupted power supply.' },
    { title: '2 Bedroom Apartment in Trans-Amadi', city: 'Port Harcourt', area: 'Trans-Amadi', bedrooms: 2, bathrooms: 2, price: 2500000, listing_type: 'rent', description: '2 bedroom apartment in Trans-Amadi Port Harcourt close to oil company offices and industrial area.' },
    { title: '4 Bedroom Duplex in Peter Odili Road', city: 'Port Harcourt', area: 'Peter Odili Road', bedrooms: 4, bathrooms: 3, price: 8000000, listing_type: 'rent', description: 'Executive 4 bedroom duplex on Peter Odili Road Port Harcourt. Excellent road, perfect for oil and gas executives.' },
    { title: '1 Bedroom Mini-flat in Rumuola', city: 'Port Harcourt', area: 'Rumuola', bedrooms: 1, bathrooms: 1, price: 800000, listing_type: 'rent', description: 'Affordable mini-flat in Rumuola Port Harcourt. Close to airport road. Good for a single person or young couple.' },
    { title: '5 Bedroom Mansion in Old GRA', city: 'Port Harcourt', area: 'Old GRA', bedrooms: 5, bathrooms: 5, price: 80000000, listing_type: 'sale', description: '5 bedroom mansion in Old GRA Port Harcourt. One of the most prestigious addresses in the city. Massive compound with garden.' },

    // ── Kano ────────────────────────────────────────────────────────────────────
    { title: '3 Bedroom Flat in Nasarawa GRA', city: 'Kano', area: 'Nasarawa GRA', bedrooms: 3, bathrooms: 2, price: 2200000, listing_type: 'rent', description: '3 bedroom flat in Nasarawa GRA Kano. Well finished apartment in a quiet estate. Close to major banks and offices.' },
    { title: '4 Bedroom Bungalow in Fagge', city: 'Kano', area: 'Fagge', bedrooms: 4, bathrooms: 2, price: 1800000, listing_type: 'rent', description: '4 bedroom bungalow in Fagge Kano. Spacious rooms, large compound with borehole. Close to Kano central market.' },
    { title: '2 Bedroom Flat in Bompai', city: 'Kano', area: 'Bompai', bedrooms: 2, bathrooms: 1, price: 1200000, listing_type: 'rent', description: '2 bedroom flat in Bompai Kano near industrial area. Good for small families and working couples.' },
    { title: '1 Bedroom Self-contain in Dorayi', city: 'Kano', area: 'Dorayi', bedrooms: 1, bathrooms: 1, price: 450000, listing_type: 'rent', description: 'Very affordable self-contain in Dorayi Kano. Clean compound, reliable water supply. Ideal for a single person.' },
    { title: '5 Bedroom House in Ungogo', city: 'Kano', area: 'Ungogo', bedrooms: 5, bathrooms: 4, price: 25000000, listing_type: 'sale', description: 'Large 5 bedroom detached house in Ungogo Kano. Great for a large family. Nearby schools, mosques, and markets.' },

    // ── Ibadan ──────────────────────────────────────────────────────────────────
    { title: '3 Bedroom Flat in Bodija', city: 'Ibadan', area: 'Bodija', bedrooms: 3, bathrooms: 2, price: 1800000, listing_type: 'rent', description: '3 bedroom flat in Bodija Ibadan close to University of Ibadan. Quiet street, good for academic families and students.' },
    { title: '2 Bedroom Apartment in New Bodija', city: 'Ibadan', area: 'New Bodija', bedrooms: 2, bathrooms: 2, price: 1400000, listing_type: 'rent', description: '2 bedroom apartment in New Bodija Ibadan. Modern finishing, large parlour, and 24-hour security.' },
    { title: '4 Bedroom Duplex in Oluyole Estate', city: 'Ibadan', area: 'Oluyole Estate', bedrooms: 4, bathrooms: 3, price: 5000000, listing_type: 'rent', description: '4 bedroom duplex in Oluyole Estate Ibadan. Prime location, good roads, close to shopping centers and schools.' },
    { title: '1 Bedroom Apartment in Agodi', city: 'Ibadan', area: 'Agodi', bedrooms: 1, bathrooms: 1, price: 700000, listing_type: 'rent', description: '1 bedroom apartment near Agodi Gardens Ibadan. Clean environment, suitable for a single person or couple.' },
    { title: '3 Bedroom Bungalow in Ring Road', city: 'Ibadan', area: 'Ring Road', bedrooms: 3, bathrooms: 2, price: 12000000, listing_type: 'sale', description: '3 bedroom bungalow for sale along Ring Road Ibadan. Affordable and spacious family home in a central location.' },

    // ── Enugu ───────────────────────────────────────────────────────────────────
    { title: '3 Bedroom Flat in GRA Enugu', city: 'Enugu', area: 'GRA', bedrooms: 3, bathrooms: 2, price: 2000000, listing_type: 'rent', description: '3 bedroom flat in GRA Enugu. Serene environment, good security, close to government offices and schools.' },
    { title: '2 Bedroom Flat in Independence Layout', city: 'Enugu', area: 'Independence Layout', bedrooms: 2, bathrooms: 2, price: 1500000, listing_type: 'rent', description: '2 bedroom flat in Independence Layout Enugu. Decent estate, reliable power supply. Good for young families.' },
    { title: '4 Bedroom Duplex in New Haven', city: 'Enugu', area: 'New Haven', bedrooms: 4, bathrooms: 3, price: 4500000, listing_type: 'rent', description: '4 bedroom executive duplex in New Haven Enugu. Close to New Haven shopping complex and good restaurants.' },
    { title: '1 Bedroom Self-contain in Uwani', city: 'Enugu', area: 'Uwani', bedrooms: 1, bathrooms: 1, price: 600000, listing_type: 'rent', description: 'Self-contain apartment in Uwani Enugu. Affordable and clean. Ideal for a single person working in the city.' },
    { title: '5 Bedroom Detached in Trans-Ekulu', city: 'Enugu', area: 'Trans-Ekulu', bedrooms: 5, bathrooms: 4, price: 45000000, listing_type: 'sale', description: '5 bedroom detached house in Trans-Ekulu Enugu. Very spacious compound, great finishing, borehole, and perimeter fence.' },

    // ── Mixed / Other ────────────────────────────────────────────────────────────
    { title: '3 Bedroom Flat near Lekki-Epe Expressway', city: 'Lagos', area: 'Lekki', bedrooms: 3, bathrooms: 2, price: 3200000, listing_type: 'rent', description: '3 bedroom flat near Lekki-Epe Expressway Lagos close to schools and hospitals. Estate with good roads and security.' },
    { title: '2 Bedroom Apartment in Durumi', city: 'Abuja', area: 'Durumi', bedrooms: 2, bathrooms: 2, price: 2000000, listing_type: 'rent', description: '2 bedroom apartment in Durumi Abuja near Amusement Park. Good finishing, accessible location.' },
    { title: '3 Bedroom Flat in Uyo', city: 'Uyo', area: 'Ewet Housing Estate', bedrooms: 3, bathrooms: 2, price: 1700000, listing_type: 'rent', description: '3 bedroom flat in Ewet Housing Estate Uyo. Very quiet environment, nearest to main town with great road network.' },
    { title: '2 Bedroom in Benin City', city: 'Benin City', area: 'GRA', bedrooms: 2, bathrooms: 2, price: 1300000, listing_type: 'rent', description: '2 bedroom apartment in GRA Benin City. Peaceful street, clean compound, good for families.' },
    { title: '4 Bedroom Duplex in Owerri', city: 'Owerri', area: 'New Owerri', bedrooms: 4, bathrooms: 3, price: 5500000, listing_type: 'rent', description: '4 bedroom duplex in New Owerri close to government house. Prime location with steady electricity and water supply.' },
    { title: '3 Bedroom in Kaduna South', city: 'Kaduna', area: 'Barnawa', bedrooms: 3, bathrooms: 2, price: 1600000, listing_type: 'rent', description: '3 bedroom flat in Barnawa Kaduna South. Clean estate, close to schools and health centers.' },
    { title: '1 Bedroom near Wuse Market', city: 'Abuja', area: 'Wuse', bedrooms: 1, bathrooms: 1, price: 1200000, listing_type: 'rent', description: 'Budget 1 bedroom apartment near Wuse Market Abuja. Walking distance to shopping and public transport.' },
    { title: '2 Bedroom in Akowonjo Lagos', city: 'Lagos', area: 'Akowonjo', bedrooms: 2, bathrooms: 1, price: 900000, listing_type: 'rent', description: '2 bedroom flat in Akowonjo Lagos. Very affordable, good for a small family. Close to Egbeda and Alimosho.' },
    { title: '6 Bedroom Hotel-Style Duplex in Chevron', city: 'Lagos', area: 'Chevron', bedrooms: 6, bathrooms: 6, price: 75000000, listing_type: 'sale', description: 'Massive 6 bedroom hotel-style duplex in Chevron Drive Lekki Lagos. Ultra luxury, rooftop terrace, cinema, and swimming pool.' },
    { title: '3 Bedroom Flat in Jabi near Airport', city: 'Abuja', area: 'Jabi', bedrooms: 3, bathrooms: 2, price: 5000000, listing_type: 'rent', description: '3 bedroom flat in Jabi Abuja close to Nnamdi Azikiwe International Airport. Fully finished, reliable power supply.' },
];

// ─── Small delay helper (avoid rate limiting) ─────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Main Seed Function ───────────────────────────────────────────────────────
async function seed() {
    console.log(`\n🚀 Starting seed — ${properties.length} properties to process...\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < properties.length; i++) {
        const prop = properties[i];

        // Combine all relevant text into one descriptive string for the embedding
        const combinedText = `
      ${prop.title}.
      ${prop.description}
      City: ${prop.city}. Area: ${prop.area}.
      Bedrooms: ${prop.bedrooms}. Bathrooms: ${prop.bathrooms}.
      Price: ${prop.price.toLocaleString()} Naira.
      Listing type: ${prop.listing_type}.
    `.trim();

        try {
            process.stdout.write(`[${i + 1}/${properties.length}] Embedding "${prop.title}"... `);

            const embedding = await getEmbedding(combinedText);

            const { error } = await supabase.from('properties').insert({
                title: prop.title,
                description: prop.description,
                city: prop.city,
                area: prop.area,
                bedrooms: prop.bedrooms,
                bathrooms: prop.bathrooms,
                price: prop.price,
                listing_type: prop.listing_type,
                embedding: embedding,
            });

            if (error) {
                console.log(`❌ Supabase error: ${error.message}`);
                failCount++;
            } else {
                console.log(`✅ Done`);
                successCount++;
            }
        } catch (err) {
            console.log(`❌ Error: ${err.message}`);
            failCount++;
        }

        // Small delay to avoid Gemini rate limiting (free tier = 60 req/min)
        if (i < properties.length - 1) {
            await sleep(1200);
        }
    }

    console.log(`\n─────────────────────────────────`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed:  ${failCount}`);
    console.log(`─────────────────────────────────`);
    console.log(`\nDatabase seeded. You're ready for Part 9 — the /search endpoint.\n`);
}

seed();
