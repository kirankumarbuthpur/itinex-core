/* scripts/generate-sitemap.js */

const fs = require("fs");
const path = require("path");

const SITE_URL = "https://itinex.net"; // change if needed

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

function fullUrl(loc) {
  return `${SITE_URL}${loc.startsWith("/") ? loc : "/" + loc}`;
}

// ---------- DESTINATION ROUTES ----------

function getDestinationRoutes() {
  const destFile = path.join(process.cwd(), "public", "destinations.json");

  if (!fs.existsSync(destFile)) {
    console.warn("⚠️ destinations.json not found — skipping destination URLs");
    return [];
  }

  const raw = fs.readFileSync(destFile, "utf8");
  const destinations = JSON.parse(raw);

  if (!Array.isArray(destinations)) return [];

  return destinations.map((d) => {
    const slug = slugify(`${d.name}-${d.country}`);

    return {
      loc: `/destinations/${slug}`,
      changefreq: "monthly",
      priority: "0.6",
    };
  });
}

// ---------- XML BUILDER ----------

function buildSitemap(routes) {
  const lastmod = new Date().toISOString();

  const urls = routes
    .map(
      (r) => `
  <url>
    <loc>${fullUrl(r.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// ---------- MAIN ----------

function main() {
  const destinationRoutes = getDestinationRoutes();

  const combined = [...staticRoutes, ...destinationRoutes];

  // remove duplicates
  const seen = new Set();
  const unique = combined.filter((r) => {
    if (seen.has(r.loc)) return false;
    seen.add(r.loc);
    return true;
  });

  const xml = buildSitemap(unique);

  const outputPath = path.join(process.cwd(), "public", "sitemap.xml");
  fs.writeFileSync(outputPath, xml, "utf8");

  console.log("✅ Sitemap generated");
  console.log("📄 File:", outputPath);
  console.log("🔗 URLs:", unique.length);
}

main();
