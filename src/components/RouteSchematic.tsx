import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RouteSchematicProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function RouteSchematic({ searchQuery, onSearchChange }: RouteSchematicProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground tracking-wider">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
            <path d="M2 12L7 2l5 10-5 10z" />
            <path d="M12 12h10" />
          </svg>
          ROUTE SCHEMATIC
        </div>
        <span className="text-xs text-muted-foreground">전체 현황</span>
      </div>
      {/* 키워드 검색 */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="비교경로 사양내역 키워드 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>
      <div className="relative h-48 bg-route-bg mx-4 my-3 rounded-lg overflow-hidden">
        <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Start point */}
          <circle cx="150" cy="160" r="8" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
          <circle cx="150" cy="160" r="3" fill="hsl(var(--muted-foreground))" />
          <text x="150" y="185" textAnchor="middle" className="text-[10px]" fill="hsl(var(--muted-foreground))">출발</text>

          {/* End point */}
          <rect x="460" y="65" width="12" height="12" rx="2" fill="hsl(var(--foreground))" />
          <text x="466" y="58" textAnchor="middle" className="text-[10px]" fill="hsl(var(--muted-foreground))">목적지</text>

          {/* Current route (dark, solid) */}
          <path d="M 158 155 Q 300 130 350 100 Q 400 70 458 71" fill="none" stroke="hsl(var(--route-current))" strokeWidth="2.5" />

          {/* Compare route (blue, curved higher) */}
          <path d="M 158 155 Q 250 80 350 55 Q 420 40 458 71" fill="none" stroke="hsl(var(--route-compare))" strokeWidth="2.5" />

          {/* Congestion marker on current route */}
          <rect x="310" y="88" width="40" height="12" rx="3" fill="hsl(var(--route-congestion))" opacity="0.3" />
          <text x="330" y="97" textAnchor="middle" className="text-[8px]" fill="hsl(var(--route-congestion))">정체</text>

          {/* Info box */}
          <rect x="280" y="30" width="100" height="35" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
          <text x="330" y="46" textAnchor="middle" className="text-[10px] font-semibold" fill="hsl(var(--foreground))">5분 더 빠름</text>
          <text x="330" y="58" textAnchor="middle" className="text-[9px]" fill="hsl(var(--muted-foreground))">10km (6.2mi)</text>
          {/* Arrow down from box */}
          <line x1="330" y1="65" x2="330" y2="55" stroke="hsl(var(--route-compare))" strokeWidth="1" markerEnd="url(#arrowhead)" />
        </svg>
      </div>
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 bg-route-current rounded" />
            현재 경로
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 border-t-2 border-dashed border-route-compare" />
            비교경로
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            -5min
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10H3M21 6H3M21 14H3M21 18H3"/></svg>
            10km
          </span>
        </div>
      </div>
    </div>
  );
}
