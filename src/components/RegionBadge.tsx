import { cn } from "@/lib/utils";

type Region = "DOM" | "NAS" | "EU";
type Status = "active" | "draft";

const regionStyles: Record<Region, string> = {
  DOM: "bg-[hsl(var(--badge-dom))] text-[hsl(var(--badge-dom-foreground))]",
  NAS: "bg-[hsl(var(--badge-nas))] text-[hsl(var(--badge-nas-foreground))]",
  EU: "bg-[hsl(var(--badge-eu))] text-[hsl(var(--badge-eu-foreground))]",
};

const statusStyles: Record<Status, string> = {
  active: "bg-[hsl(var(--badge-active))] text-[hsl(var(--badge-active-foreground))] uppercase",
  draft: "bg-[hsl(var(--badge-draft))] text-[hsl(var(--badge-draft-foreground))] uppercase",
};

export function RegionBadge({ region }: { region: Region }) {
  return (
    <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold", regionStyles[region])}>
      {region}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold", statusStyles[status])}>
      {status}
    </span>
  );
}

export function TagBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-[hsl(var(--badge-tag))] text-[hsl(var(--badge-tag-foreground))]">
      {label}
    </span>
  );
}
