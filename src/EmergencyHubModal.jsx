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

// ✅ Keep existing functionality, but also support the newer schema:
// { text, local_language, pronounce } as well as { text, romanized }
function normalizePhraseFields(obj) {
  const o = obj || {};
  return {
    // English always comes from `text` for the English language pack
    text: o.text || "",
    // Local may be stored in `local_language` or `text` (older pack)
    local: o.local_language || o.text || "",
    // Pronunciation may be stored in `pronounce` or `romanized`
    pronounce: o.pronounce || o.romanized || "",
  };
}

export default function EmergencyHubModal({
  open,
  onClose,
  selectedDest,

  // emergencyNumbers["france"] => { primary, police, fire, ... }
  emergencyNumbers = {},

  // emergencyPhrases["france"] =>
  // { languages: [{ iso:"en", name:"English", phrases: { help:{text, romanized?} } }, ...], notes? }
  // Also supports phrases where values are: { text, local_language, pronounce }
  emergencyPhrases = {},
}) {
  const [copiedMsg, setCopiedMsg] = useState("");
  const [langIso, setLangIso] = useState("");

  const countryKey = normKey(selectedDest?.country);
  const numbers = emergencyNumbers?.[countryKey] || null;

  // ✅ use the prop
  const phrasesPack = emergencyPhrases?.[countryKey] || null;

  const languages = useMemo(() => {
    const arr = phrasesPack?.languages || [];
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
  }, [phrasesPack]);

  // pick default language: local first, else English, else first
  useEffect(() => {
    if (!open) return;
    if (!languages.length) {
      setLangIso("");
      return;
    }
    const local = languages.find((l) => l?.iso && l.iso !== "en");
    const en = languages.find((l) => l?.iso === "en");
    setLangIso(local?.iso || en?.iso || languages[0]?.iso || "");
  }, [open, languages]);

  const englishLang = useMemo(
    () => languages.find((l) => l?.iso === "en") || null,
    [languages]
  );

  const activeLang = useMemo(() => {
    if (!langIso) return null;
    return languages.find((l) => l?.iso === langIso) || null;
  }, [languages, langIso]);

  // Union of phrase keys (so English + Local appear together)
  const phraseKeys = useMemo(() => {
    const enKeys = englishLang?.phrases ? Object.keys(englishLang.phrases) : [];
    const locKeys = activeLang?.phrases ? Object.keys(activeLang.phrases) : [];
    return Array.from(new Set([...enKeys, ...locKeys]));
  }, [englishLang, activeLang]);

  useEffect(() => {
    if (!copiedMsg) return;
    const t = setTimeout(() => setCopiedMsg(""), 1200);
    return () => clearTimeout(t);
  }, [copiedMsg]);

  if (!open) return null;

  // ✅ Fix Babel "missing semicolon" edge case: use escaped em dash + explicit semicolon style
  const title =
    selectedDest?.name
      ? `Emergency & Utility Hub \u2014 ${selectedDest.name}`
      : "Emergency & Utility Hub";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              Emergency &amp; Utility Hub
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
                Emergency numbers coming soon for{" "}
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
                  Emergency phrases{" "}
                  {activeLang?.name
                    ? `(English + ${activeLang.name})`
                    : "(English + Local)"}
                </h4>
              </div>
            </div>

            {!languages.length ? (
              <div className="mt-4 text-sm text-slate-600">
                Local phrases coming soon for{" "}
                <span className="font-semibold">{selectedDest?.country}</span>.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {phraseKeys.map((key) => {
                  const labelMap = {
                    help: "Help",
                    call_police: "Call the police",
                    call_ambulance: "Call an ambulance",
                    i_need_doctor: "I need a doctor",
                    where_hospital: "Where is the hospital?",
                    i_am_lost: "I am lost",
                  };
                  const label = labelMap[key] || key;

                  const enRaw = englishLang?.phrases?.[key] || null;
                  const locRaw = activeLang?.phrases?.[key] || null;

                  const en = normalizePhraseFields(enRaw);
                  const loc = normalizePhraseFields(locRaw);

                  // English should show from english pack `text`
                  const englishText = en.text || "";

                  // Local should prefer `local_language` if present, else `text`
                  const native = loc.local || "";

                  // Pronunciation should prefer `pronounce` then `romanized`
                  const pronounce = loc.pronounce || "";

                  const copyText = native
                    ? pronounce
                      ? `${native} (${pronounce})`
                      : native
                    : englishText;

                  return (
                    <div
                      key={key}
                      className="rounded-2xl border bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            {label}
                          </div>

                          {/* English (always shown if available) */}
                          {englishText ? (
                            <div className="mt-2">
                              <div className="text-[11px] font-bold text-slate-500">
                                English
                              </div>
                              <div className="text-sm font-extrabold text-slate-900">
                                {englishText}
                              </div>
                            </div>
                          ) : null}

                          {/* Local + pronunciation (default view) */}
                          {native ? (
                            <div className="mt-3">
                              <div className="text-[11px] font-bold text-slate-500">
                                {activeLang?.name || "Local language"}
                              </div>
                              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                                {native}
                              </div>
                              {pronounce ? (
                                <div className="text-sm text-slate-600 mt-1">
                                  Pronounce:{" "}
                                  <span className="font-semibold">
                                    {pronounce}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div className="mt-3 text-sm text-slate-600">
                              Local phrase not available — use the English line
                              above.
                            </div>
                          )}
                        </div>

                        <div className="shrink-0">
                          <CopyButton
                            text={copyText || ""}
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
              <div className="mt-3 text-xs text-slate-500">
                {phrasesPack.notes}
              </div>
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
