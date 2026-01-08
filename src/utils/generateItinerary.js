// utils/generateItinerary.js

export function generateItinerary({
  weatherData,
  destination,
  attractionsData,
  days,
  useDateRange,
  startDate,
  getWeatherCondition,
  hiddenGemsMode = false,
  surpriseLevel = 0.35,
}) {
  const plan = [];
  const usedAttractions = new Set();

  const normalize = (arr) =>
    arr.map((v) => (typeof v === "string" ? v : v.name));

  const normalizedAttractions = {
    sunny: normalize(attractionsData.sunny || []),
    cloudy: normalize(attractionsData.cloudy || []),
    rainy: normalize(attractionsData.rainy || []),
  };

  const mainstreamKeywords = [
    "museum", "cathedral", "palace", "tower", "bridge", "castle",
    "square", "old town", "market", "national", "central", "zoo",
    "aquarium", "monument", "park", "garden"
  ];

  const isMainstream = (name = "") => {
    const t = name.toLowerCase();
    return mainstreamKeywords.some((k) => t.includes(k));
  };

  // pick from pool with “hidden gems” preference, but still unique
  const pickUniqueWeighted = (condition) => {
    const orderedConditions = [condition, "sunny", "cloudy", "rainy"].filter(
      (v, i, a) => a.indexOf(v) === i
    );

    // collect candidates from preferred + alternates
    const candidates = [];
    for (const c of orderedConditions) {
      const pool = pools[c] || [];
      for (let i = poolIndex[c]; i < pool.length; i++) {
        const name = pool[i];
        if (name && !usedAttractions.has(name)) candidates.push({ name, c, i });
      }
    }

    if (candidates.length === 0) {
      // fallback to your old last resort behavior
      const pool = pools[condition];
      const fallback = pool[poolIndex[condition] % pool.length];
      poolIndex[condition]++;
      return fallback;
    }

    // If hidden gems is OFF, behave like simple first-available
    if (!hiddenGemsMode) {
      const chosen = candidates[0];
      usedAttractions.add(chosen.name);
      poolIndex[chosen.c] = chosen.i + 1;
      return chosen.name;
    }

    // Hidden gems ON:
    // Create a weighted list: prefer non-mainstream; surpriseLevel controls randomness
    const scored = candidates.map((x) => {
      const mainstream = isMainstream(x.name);
      // base preference: non-mainstream higher
      const base = mainstream ? 0.6 : 1.0;

      // add random factor scaled by surpriseLevel
      const jitter = (Math.random() - 0.5) * 2 * surpriseLevel; // [-surprise, +surprise]
      const score = base + jitter;

      return { ...x, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // pick top-N where N grows with surpriseLevel (more surprise => wider choice)
    const n = Math.max(2, Math.min(10, Math.round(2 + surpriseLevel * 8)));
    const bucket = scored.slice(0, n);
    const chosen = bucket[Math.floor(Math.random() * bucket.length)];

    usedAttractions.add(chosen.name);
    poolIndex[chosen.c] = chosen.i + 1;
    return chosen.name;
  };

  const shuffle = (array) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const pools = {
    sunny: shuffle(normalizedAttractions.sunny),
    cloudy: shuffle(normalizedAttractions.cloudy),
    rainy: shuffle(normalizedAttractions.rainy),
  };

  const poolIndex = { sunny: 0, cloudy: 0, rainy: 0 };

  for (let i = 0; i < days; i++) {
    let condition = "cloudy";
    let weatherCode = 2;

    let tempMax = 20;
    let tempMin = 14;
    let precipMm = 0;
    let precipProb = null;
    let windMax = null;
    let sunrise = null;
    let sunset = null;

    if (weatherData?.daily?.weather_code?.[i] !== undefined) {
      weatherCode = weatherData.daily.weather_code[i];
      condition = getWeatherCondition(weatherCode);

      tempMax = Math.round(weatherData.daily.temperature_2m_max?.[i] ?? 20);
      tempMin = Math.round(weatherData.daily.temperature_2m_min?.[i] ?? 14);
      precipMm = Math.round((weatherData.daily.precipitation_sum?.[i] ?? 0) * 10) / 10;
      precipProb = weatherData.daily.precipitation_probability_max?.[i] ?? null;
      windMax = weatherData.daily.wind_speed_10m_max?.[i] ?? null;
      sunrise = weatherData.daily.sunrise?.[i] ?? null;
      sunset = weatherData.daily.sunset?.[i] ?? null;
    }

    const baseDate =
      useDateRange && startDate ? new Date(startDate) : new Date();
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);

    plan.push({
      day: i + 1,
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      isoDate: date.toISOString().slice(0, 10),

      condition,
      weatherCode,

      tempMax,
      tempMin,
      precipMm,
      precipProb,
      windMax,
      sunrise,
      sunset,

      morning: pickUniqueWeighted(condition),
      evening: pickUniqueWeighted(condition),

    });
  }

  return {
    plan,
    normalizedAttractions,
  };
}
