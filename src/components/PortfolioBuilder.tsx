"use client";

import { useState } from "react";
import type { Holding } from "@/types";
import { CURRENCIES, SECTORS } from "@/types";
import { formatINR } from "@/utils/formatters";
import { draftToHolding, validateHoldingDraft, type HoldingDraft } from "@/utils/validation";
import { EmptyState } from "./EmptyState";

const EMPTY_DRAFT: HoldingDraft = {
  asset: "",
  ticker: "",
  quantity: "",
  currentValue: "",
  sector: "",
  currency: "",
};

interface PortfolioBuilderProps {
  holdings: Holding[];
  onAdd: (holding: Holding) => void;
  onUpdate: (id: string, updated: Omit<Holding, "id">) => void;
  onDelete: (id: string) => void;
}

export function PortfolioBuilder({ holdings, onAdd, onUpdate, onDelete }: PortfolioBuilderProps) {
  const [draft, setDraft] = useState<HoldingDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function resetForm() {
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(holding: Holding) {
    setDraft({
      asset: holding.asset,
      ticker: holding.ticker,
      quantity: String(holding.quantity),
      currentValue: String(holding.currentValue),
      sector: holding.sector,
      currency: holding.currency,
    });
    setEditingId(holding.id);
    setErrors({});
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateHoldingDraft(draft);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    if (editingId) {
      const holding = draftToHolding(draft, editingId);
      const { id, ...rest } = holding;
      onUpdate(editingId, rest);
    } else {
      onAdd(draftToHolding(draft, `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`));
    }
    resetForm();
  }

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <h2 className="text-sm font-semibold text-ink-100">Portfolio</h2>
        {!showForm && (
          <button type="button" className="btn-secondary !py-1.5 !px-3 text-xs" onClick={() => setShowForm(true)}>
            + Add Holding
          </button>
        )}
      </div>

      <div className="p-5">
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-5 rounded-xl border border-base-600 bg-base-900/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Asset name" error={errors.asset}>
                <input
                  autoComplete="off"
                  className={`input ${errors.asset ? "input-error" : ""}`}
                  placeholder="e.g. NVIDIA"
                  value={draft.asset}
                  onChange={(e) => setDraft({ ...draft, asset: e.target.value })}
                />
              </Field>
              <Field label="Ticker" error={errors.ticker}>
                <input
                  autoComplete="off"
                  className={`input ${errors.ticker ? "input-error" : ""}`}
                  placeholder="e.g. NVDA"
                  value={draft.ticker}
                  onChange={(e) => setDraft({ ...draft, ticker: e.target.value.toUpperCase() })}
                />
              </Field>
              <Field label="Quantity" error={errors.quantity}>
                <input
                  autoComplete="off"
                  className={`input ${errors.quantity ? "input-error" : ""}`}
                  placeholder="e.g. 10"
                  inputMode="decimal"
                  value={draft.quantity}
                  onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
                />
              </Field>
              <Field label="Current value (INR)" error={errors.currentValue}>
                <input
                  autoComplete="off"
                  className={`input ${errors.currentValue ? "input-error" : ""}`}
                  placeholder="e.g. 150000"
                  inputMode="decimal"
                  value={draft.currentValue}
                  onChange={(e) => setDraft({ ...draft, currentValue: e.target.value })}
                />
              </Field>
              <Field label="Sector" error={errors.sector}>
                <select
                  className={`input ${errors.sector ? "input-error" : ""}`}
                  value={draft.sector}
                  onChange={(e) => setDraft({ ...draft, sector: e.target.value as Holding["sector"] })}
                >
                  <option value="">Select sector</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Currency" error={errors.currency}>
                <select
                  className={`input ${errors.currency ? "input-error" : ""}`}
                  value={draft.currency}
                  onChange={(e) => setDraft({ ...draft, currency: e.target.value as Holding["currency"] })}
                >
                  <option value="">Select currency</option>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="btn-primary">
                {editingId ? "Save changes" : "Add holding"}
              </button>
              <button type="button" className="btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {holdings.length === 0 ? (
          <EmptyState
            title="No holdings yet"
            description="Add your existing positions, or use Load Demo Portfolio to see Mochaguard in action instantly."
          />
        ) : (
          <div className="scroll-thin -mx-1 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-3 py-2 font-medium">Asset</th>
                  <th className="px-3 py-2 font-medium">Qty</th>
                  <th className="px-3 py-2 font-medium">Value</th>
                  <th className="px-3 py-2 font-medium">Sector</th>
                  <th className="px-3 py-2 font-medium">Currency</th>
                  <th className="px-3 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-700">
                {holdings.map((h) => (
                  <tr key={h.id} className="text-ink-200">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-ink-100">{h.ticker}</div>
                      <div className="text-xs text-ink-500">{h.asset}</div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs">{h.quantity}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{formatINR(h.currentValue)}</td>
                    <td className="px-3 py-2.5 text-xs">{h.sector}</td>
                    <td className="px-3 py-2.5 text-xs">{h.currency}</td>
                    <td className="px-3 py-2.5 text-right">
                      <button type="button" className="btn-ghost !px-2 !py-1 text-xs" onClick={() => startEdit(h)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-ghost !px-2 !py-1 text-xs text-risk-veryhigh hover:!bg-risk-veryhigh/10"
                        onClick={() => onDelete(h.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-risk-veryhigh">{error}</p>}
    </div>
  );
}
