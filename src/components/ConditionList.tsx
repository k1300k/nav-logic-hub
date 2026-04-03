import { Clock, Fuel, CreditCard, AlertTriangle, Leaf, ChevronRight } from "lucide-react";
import { RegionBadge, StatusBadge, TagBadge } from "./RegionBadge";

type Region = "DOM" | "NAS" | "EU";
type Status = "active" | "draft";

interface Condition {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  formula: string;
  regions: Region[];
  status: Status;
  tag: string;
}

const conditions: Condition[] = [
  {
    icon: <Clock size={18} />,
    title: "Time Saving ≥ 5min",
    subtitle: "시간 단축 기반 비교경로 표출",
    formula: "Δt ≥ 300s AND remaining ≥ 10.0km",
    regions: ["DOM", "NAS", "EU"],
    status: "active",
    tag: "시간 단축",
  },
  {
    icon: <Fuel size={18} />,
    title: "Fuel Low + Gas Station Detour",
    subtitle: "연료 부족시 주유소 경유 경로",
    formula: "fuel ≤ 15% AND gasStation ≤ 2.0km detour",
    regions: ["DOM", "NAS"],
    status: "active",
    tag: "연료 절약",
  },
  {
    icon: <CreditCard size={18} />,
    title: "Toll-Free Alternative Available",
    subtitle: "무료 도로 대안 경로 표출",
    formula: "tollFree route Δt ≤ 10min AND toll ≥ ₩3,000",
    regions: ["DOM"],
    status: "active",
    tag: "무료 도로",
  },
  {
    icon: <AlertTriangle size={18} />,
    title: "Traffic Congestion Bypass",
    subtitle: "교통 정체 우회 경로 표출",
    formula: "congestion ≥ Level 3 AND bypass Δt ≥ 8min",
    regions: ["DOM", "NAS", "EU"],
    status: "active",
    tag: "교통 회피",
  },
  {
    icon: <Leaf size={18} />,
    title: "Eco Route CO₂ Reduction",
    subtitle: "친환경 CO₂ 절감 경로",
    formula: "CO₂ reduction ≥ 15% AND Δt ≤ 5min",
    regions: ["EU"],
    status: "draft",
    tag: "친환경 경로",
  },
];

interface ConditionListProps {
  searchQuery: string;
}

export function ConditionList({ searchQuery }: ConditionListProps) {
  const filtered = conditions.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.subtitle.includes(q) ||
      c.formula.toLowerCase().includes(q) ||
      c.tag.includes(q) ||
      c.regions.some((r) => r.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3">
        표출 조건 케이스 — {filtered.length}건
      </h2>
      <div className="space-y-3">
        {conditions.map((c) => (
          <div
            key={c.title}
            className="rounded-lg border border-border bg-card p-4 flex items-start gap-3 hover:shadow-sm transition-shadow cursor-pointer group"
          >
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
              {c.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{c.subtitle}</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">{c.formula}</p>
              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                {c.regions.map((r) => (
                  <RegionBadge key={r} region={r} />
                ))}
                <StatusBadge status={c.status} />
                <TagBadge label={c.tag} />
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
