import React from "react";
import {
  Sparkles,
  ShieldAlert,
  MapPinned,
  Compass,
  ChevronRight,
  Stars,
  Wand2,
  HeartHandshake,
} from "lucide-react";
import { useReveal } from "./hooks/useReveal";

function Reveal({ children, delayMs = 0 }) {
  const { ref, shown } = useReveal();
  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delayMs}ms` }}
      className={[
        "will-change-transform",
        shown ? "animate-revealUp" : "opacity-0 translate-y-3",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function GradientChip({ icon: Icon, children }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold",
        "text-white",
        "bg-white/15 backdrop-blur",
        "border border-white/35 shadow-sm",
      ].join(" ")}
    >
      <Icon className="w-4 h-4 text-white/95" />
      {children}
    </span>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  image,
}) {
  return (
<div className="group relative rounded-3xl overflow-hidden border border-white/20 bg-transparent shadow-md hover:shadow-xl transition flex flex-col h-full">

      {/* IMAGE HEADER */}
      {image ? (
        <div className="relative h-36 w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="
              absolute inset-0 w-full h-full object-cover
              brightness-110 contrast-110 saturate-110
              group-hover:scale-105
              transition-transform duration-700
            "
          />

          {/* Text readability overlay ONLY on bottom */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
        </div>
      ) : null}

      {/* CONTENT */}
<div className="relative p-5 bg-white flex flex-col flex-1">

  {/* Icon + Title Row */}
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
      <Icon className="w-5 h-5 drop-shadow-sm" />
    </div>

    <div className="text-base font-black text-slate-900 leading-tight">
      {title}
    </div>
  </div>

  {/* Description Below */}
  <div className="mt-2 text-sm text-slate-700 leading-relaxed flex-grow">
    {desc}
  </div>

</div>

    </div>
  );
}

function MiniDestinationPill({ label, badge, emoji }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/65 backdrop-blur shadow-sm hover:shadow-md transition px-4 py-3">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 pointer-events-none" />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <div className="text-sm font-extrabold text-slate-900">{label}</div>
        </div>
        {badge ? (
          <span className="text-[11px] font-extrabold px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function HomePage({
  onStartPlanning,
  onExploreDestinations,
  onScrollToHowItWorks,
}) {
  // ✅ Recommended hero image: desert highway / road-trip vibe
  const HERO_IMG =
    "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&w=1920";

  return (
    <div className="w-full">
      {/* HERO CANVAS */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/40 shadow-sm">
        {/* Hero background image */}
        <div
          className="absolute inset-0 bg-center bg-cover contrast-110 saturate-110"
          style={{ backgroundImage: `url('${HERO_IMG}')` }}
        />

        {/* ✅ Subtle overlay to guarantee contrast, but keep image clearly visible */}
        <div className="absolute inset-0" />

        {/* Optional: stronger overlay only behind text (keeps image clear elsewhere) */}
        <div className="absolute inset-x-0 top-0 h-[340px] bg-gradient-to-b from-black/45 to-black/0 pointer-events-none" />

        {/* animated blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 -left-28 w-72 h-72 rounded-full blur-3xl opacity-30 bg-sky-400 animate-blob" />
          <div
            className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full blur-3xl opacity-25 bg-emerald-400 animate-blob"
            style={{ animationDelay: "1.1s" }}
          />
          <div
            className="absolute top-16 right-12 w-56 h-56 rounded-full blur-3xl opacity-20 bg-indigo-400 animate-blob"
            style={{ animationDelay: "2.0s" }}
          />
          <div
            className="absolute bottom-10 left-10 w-48 h-48 rounded-full blur-3xl opacity-15 bg-amber-300 animate-blob"
            style={{ animationDelay: "2.6s" }}
          />
        </div>

        {/* subtle grid */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative p-6 sm:p-8">
          {/* floating badge row */}
          <div className="flex flex-wrap gap-2">
            <GradientChip icon={Sparkles}>AI itineraries</GradientChip>
            <GradientChip icon={ShieldAlert}>Safety tools</GradientChip>
            <GradientChip icon={MapPinned}>Nearby essentials</GradientChip>
            <GradientChip icon={Compass}>Experiences</GradientChip>
          </div>

          <h1 className="mt-6 text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]">
            Plan a trip that feels{" "}
            <span className="bg-[linear-gradient(90deg,#22c55e,#38bdf8,#a78bfa,#f59e0b)] bg-[length:240%_240%] bg-clip-text text-transparent animate-shimmer drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]">
              effortless
            </span>
            .
          </h1>

          <p className="mt-3 text-sm sm:text-base text-white/95 drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)] leading-relaxed max-w-xl">
            Build a weather-aware itinerary in minutes — with real places, emergency info,
            and nearby hospitals/pharmacies when you need them.
          </p>

          {/* CTA buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onStartPlanning}
              className={[
                "group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl",
                "bg-gradient-to-r from-sky-500",
                "text-white font-extrabold shadow-lg shadow-indigo-500/30",
                "hover:brightness-110 active:scale-[0.99] transition ring-2 ring-white/20",
              ].join(" ")}
            >
              <Wand2 className="w-5 h-5 group-hover:rotate-6 transition-transform" />
              Start planning
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onExploreDestinations}
              className={[
                "group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl",
                "border border-white/50 bg-white/15 backdrop-blur",
                "text-white font-extrabold hover:bg-white/20 active:scale-[0.99] transition",
              ].join(" ")}
            >
              <Compass className="w-5 h-5 group-hover:rotate-6 transition-transform" />
              Explore destinations
            </button>
          </div>

          <div className="mt-4 text-xs text-white/90 drop-shadow">
            Want the quick tour?{" "}
            <button
              type="button"
              onClick={onScrollToHowItWorks}
              className="font-extrabold text-emerald-200 hover:text-emerald-100 hover:underline"
            >
              See what’s inside ↓
            </button>
          </div>

          {/* trust strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "fast", label: "Fast plans", icon: Stars },
              { k: "safe", label: "Safer travel", icon: ShieldAlert },
              { k: "real", label: "Real places", icon: MapPinned },
              { k: "share", label: "Share & save", icon: HeartHandshake },
            ].map((x) => (
              <div
                key={x.k}
                className="rounded-2xl border border-white/30 bg-black/25 backdrop-blur px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <x.icon className="w-4 h-4 text-white/95" />
                  <div className="text-xs font-extrabold text-white/95">
                    {x.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mt-10">
  <Reveal>
    <div className="flex items-end justify-between gap-3 flex-wrap">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Everything you need, in one plan
        </h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
          Home gives you the value upfront — Destinations is where you browse & pick.
        </p>
      </div>
    </div>
  </Reveal>

  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">


    <Reveal delayMs={0}>
      <FeatureCard
        icon={Sparkles}
        title="Smart itineraries"
        desc="Morning + evening picks aligned to weather and real attractions."
        image="https://images.pexels.com/photos/3184454/pexels-photo-3184454.jpeg?auto=compress&cs=tinysrgb&w=800"
        tint="from-amber-400/20 to-rose-400/20"
      />
    </Reveal>

    <Reveal delayMs={90}>
      <FeatureCard
        icon={ShieldAlert}
        title="Emergency Hub"
        desc="Numbers + English + local phrases + pronunciation — ready when needed."
        image="https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=800"
        tint="from-red-400/20 to-orange-400/20"
      />
    </Reveal>

    <Reveal delayMs={180}>
      <FeatureCard
        icon={MapPinned}
        title="Nearby essentials"
        desc="Hospitals and pharmacies with route + distance in one tap."
        image="https://images.pexels.com/photos/3845766/pexels-photo-3845766.jpeg?auto=compress&cs=tinysrgb&w=800"
        tint="from-emerald-400/20 to-sky-400/20"
      />
    </Reveal>

    <Reveal delayMs={270}>
      <FeatureCard
        icon={Compass}
        title="Experiences"
        desc="Tours, events and things to do from trusted providers."
        image="https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800"
        tint="from-indigo-400/20 to-fuchsia-400/20"
      />
    </Reveal>

  </div>
</section>


      {/* TRENDING PREVIEW */}
      <section className="mt-12">
        <Reveal>
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Trending this week
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                A quick spark — browse the full list on Destinations.
              </p>
            </div>

            <button
              type="button"
              onClick={onExploreDestinations}
              className="text-sm font-extrabold text-indigo-700 hover:text-indigo-800 hover:underline"
            >
              View all →
            </button>
          </div>
        </Reveal>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Reveal delayMs={0}>
            <MiniDestinationPill label="Tokyo" badge="Most planned" emoji="🗼" />
          </Reveal>
          <Reveal delayMs={90}>
            <MiniDestinationPill label="Paris" badge="Trending" emoji="🥐" />
          </Reveal>
          <Reveal delayMs={180}>
            <MiniDestinationPill label="Dubai" badge="Hot flights" emoji="🌇" />
          </Reveal>
          <Reveal delayMs={270}>
            <MiniDestinationPill label="Barcelona" badge="Top rated" emoji="🏖️" />
          </Reveal>
        </div>

        <Reveal delayMs={340}>
          <div className="mt-6 rounded-3xl overflow-hidden border border-white/50 shadow-sm">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white">
              <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                <div>
                  <div className="text-base font-black">Ready to pick a destination?</div>
                  <div className="text-sm text-white/80 mt-1">
                    Browse countries, map view, reviews, and saved trips.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onExploreDestinations}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white text-slate-900 font-extrabold hover:opacity-95"
                >
                  Explore destinations <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
