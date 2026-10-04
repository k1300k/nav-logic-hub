import { ArrowRight, Ban, User } from "lucide-react";
import { PICTO_MAP } from "@/lib/pictograms";

export interface Panel { icons: string[]; excluded?: string[]; arrow?: boolean; label: string; caption: string }

function Tile({ id, excluded, big }: { id: string; excluded: boolean; big?: boolean }) {
  const p = PICTO_MAP[id];
  if (!p) return null;
  const s = big ? 72 : 44;
  return (
    <figure className="flex flex-col items-center gap-1">
      <div className="relative rounded-xl border-[3px] border-foreground bg-card p-2">
        <p.Icon size={s} strokeWidth={2.25} />
        {excluded && <Ban size={s + 16} strokeWidth={2.75} className="absolute inset-0 m-auto text-destructive" aria-hidden />}
      </div>
      <figcaption className={`${big ? "text-base" : "text-xs"} font-bold`}>{excluded ? `${p.name} 빼기` : p.name}</figcaption>
    </figure>
  );
}

/** Composes pictograms by relation: actor → destination, actor + object + "?", object with exclusion mark. */
export function Scene({ panel, intent, big }: { panel: Panel; intent: string; big?: boolean }) {
  const icons = panel.icons.filter((i) => PICTO_MAP[i] && i !== "me").slice(0, 3);
  const excluded = new Set(panel.excluded ?? []);
  const isQ = intent === "question";
  const showActor = panel.arrow || isQ || panel.icons.includes("me");
  const s = big ? 72 : 44;
  if (!icons.length) {
    return <p className={`${big ? "text-xl" : "text-sm"} text-center font-medium py-6`}>알맞은 그림이 없어요. 번역문으로 보여주세요.</p>;
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        {showActor && (
          <figure className="flex flex-col items-center gap-1">
            <div className="p-2"><User size={s} strokeWidth={2.25} /></div>
            <figcaption className={`${big ? "text-base" : "text-xs"} font-bold`}>나</figcaption>
          </figure>
        )}
        {panel.arrow && <ArrowRight size={big ? 48 : 28} strokeWidth={3} aria-label="이동하고 싶어요" />}
        <div className="relative flex items-end gap-2">
          {icons.map((id) => <Tile key={id} id={id} excluded={excluded.has(id)} big={big} />)}
          {isQ && (
            <span className={`absolute -top-3 -right-3 rounded-full border-[3px] border-foreground bg-background font-black flex items-center justify-center ${big ? "w-14 h-14 text-4xl" : "w-9 h-9 text-xl"}`} aria-label="질문">?</span>
          )}
        </div>
      </div>
      {panel.label && <span className={`rounded-lg border-[3px] border-foreground px-3 font-black ${big ? "text-3xl" : "text-xl"}`}>{panel.label}</span>}
      {panel.caption && <span className={`${big ? "text-lg" : "text-sm"} font-medium text-center`}>{panel.caption}</span>}
    </div>
  );
}
