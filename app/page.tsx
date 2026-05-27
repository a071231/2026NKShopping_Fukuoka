"use client";

import { FormEvent, useMemo, useState, type ComponentType } from "react";
import {
  CalendarDays,
  Car,
  CheckSquare,
  Copy,
  ExternalLink,
  Home,
  Info,
  Map,
  MapPin,
  Navigation,
  PackagePlus,
  Phone,
  Plus,
  ReceiptText,
  Shield,
  ShoppingBag,
  Sun,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

import { hotel, itinerary, tripDays, weatherForecast, type ItineraryCategory } from "@/data/trip";
import { cn } from "@/lib/utils";

type View = "home" | "tools" | "ledger" | "checklist";
type Payer = "K" | "M" | "E" | "G" | "J";
type Expense = { id: string; title: string; amount: number; payer: Payer; paid?: boolean };
type ChecklistItem = { id: string; label: string; done: boolean };
type ChecklistCategory = { id: string; title: string; accent: string; items: ChecklistItem[] };

const mapUrl = "https://maps.app.goo.gl/oYZVFgyA9oiwbB7Q7";

const payerStyle: Record<Payer, string> = {
  K: "border-blue-200 bg-blue-50 text-blue-600",
  M: "border-pink-200 bg-pink-50 text-pink-600",
  E: "border-amber-200 bg-amber-50 text-amber-700",
  G: "border-emerald-200 bg-emerald-50 text-emerald-700",
  J: "border-violet-200 bg-violet-50 text-violet-700",
};

const categoryMeta: Record<
  ItineraryCategory,
  { en: string; icon: ComponentType<{ className?: string; strokeWidth?: number }>; color: string }
> = {
  交通: { en: "TRANSPORT", icon: Car, color: "text-sky-700" },
  食物: { en: "FOOD", icon: Utensils, color: "text-amber-700" },
  購物: { en: "SHOPPING", icon: ShoppingBag, color: "text-rose-700" },
  景點: { en: "ACTIVITY", icon: Navigation, color: "text-emerald-700" },
};

const initialExpenses: Expense[] = [
  { id: "e1", title: "星宇航空機票", amount: 148100, payer: "K", paid: true },
  { id: "e2", title: "The Blossom Kumamoto x1晚", amount: 15383, payer: "K", paid: true },
  { id: "e3", title: "月洸樹 黑川 x1晚", amount: 81503, payer: "K" },
  { id: "e4", title: "由布院 玉の湯 x1晚", amount: 55941, payer: "M" },
  { id: "e5", title: "Grand Hyatt Fukuoka x3晚", amount: 123105, payer: "E", paid: true },
  { id: "e6", title: "觀光列車車票", amount: 24895, payer: "G", paid: true },
  { id: "e7", title: "D1 午餐 魚飯時", amount: 3458, payer: "J", paid: true },
];

const initialChecklist: ChecklistCategory[] = [
  {
    id: "docs",
    title: "證件錢包",
    accent: "bg-[#8f293d]",
    items: [
      { id: "docs-1", label: "護照", done: false },
      { id: "docs-2", label: "日幣現金", done: false },
      { id: "docs-3", label: "信用卡", done: false },
      { id: "docs-4", label: "駕照 / 國際駕照", done: false },
    ],
  },
  {
    id: "digital",
    title: "電子產品",
    accent: "bg-[#b99a58]",
    items: [
      { id: "digital-1", label: "E-SIM", done: true },
      { id: "digital-2", label: "耳機", done: false },
      { id: "digital-3", label: "充電線", done: false },
      { id: "digital-4", label: "行動電源", done: false },
      { id: "digital-5", label: "相機", done: false },
    ],
  },
  {
    id: "daily",
    title: "衣物用品",
    accent: "bg-[#6f7466]",
    items: [
      { id: "daily-1", label: "外套", done: false },
      { id: "daily-2", label: "睡衣", done: false },
      { id: "daily-3", label: "換洗衣物", done: false },
      { id: "daily-4", label: "雨具", done: false },
    ],
  },
];

export default function HomePage() {
  const [view, setView] = useState<View>("home");
  const [selectedDate, setSelectedDate] = useState(tripDays[0].date);
  const selectedDay = tripDays.find((day) => day.date === selectedDate) ?? tripDays[0];
  const dayItems = useMemo(() => itinerary.filter((item) => item.date === selectedDate), [selectedDate]);

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#2c2925]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbfaf7] pb-28 shadow-[0_0_80px_rgba(60,52,42,0.08)]">
        <TripHeader />
        <DateRail selectedDate={selectedDate} onSelect={setSelectedDate} view={view} setView={setView} />
        {view === "tools" ? (
          <ToolsView />
        ) : view === "ledger" ? (
          <LedgerView />
        ) : view === "checklist" ? (
          <ChecklistView />
        ) : (
          <>
            <JourneyBanner day={selectedDay} />
            <WeatherStripPaged />
            <StayCard />
            <Timeline dayItems={dayItems} />
          </>
        )}
      </div>
      <BottomNavigation view={view} setView={setView} />
    </main>
  );
}

function TripHeader() {
  return (
    <header className="pt-[76px] text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-stone-400">Family Trip</p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <h1 className="font-serif text-xl font-semibold tracking-[0.12em] text-stone-950">九州旅行</h1>
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/80 font-serif text-[11px] text-stone-500">
          2026
        </span>
      </div>
    </header>
  );
}

function DateRail({
  selectedDate,
  onSelect,
  view,
  setView,
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
  view: View;
  setView: (view: View) => void;
}) {
  return (
    <div className="mt-6 flex border-b border-stone-200/70">
      <nav className="no-scrollbar flex min-w-0 flex-1 overflow-x-auto px-2">
        {tripDays.map((day) => {
          const active = day.date === selectedDate && view === "home";
          return (
            <button
              key={day.date}
              onClick={() => {
                onSelect(day.date);
                setView("home");
              }}
              className="relative shrink-0 basis-[calc(100%/6.5)] pb-3 text-center"
            >
              <span className={cn("block text-[10px] font-semibold tracking-[0.16em]", active ? "text-stone-900" : "text-stone-300")}>
                {day.weekday}
              </span>
              <span className={cn("mt-1 block font-serif text-2xl leading-none", active ? "text-stone-950" : "text-stone-300")}>
                {day.day}
              </span>
              {active ? <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#8f293d]" /> : null}
            </button>
          );
        })}
      </nav>
      <div className="flex shrink-0 border-l border-stone-200">
        <button onClick={() => setView("ledger")} className={cn("relative w-12 pb-3 pt-1 text-center text-stone-400", view === "ledger" && "text-stone-900")}>
          <ReceiptText className="mx-auto h-4 w-4" strokeWidth={1.6} />
          <span className="mt-1 block text-xs">帳</span>
          {view === "ledger" ? <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-stone-900" /> : null}
        </button>
        <button onClick={() => setView("tools")} className={cn("relative w-12 pb-3 pt-1 text-center text-stone-300", view === "tools" && "text-stone-900")}>
          <Info className="mx-auto h-4 w-4" strokeWidth={1.6} />
          <span className="mt-1 block text-xs">訊</span>
          {view === "tools" ? <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-stone-900" /> : null}
        </button>
      </div>
    </div>
  );
}

function JourneyBanner({ day }: { day: (typeof tripDays)[number] }) {
  return (
    <section className="relative mx-[60px] mt-1 overflow-hidden border border-stone-200 bg-stone-900 shadow-[0_12px_24px_rgba(58,51,44,0.2)]">
      <img src={hotel.image} alt="福岡旅行" className="h-[102px] w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/30" />
      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
        <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-white/70">
          {day.label}
          <MapPin className="h-3 w-3" />
          {day.city}
        </p>
        <h2 className="mt-1 font-serif text-xl font-semibold tracking-[0.08em]">福岡旅行 2026</h2>
      </div>
    </section>
  );
}

function WeatherStripPaged() {
  const pageSize = 5;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(weatherForecast.length / pageSize);
  const visibleWeather = weatherForecast.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <section className="mt-8 border-b border-stone-200/70 pb-8">
      <div className="flex items-end justify-between px-5">
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-[0.06em] text-stone-900">當地天氣</h2>
          <p className="mt-1 text-xs tracking-[0.16em] text-stone-300">未來數日預報</p>
        </div>
        <span className="text-[10px] text-stone-300">Open-Meteo</span>
      </div>
      <div className="mt-7 grid grid-cols-5 px-2">
        {visibleWeather.map((item) => (
          <div key={item.date} className="px-1 text-center">
            <p className="font-serif text-sm text-stone-500">{item.date}</p>
            <Sun className="mx-auto mt-4 h-7 w-7 text-stone-600" strokeWidth={1.4} />
            <p className="mt-4 font-serif text-2xl text-stone-800">{item.high}</p>
            <p className="mt-1 font-serif text-base text-stone-400">{item.low}</p>
            <p className="mt-2 line-clamp-1 text-[10px] text-stone-400">{item.condition}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setPage(index)}
            className={cn(
              "h-7 min-w-7 rounded-full border px-2 font-serif text-xs transition",
              page === index ? "border-[#8f293d] bg-[#8f293d] text-white" : "border-stone-200 bg-white/70 text-stone-400",
            )}
            aria-label={`顯示第 ${index + 1} 頁天氣`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </section>
  );
}

function StayCard() {
  return (
    <section className="mt-8 border-l-[3px] border-[#cf9aa2] py-1 pl-5 pr-5">
      <div className="border border-stone-200 bg-white/70 shadow-[0_12px_32px_rgba(60,52,42,0.05)]">
        <img src={hotel.image} alt={hotel.name} className="aspect-[19/8] w-full object-cover" />
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-stone-300">住宿資訊</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#8f293d]">{hotel.name}</h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-stone-400">
              <CalendarDays className="h-4 w-4" />
              {hotel.dates}
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-stone-400">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {hotel.address}
            </p>
          </div>
          <button className="mt-2 text-[#8f293d]" aria-label="複製住宿資訊">
            <Copy className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Timeline({ dayItems }: { dayItems: typeof itinerary }) {
  if (dayItems.length === 0) {
    return (
      <section className="mx-5 mt-10 border border-dashed border-stone-200 bg-white/60 p-8 text-center">
        <p className="font-serif text-xl text-stone-500">這天還沒有行程</p>
        <p className="mt-2 text-sm text-stone-300">可以先保留彈性，之後再補上安排。</p>
      </section>
    );
  }

  return (
    <section className="mx-5 mt-10">
      <div className="relative">
        <div className="absolute left-[66px] top-0 h-full w-px bg-stone-200" />
        <div className="space-y-10">
          {dayItems.map((item) => {
            const meta = categoryMeta[item.category];
            const Icon = meta.icon;
            return (
              <article key={item.id} className="relative grid grid-cols-[82px_1fr] gap-5">
                <time className="pt-1 font-serif text-2xl font-semibold text-stone-900">{item.time}</time>
                <div className="relative border-l border-stone-200 pl-6">
                  <span className="absolute -left-[5px] top-3 h-2.5 w-2.5 rounded-full border border-stone-300 bg-[#fbfaf7]" />
                  <h3 className="font-serif text-xl font-semibold tracking-[0.02em] text-stone-900">{item.title}</h3>
                  <div className={cn("mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]", meta.color)}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>{meta.en}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-stone-500">{item.description}</p>
                  <p className="mt-3 text-xs leading-relaxed text-stone-300">{item.address}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ToolsView() {
  const infoCards = [
    { type: "RESERVATION", title: "Toyota Rent a Car (熊本)", detail: "10/3 取車" },
    { type: "HOTEL", title: "The Blossom Kumamoto", detail: "住宿地址與訂房資訊" },
    { type: "HOTEL", title: "由布院 玉の湯", detail: "Open Link →" },
    { type: "ACTIVITY", title: "茅乃舍 餐廳", detail: "Open Link →" },
  ];

  return (
    <section className="px-5 pt-6">
      <p className="text-sm tracking-[0.08em] text-stone-500">全覽地圖與重要資訊</p>

      <div className="mt-8 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-[0_12px_30px_rgba(60,52,42,0.06)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-teal-700">
            <Map className="h-4 w-4" />
            <span className="font-semibold">全九州地圖</span>
          </div>
          <span className="text-xs text-stone-300">Google Maps</span>
        </div>
        <div className="relative h-[250px] overflow-hidden bg-[#dcebdc]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#dcebdc_0%,#e9f1dc_42%,#b9d7e4_43%,#b9d7e4_58%,#efe0bf_59%,#f7ead0_100%)]" />
          {["福岡", "熊本", "阿蘇", "由布院", "北九州"].map((city, index) => (
            <span
              key={city}
              className="absolute rounded-full border-2 border-white bg-[#8f293d] px-2 py-1 text-xs font-semibold text-white shadow"
              style={{ left: `${18 + index * 14}%`, top: `${30 + (index % 3) * 14}%` }}
            >
              {city}
            </span>
          ))}
          <div className="absolute right-3 bottom-4 overflow-hidden rounded border border-stone-300 bg-white shadow">
            <div className="px-3 py-1 text-xl">+</div>
            <div className="border-t px-3 py-1 text-xl">−</div>
          </div>
        </div>
        <a href={mapUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 font-serif text-blue-700">
          <ExternalLink className="h-4 w-4" />
          開啟 Google Maps 導航
        </a>
      </div>

      <a href="https://www.vjw.digital.go.jp/" target="_blank" rel="noreferrer" className="mt-5 block overflow-hidden rounded-md bg-[#191817] p-7 text-white shadow-[0_12px_28px_rgba(24,22,20,0.25)]">
        <span className="rounded bg-[#c64f6b] px-3 py-1 text-xs font-semibold tracking-[0.18em]">MUST HAVE</span>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold">Visit Japan Web</h2>
            <p className="mt-2 text-sm text-white/50">入境審查 & 海關申報</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <ExternalLink className="h-6 w-6" />
          </span>
        </div>
      </a>

      <section className="mt-9">
        <div className="mb-4 flex items-center gap-2 text-[#8f293d]">
          <Shield className="h-5 w-5" />
          <h2 className="font-serif text-2xl font-semibold">緊急聯絡 & 支援</h2>
        </div>
        <div className="border border-stone-200 bg-white">
          <div className="grid grid-cols-2 border-b border-stone-200 text-center">
            <div className="border-r border-stone-200 p-5">
              <p className="text-sm font-semibold text-[#8f293d]">警察 (POLICE)</p>
              <p className="mt-2 font-serif text-4xl font-semibold text-[#8f293d]">110</p>
            </div>
            <div className="p-5">
              <p className="text-sm font-semibold text-[#8f293d]">救護 / 火警</p>
              <p className="mt-2 font-serif text-4xl font-semibold text-[#8f293d]">119</p>
            </div>
          </div>
          <div className="relative p-5">
            <p className="text-lg font-bold">訪日外國人醫療 & 急難熱線</p>
            <p className="mt-1 text-xs tracking-[0.16em] text-stone-400">JAPAN VISITOR HOTLINE</p>
            <p className="mt-3 font-serif text-3xl font-bold text-stone-700">050-3816-2787</p>
            <a href="tel:05038162787" className="absolute right-5 top-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#3c3631] text-white shadow-lg">
              <Phone className="h-6 w-6" />
            </a>
          </div>
          <div className="border-t border-stone-100 p-5 text-sm leading-7 text-stone-600">
            <p>外文部 台北駐福岡經濟文化辦事處</p>
            <p>092-734-2810（上班時間）</p>
            <p className="font-bold text-[#8f293d]">090-1922-9740（急難救助）</p>
          </div>
        </div>
      </section>

      <section className="mt-9">
        <div className="mb-4 flex items-center gap-2">
          <Car className="h-5 w-5" />
          <h2 className="font-serif text-2xl font-semibold">交通卡片</h2>
        </div>
        <div className="border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-300">給司機 (TO DRIVER)</p>
          <p className="mt-4 font-serif text-2xl font-semibold">ここへ行ってください。</p>
          <p className="mt-2 text-sm text-stone-400">請載我到這裡</p>
        </div>
      </section>

      <section className="mt-9 space-y-4">
        {infoCards.map((card) => (
          <article key={card.title} className="border border-stone-200 bg-white p-5 shadow-[0_8px_22px_rgba(60,52,42,0.04)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-stone-300">{card.type}</p>
            <h3 className="mt-3 font-serif text-xl font-semibold">{card.title}</h3>
            <div className="mt-5 flex items-center justify-between border-t border-dashed border-stone-200 pt-4">
              <p className="text-sm text-stone-400">{card.detail}</p>
              <Copy className="h-4 w-4 text-stone-300" />
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function LedgerView() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [filter, setFilter] = useState<"all" | Payer>("all");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState<Payer>("K");

  const visibleExpenses = filter === "all" ? expenses : expenses.filter((item) => item.payer === filter);
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount.replace(/,/g, ""));
    if (!title.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    setExpenses((current) => [
      ...current,
      { id: crypto.randomUUID(), title: title.trim(), amount: Math.round(parsedAmount), payer },
    ]);
    setTitle("");
    setAmount("");
    setPayer("K");
    setAdding(false);
  }

  return (
    <section className="px-5 pt-7">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-stone-700" strokeWidth={1.7} />
            <h2 className="font-serif text-3xl font-semibold tracking-[0.04em] text-stone-900">旅行帳本</h2>
          </div>
          <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Online</span>
        </div>
        <div className="text-right text-xs text-stone-300">
          <p>全部顯示</p>
          <p>{expenses.length} 筆項目</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {(["all", "K", "M", "E", "G", "J"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={cn("flex h-8 min-w-8 items-center justify-center rounded-full border px-3 font-serif text-sm", filter === item ? "border-[#3c3631] bg-[#3c3631] text-white" : "border-stone-200 bg-white text-stone-400")}
          >
            {item === "all" ? "全部" : item}
          </button>
        ))}
      </div>

      <div className="mt-6 border border-stone-200 bg-white/72 shadow-[0_12px_34px_rgba(60,52,42,0.05)]">
        <div className="border-b border-stone-200 p-6">
          <p className="text-sm text-stone-400">總金額（台幣）</p>
          <p className="mt-2 font-serif text-5xl font-semibold text-stone-900">${total.toLocaleString()}</p>
          <p className="mt-2 text-sm font-semibold text-stone-500">每人均攤: ${Math.round(total / 5).toLocaleString()}</p>
        </div>

        {visibleExpenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between border-b border-stone-100 p-4 last:border-b-0">
            <div>
              <p className="font-semibold text-stone-800">{expense.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs", payerStyle[expense.payer])}>{expense.payer}</span>
                <span className="rounded bg-stone-50 px-2 py-0.5 text-[10px] text-stone-400">{expense.paid ? "已付" : "未付"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-sm font-semibold text-stone-600">${expense.amount.toLocaleString()}</p>
              <button onClick={() => setExpenses((current) => current.filter((item) => item.id !== expense.id))} className="text-stone-300" aria-label="刪除項目">
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {adding ? (
        <form onSubmit={addExpense} className="mt-5 border border-stone-200 bg-white/90 p-5 shadow-[0_12px_34px_rgba(60,52,42,0.07)]">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <p className="text-sm tracking-[0.18em] text-stone-400">新增款項</p>
            <button type="button" onClick={() => setAdding(false)} className="text-stone-400" aria-label="關閉新增款項">
              <X className="h-5 w-5" />
            </button>
          </div>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="款項名稱" className="mt-5 w-full border-b border-stone-300 bg-transparent py-3 text-xl outline-none placeholder:text-stone-300" autoFocus />
          <div className="mt-5 flex items-end gap-3">
            <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="numeric" placeholder="0" className="min-w-0 flex-1 border-b border-stone-300 bg-transparent py-3 font-serif text-4xl outline-none placeholder:text-stone-200" />
            <span className="border border-stone-200 bg-stone-50 px-4 py-3 font-serif text-sm text-stone-500">JPY</span>
          </div>
          <div className="mt-5 flex gap-2">
            {(["K", "M", "E", "G", "J"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setPayer(item)} className={cn("h-9 w-9 rounded-full border font-serif text-sm", payer === item ? payerStyle[item] : "border-stone-200 text-stone-300")}>
                {item}
              </button>
            ))}
          </div>
          <button type="submit" className="mt-6 h-12 w-full bg-[#3c3631] font-serif text-lg tracking-[0.16em] text-white">加入款項</button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="mt-12 flex h-14 w-full items-center justify-center gap-2 bg-[#3c3631] font-serif text-lg tracking-[0.18em] text-white shadow-[0_12px_22px_rgba(60,52,42,0.18)]">
          <Plus className="h-4 w-4" />
          記一筆
        </button>
      )}
    </section>
  );
}

function ChecklistView() {
  const [categories, setCategories] = useState(initialChecklist);
  const [adding, setAdding] = useState(false);
  const [categoryId, setCategoryId] = useState(initialChecklist[0].id);
  const [label, setLabel] = useState("");

  const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0);
  const doneItems = categories.reduce((sum, category) => sum + category.items.filter((item) => item.done).length, 0);

  function toggleItem(categoryIdToUpdate: string, itemId: string) {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryIdToUpdate
          ? { ...category, items: category.items.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)) }
          : category,
      ),
    );
  }

  function removeItem(categoryIdToUpdate: string, itemId: string) {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryIdToUpdate ? { ...category, items: category.items.filter((item) => item.id !== itemId) } : category,
      ),
    );
  }

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? { ...category, items: [...category.items, { id: crypto.randomUUID(), label: trimmedLabel, done: false }] }
          : category,
      ),
    );
    setLabel("");
    setAdding(false);
  }

  return (
    <section className="px-5 pt-7">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-stone-300">Packing</p>
          <div className="mt-2 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-[#8f293d]" strokeWidth={1.7} />
            <h2 className="font-serif text-3xl font-semibold tracking-[0.04em] text-stone-900">準備清單</h2>
          </div>
        </div>
        <div className="rounded-full border border-stone-200 bg-white/70 px-4 py-2 text-right shadow-sm">
          <p className="font-serif text-lg text-stone-800">
            {doneItems}/{totalItems}
          </p>
          <p className="text-[10px] tracking-[0.16em] text-stone-300">READY</p>
        </div>
      </div>

      <div className="mt-7 space-y-5">
        {categories.map((category) => {
          const done = category.items.filter((item) => item.done).length;
          return (
            <article key={category.id} className="relative overflow-hidden rounded-[18px] border border-stone-200 bg-white/82 shadow-[0_16px_36px_rgba(60,52,42,0.07)]">
              <span className={cn("absolute inset-y-0 left-0 w-1.5", category.accent)} />
              <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
                <h3 className="font-serif text-xl font-semibold text-stone-900">{category.title}</h3>
                <span className="rounded-full bg-[#f3efe8] px-3 py-1 font-serif text-xs text-stone-500">
                  {done}/{category.items.length}
                </span>
              </div>
              <div className="divide-y divide-stone-100">
                {category.items.map((item) => (
                  <div key={item.id} className="flex min-h-14 items-center gap-3 px-5 py-3">
                    <button
                      onClick={() => toggleItem(category.id, item.id)}
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
                        item.done ? "border-[#8f293d] bg-[#8f293d] text-white" : "border-stone-300 bg-white text-transparent",
                      )}
                      aria-label={item.done ? "標記為未完成" : "標記為完成"}
                    >
                      <CheckSquare className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <span className={cn("flex-1 text-sm font-medium", item.done ? "text-stone-300 line-through" : "text-stone-800")}>
                      {item.label}
                    </span>
                    <button onClick={() => removeItem(category.id, item.id)} className="text-stone-300" aria-label="刪除物品">
                      <X className="h-4 w-4" strokeWidth={1.6} />
                    </button>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {adding ? (
        <form onSubmit={addItem} className="mt-6 rounded-[18px] border border-stone-200 bg-white/90 p-5 shadow-[0_16px_36px_rgba(60,52,42,0.07)]">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <p className="text-sm tracking-[0.18em] text-stone-400">新增物品</p>
            <button type="button" onClick={() => setAdding(false)} className="text-stone-400" aria-label="關閉新增物品">
              <X className="h-5 w-5" />
            </button>
          </div>
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-5 w-full border border-stone-200 bg-[#fbfaf7] px-4 py-3 text-sm text-stone-600 outline-none">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
          <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="物品名稱" className="mt-4 w-full border-b border-stone-300 bg-transparent py-3 text-xl outline-none placeholder:text-stone-300" autoFocus />
          <button type="submit" className="mt-6 h-12 w-full rounded-full bg-[#3c3631] font-serif text-lg tracking-[0.16em] text-white">
            加入清單
          </button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="mt-8 flex h-16 w-full items-center justify-center gap-2 rounded-full bg-[#191817] font-serif text-xl tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(60,52,42,0.2)]">
          <PackagePlus className="h-5 w-5" strokeWidth={1.6} />
          新增物品
        </button>
      )}
    </section>
  );
}

function BottomNavigation({ view, setView }: { view: View; setView: (view: View) => void }) {
  const navItems = [
    { id: "home" as const, label: "首頁", icon: Home },
    { id: "tools" as const, label: "資訊", icon: Info },
    { id: "ledger" as const, label: "記帳", icon: ReceiptText },
    { id: "checklist" as const, label: "準備清單", icon: CheckSquare },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-[#fbfaf7]/92 px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[390px] grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => setView(item.id)} className={cn("flex h-12 flex-col items-center justify-center gap-1 text-[11px]", view === item.id ? "text-[#8f293d]" : "text-stone-400")}>
              <Icon className="h-4 w-4" strokeWidth={1.6} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
