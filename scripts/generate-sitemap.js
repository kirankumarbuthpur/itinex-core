/* scripts/generate-sitemap.js */
const fs = require("fs");
const path = require("path");

const SITE_URL = process.env.SITE_URL || "https://www.itinex.net"; // prefer www for canonical
const OUT_FILE = path.join(process.cwd(), "public", "sitemap.xml");
const DEST_FILE = path.join(process.cwd(), "public", "destinations.json");

// ✅ enforce ONE canonical style across sitemap
const USE_TRAILING_SLASH = true;

// ---------- STATIC ROUTES ----------
const staticRoutes = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/destinations", changefreq: "weekly", priority: "0.9" },
  { loc: "/map", changefreq: "weekly", priority: "0.8" },
  { loc: "/saved", changefreq: "weekly", priority: "0.6" },

  // Footer
  { loc: "/about", changefreq: "monthly", priority: "0.3" },
  { loc: "/contact", changefreq: "monthly", priority: "0.3" },
  { loc: "/advertise", changefreq: "monthly", priority: "0.2" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.1" },
  { loc: "/terms", changefreq: "yearly", priority: "0.1" },
];

// ---------- HELPERS ----------
function slugify(text) {
  return String(text || "")
    .normalize("NFKD") // remove accents
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripTrailingSlash(url) {
  return url.replace(/\/+$/, "");
}

function normalizeLoc(loc) {
  // Ensure leading slash
  let p = loc.startsWith("/") ? loc : `/${loc}`;

  // Root stays "/"
  if (p === "/") return "/";

  // Remove any trailing slashes first
  p = p.replace(/\/+$/, "");

  // Add trailing slash consistently (SEO: avoid duplicates)
  if (USE_TRAILING_SLASH) p = `${p}/`;

  return p;
}

function normalizeBase(base) {
  // remove trailing slashes so join works
  return stripTrailingSlash(base);
}

function fullUrl(base, loc) {
  const b = normalizeBase(base);
  const p = normalizeLoc(loc);
  return `${b}${p}`;
}

function isoLastmodNoMillis(date = new Date()) {
  // ✅ Google-friendly: no milliseconds
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

// ---------- DESTINATION ROUTES ----------
function getDestinationRoutes() {
  if (!fs.existsSync(DEST_FILE)) {
    console.warn("⚠️ destinations.json not found — skipping destination URLs");
    return [];
  }

  let destinations = [];
  try {
    destinations = JSON.parse(fs.readFileSync(DEST_FILE, "utf8"));
  } catch (e) {
    console.warn("⚠️ destinations.json invalid JSON — skipping destination URLs");
    return [];
  }

  if (!Array.isArray(destinations)) return [];

  // ✅ If you have multiple entries like "Brooklyn (NYC)" and "New York",
  // slugify will keep them distinct enough via the name string.
  const out = destinations.slice(0, 5000).map((d) => {
    const name = d?.name || "";
    const country = d?.country || "";
    const slug = slugify(`${name}-${country}`);

    // ✅ Higher priority for destination SEO pages (better for indexing focus)
    return {
      loc: `/destinations/${slug}`,
      changefreq: "monthly",
      priority: "0.8",
    };
  });

  return out;
}

// ---------- XML BUILDER ----------
function buildSitemap(routes) {
  const lastmod = isoLastmodNoMillis(new Date());
  const base = SITE_URL;

  const urlsXml = routes
    .map((r) => {
      const loc = escapeXml(fullUrl(base, r.loc));
      const cf = r.changefreq ? escapeXml(r.changefreq) : null;
      const pr = r.priority ? escapeXml(String(r.priority)) : null;

      return [
        "  <url>",
        `    <loc>${loc}</loc>`,
        `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
        cf ? `    <changefreq>${cf}</changefreq>` : null,
        pr ? `    <priority>${pr}</priority>` : null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlsXml,
    "</urlset>",
    "",
  ].join("\n");
}

// ---------- MAIN ----------
function main() {
  const destinationRoutes = getDestinationRoutes();

  // Normalize all locs first (so de-dupe is accurate with trailing slash policy)
  const combined = [...staticRoutes, ...destinationRoutes].map((r) => ({
    ...r,
    loc: normalizeLoc(r.loc),
  }));

  // remove duplicates by loc
  const seen = new Set();
  const unique = combined.filter((r) => {
    if (seen.has(r.loc)) return false;
    seen.add(r.loc);
    return true;
  });

  const xml = buildSitemap(unique);

  fs.writeFileSync(OUT_FILE, xml, "utf8");

  console.log("✅ sitemap.xml generated");
  console.log("📄 File:", OUT_FILE);
  console.log("🔗 URLs:", unique.length);
  console.log("🌐 Base:", SITE_URL);
  console.log("↪ Trailing slash:", USE_TRAILING_SLASH ? "ON" : "OFF");
}

main();
