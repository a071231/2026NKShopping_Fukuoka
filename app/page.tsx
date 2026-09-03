"use client";

import Image from "next/image";

import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CalendarDays,
  Camera,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Cloud,
  CloudRain,
  Copy,
  ExternalLink,
  Home,
  GripVertical,
  Info,
  MapPin,
  PackagePlus,
  Pencil,
  Plane,
  Plus,
  Phone,
  ReceiptText,
  StickyNote,
  Sun,
  Trash2,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import { hotel, tripDays, weatherForecast, type ItineraryCategory, type ItineraryItem, type WeatherIcon } from "@/data/trip";
import { useCloudChecklist, useCloudExpenses, useCloudItinerary, useCloudMembers, type CloudChecklistCategory, type CloudExpense, type TripMember } from "@/lib/cloud-data";
import { cn } from "@/lib/utils";

type View = "home" | "tools" | "ledger" | "checklist";

const defaultHotelLink = "https://www.google.com/maps/search/?api=1&query=Randor+Residential+Hotel+Fukuoka+Annex";
const defaultHotelNote = "Agoda 訂單編號：1742593424";
const heroImage = "/images/fukuoka-coast-hero.jpg";

const categoryMeta: Record<
  ItineraryCategory,
  { en: string; iconSrc: string; background: string }
> = {
  交通: { en: "TRANSPORT", iconSrc: "/icons/category-transport.svg", background: "bg-[#b3e2ff]" },
  食物: { en: "FOOD", iconSrc: "/icons/category-food.svg", background: "bg-[#f3d5eb]" },
  購物: { en: "SHOPPING", iconSrc: "/icons/category-shopping.svg", background: "bg-[#d2ebc1]" },
  景點: { en: "ACTIVITY", iconSrc: "/icons/category-place.svg", background: "bg-[#a8e2cb]" },
};

const weatherIconMap: Record<WeatherIcon, typeof Sun> = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
};

const initialExpenses: CloudExpense[] = [];

const initialChecklist: CloudChecklistCategory[] = [
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
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [editDraft, setEditDraft] = useState<ItineraryItem | null>(null);
  const { items: cloudItinerary, cloudError, addItem, updateItem, reorderItems, deleteItem } = useCloudItinerary();
  const dayItems = useMemo(() => cloudItinerary.filter((item) => item.date === selectedDate), [cloudItinerary, selectedDate]);

  function addItineraryItem() {
    setEditingItem(null);
    setEditDraft({
      id: "",
      position: Date.now(),
      date: selectedDate,
      time: "10:00",
      title: "",
      category: "景點",
      description: "",
      address: "",
      url: "",
    });
  }

  function editItineraryItem(item: ItineraryItem) {
    setEditingItem(item);
    setEditDraft({ ...item });
  }

  async function saveItineraryItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editDraft?.time.trim() || !editDraft.title.trim()) return;
    const itemValues = {
      date: editDraft.date,
      time: editDraft.time.trim(),
      title: editDraft.title.trim(),
      description: editDraft.description.trim(),
      category: editDraft.category,
      address: editDraft.address.trim(),
      url: editDraft.url.trim(),
    };
    if (editingItem) {
      await updateItem(editingItem.id, itemValues);
    } else {
      await addItem({ ...itemValues, position: Date.now() });
    }
    setEditingItem(null);
    setEditDraft(null);
  }

  return (
    <main className="min-h-screen bg-[#dcecf7] text-[#082f52]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[linear-gradient(180deg,#eef8ff_0%,#f9fcfe_32%,#f5faff_100%)] pb-28 shadow-[0_0_90px_rgba(8,47,82,0.22)] min-[821px]:max-w-[1100px]">
        {view === "home" ? (
          <>
            <HeroHeader />
            <div className="-mt-14 space-y-5 px-5">
              <WeatherCard />
              <StayCard />
              <SectionHeading title="每日行程" />
              <DateRail selectedDate={selectedDate} onSelect={setSelectedDate} view={view} setView={setView} />
              {cloudError ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-600">{cloudError}</p> : null}
              <button onClick={addItineraryItem} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0a3d66] px-4 py-3 text-sm font-semibold text-white shadow-sm">
                <Plus className="h-4 w-4" /> 新增這天的行程
              </button>
              <Timeline
                dayItems={dayItems}
                selectedDate={selectedDate}
                onEdit={editItineraryItem}
                onReorder={(items) => void reorderItems(items)}
                onDelete={(item) => {
                  if (window.confirm(`確定刪除「${item.title}」嗎？`)) void deleteItem(item.id);
                }}
              />
            </div>
          </>
        ) : (
          <>
            <CompactHeader />
            {view === "tools" ? <ToolsView /> : view === "ledger" ? <LedgerView /> : <ChecklistView />}
          </>
        )}
      </div>
      {editDraft ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-stone-950/45 px-4 backdrop-blur-sm">
          <form onSubmit={saveItineraryItem} className="max-h-[88vh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-[#f7fbfe] p-5 shadow-[0_-18px_48px_rgba(8,47,82,0.24)]">
            <div className="flex items-center justify-between border-b border-[#dce8f0] pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#d1a047]">Itinerary</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-[#082f52]">{editingItem ? "編輯行程" : "新增行程"}</h2>
              </div>
              <button type="button" onClick={() => { setEditingItem(null); setEditDraft(null); }} className="rounded-full p-2 text-[#6c8295]" aria-label="關閉編輯行程">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="mt-5 block text-xs font-medium text-[#6c8295]">時間</label>
            <input value={editDraft.time} onChange={(event) => setEditDraft({ ...editDraft, time: event.target.value })} placeholder="例如 14:40" className="mt-2 w-full rounded-xl border border-[#d7e5ef] bg-white px-4 py-3 text-[#163f62] outline-none focus:border-[#d1a047]" />
            <label className="mt-4 block text-xs font-medium text-[#6c8295]">行程名稱</label>
            <input value={editDraft.title} onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })} className="mt-2 w-full rounded-xl border border-[#d7e5ef] bg-white px-4 py-3 text-[#163f62] outline-none focus:border-[#d1a047]" />
            <label className="mt-4 block text-xs font-medium text-[#6c8295]">行程說明（顯示在標題下方的小字）</label>
            <textarea value={editDraft.description} onChange={(event) => setEditDraft({ ...editDraft, description: event.target.value })} rows={4} className="mt-2 w-full resize-none rounded-xl border border-[#d7e5ef] bg-white px-4 py-3 text-sm leading-6 text-[#163f62] outline-none focus:border-[#d1a047]" />
            <label className="mt-4 block text-xs font-medium text-[#6c8295]">分類</label>
            <select value={editDraft.category} onChange={(event) => setEditDraft({ ...editDraft, category: event.target.value as ItineraryCategory })} className="mt-2 w-full rounded-xl border border-[#d7e5ef] bg-white px-4 py-3 text-[#163f62] outline-none">
              {(["交通", "食物", "購物", "景點"] as ItineraryCategory[]).map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <label className="mt-4 block text-xs font-medium text-[#6c8295]">地址（選填）</label>
            <input value={editDraft.address} onChange={(event) => setEditDraft({ ...editDraft, address: event.target.value })} className="mt-2 w-full rounded-xl border border-[#d7e5ef] bg-white px-4 py-3 text-sm text-[#163f62] outline-none focus:border-[#d1a047]" />
            <label className="mt-4 block text-xs font-medium text-[#6c8295]">相關連結（選填）</label>
            <input value={editDraft.url} onChange={(event) => setEditDraft({ ...editDraft, url: event.target.value })} inputMode="url" className="mt-2 w-full rounded-xl border border-[#d7e5ef] bg-white px-4 py-3 text-sm text-[#163f62] outline-none focus:border-[#d1a047]" />
            <button type="submit" className="mt-6 h-12 w-full rounded-full bg-[#0a3d66] font-serif text-lg tracking-[0.14em] text-white">{editingItem ? "儲存修改" : "新增行程"}</button>
          </form>
        </div>
      ) : null}
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
  const selectedIndex = tripDays.findIndex((day) => day.date === selectedDate);
  const selectAdjacentDay = (offset: number) => {
    const nextDay = tripDays[selectedIndex + offset];
    if (!nextDay) return;
    onSelect(nextDay.date);
    setView("home");
  };

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => selectAdjacentDay(-1)} disabled={selectedIndex <= 0} className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d7e5ef] bg-white/80 text-[#496782] shadow-sm transition hover:border-[#d1a047] hover:text-[#b78023] disabled:cursor-not-allowed disabled:opacity-30 min-[821px]:flex" aria-label="前一天">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <nav className="no-scrollbar flex min-w-0 flex-1 overflow-x-auto py-1">
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
      <button type="button" onClick={() => selectAdjacentDay(1)} disabled={selectedIndex < 0 || selectedIndex >= tripDays.length - 1} className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d7e5ef] bg-white/80 text-[#496782] shadow-sm transition hover:border-[#d1a047] hover:text-[#b78023] disabled:cursor-not-allowed disabled:opacity-30 min-[821px]:flex" aria-label="後一天">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
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
  const [hotelLink, setHotelLink] = useStoredState("nk-trip-hotel-link-v2", defaultHotelLink);
  const [draftLink, setDraftLink] = useState(hotelLink);
  const [editingLink, setEditingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesEditing, setNotesEditing] = useState(false);
  const [noteText, setNoteText] = useStoredState("nk-trip-hotel-note-text-v2", defaultHotelNote);
  const [draftNoteText, setDraftNoteText] = useState(noteText);
  const [noteImages, setNoteImages] = useStoredState<string[]>("nk-trip-hotel-note-images", []);

  useEffect(() => {
    if (!editingLink) setDraftLink(hotelLink);
  }, [editingLink, hotelLink]);

  async function copyStayInfo() {
    await navigator.clipboard.writeText(["住宿資訊", `${hotel.name} (${hotel.englishName})`, `電話：${hotel.phone}`, `入住：${hotel.checkIn}`, `退房：${hotel.checkOut}`, `Agoda 訂單編號：${hotel.orderNumber}`, hotelLink].join("\n"));
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
            <h2 className="font-serif text-lg font-semibold leading-tight text-[#082f52]">{hotel.name}</h2>
            <p className="mt-1 text-[10px] leading-snug text-[#6c8295]">{hotel.englishName}</p>
            <p className="mt-3 flex min-w-0 items-start gap-2 text-xs leading-relaxed text-[#6c8295]">
              <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{hotel.phone}</span>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#d1a047]" strokeWidth={1.4} />
                <div>
                  <p className="text-[10px] text-[#8fa2b2]">入住</p>
                  <p className="mt-0.5 font-serif text-sm text-[#163f62]">10/03 15:00</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#d1a047]" strokeWidth={1.4} />
                <div>
                  <p className="text-[10px] text-[#8fa2b2]">退房</p>
                  <p className="mt-0.5 font-serif text-sm text-[#163f62]">10/11 11:00</p>
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
  onEdit,
  onReorder,
  onDelete,
}: {
  dayItems: ItineraryItem[];
  selectedDate: string;
  onEdit: (item: ItineraryItem) => void;
  onReorder: (items: ItineraryItem[]) => void;
  onDelete: (item: ItineraryItem) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
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
        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-[#e3d9cd] bg-[#f6fbfe] text-center text-[#496782] shadow-[0_5px_14px_rgba(8,47,82,0.05)]">
          <span className="font-serif text-sm leading-none">{dateLabel}</span>
          <span className="mt-1 text-[11px]">{weekdayLabel[selectedDay?.weekday ?? ""]}</span>
        </div>

        <div className="relative mt-3 w-full">
          <span className="absolute bottom-9 left-0 top-0 w-px bg-[#89a9be]" />
          {dayItems.map((item) => {
            const meta = categoryMeta[item.category];
            return (
              <article
                key={item.id}
                draggable
                onDragStart={(event) => {
                  setDraggedId(item.id);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", item.id);
                }}
                onDragEnd={() => setDraggedId(null)}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const sourceId = event.dataTransfer.getData("text/plain") || draggedId;
                  if (!sourceId || sourceId === item.id) return;
                  const nextItems = [...dayItems];
                  const sourceIndex = nextItems.findIndex((entry) => entry.id === sourceId);
                  const targetIndex = nextItems.findIndex((entry) => entry.id === item.id);
                  if (sourceIndex < 0 || targetIndex < 0) return;
                  const [movedItem] = nextItems.splice(sourceIndex, 1);
                  nextItems.splice(targetIndex, 0, movedItem);
                  onReorder(nextItems);
                  setDraggedId(null);
                }}
                className={cn(
                  "relative grid min-h-[76px] cursor-grab grid-cols-[52px_minmax(0,1fr)_104px] items-center gap-2 border-b border-[#e3edf4] py-3 pl-6 transition last:border-b-0 active:cursor-grabbing",
                  draggedId === item.id && "opacity-40",
                )}
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
                <div className="flex items-center justify-end gap-2">
                  <span className={cn("mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full", meta.background)}>
                    <Image src={meta.iconSrc} alt={`${item.category}分類`} width={24} height={24} className="h-6 w-6 object-contain" />
                  </span>
                  <div className="flex flex-col items-center gap-2">
                    <button onClick={() => onEdit(item)} className="text-[#6c8295]" aria-label={`編輯${item.title}`}><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(item)} className="text-rose-400" aria-label={`刪除${item.title}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <GripVertical className="h-5 w-5 shrink-0 text-[#8fa2b2]" aria-label={`拖曳排序${item.title}`} />
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
  const flightTickets = [
    { id: "flight-out", label: "去程航班", date: "03 Oct 2026", from: "TPE", fromName: "桃園", fromTerminal: "2", to: "FUK", toName: "福岡", toTerminal: "I", depart: "14:40", arrive: "18:05", airline: "中華航空", flightNo: "CI128" },
    { id: "flight-back", label: "回程航班", date: "11 Oct 2026", from: "FUK", fromName: "福岡", fromTerminal: "I", to: "TPE", toName: "桃園", toTerminal: "2", depart: "11:00", arrive: "12:30", airline: "中華航空", flightNo: "CI111" },
  ];

  return (
    <section className="px-5 pt-7">
      <p className="text-sm tracking-[0.08em] text-[#6b8397]">旅行重要資訊</p>
      <MembersCard />

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

    </section>
  );
}

function MembersCard() {
  const { members, cloudError, addMember: addCloudMember, deleteMember: deleteCloudMember, updateAvatar: updateCloudAvatar } = useCloudMembers();
  const [newMemberName, setNewMemberName] = useState("");

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newMemberName.trim();
    if (!name || members.some((member) => member.name === name)) return;
    try {
      await addCloudMember(name);
      setNewMemberName("");
    } catch {
      window.alert("新增失敗，請確認 Firebase 規則已部署。");
    }
  }

  async function deleteMember(member: TripMember) {
    if (!window.confirm(`確定要刪除「${member.name}」嗎？`)) return;
    await deleteCloudMember(member.id);
  }

  function updateAvatar(memberId: string, files: FileList | null) {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const photo = document.createElement("img");
      photo.onload = () => {
        const size = 320;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) return;

        const scale = Math.max(size / photo.naturalWidth, size / photo.naturalHeight);
        const width = photo.naturalWidth * scale;
        const height = photo.naturalHeight * scale;
        context.drawImage(photo, (size - width) / 2, (size - height) / 2, width, height);
        const avatar = canvas.toDataURL("image/jpeg", 0.78);
        void updateCloudAvatar(memberId, avatar).catch(() => window.alert("照片上傳失敗，請確認 Firebase 規則已部署。"));
      };
      photo.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="mt-6 rounded-2xl border border-white/70 bg-white/82 p-5 shadow-[0_16px_40px_rgba(8,47,82,0.1)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f3f9] text-[#2f82a5]">
            <Users className="h-5 w-5" strokeWidth={1.7} />
          </span>
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-[0.06em] text-[#0b3558]">成員</h2>
            <p className="mt-1 text-[11px] text-[#8fa2b2]">點選大頭貼即可更換照片</p>
          </div>
        </div>
        <span className="rounded-full bg-[#edf5fa] px-3 py-1 text-xs font-semibold text-[#6c8295]">{members.length} 人</span>
      </div>

      {cloudError ? <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{cloudError}</p> : null}
      <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-6">
        {members.map((member) => (
          <div key={member.id} className="group flex min-w-0 flex-col items-center text-center">
            <label className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border-2 border-white bg-[#e8f3f9] shadow-[0_8px_22px_rgba(8,47,82,0.14)] ring-1 ring-[#d4e4ee]">
              {member.avatar ? (
                <Image src={member.avatar} alt={`${member.name}的大頭貼`} width={80} height={80} unoptimized className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-serif text-xl font-semibold text-[#2f82a5]">{member.name.slice(0, 2)}</span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-[#062d50]/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Camera className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  updateAvatar(member.id, event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <p className="mt-3 max-w-full truncate text-sm font-semibold text-[#0b3558]">{member.name}</p>
            <button type="button" onClick={() => void deleteMember(member)} className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-[#8fa2b2] transition-colors hover:text-rose-500">
              <Trash2 className="h-3 w-3" strokeWidth={1.6} />
              刪除
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addMember} className="mt-6 flex gap-2 border-t border-[#e3edf4] pt-5">
        <input
          value={newMemberName}
          onChange={(event) => setNewMemberName(event.target.value)}
          maxLength={20}
          placeholder="輸入新成員名稱"
          className="min-w-0 flex-1 rounded-full border border-[#d7e5ef] bg-white/75 px-4 py-2.5 text-sm text-[#163f62] outline-none placeholder:text-[#a4b5c2] focus:border-[#d1a047]"
        />
        <button type="submit" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0a3d66] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#12557f]">
          <Plus className="h-4 w-4" />
          新增
        </button>
      </form>
    </section>
  );
}

function FlightTicket({ ticket }: { ticket: { label: string; date: string; from: string; fromName: string; fromTerminal: string; to: string; toName: string; toTerminal: string; depart: string; arrive: string; airline: string; flightNo: string } }) {
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
          <p className="mt-2 max-w-[120px] text-[9px] leading-4 text-[#6c8295]">{ticket.fromName}</p>
          <p className="mt-1 text-[9px] font-semibold text-[#496782]">Terminal {ticket.fromTerminal}</p>
        </div>
        <div className="flex items-center gap-2 text-[#b7cbd8]">
          <span className="h-px w-8 bg-[#d9e6ef]" />
          <Plane className="h-4 w-4 rotate-90 text-[#c58e2f]" strokeWidth={1.5} />
          <span className="h-px w-8 bg-[#d9e6ef]" />
        </div>
        <div className="text-right">
          <p className="font-serif text-4xl font-bold tracking-[0.02em] text-[#062d50]">{ticket.to}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#8fa2b2]">Arr {ticket.arrive}</p>
          <p className="ml-auto mt-2 max-w-[120px] text-[9px] leading-4 text-[#6c8295]">{ticket.toName}</p>
          <p className="mt-1 text-[9px] font-semibold text-[#496782]">Terminal {ticket.toTerminal}</p>
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
  const { members, cloudError } = useCloudMembers();
  const { expenses, cloudError: ledgerCloudError, addExpense: addCloudExpense, deleteExpense } = useCloudExpenses(initialExpenses);
  const [filter, setFilter] = useState("all");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");
  const legacyPayerIds: Record<string, string | undefined> = {
    K: members[0]?.id,
    M: members[1]?.id,
    E: members[2]?.id,
    G: members[3]?.id,
    J: members[4]?.id,
  };
  const resolvePayerId = (payerId: string) => legacyPayerIds[payerId] ?? payerId;
  const visibleExpenses = filter === "all" ? expenses : expenses.filter((item) => resolvePayerId(item.payer) === filter);
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => {
    if (!members.length) return;
    if (!members.some((member) => member.id === payer)) setPayer(members[0].id);
  }, [members, payer]);

  async function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount.replace(/,/g, ""));
    if (!title.trim() || !payer || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    try {
      await addCloudExpense({ title: title.trim(), amount: Math.round(parsedAmount), payer, paid: false });
      setTitle("");
      setAmount("");
      setPayer(members[0]?.id ?? "");
      setAdding(false);
    } catch {
      window.alert("新增帳目失敗，請確認網路與 Firebase 規則。");
    }
  }

  async function removeExpense(expense: CloudExpense) {
    if (!window.confirm(`確定要刪除「${expense.title}」嗎？`)) return;
    try {
      await deleteExpense(expense.id);
    } catch {
      window.alert("刪除帳目失敗，請確認網路與 Firebase 規則。");
    }
  }

  return (
    <section className="px-5 pt-7">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-[#496782]" strokeWidth={1.7} />
            <h2 className="font-serif text-3xl font-semibold tracking-[0.04em] text-[#082f52]">旅行帳本</h2>
          </div>
          <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Firestore 即時同步</span>
        </div>
        <div className="text-right text-xs text-[#8fa2b2]">
          <p>全部顯示</p>
          <p>{expenses.length} 筆項目</p>
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button onClick={() => setFilter("all")} className={cn("flex h-10 items-center justify-center rounded-full border px-4 font-serif text-sm", filter === "all" ? "border-[#0a3d66] bg-[#0a3d66] text-white" : "border-[#d7e5ef] bg-white/70 text-[#6c8295]")}>
          全部
        </button>
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
          {members.map((member) => (
            <button key={member.id} onClick={() => setFilter(member.id)} title={member.name} aria-label={`只顯示 ${member.name} 的款項`} className={cn("relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2", filter === member.id ? "border-[#cf9c3e] ring-2 ring-[#f4dfb5]" : "border-white ring-1 ring-[#d4e4ee]")}>
              {member.avatar ? <Image src={member.avatar} alt={member.name} width={40} height={40} unoptimized className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center bg-[#e8f3f9] text-xs font-semibold text-[#2f82a5]">{member.name.slice(0, 2)}</span>}
            </button>
          ))}
        </div>
      </div>
      {cloudError ? <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{cloudError}</p> : null}
      {ledgerCloudError ? <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{ledgerCloudError}</p> : null}
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/70 bg-white/82 shadow-[0_16px_38px_rgba(8,47,82,0.08)]">
        <div className="border-b border-[#e1ebf2] p-6">
          <p className="text-sm text-[#6c8295]">總金額（台幣）</p>
          <p className="mt-2 font-serif text-5xl font-semibold text-[#082f52]">${total.toLocaleString()}</p>
          <p className="mt-2 text-sm font-semibold text-[#496782]">每人均攤: ${members.length ? Math.round(total / members.length).toLocaleString() : "0"}</p>
        </div>
        {visibleExpenses.map((expense) => {
          const member = members.find((item) => item.id === resolvePayerId(expense.payer));
          return <div key={expense.id} className="flex items-center justify-between border-b border-[#e5eef4] p-4 last:border-b-0">
            <div>
              <p className="font-semibold text-[#0b3558]">{expense.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#496782]">
                  <span className="h-6 w-6 overflow-hidden rounded-full border border-white bg-[#e8f3f9] ring-1 ring-[#d4e4ee]">
                    {member?.avatar ? <Image src={member.avatar} alt={member.name} width={24} height={24} unoptimized className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-[#2f82a5]">{member?.name.slice(0, 2) ?? "?"}</span>}
                  </span>
                  {member?.name ?? "已刪除成員"}
                </span>
                <span className="rounded bg-[#edf5fa] px-2 py-0.5 text-[10px] text-[#6c8295]">{expense.paid ? "已付" : "未付"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-sm font-semibold text-[#163f62]">${expense.amount.toLocaleString()}</p>
              <button onClick={() => void removeExpense(expense)} className="rounded-full p-2 text-[#8fa2b2] transition-colors hover:bg-rose-50 hover:text-rose-500" aria-label={`刪除${expense.title}`}>
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>;
        })}
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
            {members.map((member) => (
              <button key={member.id} type="button" onClick={() => setPayer(member.id)} title={member.name} className={cn("relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2", payer === member.id ? "border-[#cf9c3e] ring-2 ring-[#f4dfb5]" : "border-white ring-1 ring-[#d4e4ee]")}>
                {member.avatar ? <Image src={member.avatar} alt={member.name} width={48} height={48} unoptimized className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center bg-[#e8f3f9] text-xs font-semibold text-[#2f82a5]">{member.name.slice(0, 2)}</span>}
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
  const { members } = useCloudMembers();
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const activeMemberId = members.some((member) => member.id === selectedMemberId) ? selectedMemberId : members[0]?.id ?? "";
  const activeMember = members.find((member) => member.id === activeMemberId);
  const { categories, cloudError, save: saveCategories } = useCloudChecklist(activeMemberId, initialChecklist);
  const [adding, setAdding] = useState(false);
  const [categoryId, setCategoryId] = useState(initialChecklist[0].id);
  const [label, setLabel] = useState("");
  const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0);
  const doneItems = categories.reduce((sum, category) => sum + category.items.filter((item) => item.done).length, 0);

  function toggleItem(categoryIdToUpdate: string, itemId: string) {
    saveCategories((current) =>
      current.map((category) =>
        category.id === categoryIdToUpdate
          ? { ...category, items: category.items.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)) }
          : category,
      ),
    );
  }

  function removeItem(categoryIdToUpdate: string, itemId: string) {
    saveCategories((current) =>
      current.map((category) => (category.id === categoryIdToUpdate ? { ...category, items: category.items.filter((item) => item.id !== itemId) } : category)),
    );
  }

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;
    saveCategories((current) =>
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
      <div className="mt-6 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm">
        <p className="text-xs font-medium text-[#6c8295]">選擇正在整理清單的成員</p>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => {
                setSelectedMemberId(member.id);
                setAdding(false);
              }}
              className="flex shrink-0 flex-col items-center gap-1.5"
              aria-label={`查看 ${member.name} 的準備清單`}
            >
              <span className={cn("h-12 w-12 overflow-hidden rounded-full border-2", activeMemberId === member.id ? "border-[#cf9c3e] ring-2 ring-[#f4dfb5]" : "border-white ring-1 ring-[#d4e4ee]")}>
                {member.avatar ? <Image src={member.avatar} alt={member.name} width={48} height={48} unoptimized className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center bg-[#e8f3f9] text-xs font-semibold text-[#2f82a5]">{member.name.slice(0, 2)}</span>}
              </span>
              <span className={cn("max-w-14 truncate text-[10px]", activeMemberId === member.id ? "font-semibold text-[#0b3558]" : "text-[#8fa2b2]")}>{member.name}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#496782]">目前顯示：{activeMember?.name ?? "尚無成員"} 的清單</p>
      </div>
      {cloudError ? <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{cloudError}</p> : null}
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
      <div className="mx-auto grid max-w-[390px] grid-cols-4 min-[821px]:max-w-[720px]">
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
