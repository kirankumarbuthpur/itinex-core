// src/utils/utils.js

/* -------------------- General helpers -------------------- */

export const clamp = (v, min, max) =>
  Math.max(min, Math.min(max, v));

export const daysFromRange = (s, e) => {
  const start = new Date(s);
  const end = new Date(e);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  return Math.max(1, Math.min(14, Math.round((end - start) / 86400000) + 1));
};

export const latLonToXY = (lat, lon) => {
  const x = ((lon + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
};

export const addDaysToISO = (isoDate, daysToAdd) => {
  if (!isoDate) return isoDate;
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().slice(0, 10);
};

export const escapeXml = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  }[c]));

export const svgPlaceholderDataUrl = (text) => {
  const safe = String(text || "").slice(0, 60);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#7c3aed"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial" font-size="34" fill="white">
        ${escapeXml(safe)}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

/* -------------------- Weather helpers -------------------- */

export const getWeatherCondition = (code) => {
  if (code === 0 || code === 1) return "sunny";
  if (code === 2 || code === 3) return "cloudy";
  return "rainy";
};

export const weatherConditionFromCode = getWeatherCondition;

/* -------------------- Attractions -------------------- */

export const categorizeAttractions = (places) => {
  const outdoor = ["park", "beach", "view", "trail", "garden", "bridge"];
  const indoor = ["museum", "gallery", "church", "market", "aquarium"];

  const isOutdoor = (p) =>
    outdoor.some((k) => `${p.name} ${p.text}`.toLowerCase().includes(k));
  const isIndoor = (p) =>
    indoor.some((k) => `${p.name} ${p.text}`.toLowerCase().includes(k));

  const sunny = places.filter(isOutdoor);
  const rainy = places.filter(isIndoor);
  const cloudy = places.filter(
    (p) => !sunny.includes(p) && !rainy.includes(p)
  );

  return {
    sunny,
    cloudy,
    rainy,
  };
};

export const getCuratedAttractions = (cityName) => {
  const city = (cityName || "").toLowerCase();
  if (city.includes("tokyo")) {
    return {
      sunny: ["Senso-ji Temple", "Meiji Shrine"],
      cloudy: ["Shibuya Crossing"],
      rainy: ["Tokyo National Museum"],
    };
  }
  return {
    sunny: ["City Park", "Botanical Gardens"],
    cloudy: ["Old Town", "Market Square"],
    rainy: ["National Museum", "Shopping Mall"],
  };
};

/* -------------------- Itinerary -------------------- */

export { generateItinerary } from "./generateItinerary";

/* -------------------- ICS helpers -------------------- */

export const formatIcsDate = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
};

export const icsEventLines = ({
  uid,
  dtstamp,
  start,
  end,
  summary,
  description,
  location,
}) => [
  "BEGIN:VEVENT",
  `UID:${uid}`,
  `DTSTAMP:${dtstamp}`,
  `DTSTART:${formatIcsDate(start)}`,
  `DTEND:${formatIcsDate(end)}`,
  `SUMMARY:${summary}`,
  `DESCRIPTION:${description}`,
  `LOCATION:${location}`,
  "END:VEVENT",
];
