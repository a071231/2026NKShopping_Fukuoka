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
  { date: "2026-10-03", weekday: "SAT", day: "3", label: "DAY 1", city: "福岡" },
  { date: "2026-10-04", weekday: "SUN", day: "4", label: "DAY 2", city: "福岡" },
  { date: "2026-10-05", weekday: "MON", day: "5", label: "DAY 3", city: "熊本" },
  { date: "2026-10-06", weekday: "TUE", day: "6", label: "DAY 4", city: "阿蘇" },
  { date: "2026-10-07", weekday: "WED", day: "7", label: "DAY 5", city: "黑川" },
  { date: "2026-10-08", weekday: "THU", day: "8", label: "DAY 6", city: "由布院" },
  { date: "2026-10-09", weekday: "FRI", day: "9", label: "DAY 7", city: "福岡購物" },
  { date: "2026-10-10", weekday: "SAT", day: "10", label: "DAY 8", city: "北九州" },
  { date: "2026-10-11", weekday: "SUN", day: "11", label: "DAY 9", city: "返程" },
];

export const weatherForecast = [
  { date: "5/26", weekday: "TUE", high: "24°", low: "18°", condition: "晴時多雲", rain: "10%" },
  { date: "5/27", weekday: "WED", high: "25°", low: "19°", condition: "晴朗", rain: "10%" },
  { date: "5/28", weekday: "THU", high: "26°", low: "20°", condition: "多雲", rain: "20%" },
  { date: "5/29", weekday: "FRI", high: "24°", low: "19°", condition: "短暫雨", rain: "40%" },
  { date: "5/30", weekday: "SAT", high: "23°", low: "18°", condition: "陰天", rain: "35%" },
  { date: "5/31", weekday: "SUN", high: "25°", low: "19°", condition: "晴時多雲", rain: "15%" },
  { date: "6/1", weekday: "MON", high: "26°", low: "20°", condition: "晴朗", rain: "10%" },
  { date: "6/2", weekday: "TUE", high: "25°", low: "20°", condition: "多雲", rain: "20%" },
  { date: "6/3", weekday: "WED", high: "24°", low: "19°", condition: "短暫雨", rain: "45%" },
  { date: "6/4", weekday: "THU", high: "23°", low: "18°", condition: "陰天", rain: "35%" },
  { date: "6/5", weekday: "FRI", high: "24°", low: "18°", condition: "晴朗", rain: "10%" },
  { date: "6/6", weekday: "SAT", high: "25°", low: "19°", condition: "晴時多雲", rain: "15%" },
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
    title: "出發 (JX846)",
    category: "交通",
    description: "搭乘星宇航空前往福岡，抵達後領取行李與租車資料。",
    address: "Taiwan Taoyuan International Airport",
    url: "https://www.taoyuan-airport.com/",
  },
  {
    id: "d1-02",
    date: "2026-10-03",
    time: "11:30",
    title: "取車 (Toyota Rent a Car)",
    category: "交通",
    description: "抵達後前往租車櫃台，確認 ETC、保險與車內設備。",
    address: "Fukuoka Airport",
    url: "https://www.fukuoka-airport.jp/",
  },
  {
    id: "d1-03",
    date: "2026-10-03",
    time: "13:00",
    title: "午餐：魚飯時 (sahanji)",
    category: "食物",
    description: "福岡車站附近的海鮮定食，適合抵達後先簡單用餐。",
    address: "Hakata Station, Fukuoka",
    url: "https://www.jrhakatacity.com/",
  },
  {
    id: "d1-04",
    date: "2026-10-03",
    time: "13:45",
    title: "熊本城 天守閣",
    category: "景點",
    description: "安排熊本城散步與拍照，行程以輕鬆慢步調為主。",
    address: "1-1 Honmaru, Chuo Ward, Kumamoto",
    url: "https://castle.kumamoto-guide.jp/",
  },
  {
    id: "d2-01",
    date: "2026-10-04",
    time: "10:30",
    title: "熊本市區散策",
    category: "景點",
    description: "上午安排市區景點與咖啡店，保留彈性購物時間。",
    address: "Kumamoto City",
    url: "https://kumamoto-guide.jp/",
  },
  {
    id: "d4-01",
    date: "2026-10-06",
    time: "11:00",
    title: "天神地下街購物",
    category: "購物",
    description: "逛街採買伴手禮與藥妝，晚餐可依現場狀況調整。",
    address: "Tenjin Underground Mall, Fukuoka",
    url: "https://www.tenchika.com/",
  },
];
