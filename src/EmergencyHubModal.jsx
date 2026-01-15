import React, { useEffect, useMemo, useState } from "react";
import { X, Copy, Phone, Languages, AlertTriangle } from "lucide-react";

// expects country keys like "united kingdom", "france", etc.
const normKey = (s) => String(s || "").trim().toLowerCase();

function CopyButton({ text, onCopied }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-xs font-semibold"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const el = document.createElement("textarea");
          el.value = text;
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          document.body.removeChild(el);
        }
        onCopied?.();
      }}
      title="Copy"
    >
      <Copy className="w-4 h-4" />
      Copy
    </button>
  );
}

function FieldRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-sm font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

export default function EmergencyHubModal({
  open,
  onClose,
  selectedDest,

  // pass your emergency numbers object:
  // emergencyNumbers["france"] => { primary, police, fire, ... }
  emergencyNumbers = {},

  // pass phrases object (loaded from emergency_phrases.json):
  // emergencyPhrases["france"] => { languages: [...] }
  emergencyPhrases = {},
}) {
  const [copiedMsg, setCopiedMsg] = useState("");
  const [langIso, setLangIso] = useState("");

  const countryKey = useMemo(
    () => normKey(selectedDest?.country),
    [selectedDest?.country]
  );

  const numbers = emergencyNumbers?.[countryKey] || null;
  const phrasesPack = emergencyPhrases?.[countryKey] || null;

  const languages = useMemo(() => {
    const arr = phrasesPack?.languages || [];
    return Array.isArray(arr) ? arr : [];
  }, [phrasesPack]);

  // pick default language
  useEffect(() => {
    if (!open) return;
    if (!languages.length) {
      setLangIso("");
      return;
    }
    // prefer English if present, else first
    const en = languages.find((l) => l?.iso === "en");
    setLangIso(en?.iso || languages[0]?.iso || "");
  }, [open, languages]);

  const activeLang = useMemo(() => {
    if (!langIso) return null;
    return languages.find((l) => l?.iso === langIso) || null;
  }, [languages, langIso]);

  const phraseEntries = useMemo(() => {
    const p = activeLang?.phrases || {};
    return Object.entries(p);
  }, [activeLang]);

  useEffect(() => {
    if (!copiedMsg) return;
    const t = setTimeout(() => setCopiedMsg(""), 1200);
    return () => clearTimeout(t);
  }, [copiedMsg]);

  if (!open) return null;

  const title = selectedDest?.name
    ? `Emergency & Utility Hub — ${selectedDest.name}`
    : "Emergency & Utility Hub";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              Emergency & Utility Hub
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-3">
              {title}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Quick access to emergency numbers + key phrases for help.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Numbers */}
          <div className="rounded-2xl border bg-slate-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-slate-700" />
              <h4 className="text-lg font-extrabold text-slate-900">
                Emergency numbers ({selectedDest?.country || "Country"})
              </h4>
            </div>

            {!numbers ? (
              <div className="text-sm text-slate-600">
                No emergency numbers found for{" "}
                <span className="font-semibold">{selectedDest?.country}</span>.
              </div>
            ) : (
              <div className="bg-white rounded-xl border p-4">
                <FieldRow label="Primary" value={numbers.primary} />
                <FieldRow label="Alternate" value={numbers.alternate} />
                <FieldRow label="Police" value={numbers.police} />
                <FieldRow label="Fire" value={numbers.fire} />
                <FieldRow label="Ambulance" value={numbers.ambulance} />
                <FieldRow label="Non-emergency" value={numbers.nonEmergency} />
                <FieldRow
                  label="Medical advice"
                  value={numbers.medicalNonEmergency}
                />

                {numbers.notes ? (
                  <div className="mt-3 text-xs text-slate-500">
                    {numbers.notes}
                  </div>
                ) : null}

                {/* Copy all */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <CopyButton
                    text={JSON.stringify(numbers, null, 2)}
                    onCopied={() => setCopiedMsg("Numbers copied ✅")}
                  />
                  {numbers.primary ? (
                    <CopyButton
                      text={String(numbers.primary)}
                      onCopied={() => setCopiedMsg("Primary number copied ✅")}
                    />
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Language phrases */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-slate-700" />
                <h4 className="text-lg font-extrabold text-slate-900">
                  Emergency phrases
                </h4>
              </div>

              {/* Language dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Language</span>
                <select
                  value={langIso}
                  onChange={(e) => setLangIso(e.target.value)}
                  className="px-3 py-2 rounded-xl border bg-white text-sm font-semibold"
                  disabled={!languages.length}
                >
                  {!languages.length ? (
                    <option value="">No phrases available</option>
                  ) : (
                    languages.map((l) => (
                      <option key={l.iso} value={l.iso}>
                        {l.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {!languages.length ? (
              <div className="mt-4 text-sm text-slate-600">
                No phrase pack found for{" "}
                <span className="font-semibold">{selectedDest?.country}</span>.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {phraseEntries.map(([key, obj]) => {
                  const native = obj?.text || "";
                  const romanized = obj?.romanized || "";
                  const labelMap = {
                    help: "Help",
                    call_police: "Call the police",
                    call_ambulance: "Call an ambulance",
                    i_need_doctor: "I need a doctor",
                    where_hospital: "Where is the hospital?",
                    i_am_lost: "I am lost"
                  };
                  const label = labelMap[key] || key;

                  const copyText = romanized
                    ? `${native} (${romanized})`
                    : native;

                  return (
                    <div
                      key={key}
                      className="rounded-2xl border bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            {label}
                          </div>
                          <div className="text-lg font-extrabold text-slate-900 mt-1">
                            {native}
                          </div>
                          {romanized ? (
                            <div className="text-sm text-slate-600 mt-1">
                              {romanized}
                            </div>
                          ) : null}
                        </div>

                        <div className="shrink-0">
                          <CopyButton
                            text={copyText}
                            onCopied={() => setCopiedMsg("Copied ✅")}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {phrasesPack?.notes ? (
              <div className="mt-3 text-xs text-slate-500">{phrasesPack.notes}</div>
            ) : null}
          </div>
        </div>

        {/* Footer toast */}
        <div className="border-t p-4 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Tip: Copy phrases and show them to locals if needed.
          </div>
          <div className="text-sm font-semibold text-emerald-700">
            {copiedMsg}
          </div>
        </div>
      </div>
    </div>
  );
}
