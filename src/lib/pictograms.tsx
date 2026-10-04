import {
  Clock, CalendarDays, Toilet, Hotel, Hospital, PlaneTakeoff, TrainFront, Footprints, Bus, CarTaxiFront,
  Utensils, GlassWater, Nut, Milk, Egg, Briefcase, Luggage, Smartphone, Wallet, Ticket, CreditCard, Banknote,
  Search, Hourglass, User, Users, MapPin, Coffee, Pill, Siren, House, Store, Camera, Key, Wifi, Baby,
  Handshake, Flame, Snowflake, type LucideIcon,
} from "lucide-react";

/** Pictogram registry. All icons: Lucide (lucide.dev), ISC license, lucide-react 0.462.0. */
export interface Pictogram {
  id: string; name: string; meaning: string; avoid: string; Icon: LucideIcon;
  category: "시간" | "장소" | "이동" | "음식" | "물건" | "행동" | "관계";
}
export const PICTO_LICENSE = "Lucide Icons · ISC License · lucide.dev";
export const PICTO_VERSION = "lucide-react@0.462.0 / registry v1";

const P = (id: string, name: string, category: Pictogram["category"], meaning: string, avoid: string, Icon: LucideIcon): Pictogram =>
  ({ id, name, category, meaning, avoid, Icon });

export const PICTOGRAMS: Pictogram[] = [
  P("clock", "시계", "시간", "시간 개념·시각", "특정 시각의 답으로 쓰지 않음", Clock),
  P("calendar", "달력", "시간", "날짜·일정", "특정 날짜를 임의로 표시하지 않음", CalendarDays),
  P("restroom", "화장실", "장소", "화장실", "목욕·샤워 의미로 쓰지 않음", Toilet),
  P("hotel", "호텔", "장소", "숙소·호텔", "호텔 이름·위치를 암시하지 않음", Hotel),
  P("hospital", "병원", "장소", "병원·진료", "진단 내용을 암시하지 않음", Hospital),
  P("airport", "공항", "장소", "공항·비행", "특정 항공사·편명 암시 금지", PlaneTakeoff),
  P("station", "역", "장소", "기차역·지하철역", "특정 노선 암시 금지", TrainFront),
  P("walk", "걷기", "이동", "걸어서 이동", "길 안내로 쓰지 않음", Footprints),
  P("bus", "버스", "이동", "버스", "특정 노선 번호 암시 금지", Bus),
  P("taxi", "택시", "이동", "택시", "일반 자가용 의미로 쓰지 않음", CarTaxiFront),
  P("train", "기차", "이동", "기차 탑승", "역(장소)과 혼동 주의", TrainFront),
  P("food", "음식", "음식", "음식·식사", "특정 요리로 단정하지 않음", Utensils),
  P("water", "물", "음식", "마실 물", "음료 전반으로 확대 해석 금지", GlassWater),
  P("peanut", "땅콩", "음식", "땅콩·견과", "알레르기 진단을 암시하지 않음", Nut),
  P("milk", "우유", "음식", "우유·유제품", "음료 전반으로 쓰지 않음", Milk),
  P("egg", "달걀", "음식", "달걀", "닭고기 의미로 쓰지 않음", Egg),
  P("coffee", "커피", "음식", "커피·따뜻한 음료", "물 대신 쓰지 않음", Coffee),
  P("bag", "가방", "물건", "가방·핸드백", "여행 짐(캐리어)과 구분", Briefcase),
  P("luggage", "캐리어", "물건", "여행 짐", "일반 가방 대신 쓰지 않음", Luggage),
  P("phone", "휴대전화", "물건", "휴대전화·화면", "전화 걸기 요청으로 단정 금지", Smartphone),
  P("wallet", "지갑", "물건", "지갑", "지불 행위와 구분", Wallet),
  P("ticket", "티켓", "물건", "표·입장권", "특정 교통수단 단정 금지", Ticket),
  P("card", "카드", "행동", "카드 결제", "현금과 혼동 금지", CreditCard),
  P("money", "현금", "행동", "현금·지불", "금액을 임의로 표시하지 않음", Banknote),
  P("search", "찾기", "행동", "찾기·탐색", "위치를 아는 것처럼 쓰지 않음", Search),
  P("wait", "기다리기", "행동", "대기·시간 소요", "시계(시각)와 구분", Hourglass),
  P("pill", "약", "물건", "약", "특정 약·처방 암시 금지", Pill),
  P("police", "경찰", "장소", "경찰·긴급", "범죄를 단정하지 않음", Siren),
  P("house", "집", "장소", "집·숙소 일반", "호텔 대신 쓰지 않음", House),
  P("shop", "가게", "장소", "상점·편의점", "특정 상호 암시 금지", Store),
  P("camera", "카메라", "물건", "사진 찍기", "감시 의미로 쓰지 않음", Camera),
  P("key", "열쇠", "물건", "열쇠·방 키", "비밀번호 의미로 쓰지 않음", Key),
  P("wifi", "와이파이", "물건", "인터넷·와이파이", "전화 신호와 혼동 금지", Wifi),
  P("baby", "아기", "관계", "아기·유아", "가족 관계를 단정하지 않음", Baby),
  P("meet", "만나기", "행동", "만남·약속", "거래·계약 의미로 쓰지 않음", Handshake),
  P("hot", "뜨거움", "음식", "뜨거운·매운", "위험·화재 의미 주의", Flame),
  P("cold", "차가움", "음식", "차가운·얼음", "날씨 의미로 단정 금지", Snowflake),
  P("place", "여기·장소", "관계", "사용자가 지칭한 장소", "실제 주소를 암시하지 않음", MapPin),
  P("other", "상대방", "관계", "상대방·직원", "특정 직업 단정 금지", Users),
  P("me", "나", "관계", "말하는 사람", "성별·국적을 특정하지 않음", User),
];
export const PICTO_MAP = Object.fromEntries(PICTOGRAMS.map((p) => [p.id, p]));
export const PICTO_IDS = PICTOGRAMS.map((p) => p.id);
