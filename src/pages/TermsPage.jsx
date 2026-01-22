import React, { useEffect } from "react";
import { applyPageSEO } from "../utils/seo";

export default function TermsPage() {
  useEffect(() => {
    applyPageSEO({
      title: "Terms of Service — Itinex",
      description:
        "Read Itinex’s terms of service. Learn how to use the platform responsibly and what rules apply.",
    });
  }, []);

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 text-slate-700">
      <h1 className="text-3xl font-extrabold mb-4">Terms of Service</h1>

      <p className="mb-6">
        By using Itinex, you agree to use the platform responsibly and comply with applicable laws.
      </p>

      <h2 className="text-lg font-bold mt-8 mb-2">Acceptable use</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Do not misuse the service or attempt to disrupt it</li>
        <li>Do not upload harmful, illegal, or abusive content</li>
        <li>Respect other users when collaborating on shared trips</li>
      </ul>

      <h2 className="text-lg font-bold mt-8 mb-2">No warranties</h2>
      <p>
        Itinex provides planning tools “as-is”. Travel conditions (weather, closures, safety) can change—always verify
        details before you go.
      </p>
    </section>
  );
}
