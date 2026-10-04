import type { Panel } from "@/components/grimmal/Scene";

export interface TemplateItem {
  original_text: string; interpreted_text: string; intent_type: string; negation: boolean;
  time_expression: string; recommended_mode: "simple" | "comic"; visual_plan: Panel[];
  translation: Record<"English" | "Japanese" | "Simplified Chinese", string>;
}

type Row = [string, string, string, Panel, [string, string, string], string?];
const rows: Row[] = [
  ["지금 몇 시인가요?", "현재 시각을 묻고 있어요", "question", { icons: ["clock"], label: "", caption: "지금 몇 시?" }, ["What time is it now?", "今何時ですか？", "现在几点？"], "지금"],
  ["화장실은 어디인가요?", "화장실 위치를 묻고 있어요", "question", { icons: ["restroom", "place"], label: "", caption: "화장실은 어디?" }, ["Where is the restroom?", "トイレはどこですか？", "洗手间在哪里？"]],
  ["이 음식에 땅콩을 넣지 말아 주세요.", "음식에서 땅콩을 빼 달라는 요청이에요", "exclusion", { icons: ["food", "peanut"], excluded: ["peanut"], label: "", caption: "땅콩만 빼 주세요" }, ["Please don't put peanuts in this food.", "この料理にピーナッツを入れないでください。", "请不要在这道菜里放花生。"]],
  ["이 호텔로 가고 싶어요.", "이 호텔로 이동하고 싶어요", "request", { icons: ["hotel"], arrow: true, label: "", caption: "이 호텔로 가고 싶어요" }, ["I'd like to go to this hotel.", "このホテルに行きたいです。", "我想去这家酒店。"]],
  ["가방을 잃어버렸어요. 찾아주실 수 있나요?", "가방을 잃어버려 찾는 도움을 요청해요", "request", { icons: ["bag", "search"], label: "", caption: "가방을 찾아 주세요" }, ["I lost my bag. Could you help me find it?", "かばんをなくしました。探していただけますか？", "我的包丢了，能帮我找一下吗？"]],
  ["물 좀 주세요.", "물을 달라는 요청이에요", "request", { icons: ["water"], label: "", caption: "물 주세요" }, ["Water, please.", "お水をください。", "请给我水。"]],
  ["계산할게요.", "계산(지불)하겠다는 말이에요", "statement", { icons: ["card", "money"], label: "", caption: "계산할게요" }, ["I'd like to pay.", "お会計お願いします。", "我要结账。"]],
  ["카드 결제 되나요?", "카드로 결제할 수 있는지 묻고 있어요", "question", { icons: ["card"], label: "", caption: "카드 돼요?" }, ["Can I pay by card?", "カードで払えますか？", "可以刷卡吗？"]],
  ["역은 어디인가요?", "역 위치를 묻고 있어요", "question", { icons: ["station", "place"], label: "", caption: "역은 어디?" }, ["Where is the station?", "駅はどこですか？", "车站在哪里？"]],
  ["공항에 가고 싶어요.", "공항으로 이동하고 싶어요", "request", { icons: ["airport"], arrow: true, label: "", caption: "공항으로 가고 싶어요" }, ["I want to go to the airport.", "空港に行きたいです。", "我想去机场。"]],
  ["병원에 가야 해요.", "병원으로 가야 한다는 말이에요", "request", { icons: ["hospital"], arrow: true, label: "", caption: "병원에 가야 해요" }, ["I need to go to a hospital.", "病院に行かなければなりません。", "我需要去医院。"]],
  ["택시를 불러 주세요.", "택시를 불러 달라는 요청이에요", "request", { icons: ["taxi", "phone"], label: "", caption: "택시 불러 주세요" }, ["Please call a taxi.", "タクシーを呼んでください。", "请帮我叫出租车。"]],
  ["이 버스 역에 가나요?", "이 버스가 역에 가는지 묻고 있어요", "question", { icons: ["bus", "station"], label: "", caption: "이 버스, 역에 가요?" }, ["Does this bus go to the station?", "このバスは駅に行きますか？", "这辆公交车去车站吗？"]],
  ["달걀은 빼 주세요.", "달걀을 빼 달라는 요청이에요", "exclusion", { icons: ["food", "egg"], excluded: ["egg"], label: "", caption: "달걀만 빼 주세요" }, ["No egg, please.", "卵は抜いてください。", "请不要放鸡蛋。"]],
  ["우유를 넣지 말아 주세요.", "우유를 넣지 말아 달라는 요청이에요", "exclusion", { icons: ["coffee", "milk"], excluded: ["milk"], label: "", caption: "우유는 빼 주세요" }, ["Please don't add milk.", "牛乳を入れないでください。", "请不要加牛奶。"]],
  ["와이파이 비밀번호가 뭐예요?", "와이파이 비밀번호를 묻고 있어요", "question", { icons: ["wifi"], label: "", caption: "와이파이 비밀번호?" }, ["What's the Wi-Fi password?", "Wi-Fiのパスワードは何ですか？", "Wi-Fi密码是多少？"]],
  ["지갑을 잃어버렸어요.", "지갑을 잃어버렸다는 말이에요", "statement", { icons: ["wallet", "search"], label: "", caption: "지갑을 잃어버렸어요" }, ["I lost my wallet.", "財布をなくしました。", "我的钱包丢了。"]],
  ["표는 어디서 사나요?", "표를 사는 곳을 묻고 있어요", "question", { icons: ["ticket", "place"], label: "", caption: "표는 어디서?" }, ["Where can I buy a ticket?", "切符はどこで買えますか？", "在哪里买票？"]],
  ["얼마나 기다려야 하나요?", "대기 시간을 묻고 있어요", "question", { icons: ["wait"], label: "", caption: "얼마나 기다려요?" }, ["How long do I have to wait?", "どのくらい待ちますか？", "要等多久？"]],
  ["약국은 어디인가요?", "약국 위치를 묻고 있어요", "question", { icons: ["pill", "place"], label: "", caption: "약국은 어디?" }, ["Where is the pharmacy?", "薬局はどこですか？", "药店在哪里？"]],
];

const norm = (s: string) => s.replace(/[\s.?!。？！]/g, "");
const TEMPLATES = new Map(rows.map(([t, intent, type, panel, [en, ja, zh], time]) => [norm(t), {
  original_text: t, interpreted_text: intent, intent_type: type, negation: type === "exclusion",
  time_expression: time ?? "", recommended_mode: "simple" as const, visual_plan: [panel],
  translation: { English: en, Japanese: ja, "Simplified Chinese": zh },
}]));

export const TEMPLATE_SENTENCES = rows.map((r) => r[0]);
export const findTemplate = (text: string): TemplateItem | undefined => TEMPLATES.get(norm(text));
