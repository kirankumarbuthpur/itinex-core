// src/TravelStoryModal.js
import React, { useEffect, useRef, useState } from "react";

export default function TravelStoryModal({
  open,
  onClose,

  // routing-ish
  step,

  // trip info
  selectedDest,
  useDateRange,
  startDate,
  endDate,
  days,

  // data
  itinerary,
  attractionImages,
  storySummaries,
  loadingStory,

  // helpers/utils
  svgPlaceholderDataUrl,
  buildSixLineStory,
  slugify,
  waitForImages,

  // sharing / pdf
  shareUrl,
  copyToClipboard,
  setError,
  exportingPdf,
  setExportingPdf,

  // refs + libs
  storyRef,
  html2canvas,
  jsPDF,
}) {
  const panelRef = useRef(null);

  // Animation mount/unmount control
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Mount when opened
  useEffect(() => {
    if (open) {
      setMounted(true);
      // next tick so transitions apply
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 200); // match duration-200
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Click outside close
  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (!panel.contains(e.target)) onClose?.();
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[70] flex items-center justify-center p-4",
        "transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Panel */}
      <div
        ref={panelRef}
        className={[
          "relative w-full max-w-4xl",
          "rounded-2xl bg-white shadow-2xl overflow-hidden",
          "transition-transform duration-200",
          visible ? "scale-100 translate-y-0" : "scale-[0.98] translate-y-1",
        ].join(" ")}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                Travel Story
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {selectedDest?.name}
              </h2>
              <div className="mt-1 text-sm text-slate-600">
                {useDateRange ? `${startDate} → ${endDate}` : `${days} day(s)`}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const u = new URL(shareUrl || window.location.href);
                  u.searchParams.set("view", "story");
                  copyToClipboard(u.toString());
                  setError("Story link copied to clipboard.");
                }}
                className="px-4 py-2 rounded-lg bg-itinex-accent text-white hover:opacity-90 text-sm font-semibold"
              >
                Share Story
              </button>

              <button
                onClick={async () => {
                  if (!storyRef?.current) return;

                  setExportingPdf(true);
                  try {
                    await waitForImages(storyRef.current);

                    const canvas = await html2canvas(storyRef.current, {
                      scale: 2,
                      useCORS: true,
                      allowTaint: true,
                      backgroundColor: "#ffffff",
                    });

                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF("p", "pt", "a4");

                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();

                    const imgWidth = pageWidth;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    let heightLeft = imgHeight;
                    let position = 0;

                    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;

                    while (heightLeft > 0) {
                      position = position - pageHeight;
                      pdf.addPage();
                      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                      heightLeft -= pageHeight;
                    }

                    pdf.save(`story-${slugify(selectedDest?.name || "trip")}.pdf`);
                  } catch (e) {
                    setError(`Story PDF export failed: ${e?.message || "unknown error"}`);
                  } finally {
                    setExportingPdf(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold"
              >
                {exportingPdf ? "Exporting…" : "Download Story PDF"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold"
                title="Close"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div className="max-h-[80vh] overflow-y-auto">
          {step === "itinerary" ? (
            <div ref={storyRef} className="p-6 space-y-8">
              {itinerary.map((d) => (
                <div key={d.day} className="rounded-2xl border overflow-hidden">
                  <div className="p-5 bg-slate-50 border-b">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="font-extrabold text-slate-900">
                        Day {d.day}{" "}
                        <span className="text-slate-500 font-semibold">• {d.date}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        {d.condition} • {d.tempMax}°C / {d.tempMin}°C • Rain {d.precipMm}mm
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Morning */}
                    <div className="relative">
                      <img
                        src={attractionImages[d.morning] || svgPlaceholderDataUrl(d.morning)}
                        alt={d.morning}
                        className="w-full h-72 object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = svgPlaceholderDataUrl(d.morning);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 p-4">
                        <div className="text-white/80 text-xs font-semibold">Morning</div>
                        <div className="text-white text-lg font-extrabold">{d.morning}</div>
                      </div>
                    </div>

                    {/* Evening */}
                    <div className="relative">
                      <img
                        src={attractionImages[d.evening] || svgPlaceholderDataUrl(d.evening)}
                        alt={d.evening}
                        className="w-full h-72 object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = svgPlaceholderDataUrl(d.evening);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 p-4">
                        <div className="text-white/80 text-xs font-semibold">Evening</div>
                        <div className="text-white text-lg font-extrabold">{d.evening}</div>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const lines = buildSixLineStory({
                      destinationName: selectedDest?.name,
                      morningName: d.morning,
                      eveningName: d.evening,
                      morningExtract: storySummaries[d.morning]?.extract,
                      eveningExtract: storySummaries[d.evening]?.extract,
                    });

                    return (
                      <div className="p-5 text-sm text-slate-700 leading-relaxed">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                          Today’s story
                        </div>

                        <div className="space-y-1">
                          {lines.map((line, i) => (
                            <div
                              key={i}
                              className="whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{ __html: line }}
                            />
                          ))}
                        </div>

                        {loadingStory && (
                          <div className="mt-2 text-xs text-slate-500">
                            Loading richer place details…
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}

              <div className="rounded-2xl border p-6 bg-gradient-to-br from-itinex-secondary to-itinex-primary text-white">
                <div className="text-xl font-extrabold">The End ✨</div>
                <div className="mt-1 text-sm opacity-90">
                  Share this story with friends or export it as a PDF.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-sm text-slate-600">
              Story is available once your itinerary is generated.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
