import React, { useEffect } from "react";
import { Mail } from "lucide-react";
import { applyPageSEO } from "../utils/seo";

const EMAIL = "buthpur@itinex.net";

export default function AdvertisePage() {
  useEffect(() => {
    applyPageSEO({
      title: "Advertise with Itinex — Reach travelers while they plan",
      description:
        "Advertise on Itinex to reach high-intent travelers planning trips. Contact us for placements, sponsorships, and partnerships.",
    });
  }, []);

  const href =
    `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(EMAIL)}` +
    `&su=${encodeURIComponent("Advertising with Itinex")}` +
    `&body=${encodeURIComponent("Hi Itinex Team,\n\nI am interested in advertising on Itinex.\n\n")}`;

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold mb-4">Advertise with Itinex</h1>

      <p className="text-slate-700 mb-6">
        Reach travelers at the exact moment they plan their trips. We offer destination-targeted
        placements and high-intent traffic.
      </p>

      <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-8">
        <li>Destination-targeted placements</li>
        <li>High-intent travelers</li>
        <li>Premium brand exposure</li>
      </ul>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="
          inline-flex items-center gap-2
          px-4 py-2 rounded-md
          bg-itinex-primary text-white text-sm font-semibold
          hover:opacity-95 transition-all duration-200
          hover:scale-[1.03]
          hover:shadow-[0_0_0_3px_rgba(16,185,129,0.25),0_10px_25px_-10px_rgba(16,185,129,0.6)]
          active:scale-[0.99]
        "
      >
        <Mail className="w-4 h-4" />
        Advertise with Itinex
      </a>
    </section>
  );
}
