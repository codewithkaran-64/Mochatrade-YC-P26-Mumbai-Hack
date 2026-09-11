interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-base-600 px-6 py-10 text-center">
      {icon && <div className="mb-1 text-ink-500">{icon}</div>}
      <p className="text-sm font-medium text-ink-300">{title}</p>
      <p className="max-w-sm text-xs text-ink-500">{description}</p>
    </div>
  );
}
