import { LEVERAGE_STEPS } from "@/types";
import { classNames } from "@/utils/formatters";

interface LeverageSelectorProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export function LeverageSelector({ value, onChange, error }: LeverageSelectorProps) {
  return (
    <div>
      <label className="label">Leverage</label>
      <div className="flex flex-wrap gap-2">
        {LEVERAGE_STEPS.map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => onChange(step)}
            className={classNames(
              "rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all",
              value === step
                ? "border-accent-500 bg-accent-500/15 text-accent-400 shadow-glow"
                : "border-base-600 bg-base-900 text-ink-400 hover:border-base-500 hover:text-ink-200",
            )}
          >
            {step}x
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-risk-veryhigh">{error}</p>}
      <p className="mt-2 text-xs text-ink-500">
        Higher leverage can amplify both gains and losses. Leverage is not a recommendation.
      </p>
    </div>
  );
}
