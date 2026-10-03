const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "openai/gpt-6-astra";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";

export const ICONS = [
  "person", "question", "clock", "watch", "restroom", "point", "map", "food", "peanut", "no", "please",
  "taxi", "hotel", "phone", "bag", "search", "worried", "money", "water", "hospital", "pill", "police",
  "bus", "train", "plane", "ticket", "house", "shop", "camera", "help", "ok", "sorry", "thanks",
  "meet", "here", "calendar", "car", "key", "card", "wifi", "baby", "drink", "coffee", "hot", "cold", "number",
];

const INTENTS = ["question", "request", "statement", "prohibition", "exclusion", "proposal", "greeting", "other"];

const SYSTEM = `당신은 한국어 문장을 그림 의사소통용 구조화된 의미 데이터로 바꾸는 분석기입니다. 이미지를 만들지 말고 JSON만 출력하세요.
순서: 문장 분리 → 문장 간 관계 → 의도 분류 → 대상/행동/부정/숫자/시간 추출 → 표현 방식 추천 → 꼭 필요한 경우에만 확인 질문.
규칙:
- 문장 순서를 바꾸지 말고 각 결과는 source_sentence_ids로 원문 문장에 연결. 독립 질문 여러 개는 합치지 말 것. 연결된 사건은 하나의 4컷(comic) 항목으로 묶을 수 있음.
- 질문을 답변으로 바꾸지 말 것. "지금 몇 시인가요?"는 질문이며 특정 시각을 넣지 말 것.
- 부정·제외를 반드시 보존(negation=true). 원문에 없는 진단·사건·장소·주소·시간을 추가하지 말 것.
- 숫자와 시간은 원문 그대로(오후 3시는 "오후 3시"). 숫자 라벨은 visual_plan의 label에 정확히 표기.
- 명확한 오타는 interpreted_text에서 보정하되 original_text는 그대로. 의미가 둘 이상이면 추측하지 말고 확인.
- '이거' 등 지시 대상이 그림 전달에 꼭 필요한데 불명확할 때만 needs_clarification=true, 질문은 하나, 선택지 2~4개.
- visual_plan 각 칸의 icons는 다음 ID만 사용: ${ICONS.join(", ")}. caption은 짧은 한국어.
- recommended_mode: 단일 의도면 "simple", 사건·요청 흐름이면 "comic"(4칸).
- translation: 대상 언어로 짧은 번역(없으면 빈 문자열).
출력 JSON 형식:
{"sentences":[{"id":"s1","text":"..."}],
 "items":[{"source_sentence_ids":["s1"],"original_text":"","interpreted_text":"","intent_type":"${INTENTS.join("|")}","subject":"","action":"","object":"","negation":false,"quantity":"","time_expression":"","location_expression":"","relationships":"","needs_clarification":false,"clarification_question":"","clarification_options":[],"recommended_mode":"simple|comic","visual_plan":[{"icons":["person"],"label":"","caption":""}],"translation":"","warnings":[]}]}`;

async function callModel(text: string, lang: string, apiKey: string, signal: AbortSignal) {
  const res = await fetch(GATEWAY, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      text: { format: { type: "json_object" } },
      input: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `번역 대상 언어: ${lang}\n입력:\n${text}` },
      ],
    }),
  });
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    let msg = body;
    try { msg = JSON.parse(body)?.error?.message ?? JSON.parse(body)?.message ?? body; } catch { /* keep */ }
    return { status: res.status, error: msg || "AI 요청 실패" };
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", out = "", streamErr = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const d = line.slice(5).trim();
      if (!d || d === "[DONE]") continue;
      try {
        const ev = JSON.parse(d);
        if (ev.type === "response.output_text.delta") out += ev.delta;
        else if (ev.type === "error" || ev.type === "response.failed") streamErr = ev.error?.message ?? ev.response?.error?.message ?? "AI 오류";
      } catch { /* ignore */ }
    }
  }
  if (streamErr) return { status: 502, error: streamErr };
  return { status: 200, text: out };
}

const NEG = /(않|말아|말고|빼|없이|금지|안 |못 |마세요|노 )/;
const NUM = /\d+/g;

// deno-lint-ignore no-explicit-any
function validate(data: any, original: string): string | null {
  if (!data || !Array.isArray(data.sentences) || !Array.isArray(data.items) || !data.items.length) return "형식 오류";
  const ids = new Set(data.sentences.map((s: { id: string }) => s.id));
  const srcNums = (original.match(NUM) ?? []).sort().join(",");
  for (const it of data.items) {
    for (const k of ["original_text", "interpreted_text", "intent_type", "recommended_mode"]) if (typeof it[k] !== "string") return `필드 누락: ${k}`;
    if (!Array.isArray(it.source_sentence_ids) || !it.source_sentence_ids.every((i: string) => ids.has(i))) return "문장 연결 오류";
    if (!INTENTS.includes(it.intent_type)) it.intent_type = "other";
    if (it.recommended_mode !== "comic") it.recommended_mode = "simple";
    it.warnings = Array.isArray(it.warnings) ? it.warnings : [];
    it.clarification_options = Array.isArray(it.clarification_options) ? it.clarification_options.slice(0, 4) : [];
    if (!Array.isArray(it.visual_plan) || !it.visual_plan.length) return "그림 구성 누락";
    let unsupported = false;
    for (const p of it.visual_plan) {
      p.icons = (Array.isArray(p.icons) ? p.icons : []).filter((i: string) => { const ok = ICONS.includes(i); if (!ok) unsupported = true; return ok; });
      if (!p.icons.length) p.icons = ["question"];
    }
    if (unsupported) it.warnings.push("지원하지 않는 아이콘이 있어 대체했어요.");
    if (NEG.test(it.original_text) && !it.negation) { it.negation = true; it.warnings.push("원문의 부정 표현을 보존했어요."); }
  }
  const outNums = data.items.flatMap((it: { original_text: string }) => it.original_text.match(NUM) ?? []).sort().join(",");
  if (srcNums !== outNums) return "숫자 불일치";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const { text, lang } = await req.json();
    if (typeof text !== "string" || !text.trim()) return json({ error: "입력이 비어 있어요." }, 400);
    if (text.length > 500) return json({ error: "500자 이하로 입력해 주세요." }, 400);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI 설정이 필요해요." }, 500);

    let lastErr = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await callModel(text, typeof lang === "string" ? lang : "English", apiKey, req.signal);
      if (r.status !== 200) {
        const msg = r.status === 429 ? "요청이 많아요. 잠시 후 다시 시도해 주세요." : r.status === 402 ? "AI 이용 한도를 초과했어요." : r.error;
        return json({ error: msg, limit: r.status === 402 }, r.status);
      }
      let data;
      try { data = JSON.parse(r.text!); } catch { lastErr = "형식 오류"; continue; }
      const err = validate(data, text);
      if (err) { lastErr = err; continue; }
      return json({ request_id: crypto.randomUUID(), original_text: text, ...data });
    }
    return json({ error: `분석 결과를 확인할 수 없어요 (${lastErr}). 다시 시도해 주세요.` }, 422);
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: cors });
    return json({ error: e instanceof Error ? e.message : "알 수 없는 오류" }, 500);
  }
});
