const stats = [
  { region: "DOM", count: 4, label: "국내 활성 조건", dotColor: "bg-dot-dom" },
  { region: "NAS", count: 3, label: "북미 활성 조건", dotColor: "bg-dot-nas" },
  { region: "EU", count: 2, label: "유럽 활성 조건", dotColor: "bg-dot-eu" },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.region} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${s.dotColor}`} />
            <span className="text-sm font-medium text-foreground">{s.region}</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{s.count}</div>
          <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
