// src/FixMyDay.js
import React, { useMemo, useState } from "react";
import { Sparkles, RefreshCw, ShieldCheck, Coins, Flame, X } from "lucide-react";

/**
 * FixMyDay
 * - Repairs a single day (morning/evening) without duplicates
 * - Avoids repeating places across entire itinerary when possible
 * - Produces optimistic, calming suggestions
 *
 * Props:
 * @param {boolean} open
 * @param {function} onClose
 * @param {Array} itinerary - array of day objects { day, morning, evening, condition, ... }
 * @param {function} setItinerary - setter from parent
 * @param {object|null} attractionsForTrip - { sunny:[], cloudy:[], rainy:[] } pools
 * @param {string} destinationName - used for friendly text
 */
export default function FixMyDay({
  open,
  onClose,
  itinerary,
  setItinerary,
  attractionsForTrip,
  destinationName = "your trip",
}) {
  const [dayNumber, setDayNumber] = useState(() => (itinerary?.[0]?.day ? itinerary[0].day : 1));
  const [mode, setMode] = useState("easy"); // easy | budget | popular
  const [focus, setFocus] = useState("both"); // morning | evening | both

  const dayOptions = useMemo(() => {
    return (itinerary || []).map((d) => ({
      value: d.day,
      label: `Day ${d.day} • ${d.date || ""}`.trim(),
    }));
  }, [itinerary]);

  const selectedDay = useMemo(() => {
    return (itinerary || []).find((d) => d.day === Number(dayNumber)) || null;
  }, [itinerary, dayNumber]);

  const canRun = Boolean(
    open &&
      selectedDay &&
      Array.isArray(itinerary) &&
      itinerary.length > 0 &&
      attractionsForTrip &&
      typeof attractionsForTrip === "object"
  );

  if (!open) return null;

  const toneLine = getOptimisticLine(mode);

  const applyFix = () => {
    if (!canRun) return;

    const fixed = buildFixForDay({
      itinerary,
      dayObj: selectedDay,
      attractionsForTrip,
      mode,
      focus,
    });

    if (!fixed) return;

    setItinerary((prev) =>
      (prev || []).map((d) => (d.day === selectedDay.day ? { ...d, ...fixed } : d))
    );
  };

  const applyShuffle = () => {
    if (!canRun) return;

    // Shuffle morning/evening (only if it wouldn't cause duplicates)
    setItinerary((prev) => {
      const list = prev || [];
      const idx = list.findIndex((d) => d.day === selectedDay.day);
      if (idx === -1) return list;

      const day = list[idx];
      const m = day.morning;
      const e = day.evening;

      // If swapping makes them equal, skip
      if (!m || !e || m === e) return list;

      // Also avoid causing duplicates elsewhere
      const usedElsewhere = collectUsedPlaces(list, day.day);
      if (usedElsewhere.has(m) || usedElsewhere.has(e)) {
        // swapping doesn’t change set, so it's fine. Keep it simple:
      }

      const nextDay = { ...day, morning: e, evening: m };

      // Still ensure no same-slot duplicate within day
      if (nextDay.morning === nextDay.evening) return list;

      const out = list.slice();
      out[idx] = nextDay;
      return out;
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fix my day
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              Let’s make Day {selectedDay?.day || ""} feel smoother ✨
            </div>
            <div className="mt-1 text-sm text-slate-600">
              {toneLine} We’ll avoid repeats and keep morning + evening distinct.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Close"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border p-4 bg-slate-50">
              <div className="text-xs font-semibold text-slate-600">Choose day</div>
              <select
                value={dayNumber}
                onChange={(e) => setDayNumber(Number(e.target.value))}
                className="mt-2 w-full px-3 py-2 rounded-lg border bg-white text-sm"
              >
                {dayOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border p-4 bg-slate-50">
              <div className="text-xs font-semibold text-slate-600">Repair style</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <ModeChip active={mode === "easy"} onClick={() => setMode("easy")} icon={Sparkles} label="Easy & calm" />
                <ModeChip active={mode === "budget"} onClick={() => setMode("budget")} icon={Coins} label="Budget-friendly" />
                <ModeChip active={mode === "popular"} onClick={() => setMode("popular")} icon={Flame} label="Popular picks" />
              </div>
            </div>

            <div className="rounded-xl border p-4 bg-slate-50">
              <div className="text-xs font-semibold text-slate-600">Fix</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <SmallChip active={focus === "both"} onClick={() => setFocus("both")} label="Both" />
                <SmallChip active={focus === "morning"} onClick={() => setFocus("morning")} label="Morning" />
                <SmallChip active={focus === "evening"} onClick={() => setFocus("evening")} label="Evening" />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border overflow-hidden">
            <div className="p-4 bg-white border-b">
              <div className="text-sm font-extrabold text-slate-900">
                Current plan for Day {selectedDay?.day}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Destination: <span className="font-semibold">{destinationName}</span>
                {selectedDay?.condition ? (
                  <>
                    {" "}• Weather vibe: <span className="font-semibold capitalize">{selectedDay.condition}</span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <PreviewCard title="Morning" value={selectedDay?.morning} />
              <PreviewCard title="Evening" value={selectedDay?.evening} />
            </div>
          </div>

          {/* Warnings */}
          {!attractionsForTrip ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex gap-2">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              Attractions data isn’t ready yet — generate an itinerary first, then use Fix My Day.
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <button
              type="button"
              onClick={applyShuffle}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold"
              title="Swap morning and evening (only if safe)"
            >
              <RefreshCw className="w-4 h-4" />
              Swap
            </button>

            <button
              type="button"
              onClick={applyFix}
              disabled={!canRun}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold
                         bg-gradient-to-r from-itinex-secondary to-itinex-primary
                         hover:opacity-95 disabled:opacity-60"
              title="Repair this day with fresh suggestions"
            >
              <Sparkles className="w-4 h-4" />
              Fix my day
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Tip: If you don’t love the result, tap <span className="font-semibold">Fix my day</span> again — it will propose different options while avoiding repeats.
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   UI atoms
========================= */

function ModeChip({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition",
        active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function SmallChip({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-2 rounded-xl border text-sm font-semibold transition",
        active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function PreviewCard({ title, value }) {
  return (
    <div className="p-5 bg-white">
      <div className="text-xs uppercase tracking-wide font-semibold text-slate-500">
        {title}
      </div>
      <div className="mt-1 text-lg font-extrabold text-slate-900">
        {value || "—"}
      </div>
      <div className="mt-2 text-sm text-slate-600">
        {title === "Morning"
          ? "A gentle start that sets the tone."
          : "A relaxing finish you’ll feel good about."}
      </div>
    </div>
  );
}

/* =========================
   Core logic
========================= */

/**
 * Builds a repaired version of morning/evening for a single day.
 * Returns partial day object: { morning, evening }
 */
function buildFixForDay({ itinerary, dayObj, attractionsForTrip, mode, focus }) {
  if (!dayObj || !attractionsForTrip || !itinerary?.length) return null;

  const used = collectUsedPlaces(itinerary, dayObj.day); // used everywhere except this day
  const condition = dayObj.condition || "cloudy";

  // Candidate pools:
  const preferred = (attractionsForTrip[condition] || []).slice();
  const alternates = ["sunny", "cloudy", "rainy"]
    .filter((c) => c !== condition)
    .flatMap((c) => attractionsForTrip[c] || []);

  // Apply "mode" shaping (no external data — safe heuristics)
  const pool = shapePoolByMode([...preferred, ...alternates], mode);

  const currentMorning = dayObj.morning || "";
  const currentEvening = dayObj.evening || "";

  // Helper to pick a new unique item
  const pick = (blockedSet, avoidValue) => {
    const candidates = pool.filter((x) => x && !blockedSet.has(x) && x !== avoidValue);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const next = { morning: currentMorning, evening: currentEvening };

  // Build local blocks: avoid repeats across itinerary + avoid same within day
  const blocked = new Set(used);
  // Don’t block the current ones unless we’re specifically replacing them
  // (we want to allow keeping an activity sometimes if focus is single slot)

  if (focus === "morning" || focus === "both") {
    blocked.add(currentEvening); // ensure new morning != evening
    const m = pick(blocked, currentMorning);
    if (m) next.morning = m;
  }

  if (focus === "evening" || focus === "both") {
    // Recompute blocked to ensure no duplicates with updated morning
    const blockedEvening = new Set(used);
    blockedEvening.add(next.morning);
    const e = pick(blockedEvening, currentEvening);
    if (e) next.evening = e;
  }

  // Final safety: ensure morning/evening not equal
  if (next.morning && next.evening && next.morning === next.evening) {
    // Try to fix evening first
    const blockedEvening = new Set(used);
    blockedEvening.add(next.morning);
    const e2 = pick(blockedEvening, next.evening);
    if (e2) next.evening = e2;
  }

  // If still equal, give up gracefully
  if (next.morning && next.evening && next.morning === next.evening) return null;

  return next;
}

/**
 * Collect places used in itinerary excluding a given day number.
 */
function collectUsedPlaces(itinerary, excludeDayNumber) {
  const used = new Set();
  (itinerary || []).forEach((d) => {
    if (!d || d.day === excludeDayNumber) return;
    if (d.morning) used.add(d.morning);
    if (d.evening) used.add(d.evening);
  });
  return used;
}

/**
 * Simple “mode shaping” without external metadata:
 * - budget: prefer shorter names / parks / markets / walks (keyword heuristic)
 * - popular: prefer famous-ish keywords
 * - easy: neutral but slightly prefers “calm” words
 */
function shapePoolByMode(list, mode) {
  const xs = (list || []).filter(Boolean);

  const score = (name) => {
    const n = String(name).toLowerCase();

    const budgetWords = ["park", "market", "walk", "garden", "square", "beach", "view", "bridge", "street"];
    const popularWords = ["museum", "cathedral", "castle", "palace", "tower", "temple", "basilica", "gallery", "opera", "fort"];
    const calmWords = ["garden", "park", "river", "old town", "view", "promenade", "harbour", "lake"];

    let s = 0;

    if (mode === "budget") {
      if (budgetWords.some((w) => n.includes(w))) s += 6;
      if (n.length <= 18) s += 2;
    }

    if (mode === "popular") {
      if (popularWords.some((w) => n.includes(w))) s += 6;
      if (n.includes("museum")) s += 2;
    }

    if (mode === "easy") {
      if (calmWords.some((w) => n.includes(w))) s += 4;
      if (n.length <= 22) s += 1;
    }

    // tiny randomness to vary results a bit
    s += Math.random();
    return s;
  };

  // Sort by score desc
  return xs
    .map((name) => ({ name, s: score(name) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.name);
}

function getOptimisticLine(mode) {
  if (mode === "budget") return "We’ll keep it light on spending and heavy on joy.";
  if (mode === "popular") return "We’ll nudge you toward the highlights — without the stress.";
  return "We’ll keep it calm, simple, and pleasantly paced.";
}
