import React, { useEffect } from "react";
import { applyPageSEO } from "../utils/seo";

export default function AboutPage() {
  useEffect(() => {
    applyPageSEO({
      title: "About Itinex — Plan less. Explore more.",
      description:
        "Itinex is a smart travel itinerary planner that builds weather-aware trip plans around real attractions, maps, budgets, and sharing.",
    });
  }, []);

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold mb-4">About Itinex</h1>
      <p className="text-slate-700 leading-relaxed mb-4">
        Itinex helps travelers plan trips faster with smart, weather-aware itineraries built around real places.
        Choose a destination, pick dates, and get a structured plan you can export, share, and customize.
      </p>

      <div className="mt-8 space-y-3 text-slate-700">
        <h2 className="text-xl font-bold">What you can do</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Generate day-by-day itineraries based on forecast + seasonality</li>
          <li>Explore destinations via grid or map</li>
          <li>Save trips in your browser and reopen anytime</li>
          <li>Export to PDF or calendar (.ics)</li>
          <li>Collaborate with shareable links</li>
        </ul>
      </div>
    </section>
  );
}
