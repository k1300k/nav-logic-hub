import { useEffect, useMemo, useState } from "react";
import { X, Maximize2, Pencil, RefreshCw, ChevronLeft, ChevronRight, Languages, Loader2, AlertCircle } from "lucide-react";

type Mode = "auto" | "simple" | "comic";
type Lang = "en" | "ja" | "zh" | "none";
type Phase = "idle" | "analyzing" | "confirm" | "drawing" | "done" | "error";

interface Sample {
  key: string;
  intent: string;
  emoji: string[];
  comic: { emoji: string; caption: string }[];
  tr: Record<Exclude<Lang, "none">, string>;
  ambiguous?: { question: string; options: string[] };
}

const SAMPLES: Sample[] = [
  { key: "지금 몇 시인가요?", intent: "현재 시각을 묻고 있어요", emoji: ["🙋", "❓", "🕒"],
    comic: [{ emoji: "🙋", caption: "말을 건다" }, { emoji: "⌚", caption: "시계가 없다" }, { emoji: "❓", caption: "몇 시인지 묻는다" }, { emoji: "🕒", caption: "시간을 알려준다" }],
    tr: { en: "What time is it now?", ja: "今何時ですか？", zh: "现在几点？" } },
  { key: "화장실은 어디인가요?", intent: "화장실 위치를 묻고 있어요", emoji: ["🚻", "❓", "👉"],
    comic: [{ emoji: "🙋", caption: "도움을 청한다" }, { emoji: "🚻", caption: "화장실을 찾는다" }, { emoji: "🗺️", caption: "위치를 묻는다" }, { emoji: "👉", caption: "방향을 안내받는다" }],
    tr: { en: "Where is the restroom?", ja: "トイレはどこですか？", zh: "洗手间在哪里？" } },
  { key: "이 음식에 땅콩을 넣지 말아 주세요.", intent: "음식에서 땅콩을 빼 달라는 요청이에요", emoji: ["🍽️", "🥜", "🚫"],
    comic: [{ emoji: "🍽️", caption: "음식을 주문한다" }, { emoji: "🥜", caption: "땅콩이 들어간다" }, { emoji: "🚫", caption: "땅콩은 안 된다" }, { emoji: "🙏", caption: "빼 달라고 부탁한다" }],
    tr: { en: "Please don't put peanuts in this food.", ja: "この料理にピーナッツを入れないでください。", zh: "请不要在这道菜里放花生。" } },
  { key: "이 호텔로 가고 싶어요.", intent: "특정 호텔로 이동하고 싶다는 요청이에요", emoji: ["🚕", "➡️", "🏨"],
    comic: [{ emoji: "🙋", caption: "기사님께 말한다" }, { emoji: "📱", caption: "호텔을 보여준다" }, { emoji: "🚕", caption: "택시로 이동한다" }, { emoji: "🏨", caption: "호텔에 도착한다" }],
    tr: { en: "I'd like to go to this hotel.", ja: "このホテルに行きたいです。", zh: "我想去这家酒店。" },
    ambiguous: { question: "'이 호텔'은 어떻게 보여줄까요?", options: ["휴대폰 화면의 호텔", "손에 든 주소 메모"] } },
  { key: "가방을 잃어버렸어요. 찾아주실 수 있나요?", intent: "가방을 잃어버려 찾는 도움을 요청해요", emoji: ["👜", "❓", "🔍"],
    comic: [{ emoji: "👜", caption: "가방을 들고 있었다" }, { emoji: "😟", caption: "가방이 없어졌다" }, { emoji: "🙋", caption: "도움을 청한다" }, { emoji: "🔍", caption: "함께 찾아 달라" }],
    tr: { en: "I lost my bag. Could you help me find it?", ja: "かばんをなくしました。探していただけますか？", zh: "我的包丢了，能帮我找一下吗？" } },
];

const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" }, { id: "ja", label: "日本語" }, { id: "zh", label: "中文" }, { id: "none", label: "번역 없음" },
];
const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: "auto", label: "자동", desc: "내용에 맞는 방식을 추천해요" },
  { id: "simple", label: "간단한 그림", desc: "핵심 의도를 그림으로" },
  { id: "comic", label: "4컷 상황", desc: "흐름을 순서대로" },
];

interface Result { id: number; original: string; intent: string; mode: "simple" | "comic"; sample?: Sample; variant: number; note?: string }

const MAX = 500;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Picture({ r, big }: { r: Result; big?: boolean }) {
  const s = r.sample;
  if (!s) return <div className={`flex items-center justify-center ${big ? "text-8xl" : "text-5xl"}`}>💬</div>;
  if (r.mode === "comic") {
    const panels = r.variant % 2 ? [...s.comic].reverse().reverse() : s.comic;
    return (
      <div className="grid grid-cols-2 gap-2">
        {panels.map((p, i) => (
          <div key={i} className="rounded-lg border-2 border-foreground bg-background p-2 flex flex-col items-center">
            <span className="self-start text-xs font-bold">{i + 1}</span>
            <span className={big ? "text-6xl sm:text-7xl" : "text-4xl"}>{p.emoji}</span>
            <span className={`${big ? "text-base" : "text-xs"} font-medium text-center mt-1`}>{p.caption}</span>
          </div>
        ))}
      </div>
    );
  }
  const em = r.variant % 2 ? [...s.emoji].reverse() : s.emoji;
  return (
    <div className={`flex items-center justify-center gap-3 flex-wrap rounded-lg border-2 border-foreground bg-background py-6 ${big ? "text-7xl sm:text-8xl" : "text-5xl"}`}>
      {em.map((e, i) => <span key={i}>{e}</span>)}
    </div>
  );
}

export default function Grimmal() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("auto");
  const [lang, setLang] = useState<Lang>("en");
  const [langOpen, setLangOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pending, setPending] = useState<Sample | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");
  const [full, setFull] = useState<number | null>(null);
  const [showKo, setShowKo] = useState(false);
  const [showTr, setShowTr] = useState(true);
  const busy = phase === "analyzing" || phase === "drawing";

  useEffect(() => { document.title = "그림말 — 한국어로 쓰고, 그림으로 보여주세요"; }, []);

  const resolveMode = (s?: Sample): "simple" | "comic" =>
    mode === "auto" ? (s && /잃어버|가고 싶/.test(s.key) ? "comic" : "simple") : mode;

  const finish = async (s: Sample | undefined, original: string, note?: string) => {
    setPhase("drawing");
    await wait(700);
    setResults((prev) => [...prev, { id: Date.now(), original, intent: s ? s.intent : "샘플에 없는 문장이에요. 예문으로 흐름을 확인해 주세요.", mode: resolveMode(s), sample: s, variant: 0, note }]);
    setPhase(s ? "done" : "error");
    if (!s) setError("부분 실패: 샘플 단계에서는 예문 5개만 그림으로 보여줄 수 있어요.");
  };

  const run = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setError("");
    setPhase("analyzing");
    await wait(700);
    const s = SAMPLES.find((x) => x.key.replace(/\s/g, "") === t.replace(/\s/g, ""));
    if (s?.ambiguous) { setPending(s); setPhase("confirm"); return; }
    finish(s, text);
  };

  const confirm = (opt: string) => { if (pending) { finish(pending, text, opt); setPending(null); } };
  const swap = (id: number) => setResults((p) => p.map((r) => (r.id === id ? { ...r, variant: r.variant + 1, mode: r.variant % 2 ? r.mode : r.mode === "simple" ? "comic" : "simple" } : r)));
  const editIntent = (id: number) => {
    const r = results.find((x) => x.id === id);
    const v = window.prompt("핵심 의미를 수정하세요", r?.intent);
    if (v?.trim()) setResults((p) => p.map((x) => (x.id === id ? { ...x, intent: v.trim() } : x)));
  };
  const trOf = (r: Result) => (lang !== "none" && r.sample ? r.sample.tr[lang] : "");
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
          {showKo && <p className="text-lg text-center text-muted-foreground">{r.original}</p>}
        </div>
        <div className="p-3 border-t-2 border-foreground flex items-center gap-2 flex-wrap justify-center">
          <button disabled={full === 0} onClick={() => setFull(full - 1)} className="min-h-11 min-w-11 rounded-lg border-2 border-foreground disabled:opacity-30 flex items-center justify-center"><ChevronLeft /></button>
          <button onClick={() => setShowTr(!showTr)} className="min-h-11 px-3 rounded-lg border-2 border-foreground text-sm font-medium">번역 {showTr ? "숨기기" : "보기"}</button>
          <button onClick={() => setShowKo(!showKo)} className="min-h-11 px-3 rounded-lg border-2 border-foreground text-sm font-medium">한국어 {showKo ? "숨기기" : "보기"}</button>
          <button disabled={full === results.length - 1} onClick={() => setFull(full + 1)} className="min-h-11 min-w-11 rounded-lg border-2 border-foreground disabled:opacity-30 flex items-center justify-center"><ChevronRight /></button>
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

        <div className="rounded-lg bg-badge-draft text-badge-draft-foreground border border-current px-3 py-2 text-xs font-medium">
          샘플 결과 화면입니다. 실제 AI가 만든 결과가 아닙니다.
        </div>

        <section className="space-y-2">
          <div className="relative">
            <textarea value={text} maxLength={MAX} onChange={(e) => { setText(e.target.value); if (phase === "idle" || phase === "done" || phase === "error") setPhase("idle"); }}
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
              <button key={s.key} onClick={() => setText(s.key)} className="min-h-11 px-3 rounded-full border-2 border-border bg-card text-sm text-left">{s.key}</button>
            ))}
          </div>
        </section>

        {phase === "confirm" && pending?.ambiguous && (
          <div className="rounded-lg border-2 border-foreground bg-card p-4 space-y-3">
            <p className="font-bold">의미 확인이 필요해요</p>
            <p className="text-sm">{pending.ambiguous.question}</p>
            <div className="flex flex-col gap-2">
              {pending.ambiguous.options.map((o) => (
                <button key={o} onClick={() => confirm(o)} className="min-h-11 rounded-lg border-2 border-foreground font-medium">{o}</button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border-2 border-destructive text-destructive p-3 text-sm flex gap-2"><AlertCircle size={18} className="shrink-0" />{error}</div>
        )}

        {results.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">결과 {results.length}개</p>
              <button onClick={() => setResults([])} className="min-h-11 px-2 text-sm text-muted-foreground">모두 지우기</button>
            </div>
            {[...results].reverse().map((r) => {
              const idx = results.indexOf(r);
              return (
                <article key={r.id} className="rounded-lg border-2 border-foreground bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-badge-draft text-badge-draft-foreground">샘플 결과</span>
                    <span className="text-xs text-muted-foreground">{r.mode === "comic" ? "4컷" : "간단한 그림"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground break-words">원문: {r.original}</p>
                  <p className="text-lg font-bold">{r.intent}{r.note && <span className="block text-sm font-medium text-muted-foreground">({r.note})</span>}</p>
                  <Picture r={r} />
                  {trOf(r) && <p className="text-base font-medium">{trOf(r)}</p>}
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => editIntent(r.id)} className="min-h-11 rounded-lg border-2 border-border text-xs font-semibold flex flex-col items-center justify-center"><Pencil size={16} />의도 수정</button>
                    <button onClick={() => swap(r.id)} disabled={!r.sample} className="min-h-11 rounded-lg border-2 border-border text-xs font-semibold flex flex-col items-center justify-center disabled:opacity-40"><RefreshCw size={16} />그림 바꾸기</button>
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
