"use client";

import { useMemo, useState, type ComponentType } from "react";
import {
  CalendarDays,
  Car,
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

import { hotel, itinerary, tripDays, weatherForecast, type ItineraryCategory } from "@/data/trip";
import { cn } from "@/lib/utils";

const categoryMeta: Record<
  ItineraryCategory,
  { en: string; icon: ComponentType<{ className?: string; strokeWidth?: number }>; color: string }
> = {
  交通: { en: "TRANSPORT", icon: Car, color: "text-sky-700" },
  食物: { en: "FOOD", icon: Utensils, color: "text-amber-700" },
  購物: { en: "SHOPPING", icon: ShoppingBag, color: "text-rose-700" },
  景點: { en: "ACTIVITY", icon: Navigation, color: "text-emerald-700" },
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

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#2c2925]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbfaf7] pb-36 shadow-[0_0_80px_rgba(60,52,42,0.08)] md:max-w-[430px]">
        <TripHeader />
        <DateRail selectedDate={selectedDate} onSelect={setSelectedDate} />
        <JourneyBanner day={selectedDay} />
        <WeatherStripPaged />
        <StayCard />
        <Timeline dayItems={dayItems} />
      </div>

      <BottomNavigation />
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
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  return (
    <nav className="no-scrollbar mt-6 flex overflow-x-auto border-b border-stone-200/70 px-2">
      {tripDays.map((day) => {
        const active = day.date === selectedDate;
        return (
          <button
            key={day.date}
            onClick={() => onSelect(day.date)}
            className="relative shrink-0 basis-[calc(100%/6.5)] pb-3 text-center"
          >
            <span
              className={cn(
                "block text-[10px] font-semibold tracking-[0.16em]",
                active ? "text-stone-900" : "text-stone-300",
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
              <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#8f293d]" />
            ) : null}
          </button>
        );
      })}
    </nav>
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
            className={cn(
              "h-7 min-w-7 rounded-full border px-2 font-serif text-xs transition",
              page === index
                ? "border-[#8f293d] bg-[#8f293d] text-white"
                : "border-stone-200 bg-white/70 text-stone-400",
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
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#8f293d]">
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
                <time className="pt-1 font-serif text-2xl font-semibold text-stone-900">
                  {item.time}
                </time>
                <div className="relative border-l border-stone-200 pl-6">
                  <span className="absolute -left-[5px] top-3 h-2.5 w-2.5 rounded-full border border-stone-300 bg-[#fbfaf7]" />
                  <h3 className="font-serif text-xl font-semibold tracking-[0.02em] text-stone-900">
                    {item.title}
                  </h3>
                  <div
                    className={cn(
                      "mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]",
                      meta.color,
                    )}
                  >
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

function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-[#fbfaf7]/92 px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[390px] grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={cn(
                "flex h-12 flex-col items-center justify-center gap-1 text-[11px]",
                item.active ? "text-[#8f293d]" : "text-stone-400",
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
