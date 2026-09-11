export function Header() {
  return (
    <header className="border-b border-base-700 bg-base-900/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-icon.png"
            alt="Mochaguard logo"
            className="h-9 w-9 rounded-lg shadow-glow"
            width={36}
            height={36}
          />
          <div>
            <h1 className="text-[15px] font-bold leading-tight tracking-tight text-ink-100">MOCHAGUARD</h1>
            <p className="text-[11px] leading-tight text-ink-400">Portfolio Risk Intelligence</p>
          </div>
        </div>
        <p className="hidden text-xs text-ink-400 sm:block">
          Understand the risk before you place the trade.
        </p>
      </div>
    </header>
  );
}
