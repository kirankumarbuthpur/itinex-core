// src/utils/skyscanner.js

/**
 * Convert ISO date (YYYY-MM-DD) → Skyscanner format (YYMMDD)
 */
export function isoToSkyscannerDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return `${y.slice(2)}${m}${d}`;
}

/**
 * Build a Skyscanner flight search URL
 *
 * @param {Object} params
 * @param {string} params.destinationIata - City or airport IATA code (e.g. PAR, LAX)
 * @param {string|null} params.originIata - Optional origin (default handled inside)
 * @param {string|null} params.outboundIso - YYYY-MM-DD
 * @param {string|null} params.inboundIso - YYYY-MM-DD
 */
export function buildSkyscannerFlightsUrl({
  destinationIata,
  originIata = "LON", // sensible default; replace later with user location
  outboundIso = null,
  inboundIso = null
}) {
  if (!destinationIata) {
    return "https://www.skyscanner.net/flights";
  }

  const origin = originIata.toLowerCase();
  const dest = destinationIata.toLowerCase();

  const out = isoToSkyscannerDate(outboundIso);
  const inn = isoToSkyscannerDate(inboundIso);

  const rtn = inn ? 1 : 0;

  const qs = new URLSearchParams({
    adultsv2: "1",
    cabinclass: "economy",
    rtn: String(rtn)
  }).toString();

  // If dates exist, deep link directly to results
  if (out) {
    const path = inn
      ? `https://www.skyscanner.net/transport/flights/${origin}/${dest}/${out}/${inn}/`
      : `https://www.skyscanner.net/transport/flights/${origin}/${dest}/${out}/`;

    return `${path}?${qs}`;
  }

  // Fallback: generic flights page
  return "https://www.skyscanner.net/flights";
}
