export type ItineraryCategory = "交通" | "食物" | "購物" | "景點";
export type WeatherIcon = "sun" | "cloud" | "rain";

export type ItineraryItem = {
  id: string;
  position?: number;
  date: string;
  time: string;
  title: string;
  category: ItineraryCategory;
  description: string;
  address: string;
  url: string;
};

export const tripDays = [
  { date: "2026-10-03", weekday: "SAT", day: "3", label: "DAY 1" },
  { date: "2026-10-04", weekday: "SUN", day: "4", label: "DAY 2" },
  { date: "2026-10-05", weekday: "MON", day: "5", label: "DAY 3" },
  { date: "2026-10-06", weekday: "TUE", day: "6", label: "DAY 4" },
  { date: "2026-10-07", weekday: "WED", day: "7", label: "DAY 5" },
  { date: "2026-10-08", weekday: "THU", day: "8", label: "DAY 6" },
  { date: "2026-10-09", weekday: "FRI", day: "9", label: "DAY 7" },
  { date: "2026-10-10", weekday: "SAT", day: "10", label: "DAY 8" },
  { date: "2026-10-11", weekday: "SUN", day: "11", label: "DAY 9" },
];

export const weatherForecast: Array<{
  date: string;
  weekday: string;
  high: string;
  low: string;
  condition: string;
  icon: WeatherIcon;
}> = [
  { date: "5/15", weekday: "福岡市", high: "21°", low: "14°", condition: "晴時多雲", icon: "sun" },
  { date: "5/16", weekday: "週五", high: "21°", low: "14°", condition: "晴朗", icon: "sun" },
  { date: "5/17", weekday: "週六", high: "20°", low: "15°", condition: "多雲", icon: "cloud" },
  { date: "5/18", weekday: "週日", high: "19°", low: "14°", condition: "晴時多雲", icon: "cloud" },
  { date: "5/19", weekday: "週一", high: "18°", low: "13°", condition: "短暫雨", icon: "rain" },
  { date: "5/20", weekday: "週二", high: "22°", low: "15°", condition: "晴朗", icon: "sun" },
  { date: "5/21", weekday: "週三", high: "23°", low: "16°", condition: "多雲", icon: "cloud" },
  { date: "5/22", weekday: "週四", high: "22°", low: "15°", condition: "短暫雨", icon: "rain" },
  { date: "5/23", weekday: "週五", high: "24°", low: "17°", condition: "晴朗", icon: "sun" },
  { date: "5/24", weekday: "週六", high: "23°", low: "16°", condition: "多雲", icon: "cloud" },
  { date: "5/25", weekday: "週日", high: "22°", low: "15°", condition: "短暫雨", icon: "rain" },
];

export const hotel = {
  name: "福岡蘭多住宅飯店附樓",
  englishName: "Randor Residential Hotel Fukuoka Annex",
  phone: "+81925265231",
  address: "電話：+81925265231",
  checkIn: "2026年10月3日 星期六 15:00",
  checkOut: "2026年10月11日 星期日 11:00",
  dates: "2026.10.03 - 2026.10.11",
  orderNumber: "1742593424",
  image: "/images/randor-fukuoka-annex.jpg",
};

export const itinerary: ItineraryItem[] = [
  {
    id: "ci128-arrival",
    date: "2026-10-03",
    time: "18:05",
    title: "抵達福岡機場 (CI128)",
    category: "交通",
    description: "搭乘中華航空 CI128，預計 18:05 抵達福岡機場國際線航廈。",
    address: "福岡機場 國際線航廈",
    url: "https://www.fukuoka-airport.jp/",
  },
];
