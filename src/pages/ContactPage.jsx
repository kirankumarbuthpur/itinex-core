import React, { useEffect } from "react";
import { Mail } from "lucide-react";
import { applyPageSEO } from "../utils/seo";

const EMAIL = "buthpur@itinex.net";

function GmailButton({ subject, body, label }) {
  const href =
    `https://mail.google.com/mail/?view=cm` +
    `&to=${encodeURIComponent(EMAIL)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-flex items-center gap-2
        px-4 py-2 rounded-md
        bg-itinex-primary text-white text-sm font-semibold
        hover:opacity-95
        transition-all duration-200
        hover:scale-[1.03]
        hover:shadow-[0_0_0_3px_rgba(16,185,129,0.25),0_10px_25px_-10px_rgba(16,185,129,0.6)]
        active:scale-[0.99]
        focus:outline-none focus:ring-2 focus:ring-itinex-primary/60 focus:ring-offset-2
      "
    >
      <Mail className="w-4 h-4" />
      {label}
    </a>
  );
}

export default function ContactPage() {
  useEffect(() => {
    applyPageSEO({
      title: "Contact Itinex — Support, Partnerships, Advertising",
      description:
        "Contact Itinex for support, partnerships, or advertising. Email our team directly and we’ll get back to you.",
    });
  }, []);

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold mb-4">Contact Us</h1>

      <p className="text-slate-700 mb-8">
        We’d love to hear from you. Whether you have feedback, feature requests,
        partnership inquiries, or technical questions, our team is here to help.
      </p>

      <div className="space-y-6">
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold mb-1">General Support</h3>
          <p className="text-slate-600 text-sm mb-3">{EMAIL}</p>
          <GmailButton
            subject="Itinex Support"
            body="Hi Itinex Team,%0A%0A"
            label="Email Support"
          />
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold mb-1">Business & Partnerships</h3>
          <p className="text-slate-600 text-sm mb-3">{EMAIL}</p>
          <GmailButton
            subject="Partnership Inquiry"
            body="Hi Itinex Team,%0A%0AI'm interested in partnering with Itinex.%0A%0A"
            label="Contact Partnerships"
          />
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold mb-1">Advertising</h3>
          <p className="text-slate-600 text-sm mb-3">{EMAIL}</p>
          <GmailButton
            subject="Advertising with Itinex"
            body="Hi Itinex Team,%0A%0AI am interested in advertising on Itinex.%0A%0A"
            label="Advertise with Itinex"
          />
        </div>
      </div>
    </section>
  );
}
