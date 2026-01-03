// utils/generateItinerary.js

export function generateItinerary({
  weatherData,
  destination,
  attractionsData,
  days,
  useDateRange,
  startDate,
  getWeatherCondition,
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

  const pickUnique = (condition) => {
    const pool = pools[condition];
    for (let i = poolIndex[condition]; i < pool.length; i++) {
      const name = pool[i];
      if (!usedAttractions.has(name)) {
        usedAttractions.add(name);
        poolIndex[condition] = i + 1;
        return name;
      }
    }

    // fallback to other conditions
    for (const alt of ["sunny", "cloudy", "rainy"]) {
      if (alt === condition) continue;
      const altPool = pools[alt];
      for (let i = poolIndex[alt]; i < altPool.length; i++) {
        const name = altPool[i];
        if (!usedAttractions.has(name)) {
          usedAttractions.add(name);
          poolIndex[alt] = i + 1;
          return name;
        }
      }
    }

    // last resort
    const fallback = pool[poolIndex[condition] % pool.length];
    poolIndex[condition]++;
    return fallback;
  };

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

      morning: pickUnique(condition),
      evening: pickUnique(condition),
    });
  }

  return {
    plan,
    normalizedAttractions,
  };
}
