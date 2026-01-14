import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Trash2, PiggyBank } from "lucide-react";

/**
 * BudgetTrackerModal
 * - ESC closes
 * - click outside closes
 * - animation open/close
 * - code separated from HolidayPlanner.js
 */
export default function BudgetTrackerModal({
  open,
  onClose,
  itinerary,
  currency,
  setCurrency,
  budgetData,
  setBudgetData,
}) {
  const overlayRef = useRef(null);
  const [animState, setAnimState] = useState("enter"); // "enter" | "exit"

  useEffect(() => {
    if (!open) return;
    setAnimState("enter");
  }, [open]);

  const requestClose = () => {
    setAnimState("exit");
    window.setTimeout(() => onClose?.(), 200);
  };

  // ESC support
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") requestClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // click outside closes
  const onOverlayMouseDown = (e) => {
    if (e.target === overlayRef.current) requestClose();
  };

  // lock scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ---------- Budget Tracker logic ----------
  const [newExpense, setNewExpense] = useState({
    dayKey: "",
    category: "Food",
    note: "",
    planned: "",
    actual: "",
  });

  const dayOptions = useMemo(() => {
    return (itinerary || []).map((d) => {
      const dayKey = d.isoDate || `day-${d.day}`;
      const label = `Day ${d.day} • ${d.date}`;
      return { dayKey, label };
    });
  }, [itinerary]);

  useEffect(() => {
    // default to first day whenever modal opens / itinerary changes
    if (open && !newExpense.dayKey && dayOptions.length) {
      setNewExpense((p) => ({ ...p, dayKey: dayOptions[0].dayKey }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dayOptions.length]);

  const totals = useMemo(() => {
    const expenses = budgetData?.expenses || [];
    const sum = (xs, k) => xs.reduce((acc, x) => acc + (Number(x?.[k]) || 0), 0);

    const plannedTotal = sum(expenses, "planned");
    const actualTotal = sum(expenses, "actual");

    const overallBudget = Number(budgetData?.overallBudget || 0);
    const remaining = overallBudget - actualTotal;

    const byDay = {};
    for (const e of expenses) {
      const dk = e.dayKey || "unknown";
      byDay[dk] = (byDay[dk] || 0) + (Number(e.actual) || 0);
    }

    return { plannedTotal, actualTotal, overallBudget, remaining, byDay };
  }, [budgetData]);

  const setOverallBudget = (v) => {
    setBudgetData((prev) => ({
      ...prev,
      overallBudget: Number(v) || 0,
    }));
  };

  const setDailyBudget = (dayKey, v) => {
    setBudgetData((prev) => ({
      ...prev,
      dailyBudgets: {
        ...(prev.dailyBudgets || {}),
        [dayKey]: Number(v) || 0,
      },
    }));
  };

  const addExpense = () => {
    if (!newExpense.dayKey) return;

    const planned = Number(newExpense.planned) || 0;
    const actual = Number(newExpense.actual) || 0;

    if (!newExpense.note.trim() && !newExpense.category) return;

    const item = {
      id: cryptoRandomId(),
      ts: Date.now(),
      dayKey: newExpense.dayKey,
      category: newExpense.category || "Other",
      note: newExpense.note.trim() || "",
      planned,
      actual,
    };

    setBudgetData((prev) => ({
      ...prev,
      expenses: [item, ...(prev.expenses || [])],
    }));

    setNewExpense((p) => ({ ...p, note: "", planned: "", actual: "" }));
  };

  const deleteExpense = (id) => {
    setBudgetData((prev) => ({
      ...prev,
      expenses: (prev.expenses || []).filter((x) => x.id !== id),
    }));
  };

  const fmt = (n) => {
    const v = Number(n) || 0;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(v);
    } catch {
      return `${currency} ${Math.round(v)}`;
    }
  };

  const overUnder = totals.remaining;

  return (
    <div
      ref={overlayRef}
      onMouseDown={onOverlayMouseDown}
      className={[
        "fixed inset-0 z-[999] flex items-center justify-center p-4",
        "bg-black/50 backdrop-blur-sm",
        animState === "enter" ? "opacity-100" : "opacity-0",
        "transition-opacity duration-200",
      ].join(" ")}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={[
          "w-full max-w-3xl rounded-2xl bg-white shadow-2xl border overflow-hidden",
          "transform transition-all duration-200",
          animState === "enter" ? "translate-y-0 scale-100" : "translate-y-2 scale-[0.98]",
        ].join(" ")}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Budget tracker
            </div>
            <div className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <PiggyBank className="w-6 h-6" />
              Budget vs actual
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Track planned spend and what you really spend — per day and overall.
            </div>
          </div>

          <button
            type="button"
            onClick={requestClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Close"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Currency */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 font-semibold">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-white text-sm"
            >
              {["GBP", "EUR", "USD", "AUD", "CAD", "JPY"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs text-slate-500 font-semibold">Overall budget</div>
              <input
                type="number"
                value={budgetData.overallBudget}
                onChange={(e) => setOverallBudget(e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-lg border bg-white"
                placeholder="0"
              />
            </div>

            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs text-slate-500 font-semibold">Planned total</div>
              <div className="mt-2 text-lg font-extrabold text-slate-900">
                {fmt(totals.plannedTotal)}
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs text-slate-500 font-semibold">Actual total</div>
              <div className="mt-2 text-lg font-extrabold text-slate-900">
                {fmt(totals.actualTotal)}
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs text-slate-500 font-semibold">Over / under</div>
              <div
                className={[
                  "mt-2 text-lg font-extrabold",
                  overUnder >= 0 ? "text-emerald-700" : "text-red-600",
                ].join(" ")}
              >
                {overUnder >= 0 ? `+${fmt(overUnder)}` : `-${fmt(Math.abs(overUnder))}`}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {overUnder >= 0 ? "Under budget" : "Over budget"}
              </div>
            </div>
          </div>

          {/* Per-day budgets */}
          <div>
            <div className="text-sm font-extrabold text-slate-900">Daily budgets</div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {dayOptions.map(({ dayKey, label }) => (
                <div key={dayKey} className="rounded-xl border p-4">
                  <div className="text-sm font-semibold text-slate-900">{label}</div>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="number"
                      value={budgetData.dailyBudgets?.[dayKey] ?? 0}
                      onChange={(e) => setDailyBudget(dayKey, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border bg-white"
                      placeholder="0"
                    />
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Actual:{" "}
                      <span className="font-semibold">
                        {fmt(totals.byDay?.[dayKey] || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add expense */}
          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="text-sm font-extrabold text-slate-900">Add an expense</div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-3">
              <select
                value={newExpense.dayKey}
                onChange={(e) => setNewExpense((p) => ({ ...p, dayKey: e.target.value }))}
                className="md:col-span-2 px-3 py-2 rounded-lg border bg-white text-sm"
              >
                {dayOptions.map((d) => (
                  <option key={d.dayKey} value={d.dayKey}>
                    {d.label}
                  </option>
                ))}
              </select>

              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense((p) => ({ ...p, category: e.target.value }))}
                className="px-3 py-2 rounded-lg border bg-white text-sm"
              >
                {["Food", "Transport", "Tickets", "Shopping", "Hotel", "Other"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <input
                value={newExpense.note}
                onChange={(e) => setNewExpense((p) => ({ ...p, note: e.target.value }))}
                className="md:col-span-2 px-3 py-2 rounded-lg border bg-white text-sm"
                placeholder="Note (e.g. museum tickets)"
              />

              <input
                type="number"
                value={newExpense.planned}
                onChange={(e) => setNewExpense((p) => ({ ...p, planned: e.target.value }))}
                className="px-3 py-2 rounded-lg border bg-white text-sm"
                placeholder="Planned"
              />

              <input
                type="number"
                value={newExpense.actual}
                onChange={(e) => setNewExpense((p) => ({ ...p, actual: e.target.value }))}
                className="px-3 py-2 rounded-lg border bg-white text-sm"
                placeholder="Actual"
              />
            </div>

            <button
              type="button"
              onClick={addExpense}
              className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
            >
              Add expense
            </button>
          </div>

          {/* Expense list */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-slate-900">Expenses</div>
              <div className="text-xs text-slate-500">{budgetData.expenses?.length || 0} item(s)</div>
            </div>

            {(!budgetData.expenses || budgetData.expenses.length === 0) ? (
              <div className="mt-3 text-sm text-slate-600 rounded-xl border p-4 bg-white">
                No expenses yet — add your first one above.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {budgetData.expenses.map((x) => (
                  <div
                    key={x.id}
                    className="rounded-xl border bg-white p-4 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {x.category}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          • {x.dayKey}
                        </span>
                      </div>

                      {x.note ? <div className="text-sm text-slate-700 mt-1">{x.note}</div> : null}

                      <div className="text-xs text-slate-500 mt-2">
                        Planned: <span className="font-semibold">{fmt(x.planned)}</span>{" "}
                        • Actual: <span className="font-semibold">{fmt(x.actual)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteExpense(x.id)}
                      className="shrink-0 p-2 rounded-lg hover:bg-red-50 text-red-600"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={requestClose}
            className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
