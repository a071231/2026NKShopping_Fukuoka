"use client";

import { useMemo, useState, type ComponentType } from "react";
import {
  CalendarDays,
  CheckSquare,
  Copy,
  Home,
  Info,
  MapPin,
  Navigation,
  ReceiptText,
  ShoppingBag,
  Sun,
  TrainFront,
  Utensils,
} from "lucide-react";

import { hotel, itinerary, tripDays, weather, weatherForecast, type ItineraryCategory } from "@/data/trip";
import { cn } from "@/lib/utils";

const categoryMeta: Record<
  ItineraryCategory,
  { en: string; icon: ComponentType<{ className?: string; strokeWidth?: number }>; color: string }
> = {
  交通: { en: "TRANSPORT", icon: TrainFront, color: "border-sky-200 text-sky-700" },
  食物: { en: "FOOD", icon: Utensils, color: "border-amber-200 text-amber-700" },
  購物: { en: "SHOPPING", icon: ShoppingBag, color: "border-rose-200 text-rose-700" },
  景點: { en: "ACTIVITY", icon: Navigation, color: "border-emerald-200 text-emerald-700" },
};

const navItems = [
  { label: "首頁", icon: Home, active: true },
  { label: "資訊", icon: Info },
  { label: "記帳", icon: ReceiptText },
  { label: "準備清單", icon: CheckSquare },
];

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(tripDays[0].date);
  const selectedDay = tripDays.find((day) => day.date === selectedDate) ?? tripDays[0];
  const dayItems = useMemo(
    () => itinerary.filter((item) => item.date === selectedDate),
    [selectedDate],
  );
  const currentItem = dayItems[dayItems.length - 1] ?? itinerary[0];

  return (
    <main className="min-h-screen bg-[#f8f6f1] pb-28 text-[#2c2925] md:pb-14">
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-12 md:px-10 lg:px-14">
        <TripHeader />

        <div className="mx-auto mt-3 grid max-w-6xl gap-10 lg:grid-cols-[1fr_390px] lg:items-start">
          <div>
            <JourneyBanner day={selectedDay} />
            <WeatherStripPaged />
            <StayCard />
            <DateRail selectedDate={selectedDate} onSelect={setSelectedDate} />
            <Timeline dayItems={dayItems} />
          </div>

          <aside className="hidden lg:block">
            <InfoPanel />
          </aside>
        </div>
      </div>

      <NowCard item={currentItem} />
      <BottomNavigation />
    </main>
  );
}

function TripHeader() {
  return (
    <header className="text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.36em] text-stone-400">
        Family Trip
      </p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <h1 className="font-serif text-xl font-semibold tracking-[0.12em] text-stone-900 md:text-2xl">
          福岡旅行
        </h1>
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white/70 font-serif text-xs text-stone-500 shadow-[0_8px_30px_rgba(70,60,45,0.06)]">
          2026
        </span>
      </div>
    </header>
  );
}

function DateRail({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  return (
    <nav className="no-scrollbar -mx-5 mt-10 flex overflow-x-auto border-b border-stone-200/80 px-5 md:mx-auto md:max-w-3xl md:justify-center md:px-0">
      {tripDays.map((day) => {
        const active = day.date === selectedDate;
        return (
          <button
            key={day.date}
            onClick={() => onSelect(day.date)}
            className="relative min-w-[74px] px-3 pb-3 text-center transition md:min-w-[94px]"
          >
            <span
              className={cn(
                "block text-[10px] font-semibold tracking-[0.18em]",
                active ? "text-[#7d2437]" : "text-stone-300",
              )}
            >
              {day.weekday}
            </span>
            <span
              className={cn(
                "mt-1 block font-serif text-2xl leading-none",
                active ? "text-stone-950" : "text-stone-300",
              )}
            >
              {day.day}
            </span>
            {active ? (
              <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#7d2437]" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

function JourneyBanner({ day }: { day: (typeof tripDays)[number] }) {
  return (
    <section className="relative mx-auto mt-3 max-w-[720px] overflow-hidden border border-stone-200 bg-stone-900 shadow-[0_18px_35px_rgba(58,51,44,0.18)]">
      <img src={hotel.image} alt="福岡旅行" className="h-32 w-full object-cover md:h-52" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/28 to-black/20" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-6">
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/70">
          {day.label}
          <MapPin className="h-3 w-3" />
          {day.city}
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-[0.08em] md:text-4xl">
          福岡旅行 2026
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
    <section className="mt-12 border-b border-t border-stone-200 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-[0.08em] text-stone-900">
            當地天氣
          </h2>
          <p className="mt-1 text-xs tracking-[0.16em] text-stone-300">未來數日預報</p>
        </div>
        <span className="text-xs text-stone-300">Open-Meteo</span>
      </div>

      <div className="mt-8 grid grid-cols-5">
        {visibleWeather.map((item) => (
          <div
            key={item.date}
            className="border-r border-stone-200/70 px-2 text-center last:border-r-0"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-300">
              {item.weekday}
            </p>
            <p className="mt-1 font-serif text-lg text-stone-500">{item.date}</p>
            <Sun className="mx-auto mt-4 h-7 w-7 text-stone-600" strokeWidth={1.4} />
            <p className="mt-4 font-serif text-2xl text-stone-800">{item.high}</p>
            <p className="mt-1 font-serif text-lg text-stone-400">{item.low}</p>
            <p className="mt-3 line-clamp-1 text-[11px] text-stone-500">{item.condition}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-stone-300">
              {item.rain}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-center gap-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setPage(index)}
            className={cn(
              "h-8 min-w-8 rounded-full border px-3 font-serif text-sm transition",
              page === index
                ? "border-[#7d2437] bg-[#7d2437] text-white"
                : "border-stone-200 bg-white/50 text-stone-400",
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

function WeatherStrip() {
  return (
    <section className="mt-12 border-b border-t border-stone-200 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-[0.08em] text-stone-900">
            福岡市 天氣資訊
          </h2>
          <p className="mt-1 text-xs tracking-[0.16em] text-stone-300">未來 24 小時預報</p>
        </div>
        <span className="text-xs text-stone-300">Open-Meteo</span>
      </div>

      <div className="no-scrollbar -mx-5 mt-8 overflow-x-auto px-5 md:mx-0 md:px-0">
        <div className="flex w-max min-w-full">
          {weather.map((item) => (
            <div
              key={item.date}
              className="w-[20vw] min-w-[72px] max-w-[112px] shrink-0 border-r border-stone-200/70 px-2 text-center last:border-r-0 md:w-[20%] md:max-w-none"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-300">
                {item.weekday}
              </p>
              <p className="mt-1 font-serif text-lg text-stone-500">{item.date}</p>
              <Sun className="mx-auto mt-4 h-7 w-7 text-stone-600" strokeWidth={1.4} />
              <p className="mt-4 font-serif text-2xl text-stone-800">{item.high}</p>
              <p className="mt-1 font-serif text-lg text-stone-400">{item.low}</p>
              <p className="mt-3 line-clamp-1 text-[11px] text-stone-500">{item.condition}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-stone-300">
                {item.rain}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StayCard() {
  return (
    <section className="mt-8 border-l-4 border-[#cf9aa2] py-1 pl-5">
      <div className="overflow-hidden border border-stone-200 bg-white/54 shadow-[0_12px_32px_rgba(60,52,42,0.05)]">
        <img src={hotel.image} alt={hotel.name} className="aspect-[19/8] w-full object-cover" />
        <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-300">住宿資訊</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold tracking-[0.02em] text-[#7d2437] md:text-3xl">
            {hotel.name}
          </h2>
          <p className="mt-3 flex items-center gap-2 text-sm text-stone-400">
            <CalendarDays className="h-4 w-4" />
            {hotel.dates}
          </p>
          <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-stone-400">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            {hotel.address}
          </p>
        </div>
        <button className="mt-2 text-[#7d2437]" aria-label="複製住宿資訊">
          <Copy className="h-5 w-5" strokeWidth={1.5} />
        </button>
        </div>
      </div>
    </section>
  );
}

function Timeline({ dayItems }: { dayItems: typeof itinerary }) {
  return (
    <section className="mt-14">
      <div className="relative">
        <div className="absolute left-[66px] top-0 h-full w-px bg-stone-200 md:left-[96px]" />
        <div className="space-y-10">
          {dayItems.map((item) => {
            const meta = categoryMeta[item.category];
            const Icon = meta.icon;
            return (
              <article key={item.id} className="relative grid grid-cols-[82px_1fr] gap-5 md:grid-cols-[112px_1fr]">
                <time className="pt-1 font-serif text-2xl font-semibold text-stone-900">
                  {item.time}
                </time>
                <div className="relative border-l border-stone-200 pl-6">
                  <span className="absolute -left-[5px] top-3 h-2.5 w-2.5 rounded-full border border-stone-300 bg-[#f8f6f1]" />
                  <h3 className="font-serif text-xl font-semibold tracking-[0.02em] text-stone-900 md:text-2xl">
                    {item.title}
                  </h3>
                  <div className={cn("mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]", meta.color)}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>{meta.en}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-stone-500">
                    {item.description}
                  </p>
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

function InfoPanel() {
  const cards = [
    { type: "FLIGHT", title: "JX846 福岡航班", note: "桃園國際機場出發" },
    { type: "CAR", title: "Toyota Rent a Car", note: "3/14 取車" },
    { type: "HOTEL", title: hotel.name, note: hotel.address },
    { type: "ACTIVITY", title: "太宰府天滿宮", note: "參道散策與梅枝餅" },
  ];

  return (
    <div className="sticky top-10 space-y-4">
      {cards.map((card) => (
        <article
          key={card.title}
          className="border border-stone-200 bg-white/62 p-5 shadow-[0_12px_32px_rgba(60,52,42,0.05)] backdrop-blur"
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-stone-300">{card.type}</p>
          <h3 className="mt-3 font-serif text-xl font-semibold text-stone-900">{card.title}</h3>
          <div className="mt-5 border-t border-dashed border-stone-200 pt-4">
            <p className="line-clamp-1 text-sm text-stone-400">{card.note}</p>
            <p className="mt-3 text-right font-serif text-sm text-stone-500">Open Link →</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function NowCard({ item }: { item: (typeof itinerary)[number] }) {
  return (
    <aside className="fixed inset-x-3 bottom-[86px] z-30 mx-auto max-w-md overflow-hidden rounded-lg border border-stone-200 bg-white/90 shadow-[0_16px_38px_rgba(48,42,36,0.16)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-[64px_1fr_78px]">
        <div className="flex flex-col items-center justify-center border-r border-stone-100 bg-stone-50 text-stone-300">
          <Navigation className="h-5 w-5" strokeWidth={1.5} />
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em]">GPS</span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em]">OFF</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <p className="font-serif text-2xl font-semibold text-stone-900">{item.time}</p>
            <span className="rounded border border-stone-200 px-1.5 py-0.5 text-[10px] text-stone-400">
              行程預覽
            </span>
          </div>
          <p className="mt-1 line-clamp-1 font-serif text-lg font-semibold text-stone-900">
            {item.title}
          </p>
          <p className="mt-1 line-clamp-1 text-xs text-stone-400">→ {item.address}</p>
        </div>
        <div className="flex flex-col items-center justify-center border-l border-stone-100 text-stone-500">
          <ClockText />
          <p className="mt-2 font-serif text-xl font-semibold">15:00</p>
          <p className="text-[10px] text-stone-400">下個時間</p>
        </div>
      </div>
    </aside>
  );
}

function ClockText() {
  return <span className="h-4 w-4 rounded-full border border-stone-400" aria-hidden="true" />;
}

function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-[#f8f6f1]/92 px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={cn(
                "flex h-12 flex-col items-center justify-center gap-1 text-[11px]",
                item.active ? "text-[#7d2437]" : "text-stone-400",
              )}
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
