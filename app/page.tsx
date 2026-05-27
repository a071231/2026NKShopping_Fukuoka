"use client";

import {
  type ComponentType,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CalendarDays,
  Car,
  CheckSquare,
  Cloud,
  CloudRain,
  Copy,
  ExternalLink,
  Home,
  Info,
  Map,
  MapPin,
  Navigation,
  PackagePlus,
  Pencil,
  Phone,
  Plane,
  Plus,
  ReceiptText,
  Shield,
  ShoppingBag,
  StickyNote,
  Sun,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

import { hotel, itinerary, tripDays, weatherForecast, type ItineraryCategory, type WeatherIcon } from "@/data/trip";
import { cn } from "@/lib/utils";

type View = "home" | "tools" | "ledger" | "checklist";
type Payer = "K" | "M" | "E" | "G" | "J";
type Expense = { id: string; title: string; amount: number; payer: Payer; paid?: boolean };
type ChecklistItem = { id: string; label: string; done: boolean };
type ChecklistCategory = { id: string; title: string; accent: string; items: ChecklistItem[] };

const mapUrl = "https://maps.app.goo.gl/oYZVFgyA9oiwbB7Q7";
const defaultHotelLink = "https://www.jrhotelgroup.com/hotel/192/";
const defaultHotelNote = "入住時請確認早餐時間、停車位置與房型資訊。若有訂房確認信或 QR Code，可將截圖上傳到這裡。";

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

const weatherIconMap: Record<WeatherIcon, typeof Sun> = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
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

function useStoredState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) setValue(JSON.parse(storedValue) as T);
    } catch {
      // Keep defaults.
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Large uploaded images can exceed browser storage.
    }
  }, [key, loaded, value]);

  return [value, setValue];
}

export default function HomePage() {
  const [view, setView] = useState<View>("home");
  const [selectedDate, setSelectedDate] = useState(tripDays[0].date);
  const dayItems = useMemo(() => itinerary.filter((item) => item.date === selectedDate), [selectedDate]);

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#2c2925]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbfaf7] pb-28 shadow-[0_0_80px_rgba(60,52,42,0.08)]">
        <TripHeader />
        {view !== "home" ? <DateRail selectedDate={selectedDate} onSelect={setSelectedDate} view={view} setView={setView} /> : null}
        {view === "tools" ? (
          <ToolsView />
        ) : view === "ledger" ? (
          <LedgerView />
        ) : view === "checklist" ? (
          <ChecklistView />
        ) : (
          <>
            <JourneyBanner />
            <WeatherStrip />
            <StayCard />
            <DateRail selectedDate={selectedDate} onSelect={setSelectedDate} view={view} setView={setView} />
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
        <h1 className="font-serif text-xl font-semibold tracking-[0.12em] text-stone-950">福岡旅行</h1>
        <span className="flex h-10 w-10 items-center justify-center border border-stone-200 bg-white/80 font-serif text-[11px] text-stone-500">
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
              {active ? <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 bg-[#8f293d]" /> : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function JourneyBanner() {
  return (
    <section className="mx-8 mt-6 overflow-hidden border border-stone-200 bg-stone-100 shadow-[0_16px_32px_rgba(58,51,44,0.14)]">
      <img
        src="https://images.unsplash.com/photo-1542640244-7e672d6cef4e?auto=format&fit=crop&w=1400&q=82"
        alt="福岡旅行形象橫幅"
        className="aspect-[16/9] w-full object-cover"
      />
    </section>
  );
}

function WeatherStrip() {
  return (
    <section className="mt-8 border-b border-stone-200/70 pb-7">
      <div className="flex items-end justify-between gap-4 px-5">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <h2 className="font-serif text-2xl font-semibold leading-none tracking-[0.04em] text-stone-900">福岡市</h2>
          <p className="pb-1 text-sm font-semibold tracking-[0.08em] text-stone-400">近11天當地天氣預報</p>
        </div>
        <span className="shrink-0 pb-1 text-[11px] text-stone-300">Open-Meteo</span>
      </div>
      <div className="no-scrollbar mt-6 flex snap-x gap-7 overflow-x-auto px-5 pr-12">
        {weatherForecast.map((item) => {
          const Icon = weatherIconMap[item.icon];
          return (
            <div key={item.date} className="w-[54px] shrink-0 snap-start text-center">
              <p className="font-serif text-base leading-none text-stone-500">{item.date}</p>
              <Icon className="mx-auto mt-6 h-7 w-7 text-stone-800" strokeWidth={1.6} />
              <p className="mt-6 font-serif text-2xl leading-none text-stone-900">{item.high}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StayCard() {
  const [hotelLink, setHotelLink] = useStoredState("nk-trip-hotel-link", defaultHotelLink);
  const [draftLink, setDraftLink] = useState(hotelLink);
  const [editingLink, setEditingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesEditing, setNotesEditing] = useState(false);
  const [noteText, setNoteText] = useStoredState("nk-trip-hotel-note-text", defaultHotelNote);
  const [draftNoteText, setDraftNoteText] = useState(noteText);
  const [noteImages, setNoteImages] = useStoredState<string[]>("nk-trip-hotel-note-images", []);

  useEffect(() => {
    if (!editingLink) setDraftLink(hotelLink);
  }, [editingLink, hotelLink]);

  async function copyStayInfo() {
    await navigator.clipboard.writeText(["住宿資訊", hotel.name, hotel.dates, hotel.address, hotelLink].join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function saveHotelLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextLink = draftLink.trim();
    if (!nextLink) return;
    setHotelLink(nextLink);
    setEditingLink(false);
  }

  function openNotes() {
    setDraftNoteText(noteText);
    setNotesEditing(false);
    setNotesOpen(true);
  }

  function saveNotes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNoteText(draftNoteText.trim() || "尚未新增備註內容。");
    setNotesEditing(false);
  }

  async function addNoteImages(files: FileList | null) {
    if (!files) return;
    const images = await Promise.all(
      Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.readAsDataURL(file);
            }),
        ),
    );
    setNoteImages((current) => [...current, ...images]);
  }

  return (
    <>
      <section className="mt-8 border-l-[3px] border-[#cf9aa2] py-1 pl-5 pr-5">
        <div className="grid grid-cols-[2fr_minmax(0,3fr)] overflow-hidden border border-stone-200 bg-white/70 shadow-[0_12px_32px_rgba(60,52,42,0.05)]">
          <img src={hotel.image} alt={hotel.name} className="h-full min-h-[148px] w-full object-cover" />
          <div className="flex min-w-0 items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.28em] text-stone-300">住宿資訊</p>
              <h2 className="mt-2 font-serif text-xl font-semibold leading-tight text-[#8f293d]">{hotel.name}</h2>
              <p className="mt-3 flex items-center gap-2 text-xs text-stone-400">
                <CalendarDays className="h-4 w-4" />
                {hotel.dates}
              </p>
              <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-stone-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {hotel.address}
              </p>
              {editingLink ? (
                <form onSubmit={saveHotelLink} className="mt-3 flex min-w-0 items-center gap-1">
                  <input
                    value={draftLink}
                    onChange={(event) => setDraftLink(event.target.value)}
                    className="min-w-0 flex-1 truncate border-b border-[#8f293d]/40 bg-transparent py-1 text-xs text-stone-600 outline-none"
                    placeholder="貼上住宿連結"
                    autoFocus
                  />
                  <button type="submit" className="shrink-0 bg-[#8f293d] px-2 py-1 text-[10px] text-white">
                    存
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftLink(hotelLink);
                      setEditingLink(false);
                    }}
                    className="shrink-0 border border-stone-200 px-2 py-1 text-[10px] text-stone-400"
                  >
                    取消
                  </button>
                </form>
              ) : (
                <div className="mt-3 flex w-full min-w-0 items-center gap-2 text-xs">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#8f293d]" strokeWidth={1.6} />
                  <a href={hotelLink} target="_blank" rel="noreferrer" className="block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[#8f293d]">
                    連結：{hotelLink}
                  </a>
                  <button onClick={() => setEditingLink(true)} className="shrink-0 text-stone-400" aria-label="編輯住宿連結">
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </button>
                </div>
              )}
              <button onClick={openNotes} className="mt-3 inline-flex items-center gap-2 border border-[#8f293d]/20 bg-[#fbfaf7] px-3 py-1.5 text-xs text-[#8f293d]">
                <StickyNote className="h-3.5 w-3.5" strokeWidth={1.6} />
                備註事項
              </button>
            </div>
            <button onClick={copyStayInfo} className="mt-2 shrink-0 text-[#8f293d]" aria-label="複製住宿資訊">
              <Copy className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        {copied ? <p className="mt-2 text-right text-[11px] text-[#8f293d]">已複製住宿資訊</p> : null}
      </section>

      {notesOpen ? (
        <div className="fixed inset-0 z-30 bg-stone-950/45 px-4 pt-24 backdrop-blur-sm">
          <div className="mx-auto max-h-[78vh] max-w-[430px] overflow-y-auto border border-stone-200 bg-[#fbfaf7] shadow-[0_-16px_44px_rgba(24,22,20,0.2)]">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-stone-100 bg-[#fbfaf7]/95 px-5 py-5 backdrop-blur">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f293d]">Hotel Note</p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-stone-900">備註事項</h3>
                <p className="mt-1 text-xs text-stone-400">{hotel.name}</p>
              </div>
              <button onClick={() => setNotesOpen(false)} className="text-stone-400" aria-label="關閉備註事項">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-5">
              {notesEditing ? (
                <form onSubmit={saveNotes}>
                  <textarea
                    value={draftNoteText}
                    onChange={(event) => setDraftNoteText(event.target.value)}
                    className="min-h-36 w-full resize-none border border-stone-200 bg-white/80 p-4 text-sm leading-7 text-stone-700 outline-none focus:border-[#8f293d]/40"
                    placeholder="貼上住宿備註、訂房資訊、注意事項..."
                    autoFocus
                  />
                  <label className="mt-4 flex cursor-pointer items-center justify-center border border-dashed border-stone-300 bg-white/60 px-4 py-4 text-sm text-stone-500">
                    上傳圖片
                    <input type="file" accept="image/*" multiple onChange={(event) => addNoteImages(event.target.files)} className="hidden" />
                  </label>
                  <div className="mt-5 flex gap-2">
                    <button type="submit" className="h-10 flex-1 bg-[#3c3631] font-serif text-sm tracking-[0.12em] text-white">
                      儲存
                    </button>
                    <button type="button" onClick={() => setNotesEditing(false)} className="h-10 flex-1 border border-stone-200 bg-white/70 font-serif text-sm tracking-[0.12em] text-stone-500">
                      取消
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="border-l-2 border-[#8f293d]/50 pl-4">
                    <p className="whitespace-pre-wrap text-sm leading-8 text-stone-600">{noteText}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDraftNoteText(noteText);
                      setNotesEditing(true);
                    }}
                    className="mt-5 inline-flex items-center gap-2 bg-[#3c3631] px-4 py-2 text-sm text-white"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.6} />
                    編輯
                  </button>
                </>
              )}
              {noteImages.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {noteImages.map((image, index) => (
                    <div key={`${image}-${index}`} className="relative overflow-hidden border border-stone-200 bg-white">
                      <img src={image} alt={`住宿備註圖片 ${index + 1}`} className="h-auto w-full" />
                      {notesEditing ? (
                        <button
                          type="button"
                          onClick={() => setNoteImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}
                          className="absolute right-2 top-2 bg-white/90 p-1 text-stone-500 shadow"
                          aria-label="刪除備註圖片"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 border border-dashed border-stone-200 bg-white/50 px-4 py-5 text-center text-xs text-stone-300">尚未上傳圖片</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
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
                  <span className="absolute -left-[5px] top-3 h-2.5 w-2.5 border border-stone-300 bg-[#fbfaf7]" />
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
  const flightTickets = [
    { id: "flight-out", label: "去程航班", date: "2026.10.03", from: "TPE", to: "FUK", depart: "07:30", arrive: "11:00", airline: "星宇航空", flightNo: "JX846" },
    { id: "flight-back", label: "回程航班", date: "2026.10.11", from: "FUK", to: "TPE", depart: "待確認", arrive: "待確認", airline: "星宇航空", flightNo: "待確認" },
  ];

  return (
    <section className="px-5 pt-6">
      <p className="text-sm tracking-[0.08em] text-stone-500">全覽地圖與重要資訊</p>
      <div className="mt-8 overflow-hidden border border-blue-100 bg-white shadow-[0_12px_30px_rgba(60,52,42,0.06)]">
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
              className="absolute border-2 border-white bg-[#8f293d] px-2 py-1 text-xs font-semibold text-white shadow"
              style={{ left: `${18 + index * 14}%`, top: `${30 + (index % 3) * 14}%` }}
            >
              {city}
            </span>
          ))}
          <div className="absolute right-3 bottom-4 overflow-hidden border border-stone-300 bg-white shadow">
            <div className="px-3 py-1 text-xl">+</div>
            <div className="border-t px-3 py-1 text-xl">−</div>
          </div>
        </div>
        <a href={mapUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 font-serif text-blue-700">
          <ExternalLink className="h-4 w-4" />
          開啟 Google Maps 導航
        </a>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-800">
            <Plane className="h-5 w-5 text-[#8f293d]" strokeWidth={1.6} />
            <h2 className="font-serif text-2xl font-semibold tracking-[0.04em]">航班資訊</h2>
          </div>
          <span className="text-[10px] uppercase tracking-[0.24em] text-stone-300">Boarding Pass</span>
        </div>
        <div className="space-y-4">
          {flightTickets.map((ticket) => (
            <FlightTicket key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </section>

      <a href="https://www.vjw.digital.go.jp/" target="_blank" rel="noreferrer" className="mt-5 block overflow-hidden bg-[#191817] p-7 text-white shadow-[0_12px_28px_rgba(24,22,20,0.25)]">
        <span className="bg-[#c64f6b] px-3 py-1 text-xs font-semibold tracking-[0.18em]">MUST HAVE</span>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold">Visit Japan Web</h2>
            <p className="mt-2 text-sm text-white/50">入境審查 & 海關申報</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center bg-white/10">
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
            <a href="tel:05038162787" className="absolute right-5 top-8 flex h-12 w-12 items-center justify-center bg-[#3c3631] text-white shadow-lg">
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

function FlightTicket({ ticket }: { ticket: { label: string; date: string; from: string; to: string; depart: string; arrive: string; airline: string; flightNo: string } }) {
  return (
    <article className="relative overflow-hidden border border-stone-200 bg-white/88 p-5 shadow-[0_14px_34px_rgba(60,52,42,0.08)]">
      <span className="absolute inset-y-4 right-0 w-1 bg-[#b99a58]" />
      <div className="flex items-center justify-between border-b border-dashed border-stone-200 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8f293d]">Flight Ticket</p>
        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-300">{ticket.label}</p>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div>
          <p className="font-serif text-4xl font-bold tracking-[0.02em] text-stone-950">{ticket.from}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">Dep {ticket.depart}</p>
        </div>
        <div className="flex items-center gap-2 text-stone-300">
          <span className="h-px w-8 bg-stone-200" />
          <Plane className="h-4 w-4 rotate-90 text-[#8f293d]" strokeWidth={1.5} />
          <span className="h-px w-8 bg-stone-200" />
        </div>
        <div className="text-right">
          <p className="font-serif text-4xl font-bold tracking-[0.02em] text-stone-950">{ticket.to}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">Arr {ticket.arrive}</p>
        </div>
      </div>
      <div className="mt-5 bg-[#f8f6f1] px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-300">Date</p>
            <p className="mt-1 font-serif text-sm font-semibold text-stone-700">{ticket.date}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-300">Flight</p>
            <p className="mt-1 font-serif text-sm font-semibold text-stone-700">
              {ticket.airline} · {ticket.flightNo}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function LedgerView() {
  const [expenses, setExpenses] = useStoredState("nk-trip-expenses", initialExpenses);
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
    setExpenses((current) => [...current, { id: crypto.randomUUID(), title: title.trim(), amount: Math.round(parsedAmount), payer }]);
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
          <span className="mt-2 inline-flex bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Online</span>
        </div>
        <div className="text-right text-xs text-stone-300">
          <p>全部顯示</p>
          <p>{expenses.length} 筆項目</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {(["all", "K", "M", "E", "G", "J"] as const).map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={cn("flex h-8 min-w-8 items-center justify-center border px-3 font-serif text-sm", filter === item ? "border-[#3c3631] bg-[#3c3631] text-white" : "border-stone-200 bg-white text-stone-400")}>
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
                <span className={cn("inline-flex h-5 w-5 items-center justify-center border text-xs", payerStyle[expense.payer])}>{expense.payer}</span>
                <span className="bg-stone-50 px-2 py-0.5 text-[10px] text-stone-400">{expense.paid ? "已付" : "未付"}</span>
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
              <button key={item} type="button" onClick={() => setPayer(item)} className={cn("h-9 w-9 border font-serif text-sm", payer === item ? payerStyle[item] : "border-stone-200 text-stone-300")}>
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
  const [categories, setCategories] = useStoredState("nk-trip-checklist", initialChecklist);
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
      current.map((category) => (category.id === categoryIdToUpdate ? { ...category, items: category.items.filter((item) => item.id !== itemId) } : category)),
    );
  }

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;
    setCategories((current) =>
      current.map((category) => (category.id === categoryId ? { ...category, items: [...category.items, { id: crypto.randomUUID(), label: trimmedLabel, done: false }] } : category)),
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
        <div className="border border-stone-200 bg-white/70 px-4 py-2 text-right shadow-sm">
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
            <article key={category.id} className="relative overflow-hidden border border-stone-200 bg-white/82 shadow-[0_16px_36px_rgba(60,52,42,0.07)]">
              <span className={cn("absolute inset-y-0 left-0 w-1.5", category.accent)} />
              <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
                <h3 className="font-serif text-xl font-semibold text-stone-900">{category.title}</h3>
                <span className="bg-[#f3efe8] px-3 py-1 font-serif text-xs text-stone-500">
                  {done}/{category.items.length}
                </span>
              </div>
              <div className="divide-y divide-stone-100">
                {category.items.map((item) => (
                  <div key={item.id} className="flex min-h-14 items-center gap-3 px-5 py-3">
                    <button
                      onClick={() => toggleItem(category.id, item.id)}
                      className={cn("flex h-5 w-5 shrink-0 items-center justify-center border transition", item.done ? "border-[#8f293d] bg-[#8f293d] text-white" : "border-stone-300 bg-white text-transparent")}
                      aria-label={item.done ? "標記為未完成" : "標記為完成"}
                    >
                      <CheckSquare className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <span className={cn("flex-1 text-sm font-medium", item.done ? "text-stone-300 line-through" : "text-stone-800")}>{item.label}</span>
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
        <form onSubmit={addItem} className="mt-6 border border-stone-200 bg-white/90 p-5 shadow-[0_16px_36px_rgba(60,52,42,0.07)]">
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
          <button type="submit" className="mt-6 h-12 w-full bg-[#3c3631] font-serif text-lg tracking-[0.16em] text-white">
            加入清單
          </button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="mt-8 flex h-16 w-full items-center justify-center gap-2 bg-[#191817] font-serif text-xl tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(60,52,42,0.2)]">
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
