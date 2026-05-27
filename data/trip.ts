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
  { date: "2026-02-10", weekday: "TUE", day: "10", label: "DAY 1", city: "抵達福岡" },
  { date: "2026-02-11", weekday: "WED", day: "11", label: "DAY 2", city: "天神購物" },
  { date: "2026-02-12", weekday: "THU", day: "12", label: "DAY 3", city: "太宰府" },
  { date: "2026-02-13", weekday: "FRI", day: "13", label: "DAY 4", city: "博多散策" },
  { date: "2026-02-14", weekday: "SAT", day: "14", label: "DAY 5", city: "返程" },
  { date: "2026-02-15", weekday: "SUN", day: "15", label: "DAY 6", city: "自由行" },
  { date: "2026-02-16", weekday: "MON", day: "16", label: "DAY 7", city: "購物日" },
  { date: "2026-02-17", weekday: "TUE", day: "17", label: "DAY 8", city: "近郊" },
  { date: "2026-02-18", weekday: "WED", day: "18", label: "DAY 9", city: "市區" },
  { date: "2026-02-19", weekday: "THU", day: "19", label: "DAY 10", city: "備用日" },
  { date: "2026-02-20", weekday: "FRI", day: "20", label: "DAY 11", city: "整理" },
];

export const weather = [
  { date: "5/26", weekday: "TUE", high: "27°", low: "20°", condition: "晴時多雲", rain: "10%" },
  { date: "5/27", weekday: "WED", high: "26°", low: "21°", condition: "多雲", rain: "20%" },
  { date: "5/28", weekday: "THU", high: "25°", low: "20°", condition: "短暫雨", rain: "45%" },
  { date: "5/29", weekday: "FRI", high: "28°", low: "21°", condition: "晴朗", rain: "10%" },
  { date: "5/30", weekday: "SAT", high: "29°", low: "22°", condition: "微雲", rain: "15%" },
];

export const weatherForecast = [
  { date: "5/26", weekday: "TUE", high: "27°", low: "20°", condition: "晴時多雲", rain: "10%" },
  { date: "5/27", weekday: "WED", high: "26°", low: "21°", condition: "多雲", rain: "20%" },
  { date: "5/28", weekday: "THU", high: "25°", low: "20°", condition: "短暫雨", rain: "45%" },
  { date: "5/29", weekday: "FRI", high: "28°", low: "21°", condition: "晴朗", rain: "10%" },
  { date: "5/30", weekday: "SAT", high: "29°", low: "22°", condition: "微雲", rain: "15%" },
  { date: "5/31", weekday: "SUN", high: "28°", low: "22°", condition: "多雲", rain: "25%" },
  { date: "6/1", weekday: "MON", high: "27°", low: "21°", condition: "陰時晴", rain: "30%" },
  { date: "6/2", weekday: "TUE", high: "26°", low: "21°", condition: "小雨", rain: "55%" },
  { date: "6/3", weekday: "WED", high: "27°", low: "20°", condition: "短暫雨", rain: "40%" },
  { date: "6/4", weekday: "THU", high: "29°", low: "22°", condition: "晴時多雲", rain: "15%" },
  { date: "6/5", weekday: "FRI", high: "30°", low: "23°", condition: "晴朗", rain: "10%" },
  { date: "6/6", weekday: "SAT", high: "29°", low: "23°", condition: "多雲", rain: "20%" },
];

export const hotel = {
  name: "The Blossom Fukuoka",
  dates: "2026.02.10 - 2026.02.14",
  address: "2-8-12 Hakata Ekimae, Hakata Ward, Fukuoka",
  image:
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1400&q=82",
};

export const itinerary: ItineraryItem[] = [
  {
    id: "d1-01",
    date: "2026-02-10",
    time: "07:30",
    title: "出發（JX846）",
    category: "交通",
    description: "桃園機場集合，預計從台北桃園直飛福岡。請先確認護照、登機證與行李重量。",
    address: "Taiwan Taoyuan International Airport",
    url: "https://www.taoyuan-airport.com/",
  },
  {
    id: "d1-02",
    date: "2026-02-10",
    time: "11:30",
    title: "取車（Toyota Rent a Car）",
    category: "交通",
    description: "領完行李後前往租車櫃台，請在左手邊行走，確認 ETC 與保險項目。",
    address: "Fukuoka Airport",
    url: "https://www.fukuoka-airport.jp/",
  },
  {
    id: "d1-03",
    date: "2026-02-10",
    time: "13:00",
    title: "午餐：魚飯時（sahanji）",
    category: "食物",
    description: "店名由來是日文飯勺，推薦海鮮丼與定食，適合作為第一餐。",
    address: "Hakata Station, Fukuoka",
    url: "https://www.jrhakatacity.com/",
  },
  {
    id: "d1-04",
    date: "2026-02-10",
    time: "13:45",
    title: "福岡城 天守閣",
    category: "景點",
    description: "午後散步與拍照，天氣好時可遠眺市區，行程節奏保持輕鬆。",
    address: "Jonai, Chuo Ward, Fukuoka",
    url: "https://yokanavi.com/",
  },
  {
    id: "d2-01",
    date: "2026-02-11",
    time: "10:30",
    title: "天神地下街",
    category: "購物",
    description: "精品、藥妝與伴手禮集中，適合安排家庭購物主行程。",
    address: "Tenjin Underground Mall, Fukuoka",
    url: "https://www.tenchika.com/",
  },
  {
    id: "d2-02",
    date: "2026-02-11",
    time: "14:00",
    title: "岩田屋本店",
    category: "購物",
    description: "百貨品牌齊全，可安排退稅與精品採買。",
    address: "2 Chome-5-35 Tenjin, Chuo Ward, Fukuoka",
    url: "https://www.iwataya-mitsukoshi.mistore.jp/iwataya.html",
  },
  {
    id: "d3-01",
    date: "2026-02-12",
    time: "09:30",
    title: "太宰府天滿宮",
    category: "景點",
    description: "經典福岡近郊景點，參道可散步、拍照與買梅枝餅。",
    address: "4 Chome-7-1 Saifu, Dazaifu",
    url: "https://www.dazaifutenmangu.or.jp/",
  },
  {
    id: "d3-02",
    date: "2026-02-12",
    time: "12:30",
    title: "參道午餐與甜點",
    category: "食物",
    description: "安排慢步調午餐，長輩可休息，小孩也有甜點選擇。",
    address: "Saifu, Dazaifu, Fukuoka",
    url: "https://www.dazaifu.org/",
  },
  {
    id: "d4-01",
    date: "2026-02-13",
    time: "11:00",
    title: "櫛田神社與博多老街",
    category: "景點",
    description: "感受博多傳統街區，適合安排輕鬆散策與紀念照。",
    address: "1-41 Kamikawabatamachi, Hakata Ward, Fukuoka",
    url: "https://www.hakatayamakasa.com/",
  },
  {
    id: "d4-02",
    date: "2026-02-13",
    time: "15:30",
    title: "Canal City Hakata",
    category: "購物",
    description: "購物、餐廳與室內空間完整，天候不佳時也方便調整。",
    address: "1 Chome-2 Sumiyoshi, Hakata Ward, Fukuoka",
    url: "https://canalcity.co.jp/",
  },
  {
    id: "d5-01",
    date: "2026-02-14",
    time: "09:00",
    title: "整理行李與退房",
    category: "交通",
    description: "確認護照、伴手禮與退稅文件，預留前往機場時間。",
    address: "The Blossom Fukuoka",
    url: "https://www.jrk-hotels.co.jp/Fukuoka/",
  },
  {
    id: "d5-02",
    date: "2026-02-14",
    time: "12:30",
    title: "福岡機場返台",
    category: "交通",
    description: "抵達機場後辦理登機，最後補買機場限定伴手禮。",
    address: "Fukuoka Airport",
    url: "https://www.fukuoka-airport.jp/",
  },
];
