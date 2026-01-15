// src/components/SkyscannerTopAd.jsx
import React from "react";
import { Plane } from "lucide-react";

export default function SkyscannerTopAd({
  href = "https://www.skyscanner.net/",
  className = "",
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "block w-full rounded-2xl overflow-hidden",
        "group cursor-pointer transition-transform",
        "hover:scale-[1.005]",
        className,
      ].join(" ")}
      aria-label="Skyscanner — search flights"
      title="Open Skyscanner"
    >
      <div className="relative h-[90px] w-full">
        {/* === Skyscanner brand background === */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #00A3E0 0%, #0062E3 55%, #1D4ED8 100%)",
          }}
        />

        {/* Soft light overlay */}
        <div className="absolute inset-0 bg-white/10" />

        {/* Subtle dot texture */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />

        {/* Soft corner highlight */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between gap-4 px-4 md:px-6">
          {/* Left: Copy */}
          <div className="min-w-0 text-white">
            <div className="flex items-center gap-2">
              <span
                className="
                  inline-flex items-center rounded-full
                  px-2.5 py-1 text-[11px] font-extrabold
                  bg-white/20 backdrop-blur
                  border border-white/30
                "
              >
                Skyscanner
              </span>
              <span className="hidden sm:inline text-xs opacity-90">
                Flights • Hotels • Car hire
              </span>
            </div>

            <div className="mt-1 text-base md:text-lg font-extrabold leading-tight truncate">
              Compare flights worldwide
            </div>

            <div className="mt-0.5 text-xs md:text-sm opacity-90 truncate">
              Find the best route, dates & prices — book direct.
            </div>
          </div>

          {/* Right: SVG + CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center justify-center">
              <GlobeFlightSVG />
            </div>

            {/* CTA */}
            <div
              className="
                inline-flex items-center gap-2
                rounded-xl px-4 py-2
                text-sm font-extrabold
                bg-white text-sky-700
                shadow-md
                group-hover:shadow-lg
                transition
              "
            >
              <span>Search flights</span>
              <Plane
                className="
                  w-4 h-4 rotate-45 text-sky-600
                  group-hover:translate-x-1
                  group-hover:-translate-y-0.5
                  transition-transform duration-300
                "
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Bottom highlight */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/40" />
      </div>
    </a>
  );
}
function GlobeFlightSVG() {
  return (
    <svg
      width="240"
      height="80"
      viewBox="0 0 240 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
      aria-hidden="true"
    >
      <defs>
        {/* Glow */}
        <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Ocean */}
        <radialGradient id="ocean2" cx="45%" cy="40%" r="70%">
          <stop offset="0" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.06)" />
        </radialGradient>

        {/* Route gradient */}
        <linearGradient id="route2" x1="70" y1="0" x2="238" y2="0">
          <stop offset="0" stopColor="rgba(255,255,255,0)" />
          <stop offset="0.35" stopColor="rgba(255,255,255,0.75)" />
          <stop offset="0.7" stopColor="rgba(219,234,254,0.95)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        {/* Plane gradient for subtle highlight */}
        <linearGradient id="planeGrad" x1="-12" y1="-6" x2="16" y2="6">
          <stop offset="0" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.55)" />
        </linearGradient>

        {/* Motion path */}
        <path
          id="motionPath"
          d="M84 62 C 120 14, 170 10, 230 36"
        />
      </defs>

      {/* ====== STARFIELD (parallax) ====== */}
      <g opacity="0.55">
        <g>
          {[
            [90, 12, 1.2],
            [120, 8, 1.0],
            [160, 14, 1.3],
            [200, 10, 1.1],
            [220, 18, 1.0],
            [140, 26, 1.1],
            [188, 22, 1.2],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="rgba(255,255,255,0.85)">
              <animate
                attributeName="opacity"
                values="0.25;0.85;0.25"
                dur={`${2.4 + (i % 3) * 0.6}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>

        {/* drifting layer */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -10 2; 0 0"
            dur="6s"
            repeatCount="indefinite"
          />
          <circle cx="110" cy="20" r="0.9" fill="rgba(255,255,255,0.65)" />
          <circle cx="175" cy="6" r="1.0" fill="rgba(255,255,255,0.55)" />
          <circle cx="215" cy="24" r="0.8" fill="rgba(255,255,255,0.6)" />
        </g>
      </g>

      {/* ====== GLOBE ====== */}
      <g transform="translate(10, 8)">
        {/* Outer sphere */}
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="url(#ocean2)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.4"
        />

        {/* Rotating grid (gives "live" feel) */}
        <g opacity="0.75">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 32 32"
            to="360 32 32"
            dur="9s"
            repeatCount="indefinite"
          />

          {/* meridians */}
          <ellipse
            cx="32"
            cy="32"
            rx="18"
            ry="30"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="8"
            ry="30"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />

          {/* parallels */}
          <ellipse
            cx="32"
            cy="32"
            rx="30"
            ry="18"
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="30"
            ry="8"
            fill="none"
            stroke="rgba(255,255,255,0.30)"
            strokeWidth="1"
          />
        </g>

        {/* Continents (fixed, slightly translucent) */}
        <path
          d="M22 20c3-3 8-4 11-1 2 2 1 5-1 6-3 1-3 4-1 6 1 1 0 4-3 4-6 0-10-6-6-15Z"
          fill="rgba(52, 211, 153, 0.95)"
        />
        <path
          d="M40 34c3 1 5 3 4 6-1 2-3 2-4 3-2 1-2 4-5 4-3 0-4-3-3-5 1-3 3-3 4-5 1-2 1-3 4-3Z"
          fill="rgba(34, 197, 94, 0.92)"
        />

        {/* Soft specular highlight */}
        <circle cx="22" cy="22" r="14" fill="rgba(255,255,255,0.08)" />
      </g>

      {/* ====== ROUTE (flowing dashed line) ====== */}
      <path
        d="M84 62 C 120 14, 170 10, 230 36"
        stroke="url(#route2)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#routeGlow)"
        opacity="0.95"
        strokeDasharray="7 7"
      >
        {/* makes it feel like data is flowing */}
        <animate
          attributeName="stroke-dashoffset"
          values="0;-28"
          dur="1.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.6;1;0.6"
          dur="2.8s"
          repeatCount="indefinite"
        />
      </path>

      {/* Route nodes */}
      <g opacity="0.95">
        <circle cx="84" cy="62" r="2.3" fill="rgba(255,255,255,0.95)" />
        <circle cx="150" cy="18" r="2.1" fill="rgba(255,255,255,0.7)" />
        <circle cx="230" cy="36" r="2.3" fill="rgba(255,255,255,0.95)" />
      </g>

     {/* ====== ROCKET (moves along route) ====== */}
<g>
  {/* shadow */}
  <ellipse rx="6" ry="2.6" fill="rgba(15, 23, 42, 0.25)">
    <animateMotion dur="2.6s" repeatCount="indefinite" rotate="auto">
      <mpath href="#motionPath" />
    </animateMotion>
  </ellipse>

  {/* rocket */}
  <g>
    {/* flame */}
    <path
      d="M-10 0 C -14 -2, -16 0, -14 2 Z"
      fill="#F97316"
      opacity="0.9"
    >
      <animate
        attributeName="opacity"
        values="0.6;1;0.6"
        dur="0.3s"
        repeatCount="indefinite"
      />
    </path>

    {/* body */}
    <path
      d="
        M0 -6
        C6 -6, 12 -2, 14 0
        C12 2, 6 6, 0 6
        L-6 4
        L-8 0
        L-6 -4
        Z
      "
      fill="rgba(255,255,255,0.95)"
    />

    {/* window */}
    <circle cx="4" cy="0" r="1.8" fill="#1D4ED8" />

    {/* fins */}
    <path d="M-2 -6 L-6 -10 L-4 -4 Z" fill="#E5E7EB" />
    <path d="M-2 6 L-6 10 L-4 4 Z" fill="#E5E7EB" />

    {/* motion */}
    <animateMotion dur="2.6s" repeatCount="indefinite" rotate="auto">
      <mpath href="#motionPath" />
    </animateMotion>
  </g>
</g>


      {/* ====== DESTINATION PIN (pulse) ====== */}
      <g transform="translate(230, 36)">
        {/* pulse ring */}
        <circle r="10" fill="rgba(255,255,255,0.18)">
          <animate attributeName="r" values="7;12;7" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.25;0.05;0.25" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* pin */}
        <path
          d="M7 2.5c0 3.8-3.3 7.4-5.4 9a1.1 1.1 0 0 1-1.2 0C-1.7 9.9-5 6.3-5 2.5a6 6 0 0 1 12 0Z"
          fill="rgba(255,255,255,0.95)"
        />
        <circle cx="1" cy="2.8" r="2" fill="rgba(29, 78, 216, 0.95)" />
      </g>
    </svg>
  );
}

