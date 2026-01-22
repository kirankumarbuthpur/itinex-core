/* scripts/generate-sitemap.js */
const fs = require("fs");
const path = require("path");

const SITE_URL = process.env.SITE_URL || "https://itinex.net";

// edit these if you add/remove routes
const staticRoutes = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/destinations", changefreq: "weekly", priority: "0.9" },
  { loc: "/map", changefreq: "weekly", priority: "0.8" },
  { loc: "/saved", changefreq: "weekly", priority: "0.6" },

  // footer pages
  { loc: "/about", changefreq: "monthly", priority: "0.3" },
  { loc: "/contact", changefreq: "monthly", priority: "0.3" },
  { loc: "/advertise", changefreq: "monthly", priority: "0.2" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.1" },
  { loc: "/terms", changefreq: "yearly", priority: "0.1" },
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeUrl(base, loc) {
  const b = base.replace(/\/+$/, "");
  const l = loc.startsWith("/") ? loc : `/${loc}`;
  return `${b}${l}`;
}

/**
 * Optional: add destination SEO pages (only if you have routes for them).
 * Example route you might create later: /destinations/paris-france
 */
function getDestinationRoutes() {
  const publicDir = path.join(process.cwd(), "public");
  const destinationsPath = path.join(publicDir, "destinations.json");

  if (!fs.existsSync(destinationsPath)) return [];

  try {
    const raw = fs.readFileSync(destinationsPath, "utf8");
    const list = JSON.parse(raw);

    if (!Array.isArray(list)) return [];

    const slugify = (s) =>
      String(s || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    // Only include if you actually have these pages implemented.
    // If not implemented, comment this block out.
    return list
      .slice(0, 5000) // safety limit
      .map((d) => {
        const name = d?.name || "";
        const country = d?.country || "";
        const slug = slugify(`${name}-${country}`);
        return {
          loc: `/destinations/${slug}`,
          changefreq: "monthly",
          priority: "0.5",
        };
      });
  } catch {
    return [];
  }
}

function buildSitemap(urls) {
  const now = new Date().toISOString();

  const body = urls
    .map((u) => {
      const full = normalizeUrl(SITE_URL, u.loc);
      return [
        "  <url>",
        `    <loc>${escapeXml(full)}</loc>`,
        `    <lastmod>${escapeXml(now)}</lastmod>`,
        u.changefreq ? `    <changefreq>${escapeXml(u.changefreq)}</changefreq>` : null,
        u.priority ? `    <priority>${escapeXml(u.priority)}</priority>` : null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</urlset>",
    "",
  ].join("\n");
}

function main() {
  const destinationRoutes = getDestinationRoutes(); // optional
  const allRoutes = [...staticRoutes, ...destinationRoutes];

  // de-dupe by loc
  const seen = new Set();
  const unique = allRoutes.filter((r) => {
    if (seen.has(r.loc)) return false;
    seen.add(r.loc);
    return true;
  });

  const sitemapXml = buildSitemap(unique);

  const outPath = path.join(process.cwd(), "public", "sitemap.xml");
  fs.writeFileSync(outPath, sitemapXml, "utf8");

  console.log(`✅ sitemap.xml generated: ${outPath}`);
  console.log(`   URLs: ${unique.length}`);
  console.log(`   Base: ${SITE_URL}`);
}

main();
