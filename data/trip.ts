export type ItineraryCategory = "交通" | "食物" | "購物" | "景點";

export type ItineraryItem = {
  id: string;
  date: string;
  time: string;
  title: string;
  category: ItineraryCategory;
  description: string;
  address: string;
  url: string;
};

export const tripDays = [
  { date: "2026-10-03", weekday: "SAT", day: "3", label: "DAY 1", city: "熊本市" },
  { date: "2026-10-04", weekday: "SUN", day: "4", label: "DAY 2", city: "熊本" },
  { date: "2026-10-05", weekday: "MON", day: "5", label: "DAY 3", city: "阿蘇" },
  { date: "2026-10-06", weekday: "TUE", day: "6", label: "DAY 4", city: "福岡" },
  { date: "2026-10-07", weekday: "WED", day: "7", label: "DAY 5", city: "博多" },
  { date: "2026-10-08", weekday: "THU", day: "8", label: "DAY 6", city: "天神" },
  { date: "2026-10-09", weekday: "FRI", day: "9", label: "DAY 7", city: "購物" },
  { date: "2026-10-10", weekday: "SAT", day: "10", label: "DAY 8", city: "太宰府" },
  { date: "2026-10-11", weekday: "SUN", day: "11", label: "DAY 9", city: "返程" },
];

export const weatherForecast = [
  { date: "10/3", weekday: "SAT", high: "24°", low: "18°", condition: "晴時多雲", rain: "10%" },
  { date: "10/4", weekday: "SUN", high: "25°", low: "19°", condition: "多雲", rain: "20%" },
  { date: "10/5", weekday: "MON", high: "23°", low: "18°", condition: "短暫雨", rain: "45%" },
  { date: "10/6", weekday: "TUE", high: "24°", low: "17°", condition: "晴朗", rain: "10%" },
  { date: "10/7", weekday: "WED", high: "26°", low: "18°", condition: "微雲", rain: "15%" },
  { date: "10/8", weekday: "THU", high: "25°", low: "19°", condition: "多雲", rain: "25%" },
  { date: "10/9", weekday: "FRI", high: "24°", low: "18°", condition: "陰時晴", rain: "30%" },
  { date: "10/10", weekday: "SAT", high: "23°", low: "17°", condition: "小雨", rain: "55%" },
  { date: "10/11", weekday: "SUN", high: "24°", low: "18°", condition: "短暫雨", rain: "40%" },
  { date: "10/12", weekday: "MON", high: "25°", low: "19°", condition: "晴時多雲", rain: "15%" },
  { date: "10/13", weekday: "TUE", high: "26°", low: "20°", condition: "晴朗", rain: "10%" },
  { date: "10/14", weekday: "WED", high: "25°", low: "20°", condition: "多雲", rain: "20%" },
];

export const hotel = {
  name: "The Blossom Kumamoto",
  dates: "2026.10.03 - 2026.10.07",
  address: "3 Chome-15-26 Kasuga, Nishi Ward, Kumamoto",
  image:
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1400&q=82",
};

export const itinerary: ItineraryItem[] = [
  {
    id: "d1-01",
    date: "2026-10-03",
    time: "07:30",
    title: "出發（JX846）",
    category: "交通",
    description: "啟程前往九州，抵達後預計從福岡移動至熊本。",
    address: "Taiwan Taoyuan International Airport",
    url: "https://www.taoyuan-airport.com/",
  },
  {
    id: "d1-02",
    date: "2026-10-03",
    time: "11:30",
    title: "取車（Toyota Rent a Car）",
    category: "交通",
    description: "領完行李後前往租車櫃台，確認 ETC、保險與導航設定。",
    address: "Fukuoka Airport",
    url: "https://www.fukuoka-airport.jp/",
  },
  {
    id: "d1-03",
    date: "2026-10-03",
    time: "13:00",
    title: "午餐：魚飯時（sahanji）",
    category: "食物",
    description: "第一餐安排海鮮定食，節奏輕鬆，方便長輩休息。",
    address: "Hakata Station, Fukuoka",
    url: "https://www.jrhakatacity.com/",
  },
  {
    id: "d1-04",
    date: "2026-10-03",
    time: "13:45",
    title: "熊本城 天守閣",
    category: "景點",
    description: "抵達熊本後安排散步與拍照，行程可依體力調整。",
    address: "1-1 Honmaru, Chuo Ward, Kumamoto",
    url: "https://castle.kumamoto-guide.jp/",
  },
  {
    id: "d2-01",
    date: "2026-10-04",
    time: "10:30",
    title: "熊本市區散策",
    category: "景點",
    description: "安排市區散步、咖啡與伴手禮採買。",
    address: "Kumamoto City",
    url: "https://kumamoto-guide.jp/",
  },
  {
    id: "d4-01",
    date: "2026-10-06",
    time: "11:00",
    title: "天神地下街",
    category: "購物",
    description: "精品、藥妝與伴手禮集中，適合安排家庭購物主行程。",
    address: "Tenjin Underground Mall, Fukuoka",
    url: "https://www.tenchika.com/",
  },
];
