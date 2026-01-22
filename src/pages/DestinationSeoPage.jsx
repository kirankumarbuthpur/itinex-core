import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { applyPageSEO } from "../utils/seo";

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function DestinationSeoPage() {
  const { slug } = useParams();
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    fetch("/destinations.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setDestinations(Array.isArray(d) ? d : []))
      .catch(() => setDestinations([]));
  }, []);

  const match = useMemo(() => {
    return destinations.find((d) => slugify(`${d.name}-${d.country}`) === slug);
  }, [destinations, slug]);

  useEffect(() => {
    const name = match?.name ? `${match.name}, ${match.country}` : "Destination";
    applyPageSEO({
      title: `${name} Itinerary Planner — Itinex`,
      description: `Plan a trip to ${name} with Itinex. Build a weather-aware itinerary, explore attractions, and save/share your plan.`,
    });
  }, [match]);

  const name = match?.name ? `${match.name}, ${match.country}` : slug?.replace(/-/g, " ");

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold mb-4">{name} Itinerary Planner</h1>

      <p className="text-slate-700 mb-8">
        Build a weather-aware itinerary for {name}. Use Itinex to create a day-by-day plan, explore real places,
        and export to PDF or calendar.
      </p>

      <div className="flex gap-3 flex-wrap">
        <Link
          to="/destinations"
          className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 font-semibold"
        >
          Explore destinations
        </Link>
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-itinex-primary text-white hover:opacity-90 font-semibold"
        >
          Start planning
        </Link>
      </div>
    </section>
  );
}
