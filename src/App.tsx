import React, { useState, useEffect } from 'react';
import { auth, db, signIn, signOut as firebaseSignOut } from './firebase';
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { Plane, Calendar, CheckSquare, Sun, CloudRain, Info, LogOut, Map, Luggage, ShieldCheck, Wifi, CreditCard, Building, Edit2, Check, X, Clock, Trash2, Plus, ArrowRight, MapPin, Utensils, Train, Sparkles, Navigation, Phone, DollarSign, Cloud, Navigation2, Copy, MoreHorizontal, TableProperties, Flower2, Users, Camera } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import Papa from 'papaparse';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error("Failed to initialize Gemini API", e);
    }
  }
  return aiClient;
};

interface FukuokaTask {
  id: string;
  title: string;
  type: string; 
  completed: boolean;
  userId: string;
}

interface FukuokaInfo {
  flight: string;
  hotel: string;
  exchangeRate: string;
  emergencyContacts?: string;
  sheetUrl?: string;
  flightNotes?: string;
}

interface FukuokaMember {
  id: string;
  name: string;
  avatar: string;
  userId: string;
}

const defaultMembers = [
  { id: 'member_00', name: '00' },
  { id: 'member_mom', name: '媽媽' },
  { id: 'member_uu', name: 'UU' },
  { id: 'member_tuna', name: '鮪魚' },
  { id: 'member_paipai', name: '派派' },
];

interface FukuokaExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  payer: string;
  status: string;
  userId: string;
}

interface FukuokaItinerary {
  id: string;
  day: string;
  time: string;
  activity: string;
  type: string;
  location?: string;
  aiGuide?: string;
  userId: string;
}

type Tab = 'overview' | 'itinerary' | 'tasks' | 'expenses';

// 模擬天氣對應表
const weatherMock: Record<string, { desc: string, temp: string, icon: any }> = {
  'Day 1': { desc: '晴時多雲', temp: '22°C', icon: Sun },
  'Day 2': { desc: '晴天', temp: '25°C', icon: Sun },
  'Day 3': { desc: '短暫陣雨', temp: '19°C', icon: CloudRain },
  'Day 4': { desc: '多雲', temp: '21°C', icon: Cloud },
  'Day 5': { desc: '晴天', temp: '23°C', icon: Sun },
};

const TicketIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
  </svg>
);

export default function App() {
  const [user, setUser] = useState<any>({ uid: 'shared_fukuoka_trip' });
  const [activeTab, setActiveTab] = useState<Tab>('itinerary'); // 手機優先，行程預設

  // Data states
  const [tasks, setTasks] = useState<FukuokaTask[]>([]);
  const [info, setInfo] = useState<FukuokaInfo>({ flight: '', hotel: '', exchangeRate: '', emergencyContacts: '', sheetUrl: '', flightNotes: '' });
  const [itinerary, setItinerary] = useState<FukuokaItinerary[]>([]);
  const [expenses, setExpenses] = useState<FukuokaExpense[]>([]);
  const [members, setMembers] = useState<FukuokaMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const tripUsersNames = ['全部', ...members.map(member => member.name)];
  const [expenseUserFilter, setExpenseUserFilter] = useState('全部');
  const [liveExchangeRate, setLiveExchangeRate] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/JPY')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.TWD) {
          setLiveExchangeRate(data.rates.TWD);
        }
      })
      .catch(console.error);
  }, []);

  // UI States
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingFlightNotes, setIsEditingFlightNotes] = useState(false);
  const [flightNotesTemp, setFlightNotesTemp] = useState('');
  const [editInfoForm, setEditInfoForm] = useState<FukuokaInfo>({ flight: '', hotel: '', exchangeRate: '', emergencyContacts: '', sheetUrl: '', flightNotes: '' });
  const [generatingAI, setGeneratingAI] = useState<Record<string, boolean>>({});
  const [selectedEvent, setSelectedEvent] = useState<FukuokaItinerary | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    const sharedId = 'shared_fukuoka_trip';

    const unsubInfo = onSnapshot(doc(db, 'fukuoka_info', sharedId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as FukuokaInfo;
        setInfo({ flight: data.flight, hotel: data.hotel, exchangeRate: data.exchangeRate, emergencyContacts: data.emergencyContacts || '', sheetUrl: data.sheetUrl || '', flightNotes: data.flightNotes || '' });
        setEditInfoForm({ flight: data.flight, hotel: data.hotel, exchangeRate: data.exchangeRate, emergencyContacts: data.emergencyContacts || '', sheetUrl: data.sheetUrl || '', flightNotes: data.flightNotes || '' });
      } else {
        setDoc(doc(db, 'fukuoka_info', sharedId), {
          flight: '10/3 14:40 - 18:05\n桃園(航廈2) >> 福岡 (航廈1)\n華航 CI 128\n\n10/11 11:00 - 12:30\n福岡 (航廈1) >> 桃園(航廈2)\n華航 CI 111',
          hotel: '博多站前飯店 (預定)',
          exchangeRate: '0.21',
          emergencyContacts: '駐福岡台北經濟文化辦事處\n電話：+81-92-734-2810',
          sheetUrl: '',
          flightNotes: '',
          userId: sharedId,
          updatedAt: serverTimestamp()
        }).catch(console.error);
      }
    }, (error) => {
      console.error("Firestore Error in fukuoka_info snapshot:", error);
    });

    const qTasks = query(collection(db, 'fukuoka_tasks'), where('userId', '==', sharedId));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const t: FukuokaTask[] = [];
      snapshot.forEach(doc => t.push({ id: doc.id, ...doc.data() } as FukuokaTask));
      setTasks(t.sort((a,b) => a.id.localeCompare(b.id)));
    }, (error) => {
      console.error("Firestore Error in fukuoka_tasks snapshot:", error);
    });

    // Remove Firebase Itinerary listener, use Google Sheets instead.

    const qExp = query(collection(db, 'fukuoka_expenses'), where('userId', '==', sharedId));
    const unsubExp = onSnapshot(qExp, (snapshot) => {
      const ex: FukuokaExpense[] = [];
      snapshot.forEach(doc => ex.push({ id: doc.id, ...doc.data() } as FukuokaExpense));
      setExpenses(ex.sort((a, b) => b.id.localeCompare(a.id))); // newest first
    }, (error) => {
      console.error("Firestore Error in fukuoka_expenses snapshot:", error);
    });

    const qMembers = query(collection(db, 'fukuoka_members'), where('userId', '==', sharedId));
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      if (snapshot.empty) {
        Promise.all(defaultMembers.map(member => setDoc(doc(db, 'fukuoka_members', member.id), {
          name: member.name,
          avatar: '',
          userId: sharedId,
          createdAt: serverTimestamp()
        }))).catch(() => toast.error('預設成員建立失敗'));
        return;
      }
      const list: FukuokaMember[] = [];
      snapshot.forEach(memberDoc => list.push({ id: memberDoc.id, ...memberDoc.data() } as FukuokaMember));
      setMembers(list.sort((a, b) => a.id.localeCompare(b.id)));
    }, (error) => {
      console.error("Firestore Error in fukuoka_members snapshot:", error);
    });

    return () => {
      unsubInfo();
      unsubTasks();
      unsubExp();
      unsubMembers();
    };
  }, [user]);

  // Load from Sheets
  useEffect(() => {
    const targetUrl = info.sheetUrl || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYvoIAKQm4baZEmnWhdZxD0i6mYvnQNvgKEVwU-3KrSVG5XnJvuHfIsM7czCF8O6DLquQHT4fU-D6r/pub?output=csv';
    if (targetUrl) {
      Papa.parse(targetUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const iti: FukuokaItinerary[] = results.data
            .filter((row: any) => row.activity && row.day)
            .map((row: any, i) => ({
              id: String(i),
              day: row.day || '',
              time: row.time || '',
              activity: row.activity || '',
              type: row.type || 'attraction',
              location: row.location || '',
              aiGuide: row.note || row.aiGuide || '', // mapping note to aiGuide for backwards compatibility display
              userId: 'shared_fukuoka_trip'
          }));
          const sortedItin = iti.sort((a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time));
          setItinerary(sortedItin);
          const uniqueDays = Array.from(new Set(sortedItin.map(i => i.day)));
          if (uniqueDays.length > 0) {
            setSelectedDay(prev => uniqueDays.includes(prev) ? prev : uniqueDays[0]);
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        }
      });
    } else {
      setItinerary([]);
    }
  }, [info.sheetUrl]);

  // Actions
  const handleSaveInfo = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'fukuoka_info', 'shared_fukuoka_trip'), {
        ...editInfoForm,
        updatedAt: serverTimestamp()
      });
      setIsEditingInfo(false);
      toast.success('資訊已更新');
    } catch (e) {
      toast.error('更新失敗');
    }
  };

  const handleSaveFlightNotes = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'fukuoka_info', 'shared_fukuoka_trip'), {
        flightNotes: flightNotesTemp,
        updatedAt: serverTimestamp()
      });
      setIsEditingFlightNotes(false);
      toast.success('航班備註已儲存');
    } catch (e) {
      toast.error('更新失敗');
    }
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newMemberName.trim();
    if (!name) return;
    if (members.some(member => member.name === name)) {
      toast.error('這位成員已經存在');
      return;
    }
    try {
      await addDoc(collection(db, 'fukuoka_members'), {
        name,
        avatar: '',
        userId: 'shared_fukuoka_trip',
        createdAt: serverTimestamp()
      });
      setNewMemberName('');
      toast.success('已新增成員');
    } catch (e) {
      toast.error('新增成員失敗');
    }
  };

  const handleDeleteMember = async (member: FukuokaMember) => {
    if (!window.confirm(`確定要刪除「${member.name}」嗎？`)) return;
    try {
      await deleteDoc(doc(db, 'fukuoka_members', member.id));
      toast.success('已刪除成員');
    } catch (e) {
      toast.error('刪除成員失敗');
    }
  };

  const handleAvatarUpload = (member: FukuokaMember, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('請選擇圖片檔案');
      return;
    }
    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      image.onload = async () => {
        const size = 320;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (!context) return;
        const scale = Math.max(size / image.width, size / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        try {
          await updateDoc(doc(db, 'fukuoka_members', member.id), {
            avatar: canvas.toDataURL('image/jpeg', 0.8)
          });
          toast.success('大頭貼已更新');
        } catch (e) {
          toast.error('大頭貼更新失敗');
        }
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddTask = async (title: string, type: string) => {
    if (!user || !title.trim()) return;
    try {
      await addDoc(collection(db, 'fukuoka_tasks'), {
        title: title.trim(), type, completed: false, userId: 'shared_fukuoka_trip', createdAt: serverTimestamp()
      });
    } catch (e) { toast.error('新增失敗'); }
  };

  const handleToggleTask = async (task: FukuokaTask) => {
    try {
      await updateDoc(doc(db, 'fukuoka_tasks', task.id), { completed: !task.completed });
    } catch (e) { toast.error('狀態更新失敗'); }
  };

  const handleDeleteTask = async (id: string) => {
    try { await deleteDoc(doc(db, 'fukuoka_tasks', id)); } catch (e) {}
  };



  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const desc = fd.get('description') as string;
    const amount = Number(fd.get('amount'));
    const category = 'Other'; // Using simple default category
    const payer = fd.get('payer') as string || 'K';
    const status = fd.get('status') as string || '已付';
    if (!desc || !amount) return;

    try {
      await addDoc(collection(db, 'fukuoka_expenses'), {
        description: desc, amount, category, payer, status, userId: 'shared_fukuoka_trip', createdAt: serverTimestamp()
      });
      e.currentTarget.reset();
      // Hide bottom sheet logic can be triggered here
      toast.success('記帳成功');
    } catch (err) { toast.error('記帳失敗'); }
  };

  const handleToggleExpenseStatus = async (exp: FukuokaExpense) => {
    try {
      await updateDoc(doc(db, 'fukuoka_expenses', exp.id), { status: exp.status === '已付' ? '未付' : '已付' });
    } catch (e) { toast.error('狀態更新失敗'); }
  };

  const handleDeleteExpense = async (id: string) => {
    try { await deleteDoc(doc(db, 'fukuoka_expenses', id)); } catch (e) {}
  };



  const getTotalExpenses = () => expenses.reduce((acc, curr) => acc + curr.amount, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-center max-w-sm w-full flex flex-col items-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 mb-8 flex items-center justify-center bg-[#8C2E2E] rounded-full text-white shadow-xl shadow-[#8C2E2E]/20"
          >
            <Flower2 className="w-10 h-10" />
          </motion.div>
          <h1 className="text-2xl font-serif font-black mb-2 text-[#2A2A2A] tracking-wider">正在載入行程...</h1>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#2A2A2A] flex flex-col font-sans pb-24 md:pb-0">
      <Toaster position="top-center" toastOptions={{ style: { background: '#2A2A2A', color: '#FBF9F6', borderRadius: '12px' } }} />
      
      {/* 頂部導覽（桌面版）/ 標題列（手機版） */}
      <header className="px-6 md:px-12 h-20 flex items-center justify-between shrink-0 sticky top-0 z-30 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-[#D9D2C2]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-[#8C2E2E] rounded text-white">
            <Flower2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-serif font-bold tracking-widest text-[#2A2A2A]">北高購物團</h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row max-w-6xl mx-auto w-full">
        {/* 底部導覽列 (Mobile) / 側邊欄 (Desktop) */}
        <nav className="fixed bottom-0 left-0 w-full md:relative md:w-64 bg-[#FBF9F6] md:bg-transparent border-t md:border-t-0 md:border-r border-[#D9D2C2] z-40 flex flex-row md:flex-col p-2 md:p-8 gap-1 md:gap-4 shrink-0 shadow-[0_-4px_20px_rgb(0,0,0,0.05)] md:shadow-none pb-safe">
          {[
            { id: 'itinerary', icon: Map, label: '每日行程' },
            { id: 'overview', icon: Info, label: '資訊工具' },
            { id: 'expenses', icon: DollarSign, label: '記帳表' },
            { id: 'tasks', icon: CheckSquare, label: '準備品' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as Tab)} 
                className={`flex-1 md:flex-none flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-1 md:gap-4 p-2 md:p-4 rounded-xl transition-all duration-300 border border-[#8C2E2E] cursor-pointer ${isActive ? 'bg-[#8C2E2E] text-[#FBF9F6] shadow-md' : 'bg-[#FBF9F6] text-[#8C2E2E] hover:bg-[#8C2E2E] hover:text-[#FBF9F6]'}`}
              >
                <tab.icon className="w-6 h-6 md:w-5 md:h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] md:text-sm font-medium tracking-widest \${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* 主要內容區 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-12 relative w-full overflow-x-hidden">
          <AnimatePresence mode="wait">
            
            {/* 行程 Tab */}
            {activeTab === 'itinerary' && (
              <motion.div key="itinerary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full bg-[#FBF9F6] relative pb-32">
                
                {/* Horizontal Day Picker */}
                <div className="sticky top-20 md:top-0 z-20 bg-[#FBF9F6]/95 backdrop-blur-md border-b border-[#E8E4D9]">
                  <div className="flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-[10px] tracking-widest text-[#A09B90] uppercase mb-1">FAMILY TRIP</div>
                      <div className="flex items-center gap-2 justify-center">
                        <span className="text-xl font-serif text-[#2A2A2A]">福岡旅行</span>
                        <span className="text-[10px] border border-[#E8E4D9] rounded-full px-2 py-0.5 text-[#A09B90]">2026</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 overflow-x-auto no-scrollbar px-6 pb-2">
                    {Array.from(new Set(itinerary.map(i => i.day))).map((d, idx) => (
                      <button key={d} onClick={() => setSelectedDay(d)} className="flex flex-col items-center shrink-0 min-w-[32px] group">
                        <span className={"text-[10px] uppercase font-bold tracking-widest transition-colors " + (selectedDay === d ? 'text-[#2A2A2A]' : 'text-[#A09B90] group-hover:text-[#2A2A2A]/70')}>
                          DAY
                        </span>
                        <span className={"text-2xl font-serif transition-colors " + (selectedDay === d ? 'text-[#2A2A2A] font-bold' : 'text-[#D9D2C2] group-hover:text-[#A09B90]')}>
                          {idx + 1}
                        </span>
                        <div className={"w-1 h-1 rounded-full mt-1.5 transition-all " + (selectedDay === d ? 'bg-[#8C2E2E]' : 'bg-transparent')} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="px-5 py-6 space-y-10 max-w-lg mx-auto">
                  {/* Hero Image Block */}
                  <div className="relative h-48 w-full rounded-sm overflow-hidden shrink-0 shadow-sm">
                    <img src="/hero.png" alt="Hero" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 via-[#1A1A1A]/10 to-transparent flex flex-col justify-end p-5">
                      <div className="flex items-center gap-2 text-[#FBF9F6]/90 text-xs mb-2 font-serif tracking-widest">
                        <span className="border border-[#FBF9F6]/40 px-2 py-0.5 rounded-sm">DAY {Array.from(new Set(itinerary.map(i => i.day))).indexOf(selectedDay) + 1}</span>
                        <span><MapPin className="w-3 h-3 inline mb-0.5"/> 日本・福岡</span>
                      </div>
                      <h2 className="text-2xl text-[#FBF9F6] font-serif font-bold tracking-widest drop-shadow-md">美好的旅途剪影</h2>
                    </div>
                  </div>

                  {/* Weather Information */}
                  <div className="border-b border-[#E8E4D9] pb-8 pt-4">
                     <div className="flex items-end justify-between mb-6">
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-serif text-[#2A2A2A]">福岡市</span>
                          <span className="text-sm font-bold text-[#A09B90] mb-1">近11天當地天氣預報</span>
                        </div>
                        <span className="text-[10px] bg-[#FBF9F6] px-2 py-1 rounded text-[#A09B90]">Open-Meteo</span>
                     </div>
                     <div className="flex justify-between items-center gap-6 px-2 overflow-x-auto scrollbar-none pb-2">
                        {[
                          { date: '5/15', icon: Sun, temp: '25°' },
                          { date: '5/16', icon: Cloud, temp: '23°' },
                          { date: '5/17', icon: CloudRain, temp: '22°' },
                          { date: '5/18', icon: Sun, temp: '26°' },
                          { date: '5/19', icon: Sun, temp: '27°' },
                          { date: '5/20', icon: Cloud, temp: '24°' },
                          { date: '5/21', icon: Sun, temp: '25°' },
                          { date: '5/22', icon: CloudRain, temp: '21°' },
                          { date: '5/23', icon: Sun, temp: '24°' },
                          { date: '5/24', icon: Cloud, temp: '23°' },
                          { date: '5/25', icon: Sun, temp: '26°' },
                        ].map((weather, i) => (
                           <div key={weather.date} className="flex flex-col items-center gap-3 shrink-0">
                             <span className="text-xs font-serif text-[#6B665E] whitespace-nowrap">{weather.date}</span>
                             <weather.icon className="w-6 h-6 text-[#2A2A2A]" strokeWidth={1.5} />
                             <span className="text-lg font-serif font-medium text-[#2A2A2A]">{weather.temp}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Accommodation section placeholder */}
                  <div className="flex justify-between items-center py-4 border-b border-[#E8E4D9]">
                     <div className="border-l-[3px] border-[#8C2E2E]/60 pl-4">
                        <div className="text-[10px] text-[#A09B90] tracking-widest mb-1.5 uppercase font-bold">住宿資訊</div>
                        <h3 className="text-xl font-serif font-bold text-[#2A2A2A]">{info.hotel || 'The Blossom Kumamoto'}</h3>
                     </div>
                     <button className="text-[#A09B90] hover:text-[#2A2A2A] transition-colors">
                       <ArrowRight className="w-5 h-5 rotate-90" strokeWidth={1.5} />
                     </button>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="pt-6 relative pb-8">
                     <div className="absolute left-[3.25rem] top-8 bottom-0 w-px bg-[#E8E4D9]"></div>
                     
                     {itinerary.filter(i => i.day === selectedDay).length === 0 && (
                        <div className="text-center py-12 text-[#A09B90] font-medium border border-dashed border-[#E8E4D9] rounded-xl ml-16">
                          此日無行程
                        </div>
                     )}

                     {itinerary.filter(i => i.day === selectedDay).map((item, idx, arr) => {
                       const isAttraction = item.type === 'attraction';
                       const isRestaurant = item.type === 'restaurant';
                       const isTransit = item.type === 'transit';
                       return (
                         <div key={item.id} className="relative mb-14 flex items-start group">
                            <div className="w-12 text-right shrink-0 pt-0.5 relative z-10 bg-[#FBF9F6]">
                               <span className="text-lg font-serif font-bold text-[#2A2A2A]">{item.time}</span>
                               <span className="text-[10px] text-[#A09B90] align-top ml-0.5">°</span>
                            </div>
                            
                            <div className="w-8 shrink-0 flex justify-center relative z-10 pt-2.5">
                               <div className="w-[5px] h-[5px] rounded-full border border-[#A09B90] bg-[#FBF9F6]"></div>
                            </div>

                            <div className="flex-1 pt-1 cursor-pointer" onClick={() => setSelectedEvent(item)}>
                               <div className="flex items-center justify-between mb-1.5">
                                  <h4 className="text-[1.35rem] font-serif font-bold text-[#2A2A2A] group-hover:text-[#8C2E2E] transition-colors">{item.activity}</h4>
                               </div>
                               
                               <div className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] font-medium text-[#A09B90] uppercase mb-3">
                                  {isAttraction && <MapPin className="w-3 h-3" />}
                                  {isRestaurant && <Utensils className="w-3 h-3" />}
                                  {isTransit && <Train className="w-3 h-3" />}
                                  {item.type}
                                  <span className="ml-2 border border-[#8C2E2E]/30 text-[#8C2E2E] px-1.5 py-[2px] rounded text-[8px] transform -rotate-2 bg-white hidden sm:inline-block">已預約</span>
                               </div>

                               <div className="text-[13px] leading-relaxed text-[#6B665E] font-sans">
                                 {item.aiGuide ? (
                                   <div className="border-l-[1.5px] border-[#E8E4D9] pl-3 py-1">
                                      <Markdown>{item.aiGuide}</Markdown>
                                   </div>
                                 ) : (
                                   <div className="border-l-[1.5px] border-[#E8E4D9] pl-3 py-1">
                                      點擊取得 AI 導遊精華摘要，包含必吃美食及私房景點...
                                   </div>
                                 )}
                               </div>
                            </div>
                         </div>
                       )
                     })}
                  </div>
                </div>

                {/* Sticky Preview Footer */}
                <div className="fixed bottom-20 md:bottom-auto md:top-[6.5rem] left-0 right-0 md:left-auto md:right-6 mx-4 md:mx-0 z-30 pointer-events-none">
                  <div className="bg-[#FBF9F6]/95 backdrop-blur border border-[#E8E4D9] shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[1.25rem] p-4 flex items-center justify-between h-[80px] pointer-events-auto">
                    <div className="flex items-center gap-4 h-full">
                      <div className="flex flex-col items-center justify-center text-[#A09B90] px-2 h-full">
                        <Navigation2 className="w-5 h-5 mb-1 text-[#D9D2C2]" strokeWidth={1.5} />
                        <span className="text-[8px] font-bold tracking-widest text-[#D9D2C2]">GPS<br/>OFF</span>
                      </div>
                      <div className="w-px h-12 bg-[#E8E4D9]" />
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-2xl font-serif font-bold text-[#2A2A2A] leading-none text-[#2A2A2A]">
                             {itinerary.filter(i => i.day === selectedDay)?.[0]?.time || '13:25'}
                          </span>
                          <span className="text-[9px] border border-[#E8E4D9] px-1.5 py-0.5 rounded text-[#A09B90] tracking-widest">行程預覽</span>
                        </div>
                        <div className="text-[13px] font-bold text-[#2A2A2A] mb-0.5 tracking-wide line-clamp-1">{itinerary.filter(i => i.day === selectedDay)?.[0]?.activity || '午餐：魚飯時 (sahanji)'}</div>
                        <div className="text-[10px] text-[#A09B90] flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" /> {itinerary.filter(i => i.day === selectedDay)?.[0]?.location || '福岡'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center border-l border-[#E8E4D9] pl-5 pr-2 h-full">
                      <Clock className="w-4 h-4 text-[#A09B90] mb-1" strokeWidth={1.5} />
                      <div className="text-sm font-bold font-serif text-[#2A2A2A] leading-none">{itinerary.filter(i => i.day === selectedDay)?.[1]?.time || '13:45'}</div>
                      <div className="text-[8px] text-[#A09B90] tracking-widest mt-0.5">下個時間</div>
                    </div>
                  </div>
                </div>

                {/* Event Modal Override */}
                <AnimatePresence>
                  {selectedEvent && (
                    <motion.div 
                      initial={{ y: '100%' }} 
                      animate={{ y: 0 }} 
                      exit={{ y: '100%' }} 
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:p-4 md:p-12 flex flex-col justify-end"
                    >
                      <div className="w-full max-w-lg mx-auto h-[85vh] sm:h-[90vh] bg-[#FBF9F6] sm:rounded-3xl shadow-2xl flex flex-col rounded-t-3xl overflow-hidden relative">
                        <div className="shrink-0 bg-[#FBF9F6] z-10 px-6 py-5 flex items-center justify-between border-b border-[#E8E4D9]">
                          <div className="flex items-center gap-3">
                            <div className="text-[10px] font-bold tracking-[0.2em] text-[#2A2A2A] border border-[#2A2A2A] px-2.5 py-1.5 rounded-sm uppercase">
                              {selectedEvent.type}
                            </div>
                            <div className="flex items-center gap-1.5 text-[#6B665E] text-sm font-serif">
                              <Clock className="w-4 h-4"/> {selectedEvent.time}
                            </div>
                          </div>
                          <button onClick={() => setSelectedEvent(null)} className="p-2 -mr-2 text-[#A09B90] hover:text-[#2A2A2A] transition-colors">
                            <X className="w-6 h-6" strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-8">
                          <h2 className="text-3xl font-serif font-black text-[#2A2A2A] mb-3 leading-tight">{selectedEvent.activity}</h2>
                          <div className="flex items-center gap-1.5 text-xs text-[#A09B90] mb-8 pb-4 border-b border-[#E8E4D9]">
                            <MapPin className="w-4 h-4" /> {selectedEvent.location || selectedEvent.activity}
                          </div>

                          <div className="bg-white p-6 rounded-xl border border-[#E8E4D9] shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-6 relative">
                            <div className="absolute top-6 right-6 text-[#E8E4D9]">
                               <TicketIcon className="w-10 h-10" />
                            </div>
                            <div className="text-[9px] tracking-[0.2em] text-[#A09B90] mb-2 uppercase font-bold">RESERVATION</div>
                            <h3 className="text-lg font-serif font-bold text-[#2A2A2A] mb-1">{selectedEvent.activity}</h3>
                            <div className="text-sm text-[#A09B90] mb-8 font-sans">{selectedEvent.day} {selectedEvent.time}</div>
                            
                            <div className="border-t border-dashed border-[#E8E4D9] pt-6 flex justify-between items-end">
                               <div>
                                 <div className="text-[9px] tracking-[0.2em] text-[#A09B90] mb-2 uppercase font-bold">CONFIRMATION NO.</div>
                                 <div className="text-2xl font-bold font-serif text-[#2A2A2A] tracking-wider blur-[2px] select-none">
                                    A9-7729-6201
                                 </div>
                               </div>
                               <button className="text-[#A09B90] hover:text-[#8C2E2E] transition-colors p-2">
                                 <Copy className="w-6 h-6" strokeWidth={1.5} />
                               </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[#E8E4D9] shadow-sm mb-10">
                             <div className="w-12 h-12 bg-[#FBF9F6] rounded-lg flex items-center justify-center text-[#2A2A2A]">
                               <Navigation2 className="w-5 h-5" strokeWidth={1.5} />
                             </div>
                             <div>
                               <div className="text-[9px] tracking-[0.2em] text-[#A09B90] mb-1 uppercase font-bold">CAR GPS PHONE</div>
                               <div className="text-xl font-bold font-serif text-[#2A2A2A] tracking-wider">096-232-0100</div>
                             </div>
                          </div>

                          <div className="relative">
                            <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-[#A09B90] mb-4 uppercase font-bold">
                               <Info className="w-3.5 h-3.5" /> 關於此處 (ABOUT)
                            </div>
                            
                            <div className="text-[13px] leading-[1.8] text-[#5A554D] font-sans relative pb-8">
                               {selectedEvent.aiGuide ? (
                                  <div className="space-y-4 border-l-[1.5px] border-[#E8E4D9] pl-4 pb-4">
                                     <Markdown>{selectedEvent.aiGuide}</Markdown>
                                  </div>
                               ) : (
                                  <div className="text-[#A09B90] italic border-l-[1.5px] border-[#E8E4D9] pl-4">
                                     行程備註欄目前無內容。可以在 Google Sheets 中填寫 `note` 或 `aiGuide` 欄位。
                                  </div>
                               )}

                               </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
            )}
            {/* 資訊與工具 Tab */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="pb-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-serif font-bold text-[#2A2A2A] tracking-wider hidden md:block">資訊彙整</h2>
                  {!isEditingInfo ? (
                    <button onClick={() => setIsEditingInfo(true)} className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-[#D9D2C2] rounded-lg text-sm font-medium shadow-sm hover:bg-[#FBF9F6]"><Edit2 className="w-4 h-4"/> 編輯資訊</button>
                  ) : (
                    <div className="ml-auto flex gap-2">
                       <button onClick={handleSaveInfo} className="px-4 py-2 bg-[#8C2E2E] text-white rounded-lg text-sm font-bold shadow-sm">儲存</button>
                       <button onClick={() => {setIsEditingInfo(false); setEditInfoForm(info);}} className="px-4 py-2 bg-white border border-[#D9D2C2] rounded-lg text-sm font-medium shadow-sm">取消</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 成員卡片 */}
                  <div className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-[#D9D2C2]">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-2 text-[#8C2E2E]">
                        <Users className="w-5 h-5" />
                        <div>
                          <h3 className="font-serif font-bold tracking-widest text-sm">成員</h3>
                          <p className="text-[11px] text-[#A09B90] mt-1 font-sans tracking-normal">點選大頭貼即可上傳或更換照片</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#A09B90] bg-[#FBF9F6] px-3 py-1.5 rounded-full">{members.length} 人</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 mb-6">
                      {members.map(member => (
                        <div key={member.id} className="group relative flex flex-col items-center text-center">
                          <label className="relative w-20 h-20 rounded-full overflow-hidden bg-[#F1ECE3] border-2 border-white shadow-md cursor-pointer mb-3 ring-1 ring-[#D9D2C2]">
                            {member.avatar ? (
                              <img src={member.avatar} alt={`${member.name}的大頭貼`} className="w-full h-full object-cover" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-xl font-serif font-bold text-[#8C2E2E]">{member.name.slice(0, 2)}</span>
                            )}
                            <span className="absolute inset-0 bg-black/45 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="w-5 h-5" />
                            </span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => { handleAvatarUpload(member, e.target.files?.[0]); e.currentTarget.value = ''; }} />
                          </label>
                          <span className="font-bold text-sm text-[#2A2A2A] max-w-full truncate">{member.name}</span>
                          <button onClick={() => handleDeleteMember(member)} aria-label={`刪除${member.name}`} className="mt-2 text-[11px] text-[#A09B90] hover:text-red-500 flex items-center gap-1 transition-colors">
                            <Trash2 className="w-3 h-3" /> 刪除
                          </button>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddMember} className="flex gap-2 max-w-md">
                      <input value={newMemberName} onChange={e => setNewMemberName(e.target.value)} maxLength={20} placeholder="輸入新成員名稱" className="flex-1 min-w-0 bg-[#FBF9F6] border border-[#E8E4D9] rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#8C2E2E]" />
                      <button type="submit" className="shrink-0 flex items-center gap-2 px-4 py-3 bg-[#8C2E2E] text-white rounded-lg text-sm font-bold hover:bg-[#2A2A2A] transition-colors">
                        <Plus className="w-4 h-4" /> 新增
                      </button>
                    </form>
                  </div>

                  {/* 航班卡片 */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D9D2C2] flex flex-col">
                    <div className="flex items-center gap-2 text-[#8C2E2E] mb-4">
                      <Plane className="w-5 h-5" /> 
                      <h3 className="font-serif font-bold tracking-widest text-sm">FLIGHT</h3>
                    </div>
                    {isEditingInfo ? (
                      <textarea className="w-full flex-1 bg-[#FBF9F6] border-none rounded-lg p-3 text-sm resize-none focus:ring-1 focus:ring-[#8C2E2E] outline-none" rows={4} value={editInfoForm.flight} onChange={e => setEditInfoForm({...editInfoForm, flight: e.target.value})} />
                    ) : (
                      <div className="text-[#2A2A2A] whitespace-pre-wrap leading-relaxed text-sm flex-1">{info.flight || '尚未填寫航班資訊'}</div>
                    )}

                    {!isEditingInfo && (
                      <>
                        {!isEditingFlightNotes ? (
                          <div className="mt-4">
                            {info.flightNotes && (
                              <div className="pt-4 border-t border-[#FBF9F6] text-sm text-[#A09B90] mb-2 markdown-body">
                                <Markdown>{info.flightNotes}</Markdown>
                              </div>
                            )}
                            <button onClick={() => { setFlightNotesTemp(info.flightNotes || ''); setIsEditingFlightNotes(true); }} className="text-xs font-bold text-[#A09B90] flex items-center gap-1 hover:text-[#8C2E2E] cursor-pointer">
                              <Edit2 className="w-3 h-3" /> {info.flightNotes ? '編輯備註' : '加入備註 / 圖片網址'}
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 pt-4 border-t border-[#FBF9F6]">
                            <textarea className="w-full bg-[#FBF9F6] border-none rounded-lg p-3 text-sm resize-none focus:ring-1 focus:ring-[#8C2E2E] outline-none mb-2" rows={3} value={flightNotesTemp} onChange={(e) => setFlightNotesTemp(e.target.value)} placeholder="支援 Markdown 語法，加入圖片連結可直接顯示..." />
                            <div className="flex gap-2">
                              <button onClick={handleSaveFlightNotes} className="text-xs bg-[#8C2E2E] text-white px-3 py-1.5 rounded-md font-bold cursor-pointer hover:bg-[#A63737]">儲存備註</button>
                              <button onClick={() => setIsEditingFlightNotes(false)} className="text-xs bg-white text-[#2A2A2A] border border-[#D9D2C2] px-3 py-1.5 rounded-md font-bold cursor-pointer hover:bg-[#FBF9F6]">取消</button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* 住宿卡片 */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D9D2C2] flex flex-col">
                    <div className="flex items-center gap-2 text-[#8C2E2E] mb-4">
                      <Building className="w-5 h-5" /> 
                      <h3 className="font-serif font-bold tracking-widest text-sm">HOTEL</h3>
                    </div>
                    {isEditingInfo ? (
                      <textarea className="w-full flex-1 bg-[#FBF9F6] border-none rounded-lg p-3 text-sm resize-none focus:ring-1 focus:ring-[#8C2E2E] outline-none" rows={4} value={editInfoForm.hotel} onChange={e => setEditInfoForm({...editInfoForm, hotel: e.target.value})} />
                    ) : (
                      <div className="text-[#2A2A2A] whitespace-pre-wrap leading-relaxed text-sm flex-1">{info.hotel || '尚未填寫住宿資訊'}</div>
                    )}
                  </div>

                  {/* Google Sheets 表單卡片 */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D9D2C2] flex flex-col">
                    <div className="flex items-center gap-2 text-[#8C2E2E] mb-4">
                      <TableProperties className="w-5 h-5" /> 
                      <h3 className="font-serif font-bold tracking-widest text-sm">GOOGLE SHEETS (行程資料)</h3>
                    </div>
                    {isEditingInfo ? (
                      <textarea className="w-full flex-1 bg-[#FBF9F6] border-none rounded-lg p-3 text-sm resize-none focus:ring-1 focus:ring-[#8C2E2E] outline-none" rows={4} value={editInfoForm.sheetUrl} onChange={e => setEditInfoForm({...editInfoForm, sheetUrl: e.target.value})} placeholder="請貼上 Google 試算表發布為網頁 (CSV) 的連結" />
                    ) : (
                      <div className="text-[#2A2A2A] whitespace-pre-wrap leading-relaxed text-sm flex-1 break-all">{info.sheetUrl || '尚未設定 Google Sheets CSV 連結'}</div>
                    )}
                  </div>

                  {/* 緊急聯絡 */}
                  <div className="bg-[#2A2A2A] text-[#FBF9F6] p-6 rounded-2xl shadow-sm border border-[#2A2A2A] flex flex-col">
                    <div className="flex items-center gap-2 text-[#FBF9F6]/70 mb-4">
                      <Phone className="w-5 h-5" /> 
                      <h3 className="font-serif font-bold tracking-widest text-sm">EMERGENCY</h3>
                    </div>
                    {isEditingInfo ? (
                      <textarea className="w-full flex-1 bg-white/10 border-none rounded-lg p-3 text-sm text-[#FBF9F6] resize-none focus:ring-1 focus:ring-white outline-none" rows={4} value={editInfoForm.emergencyContacts} onChange={e => setEditInfoForm({...editInfoForm, emergencyContacts: e.target.value})} />
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed text-sm flex-1 opacity-90">{info.emergencyContacts || '無緊急聯絡資訊'}</div>
                    )}
                  </div>

                  {/* 匯率小工具 */}
                  <div className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-[#D9D2C2] flex flex-col md:flex-row items-center gap-6">
                     <div className="flex-1 flex items-center gap-4">
                       <div className="w-12 h-12 bg-[#8C2E2E] rounded-full text-white flex items-center justify-center shrink-0">
                         <span className="text-2xl font-serif">¥</span>
                       </div>
                       <div>
                         <h3 className="font-serif font-bold tracking-widest text-xs text-[#2A2A2A]/50 mb-1">參考匯率</h3>
                         <div className="flex items-baseline gap-2">
                            {isEditingInfo ? (
                              <input type="text" className="w-32 bg-[#FBF9F6] p-2 rounded text-xl font-bold border-none outline-none focus:ring-1 focus:ring-[#8C2E2E]" value={editInfoForm.exchangeRate} onChange={e => setEditInfoForm({...editInfoForm, exchangeRate: e.target.value})} />
                            ) : (
                              <div className="text-3xl font-bold text-[#2A2A2A]">{info.exchangeRate || '-'}</div>
                            )}
                            <span className="text-sm font-medium text-[#2A2A2A]/40">TWD / JPY</span>
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 記帳表 Tab */}
            {activeTab === 'expenses' && (
              <motion.div key="expenses" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="pb-32 bg-[#FBF9F6] relative">
                
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6 sticky top-20 md:top-0 z-20 bg-[#FBF9F6]/95 backdrop-blur-md pt-4 pb-2 border-b border-[#E8E4D9]">
                   <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2A2A2A] tracking-wider flex items-center gap-2">
                     <Edit2 className="w-6 h-6 md:w-8 md:h-8" /> 旅行帳本
                     <span className="text-xs bg-[#E5F2E9] text-[#1D7A46] px-2 py-0.5 rounded-full font-sans tracking-normal ml-2">Online</span>
                   </h2>
                   <div className="text-right">
                     <div className="text-sm font-bold text-[#2A2A2A]">全部顯示</div>
                     <div className="text-xs text-[#A09B90]">{expenses.length} 筆項目</div>
                   </div>
                </div>

                <div className="text-lg font-bold font-serif mb-4 tracking-widest text-[#2A2A2A]/80">連到Firebase<br/>全部使用者都同步</div>

                {/* Filters */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
                  {tripUsersNames.map(name => (
                    <button 
                      key={name}
                      onClick={() => setExpenseUserFilter(name)}
                      className={`shrink-0 w-12 h-12 rounded-full font-serif font-bold text-sm flex items-center justify-center transition-all cursor-pointer ${expenseUserFilter === name ? 'bg-[#2A2A2A] text-white shadow-md' : 'bg-white border border-[#E8E4D9] text-[#2A2A2A] hover:bg-[#FBF9F6]'}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                {/* Ledger Body */}
                <div className="bg-white border border-[#E8E4D9] rounded-sm">
                  {/* Total Header */}
                  <div className="p-6 border-b border-[#E8E4D9]">
                    <h3 className="text-xs font-bold tracking-widest text-[#A09B90] mb-2">總金額 (台幣)</h3>
                    <div className="text-5xl font-serif font-black text-[#2A2A2A] mb-2 tracking-tighter">
                      ${((expenseUserFilter === '全部' ? getTotalExpenses() : expenses.filter(e => e.payer === expenseUserFilter).reduce((sum, e) => sum + e.amount, 0)) * (Number(info.exchangeRate) || 0.21)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    {expenseUserFilter === '全部' && (
                      <div className="text-sm font-bold text-[#A09B90]">
                        每人均攤: ${ ((getTotalExpenses() * (Number(info.exchangeRate) || 0.21)) / (tripUsersNames.length - 1 || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                      </div>
                    )}
                  </div>

                  {/* Expense Items */}
                  <div className="divide-y divide-[#E8E4D9]">
                    {expenses.filter(e => expenseUserFilter === '全部' || e.payer === expenseUserFilter).map(exp => (
                      <div key={exp.id} className="p-5 flex items-center justify-between group hover:bg-[#FBF9F6] transition-colors relative">
                        <div className="flex-1">
                          <div className="text-[15px] font-bold text-[#2A2A2A] mb-1.5 flex items-center gap-2">
                             {exp.description.includes('機票') && <Plane className="w-4 h-4 text-[#A09B90]" />}
                             {exp.description}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border border-[#8C2E2E]/30 text-[#8C2E2E] flex items-center justify-center text-[10px] font-bold shrink-0">{exp.payer}</span>
                            <button onClick={() => handleToggleExpenseStatus(exp)} className={`text-[10px] px-1.5 rounded-sm font-bold cursor-pointer ${exp.status === '已付' ? 'bg-[#F2F2F2] text-[#A09B90]' : 'bg-[#FFF0F0] text-[#8C2E2E]'}`}>
                              {exp.status}
                            </button>
                          </div>
                        </div>
                        <div className="text-lg font-bold font-serif text-[#2A2A2A] tracking-wider pl-4">
                          ${(exp.amount * (Number(info.exchangeRate) || 0.21)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <button onClick={() => handleDeleteExpense(exp.id)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {expenses.length === 0 && (
                      <div className="p-8 text-center text-[#A09B90] font-medium text-sm">無紀錄</div>
                    )}
                  </div>
                </div>

                {/* FAB to add expense */}
                <div className="fixed bottom-28 md:bottom-8 right-4 md:right-8 z-30">
                   <button 
                     onClick={() => {
                        const target = document.getElementById('add-expense-form');
                        if (target) target.scrollIntoView({behavior: 'smooth'})
                     }}
                     className="w-14 h-14 bg-[#2A2A2A] text-[#FBF9F6] rounded-full shadow-lg flex items-center justify-center hover:bg-[#8C2E2E] transition-colors cursor-pointer"
                   >
                     <Plus className="w-6 h-6" />
                   </button>
                </div>

                {/* Add Expense Form Area (bottom of page) */}
                <div id="add-expense-form" className="mt-16 pt-8 border-t border-[#E8E4D9] max-w-xl mx-auto">
                   <div className="bg-white rounded-xl border border-[#E8E4D9] p-6 shadow-sm relative">
                     <div className="flex items-center gap-2 text-[#A09B90] mb-6">
                        <Edit2 className="w-4 h-4" />
                        <h3 className="text-sm font-bold tracking-widest">新增款項</h3>
                     </div>
                     
                     <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
                       <input 
                         name="description" 
                         required 
                         placeholder="項目名稱 (如: 和牛燒肉)" 
                         className="w-full bg-transparent border-b border-[#2A2A2A] text-xl px-2 py-3 text-[#2A2A2A] placeholder-[#D9D2C2] outline-none focus:border-[#8C2E2E] transition-colors font-bold" 
                       />
                       
                       <div className="flex gap-4 items-end mt-2">
                         <div className="flex-1 relative">
                           <input 
                             name="amount" 
                             type="number" 
                             required min="0" 
                             placeholder="0" 
                             className="w-full bg-transparent border-b border-[#E8E4D9] text-3xl font-serif px-2 py-2 text-[#2A2A2A] placeholder-[#D9D2C2] outline-none focus:border-[#8C2E2E] transition-colors" 
                           />
                         </div>
                         <div className="bg-[#FBF9F6] border border-[#E8E4D9] text-[#A09B90] px-4 py-2 font-bold tracking-widest text-sm shrink-0">
                           JPY
                         </div>
                       </div>
                       
                       <div className="flex flex-wrap gap-3 mt-4">
                         <div className="flex-1 min-w-[120px]">
                            <label className="text-xs font-bold text-[#A09B90] block mb-2">付款人</label>
                            <select name="payer" className="w-full bg-[#FBF9F6] border border-[#E8E4D9] p-3 text-sm font-bold text-[#2A2A2A] outline-none">
                               {tripUsersNames.filter(u => u !== '全部').map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                         </div>
                         <div className="flex-1 min-w-[120px]">
                            <label className="text-xs font-bold text-[#A09B90] block mb-2">狀態</label>
                            <select name="status" className="w-full bg-[#FBF9F6] border border-[#E8E4D9] p-3 text-sm font-bold text-[#2A2A2A] outline-none">
                               <option value="已付">已付</option>
                               <option value="未付">未付</option>
                            </select>
                         </div>
                       </div>
                       
                       <button type="submit" className="mt-6 w-full py-4 bg-[#8C2E2E] text-white font-bold tracking-widest rounded-sm hover:bg-[#2A2A2A] transition-colors cursor-pointer">
                          儲存款項
                       </button>
                     </form>
                   </div>
                </div>

              </motion.div>
            )}

            {/* 任務與待辦 Tab */}
            {activeTab === 'tasks' && (
              <motion.div key="tasks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="pb-10">
                <h2 className="text-3xl font-serif font-bold mb-8 text-[#2A2A2A] tracking-wider hidden md:block">行前準備</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: '攜帶物品', type: 'packing', icon: Luggage },
                    { title: '待辦事項', type: 'todo', icon: CheckSquare },
                    { title: '通訊網路', type: 'sim', icon: Wifi },
                    { title: '重要文件', type: 'insurance', icon: ShieldCheck }
                  ].map(({title, type, icon: Icon}) => {
                    const typeTasks = tasks.filter(t => t.type === type);
                    
                    return (
                      <div key={type} className="bg-white p-6 rounded-2xl border border-[#D9D2C2] shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-6 border-b border-[#D9D2C2] pb-4">
                           <div className="w-10 h-10 bg-[#FBF9F6] rounded-full flex items-center justify-center text-[#8C2E2E]">
                             <Icon className="w-5 h-5" />
                           </div>
                           <h3 className="text-lg font-serif font-bold text-[#2A2A2A]">{title}</h3>
                        </div>
                        
                        <div className="space-y-3 mb-6 flex-1">
                          {typeTasks.map(task => (
                            <div key={task.id} className="group flex items-start gap-3">
                               <button 
                                 onClick={() => handleToggleTask(task)} 
                                 className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors mt-0.5 \${task.completed ? 'bg-[#8C2E2E] border-[#8C2E2E]' : 'border-[#D9D2C2] hover:border-[#8C2E2E]'}`}
                               >
                                 {task.completed && <Check className="w-3 h-3 text-white" />}
                               </button>
                               <span className={`flex-1 font-medium text-sm leading-snug \${task.completed ? 'line-through text-[#2A2A2A]/30' : 'text-[#2A2A2A]'}`}>{task.title}</span>
                               <button onClick={() => handleDeleteTask(task.id)} className="md:opacity-0 group-hover:opacity-100 p-1 text-[#2A2A2A]/20 hover:text-red-500 transition-all">
                                 <Trash2 className="w-3.5 h-3.5" />
                               </button>
                            </div>
                          ))}
                          {typeTasks.length === 0 && <div className="text-sm text-[#2A2A2A]/30 italic">尚未加入項目</div>}
                        </div>

                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.elements.namedItem('taskTitle') as HTMLInputElement;
                            handleAddTask(input.value, type);
                            input.value = '';
                          }}
                          className="relative mt-auto"
                        >
                          <input name="taskTitle" placeholder="新增..." required className="w-full bg-[#FBF9F6] rounded-lg py-3 pl-4 pr-12 outline-none font-medium text-sm text-[#2A2A2A] placeholder-[#2A2A2A]/30 focus:ring-1 focus:ring-[#8C2E2E]" />
                          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#2A2A2A]/40 hover:text-[#8C2E2E] transition-colors"><Plus className="w-4 h-4"/></button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
