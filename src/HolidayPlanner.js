import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Cloud,
  Sun,
  CloudRain,
  Thermometer,
  Clock,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Download,
  Share2,
  Mail,
  Users,
  MessageCircle,
  Link as LinkIcon,
  Copy,
  FileText,
  Star,
  X,
  Trash2
} from 'lucide-react';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'leaflet/dist/leaflet.css';
import { supabase } from "./lib/supabase";

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * DestinationMap
 * - Hover → destination name
 * - Click → select destination and go to next step
 */

function DestinationMap({
  destinations,
  onSelect,
  getDestCondition,
  loadingMapWeather,
}) {
  const defaultCenter = [20, 0];
  const defaultZoom = 2;

  const makeWeatherIcon = (condition) => {
    const color =
      condition === "sunny"
        ? "#F59E0B"
        : condition === "rainy"
        ? "#3B82F6"
        : "#64748B";

    return L.divIcon({
      className: "",
      html: `
        <div style="
          width:18px;
          height:18px;
          border-radius:999px;
          background:${color};
          border:2px solid white;
          box-shadow:0 6px 14px rgba(0,0,0,0.25);
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  };

  return (
    <div className="w-full h-full relative">
      {loadingMapWeather && (
        <div className="absolute top-3 left-3 z-[1000] px-3 py-2 rounded-lg bg-white/90 backdrop-blur border shadow text-sm">
          Loading weather…
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyController
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
        />

        {destinations.map((dest) => {
          const condition = getDestCondition(dest.id);
          const icon = makeWeatherIcon(condition);

          return (
            <Marker
              key={dest.id}
              position={[dest.lat, dest.lon]}
              icon={icon}
              eventHandlers={{
			  click: () => {

			    window.__itinexRecentClick = true;
			    setTimeout(() => (window.__itinexRecentClick = false), 1200);
				  // cinematic click zoom
				  window.dispatchEvent(
				    new CustomEvent("itinex-flyto", {
				      detail: { lat: dest.lat, lon: dest.lon, zoom: 9 },
				    })
				  );

				  // after a short beat, go to next screen
				  setTimeout(() => onSelect(dest), 450);
				},


			  
			}}

            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-sm font-semibold">{dest.name}</div>
                <div className="text-xs text-gray-500">
                  {dest.country} • {condition}
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
function AdSlot({ id, label = "Ad", className = "" }) {
  return (
    <div
      id={id}
      className={[
        "w-full rounded-xl border border-dashed border-slate-300 bg-slate-50",
        "flex items-center justify-center text-slate-500",
        "overflow-hidden",
        className,
      ].join(" ")}
      aria-label={label}
      role="complementary"
    >
      <div className="text-center px-4">
        <div className="text-xs font-semibold uppercase tracking-wide">
        <div className="text-center px-4">
		  <div className="text-sm font-semibold text-slate-700">
		    Reach travelers while they plan
		  </div>
		  <p className="mt-1 text-xs text-slate-500">
		    Your brand here — inspire journeys at the moment of decision.
		  </p>
		 <a
  href="https://mail.google.com/mail/?view=cm&to=buthpur@itinex.net&su=Advertising%20with%20Itinex&body=Hi%20Itinex%20Team,%0A%0AI%20am%20interested%20in%20advertising%20on%20Itinex."
  target="_blank"
  rel="noopener noreferrer"
  className="mt-3 inline-flex items-center px-3 py-1.5 rounded-md bg-itinex-primary text-white text-xs font-semibold hover:opacity-90"
>
  Advertise with Itinex
</a>

		</div>
		</div>
        <div className="text-[11px] mt-1 text-slate-400">{id}</div>
      </div>
    </div>
  );
}

function FlyController({ defaultCenter, defaultZoom }) {
  const map = useMap();

  React.useEffect(() => {
    const onFlyTo = (e) => {
      const { lat, lon, zoom } = e.detail || {};
      if (lat == null || lon == null) return;

      map.flyTo([lat, lon], zoom ?? map.getZoom(), {
        animate: true,
        duration: 0.8,
      });
    };

    window.addEventListener("itinex-flyto", onFlyTo);

    const idle = setInterval(() => {
      if (!window.__itinexHovering && !window.__itinexRecentClick) {
        map.flyTo(defaultCenter, defaultZoom, {
          animate: true,
          duration: 0.9,
        });
      }
    }, 900);

    return () => {
      window.removeEventListener("itinex-flyto", onFlyTo);
      clearInterval(idle);
    };
  }, [map, defaultCenter, defaultZoom]);

  return null;
}


export default function HolidayPlanner() {
  const [step, setStep] = useState('select');
  const [destinations, setDestinations] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [days, setDays] = useState(3);
  const [weather, setWeather] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDests, setLoadingDests] = useState(true);
  const [error, setError] = useState(null);

  const [shareUrl, setShareUrl] = useState('');
  const [roomId, setRoomId] = useState('');
  const [presenceCount, setPresenceCount] = useState(1);

  const [commentName, setCommentName] = useState('Me');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  const [showReviews, setShowReviews] = useState(false);
  const [selectedReviewDest, setSelectedReviewDest] = useState(null);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [destinationReviews, setDestinationReviews] = useState({});
const [selectView, setSelectView] = useState('grid'); 

  const pdfRef = useRef(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const weatherAbortRef = useRef(null);
const [attractionsSource, setAttractionsSource] = useState(null);
const [attractionsMap, setAttractionsMap] = useState({});
const _attractionImageCache = new Map(); 
const [attractionImages, setAttractionImages] = useState({}); 
const [attractionsForTrip, setAttractionsForTrip] = useState(null);
const [hoveredDestId, setHoveredDestId] = useState(null);
const [useDateRange, setUseDateRange] = useState(true);
const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10)); 
const [endDate, setEndDate] = useState(() => {
const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
});

const [activeNav, setActiveNav] = useState("planner"); 
const [mobileNavOpen, setMobileNavOpen] = useState(false);

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};


const [mapWeatherById, setMapWeatherById] = useState({}); 

const [loadingMapWeather, setLoadingMapWeather] = useState(false);

const weatherConditionFromCode = (code) => {
  if (code === 0 || code === 1) return "sunny";
  if (code === 2 || code === 3) return "cloudy";
  return "rainy";
};

const [savedTrips, setSavedTrips] = useState([]);
const SAVED_TRIPS_KEY = "itinex:savedTrips";
const destKey = (dest) => {
  // prefer stable explicit id if you have it
  if (dest?.id !== undefined && dest?.id !== null) return slugify(dest.id);

  // else use name/country fallback
  const name = dest?.name ? String(dest.name) : "";
  const country = dest?.country ? String(dest.country) : "";
  return slugify(`${name}-${country}`);
};


const fetchReviewsForDestination = async (destinationId) => {
  if (!destinationId) return;

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id,destination_id,destination_name,author,text,rating,created_at")
      .eq("destination_id", destinationId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const normalized = (data || []).map((r) => ({
      id: r.id,
      destinationId: r.destination_id,
      destinationName: r.destination_name,
      author: r.author,
      text: r.text,
      rating: r.rating,
      ts: new Date(r.created_at).getTime(),
    }));

    setDestinationReviews((prev) => ({
      ...prev,
      [destinationId]: normalized,
    }));
  } catch (err) {
    console.error("Failed to fetch destination reviews:", err);
  }
};

{/* Remove after New Year */}
const [showMarketingModal, setShowMarketingModal] = useState(false);

useEffect(() => {
  const seen = localStorage.getItem("itinex_ny2026_seen");
  if (!seen) {
    const timer = setTimeout(() => {
      setShowMarketingModal(true);
      localStorage.setItem("itinex_ny2026_seen", "true");
    }, 1500); // delay feels natural

    return () => clearTimeout(timer);
  }
}, []);

function loadSavedTrips() {
  try {
    const raw = localStorage.getItem(SAVED_TRIPS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSavedTrips(trips) {
  localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips));
}
useEffect(() => {
  let title = "Itinex — Plan less. Explore more.";
  let desc =
    "Weather-aware travel itineraries built around real attractions.";

  if (step === "select") {
    title = "Choose your destination — Itinex";
    desc = "Explore destinations via map or grid and start planning.";
  }

  if (step === "days" && selectedDest) {
    title = `Plan your trip to ${selectedDest.name} — Itinex`;
    desc = `Choose trip dates and generate a smart itinerary for ${selectedDest.name}.`;
  }

  if (step === "itinerary" && selectedDest) {
    title = `${days}-day itinerary for ${selectedDest.name} — Itinex`;
    desc = `Your personalized, weather-aware itinerary for ${selectedDest.name}.`;
  }

  document.title = title;
  setMeta("description", desc);
  setOG("og:title", title);
  setOG("og:description", desc);
}, [step, selectedDest?.name, days]);

useEffect(() => {
  const trips = loadSavedTrips();
  setSavedTrips(trips);
}, []);
const saveCurrentTrip = () => {
  if (!selectedDest || !itinerary?.length) return;

  const now = Date.now();
  const trip = {
    id: cryptoRandomId(),
    ts: now,
    title: `${selectedDest.name} • ${days} day${days === 1 ? "" : "s"}`,
    selectedDest,
    days,
    startDate: useDateRange ? startDate : null,
    endDate: useDateRange ? endDate : null,
    weather,
    itinerary,
    shareUrl: shareUrl || ""
  };

  setSavedTrips((prev) => {
    // de-dupe: same destination + same first day date + same length
    const sig = `${selectedDest.name}|${days}|${itinerary?.[0]?.date || ""}`;
    const next = [
      trip,
      ...prev.filter((t) => {
        const tSig = `${t?.selectedDest?.name}|${t?.days}|${t?.itinerary?.[0]?.date || ""}`;
        return tSig !== sig;
      }),
    ].slice(0, 50); // keep last 50

    persistSavedTrips(next);
    return next;
  });

  setError("Trip saved ✅");
};
useEffect(() => {
  if (step === "itinerary" && selectedDest && itinerary.length > 0) {
    saveCurrentTrip();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [step, selectedDest?.name, itinerary]);
const openSavedTrip = (trip) => {
  if (!trip?.selectedDest || !trip?.itinerary?.length) return;

  setSelectedDest(trip.selectedDest);
  setDays(trip.days ?? trip.itinerary.length);
  setWeather(trip.weather ?? null);
  setItinerary(trip.itinerary);
  setStep("itinerary");
  setError(null);
};

const deleteSavedTrip = (id) => {
  setSavedTrips((prev) => {
    const next = prev.filter((t) => t.id !== id);
    persistSavedTrips(next);
    return next;
  });
};

useEffect(() => {
  if (step !== "map" || !destinations?.length) return;

  let cancelled = false;
  const controller = new AbortController();

  (async () => {
    setLoadingMapWeather(true);

    try {
      // fetch only for destinations not in cache yet
      const todo = destinations.filter((d) => !mapWeatherById[d.id]);
      if (todo.length === 0) return;

      // Limit concurrency to avoid hammering API
      const limit = 6;
      let idx = 0;

      const worker = async () => {
        while (idx < todo.length && !cancelled) {
          const d = todo[idx++];
          try {
            const url =
              `https://api.open-meteo.com/v1/forecast?latitude=${d.lat}&longitude=${d.lon}` +
              `&daily=weather_code&timezone=auto&forecast_days=1`;

            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) continue;

            const data = await res.json();
            const code = data?.daily?.weather_code?.[0];
            if (code === undefined || code === null) continue;

            const condition = weatherConditionFromCode(code);

            if (!cancelled) {
              setMapWeatherById((prev) => ({
                ...prev,
                [d.id]: { code, condition },
              }));
            }
          } catch (e) {
            if (e?.name === "AbortError") return;
          }
        }
      };

      await Promise.all(Array.from({ length: limit }, worker));
    } finally {
      if (!cancelled) setLoadingMapWeather(false);
    }
  })();

  return () => {
    cancelled = true;
    controller.abort();
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [step, destinations]);

useEffect(() => {
  (async () => {
    try {
      const res = await fetch('/attractions.json');
      if (!res.ok) return;
      setAttractionsMap(await res.json());
    } catch {}
  })();
}, []);

useEffect(() => {
  if (step === 'select' && selectView === 'map') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, [step, selectView]);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const trip = url.searchParams.get('trip');
      if (!trip) return;

      const json = decodeURIComponent(escape(atob(trip)));
      const parsed = JSON.parse(json);

      if (parsed?.selectedDest && parsed?.itinerary?.length) {
  setSelectedDest(parsed.selectedDest);
  setDays(parsed.days ?? parsed.itinerary.length);
  setWeather(parsed.weather ?? null);
  setItinerary(parsed.itinerary);

  setUseDateRange(parsed.useDateRange ?? false);
  if (parsed.startDate) setStartDate(parsed.startDate);
  if (parsed.endDate) setEndDate(parsed.endDate);

  setStep('itinerary');
  setError(null);
}

    } catch (e) {}
  }, []);

  useEffect(() => {
    if (step !== 'itinerary' || !selectedDest || itinerary.length === 0) return;
    const base = `${selectedDest.name}|${days}|${itinerary?.[0]?.date ?? ''}`;
    setRoomId(`trip-${hashString(base)}`);
  }, [step, selectedDest?.name, days, itinerary]);

async function fetchUnsplashImage(query) {
	console.log('Unsplash key?', !!process.env.REACT_APP_UNSPLASH_ACCESS_KEY);

  if (!UNSPLASH_KEY) return null;

  // Search 1 photo for the query
  const url =
    `https://api.unsplash.com/search/photos?per_page=1&orientation=landscape` +
    `&query=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }
  });

  if (!res.ok) return null;

  const data = await res.json();
  const photo = data?.results?.[0];
  // Use the returned hotlink URL from the API response
  return photo?.urls?.regular || photo?.urls?.full || null;
}

function FitBounds({ destinations }) {
  const map = useMap();

  React.useEffect(() => {
    if (!destinations?.length) return;

    const bounds = destinations
      .filter(d => Number.isFinite(d.lat) && Number.isFinite(d.lon))
      .map(d => [d.lat, d.lon]);

    if (!bounds.length) return;

    // If only one destination, center with zoom
    if (bounds.length === 1) {
      map.setView(bounds[0], 5, { animate: true });
      return;
    }

    map.fitBounds(bounds, { padding: [30, 30] });
  }, [destinations, map]);

  return null;
}
function upsertMeta(nameOrProp, value, isProp = false) {
  const selector = isProp ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    if (isProp) el.setAttribute("property", nameOrProp);
    else el.setAttribute("name", nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setCanonical(url) {
  let link = document.head.querySelector(`link[rel="canonical"]`);
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function NavButton({ active, children, onClick, disabled, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "px-3 py-2 rounded-lg text-sm font-semibold transition",
        "border",
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-transparent hover:bg-slate-50 hover:border-slate-200",
        disabled ? "opacity-50 cursor-not-allowed" : ""
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function MobileNavItem({ children, onClick, disabled, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "px-3 py-2 rounded-lg border bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function DestinationLeafletPicker({ destinations, onPick }) {
  // Default center (will be overridden by FitBounds)
  const center = [20, 0];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Pick from map</h3>
          <p className="text-sm text-gray-600">Hover a marker to see the destination, click to select.</p>
        </div>
        <div className="text-xs text-gray-500">Zoom + drag to explore</div>
      </div>

      <div className="overflow-hidden rounded-2xl border">
        <div style={{ height: 520, width: '100%' }}>
          <MapContainer
            center={center}
            zoom={2}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              // Free OpenStreetMap tiles
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitBounds destinations={destinations} />

            {destinations.map((d) => (
              <Marker
                key={d.id}
                position={[d.lat, d.lon]}
                eventHandlers={{
                  click: () => onPick(d),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1} sticky>
                  <div className="font-semibold">{d.name}</div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Tip: You can still switch back to Grid view anytime.
      </div>
    </div>
  );
}


async function fetchWikipediaThumbnail(title, size = 1000) {
  if (!title) return null;

  const url =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
    `&prop=pageimages&piprop=thumbnail&pithumbsize=${size}` +
    `&titles=${encodeURIComponent(title)}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;

  const firstPage = pages[Object.keys(pages)[0]];
  return firstPage?.thumbnail?.source || null;
}

let _unsplashBlocked = false;

const getUnsplashKey = () =>
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_UNSPLASH_ACCESS_KEY) ||
  process.env.REACT_APP_UNSPLASH_ACCESS_KEY ||
  null;
const daysFromRange = (s, e) => {
  const start = new Date(s);
  const end = new Date(e);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diff = Math.round((end - start) / 86400000) + 1; // inclusive
  return Math.max(1, Math.min(14, diff));
};

const fetchUnsplashPhotoUrl = async (query) => {
  if (_unsplashBlocked) return null;

  const key = getUnsplashKey();
  if (!key) return null;

  const url =
    `https://api.unsplash.com/search/photos?per_page=1&orientation=landscape` +
    `&query=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${key}`,
      // harmless but sometimes recommended
      "Accept-Version": "v1"
    }
  });

  if (res.status === 403) {
    // log body once so you can confirm "rate limit exceeded"
    let body = "";
    try { body = await res.text(); } catch {}
    console.warn("Unsplash 403 (likely rate limit). Disabling Unsplash for this session.", {
      remaining: res.headers.get("x-ratelimit-remaining"),
      limit: res.headers.get("x-ratelimit-limit"),
      body: body?.slice?.(0, 300)
    });
    _unsplashBlocked = true;
    return null;
  }

  if (!res.ok) return null;

  const data = await res.json();
  return data?.results?.[0]?.urls?.regular || null;
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const latLonToXY = (lat, lon) => {
  // Equirectangular projection into [0..100] percentage coordinates
  // lon -180..180 => x 0..100
  // lat  90..-90  => y 0..100
  const x = ((lon + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
};

const getAttractionImage = async (destinationName, attractionName) => {
  const dest = destinationName || "";
  const att = attractionName || "";
  const cacheKey = `${dest}||${att}`.toLowerCase();

  if (_attractionImageCache.has(cacheKey)) return _attractionImageCache.get(cacheKey);

  // 1) Wikipedia thumbnail (usually the most "exact")
  const wikiImg = await fetchWikipediaThumbnail(att, 1000);
  if (wikiImg) {
    _attractionImageCache.set(cacheKey, wikiImg);
    return wikiImg;
  }

  // 2) Unsplash fallback (can be rate-limited; now handled)
  const unsplashImg = await fetchUnsplashPhotoUrl(`${att} ${dest}`);
  const finalUrl = unsplashImg || svgPlaceholderDataUrl(att);

  _attractionImageCache.set(cacheKey, finalUrl);
  return finalUrl;
};

const hydrateAttractionImages = async (destinationName, plan) => {
  const names = new Set();
  plan.forEach((d) => {
    if (d.morning) names.add(d.morning);
    if (d.evening) names.add(d.evening);
  });

  const updates = {};
  for (const name of names) {
    updates[name] = await getAttractionImage(destinationName, name);
  }

  setAttractionImages((prev) => ({ ...prev, ...updates }));
};


  const fetchDestinations = React.useCallback(async () => {
  setLoadingDests(true);
  setError(null);

  try {
    const res = await fetch('/destinations.json');
    if (!res.ok) throw new Error('Failed to fetch destinations.json');
    const popularCities = await res.json();

    const destinationsWithImages = await Promise.all(
      popularCities.map(async (city, index) => {
        const label = `${city.name}, ${city.country}`;

        // Better query than the old Source endpoint
        const query = `${city.name} ${city.country} landmark`;
const image = (await fetchUnsplashImage(query)) || svgPlaceholderDataUrl(label);


        return {
          id: index + 1,
          name: label,
          country: city.country,
          lat: city.lat,
          lon: city.lon,
          image
        };
      })
    );

    setDestinations(destinationsWithImages);
  } catch (e) {
    setError('Failed to load destinations. Please refresh the page.');
  } finally {
    setLoadingDests(false);
  }
}, []);

const UNSPLASH_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

  useEffect(() => {
  fetchDestinations();
  loadDestinationReviews();
}, [fetchDestinations]);

useEffect(() => {
  // Example: dynamic title when user is on itinerary
  const title =
    step === "itinerary" && selectedDest?.name
      ? `Itinex — ${selectedDest.name} (${days} days)`
      : "Itinex — plan less, explore more";

  document.title = title;

  // Optional: dynamic description
  const desc =
    step === "itinerary" && selectedDest?.name
      ? `Your weather-aware itinerary for ${selectedDest.name}. Save, share, and collaborate.`
      : "Weather-aware itineraries and real places for your next trip.";

  upsertMeta("description", desc);
  upsertMeta("og:title", title, true);
  upsertMeta("og:description", desc, true);

  // Canonical (basic SPA version)
  setCanonical(window.location.origin + window.location.pathname);
}, [step, selectedDest?.name, days]);

  const loadDestinationReviews = async () => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id,destination_id,destination_name,author,text,rating,created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const grouped = {};
    for (const r of data || []) {
      if (!grouped[r.destination_id]) grouped[r.destination_id] = [];
      grouped[r.destination_id].push({
        id: r.id,
        destinationId: r.destination_id,
        destinationName: r.destination_name,
        author: r.author,
        text: r.text,
        rating: r.rating,
        ts: new Date(r.created_at).getTime(),
      });
    }
    setDestinationReviews(grouped);
  } catch (err) {
    console.error("Failed to load reviews:", err);
    // keep app usable even if reviews fail
  }
};


  const addDestinationReview = async () => {
  if (!reviewText.trim() || !selectedReviewDest) return;

  const destinationId = destKey(selectedReviewDest);

  try {
    const payload = {
      destination_id: destinationId,
      destination_name: selectedReviewDest.name,
      author: reviewName.trim() || "Anonymous",
      text: reviewText.trim(),
      rating: reviewRating,
    };

    const { data, error } = await supabase
      .from("reviews")
      .insert(payload)
      .select("id,destination_id,destination_name,author,text,rating,created_at")
      .single();

    if (error) throw error;

    const normalized = {
      id: data.id,
      destinationId: data.destination_id,
      destinationName: data.destination_name,
      author: data.author,
      text: data.text,
      rating: data.rating,
      ts: new Date(data.created_at).getTime(),
    };

    setDestinationReviews((prev) => ({
      ...prev,
      [destinationId]: [normalized, ...(prev[destinationId] || [])],
    }));

    setReviewText("");
    setReviewRating(5);
    setReviewName("");
  } catch (err) {
    console.error(err);
    setError("Failed to save review. Please try again.");
  }
};



  const getAverageRating = (destKeyId) => {
  const reviews = destinationReviews[destKeyId] || [];
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
};


  const openReviewModal = (dest) => {
  setSelectedReviewDest(dest);
  setShowReviews(true);

  const key = destKey(dest);
  fetchReviewsForDestination(key);
};


  const fetchAttractions = async (lat, lon, destinationFullName) => {
  const key = slugify(destinationFullName); // e.g. london-united-kingdom

  // 1) Curated per-destination attractions (best quality)
  const curated = attractionsMap?.[key];
  if (
    curated?.sunny?.length &&
    curated?.cloudy?.length &&
    curated?.rainy?.length
  ) {
    setAttractionsSource('curated');
    return curated;
  }

  // 2) Wikipedia nearby attractions (real places near coordinates)
  try {
    const attractions = await fetchWikipediaAttractions(lat, lon);
    if (attractions?.sunny?.length > 8) {
      setAttractionsSource('wikipedia');
      return attractions;
    }
  } catch {}

  // 3) Last-resort generic fallback
  setAttractionsSource('fallback');
  return getCuratedAttractions(destinationFullName || '');
};



  const fetchWikipediaAttractions = async (lat, lon) => {
  // 1) Get nearby pages
  const geoRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=50000&gscoord=${lat}|${lon}&gslimit=50&format=json&origin=*`
  );
  const geoData = await geoRes.json();
  const geo = geoData?.query?.geosearch || [];
  if (geo.length < 12) throw new Error('Not enough nearby Wikipedia places');

  // 2) Pull more details for those pages (title + short description/extract)
  const pageIds = geo.map(p => p.pageid).slice(0, 30).join('|');
  const detailRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageIds}&prop=pageprops|description|extracts&exintro=1&explaintext=1&format=json&origin=*`
  );
  const detailData = await detailRes.json();
  const pages = detailData?.query?.pages || {};

  const badWords = [
    'station', 'district', 'constituency', 'railway', 'school',
    'hospital', 'road', 'street', 'avenue', 'university', 'college',
    'cemetery', 'company', 'office', 'neighborhood'
  ];

  const places = geo
    .map((g) => {
      const page = pages[String(g.pageid)] || {};
      const title = g.title || '';
      const desc = (page.description || '').toLowerCase();
      const extract = (page.extract || '').toLowerCase();
      return {
        name: title,
        distance: g.dist,
        // rough text signals to help categorization
        text: `${desc} ${extract}`.trim()
      };
    })
    .filter((p) => {
      const t = p.name.toLowerCase();
      if (!p.name || p.name.length > 60) return false;
      if (badWords.some(w => t.includes(w))) return false;
      // also avoid purely administrative pages
      if (p.text.includes('administrative')) return false;
      return true;
    });

  if (places.length < 12) throw new Error('Not enough good Wikipedia places');

  return categorizeAttractions(places);
};


  const categorizeAttractions = (places) => {
  const outdoorKeywords = [
    'park','garden','beach','view','lookout','trail','hike','island',
    'zoo','temple','shrine','castle','palace','fort','harbor','waterfront',
    'bridge','square','plaza'
  ];
  const indoorKeywords = [
    'museum','gallery','cathedral','church','basilica','palace',
    'theatre','theater','market','mall','aquarium','planetarium','library',
    'exhibition'
  ];

  const isOutdoor = (p) => {
    const s = `${p.name} ${p.text}`.toLowerCase();
    return outdoorKeywords.some(k => s.includes(k));
  };

  const isIndoor = (p) => {
    const s = `${p.name} ${p.text}`.toLowerCase();
    return indoorKeywords.some(k => s.includes(k));
  };

  const sunny = places.filter(isOutdoor);
  const rainy = places.filter(isIndoor);
  const cloudy = places.filter(p => !sunny.includes(p) && !rainy.includes(p));

  return {
    sunny: sunny.length > 8 ? sunny : [...sunny, ...cloudy].slice(0, 20),
    cloudy: cloudy.length > 8 ? cloudy : places.slice(0, 20),
    rainy: rainy.length > 8 ? rainy : [...rainy, ...cloudy].slice(0, 20)
  };
};


  const getCuratedAttractions = (cityName) => {
    const city = (cityName || '').toLowerCase();
    if (city.includes('tokyo')) {
      return {
        sunny: ['Senso-ji Temple & Asakusa', 'Meiji Shrine & Harajuku', 'Shinjuku Gyoen National Garden'],
        cloudy: ['Shibuya Crossing & Hachiko', 'Akihabara Electric Town', 'Ginza Shopping'],
        rainy: ['Tokyo National Museum', 'Mori Art Museum', 'teamLab Borderless Digital Art']
      };
    }
    return {
      sunny: ['City Park', 'Waterfront Promenade', 'Botanical Gardens', 'Viewpoint Hill', 'Beach Area', 'Nature Reserve'],
      cloudy: ['Main Square', 'Old Town', 'Market Place', 'Historic Cathedral', 'City Museum', 'Art Gallery'],
      rainy: ['National Museum', 'Science Center', 'Shopping Mall', 'Aquarium', 'Indoor Market', 'Concert Hall']
    };
  };

  const fetchWeather = async (destination) => {
    setLoading(true);
    setError(null);

    if (weatherAbortRef.current) weatherAbortRef.current.abort();
    const controller = new AbortController();
    weatherAbortRef.current = controller;

    try {
      const attractions = await fetchAttractions(destination.lat, destination.lon, destination.name);

     const dailyFields =
  "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset";

let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${destination.lat}&longitude=${destination.lon}&daily=${dailyFields}&timezone=auto`;

if (useDateRange && startDate && endDate) {
  weatherUrl += `&start_date=${startDate}&end_date=${endDate}`;
} else {
  weatherUrl += `&forecast_days=${days}`;
}

const response = await fetch(weatherUrl, { signal: controller.signal });

      if (!response.ok) throw new Error(`Weather API error: ${response.status}`);

      const data = await response.json();
      if (!data.daily?.weather_code) throw new Error('Invalid weather data format');

      setWeather(data);
      generateItinerary(data, destination, attractions);
    } catch (e) {
      if (e?.name === 'AbortError') return;

      setError(`Unable to fetch weather data: ${e.message}. Generating itinerary with default weather...`);
      try {
        const attractions = await fetchAttractions(destination.lat, destination.lon, destination.name);
        generateItinerary(null, destination, attractions);
      } catch {
        setError('Failed to generate itinerary. Please try again.');
        setLoading(false);
      }
    }
  };

  const getWeatherCondition = (code) => {
    if (code === 0 || code === 1) return 'sunny';
    if (code === 2 || code === 3) return 'cloudy';
    return 'rainy';
  };

  const getWeatherIcon = (code) => {
    if (code === 0 || code === 1) return <Sun className="w-6 h-6 text-yellow-500" />;
    if (code === 2 || code === 3) return <Cloud className="w-6 h-6 text-gray-500" />;
    return <CloudRain className="w-6 h-6 text-blue-500" />;
  };

  const generateItinerary = (weatherData, destination, attractionsData) => {
    const plan = [];
    const usedAttractions = new Set();

const normalizedAttractions = {
  sunny: attractionsData.sunny.map((s) => (typeof s === 'string' ? s : s.name)),
  cloudy: attractionsData.cloudy.map((s) => (typeof s === 'string' ? s : s.name)),
  rainy: attractionsData.rainy.map((s) => (typeof s === 'string' ? s : s.name))
};

setAttractionsForTrip(normalizedAttractions);

    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
      const attractionPools = {
   sunny: shuffleArray(normalizedAttractions.sunny),
   cloudy: shuffleArray(normalizedAttractions.cloudy),
   rainy: shuffleArray(normalizedAttractions.rainy)
 };
    const poolIndexes = { sunny: 0, cloudy: 0, rainy: 0 };

    const getUniqueAttraction = (condition) => {
      const pool = attractionPools[condition];
      for (let i = poolIndexes[condition]; i < pool.length; i++) {
        const attraction = pool[i];
        if (!usedAttractions.has(attraction)) {
          usedAttractions.add(attraction);
          poolIndexes[condition] = i + 1;
          return attraction;
        }
      }
      const alternative = Object.keys(attractionPools).filter((k) => k !== condition);
      for (const alt of alternative) {
        for (let i = poolIndexes[alt]; i < attractionPools[alt].length; i++) {
          const attraction = attractionPools[alt][i];
          if (!usedAttractions.has(attraction)) {
            usedAttractions.add(attraction);
            poolIndexes[alt] = i + 1;
            return attraction;
          }
        }
      }
      const fallback = pool[poolIndexes[condition] % pool.length];
      poolIndexes[condition]++;
      return fallback;
    };

    for (let i = 0; i < days; i++) {
  // ✅ PLACE YOUR CODE HERE (START)

  let condition = 'cloudy';
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

    const max = weatherData.daily.temperature_2m_max?.[i];
    const min = weatherData.daily.temperature_2m_min?.[i];
    tempMax = Number.isFinite(max) ? Math.round(max) : 20;
    tempMin = Number.isFinite(min) ? Math.round(min) : 14;

    const p = weatherData.daily.precipitation_sum?.[i];
    precipMm = Number.isFinite(p) ? Math.round(p * 10) / 10 : 0;

    const pp = weatherData.daily.precipitation_probability_max?.[i];
    precipProb = Number.isFinite(pp) ? Math.round(pp) : null;

    const w = weatherData.daily.wind_speed_10m_max?.[i];
    windMax = Number.isFinite(w) ? Math.round(w) : null;

    sunrise = weatherData.daily.sunrise?.[i] || null;
    sunset = weatherData.daily.sunset?.[i] || null;
  }

  const morningSpot = getUniqueAttraction(condition);
  const eveningSpot = getUniqueAttraction(condition);
const baseDate = useDateRange && startDate ? new Date(startDate) : new Date();
const key = destKey(selectedDest);
const reviewCount = (destinationReviews[key] || []).length;
const avgRating = getAverageRating(key);

const dateObj = new Date(baseDate);
dateObj.setDate(baseDate.getDate() + i);
  plan.push({
    day: i + 1,
    date: dateObj.toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
}),
isoDate: dateObj.toISOString().slice(0, 10),

    condition,
    weatherCode,

    // ✅ store weather per day
    tempMax,
    tempMin,
    precipMm,
    precipProb,
    windMax,
    sunrise,
    sunset,

    morning: morningSpot,
    evening: eveningSpot
  });
}


    setItinerary(plan);
    setStep('itinerary');
    setLoading(false);
    hydrateAttractionImages(destination?.name || "", plan);
  };

  const handleSelectDestination = (dest) => {
    setSelectedDest(dest);
    setStep('days');
  };

  const handlePlanTrip = () => {
    fetchWeather(selectedDest);
  };

const e = new Date();
  const resetPlanner = () => {
    if (weatherAbortRef.current) weatherAbortRef.current.abort();

setUseDateRange(true);
setStartDate(new Date().toISOString().slice(0, 10));
e.setDate(e.getDate() + 2);
setEndDate(e.toISOString().slice(0, 10));

setAttractionsSource(null);
setAttractionsForTrip(null);

    setStep('select');
    setSelectedDest(null);
    setDays(3);
    setWeather(null);
    setItinerary([]);
    setError(null);
    setShareUrl('');
    setRoomId('');
    setPresenceCount(1);
    setComments([]);
    safeDestroyCollab();
  };

const pickReplacement = (slot, dayObj, currentItinerary) => {
  const pools = attractionsForTrip;
  if (!pools) return null;

  const used = new Set();
  currentItinerary.forEach((d) => {
    if (d.morning) used.add(d.morning);
    if (d.evening) used.add(d.evening);
  });

  const currentValue = slot === 'morning' ? dayObj.morning : dayObj.evening;
  used.delete(currentValue); // allow replacing current one

  const preferred = pools[dayObj.condition] || [];
  const alternatives = ['sunny', 'cloudy', 'rainy'].filter((c) => c !== dayObj.condition);

  const candidates = [
    ...preferred,
    ...alternatives.flatMap((c) => pools[c] || [])
  ].filter((name) => name && !used.has(name) && name !== currentValue);

  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
};

const replaceActivityForDay = async (dayNumber, slot) => {
  setItinerary((prev) => {
    const dayObj = prev.find((d) => d.day === dayNumber);
    if (!dayObj) return prev;

    const replacement = pickReplacement(slot, dayObj, prev);
    if (!replacement) {
      setError('No more unique attractions available to replace.');
      return prev;
    }

    // hydrate image in background (safe; if it fails it falls back)
    try {
      const destName = selectedDest?.name || '';
      // If you have getAttractionImage()/hydrateAttractionImages, use that:
      Promise.resolve(getAttractionImage(destName, replacement)).then((url) => {
        if (!url) return;
        setAttractionImages((imgPrev) => ({ ...imgPrev, [replacement]: url }));
      });
    } catch {}

    return prev.map((d) => {
      if (d.day !== dayNumber) return d;
      return {
        ...d,
        [slot]: replacement
      };
    });
  });
};

const swapActivitiesForDay = (dayNumber) => {
  setItinerary((prev) =>
    prev.map((d) => {
      if (d.day !== dayNumber) return d;
      return {
        ...d,
        morning: d.evening,
        evening: d.morning
      };
    })
  );
};

  const buildShareUrl = (payload) => {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const url = new URL(window.location.href);
    url.searchParams.set('trip', encoded);
    return url.toString();
  };
  useEffect(() => {
  if (!useDateRange) return;
  const d = daysFromRange(startDate, endDate);
  setDays(d);
}, [useDateRange, startDate, endDate]);


  useEffect(() => {
  if (step !== 'itinerary' || !selectedDest || itinerary.length === 0) return;

  const url = buildShareUrl({
    selectedDest,
    days,
    weather,
    itinerary,
    useDateRange,
    startDate,
    endDate
  });

  setShareUrl(url);
}, [step, selectedDest, days, weather, itinerary, useDateRange, startDate, endDate]);


  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  };

  const handleWebShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Holiday Planner — ${selectedDest?.name}`,
          text: 'Join my trip plan and collaborate in real time!',
          url: shareUrl
        });
        return;
      } catch {}
    }
    await copyToClipboard(shareUrl);
    setError('Share link copied to clipboard.');
  };

  const socialShareLinks = useMemo(() => {
    const u = encodeURIComponent(shareUrl || window.location.href);
    const text = encodeURIComponent(`Join my holiday plan: ${selectedDest?.name || ''}`);
    return {
      x: `https://twitter.com/intent/tweet?url=${u}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`
    };
  }, [shareUrl, selectedDest?.name]);

  const generateIcs = () => {
  const dtstamp = formatIcsDate(new Date());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Itinex//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  itinerary.forEach((d) => {
    // Prefer isoDate from itinerary; fallback to startDate + day index
    let base = null;

    if (d.isoDate) {
      base = new Date(`${d.isoDate}T00:00:00`);
    } else if (useDateRange && startDate) {
      const sd = new Date(`${startDate}T00:00:00`);
      base = new Date(sd.getTime() + (d.day - 1) * 86400000);
    } else {
      // absolute fallback: today + index
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      base = new Date(t.getTime() + (d.day - 1) * 86400000);
    }

    // Morning 09:00–13:00
    const morningStart = new Date(base);
    morningStart.setHours(9, 0, 0, 0);
    const morningEnd = new Date(morningStart.getTime() + 4 * 60 * 60 * 1000);

    lines.push(
      ...icsEventLines({
        uid: cryptoRandomId(),
        dtstamp,
        start: morningStart,
        end: morningEnd,
        summary: `Morning: ${d.morning}`,
        description: `Destination: ${selectedDest?.name}\nWeather: ${d.condition}, High ${d.tempMax ?? d.temp ?? ''}°C / Low ${d.tempMin ?? ''}°C`,
        location: selectedDest?.name || ''
      })
    );

    // Evening 16:00–20:00
    const eveStart = new Date(base);
    eveStart.setHours(16, 0, 0, 0);
    const eveEnd = new Date(eveStart.getTime() + 4 * 60 * 60 * 1000);

    lines.push(
      ...icsEventLines({
        uid: cryptoRandomId(),
        dtstamp,
        start: eveStart,
        end: eveEnd,
        summary: `Evening: ${d.evening}`,
        description: `Destination: ${selectedDest?.name}\nWeather: ${d.condition}, High ${d.tempMax ?? d.temp ?? ''}°C / Low ${d.tempMin ?? ''}°C`,
        location: selectedDest?.name || ''
      })
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};

const rangeLine =
  useDateRange && startDate && endDate
    ? `Dates: ${startDate} → ${endDate}\n`
    : '';
  const downloadIcs = () => {
    const ics = generateIcs();
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerary-${slugify(selectedDest?.name || 'trip')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const emailItinerary = () => {
  const subject = `Holiday itinerary: ${selectedDest?.name}`;

  const body = [
  `Hi!`,
  ``,
  `Here's the holiday itinerary for ${selectedDest?.name}:`,
  rangeLine,
  shareUrl ? `\nShared plan link (collaborate live):\n${shareUrl}\n` : '',
  `Summary:`,
    ...itinerary.map(
      (d) =>
        `Day ${d.day} (${d.date}) — Morning: ${d.morning} | Evening: ${d.evening} — ${d.condition}, High ${d.tempMax}°C / Low ${d.tempMin}°C`
    ),
    '',
    'Cheers!'
  ].join('\n');

  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
};


  const exportToPdf = async () => {
    if (!pdfRef.current) return;
    setExportingPdf(true);
    setError(null);

    try {
      await waitForImages(pdfRef.current);

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`itinerary-${slugify(selectedDest?.name || 'trip')}.pdf`);
    } catch (e) {
      setError(`PDF export failed: ${e?.message || 'unknown error'}`);
    } finally {
      setExportingPdf(false);
    }
  };

  const addCommentLocalAndCollaborative = async () => {
    if (!commentText.trim()) return;
    addCommentViaSingleton(commentName || 'Anonymous', commentText.trim(), setComments);
    setCommentText('');
  };

  useEffect(() => {
  if (step !== 'itinerary' || itinerary.length === 0 || !roomId) return;
  ensureCollabSingleton(roomId, commentName || 'Anonymous', setComments, setPresenceCount);
  return () => safeDestroyCollab();
}, [step, roomId, commentName, itinerary.length]);


  if (loadingDests) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-itinex-secondary via-indigo-50 to-itinex-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading amazing destinations...</p>
        </div>
      </div>
    );
  }

  function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setOG(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}


function svgPlaceholderDataUrl(text) {
  const safe = String(text || '').slice(0, 60);
  const svg = `
    <svg xmlns="/itinex.png" width="800" height="600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#7c3aed"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="34" fill="white" opacity="0.95">
        ${escapeXml(safe)}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;"
  }[c]));
}
const DestinationMapPicker = ({ destinations, onPick }) => {
  const hovered = destinations.find(d => d.id === hoveredDestId);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Pick from map</h3>
          <p className="text-sm text-gray-600">Hover a flag to see the destination, click to select.</p>
        </div>

        {hovered ? (
          <div className="px-3 py-2 rounded-xl border bg-gray-50 text-sm text-gray-800">
            <span className="font-semibold">{hovered.name}</span>
          </div>
        ) : (
          <div className="px-3 py-2 rounded-xl border bg-gray-50 text-sm text-gray-500">
            Hover a marker…
          </div>
        )}
      </div>

      {/* "World map" panel */}
      <div className="relative w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-itinex-secondary via-indigo-50 to-itinex-primary">
        {/* Maintain a nice aspect ratio */}
        <div className="relative w-full" style={{ paddingTop: '52%' }}>
          {/* Subtle grid lines */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          {/* Equator + prime meridian */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-black/10" />
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/10" />

          {/* Markers */}
          {destinations.map((dest) => {
            const { x, y } = latLonToXY(dest.lat, dest.lon);

            return (
              <button
                key={dest.id}
                type="button"
                onMouseEnter={() => setHoveredDestId(dest.id)}
                onMouseLeave={() => setHoveredDestId(null)}
                onFocus={() => setHoveredDestId(dest.id)}
                onBlur={() => setHoveredDestId(null)}
                onClick={() => onPick(dest)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}
                aria-label={`Select ${dest.name}`}
                title={dest.name}
              >
                {/* Flag pin */}
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-white shadow-md border flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-lg">📍</span>
                  </div>

                  {/* Tooltip */}
                  <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                    <div className="px-3 py-1 rounded-full bg-gray-900 text-white text-xs shadow">
                      {dest.name}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Tip: You can still switch back to Grid view anytime.
      </div>
    </div>
  );
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-itinex-secondary via-indigo-50 to-itinex-primary">
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-slate-200">
  <div className="max-w-7xl mx-auto px-4 py-4">
    <div className="flex items-center justify-between gap-3">
      {/* Brand */}
      <div
  role="button"
  tabIndex={0}
  onClick={() => {
    setStep("select");        // destinations page
    setActiveNav("home");    // optional nav sync
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      setStep("select");
      setActiveNav("home");
    }
  }}
  className="flex items-center gap-3 cursor-pointer select-none"
  aria-label="Go to destinations"
>
  <div className="p-2 rounded-xl bg-gradient-to-br from-itinex-secondary to-itinex-primary shadow-sm">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-map-pin w-5 h-5 text-white"
      aria-hidden="true"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  </div>

  <div className="leading-tight">
    <div className="flex items-center gap-2">
      <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
        Itinex
      </h1>
      <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600">
        Plan less. Explore more.
      </span>
    </div>

    <p className="hidden md:block text-xs text-slate-600">
      Smart itineraries • Real places • Weather-aware planning
    </p>
  </div>
</div>


      {/* Desktop IA nav */}
      <nav className="hidden lg:flex items-center gap-1">
      <NavButton
  active={activeNav === "home"}
  className="font-extrabold"
  onClick={() => {
    setActiveNav("home");
    setStep("select");
  }}
>
  Home
</NavButton>

        <NavButton
          active={activeNav === "destinations"}
          onClick={() => {
            setActiveNav("destinations");
            // If not on select, reset to show destinations
            if (step !== "select") resetPlanner();
            setTimeout(() => scrollToSection("destinations"), 50);
          }}
        >
          Destinations
        </NavButton>

        <NavButton
		  active={activeNav === "map"}
		  onClick={() => {
		    setActiveNav("map");
		    setStep("map");
		    window.scrollTo({ top: 0, behavior: "smooth" });
		  }}
		>
		  Map
		</NavButton>

       <NavButton
		  active={activeNav === "saved"}
		  onClick={() => {
		    setActiveNav("saved");
		    setStep("saved"); // ✅ show the saved trips screen
		  }}
		>
		  Saved Trips
		</NavButton>


        {/*<NavButton
          active={activeNav === "reviews"}
          onClick={() => setActiveNav("reviews")}
        >
          Reviews
        </NavButton>*/}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {step !== "select" && (
          <button
            onClick={resetPlanner}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Start Over
          </button>
        )}

        <button
          onClick={() => {
            setActiveNav("planner");
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (step !== "select") resetPlanner();
          }}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-gradient-to-r from-itinex-secondary to-itinex-primary
                     text-white font-semibold hover:opacity-90 transition"
        >
          <Sparkles className="w-4 h-4" />
          New Trip
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileNavOpen((v) => !v)}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border bg-white hover:bg-slate-50"
          aria-label="Open menu"
        >
          <ChevronRight className={`w-5 h-5 text-slate-700 transition-transform ${mobileNavOpen ? "rotate-90" : ""}`} />
        </button>
      </div>
    </div>

   {/* Mobile nav */}
{mobileNavOpen && (
  <div className="lg:hidden mt-4 flex flex-col gap-2">
    
    {/* Destinations */}
    <MobileNavItem
      onClick={() => {
        setMobileNavOpen(false);
        setActiveNav("destinations");

        if (step !== "select") resetPlanner();

        setStep("select"); // ✅ REQUIRED
        setTimeout(() => scrollToSection("destinations"), 50);
      }}
    >
      Destinations
    </MobileNavItem>

    {/* Map */}
    <MobileNavItem
      onClick={() => {
        setMobileNavOpen(false);
        setActiveNav("map");
        setStep("map"); // ✅ REQUIRED
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      Map
    </MobileNavItem>

    {/* Saved Trips */}
    <MobileNavItem
      onClick={() => {
        setMobileNavOpen(false);
        setActiveNav("saved");
        setStep("saved"); // ✅ REQUIRED
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      Saved Trips
    </MobileNavItem>

    {/* New Trip */}
    <MobileNavItem
      onClick={() => {
        setMobileNavOpen(false);
        setActiveNav("home");
        setStep("select"); // ✅ REQUIRED
        resetPlanner();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="bg-gradient-to-r from-itinex-secondary to-itinex-primary text-white border-transparent"
    >
      New Trip
    </MobileNavItem>
      </div>
    )}
  </div>
</header>

<div>
    <div className="bg-white border-b border-slate-200">
  <div className="max-w-7xl mx-auto px-4 py-3">
    <AdSlot
      id="ad-top-banner"
      label="Top banner (970×90 / 728×90)"
      className="h-[90px]"
    />
  </div>
</div>

<div className=""> {/* use "max-w-[1440px] mx-auto px-4 py-8" to squeeze layout */}
  <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_260px] gap-6">
    
    <aside className="hidden xl:block" style={{padding: '10px'}}>
      <div className="sticky top-24 space-y-6">
        <AdSlot id="ad-left-1" label="Left rail (300×600)" className="h-[600px]" />
        <AdSlot id="ad-left-2" label="Left rail (300×250)" className="h-[250px]" />
      </div>
    </aside>

    <main className="min-w-0">
      <div className="max-w-7xl mx-auto" style={{padding: '10px'}}>
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {step === "saved" && (
  <div id="saved" className="space-y-6">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Saved Trips</h2>
        <p className="text-gray-600 text-sm">Your trips saved in this browser</p>
      </div>

      <button
        type="button"
        onClick={() => setStep("select")}
        className="px-4 py-2 rounded-xl border bg-white text-gray-700 hover:bg-gray-50 text-sm font-semibold"
      >
        Plan a new trip
      </button>
    </div>

    {savedTrips.length === 0 ? (
      <div className="bg-white rounded-2xl border p-10 text-center text-gray-600">
        <div className="text-lg font-semibold text-gray-900">No saved trips yet</div>
        <p className="mt-2 text-sm text-gray-600">
          Generate an itinerary and it’ll be saved automatically.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {savedTrips.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="h-40 bg-gray-100">
              <img
                src={t?.selectedDest?.image || svgPlaceholderDataUrl(t?.selectedDest?.name || "Trip")}
                alt={t?.selectedDest?.name || "Trip"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = svgPlaceholderDataUrl(t?.selectedDest?.name || "Trip");
                }}
              />
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-extrabold text-gray-900">{t.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Saved {new Date(t.ts).toLocaleString()}
                  </div>
                  {t.startDate && t.endDate && (
                    <div className="text-xs text-gray-600 mt-1">
                      {t.startDate} → {t.endDate}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-5">
                <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    openSavedTrip(t);
  }}
  className="text-itinex-primary text-sm font-semibold hover:underline"
>
  Open
</a>

<a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    saveCurrentTrip();
  }}
  className="text-gray-700 text-sm hover:text-itinex-primary hover:underline"
>
  Save trip
</a>



                {t.shareUrl ? (
                	<a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    copyToClipboard(t.shareUrl)
  }}
  className="text-gray-700 text-sm hover:text-itinex-primary hover:underline"
>
  Copy link
</a>
                ) : null}

                <button
  type="button"
  onClick={() => {
  if (window.confirm("Delete this saved trip?")) {
    deleteSavedTrip(t.id);
  }
}}
  className="ml-auto p-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition"
  title="Delete trip"
  aria-label="Delete trip"
>
  <Trash2 className="w-4 h-4" />
</button>

              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}


        {step === 'select' && (
          <div id="destinations" className="space-y-6">
	        <div className="flex items-center justify-center gap-2 mb-6">
			  <button
			    type="button"
			    onClick={() => setSelectView('grid')}
			    className={`px-4 py-2 rounded-xl border text-sm font-semibold transition
			      ${selectView === 'grid' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
			  >
			    Grid view
			  </button>

			  <button
			    type="button"
			    onClick={() => setSelectView('map')}
			    className={`px-4 py-2 rounded-xl border text-sm font-semibold transition
			      ${selectView === 'map' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
			  >
			    Map view
			  </button>
			</div>


            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Dream Destination</h2>
              <p className="text-gray-600">Select from popular tourist spots and read reviews</p>
            </div>

            {selectView === 'grid' ? (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {destinations.map((dest) => {
    const key = destKey(dest); // ✅ stable destination_id key

    const reviewsForDest = destinationReviews[key] || [];
    const reviewCount = reviewsForDest.length;
    const avgRating = getAverageRating(key);

    return (
      <div
        key={key}
        className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        {/* Clickable image/header */}
        <div
          onClick={() => handleSelectDestination(dest)}
          className="cursor-pointer"
        >
          <div className="relative h-48 overflow-hidden bg-gray-200">
            <img
              src={dest.image}
              alt={dest.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = svgPlaceholderDataUrl(dest.name);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-bold text-lg">{dest.name}</h3>
              <p className="text-white text-sm">{dest.country}</p>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            {/* Rating + count */}
            <div className="flex items-center gap-1">
              {Number(avgRating) > 0 ? (
                <>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-900">
                    {avgRating}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({reviewCount})
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-500">No reviews yet</span>
              )}
            </div>

            {/* Reviews button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openReviewModal(dest); // ✅ opens modal + fetches Supabase reviews
              }}
              className="text-xs text-itinex-secondary hover:text-itinex-primary font-semibold"
              title="View reviews"
            >
              Reviews
            </button>
          </div>

          {/* Explore CTA */}
          <div
            onClick={() => handleSelectDestination(dest)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="text-sm text-gray-600">Explore destination</span>
            <ChevronRight className="w-5 h-5 text-itinex-secondary group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Optional: small helpful line */}
          <div className="mt-3 text-xs text-gray-500">
            {reviewCount > 0
              ? `Top-rated by travelers • ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
              : "Be the first to review this destination"}
          </div>
        </div>
      </div>
    );
  })}
</div>

		) : (
		  <DestinationLeafletPicker
		    destinations={destinations}
		    onPick={(dest) => handleSelectDestination(dest)} // ✅ click marker goes to Step 2
		  />
		)}

          </div>
        )}

        {step === 'days' && selectedDest && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-br from-itinex-secondary to-itinex-primary rounded-2xl mb-4">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Plan Your Trip to {selectedDest.name}</h2>
                <p className="text-gray-600">How many days will you be staying?</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Number of Days: <span className="text-2xl font-bold text-blue-600">{days}</span>
                  </label>
                  <div className="mb-6 p-4 rounded-xl border bg-gray-50">
				  <div className="flex items-center justify-between gap-3 flex-wrap">
				    <div className="text-sm font-semibold text-gray-900">Trip dates</div>
				    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
				      <input
				        type="checkbox"
				        checked={useDateRange}
				        onChange={(e) => setUseDateRange(e.target.checked)}
				      />
				      Use date range
				    </label>
				  </div>

				  {useDateRange ? (
				    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
				      <div>
				        <label className="block text-xs font-medium text-gray-600 mb-1">Start</label>
				        <input
				          type="date"
				          value={startDate}
				          onChange={(e) => {
				            const v = e.target.value;
				            setStartDate(v);
				            // keep end >= start
				            if (new Date(endDate) < new Date(v)) setEndDate(v);
				          }}
				          className="w-full px-3 py-2 rounded-lg border bg-white"
				        />
				      </div>

				      <div>
				        <label className="block text-xs font-medium text-gray-600 mb-1">End</label>
				        <input
				          type="date"
				          value={endDate}
				          min={startDate}
				          onChange={(e) => setEndDate(e.target.value)}
				          className="w-full px-3 py-2 rounded-lg border bg-white"
				        />
				      </div>

				      <div className="sm:col-span-2 text-xs text-gray-600">
				        Duration: <span className="font-semibold">{daysFromRange(startDate, endDate)}</span> day(s) (max 14)
				      </div>
				    </div>
				  ) : (
				    <div className="mt-3 text-xs text-gray-600">
				      Using slider below to choose number of days.
				    </div>
				  )}
				</div>

                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="w-full h-3 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1 day</span>
                    <span>14 days</span>
                  </div>
                </div>

                <button
                  onClick={handlePlanTrip}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-itinex-secondary to-itinex-primary text-white py-4 rounded-xl font-semibold text-lg hover:from-itinex-secondary hover:to-itinex-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Your Perfect Itinerary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Smart Itinerary
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        {step === "map" && (
		  <div id="map" className="space-y-6">
		    <div className="text-center mb-6">
		      <h2 className="text-2xl font-extrabold text-gray-900">
		        Choose a destination from the map
		      </h2>
		      <p className="text-gray-600">
		        Hover to explore • Click to plan your trip
		      </p>
		    </div>

		    {/* Map container */}
		    <div className="h-[70vh] rounded-2xl overflow-hidden border shadow">
		      {/* Leaflet map goes here */}
		      <DestinationMap
				  destinations={destinations}
				  loadingMapWeather={loadingMapWeather}
				  getDestCondition={(id) =>
				    mapWeatherById[id]?.condition || "cloudy"
				  }
				  onSelect={(dest) => {
				    setSelectedDest(dest);
				    setActiveNav("planner");
				    setStep("days");
				  }}
				/>


		    </div>
		  </div>
		)}


        {step === 'itinerary' && itinerary.length > 0 && (
          <div id="itinerary" className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Your {days}-Day Adventure in {selectedDest.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 flex-wrap">
                    {weather && (
                      <span className="inline-flex items-center gap-2">
                        <Thermometer className="w-4 h-4" /> Live weather data
                      </span>
                    )}
                    {roomId && (
                      <span className="inline-flex items-center gap-2">
                        <Users className="w-4 h-4" /> {presenceCount} collaborating
                      </span>
                    )}
                    {attractionsSource && (
					  <span className="inline-flex items-center gap-2">
					    <Sparkles className="w-4 h-4" />
					    Attractions:{' '}
					    {attractionsSource === 'curated' && 'Curated for this destination'}
					    {attractionsSource === 'wikipedia' && 'Nearby real places'}
					    {attractionsSource === 'fallback' && 'General tourist highlights'}
					  </span>
					)}
					<span
					  title="How attraction suggestions were generated"
					  className="inline-flex items-center gap-2 cursor-help"
					/>

					                  </div>
					                </div>

					                <div className="flex flex-wrap gap-2">
					                  <button
					  onClick={exportToPdf}
					  disabled={exportingPdf}
					  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
					             bg-slate-800 text-white
					             hover:bg-slate-900
					             disabled:opacity-60"
					>
					  <FileText className="w-4 h-4" />
					  {exportingPdf ? "Exporting…" : "Export PDF"}
					</button>


					                  <button
					  onClick={downloadIcs}
					  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
					             bg-itinex-primary text-white
					             hover:bg-emerald-700"
					>
					  <Download className="w-4 h-4" />
					  Download .ics
					</button>


					                  <button
					  onClick={emailItinerary}
					  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
					             bg-itinex-secondary text-white
					             hover:bg-sky-700"
					>
					  <Mail className="w-4 h-4" />
					  Email
					</button>


					                 <button
					  onClick={handleWebShare}
					  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
					             bg-itinex-accent text-white
					             hover:bg-amber-600"
					>
					  <Share2 className="w-4 h-4" />
					  Share
					</button>

                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Share link (collaborative)
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={shareUrl}
                      readOnly
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(shareUrl)}
                      className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Share on</div>
                  <div className="flex flex-wrap gap-2">
                    <a className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm" href={socialShareLinks.whatsapp} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                    <a className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm" href={socialShareLinks.x} target="_blank" rel="noreferrer">
                      X
                    </a>
                    <a className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm" href={socialShareLinks.facebook} target="_blank" rel="noreferrer">
                      Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="space-y-4">
                {itinerary.map((day, idx) => (
		  <div
		    key={idx}
		    className="group rounded-2xl border border-gray-200 bg-white/80 backdrop-blur shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
		  >
		    {/* Header */}
		    <div className="p-6 pb-4 bg-gradient-to-br from-white to-gray-50">
		      <div className="flex items-start justify-between gap-4">
		        <div className="flex items-start gap-4">
		          <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-itinex-secondary to-itinex-primary text-white flex items-center justify-center font-extrabold text-lg shadow-md">
		            {day.day}
		          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Day {day.day}
              </h3>
              <span className="text-sm text-gray-500">• {day.date}</span>
            </div>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white text-sm text-gray-700">
                {getWeatherIcon(day.weatherCode)}
                <span className="capitalize">{day.condition}</span>
              </span>

              <span className="inline-flex items-center px-3 py-1 rounded-full border bg-white text-sm text-gray-700">
                {day.tempMax}°C / {day.tempMin}°C
              </span>

              <span className="inline-flex items-center px-3 py-1 rounded-full border bg-white text-sm text-gray-700">
                Rain {day.precipMm}mm{day.precipProb !== null ? ` • ${day.precipProb}%` : ''}
              </span>

              {day.windMax !== null && (
                <span className="inline-flex items-center px-3 py-1 rounded-full border bg-white text-sm text-gray-700">
                  Wind {day.windMax} km/h
                </span>
              )}
            </div>

            {day.sunrise && day.sunset && (
              <div className="mt-2 text-xs text-gray-500">
                Sunrise{' '}
                {new Date(day.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                • Sunset{' '}
                {new Date(day.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>

        {/* Optional: little “vibe” badge */}
        <div className="hidden md:flex items-center gap-2 text-xs text-white">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-itinex-secondary to-itinex-primary border">
            Photo picks + weather-aware
          </span>
        </div>
      </div>
    </div>
    {/* Square tiles */}
    <div className="p-6 pt-0">
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Morning tile */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow">
		  <div className="relative aspect-square bg-gray-100">
		    <img
		      src={attractionImages[day.morning] || svgPlaceholderDataUrl(day.morning)}
		      alt={day.morning}
		      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
		      loading="lazy"
		      onError={(e) => {
		        e.currentTarget.onerror = null;
		        e.currentTarget.src = svgPlaceholderDataUrl(day.morning);
		      }}
		    />

		    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

		    <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-sm font-semibold text-gray-900">
		      <Sun className="w-4 h-4 text-orange-500" />
		      Morning
		    </div>

		    <div className="absolute top-3 right-3 flex items-center gap-2">
		  <button
		    type="button"
		    onClick={() => swapActivitiesForDay(day.day)}
		    className="inline-flex items-center px-3 py-1 rounded-full bg-black/50 hover:bg-black/65 text-white text-xs font-semibold backdrop-blur border border-white/15"
		    title="Swap morning and evening for this day"
		  >
		    Swap
		  </button>

		  <button
		    type="button"
		    onClick={() => replaceActivityForDay(day.day, 'morning')}
		    className="inline-flex items-center px-3 py-1 rounded-full bg-black/50 hover:bg-black/65 text-white text-xs font-semibold backdrop-blur border border-white/15"
		    title="Replace the morning activity with another suggestion"
		  >
		    Replace
		  </button>
		</div>


		    <div className="absolute bottom-0 left-0 right-0 p-4">
		      <div className="text-white font-bold text-lg leading-snug drop-shadow">
		        {day.morning}
		      </div>
		      <div className="text-white/85 text-xs mt-1">
		        Best for {day.condition === 'rainy' ? 'indoors nearby' : 'exploring'}
		      </div>
		    </div>
		  </div>
		</div>

            

            {/* Desktop timeline connector */}
			<div className="hidden md:block pointer-events-none absolute inset-0">
			  <div className="absolute left-1/2 top-[6.5rem] bottom-[6.5rem] -translate-x-1/2 w-px bg-gradient-to-b from-orange-400 via-gray-300 to-indigo-400" />

			  {/* Morning dot */}
			  <div className="absolute left-1/2 top-[6rem] -translate-x-1/2 w-3 h-3 rounded-full bg-orange-500 shadow" />

			  {/* Evening dot */}
			  <div className="absolute left-1/2 bottom-[6rem] -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-500 shadow" />
			</div>


			{/* Mobile timeline connector */}
			<div className="md:hidden flex items-center justify-center">
			  <div className="relative w-full h-8 flex items-center">
			    <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-orange-400 via-gray-300 to-indigo-400" />
			    <div className="mx-auto w-3 h-3 rounded-full bg-indigo-500 shadow" />
			  </div>
			</div>

        {/* Evening tile */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow">
          <div className="relative aspect-square bg-gray-100">
       
            <img
              src={attractionImages[day.evening] || svgPlaceholderDataUrl(day.evening)}
              alt={day.evening}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = svgPlaceholderDataUrl(day.evening);
              }}
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

            <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-sm font-semibold text-gray-900">
              <Clock className="w-4 h-4 text-indigo-600" />
              Evening
            </div>
			   <div className="absolute top-3 right-3 flex items-center gap-2">
			  <button
			    type="button"
			    onClick={() => swapActivitiesForDay(day.day)}
			    className="inline-flex items-center px-3 py-1 rounded-full bg-black/50 hover:bg-black/65 text-white text-xs font-semibold backdrop-blur border border-white/15"
			    title="Swap morning and evening for this day"
			  >
			    Swap
			  </button>

			  <button
			    type="button"
			    onClick={() => replaceActivityForDay(day.day, 'evening')}
			    className="inline-flex items-center px-3 py-1 rounded-full bg-black/50 hover:bg-black/65 text-white text-xs font-semibold backdrop-blur border border-white/15"
			    title="Replace the evening activity with another suggestion"
			  >
			    Replace
			  </button>
			</div>

			            <div className="absolute bottom-0 left-0 right-0 p-4">
			              <div className="text-white font-bold text-lg leading-snug drop-shadow">
			                {day.evening}
			              </div>
			              <div className="text-white/85 text-xs mt-1">
			                Great for {day.tempMax >= 24 ? 'late strolls' : 'cozy spots'}
			              </div>
			            </div>

			          </div>
			        </div>
			      </div>
			    </div>
			  </div>
			))}


              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-bold text-gray-900">Collaborative Notes</h3>
                </div>
                <div className="text-sm text-gray-600 inline-flex items-center gap-2">
                  <Users className="w-4 h-4" /> {presenceCount} online
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <input
                  className="px-3 py-2 border rounded-lg bg-gray-50"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Your name"
                />
                <input
                  className="md:col-span-2 px-3 py-2 border rounded-lg bg-white"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a note..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addCommentLocalAndCollaborative();
                  }}
                />
                <button
                  onClick={addCommentLocalAndCollaborative}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                >
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {comments.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0)).map((c) => (
                  <div key={c.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="text-sm font-semibold text-gray-900">{c.author}</div>
                    <div className="text-sm text-gray-700">{c.text}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(c.ts).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sr-only">
              <div ref={pdfRef} className="bg-white p-8" style={{ width: 794 }}>
                <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Holiday Itinerary</div>
                <div style={{ fontSize: 14, color: '#444', marginBottom: 24 }}>
                  {selectedDest?.name} — {days} days
                </div>

                <img
				  src={selectedDest.image}
				  crossOrigin="anonymous"
				  alt="Destination"
				  style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }}
				  onError={(e) => {
				    e.currentTarget.onerror = null;
				    e.currentTarget.src = svgPlaceholderDataUrl(selectedDest.name);
				  }}
				/>


                {itinerary.map((d) => (
                  <div key={d.day} style={{ marginBottom: 22, borderTop: '1px solid #eee', paddingTop: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
                      Day {d.day}: {d.date} — {d.condition}, {d.temp}°C
                    </div>
                    <div style={{ marginBottom: 6 }}>
                      <strong>Morning:</strong> {d.morning}
                    </div>
                    <div>
                      <strong>Evening:</strong> {d.evening}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} </div>
    </main>
    <aside className="hidden xl:block" style={{padding:'10px'}}>
      <div className="sticky top-24 space-y-6">
        <AdSlot id="ad-right-1" label="Right rail (300×600)" className="h-[600px]" />
        <AdSlot id="ad-right-2" label="Right rail (300×250)" className="h-[250px]" />
      </div>
    </aside>

  </div>
</div>
      </div>

  

      {showReviews && selectedReviewDest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedReviewDest.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{getAverageRating(selectedReviewDest.id) || 'No ratings'}</span>
                  <span className="text-sm text-gray-500">
                    ({(destinationReviews[selectedReviewDest.id] || []).length} reviews)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowReviews(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-gradient-to-br from-itinex-secondary to-itinex-primary rounded-xl p-6 mb-6">
                <h4 className="text-lg font-bold mb-4">Write a Review</h4>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2 border rounded-lg"
                  />

                  <div>
                    <div className="flex gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg resize-none"
                  />

                  <button
                    onClick={addDestinationReview}
                    disabled={!reviewText.trim()}
                    className="w-full bg-gradient-to-r from-itinex-secondary to-itinex-primary text-white py-3 rounded-lg font-semibold hover:from-itinex-secondary hover:to-itinex-primary disabled:opacity-50"
                  >
                    Submit Review
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold mb-4">
                  All Reviews ({(destinationReviews[selectedReviewDest.id] || []).length})
                </h4>
                
                {(destinationReviews[selectedReviewDest.id] || []).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(destinationReviews[selectedReviewDest.id] || [])
                      .slice()
                      .sort((a, b) => b.ts - a.ts)
                      .map((review) => (
                        <div key={review.id} className="bg-white border rounded-xl p-4">
                          <div className="flex justify-between mb-2">
                            <div>
                              <div className="font-semibold">{review.author}</div>
                              <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.ts).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{review.text}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
                      <footer className="mt-20 bg-itinex-bg border-t border-slate-200">
  <div className="max-w-7xl mx-auto px-6 py-10">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      
      {/* Brand */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-itinex-primary">
            Itinex
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-600 max-w-sm">
          Plan less. Explore more.  
          Smart itineraries, real places, weather-aware journeys.
        </p>
      </div>

      {/* Links */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">
            Product
          </h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="hover:text-itinex-primary cursor-pointer">Destinations</li>
            <li className="hover:text-itinex-primary cursor-pointer">Smart Itineraries</li>
            <li className="hover:text-itinex-primary cursor-pointer">Map Planner</li>
            <li className="hover:text-itinex-primary cursor-pointer">Collaboration</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">
            Resources
          </h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="hover:text-itinex-secondary cursor-pointer">Help</li>
            <li className="hover:text-itinex-secondary cursor-pointer">Privacy</li>
            <li className="hover:text-itinex-secondary cursor-pointer">Terms</li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="md:text-right">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">
          Ready to explore?
        </h4>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                     bg-gradient-to-r from-itinex-secondary to-itinex-primary
                     text-white font-semibold shadow-sm
                     hover:opacity-90 transition"
        >
          Start a new trip
        </button>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
      <span>
        © {new Date().getFullYear()} Itinex. All rights reserved.
      </span>

      <span className="flex items-center gap-1">
        Built for explorers 🌍
      </span>
    </div>
  </div>
</footer>
{/* Remove after New Year */}
{showMarketingModal && (
  <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[90vw] sm:w-96">
    <div className="relative rounded-2xl shadow-2xl bg-white border overflow-hidden">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-itinex-primary to-itinex-secondary p-4 text-white">
        <h3 className="text-lg font-extrabold">🎆 Happy New Year 2026!</h3>
        <p className="text-xs opacity-90 mt-1">
          Plan smarter journeys this year with Itinex
        </p>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="text-sm text-gray-800">
          ✨ Try our <span className="font-semibold text-itinex-primary">
          Weather-Aware Smart Itineraries</span>
          — activities adapt automatically to rain, sun & temperature.
        </div>

        <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
          <li>Real attractions & maps</li>
          <li>One-click swaps</li>
          <li>Share trips instantly</li>
        </ul>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3">
          <button
            onClick={() => setShowMarketingModal(false)}
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            Dismiss
          </button>

          <button
            onClick={() => {
              setShowMarketingModal(false);
              setActiveNav("destinations"); // or setStep("destinations")
            }}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-itinex-primary text-white text-xs font-semibold hover:opacity-90"
          >
            Try it now →
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

function slugify(s) {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}


function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(36);
}

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatIcsDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + 
         pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
}

function icsEscape(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function icsEventLines({ uid, dtstamp, start, end, summary, description, location }) {
  return [
    'BEGIN:VEVENT',
    `UID:${icsEscape(uid)}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${icsEscape(summary)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `LOCATION:${icsEscape(location)}`,
    'END:VEVENT'
  ];
}

async function waitForImages(el) {
  const imgs = Array.from(el.querySelectorAll('img'));
  await Promise.all(imgs.map(img => new Promise(resolve => {
    if (img.complete) return resolve(true);
    img.onload = () => resolve(true);
    img.onerror = () => resolve(true);
  })));
}

let _collab = null;

function safeDestroyCollab() {
  if (!_collab) return;
  try { if (_collab.yComments && _collab._onComments) _collab.yComments.unobserve(_collab._onComments); } catch {}
  try { if (_collab.provider && _collab._onAwareness) _collab.provider.awareness.off('change', _collab._onAwareness); } catch {}
  try { _collab.provider?.destroy?.(); } catch {}
  try { _collab.ydoc?.destroy?.(); } catch {}
  _collab = null;
}

function ensureCollabSingleton(roomId, userName, setComments, setPresenceCount) {
  if (!roomId) return;

  if (_collab?.roomId === roomId && _collab.provider && _collab.ydoc) {
    try { _collab.provider.awareness.setLocalStateField('user', { name: userName || 'Anonymous' }); } catch {}
    _collab.setComments = setComments;
    _collab.setPresenceCount = setPresenceCount;
    try {
      setComments(_collab.yComments?.toArray?.() ?? []);
      const states = Array.from(_collab.provider.awareness.getStates().values());
      setPresenceCount(Math.max(1, states.length));
    } catch {}
    return;
  }

  safeDestroyCollab();

  const ydoc = new Y.Doc();
  const provider = new WebrtcProvider(roomId, ydoc);
  const yComments = ydoc.getArray('comments');

  _collab = { roomId, ydoc, provider, yComments, setComments, setPresenceCount, _onComments: null, _onAwareness: null };

  try { provider.awareness.setLocalStateField('user', { name: userName || 'Anonymous' }); } catch {}

  const onComments = () => { try { _collab?.setComments?.(yComments.toArray()); } catch {} };
  const onAwareness = () => { 
    try {
      const states = Array.from(provider.awareness.getStates().values());
      _collab?.setPresenceCount?.(Math.max(1, states.length));
    } catch {}
  };

  _collab._onComments = onComments;
  _collab._onAwareness = onAwareness;

  yComments.observe(onComments);
  provider.awareness.on('change', onAwareness);

  if (yComments.length === 0) {
    yComments.push([{
      id: cryptoRandomId(),
      author: 'Planner',
      text: 'Add notes here — everyone can collaborate in real-time.',
      ts: Date.now()
    }]);
  }

  onComments();
  onAwareness();
}

function addCommentViaSingleton(author, text, setComments) {
  if (!_collab?.yComments) {
    setComments(prev => [...prev, { id: cryptoRandomId(), author, text, ts: Date.now() }]);
    return;
  }
  _collab.yComments.push([{ id: cryptoRandomId(), author, text, ts: Date.now() }]);
}