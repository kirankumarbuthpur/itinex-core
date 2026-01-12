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

/* -------------------- Travel Stories helpers -------------------- */

export const firstSentence = (text = "") => {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const m = t.match(/^(.+?[.!?])\s/);
  return (m?.[1] || t).trim();
};

export const shortActionLine = (placeName = "", extract = "") => {
  const t = `${placeName} ${extract}`.toLowerCase();

  if (t.includes("museum") || t.includes("gallery") || t.includes("exhibit")) {
    return "Take your time exploring the exhibits and highlights — it’s ideal for a slower, deeper visit.";
  }

  if (t.includes("beach") || t.includes("coast") || t.includes("bay")) {
    return "Walk the waterfront, take photos, and slow down with ocean views and a breezy pause.";
  }

  if (t.includes("park") || t.includes("garden") || t.includes("trail")) {
    return "Go for a relaxed stroll, soak up the scenery, and enjoy a nature break from the city.";
  }

  if (t.includes("church") || t.includes("cathedral") || t.includes("temple")) {
    return "Step inside respectfully, admire the architecture, and notice the quiet details and symbolism.";
  }

  if (t.includes("market") || t.includes("food") || t.includes("cuisine")) {
    return "Browse local flavors, try a snack, and pick up small finds you’ll remember later.";
  }

  return "Wander through, take photos, and follow whatever catches your eye — it’s a great place to explore at your own pace.";
};

export const buildSixLineStory = ({
  destinationName = "",
  morningName = "",
  eveningName = "",
  morningExtract = "",
  eveningExtract = "",
}) => {
  const m1 = firstSentence(morningExtract);
  const e1 = firstSentence(eveningExtract);

  return [
    `Today in ${destinationName}, start at **${morningName}** — ${
      m1 || "a place with its own distinct character and history."
    }`,
    shortActionLine(morningName, morningExtract),
    "What makes it special: it’s widely known for how it reflects the identity and story of the area.",
    `Later, head to **${eveningName}** — ${
      e1 || "an experience that feels different as the day winds down."
    }`,
    shortActionLine(eveningName, eveningExtract),
    "Together, these stops balance “must-see” energy with a meaningful sense of place — the kind of day you’ll remember.",
  ];
};
/* -------------------- Reels + Blog generators -------------------- */

export const safeText = (s = "") =>
  String(s || "").replace(/\s+/g, " ").trim();

export const pickHashtags = (destinationName = "") => {
  const base = ["#travel", "#wanderlust", "#itinerary", "#citybreak", "#traveltips"];
  const destTag = destinationName
    ? `#${destinationName.toLowerCase().replace(/[^a-z0-9]+/g, "")}`
    : null;
  return destTag ? [destTag, ...base] : base;
};

// returns array of {tStart, tEnd, onScreen, broll, vo}
export const buildReelScript = ({
  destinationName = "",
  days = 0,
  itinerary = [],
  storySummaries = {}, // { [placeName]: { extract } }
  surpriseLevel = 0, // optional: if you use it
}) => {
  const dest = safeText(destinationName);
  const totalSeconds = Math.min(45, 8 + (itinerary.length * 6)); // ~8–45s
  const perDay = itinerary.length ? Math.max(5, Math.floor((totalSeconds - 8) / itinerary.length)) : 6;

  const scenes = [];
  let t = 0;

  // Hook (0–3s)
  scenes.push({
    tStart: 0,
    tEnd: 3,
    onScreen: `Save this ${days}-day plan for ${dest}`,
    broll: `Quick montage: skyline + food + streets`,
    vo: `Here’s a ${days}-day plan for ${dest} — save this for later.`,
  });
  t = 3;

  // Context (3–8s)
  scenes.push({
    tStart: 3,
    tEnd: 8,
    onScreen: `Weather-aware • Real places • Easy swaps`,
    broll: `Map zoom-in + itinerary scroll`,
    vo: `It’s weather-aware, built around real places, and easy to customize.`,
  });
  t = 8;

  // Days
  itinerary.forEach((d, idx) => {
    const morning = safeText(d.morning);
    const evening = safeText(d.evening);
    const mEx = safeText(storySummaries?.[d.morning]?.extract || "");
    const eEx = safeText(storySummaries?.[d.evening]?.extract || "");

    const mLine = mEx ? mEx.split(".")[0] + "." : "A must-see spot with great photo moments.";
    const eLine = eEx ? eEx.split(".")[0] + "." : "Perfect to wrap the day with views or vibes.";

    const start = t;
    const end = t + perDay;

    scenes.push({
      tStart: start,
      tEnd: end,
      onScreen: `Day ${d.day}: ${morning} → ${evening}`,
      broll: `B-roll: ${morning} (2s), food/streets (1s), ${evening} (2s)`,
      vo: `Day ${d.day}: start at ${morning}. ${mLine} Then end at ${evening}. ${eLine}`,
    });

    t = end;
  });

  // CTA (last 4s)
  const hashtags = pickHashtags(dest).join(" ");
  scenes.push({
    tStart: t,
    tEnd: t + 4,
    onScreen: `Want the full plan? Link in bio • ${hashtags}`,
    broll: `Itinerary share screen + final skyline`,
    vo: `Want the full plan and map? Grab the link and share it with friends.`,
  });

  return { durationSeconds: Math.round(t + 4), scenes, hashtags };
};

// Simple SRT captions from scenes
export const buildSrtFromReel = (reel) => {
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  const fmt = (sec) => {
    const s = Math.max(0, Math.floor(sec));
    const ms = 0;
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${pad(hh)}:${pad(mm)}:${pad(ss)},${pad(ms, 3)}`;
  };

  const lines = [];
  (reel?.scenes || []).forEach((sc, i) => {
    lines.push(String(i + 1));
    lines.push(`${fmt(sc.tStart)} --> ${fmt(sc.tEnd)}`);
    lines.push(safeText(sc.onScreen || sc.vo || ""));
    lines.push("");
  });

  return lines.join("\n");
};

export const buildBlogPostMarkdown = ({
  destinationName = "",
  days = 0,
  startDate = null,
  endDate = null,
  itinerary = [],
  storySummaries = {}, // { [placeName]: { extract, url } }
}) => {
  const dest = safeText(destinationName);
  const dateLine =
    startDate && endDate ? `**Dates:** ${startDate} → ${endDate}` : `**Length:** ${days} day(s)`;

  const intro = `# ${days}-Day Itinerary for ${dest}\n\n${dateLine}\n\nThis guide turns a smart itinerary into a practical plan you can actually follow — with clear morning/evening ideas, why each place matters, and tips for pacing your day.\n`;

  const daySections = itinerary
    .map((d) => {
      const morning = safeText(d.morning);
      const evening = safeText(d.evening);

      const mEx = safeText(storySummaries?.[d.morning]?.extract || "");
      const eEx = safeText(storySummaries?.[d.evening]?.extract || "");

      const mWhy = mEx ? mEx : "A standout place to start the day — great for exploring, photos, and context.";
      const eWhy = eEx ? eEx : "A memorable way to end the day — better light, calmer pace, and strong atmosphere.";

      const mUrl = storySummaries?.[d.morning]?.url;
      const eUrl = storySummaries?.[d.evening]?.url;

      return `## Day ${d.day} — ${d.date}\n\n**Morning: ${morning}**\n\n${mWhy}\n${mUrl ? `\nSource: ${mUrl}\n` : ""}\n**Evening: ${evening}**\n\n${eWhy}\n${eUrl ? `\nSource: ${eUrl}\n` : ""}\n**Weather note:** ${d.condition} • High ${d.tempMax}°C / Low ${d.tempMin}°C • Rain ${d.precipMm}mm\n`;
    })
    .join("\n");

  const outro = `---\n\n### Quick tips\n- Start earlier on sunny days for the best light.\n- If it rains, swap to indoor-friendly spots (museums/markets).\n- Save the plan and share it with your group so everyone can vote and comment.\n`;

  return `${intro}\n${daySections}\n${outro}`;
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
