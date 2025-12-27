// scripts/generate-attractions.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DEST_PATH = path.join(ROOT, "public", "destinations.json");
const OUT_PATH = path.join(ROOT, "public", "attractions.json");

// Node 18+ has fetch built in. If you're on Node < 18, upgrade or polyfill fetch.

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function uniqKeepOrder(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const key = String(x || "").trim();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function categorizePlaces(places) {
  const outdoorKeywords = [
    "park","garden","beach","view","lookout","trail","hike","island","zoo",
    "temple","shrine","castle","palace","fort","harbor","waterfront","bridge",
    "square","plaza","river","lake","mount","mountain"
  ];
  const indoorKeywords = [
    "museum","gallery","cathedral","church","basilica","palace","theatre","theater",
    "market","mall","aquarium","planetarium","library","exhibition","hall","opera"
  ];

  const isOutdoor = (p) => {
    const s = `${p.name} ${p.text}`.toLowerCase();
    return outdoorKeywords.some(k => s.includes(k));
  };
  const isIndoor = (p) => {
    const s = `${p.name} ${p.text}`.toLowerCase();
    return indoorKeywords.some(k => s.includes(k));
  };

  const sunny = places.filter(isOutdoor).map(p => p.name);
  const rainy = places.filter(isIndoor).map(p => p.name);
  const cloudy = places
    .filter(p => !isOutdoor(p) && !isIndoor(p))
    .map(p => p.name);

  // Ensure each bucket has enough items by topping up from others
  const all = uniqKeepOrder([...sunny, ...cloudy, ...rainy]);

  const fillTo = (arr, n) => {
    const out = uniqKeepOrder(arr);
    if (out.length >= n) return out.slice(0, n);
    for (const a of all) {
      if (out.length >= n) break;
      if (!out.includes(a)) out.push(a);
    }
    return out.slice(0, n);
  };

  return {
    sunny: fillTo(sunny, 18),
    cloudy: fillTo(cloudy, 18),
    rainy: fillTo(rainy, 18),
  };
}

async function wikiNearby(lat, lon) {
  const headers = {
    "User-Agent": "HolidayPlannerAttractions/1.0 (local script; contact: you@yourdomain.com)",
    "Accept": "application/json"
  };

  const allGeo = [];
  let offset = 0;

  // Pull up to 200 results in pages of 50
  for (let page = 0; page < 4; page++) {
    const geoUrl =
      `https://en.wikipedia.org/w/api.php?action=query&list=geosearch` +
      `&gsradius=10000&gscoord=${encodeURIComponent(`${lat}|${lon}`)}` +
      `&gslimit=50&gsoffset=${offset}&format=json`;

    const geoRes = await fetch(geoUrl, { headers });
    const geoData = await geoRes.json();

    if (geoData?.error) {
      throw new Error(`Wikipedia error: ${geoData.error.code} ${geoData.error.info}`);
    }

    const geo = geoData?.query?.geosearch || [];
    allGeo.push(...geo);

    // Stop if no more results
    if (!geoData?.continue?.gsoffset || geo.length === 0) break;
    offset = geoData.continue.gsoffset;
  }

  if (allGeo.length < 12) {
    throw new Error(`Not enough nearby places (got ${allGeo.length})`);
  }

  // Use first 50 unique pageids for details
  const uniq = new Map();
  for (const g of allGeo) uniq.set(g.pageid, g);
  const geoUnique = Array.from(uniq.values()).slice(0, 50);

  const pageIds = geoUnique.map(p => p.pageid).join("|");

  const detailUrl =
    `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageIds}` +
    `&prop=description|extracts&exintro=1&explaintext=1&format=json`;

  const detailRes = await fetch(detailUrl, { headers });
  const detailData = await detailRes.json();

  if (detailData?.error) {
    throw new Error(`Wikipedia detail error: ${detailData.error.code} ${detailData.error.info}`);
  }

  const pages = detailData?.query?.pages || {};

  const badWords = [
    "station","district","constituency","railway","school","hospital","road",
    "street","avenue","university","college","cemetery","company","office",
    "neighborhood","suburb"
  ];

  const places = geoUnique
    .map(g => {
      const page = pages[String(g.pageid)] || {};
      const name = g.title || "";
      const text = `${page.description || ""} ${page.extract || ""}`.trim();
      return { name, text, dist: g.dist };
    })
    .filter(p => {
      const t = p.name.toLowerCase();
      if (!p.name || p.name.length > 70) return false;
      if (badWords.some(w => t.includes(w))) return false;
      return true;
    })
    .sort((a, b) => (a.dist ?? 999999) - (b.dist ?? 999999));

  if (places.length < 6) {
    throw new Error(`Not enough good places after filtering (got ${places.length})`);
  }

  return places;
}



async function main() {
  const destinations = JSON.parse(fs.readFileSync(DEST_PATH, "utf8"));
  const out = {};

  for (const d of destinations) {
    const label = `${d.name}, ${d.country}`;
    const key = slugify(label);

    try {
      const places = await wikiNearby(d.lat, d.lon);
      out[key] = categorizePlaces(places);
      console.log(`✅ ${label}: ${out[key].sunny.length}/${out[key].cloudy.length}/${out[key].rainy.length}`);
    } catch (e) {
      // If one destination fails, still keep going.
      console.warn(`⚠️  ${label}: ${e.message}`);
      out[key] = { sunny: [], cloudy: [], rainy: [] };
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), "utf8");
  console.log(`\nWrote: ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
