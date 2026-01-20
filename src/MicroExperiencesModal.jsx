import React, {useEffect, useMemo, useState } from "react";
import { X, ExternalLink, Search, MapPin, Sparkles } from "lucide-react";
import { SiGooglemaps, SiEventbrite, SiMeetup, SiAirbnb, SiKlook } from "react-icons/si";
import { Compass, Route } from "lucide-react";


function buildSearchUrl(provider, q) {
  const query = encodeURIComponent(q);
  switch (provider) {
    case "maps":
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    case "eventbrite":
      return `https://www.eventbrite.com/d/online/${query}/`;
    case "meetup":
      return `https://www.meetup.com/find/?keywords=${query}`;
    case "getyourguide":
      return `https://www.getyourguide.com/s/?q=${query}`;
    case "viator":
      return `https://www.viator.com/searchResults/all?text=${query}`;
    case "airbnb":
      return `https://www.airbnb.com/s/experiences?query=${query}`;
    case "klook":
      return `https://www.klook.com/search/?query=${query}`;
    default:
      return `https://www.google.com/search?q=${query}`;
  }
}

function ProviderButton({ label, href, icon: Icon }) {
  const brandStyles = {
    "Google Maps":
      "border-blue-500 text-blue-600 hover:bg-blue-50",
    Eventbrite:
      "border-orange-500 text-orange-600 hover:bg-orange-50",
    Meetup:
      "border-red-500 text-red-600 hover:bg-red-50",
    GetYourGuide:
      "border-indigo-500 text-indigo-600 hover:bg-indigo-50",
    Viator:
      "border-purple-500 text-purple-600 hover:bg-purple-50",
    "Airbnb Experiences":
      "border-rose-500 text-rose-600 hover:bg-rose-50",
    Klook:
      "border-emerald-500 text-emerald-600 hover:bg-emerald-50",
  };

  const brandClass =
    brandStyles[label] ||
    "border-slate-300 text-slate-700 hover:bg-slate-50";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "inline-flex items-center gap-2",
        "px-4 py-2 rounded-xl",
        "border-2 bg-white",
        "text-sm font-semibold",
        "transition-all duration-150",
        "hover:scale-[1.03] hover:shadow-sm",
        brandClass,
      ].join(" ")}
    >
      <div className="inline-flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
      </div>
    </a>
  );
}


function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150",
        "inline-flex items-center gap-2",
        active
          ? "bg-itinex-primary text-white shadow-md scale-[1.02]"
          : "bg-white text-slate-700 border border-slate-200 hover:bg-itinex-primary/10 hover:text-itinex-primary hover:border-itinex-primary/40",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const ALL_EXPERIENCE_CATEGORIES = [
  {
    id: "popup_events",
    title: "Pop-up events",
    desc: "Concerts, festivals, special nights, seasonal events.",
    keywords: ["events", "festival", "concert", "tickets", "what's on"],
  },
  {
    id: "local_guides",
    title: "Local guides",
    desc: "Private guides, walking tours, neighborhood experts.",
    keywords: ["local guide", "private tour", "walking tour", "city tour"],
  },

  // ✅ Added “all possible local experiences” (major groups)
  {
    id: "food_drink",
    title: "Food & drink",
    desc: "Street food, tastings, brewery tours, wine bars, night markets.",
    keywords: ["street food tour", "food tour", "wine tasting", "beer tour", "night market"],
  },
  {
    id: "cooking_classes",
    title: "Cooking classes",
    desc: "Learn local dishes with a host, market-to-table experiences.",
    keywords: ["cooking class", "market tour", "local cuisine workshop"],
  },
  {
    id: "culture_history",
    title: "Culture & history",
    desc: "Museums, heritage sites, architecture walks, hidden history.",
    keywords: ["museum", "heritage", "architecture tour", "history walk"],
  },
  {
    id: "art_creative",
    title: "Art & creative workshops",
    desc: "Pottery, painting, crafts, photography, calligraphy.",
    keywords: ["workshop", "pottery class", "art class", "photography walk", "craft workshop"],
  },
  {
    id: "music_nightlife",
    title: "Music & nightlife",
    desc: "Live music, jazz bars, club nights, rooftop spots, pub crawls.",
    keywords: ["live music", "jazz bar", "rooftop", "nightlife", "pub crawl"],
  },
  {
    id: "outdoors_nature",
    title: "Outdoors & nature",
    desc: "Hikes, parks, viewpoints, beaches, sunrise/sunset spots.",
    keywords: ["hike", "nature walk", "viewpoint", "beach", "sunset spot"],
  },
  {
    id: "adventure",
    title: "Adventure",
    desc: "Kayak, cycling, climbing, surfing, zipline.",
    keywords: ["kayaking", "bike tour", "climbing", "surf lesson", "zipline"],
  },
  {
    id: "wellness",
    title: "Wellness",
    desc: "Spas, yoga, bathhouses, hammams, meditation.",
    keywords: ["spa", "massage", "yoga", "bathhouse", "hammam"],
  },
  {
    id: "day_trips",
    title: "Day trips & escapes",
    desc: "Nearby towns, nature escapes, scenic routes.",
    keywords: ["day trip", "nearby", "scenic", "train ride", "lake", "mountains"],
  },
  {
    id: "family_kids",
    title: "Family & kids",
    desc: "Aquariums, zoos, kid-friendly museums, fun parks.",
    keywords: ["family", "kids", "aquarium", "zoo", "theme park"],
  },
  {
    id: "shopping_markets",
    title: "Shopping & markets",
    desc: "Flea markets, vintage, crafts, local shopping streets.",
    keywords: ["market", "vintage", "shopping street", "flea market", "artisan"],
  },
  {
    id: "sports",
    title: "Sports & games",
    desc: "Local matches, stadium tours, bowling, arcade nights.",
    keywords: ["stadium tour", "local match", "sports bar", "arcade"],
  },
  {
    id: "unique_hidden",
    title: "Unique & hidden gems",
    desc: "Odd museums, secret viewpoints, local rituals, niche spots.",
    keywords: ["hidden gem", "secret spot", "unusual", "off the beaten path"],
  },
  {
    id: "volunteering",
    title: "Volunteering & community",
    desc: "Community kitchens, beach cleanups, local causes.",
    keywords: ["volunteer", "community", "cleanup", "local charity"],
  },
];

export default function MicroExperiencesModal({
  open,
  onClose,
  selectedDest,
  itinerary,
}) {
  const [activeCatId, setActiveCatId] = useState("popup_events");
  const [searchText, setSearchText] = useState("");

  const destName = selectedDest?.name || "";
  const country = selectedDest?.country || "";
  const baseLocation = destName || country || "your destination";

  // pull a few “anchors” from itinerary to personalize searches
  const itineraryAnchors = useMemo(() => {
    const names = new Set();
    (itinerary || []).forEach((d) => {
      if (d?.morning) names.add(d.morning);
      if (d?.evening) names.add(d.evening);
    });
    return Array.from(names).slice(0, 5);
  }, [itinerary]);

  const activeCat = useMemo(
    () => ALL_EXPERIENCE_CATEGORIES.find((c) => c.id === activeCatId) || ALL_EXPERIENCE_CATEGORIES[0],
    [activeCatId]
  );

  // default query: category keywords + destination
  const defaultQuery = useMemo(() => {
    const kw = (activeCat?.keywords || []).slice(0, 2).join(" ");
    return [kw, baseLocation].filter(Boolean).join(" ").trim();
  }, [activeCat, baseLocation]);

useEffect(() => {
  if (!open) return;

  // refresh search textbox when chip/category changes
  setSearchText(defaultQuery);
}, [activeCatId, defaultQuery, open]);

  const query = (searchText || defaultQuery).trim();

  // quick “suggested queries” to click
  const suggestedQueries = useMemo(() => {
    const list = [];

    // category-based
    (activeCat?.keywords || []).slice(0, 4).forEach((k) => {
      list.push(`${k} ${baseLocation}`.trim());
    });

    // itinerary-based (high relevance)
    itineraryAnchors.slice(0, 3).forEach((p) => {
      list.push(`${activeCat?.title || "experiences"} near ${p} ${baseLocation}`.trim());
    });

    // de-dupe
    return Array.from(new Set(list)).slice(0, 8);
  }, [activeCat, itineraryAnchors, baseLocation]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              Local Experiences
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-3">
              Local Experiences in {selectedDest?.name || "your destination"}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Find pop-ups, tours, classes, nightlife, and hidden gems—fast.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {ALL_EXPERIENCE_CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                active={c.id === activeCatId}
                onClick={() => setActiveCatId(c.id)}
              >
                {c.title}
              </Chip>
            ))}
          </div>

          {/* Active category summary */}
          <div className="rounded-2xl border bg-slate-50 p-5">
            <div className="text-lg font-extrabold text-slate-900">
              {activeCat.title}
            </div>
            <div className="text-sm text-slate-600 mt-1">{activeCat.desc}</div>

            {/* Search box */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={`Search e.g. "${defaultQuery}"`}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border bg-white text-sm font-semibold"
                />
              </div>

             <button
  type="button"
  onClick={() => {
    // example: recenter map or reuse as search anchor
    setSearchText(`${selectedDest.name}, ${selectedDest.country}`);
  }}
  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
>
  <MapPin className="w-4 h-4" />
  {selectedDest.name}
</button>

            </div>

            {/* Suggested searches */}
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedQueries.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSearchText(q)}
                  className="px-3 py-1.5 rounded-full border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  title="Use this search"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Providers */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-lg font-extrabold text-slate-900">
              Search providers
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Opens in a new tab with your search pre-filled.
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <ProviderButton icon={SiGooglemaps} label="Google Maps" href={buildSearchUrl("maps", query)} />
              <ProviderButton icon={SiEventbrite} label="Eventbrite" href={buildSearchUrl("eventbrite", query)} />
              <ProviderButton icon={SiMeetup} label="Meetup" href={buildSearchUrl("meetup", query)} />

              {/* GetYourGuide: no Si icon available in react-icons/si → fallback */}
              <ProviderButton icon={Compass} label="GetYourGuide" href={buildSearchUrl("getyourguide", query)} />

              {/* Viator: fallback (safe) */}
              <ProviderButton icon={Route} label="Viator" href={buildSearchUrl("viator", query)} />

              <ProviderButton icon={SiAirbnb} label="Airbnb Experiences" href={buildSearchUrl("airbnb", query)} />
              <ProviderButton icon={SiKlook} label="Klook" href={buildSearchUrl("klook", query)} />

            </div>

            {/* Quick note */}
            <div className="mt-4 text-xs text-slate-500">
              Tip: For the most accurate results, add your dates or a neighborhood name.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Works best with your itinerary places—try “near {itineraryAnchors?.[0] || "your first stop"}”.
          </div>
        </div>
      </div>
    </div>
  );
}
