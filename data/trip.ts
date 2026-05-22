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
  { date: "2026-02-10", label: "Day 1", short: "2/10", city: "抵達福岡" },
  { date: "2026-02-11", label: "Day 2", short: "2/11", city: "天神購物" },
  { date: "2026-02-12", label: "Day 3", short: "2/12", city: "太宰府" },
  { date: "2026-02-13", label: "Day 4", short: "2/13", city: "博多散策" },
  { date: "2026-02-14", label: "Day 5", short: "2/14", city: "返程" },
];

export const weather = [
  { date: "2/10", day: "Tue", temp: "13° / 7°", condition: "晴時多雲", rain: "10%" },
  { date: "2/11", day: "Wed", temp: "12° / 6°", condition: "微雲", rain: "15%" },
  { date: "2/12", day: "Thu", temp: "11° / 5°", condition: "陰", rain: "30%" },
  { date: "2/13", day: "Fri", temp: "14° / 8°", condition: "晴朗", rain: "5%" },
  { date: "2/14", day: "Sat", temp: "13° / 7°", condition: "短暫雨", rain: "45%" },
];

export const hotel = {
  name: "Hotel Nikko Fukuoka",
  dates: "2026.02.10 - 2026.02.14",
  address: "2-18-25 Hakata Ekimae, Hakata Ward, Fukuoka",
  image:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=82",
};

export const itinerary: ItineraryItem[] = [
  {
    id: "d1-01",
    date: "2026-02-10",
    time: "10:40",
    title: "桃園機場出發",
    category: "交通",
    description: "預留報到、托運與家人集合時間，早餐可在機場簡單處理。",
    address: "Taiwan Taoyuan International Airport",
    url: "https://www.taoyuan-airport.com/",
  },
  {
    id: "d1-02",
    date: "2026-02-10",
    time: "14:10",
    title: "抵達福岡機場",
    category: "交通",
    description: "入境後購買交通票券，前往博多站周邊飯店。",
    address: "Fukuoka Airport",
    url: "https://www.fukuoka-airport.jp/",
  },
  {
    id: "d1-03",
    date: "2026-02-10",
    time: "18:00",
    title: "博多車站晚餐",
    category: "食物",
    description: "第一晚安排車站周邊用餐，動線輕鬆，方便補買生活用品。",
    address: "Hakata Station, Fukuoka",
    url: "https://www.jrhakatacity.com/",
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
    address: "Hotel Nikko Fukuoka",
    url: "https://www.hotelnikko-fukuoka.com/",
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
