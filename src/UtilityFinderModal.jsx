export default function UtilityFinderModal({ open, onClose, data, loading }) {
  if (!open) return null;

  const result = data?.result || null;
  const type = data?.type || "";
  const placeName = data?.placeName || "";
  const err = data?.error || null;
  const mapsSearchUrl = data?.mapsSearchUrl || null;

  const originLat = data?.originLat;
  const originLon = data?.originLon;

  const label = type === "hospital" ? "Hospital" : "Pharmacy";
  // Safe formatter (prevents toFixed crashes)
const safeFixed2 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : null;
};

  const kmText = safeFixed2(result?.approxKm);



// Google Maps driving directions
const openGoogleMapsDrivingDirections = ({ originLat, originLon, destLat, destLon }) => {
  const url =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${originLat},${originLon}` +
    `&destination=${destLat},${destLon}` +
    `&travelmode=driving`;

  window.open(url, "_blank", "noopener,noreferrer");
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-5 border-b flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Nearest {label}
            </div>
            <div className="text-lg font-extrabold text-slate-900 mt-1">
              {placeName}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="text-sm text-slate-600">Finding nearest {label.toLowerCase()}…</div>
          ) : err ? (
            <div className="text-sm text-red-600 font-semibold">{err}</div>
          ) : result ? (
            <div className="space-y-3">
              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="text-base font-extrabold text-slate-900">
                  {result.name}
                </div>

                <div className="text-sm text-slate-600 mt-1">
                  {kmText ? `Approx distance: ${kmText} km` : "Distance unavailable"}
                </div>

                {result.address ? (
                  <div className="text-sm text-slate-700 mt-2">{result.address}</div>
                ) : null}

                {result.phone ? (
                  <div className="text-sm text-slate-700 mt-1">
                    Phone: <span className="font-semibold">{result.phone}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {result?.isFallbackSearch ? (

                  <button
                    type="button"
                    onClick={() => {
                      const q = encodeURIComponent(result.searchQuery || "");
                      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank", "noopener,noreferrer");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-sm hover:bg-slate-800"
                  >
                    Open nearby results in Maps
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      openGoogleMapsDrivingDirections({
                        originLat,
                        originLon,
                        destLat: result.lat,
                        destLon: result.lon,
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-sm hover:bg-slate-800"
                  >
                    Open driving route
                  </button>
                )}


                {result.address ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(result.address);
                      } catch {}
                    }}
                    className="px-4 py-2 rounded-xl border bg-white font-extrabold text-sm hover:bg-slate-50"
                  >
                    Copy address
                  </button>
                ) : null}
              </div>

              {data?.coordSource === "destination_fallback" ? (
                <div className="text-xs text-slate-500">
                  Using destination area (approx) because this attraction has no exact coordinates.
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-sm text-slate-600">No result found.</div>
          )}

          {loading && mapsSearchUrl ? (
            <div className="space-y-3">
              <div className="text-sm text-slate-600">
                Finding the closest option… (you can open live results now)
              </div>

              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-sm hover:bg-slate-800"
              >
                Open nearby results in Maps
              </a>
            </div>
          ) : null}

          {!loading && !result && mapsSearchUrl ? (
            <div className="space-y-3">
              <div className="text-sm text-slate-600">
                Here are the best live results near this attraction:
              </div>

              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-sm hover:bg-slate-800"
              >
                Open nearby results in Maps
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
