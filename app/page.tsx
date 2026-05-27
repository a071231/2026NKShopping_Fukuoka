"use client";

import { FormEvent, useMemo, useState, type ComponentType } from "react";
import {
  CalendarDays,
  Car,
  CheckSquare,
  Copy,
  Home,
  Info,
  MapPin,
  Navigation,
  Plane,
  Plus,
  ReceiptText,
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
type Expense = {
  id: string;
  title: string;
  amount: number;
  payer: Payer;
  note?: string;
  paid?: boolean;
};

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

export default function HomePage() {
  const [view, setView] = useState<View>("home");
  const [selectedDate, setSelectedDate] = useState(tripDays[0].date);
  const selectedDay = tripDays.find((day) => day.date === selectedDate) ?? tripDays[0];
  const dayItems = useMemo(
    () => itinerary.filter((item) => item.date === selectedDate),
    [selectedDate],
  );

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#2c2925]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbfaf7] pb-28 shadow-[0_0_80px_rgba(60,52,42,0.08)]">
        <TripHeader />
        <DateRail selectedDate={selectedDate} onSelect={setSelectedDate} view={view} setView={setView} />
        {view === "ledger" ? (
          <LedgerView />
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
      <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-stone-400">
        Family Trip
      </p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <h1 className="font-serif text-xl font-semibold tracking-[0.12em] text-stone-950">
          九州旅行
        </h1>
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
        <button
          onClick={() => setView("ledger")}
          className={cn("relative w-52 pb-3 pt-1 text-center text-stone-400", view === "ledger" && "text-stone-900")}
        >
          <ReceiptText className="mx-auto h-4 w-4" strokeWidth={1.6} />
          <span className="mt-1 block text-xs">帳</span>
          {view === "ledger" ? <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-stone-900" /> : null}
        </button>
        <button
          onClick={() => setView("tools")}
          className={cn("relative w-52 pb-3 pt-1 text-center text-stone-300", view === "tools" && "text-stone-900")}
        >
          <Info className="mx-auto h-4 w-4" strokeWidth={1.6} />
          <span className="mt-1 block text-xs">訊</span>
        </button>
      </div>
    </div>
  );
}

function JourneyBanner({ day }: { day: (typeof tripDays)[number] }) {
  return (
    <section className="relative mx-[60px] mt-1 overflow-hidden border border-stone-200 bg-stone-900 shadow-[0_12px_24px_rgba(58,51,44,0.2)]">
      <img src={hotel.image} alt="九州旅行" className="h-[102px] w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/30" />
      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
        <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-white/70">
          {day.label}
          <MapPin className="h-3 w-3" />
          {day.city}
        </p>
        <h2 className="mt-1 font-serif text-xl font-semibold tracking-[0.08em]">
          加藤清正的熊本城
        </h2>
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
          <h2 className="font-serif text-3xl font-semibold tracking-[0.06em] text-stone-900">
            當地天氣
          </h2>
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
            className={cn("h-7 min-w-7 rounded-full border px-2 font-serif text-xs transition", page === index ? "border-[#8f293d] bg-[#8f293d] text-white" : "border-stone-200 bg-white/70 text-stone-400")}
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
        <p className="font-serif text-xl text-stone-500">尚未建立當日行程</p>
        <p className="mt-2 text-sm text-stone-300">可先保留日期，之後再補上詳細安排。</p>
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
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        amount: Math.round(parsedAmount),
        payer,
      },
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
            <h2 className="font-serif text-3xl font-semibold tracking-[0.04em] text-stone-900">
              旅行帳本
            </h2>
          </div>
          <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            Online
          </span>
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
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-full border px-3 font-serif text-sm",
              filter === item ? "border-[#3c3631] bg-[#3c3631] text-white" : "border-stone-200 bg-white text-stone-400",
            )}
          >
            {item === "all" ? "全部" : item}
          </button>
        ))}
      </div>

      <div className="mt-6 border border-stone-200 bg-white/72 shadow-[0_12px_34px_rgba(60,52,42,0.05)]">
        <div className="border-b border-stone-200 p-6">
          <p className="text-sm text-stone-400">總金額（台幣）</p>
          <p className="mt-2 font-serif text-5xl font-semibold text-stone-900">
            ${total.toLocaleString()}
          </p>
          <p className="mt-2 text-sm font-semibold text-stone-500">
            每人均攤: ${Math.round(total / 5).toLocaleString()}
          </p>
        </div>

        {visibleExpenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between border-b border-stone-100 p-4 last:border-b-0">
            <div>
              <p className="font-semibold text-stone-800">{expense.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs", payerStyle[expense.payer])}>
                  {expense.payer}
                </span>
                <span className="rounded bg-stone-50 px-2 py-0.5 text-[10px] text-stone-400">
                  {expense.paid ? "已付" : "未付"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-sm font-semibold text-stone-600">${expense.amount.toLocaleString()}</p>
              <button
                onClick={() => setExpenses((current) => current.filter((item) => item.id !== expense.id))}
                className="text-stone-300"
                aria-label="刪除款項"
              >
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
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="款項名稱"
            className="mt-5 w-full border-b border-stone-300 bg-transparent py-3 text-xl outline-none placeholder:text-stone-300"
            autoFocus
          />
          <div className="mt-5 flex items-end gap-3">
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="numeric"
              placeholder="0"
              className="min-w-0 flex-1 border-b border-stone-300 bg-transparent py-3 font-serif text-4xl outline-none placeholder:text-stone-200"
            />
            <span className="border border-stone-200 bg-stone-50 px-4 py-3 font-serif text-sm text-stone-500">JPY</span>
          </div>
          <div className="mt-5 flex gap-2">
            {(["K", "M", "E", "G", "J"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPayer(item)}
                className={cn("h-9 w-9 rounded-full border font-serif text-sm", payer === item ? payerStyle[item] : "border-stone-200 text-stone-300")}
              >
                {item}
              </button>
            ))}
          </div>
          <button type="submit" className="mt-6 h-12 w-full bg-[#3c3631] font-serif text-lg tracking-[0.16em] text-white">
            完成新增
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-12 flex h-14 w-full items-center justify-center gap-2 bg-[#3c3631] font-serif text-lg tracking-[0.18em] text-white shadow-[0_12px_22px_rgba(60,52,42,0.18)]"
        >
          <Plus className="h-4 w-4" />
          記一筆
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
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn("flex h-12 flex-col items-center justify-center gap-1 text-[11px]", view === item.id ? "text-[#8f293d]" : "text-stone-400")}
            >
              <Icon className="h-4 w-4" strokeWidth={1.6} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
