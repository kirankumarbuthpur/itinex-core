import React, { useEffect } from "react";
import { applyPageSEO } from "../utils/seo";

export default function PrivacyPage() {
  useEffect(() => {
    applyPageSEO({
      title: "Privacy Policy — Itinex",
      description:
        "Read Itinex’s privacy policy. Learn what we store, why we store it, and how you can control your data.",
    });
  }, []);

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 text-slate-700">
      <h1 className="text-3xl font-extrabold mb-4">Privacy Policy</h1>

      <p className="mb-6">
        We respect your privacy. Itinex stores only essential data required to deliver travel planning features.
      </p>

      <h2 className="text-lg font-bold mt-8 mb-2">What we store</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Trips you save in your browser (LocalStorage)</li>
        <li>Optional shared trip identifiers for collaboration</li>
        <li>Reviews you submit (stored in our database)</li>
      </ul>

      <h2 className="text-lg font-bold mt-8 mb-2">Third-party services</h2>
      <p>
        We may use third-party APIs for maps, weather forecasts, and content enrichment. Those providers may receive
        technical request data required to fulfill features.
      </p>

      <h2 className="text-lg font-bold mt-8 mb-2">Your choices</h2>
      <p>
        You can delete saved trips by clearing them from the “Saved Trips” section or clearing site data in your browser.
      </p>
    </section>
  );
}
