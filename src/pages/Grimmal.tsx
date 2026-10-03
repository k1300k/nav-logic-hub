import { useEffect, useMemo, useState } from "react";
import { X, Maximize2, Pencil, RefreshCw, ChevronLeft, ChevronRight, Languages, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Mode = "auto" | "simple" | "comic";
type Lang = "en" | "ja" | "zh" | "none";
type Phase = "idle" | "analyzing" | "confirm" | "drawing" | "done" | "error" | "limit";

interface Panel { icons: string[]; label: string; caption: string }
interface Item {
  source_sentence_ids: string[]; original_text: string; interpreted_text: string; intent_type: string;
  negation: boolean; time_expression: string; quantity: string; location_expression: string;
  needs_clarification: boolean; clarification_question: string; clarification_options: string[];
  recommended_mode: "simple" | "comic"; visual_plan: Panel[]; translation: string; warnings: string[];
}
interface Analysis { request_id: string; original_text: string; sentences: { id: string; text: string }[]; items: Item[] }
interface Result { id: string; item: Item; mode: "simple" | "comic"; intent: string }

const ICON: Record<string, string> = {
  person: "🙋", question: "❓", clock: "🕒", watch: "⌚", restroom: "🚻", point: "👉", map: "🗺️", food: "🍽️",
  peanut: "🥜", no: "🚫", please: "🙏", taxi: "🚕", hotel: "🏨", phone: "📱", bag: "👜", search: "🔍", worried: "😟",
  money: "💵", water: "💧", hospital: "🏥", pill: "💊", police: "👮", bus: "🚌", train: "🚆", plane: "✈️", ticket: "🎫",
  house: "🏠", shop: "🏪", camera: "📷", help: "🆘", ok: "👌", sorry: "🙇", thanks: "😊", meet: "🤝", here: "📍",
  calendar: "📅", car: "🚗", key: "🔑", card: "💳", wifi: "📶", baby: "👶", drink: "🥤", coffee: "☕", hot: "🔥",
  cold: "🧊", number: "🔢",
};
const INTENT_KO: Record<string, string> = {
  question: "질문", request: "요청", statement: "설명", prohibition: "금지", exclusion: "제외 요청",
  proposal: "제안", greeting: "인사", other: "기타",
};

const SAMPLES = [
  "지금 몇 시인가요?", "화장실은 어디인가요?", "이 음식에 땅콩을 넣지 말아 주세요.",
  "이 호텔로 가고 싶어요.", "가방을 잃어버렸어요. 찾아주실 수 있나요?",
];
const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: "en", label: "English", name: "English" }, { id: "ja", label: "日本語", name: "Japanese" },
  { id: "zh", label: "中文", name: "Simplified Chinese" }, { id: "none", label: "번역 없음", name: "English" },
];
const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: "auto", label: "자동", desc: "내용에 맞는 방식을 추천해요" },
  { id: "simple", label: "간단한 그림", desc: "문장별 핵심 의도를 그림으로" },
  { id: "comic", label: "4컷 상황", desc: "흐름을 순서대로" },
];
const MAX = 500;

function Picture({ r, big }: { r: Result; big?: boolean }) {
  const plan = r.item.visual_plan;
  if (r.mode === "comic") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {plan.map((p, i) => (
          <div key={i} className="rounded-lg border-2 border-foreground bg-background p-2 flex flex-col items-center">
            <span className="self-start text-xs font-bold">{i + 1}</span>
            <span className={`${big ? "text-5xl sm:text-6xl" : "text-3xl"} flex flex-wrap justify-center gap-1`}>{p.icons.map((ic, j) => <span key={j}>{ICON[ic] ?? "❔"}</span>)}</span>
            {p.label && <span className={`${big ? "text-2xl" : "text-base"} font-extrabold mt-1`}>{p.label}</span>}
            <span className={`${big ? "text-base" : "text-xs"} font-medium text-center mt-1`}>{p.caption}</span>
          </div>
        ))}
      </div>
    );
  }
  const icons = plan.flatMap((p) => p.icons);
  const labels = plan.map((p) => p.label).filter(Boolean);
  return (
    <div className="rounded-lg border-2 border-foreground bg-background py-6 px-3 flex flex-col items-center gap-2">
      <div className={`flex items-center justify-center gap-3 flex-wrap ${big ? "text-7xl sm:text-8xl" : "text-5xl"}`}>
        {icons.map((e, i) => <span key={i}>{ICON[e] ?? "❔"}</span>)}
      </div>
      {labels.map((l, i) => <span key={i} className={`${big ? "text-3xl" : "text-xl"} font-extrabold`}>{l}</span>)}
    </div>
  );
}

export default function Grimmal() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("auto");
  const [lang, setLang] = useState<Lang>("en");
  const [langOpen, setLangOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pending, setPending] = useState<{ analysis: Analysis; item: Item } | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");
  const [full, setFull] = useState<number | null>(null);
  const [showKo, setShowKo] = useState(false);
  const [showTr, setShowTr] = useState(true);
  const busy = phase === "analyzing" || phase === "drawing";

  useEffect(() => { document.title = "그림말 — 한국어로 쓰고, 그림으로 보여주세요"; }, []);

  const analyze = async (input: string, extra?: string) => {
    if (busy) return;
    setError(""); setPending(null); setPhase("analyzing");
    const body = { text: extra ? `${input}\n[사용자 확인: ${extra}]` : input, lang: LANGS.find((l) => l.id === lang)!.name };
    const { data, error: fnErr } = await supabase.functions.invoke("analyze-intent", { body });
    if (fnErr || !data || data.error) {
      let msg = data?.error as string | undefined;
      let limit = false;
      // deno-lint-ignore no-explicit-any
      const ctx = (fnErr as any)?.context;
      if (ctx?.json) { try { const j = await ctx.json(); msg = j.error; limit = !!j.limit || ctx.status === 402; } catch { /* ignore */ } }
      setError(msg || "분석에 실패했어요. 다시 시도해 주세요.");
      setPhase(limit ? "limit" : "error");
      return;
    }
    const a = data as Analysis;
    const unclear = a.items.find((i) => i.needs_clarification && i.clarification_question);
    if (unclear && !extra) { setPending({ analysis: a, item: unclear }); setPhase("confirm"); return; }
    setPhase("drawing");
    const fresh: Result[] = a.items.map((item, i) => ({
      id: `${a.request_id}-${i}`, item, intent: item.interpreted_text,
      mode: mode === "auto" ? item.recommended_mode : mode,
    }));
    setResults((p) => [...p, ...fresh]);
    const warned = a.items.some((i) => i.warnings.length);
    setPhase("done");
    if (warned) setError("");
  };

  const run = () => { const t = text.trim(); if (t) analyze(text); };
  const swap = (id: string) => setResults((p) => p.map((r) => (r.id === id ? { ...r, mode: r.mode === "simple" ? "comic" : "simple" } : r)));
  const editIntent = (id: string) => {
    const r = results.find((x) => x.id === id);
    const v = window.prompt("핵심 의미를 수정하세요", r?.intent);
    if (v?.trim()) setResults((p) => p.map((x) => (x.id === id ? { ...x, intent: v.trim() } : x)));
  };
  const trOf = (r: Result) => (lang !== "none" ? r.item.translation : "");
  const langLabel = useMemo(() => LANGS.find((l) => l.id === lang)?.label, [lang]);

  if (full !== null && results[full]) {
    const r = results[full];
    return (
      <div className="fixed inset-0 bg-background flex flex-col">
        <div className="flex items-center justify-between p-3 border-b-2 border-foreground">
          <span className="text-base font-bold">{full + 1} / {results.length}</span>
          <button onClick={() => setFull(null)} className="min-h-11 px-4 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-1"><X size={20} />나가기</button>
        </div>
        <div className="flex-1 overflow-auto p-4 flex flex-col justify-center gap-4 max-w-2xl w-full mx-auto">
          <p className="text-2xl font-bold text-center">{r.intent}</p>
          <Picture r={r} big />
          {showTr && trOf(r) && <p className="text-2xl text-center font-semibold">{trOf(r)}</p>}
          {showKo && <p className="text-lg text-center text-muted-foreground">{r.item.original_text}</p>}
        </div>
        <div className="p-3 border-t-2 border-foreground flex items-center gap-2 flex-wrap justify-center">
          <button disabled={full === 0} onClick={() => setFull(full - 1)} aria-label="이전" className="min-h-11 min-w-11 rounded-lg border-2 border-foreground disabled:opacity-30 flex items-center justify-center"><ChevronLeft /></button>
          <button onClick={() => setShowTr(!showTr)} className="min-h-11 px-3 rounded-lg border-2 border-foreground text-sm font-medium">번역 {showTr ? "숨기기" : "보기"}</button>
          <button onClick={() => setShowKo(!showKo)} className="min-h-11 px-3 rounded-lg border-2 border-foreground text-sm font-medium">한국어 {showKo ? "숨기기" : "보기"}</button>
          <button disabled={full === results.length - 1} onClick={() => setFull(full + 1)} aria-label="다음" className="min-h-11 min-w-11 rounded-lg border-2 border-foreground disabled:opacity-30 flex items-center justify-center"><ChevronRight /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="max-w-xl mx-auto px-4 py-5 space-y-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">그림말</h1>
            <p className="text-sm text-muted-foreground">한국어로 쓰고, 그림으로 보여주세요.</p>
          </div>
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="min-h-11 px-3 rounded-lg border-2 border-foreground flex items-center gap-1 text-sm font-medium"><Languages size={18} />{langLabel}</button>
            {langOpen && (
              <div className="absolute right-0 mt-1 z-10 w-36 rounded-lg border-2 border-foreground bg-card">
                {LANGS.map((l) => (
                  <button key={l.id} onClick={() => { setLang(l.id); setLangOpen(false); }} className={`block w-full text-left min-h-11 px-3 text-sm ${lang === l.id ? "font-bold bg-secondary" : ""}`}>{l.label}</button>
                ))}
              </div>
            )}
          </div>
        </header>

        <section className="space-y-2">
          <div className="relative">
            <textarea value={text} maxLength={MAX} onChange={(e) => setText(e.target.value)}
              placeholder={"전달하고 싶은 내용을 한국어로 적어주세요.\n예: 지금 몇 시인가요?"} rows={4}
              className="w-full rounded-lg border-2 border-foreground bg-card p-3 pr-12 text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            {text && <button onClick={() => setText("")} aria-label="지우기" className="absolute top-1 right-1 min-h-11 min-w-11 flex items-center justify-center text-muted-foreground"><X size={20} /></button>}
          </div>
          <p className="text-right text-xs text-muted-foreground">{text.length} / {MAX}</p>
        </section>

        <section className="space-y-2">
          <p className="text-sm font-semibold">표현 방식</p>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)} className={`min-h-11 rounded-lg border-2 px-2 py-2 text-sm font-semibold ${mode === m.id ? "border-foreground bg-primary text-primary-foreground" : "border-border bg-card"}`}>{m.label}</button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{MODES.find((m) => m.id === mode)?.desc}</p>
        </section>

        <button onClick={run} disabled={!text.trim() || busy} className="sticky bottom-3 w-full min-h-12 rounded-lg bg-primary text-primary-foreground text-lg font-bold disabled:opacity-40 flex items-center justify-center gap-2">
          {busy && <Loader2 className="animate-spin" size={20} />}
          {phase === "analyzing" ? "의도 분석 중…" : phase === "drawing" ? "그림 구성 중…" : "그림으로 보여주기"}
        </button>

        <section className="space-y-2">
          <p className="text-sm font-semibold">예문</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button key={s} onClick={() => setText(s)} className="min-h-11 px-3 rounded-full border-2 border-border bg-card text-sm text-left">{s}</button>
            ))}
          </div>
        </section>

        {phase === "confirm" && pending && (
          <div className="rounded-lg border-2 border-foreground bg-card p-4 space-y-3">
            <p className="font-bold">의미 확인이 필요해요</p>
            <p className="text-sm">{pending.item.clarification_question}</p>
            <div className="flex flex-col gap-2">
              {pending.item.clarification_options.map((o) => (
                <button key={o} onClick={() => analyze(text, `${pending.item.clarification_question} → ${o}`)} className="min-h-11 rounded-lg border-2 border-foreground font-medium">{o}</button>
              ))}
              <button onClick={() => analyze(text, "확인 없이 원문 그대로 표현")} className="min-h-11 rounded-lg border-2 border-border text-sm">확인 없이 진행</button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border-2 border-destructive text-destructive p-3 text-sm flex gap-2"><AlertCircle size={18} className="shrink-0" />{phase === "limit" ? `이용 한도 초과: ${error}` : error}</div>
        )}

        {results.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">결과 {results.length}개</p>
              <button onClick={() => setResults([])} className="min-h-11 px-2 text-sm text-muted-foreground">모두 지우기</button>
            </div>
            {[...results].reverse().map((r) => {
              const idx = results.indexOf(r);
              const it = r.item;
              const corrected = it.interpreted_text.trim() !== it.original_text.trim();
              return (
                <article key={r.id} className="rounded-lg border-2 border-foreground bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-1 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-secondary">{INTENT_KO[it.intent_type] ?? "기타"}</span>
                      {it.negation && <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-destructive text-destructive-foreground">부정·제외</span>}
                      {it.time_expression && <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-secondary">🕒 {it.time_expression}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{r.mode === "comic" ? "4컷" : "간단한 그림"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground break-words">원문: {it.original_text}</p>
                  <div>
                    {corrected && <p className="text-xs text-muted-foreground">이렇게 이해했어요</p>}
                    <p className="text-lg font-bold break-words">{r.intent}</p>
                  </div>
                  <Picture r={r} />
                  {trOf(r) && <p className="text-base font-medium">{trOf(r)}</p>}
                  {it.warnings.map((w, i) => <p key={i} className="text-xs text-muted-foreground">⚠️ {w}</p>)}
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => editIntent(r.id)} className="min-h-11 rounded-lg border-2 border-border text-xs font-semibold flex flex-col items-center justify-center"><Pencil size={16} />의도 수정</button>
                    <button onClick={() => swap(r.id)} className="min-h-11 rounded-lg border-2 border-border text-xs font-semibold flex flex-col items-center justify-center"><RefreshCw size={16} />그림 바꾸기</button>
                    <button onClick={() => setFull(idx)} className="min-h-11 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex flex-col items-center justify-center"><Maximize2 size={16} />크게 보여주기</button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
