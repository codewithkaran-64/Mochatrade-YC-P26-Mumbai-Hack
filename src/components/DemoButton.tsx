interface DemoButtonProps {
  onLoadDemo: () => void;
  hasPortfolio: boolean;
  onClear: () => void;
}

export function DemoButton({ onLoadDemo, hasPortfolio, onClear }: DemoButtonProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={onLoadDemo} className="btn-primary">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 3v18l14-9L5 3z" fill="currentColor" />
        </svg>
        Load Demo Portfolio
      </button>
      {hasPortfolio && (
        <button type="button" onClick={onClear} className="btn-ghost">
          Clear portfolio
        </button>
      )}
      <span className="chip bg-base-800 text-ink-400">Demo data is clearly labeled and safe to reset</span>
    </div>
  );
}
