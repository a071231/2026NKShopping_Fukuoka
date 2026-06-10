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
  ChevronRight,
  ClipboardCheck,
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
  Plane,
  Plus,
  ReceiptText,
  ShoppingBag,
  StickyNote,
  Sun,
  Trash2,
  Utensils,
  WalletCards,
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
const heroImage = "/images/fukuoka-coast-hero.jpg";

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
    accent: "bg-[#2e78a7]",
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
    accent: "bg-[#d6a345]",
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
    accent: "bg-[#4c8fa7]",
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
      // Keep defaults when localStorage is unavailable.
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Uploaded images may exceed browser storage.
    }
  }, [key, loaded, value]);

  return [value, setValue];
}

export default function HomePage() {
  const [view, setView] = useState<View>("home");
  const [selectedDate, setSelectedDate] = useState(tripDays[0].date);
  const dayItems = useMemo(() => itinerary.filter((item) => item.date === selectedDate), [selectedDate]);

  return (
    <main className="min-h-screen bg-[#dcecf7] text-[#082f52]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[linear-gradient(180deg,#eef8ff_0%,#f9fcfe_32%,#f5faff_100%)] pb-28 shadow-[0_0_90px_rgba(8,47,82,0.22)]">
        {view === "home" ? (
          <>
            <HeroHeader />
            <div className="-mt-14 space-y-5 px-5">
              <WeatherCard />
              <StayCard />
              <SectionHeading title="每日行程" />
              <DateRail selectedDate={selectedDate} onSelect={setSelectedDate} view={view} setView={setView} />
              <Timeline dayItems={dayItems} selectedDate={selectedDate} />
            </div>
          </>
        ) : (
          <>
            <CompactHeader />
            {view === "tools" ? <ToolsView /> : view === "ledger" ? <LedgerView /> : <ChecklistView />}
          </>
        )}
      </div>
      <BottomNavigation view={view} setView={setView} />
    </main>
  );
}

function HeroHeader() {
  return (
    <header className="relative h-[560px] overflow-hidden">
      <img src={heroImage} alt="福岡旅行" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07548b]/12 via-transparent to-[#f5faff]/20" />
      <div className="relative z-10 px-8 pt-[122px] text-white drop-shadow-[0_2px_12px_rgba(0,37,68,0.24)]">
        <p className="text-xs tracking-[0.38em] text-white/90">FAMILY TRIP</p>
        <span className="mt-5 block h-px w-10 bg-[#e6b24d]" />
        <h1 className="mt-7 font-serif text-[54px] leading-[1.12] tracking-[0.08em] text-white">
          福岡旅行
          <br />
          2026
        </h1>
        <p className="mt-7 max-w-[250px] text-sm leading-7 tracking-[0.18em] text-white/92">
          自然與文化交織，
          <br />
          家族的特別旅行時光。
        </p>
      </div>
    </header>
  );
}

function CompactHeader() {
  return (
    <header className="border-b border-white/60 bg-[linear-gradient(180deg,#dff2ff_0%,#f5faff_100%)] px-6 pb-8 pt-16 text-center">
      <p className="text-[10px] uppercase tracking-[0.34em] text-[#6c8aa2]">Family Trip</p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <h1 className="font-serif text-xl font-semibold tracking-[0.12em] text-[#082f52]">福岡旅行</h1>
        <span className="rounded-full border border-[#d6a84a]/45 bg-white/75 px-3 py-2 font-serif text-[11px] text-[#b78023]">2026</span>
      </div>
    </header>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="font-serif text-xl font-semibold tracking-[0.08em] text-[#0b3558]">{title}</h2>;
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
    <nav className="no-scrollbar flex overflow-x-auto py-1">
      {tripDays.map((day) => {
        const active = day.date === selectedDate && view === "home";
        return (
          <button
            key={day.date}
            onClick={() => {
              onSelect(day.date);
              setView("home");
            }}
            className={cn(
              "mr-3 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border bg-white/60 font-serif shadow-[0_8px_20px_rgba(8,47,82,0.07)]",
              active ? "border-[#d1a047] text-[#123f66]" : "border-[#dce8f0] text-[#8fa2b2]",
            )}
          >
            <span className="text-xs">{day.day}</span>
            <span className="mt-0.5 text-[10px] uppercase">{day.weekday}</span>
          </button>
        );
      })}
    </nav>
  );
}

type LiveWeatherDay = {
  date: string;
  weekday: string;
  high: number;
  low: number;
  code: number;
};

type LiveWeatherData = {
  temperature: number;
  code: number;
  days: LiveWeatherDay[];
};

function weatherCodeMeta(code: number): { label: string; icon: WeatherIcon } {
  if (code === 0) return { label: "晴朗", icon: "sun" };
  if (code === 1 || code === 2) return { label: "晴時多雲", icon: "sun" };
  if (code === 3 || code === 45 || code === 48) return { label: "多雲", icon: "cloud" };
  if (code >= 51 && code <= 67) return { label: "有雨", icon: "rain" };
  if (code >= 71 && code <= 77) return { label: "降雪", icon: "cloud" };
  if (code >= 80 && code <= 82) return { label: "短暫陣雨", icon: "rain" };
  if (code >= 95) return { label: "雷雨", icon: "rain" };
  return { label: "多雲", icon: "cloud" };
}

function WeatherCard() {
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=33.5902&longitude=130.4017&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&forecast_days=5";

    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Weather request failed");
        return response.json();
      })
      .then((data) => {
        const days: LiveWeatherDay[] = data.daily.time.map((date: string, index: number) => ({
          date,
          weekday: new Intl.DateTimeFormat("zh-TW", {
            weekday: "short",
            timeZone: "Asia/Tokyo",
          }).format(new Date(`${date}T12:00:00+09:00`)),
          high: Math.round(data.daily.temperature_2m_max[index]),
          low: Math.round(data.daily.temperature_2m_min[index]),
          code: data.daily.weather_code[index],
        }));

        setLiveWeather({
          temperature: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          days,
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLiveWeather(null);
      });

    return () => controller.abort();
  }, []);

  const fallbackToday = weatherForecast[0];
  const currentMeta = liveWeather
    ? weatherCodeMeta(liveWeather.code)
    : { label: fallbackToday.condition, icon: fallbackToday.icon };
  const TodayIcon = weatherIconMap[currentMeta.icon];
  const currentTemperature = liveWeather?.temperature ?? 18;
  const todayHigh = liveWeather?.days[0]?.high ?? Number.parseInt(fallbackToday.high);
  const todayLow = liveWeather?.days[0]?.low ?? Number.parseInt(fallbackToday.low);
  const mini = liveWeather?.days.slice(1, 5);

  return (
    <section className="rounded-2xl border border-white/70 bg-white/82 p-5 shadow-[0_18px_45px_rgba(8,47,82,0.13)] backdrop-blur-xl">
      <div className="grid grid-cols-[1.05fr_1.7fr] items-center gap-4">
        <div className="flex min-h-[122px] flex-col justify-center">
          <p className="flex items-center gap-1 text-sm text-[#496782]">
            福岡市
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.4} />
          </p>
          <div className="mt-3 flex items-center gap-2">
            <p className="font-serif text-5xl leading-none text-[#062d50]">{currentTemperature}°</p>
            <TodayIcon className="h-8 w-8 text-[#e1a33a]" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-xs leading-5 text-[#688198]">{currentMeta.label}</p>
          <p className="mt-1 text-xs leading-5 text-[#688198]">最高 {todayHigh}°</p>
          <p className="text-xs leading-5 text-[#688198]">最低 {todayLow}°</p>
        </div>
        <div className="grid min-h-[122px] grid-cols-4 items-center gap-2 border-l border-[#e3edf4] pl-4">
          {(mini ?? weatherForecast.slice(1, 5)).map((item) => {
            const itemMeta = "code" in item ? weatherCodeMeta(item.code) : { icon: item.icon };
            const Icon = weatherIconMap[itemMeta.icon];
            const high = typeof item.high === "number" ? item.high : Number.parseInt(item.high);
            const low = typeof item.low === "number" ? item.low : Number.parseInt(item.low);
            return (
              <div key={item.date} className="text-center">
                <p className="text-[11px] text-[#6b8397]">{item.weekday}</p>
                <Icon className={cn("mx-auto mt-3 h-6 w-6", itemMeta.icon === "sun" ? "text-[#e1a33a]" : "text-[#678096]")} strokeWidth={1.5} />
                <p className="mt-3 text-[10px] text-[#163f62]">
                  {high}° / {low}°
                </p>
              </div>
            );
          })}
        </div>
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

  function openHotelLink() {
    window.open(hotelLink, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/84 p-4 shadow-[0_18px_45px_rgba(8,47,82,0.12)] backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-serif text-sm tracking-[0.08em] text-[#496782]">住宿資訊</p>
          <div className="flex items-center gap-3 text-[#6c8295]">
            <button
              onClick={(event) => {
                event.stopPropagation();
                setEditingLink(true);
              }}
              aria-label="編輯住宿連結"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                void copyStayInfo();
              }}
              aria-label="複製住宿資訊"
            >
              <Copy className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div
          role="link"
          tabIndex={0}
          onClick={openHotelLink}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") openHotelLink();
          }}
          className="grid cursor-pointer grid-cols-[42%_minmax(0,58%)] items-stretch"
        >
          <img src={hotel.image} alt={hotel.name} className="h-full min-h-[142px] w-full rounded-xl object-cover" />
          <div className="flex min-w-0 flex-col px-4 py-1">
            <h2 className="font-serif text-xl font-semibold leading-tight text-[#082f52]">{hotel.name}</h2>
            <p className="mt-3 flex min-w-0 items-start gap-2 text-xs leading-relaxed text-[#6c8295]">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-2">{hotel.address}</span>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#d1a047]" strokeWidth={1.4} />
                <div>
                  <p className="text-[10px] text-[#8fa2b2]">入住</p>
                  <p className="mt-0.5 font-serif text-sm text-[#163f62]">10/03</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#d1a047]" strokeWidth={1.4} />
                <div>
                  <p className="text-[10px] text-[#8fa2b2]">退房</p>
                  <p className="mt-0.5 font-serif text-sm text-[#163f62]">10/07</p>
                </div>
              </div>
            </div>
            <div className="mt-auto flex items-end justify-between pt-3">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  openNotes();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#d9e6ef] bg-[#f7fbfe] px-3 py-1.5 text-[11px] text-[#496782]"
              >
                <StickyNote className="h-3.5 w-3.5" strokeWidth={1.6} />
                備註事項
              </button>
              <ChevronRight className="h-5 w-5 text-[#6c8295]" strokeWidth={1.5} />
            </div>
          </div>
        </div>
        {editingLink ? (
          <form
            onSubmit={saveHotelLink}
            onClick={(event) => event.stopPropagation()}
            className="mt-4 flex min-w-0 items-center gap-2 border-t border-[#e3edf4] pt-3"
          >
            <input
              value={draftLink}
              onChange={(event) => setDraftLink(event.target.value)}
              className="min-w-0 flex-1 border-b border-[#d1a047]/40 bg-transparent py-2 text-xs text-[#163f62] outline-none"
              placeholder="貼上住宿連結"
              autoFocus
            />
            <button type="submit" className="rounded-full bg-[#0e4b78] px-3 py-1.5 text-[10px] text-white">
              儲存
            </button>
            <button type="button" onClick={() => setEditingLink(false)} className="rounded-full border border-[#d7e5ef] px-3 py-1.5 text-[10px] text-[#6b8397]">
              取消
            </button>
          </form>
        ) : null}
      </section>
      {copied ? <p className="-mt-3 text-right text-[11px] text-[#c58e2f]">已複製住宿資訊</p> : null}

      {notesOpen ? (
        <div className="fixed inset-0 z-30 bg-stone-950/40 px-4 pt-24 backdrop-blur-sm">
          <div className="mx-auto max-h-[78vh] max-w-[430px] overflow-y-auto rounded-t-3xl border border-white/70 bg-[#f7fbfe] shadow-[0_-16px_44px_rgba(24,22,20,0.2)]">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#d8e6ef] bg-[#f7fbfe]/95 px-5 py-5 backdrop-blur">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#d1a047]">Hotel Note</p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-[#082f52]">備註事項</h3>
                <p className="mt-1 text-xs text-[#6c8295]">{hotel.name}</p>
              </div>
              <button onClick={() => setNotesOpen(false)} className="text-[#6b8397]" aria-label="關閉備註事項">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-5">
              {notesEditing ? (
                <form onSubmit={saveNotes}>
                  <textarea
                    value={draftNoteText}
                    onChange={(event) => setDraftNoteText(event.target.value)}
                    className="min-h-36 w-full resize-none rounded-2xl border border-[#d8e6ef] bg-white/80 p-4 text-sm leading-7 text-[#163f62] outline-none focus:border-[#d1a047]"
                    placeholder="貼上住宿備註、訂房資訊、注意事項..."
                    autoFocus
                  />
                  <label className="mt-4 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#cbdde8] bg-white/60 px-4 py-4 text-sm text-[#6b8397]">
                    上傳圖片
                    <input type="file" accept="image/*" multiple onChange={(event) => addNoteImages(event.target.files)} className="hidden" />
                  </label>
                  <div className="mt-5 flex gap-2">
                    <button type="submit" className="h-10 flex-1 rounded-full bg-[#0a3d66] font-serif text-sm tracking-[0.12em] text-white">
                      儲存
                    </button>
                    <button type="button" onClick={() => setNotesEditing(false)} className="h-10 flex-1 rounded-full border border-[#d7e5ef] bg-white/70 font-serif text-sm tracking-[0.12em] text-[#496782]">
                      取消
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="border-l-2 border-[#d1a047] pl-4">
                    <p className="whitespace-pre-wrap text-sm leading-8 text-[#163f62]">{noteText}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDraftNoteText(noteText);
                      setNotesEditing(true);
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0a3d66] px-4 py-2 text-sm text-white"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.6} />
                    編輯
                  </button>
                </>
              )}
              {noteImages.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {noteImages.map((image, index) => (
                    <div key={`${image}-${index}`} className="relative overflow-hidden rounded-2xl border border-[#d8e6ef] bg-white">
                      <img src={image} alt={`住宿備註圖片 ${index + 1}`} className="h-auto w-full" />
                      {notesEditing ? (
                        <button
                          type="button"
                          onClick={() => setNoteImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}
                          className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-[#496782] shadow"
                          aria-label="刪除備註圖片"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 rounded-2xl border border-dashed border-[#d8e6ef] bg-white/50 px-4 py-5 text-center text-xs text-[#8fa2b2]">尚未上傳圖片</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Timeline({
  dayItems,
  selectedDate,
}: {
  dayItems: typeof itinerary;
  selectedDate: string;
}) {
  const selectedDay = tripDays.find((day) => day.date === selectedDate);
  const weekdayLabel: Record<string, string> = {
    SUN: "週日",
    MON: "週一",
    TUE: "週二",
    WED: "週三",
    THU: "週四",
    FRI: "週五",
    SAT: "週六",
  };
  const dateLabel = selectedDate
    .split("-")
    .slice(1)
    .map((part) => String(Number(part)))
    .join("/");

  if (dayItems.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-[#d6e5ef] bg-white/55 p-8 text-center">
        <p className="font-serif text-xl text-[#496782]">這天還沒有行程</p>
        <p className="mt-2 text-sm text-[#8fa2b2]">可以先保留彈性，之後再補上安排。</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#dbe8f0] bg-white/72 px-4 py-3 shadow-[0_12px_32px_rgba(8,47,82,0.07)]">
      <div className="relative">
        <div className="absolute left-0 top-0 flex h-14 w-14 flex-col items-center justify-center rounded-full border border-[#e3d9cd] bg-[#f6fbfe] text-center text-[#496782] shadow-[0_5px_14px_rgba(8,47,82,0.05)]">
          <span className="font-serif text-sm leading-none">{dateLabel}</span>
          <span className="mt-1 text-[11px]">{weekdayLabel[selectedDay?.weekday ?? ""]}</span>
        </div>
        <span className="absolute bottom-9 left-[70px] top-7 w-px bg-[#89a9be]" />

        <div className="ml-[70px]">
          {dayItems.map((item) => {
            const meta = categoryMeta[item.category];
            const Icon =
              item.category === "交通" && (item.title.includes("JX") || item.title.includes("出發"))
                ? Plane
                : meta.icon;

            return (
              <article
                key={item.id}
                className="relative grid min-h-[76px] grid-cols-[52px_minmax(0,1fr)_24px] items-center gap-3 border-b border-[#e3edf4] py-3 pl-6 last:border-b-0"
              >
                <span className="absolute -left-[4px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-[#d1a047] bg-[#ffffff]" />
                <time className="self-start pt-1 font-serif text-sm text-[#163f62]">{item.time}</time>
                <div className="min-w-0 self-start pt-0.5">
                  <h3 className="truncate text-sm font-semibold tracking-[0.02em] text-[#0b3558]">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#8fa2b2]">
                    {item.description}
                  </p>
                </div>
                <Icon className="h-5 w-5 text-[#c8963e]" strokeWidth={1.45} />
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
    <section className="px-5 pt-7">
      <p className="text-sm tracking-[0.08em] text-[#6b8397]">全覽地圖與重要資訊</p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/70 bg-white/82 shadow-[0_16px_40px_rgba(8,47,82,0.1)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-[#2f82a5]">
            <Map className="h-4 w-4" />
            <span className="font-semibold">全九州地圖</span>
          </div>
          <span className="text-xs text-[#8fa2b2]">Google Maps</span>
        </div>
        <div className="relative h-[230px] overflow-hidden bg-[#dcebdc]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#dcebdc_0%,#e9f1dc_42%,#b9d7e4_43%,#b9d7e4_58%,#efe0bf_59%,#f7ead0_100%)]" />
          {["福岡", "熊本", "阿蘇", "由布院", "北九州"].map((city, index) => (
            <span
              key={city}
              className="absolute rounded-full border-2 border-white bg-[#d1a047] px-2 py-1 text-xs font-semibold text-white shadow"
              style={{ left: `${18 + index * 14}%`, top: `${30 + (index % 3) * 14}%` }}
            >
              {city}
            </span>
          ))}
        </div>
        <a href={mapUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 font-serif text-[#496782]">
          <ExternalLink className="h-4 w-4" />
          開啟 Google Maps 導航
        </a>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#0b3558]">
            <Plane className="h-5 w-5 text-[#d1a047]" strokeWidth={1.6} />
            <h2 className="font-serif text-2xl font-semibold tracking-[0.04em]">航班資訊</h2>
          </div>
          <span className="text-[10px] uppercase tracking-[0.24em] text-[#8fa2b2]">Boarding Pass</span>
        </div>
        <div className="space-y-4">
          {flightTickets.map((ticket) => (
            <FlightTicket key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </section>

      <a href="https://www.vjw.digital.go.jp/" target="_blank" rel="noreferrer" className="mt-5 block overflow-hidden rounded-2xl bg-[#07395f] p-7 text-white shadow-[0_16px_38px_rgba(8,47,82,0.24)]">
        <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold tracking-[0.18em]">MUST HAVE</span>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold">Visit Japan Web</h2>
            <p className="mt-2 text-sm text-white/55">入境審查 & 海關申報</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <ExternalLink className="h-6 w-6" />
          </span>
        </div>
      </a>

      <section className="mt-9">
        <div className="mb-4 flex items-center gap-2 text-[#0b3558]">
          <Car className="h-5 w-5" />
          <h2 className="font-serif text-2xl font-semibold">交通卡片</h2>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/82 p-5 shadow-[0_16px_38px_rgba(8,47,82,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[#8fa2b2]">給司機 (TO DRIVER)</p>
          <p className="mt-4 font-serif text-2xl font-semibold text-[#0b3558]">ここへ行ってください。</p>
          <p className="mt-2 text-sm text-[#6c8295]">請載我到這裡</p>
        </div>
      </section>

      <section className="mt-9 space-y-4">
        {infoCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-white/70 bg-white/82 p-5 shadow-[0_12px_30px_rgba(8,47,82,0.07)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8fa2b2]">{card.type}</p>
            <h3 className="mt-3 font-serif text-xl font-semibold text-[#0b3558]">{card.title}</h3>
            <div className="mt-5 flex items-center justify-between border-t border-dashed border-[#dbe8f0] pt-4">
              <p className="text-sm text-[#6c8295]">{card.detail}</p>
              <Copy className="h-4 w-4 text-[#8fa2b2]" />
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function FlightTicket({ ticket }: { ticket: { label: string; date: string; from: string; to: string; depart: string; arrive: string; airline: string; flightNo: string } }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/82 p-5 shadow-[0_14px_34px_rgba(8,47,82,0.1)]">
      <span className="absolute inset-y-4 right-0 w-1 rounded-l-full bg-[#e1a33a]" />
      <div className="flex items-center justify-between border-b border-dashed border-[#dbe8f0] pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c58e2f]">Flight Ticket</p>
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#8fa2b2]">{ticket.label}</p>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div>
          <p className="font-serif text-4xl font-bold tracking-[0.02em] text-[#062d50]">{ticket.from}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#8fa2b2]">Dep {ticket.depart}</p>
        </div>
        <div className="flex items-center gap-2 text-[#b7cbd8]">
          <span className="h-px w-8 bg-[#d9e6ef]" />
          <Plane className="h-4 w-4 rotate-90 text-[#c58e2f]" strokeWidth={1.5} />
          <span className="h-px w-8 bg-[#d9e6ef]" />
        </div>
        <div className="text-right">
          <p className="font-serif text-4xl font-bold tracking-[0.02em] text-[#062d50]">{ticket.to}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#8fa2b2]">Arr {ticket.arrive}</p>
        </div>
      </div>
      <div className="mt-5 rounded-xl bg-[#edf5fa] px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8fa2b2]">Date</p>
            <p className="mt-1 font-serif text-sm font-semibold text-[#163f62]">{ticket.date}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8fa2b2]">Flight</p>
            <p className="mt-1 font-serif text-sm font-semibold text-[#163f62]">
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
            <ReceiptText className="h-5 w-5 text-[#496782]" strokeWidth={1.7} />
            <h2 className="font-serif text-3xl font-semibold tracking-[0.04em] text-[#082f52]">旅行帳本</h2>
          </div>
          <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Online</span>
        </div>
        <div className="text-right text-xs text-[#8fa2b2]">
          <p>全部顯示</p>
          <p>{expenses.length} 筆項目</p>
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        {(["all", "K", "M", "E", "G", "J"] as const).map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={cn("flex h-8 min-w-8 items-center justify-center rounded-full border px-3 font-serif text-sm", filter === item ? "border-[#0a3d66] bg-[#0a3d66] text-white" : "border-[#d7e5ef] bg-white/70 text-[#6c8295]")}>
            {item === "all" ? "全部" : item}
          </button>
        ))}
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/70 bg-white/82 shadow-[0_16px_38px_rgba(8,47,82,0.08)]">
        <div className="border-b border-[#e1ebf2] p-6">
          <p className="text-sm text-[#6c8295]">總金額（台幣）</p>
          <p className="mt-2 font-serif text-5xl font-semibold text-[#082f52]">${total.toLocaleString()}</p>
          <p className="mt-2 text-sm font-semibold text-[#496782]">每人均攤: ${Math.round(total / 5).toLocaleString()}</p>
        </div>
        {visibleExpenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between border-b border-[#e5eef4] p-4 last:border-b-0">
            <div>
              <p className="font-semibold text-[#0b3558]">{expense.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs", payerStyle[expense.payer])}>{expense.payer}</span>
                <span className="rounded bg-[#edf5fa] px-2 py-0.5 text-[10px] text-[#6c8295]">{expense.paid ? "已付" : "未付"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-sm font-semibold text-[#163f62]">${expense.amount.toLocaleString()}</p>
              <button onClick={() => setExpenses((current) => current.filter((item) => item.id !== expense.id))} className="text-[#8fa2b2]" aria-label="刪除項目">
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {adding ? (
        <form onSubmit={addExpense} className="mt-5 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_12px_34px_rgba(8,47,82,0.07)]">
          <div className="flex items-center justify-between border-b border-[#e1ebf2] pb-4">
            <p className="text-sm tracking-[0.18em] text-[#6c8295]">新增款項</p>
            <button type="button" onClick={() => setAdding(false)} className="text-[#6c8295]" aria-label="關閉新增款項">
              <X className="h-5 w-5" />
            </button>
          </div>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="款項名稱" className="mt-5 w-full border-b border-[#cadbe7] bg-transparent py-3 text-xl outline-none placeholder:text-[#aab9c5]" autoFocus />
          <div className="mt-5 flex items-end gap-3">
            <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="numeric" placeholder="0" className="min-w-0 flex-1 border-b border-[#cadbe7] bg-transparent py-3 font-serif text-4xl outline-none placeholder:text-[#cadbe7]" />
            <span className="rounded border border-[#d7e5ef] bg-[#edf5fa] px-4 py-3 font-serif text-sm text-[#496782]">JPY</span>
          </div>
          <div className="mt-5 flex gap-2">
            {(["K", "M", "E", "G", "J"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setPayer(item)} className={cn("h-9 w-9 rounded-full border font-serif text-sm", payer === item ? payerStyle[item] : "border-[#d7e5ef] text-[#8fa2b2]")}>
                {item}
              </button>
            ))}
          </div>
          <button type="submit" className="mt-6 h-12 w-full rounded-full bg-[#0a3d66] font-serif text-lg tracking-[0.16em] text-white">加入款項</button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="mt-12 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0a3d66] font-serif text-lg tracking-[0.18em] text-white shadow-[0_12px_22px_rgba(8,47,82,0.18)]">
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
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#8fa2b2]">Packing</p>
          <div className="mt-2 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-[#d1a047]" strokeWidth={1.7} />
            <h2 className="font-serif text-3xl font-semibold tracking-[0.04em] text-[#082f52]">準備清單</h2>
          </div>
        </div>
        <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-right shadow-sm">
          <p className="font-serif text-lg text-[#082f52]">
            {doneItems}/{totalItems}
          </p>
          <p className="text-[10px] tracking-[0.16em] text-[#8fa2b2]">READY</p>
        </div>
      </div>
      <div className="mt-7 space-y-5">
        {categories.map((category) => {
          const done = category.items.filter((item) => item.done).length;
          return (
            <article key={category.id} className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/82 shadow-[0_16px_36px_rgba(8,47,82,0.09)]">
              <span className={cn("absolute inset-y-0 left-0 w-1.5", category.accent)} />
              <div className="flex items-center justify-between border-b border-[#e1ebf2] px-5 py-4">
                <h3 className="font-serif text-xl font-semibold text-[#082f52]">{category.title}</h3>
                <span className="rounded-full bg-[#edf5fa] px-3 py-1 font-serif text-xs text-[#496782]">
                  {done}/{category.items.length}
                </span>
              </div>
              <div className="divide-y divide-[#e5eef4]">
                {category.items.map((item) => (
                  <div key={item.id} className="flex min-h-14 items-center gap-3 px-5 py-3">
                    <button
                      onClick={() => toggleItem(category.id, item.id)}
                      className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded border transition", item.done ? "border-[#d1a047] bg-[#d1a047] text-white" : "border-[#cadbe7] bg-white text-transparent")}
                      aria-label={item.done ? "標記為未完成" : "標記為完成"}
                    >
                      <CheckSquare className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <span className={cn("flex-1 text-sm font-medium", item.done ? "text-[#aab9c5] line-through" : "text-[#0b3558]")}>{item.label}</span>
                    <button onClick={() => removeItem(category.id, item.id)} className="text-[#8fa2b2]" aria-label="刪除物品">
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
        <form onSubmit={addItem} className="mt-6 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_16px_36px_rgba(8,47,82,0.07)]">
          <div className="flex items-center justify-between border-b border-[#e1ebf2] pb-4">
            <p className="text-sm tracking-[0.18em] text-[#6c8295]">新增物品</p>
            <button type="button" onClick={() => setAdding(false)} className="text-[#6c8295]" aria-label="關閉新增物品">
              <X className="h-5 w-5" />
            </button>
          </div>
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-5 w-full rounded-xl border border-[#d7e5ef] bg-[#f7fbfe] px-4 py-3 text-sm text-[#163f62] outline-none">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
          <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="物品名稱" className="mt-4 w-full border-b border-[#cadbe7] bg-transparent py-3 text-xl outline-none placeholder:text-[#aab9c5]" autoFocus />
          <button type="submit" className="mt-6 h-12 w-full rounded-full bg-[#0a3d66] font-serif text-lg tracking-[0.16em] text-white">
            加入清單
          </button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="mt-8 flex h-16 w-full items-center justify-center gap-2 rounded-full bg-[#0a3d66] font-serif text-xl tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(8,47,82,0.2)]">
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
    { id: "ledger" as const, label: "記帳", icon: WalletCards },
    { id: "checklist" as const, label: "準備清單", icon: ClipboardCheck },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e1ebf2] bg-white/94 px-4 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[390px] grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1.5 text-[12px] transition-colors",
                active ? "font-medium text-[#cf9c3e]" : "text-[#71889a]",
              )}
            >
              {item.id === "tools" && active ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#cf9c3e]">
                  <Info className="h-4 w-4 text-white" strokeWidth={2} />
                </span>
              ) : (
                <Icon className="h-6 w-6" strokeWidth={active ? 2 : 1.7} />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
