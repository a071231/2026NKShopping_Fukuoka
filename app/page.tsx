"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckSquare,
  CloudSun,
  Compass,
  Home,
  Hotel,
  MapPin,
  Plane,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  TrainFront,
  Utensils,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hotel, itinerary, tripDays, weather, type ItineraryCategory } from "@/data/trip";
import { cn } from "@/lib/utils";

const categoryStyle: Record<
  ItineraryCategory,
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  交通: { icon: TrainFront, className: "bg-sky-50 text-sky-800 ring-sky-100" },
  食物: { icon: Utensils, className: "bg-rose-50 text-rose-800 ring-rose-100" },
  購物: { icon: ShoppingBag, className: "bg-amber-50 text-amber-900 ring-amber-100" },
  景點: { icon: Compass, className: "bg-emerald-50 text-emerald-800 ring-emerald-100" },
};

const navItems = [
  { label: "首頁", icon: Home, active: true },
  { label: "資訊工具", icon: CloudSun },
  { label: "記帳表", icon: ReceiptText },
  { label: "準備清單", icon: CheckSquare },
];

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(tripDays[0].date);
  const dayItems = useMemo(
    () => itinerary.filter((item) => item.date === selectedDate),
    [selectedDate],
  );

  return (
    <main className="min-h-screen pb-28 text-stone-800 md:pb-10">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-8 lg:px-12">
        <Header />

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <HeroBanner />
          <HotelCard />
        </section>

        <section className="mt-8">
          <SectionTitle eyebrow="Weather" title="福岡 5 天天氣" action="假資料預覽" />
          <div className="no-scrollbar -mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
            {weather.map((item) => (
              <Card key={item.date} className="min-w-[158px] snap-start sm:min-w-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{item.day}</p>
                      <p className="mt-1 text-lg font-medium text-stone-900">{item.date}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                      <CloudSun className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-5 text-xl font-semibold text-stone-900">{item.temp}</p>
                  <div className="mt-3 flex items-center justify-between text-sm text-stone-500">
                    <span>{item.condition}</span>
                    <span>{item.rain}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
          <TripTools />
          <ItinerarySection
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dayItems={dayItems}
          />
        </section>
      </div>

      <BottomNavigation />
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/80 bg-white/70 text-amber-800 shadow-sm backdrop-blur">
          <Plane className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Family Travel</p>
          <h1 className="text-xl font-semibold tracking-normal text-stone-950">北高購物團</h1>
        </div>
      </div>
      <Button variant="soft" size="icon" aria-label="旅行亮點">
        <Sparkles className="h-4 w-4 text-amber-700" />
      </Button>
    </header>
  );
}

function HeroBanner() {
  return (
    <section className="relative min-h-[310px] overflow-hidden rounded-lg border border-white/60 bg-stone-950 px-5 py-6 text-white shadow-[0_28px_90px_rgba(58,49,35,0.18)] sm:min-h-[380px] sm:px-8 sm:py-8">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-72"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1600&q=82')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/26 to-black/66" />
      <div className="relative flex h-full min-h-[258px] flex-col justify-between sm:min-h-[318px]">
        <Badge variant="gold" className="w-fit border-white/30 bg-white/20 text-white backdrop-blur-md">
          2026NKShopping_Fukuoka
        </Badge>
        <div>
          <p className="text-sm tracking-[0.28em] text-white/72">FUKUOKA JOURNEY 2026</p>
          <h2 className="mt-3 max-w-[10ch] text-5xl font-semibold leading-[0.98] tracking-normal sm:text-7xl">
            福岡旅行 2026
          </h2>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/82">
            <span className="rounded-full bg-white/14 px-3 py-1.5 backdrop-blur-md">5 Days</span>
            <span className="rounded-full bg-white/14 px-3 py-1.5 backdrop-blur-md">Family</span>
            <span className="rounded-full bg-white/14 px-3 py-1.5 backdrop-blur-md">Shopping</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HotelCard() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[16/10] overflow-hidden">
        <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover" />
      </div>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-700">Stay</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">{hotel.name}</h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white">
            <Hotel className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-5 space-y-3 text-sm text-stone-600">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-amber-700" />
            {hotel.dates}
          </p>
          <p className="flex items-start gap-2 leading-relaxed">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            {hotel.address}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TripTools() {
  return (
    <Card className="hidden xl:block">
      <CardContent className="p-6">
        <SectionTitle eyebrow="Overview" title="旅程摘要" action="第一階段" />
        <div className="mt-5 grid gap-3">
          {[
            ["航班資訊", "桃園 ⇄ 福岡"],
            ["住宿", hotel.name],
            ["預算紀錄", "家人共用花費"],
            ["準備清單", "出發前確認"],
          ].map(([title, value]) => (
            <div key={title} className="rounded-lg border border-stone-200/80 bg-white/62 p-4">
              <p className="text-xs text-stone-400">{title}</p>
              <p className="mt-1 font-medium text-stone-900">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ItinerarySection({
  selectedDate,
  setSelectedDate,
  dayItems,
}: {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dayItems: typeof itinerary;
}) {
  return (
    <section>
      <SectionTitle eyebrow="Timeline" title="每日行程" action="日期切換" />
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {tripDays.map((day) => {
          const selected = day.date === selectedDate;
          return (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={cn(
                "min-w-[116px] rounded-lg border px-4 py-3 text-left transition",
                selected
                  ? "border-stone-900 bg-stone-900 text-white shadow-lg shadow-stone-900/12"
                  : "border-stone-200 bg-white/68 text-stone-600 backdrop-blur hover:bg-white",
              )}
            >
              <span className="block text-xs opacity-72">{day.label}</span>
              <span className="mt-1 block text-lg font-semibold">{day.short}</span>
              <span className="mt-1 block text-xs opacity-72">{day.city}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {dayItems.map((item, index) => {
          const Icon = categoryStyle[item.category].icon;
          return (
            <Card key={item.id} className="relative overflow-hidden">
              <CardContent className="grid grid-cols-[72px_1fr] gap-4 p-4 sm:grid-cols-[92px_1fr] sm:p-5">
                <div className="relative">
                  <div className="text-sm font-semibold text-stone-950">{item.time}</div>
                  {index < dayItems.length - 1 ? (
                    <div className="absolute left-4 top-8 h-[calc(100%+1.5rem)] w-px bg-stone-200" />
                  ) : null}
                  <div className="relative mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800 ring-4 ring-white">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-stone-950">{item.title}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                        categoryStyle[item.category].className,
                      )}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
                    {item.description}
                  </p>
                  <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-stone-400">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {item.address}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-amber-700">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold text-stone-950">{title}</h2>
      </div>
      <span className="shrink-0 text-xs text-stone-400">{action}</span>
    </div>
  );
}

function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200/80 bg-[#fbf8f1]/88 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_48px_rgba(58,49,35,0.10)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium",
                item.active ? "bg-stone-900 text-white" : "text-stone-500",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
