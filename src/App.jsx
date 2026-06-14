import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {
  Activity,
  Flame,
  Dumbbell,
  TrendingDown,
  MessageSquare,
  Settings,
  Home,
  LogOut,
  Menu,
  X,
  Star,
  Calendar,
  CheckCircle2,
  Upload,
  Target,
  BarChart3,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';

const NAV_ITEMS = [
  { id: 'home', label: 'หน้าแรก', icon: Home },
  { id: 'meals', label: 'อาหาร', icon: Flame },
  { id: 'exercise', label: 'ออกกำลังกาย', icon: Dumbbell },
  { id: 'progress', label: 'ความก้าวหน้า', icon: TrendingDown },
  { id: 'chat', label: 'แชท', icon: MessageSquare },
  { id: 'settings', label: 'ตั้งค่า', icon: Settings },
];

const COURSE_PLANS = [
  {
    id: 1,
    name: 'Starter Fit',
    duration: '3 เดือน',
    details: 'สร้างพื้นฐานอาหารและการออกกำลังกายสำหรับผู้เริ่มต้น',
    difficulty: 'ง่าย',
    goal: 'ลด 5-7 กก.',
    realistic: 'เหมาะสำหรับคนเริ่มต้นที่ต้องการเปลี่ยนวิถีชีวิต',
    weightTarget: 6,
    mealSchedule: [
      { time: '07:00', menu: 'ข้าวโอ๊ตกับกล้วยและนมอัลมอนด์' },
      { time: '12:00', menu: 'สลัดอกไก่ผักสด' },
      { time: '18:30', menu: 'ปลาอบผักต้ม' },
    ],
    exerciseSchedule: [
      { time: '06:30', activity: 'เดินเร็ว 30 นาที' },
      { time: '17:30', activity: 'ยืดเส้นยืดสาย 15 นาที' },
    ],
    recommendedFoods: ['ผักสด', 'อกไก่', 'ปลานึ่ง', 'ข้าวกล้อง'],
  },
  {
    id: 2,
    name: 'Healthy Habit',
    duration: '4 เดือน',
    details: 'โฟกัสการกินให้ถูกต้องพร้อมกิจวัตรที่สม่ำเสมอ',
    difficulty: 'ง่าย',
    goal: 'ลด 8-10 กก.',
    realistic: 'ดีสำหรับผู้ที่ต้องการค่อย ๆ ลดน้ำหนักแบบยั่งยืน',
    weightTarget: 9,
    mealSchedule: [
      { time: '07:30', menu: 'ไข่ต้มกับขนมปังโฮลวีท' },
      { time: '12:30', menu: 'ข้าวกล้องอกไก่ย่าง' },
      { time: '19:00', menu: 'ต้มจืดเต้าหู้ผัก' },
    ],
    exerciseSchedule: [
      { time: '07:00', activity: 'โยคะเบา 20 นาที' },
      { time: '18:00', activity: 'ปั่นจักรยาน 25 นาที' },
    ],
    recommendedFoods: ['ถั่ว', 'โยเกิร์ตไขมันต่ำ', 'ผักใบเขียว', 'ชาเขียว'],
  },
  {
    id: 3,
    name: 'Core Strength',
    duration: '4 เดือน',
    details: 'เพิ่มความแข็งแรงพร้อมลดไขมันส่วนเกิน',
    difficulty: 'ปานกลาง',
    goal: 'ลด 9-11 กก.',
    realistic: 'เหมาะสำหรับคนที่ต้องการสร้างกล้ามแนวหน้า',
    weightTarget: 10,
    mealSchedule: [
      { time: '07:00', menu: 'สมูทตี้โปรตีนเบอร์รี่' },
      { time: '12:00', menu: 'สลัดควินัวกับแซลมอน' },
      { time: '18:30', menu: 'สเต๊กไก่ผักย่าง' },
    ],
    exerciseSchedule: [
      { time: '06:00', activity: 'เวทเทรนนิ่ง 30 นาที' },
      { time: '19:00', activity: 'แพลงก์ 3 เซ็ต' },
    ],
    recommendedFoods: ['ปลาแซลมอน', 'ควินัว', 'ไข่ขาว', 'ผักโขม'],
  },
  {
    id: 4,
    name: 'Trim & Tone',
    duration: '6 เดือน',
    details: 'ลดสัดส่วนและปรับรูปร่างให้กระชับ',
    difficulty: 'ปานกลาง',
    goal: 'ลด 12-14 กก.',
    realistic: 'ได้ผลชัดเมื่อทำสม่ำเสมอ',
    weightTarget: 13,
    mealSchedule: [
      { time: '06:30', menu: 'ข้าวโอ๊ตกราโนล่า' },
      { time: '12:00', menu: 'สลัดอกไก่กับอะโวคาโด' },
      { time: '19:00', menu: 'ผัดผักใส่เต้าหู้' },
    ],
    exerciseSchedule: [
      { time: '06:00', activity: 'คาร์ดิโอ 25 นาที' },
      { time: '17:30', activity: 'สควอท 3 เซ็ต' },
    ],
    recommendedFoods: ['อะโวคาโด', 'เต้าหู้', 'โยเกิร์ต', 'ผักสด'],
  },
  {
    id: 5,
    name: 'Fat Burn Intensive',
    duration: '6 เดือน',
    details: 'แผนเน้นลดไขมันและกระชับกล้ามเนื้อ',
    difficulty: 'ยาก',
    goal: 'ลด 14-16 กก.',
    realistic: 'เหมาะสำหรับคนที่พร้อมลงแรงเต็มที่',
    weightTarget: 15,
    mealSchedule: [
      { time: '07:00', menu: 'ไข่คนกับผักโขม' },
      { time: '12:30', menu: 'สลัดปลากับถั่ว' },
      { time: '19:00', menu: 'ซุปผักแคลต่ำ' },
    ],
    exerciseSchedule: [
      { time: '05:30', activity: 'เดินเร็ว 35 นาที' },
      { time: '18:00', activity: 'HIIT 20 นาที' },
    ],
    recommendedFoods: ['อกไก่', 'ปลา', 'ผักต้ม', 'ธัญพืชเต็มเมล็ด'],
  },
  {
    id: 6,
    name: 'Lean Lifestyle',
    duration: '8 เดือน',
    details: 'ปรับวิถีชีวิตให้ผอมเพรียวและยั่งยืน',
    difficulty: 'ปานกลาง',
    goal: 'ลด 15-18 กก.',
    realistic: 'เปลี่ยนความเคยชินแบบยั่งยืน',
    weightTarget: 17,
    mealSchedule: [
      { time: '07:30', menu: 'โยเกิร์ตผลไม้กับกราโนล่า' },
      { time: '13:00', menu: 'ข้าวกล้องกับสเต๊กปลา' },
      { time: '19:00', menu: 'ผักต้มใส่เต้าหู้' },
    ],
    exerciseSchedule: [
      { time: '06:30', activity: 'วิ่ง 4 กม.' },
      { time: '17:30', activity: 'คูลดาวน์และยืดกล้ามเนื้อ' },
    ],
    recommendedFoods: ['โยเกิร์ต', 'ถั่ว', 'ผักใบเขียว', 'อาหารทะเล'],
  },
  {
    id: 7,
    name: 'Wellness Journey',
    duration: '8 เดือน',
    details: 'โฟกัสร่างกายและสุขภาพจิตควบคู่กัน',
    difficulty: 'ปานกลาง',
    goal: 'ลด 10-12 กก.',
    realistic: 'เหมาะสำหรับคนที่ต้องการความสมดุล',
    weightTarget: 11,
    mealSchedule: [
      { time: '08:00', menu: 'สมูทตี้ผักและผลไม้' },
      { time: '12:00', menu: 'สลัดถั่วกับผักสด' },
      { time: '18:30', menu: 'ปลาอบน้ำส้มสายชู' },
    ],
    exerciseSchedule: [
      { time: '07:00', activity: 'โยคะ 30 นาที' },
      { time: '18:00', activity: 'เดินจ๊อกกิ้ง 25 นาที' },
    ],
    recommendedFoods: ['ผลไม้', 'ผักสด', 'ปลา', 'น้ำมะพร้าว'],
  },
  {
    id: 8,
    name: 'Athletic Shape',
    duration: '10 เดือน',
    details: 'เสริมความแข็งแรงและความฟิตเต็มที่',
    difficulty: 'ยาก',
    goal: 'ลด 16-20 กก.',
    realistic: 'ดีสำหรับคนที่ชอบความท้าทาย',
    weightTarget: 18,
    mealSchedule: [
      { time: '06:30', menu: 'ไข่ขาวกับขนมปังโฮลวีท' },
      { time: '12:00', menu: 'อกไก่กับผักต้ม' },
      { time: '19:00', menu: 'สลัดโปรตีนสูง' },
    ],
    exerciseSchedule: [
      { time: '05:30', activity: 'เวทเทรนนิ่ง 40 นาที' },
      { time: '18:30', activity: 'คาร์ดิโอ 30 นาที' },
    ],
    recommendedFoods: ['ปลา', 'อกไก่', 'ควินัว', 'ผักโขม'],
  },
  {
    id: 9,
    name: 'Mindful Fitness',
    duration: '12 เดือน',
    details: 'ฝึกทั้งร่างกายและจิตใจเพื่อเปลี่ยนแปลงยาวนาน',
    difficulty: 'ปานกลาง',
    goal: 'ลด 18-22 กก.',
    realistic: 'เหมาะสำหรับการเปลี่ยนไลฟ์สไตล์',
    weightTarget: 20,
    mealSchedule: [
      { time: '07:00', menu: 'ข้าวโอ๊ตกับถั่วและผลไม้' },
      { time: '12:30', menu: 'สลัดปลาอบ' },
      { time: '19:00', menu: 'ต้มยำเห็ดผัก' },
    ],
    exerciseSchedule: [
      { time: '06:00', activity: 'เดินเร็ว 35 นาที' },
      { time: '19:00', activity: 'ฟังก์ชันนัลเทรนนิ่ง 30 นาที' },
    ],
    recommendedFoods: ['ข้าวโอ๊ต', 'ปลา', 'ผักสด', 'น้ำเต้าหู้'],
  },
  {
    id: 10,
    name: 'Ultimate Transformation',
    duration: '12 เดือน',
    details: 'เปลี่ยนทั้งอาหารและการออกกำลังกายเพื่อผลลัพธ์ยั่งยืน',
    difficulty: 'ยาก',
    goal: 'ลด 20-25 กก.',
    realistic: 'เหมาะสำหรับคนตั้งใจจริงและพร้อมลงมือทำ',
    weightTarget: 22,
    mealSchedule: [
      { time: '06:30', menu: 'โปรตีนเชคกับผลไม้' },
      { time: '12:00', menu: 'สลัดอกไก่กับควินัว' },
      { time: '19:00', menu: 'ต้มจืดผักรวม' },
    ],
    exerciseSchedule: [
      { time: '05:30', activity: 'วิ่ง 5 กม.' },
      { time: '18:00', activity: 'ฝึกกล้ามเนื้อแบบครบตัว 35 นาที' },
    ],
    recommendedFoods: ['โปรตีนเชค', 'ควินัว', 'ปลา', 'ผักสด'],
  },
  {
    id: 11,
    name: 'Premium',
    duration: '3 เดือน',
    details: 'แผนพรีเมียมสำหรับลด 30 กก.ใน 3 เดือน โดยต้องทำตามอาหารและการออกกำลังกายทุกวัน',
    difficulty: 'ยากมาก',
    goal: 'ลด 30 กก.',
    realistic: 'ลดได้จริงเมื่อปฏิบัติตามแบบเข้มข้นและมีวินัยเต็มที่',
    weightTarget: 30,
    premium: true,
    mealSchedule: [
      { time: '06:00', menu: 'น้ำผักปั่นโปรตีน + ไข่ขาว 2 ฟอง' },
      { time: '09:00', menu: 'สลัดผักคีนัวกับอกไก่' },
      { time: '12:00', menu: 'ปลาอบสมุนไพร + ผักย่าง' },
      { time: '15:00', menu: 'โยเกิร์ตไขมันต่ำ + เมล็ดเจีย' },
      { time: '18:00', menu: 'สเต๊กเนื้อไม่ติดมัน + ผักสด' },
      { time: '20:30', menu: 'โปรตีนเชคคลีน' },
    ],
    exerciseSchedule: [
      { time: '05:30', activity: 'คาร์ดิโอ HIIT 30 นาที' },
      { time: '12:30', activity: 'เวทเทรนนิ่งเน้นทุกส่วน 40 นาที' },
      { time: '18:00', activity: 'เดินเร็วหรือวิ่งเทรล 45 นาที' },
      { time: '20:00', activity: 'ยืดเส้นยืดสาย + โยคะ 20 นาที' },
    ],
    recommendedFoods: ['อกไก่', 'ปลา', 'ผักใบเขียว', 'ไข่ขาว', 'ควินัว', 'อัลมอนด์'],
  },
];

const getCourseCalorieLimit = (course) => {
  if (!course) return 1800;
  switch (course.difficulty) {
    case 'เบา':
      return 1750;
    case 'ง่าย':
      return 1700;
    case 'ปานกลาง':
      return 1600;
    case 'ยาก':
      return 1500;
    case 'ยากมาก':
      return 1450;
    case 'ขั้นสุด':
      return 1400;
    case 'สุดขีด':
      return 1300;
    default:
      return 1600;
  }
};

const getCourseRecommendations = (weight) => {
  if (weight <= 70) {
    return COURSE_PLANS.filter((course) => [1, 2, 3].includes(course.id));
  }
  if (weight <= 80) {
    return COURSE_PLANS.filter((course) => [2, 4, 5, 6].includes(course.id));
  }
  if (weight <= 90) {
    return COURSE_PLANS.filter((course) => [4, 5, 6, 8].includes(course.id));
  }
  return COURSE_PLANS.filter((course) => [6, 8, 9, 11].includes(course.id));
};

const groupMealsByType = (mealSchedule) => {
  const grouped = { breakfast: [], lunch: [], dinner: [] };
  mealSchedule.forEach((item) => {
    if (item.time <= '10:00') grouped.breakfast.push(item);
    else if (item.time <= '15:00') grouped.lunch.push(item);
    else grouped.dinner.push(item);
  });
  return grouped;
};

const RECIPES = [ 
  { id: 1, title: 'ไข่ต้มสุขภาพ', calories: 78, description: 'ง่าย สะอาด โปรตีนสูง' },
  { id: 2, title: 'สลัดอกไก่', calories: 220, description: 'ผักสดกับโปรตีนลีน' },
  { id: 3, title: 'สมูทตี้เบอร์รี่', calories: 160, description: 'สดชื่นและมีไฟเบอร์' },
];

const MEAL_PLAN = [
  { day: 'จันทร์', breakfast: 'ไข่คน + ขนมปังโฮลวีท', lunch: 'สลัดอกไก่', dinner: 'แกงจืดเต้าหู้' },
  { day: 'อังคาร', breakfast: 'ข้าวโอ๊ตผลไม้', lunch: 'ปลาย่างกับผัก', dinner: 'ส้มตำอกไก่' },
  { day: 'พุธ', breakfast: 'โยเกิร์ตรวมผลไม้', lunch: 'ข้าวกล้องผัดผัก', dinner: 'ต้มยำเห็ด' },
  { day: 'พฤหัสบดี', breakfast: 'แซนวิชทูน่า', lunch: 'สลัดเต้าเจี้ยว', dinner: 'ปลาอบสมุนไพร' },
  { day: 'ศุกร์', breakfast: 'แป้งโฮลวีทกับไข่', lunch: 'แกงส้มผักรวม', dinner: 'สุกี้ยากี้โปรตีนต่ำ' },
  { day: 'เสาร์', breakfast: 'สมูทตี้ผัก', lunch: 'สลัดควินัว', dinner: 'ข้าวกล้อง + ไก่อบ' },
  { day: 'อาทิตย์', breakfast: 'แพนเค้กกล้วย', lunch: 'สเต๊กปลาแซลมอน', dinner: 'ผักต้ม + เต้าหู้' },
];

const EXERCISES = [
  { id: 1, title: 'เดินเร็ว 30 นาที', summary: 'เพิ่มหัวใจและการเผาผลาญ', icon: Activity },
  { id: 2, title: 'สควอท 3 เซ็ต', summary: 'ฝึกขาและแกนกลางลำตัว', icon: Dumbbell },
  { id: 3, title: 'แพลงก์ 2 นาที', summary: 'สร้างแกนกลางลำตัวแข็งแรง', icon: ShieldCheck },
];

const TRAINER_RESPONSES = [
  { keywords: ['น้ำหนัก', 'ลด'], text: 'ลองเน้นอาหารโปรตีนสูง ลดน้ำตาล และเดินเร็ว 30 นาทีทุกวันครับ' },
  { keywords: ['อาหาร', 'มื้อ'], text: 'ควรแบ่งมื้อเล็ก 5 มื้อ และเน้นผักสดกับโปรตีนลีนครับ' },
  { keywords: ['นอน', 'พักผ่อน'], text: 'นอน 7-8 ชั่วโมงต่อคืนช่วยให้ร่างกายฟื้นตัวและเผาผลาญได้ดีขึ้นครับ' },
  { keywords: ['เหนื่อย', 'ไม่ไหว'], text: 'พักแบบ active rest เช่น เดินช้า ๆ และดื่มน้ำมาก ๆ ครับ' },
  { keywords: ['เมนู', 'สูตร'], text: 'ลองเมนูไข่ต้ม สลัดอกไก่ และสมูทตี้ผลไม้สำหรับมื้อเบา ๆ ครับ' },
];

const AI_RESPONSES = [
  'วันนี้คุณทำได้ดีแล้วครับ! ลองเดินเพิ่มอีกสัก 10 นาที',
  'ดื่มน้ำให้เพียงพอและพักผ่อนให้เพียงพอด้วยนะครับ',
  'เน้นผักให้เยอะขึ้นในมื้อเย็นเพื่อช่วยระบบย่อยอาหาร',
  'สู้ต่อไปครับ ผมเป็นกำลังใจให้เสมอ',
];

const INITIAL_USER = {
  id: '',
  name: '',
  email: '',
  password: '',
  emailVerified: false,
  age: 28,
  gender: 'female',
  currentWeight: 75,
  targetWeight: 65,
  selectedCourse: null,
  startDate: null,
  weights: [],
  mealLog: [],
  chatHistory: [],
  zwiftActivities: [],
  appleHealthData: [],
  usageStats: {
    logins: 0,
    mealLogsCount: 0,
    exerciseLogsCount: 0,
    lastLogin: null,
  },
};

function App() {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('healthAppUsers');
    if (!saved) return [];
    try { return JSON.parse(saved); } catch { return []; }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const currentId = localStorage.getItem('healthAppCurrent');
    const saved = localStorage.getItem('healthAppUsers');
    if (!currentId || !saved) return null;
    try { return JSON.parse(saved).find((item) => item.id === currentId) || null; } catch { return null; }
  });

  const [authMode, setAuthMode] = useState('login');
  const [verificationStep, setVerificationStep] = useState(null); // 'otp' or null
  const [otpCode, setOtpCode] = useState('');
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '28', gender: 'female', currentWeight: '75', targetWeight: '65' });
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageFeedback, setImageFeedback] = useState(null);
  const [analysisMealType, setAnalysisMealType] = useState('');
  const [tfModel, setTfModel] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [pendingPremiumCourse, setPendingPremiumCourse] = useState(null);
  const [pendingExerciseSchedule, setPendingExerciseSchedule] = useState([]);

  useEffect(() => {
    localStorage.setItem('healthAppUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('healthAppCurrent', currentUser.id);
    else localStorage.removeItem('healthAppCurrent');
  }, [currentUser]);

  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  // Load MobileNet model for client-side classification
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const m = await mobilenet.load();
        if (mounted) {
          setTfModel(m);
          setModelLoading(false);
        }
      } catch (e) {
        console.warn('mobilenet load failed', e);
        if (mounted) setModelLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const normalizeLabel = (label) => label.toLowerCase().replace(/_/g, ' ').replace(/[^a-z0-9ก-๙\s]/g, ' ').trim();

  const detectDishFromLabel = (label) => {
    if (!label) return 'อาหารทั่วไป';
    const l = normalizeLabel(label);
    const mappings = [
      { terms: ['pad thai', 'phad thai', 'ผัดไทย'], name: 'ผัดไทย' },
      { terms: ['fried rice', 'rice fried', 'ข้าวผัด'], name: 'ข้าวผัด' },
      { terms: ['steamed rice', 'ข้าวสวย', 'rice'], name: 'ข้าวสวย' },
      { terms: ['sushi', 'ซูชิ'], name: 'ซูชิ' },
      { terms: ['pizza', 'พิซซ่า'], name: 'พิซซ่า' },
      { terms: ['burger', 'hamburger', 'cheeseburger'], name: 'เบอร์เกอร์' },
      { terms: ['hot dog', 'hotdog'], name: 'ฮอทดอก' },
      { terms: ['sandwich', 'แซนวิช'], name: 'แซนวิช' },
      { terms: ['spaghetti', 'พาสต้า', 'pasta'], name: 'พาสต้า' },
      { terms: ['noodle', 'ramen', 'pho', 'ก๋วยเตี๋ยว'], name: 'ก๋วยเตี๋ยว' },
      { terms: ['salad', 'lettuce', 'สลัด'], name: 'สลัดผัก' },
      { terms: ['chicken', 'roast chicken', 'grilled chicken', 'ไก่'], name: 'อกไก่' },
      { terms: ['fish', 'salmon', 'tuna', 'ปลา'], name: 'ปลา' },
      { terms: ['cake', 'dessert', 'ice cream', 'ขนมหวาน'], name: 'ขนมหวาน' },
      { terms: ['tofu', 'เต้าหู้'], name: 'เต้าหู้' },
      { terms: ['egg', 'omelette', 'ไข่'], name: 'ไข่' },
      { terms: ['soup', 'ต้มยำ', 'แกง'], name: 'ซุป/แกง' },
      { terms: ['steak', 'สเต๊ก'], name: 'สเต๊ก' },
      { terms: ['rice bowl', 'donburi'], name: 'ข้าวหน้า' },
      { terms: ['burrito', 'taco'], name: 'เบอร์ริโต้/ทาโก้' },
    ];
    for (const item of mappings) {
      if (item.terms.some((term) => l.includes(term))) {
        return item.name;
      }
    }
    return l || 'อาหารทั่วไป';
  };

  const handleRegister = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const age = Number(form.age);
    const gender = form.gender;
    const currentWeight = Number(form.currentWeight);
    const targetWeight = Number(form.targetWeight);
    if (!name || !email || !password || !age || !gender || !currentWeight || !targetWeight) { alert('กรุณากรอกข้อมูลให้ครบทุกช่อง'); return; }
    if (users.some((item) => item.email === email)) { alert('อีเมลนี้ถูกใช้งานแล้ว'); return; }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      alert('กรุณาใช้อีเมล Gmail เท่านั้น (เช่น example@gmail.com)');
      return;
    }
    
    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtpCode(otp);
    setVerificationStep('otp');
    alert(`OTP ของคุณ: ${otp}\n(ในแอปจริง จะส่งไปยังอีเมลของคุณ)`);
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim() !== sentOtpCode) {
      alert('OTP ไม่ถูกต้อง กรุณาลองอีกครั้ง');
      return;
    }

    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const age = Number(form.age);
    const gender = form.gender;
    const currentWeight = Number(form.currentWeight);
    const targetWeight = Number(form.targetWeight);
    
    const newUser = {
      ...INITIAL_USER,
      id: `${Date.now()}`,
      name,
      email,
      password,
      emailVerified: true,
      age,
      gender,
      currentWeight,
      targetWeight,
      selectedCourse: null,
      startDate: new Date().toISOString().split('T')[0],
      weights: [{ date: new Date().toLocaleDateString('th-TH'), weight: currentWeight }],
      usageStats: {
        logins: 1,
        mealLogsCount: 0,
        exerciseLogsCount: 0,
        lastLogin: new Date().toISOString(),
      },
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setForm({ name: '', email: '', password: '', age: '28', gender: 'female', currentWeight: '75', targetWeight: '65' });
    setVerificationStep(null);
    setOtpCode('');
    setSentOtpCode('');
    setActiveTab('home');
  };

  const handleLogin = () => {
    const email = form.email.trim();
    const password = form.password.trim();
    const user = users.find((item) => item.email === email && item.password === password);
    if (!user) { alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); return; }
    
    if (!user.emailVerified) {
      alert('กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ');
      return;
    }
    
    // Update login stats
    const updatedUser = {
      ...user,
      usageStats: {
        ...user.usageStats,
        logins: (user.usageStats?.logins || 0) + 1,
        lastLogin: new Date().toISOString(),
      },
    };
    
    setCurrentUser(updatedUser);
    setUsers(users.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
    setForm({ name: '', email: '', password: '', age: '28', gender: 'female', currentWeight: '75', targetWeight: '65' });
    setActiveTab('home');
  };

  const logout = () => { setCurrentUser(null); setActiveTab('home'); };

  const updateUser = (updates) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsers(users.map((item) => (item.id === updated.id ? updated : item)));
  };

  const addZwiftActivity = (activityData) => {
    if (!currentUser) return;
    const activity = {
      id: `zwift-${Date.now()}`,
      date: new Date().toLocaleDateString('th-TH'),
      time: new Date().toLocaleTimeString('th-TH'),
      deviceName: activityData.deviceName || 'ลู่วิ่งแบบมาตรฐาน',
      duration: activityData.duration || 0, // นาที
      distance: activityData.distance || 0, // กม.
      calories: activityData.calories || 0,
      averageHeartRate: activityData.averageHeartRate || 0,
      activityType: activityData.activityType || 'วิ่ง',
    };
    const updatedActivities = [...(currentUser.zwiftActivities || []), activity];
    const stats = currentUser.usageStats || {};
    stats.exerciseLogsCount = (stats.exerciseLogsCount || 0) + 1;
    updateUser({ zwiftActivities: updatedActivities, usageStats: stats });
    return activity;
  };

  const addAppleHealthData = (healthData) => {
    if (!currentUser) return;
    const entry = {
      id: `health-${Date.now()}`,
      date: new Date().toLocaleDateString('th-TH'),
      time: new Date().toLocaleTimeString('th-TH'),
      dataType: healthData.dataType || 'ก้าวเดิน',
      value: healthData.value || 0,
      unit: healthData.unit || 'ก้าว',
    };
    const updatedHealthData = [...(currentUser.appleHealthData || []), entry];
    updateUser({ appleHealthData: updatedHealthData });
    return entry;
  };

  const addWeight = (weight) => {
    if (!currentUser) return;
    const today = new Date().toLocaleDateString('th-TH');
    updateUser({ weights: [...currentUser.weights, { date: today, weight }], currentWeight: weight });
  };

  const detectDishFromText = (text) => {
    const query = (text || '').toLowerCase();
    if (!query) return 'อาหารทั่วไป';
    if (query.includes('ข้าวมันไก่')) return 'ข้าวมันไก่';
    if (query.includes('ข้าวผัด')) return 'ข้าวผัด';
    if (query.includes('ข้าวสวย') || query.includes('rice') || query.includes('ข้าว')) return 'ข้าวสวย';
    if (query.includes('ไข่ต้ม') || query.includes('egg')) return 'ไข่ต้ม';
    if (query.includes('ไข่ดาว') || query.includes('ไข่เจียว')) return 'ไข่ดาว';
    if (query.includes('สลัด') || query.includes('salad')) return 'สลัดผัก';
    if (query.includes('อกไก่') || query.includes('ไก่อบ') || query.includes('ไก่ย่าง') || query.includes('chicken')) return 'อกไก่ย่าง';
    if (query.includes('ปลาอบ') || query.includes('fish')) return 'ปลาอบ';
    if (query.includes('ก๋วยเตี๋ยว')) return 'ก๋วยเตี๋ยว';
    if (query.includes('สปาเก็ตตี้') || query.includes('พาสต้า')) return 'สปาเก็ตตี้';
    if (query.includes('เต้าหู้') || query.includes('tofu')) return 'เต้าหู้';
    if (query.includes('เค้ก') || query.includes('cake') || query.includes('ขนม')) return 'ขนมหวาน';
    if (query.includes('แกง')) return 'แกงถั่ว/แกงจืด';
    if (query.includes('ผัด')) return 'ผัดผัก';
    return 'อาหารทั่วไป';
  };

  const USE_GOOGLE_VISION = import.meta.env.VITE_USE_GOOGLE_VISION === 'true' && Boolean(import.meta.env.VITE_GOOGLE_VISION_API_KEY);

  const analyzeWithGoogleVision = async (imageData) => {
    const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
    if (!apiKey) return null;
    const base64 = imageData.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const body = {
      requests: [
        {
          image: { content: base64 },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'WEB_DETECTION', maxResults: 5 },
          ],
        },
      ],
    };

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`Google Vision API error ${response.status}`);
    const json = await response.json();
    const result = json.responses?.[0] || {};
    const labels = (result.labelAnnotations || []).map((item) => item.description).join(' ');
    const webEntities = (result.webDetection?.webEntities || []).map((item) => item.description).join(' ');
    const dish = detectDishFromLabel(`${labels} ${webEntities}`);
    const confidence = Math.round((result.labelAnnotations?.[0]?.score || 0) * 100);
    return { labels, dish, confidence, raw: result };
  };

  const estimateMacrosFromDish = (dish) => {
    const text = (dish || '').toLowerCase();
    if (!text) return { calories: 120, protein: 5, carbs: 20, fat: 4 };
    if (text.includes('ข้าวมันไก่')) return { calories: 400, protein: 18, carbs: 48, fat: 10 };
    if (text.includes('ข้าวผัด') || (text.includes('ข้าว') && text.includes('ผัด'))) return { calories: 320, protein: 8, carbs: 45, fat: 10 };
    if (text.includes('ผัดไทย')) return { calories: 350, protein: 12, carbs: 50, fat: 11 };
    if (text.includes('สลัด') || text.includes('ผักสด')) return { calories: 130, protein: 6, carbs: 10, fat: 8 };
    if (text.includes('อกไก่') || text.includes('ไก่อบ') || text.includes('ไก่ย่าง')) return { calories: 150, protein: 31, carbs: 0, fat: 3.6 };
    if (text.includes('ข้าวสวย') || (text.includes('rice') && !text.includes('fried'))) return { calories: 80, protein: 2, carbs: 18, fat: 0.2 };
    if (text.includes('ซูชิ') || text.includes('sushi')) return { calories: 200, protein: 10, carbs: 30, fat: 5 };
    if (text.includes('พิซซ่า') || text.includes('pizza')) return { calories: 285, protein: 12, carbs: 34, fat: 11 };
    if (text.includes('เบอร์เกอร์') || text.includes('burger')) return { calories: 320, protein: 15, carbs: 35, fat: 15 };
    if (text.includes('แซนวิช') || text.includes('sandwich')) return { calories: 260, protein: 12, carbs: 30, fat: 10 };
    if (text.includes('ฮอทดอก') || text.includes('hot dog') || text.includes('hotdog')) return { calories: 280, protein: 10, carbs: 30, fat: 14 };
    if (text.includes('สเต๊ก') || text.includes('steak')) return { calories: 320, protein: 28, carbs: 6, fat: 18 };
    if (text.includes('พาสต้า') || text.includes('spaghetti') || text.includes('pasta')) return { calories: 340, protein: 12, carbs: 49, fat: 10 };
    if (text.includes('ก๋วยเตี๋ยว') || text.includes('noodle')) return { calories: 300, protein: 12, carbs: 45, fat: 7 };
    if (text.includes('เต้าหู้') || text.includes('tofu')) return { calories: 100, protein: 9, carbs: 2, fat: 5 };
    if (text.includes('ไข่ต้ม')) return { calories: 78, protein: 6, carbs: 1, fat: 5 };
    if (text.includes('ไข่') && !text.includes('ข้าว')) return { calories: 90, protein: 7, carbs: 1, fat: 6 };
    if (text.includes('แกง') || text.includes('soup') || text.includes('ต้ม')) return { calories: 220, protein: 10, carbs: 18, fat: 10 };
    if (text.includes('เค้ก') || text.includes('ไอศกรีม') || text.includes('ขนม') || text.includes('dessert')) return { calories: 280, protein: 4, carbs: 35, fat: 12 };
    return { calories: 200, protein: 8, carbs: 25, fat: 7 };
  };

  const createYouTubeSearchLink = (query) => {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  };

  const extractSearchQuery = (message) => {
    const text = message.toLowerCase();
    const urlMatch = text.match(/https?:\/\/[^\r\n\s]+/i);
    if (urlMatch) {
      const cleaned = urlMatch[0]
        .replace(/https?:\/\/(www\.)?/i, '')
        .replace(/[^a-zA-Z0-9ก-\s]/g, ' ')
        .trim();
      const parts = cleaned.split(/\s+/).filter(Boolean);
      return parts.slice(0, 6).join(' ') || 'ออกกำลังกาย';
    }
    const cleaned = text.replace(/[^a-zA-Z0-9ก-๙\s]/g, ' ').trim();
    return cleaned || 'ออกกำลังกาย';
  };

  const getTrainerResponse = (message) => {
    const text = message.toLowerCase();
    const wantsVideo = /https?:\/\//i.test(text) || text.includes('youtube') || text.includes('คลิป') || text.includes('วิดีโอ') || text.includes('ค้นหา') || text.includes('ดู');
    if (wantsVideo) {
      const query = extractSearchQuery(message);
      return `ผมค้นหาคลิปให้ใน YouTube แล้วครับ ดูได้ที่นี่: ${createYouTubeSearchLink(query)}`;
    }
    if (text.includes('สวัสดี') || text.includes('หวัดดี') || text.includes('hi') || text.includes('hello')) {
      return `สวัสดี ${currentUser?.name || 'ครับ'}! ยินดีช่วยวางแผนอาหารและออกกำลังกายให้ครับ`;
    }
    if (text.includes('น้ำหนัก') || text.includes('ลด') || text.includes('ผอม')) {
      return 'ถ้าต้องการลดน้ำหนักให้เริ่มจากควบคุมปริมาณคาร์โบไฮเดรต เติมโปรตีน และออกกำลังกายแบบคาร์ดิโอสลับเวทครับ';
    }
    if (text.includes('อาหาร') || text.includes('มื้อ') || text.includes('เมนู')) {
      return 'ลองแบ่งมื้ออาหารเป็น 3 มื้อหลัก + 1-2 มื้อว่าง เน้นผักโปรตีนลีน และเลือกไขมันดี เช่น อะโวคาโด น้ำมันมะกอก';
    }
    if (text.includes('ออกกำลังกาย') || text.includes('คาร์ดิโอ') || text.includes('เวท')) {
      return 'แนะนำออกกำลังกาย 3-4 ครั้งต่อสัปดาห์ โดยผสมคาร์ดิโอและเวทเทรนนิ่ง จะได้ทั้งเผาผลาญและเสริมกล้ามเนื้อครับ';
    }
    if (text.includes('นอน') || text.includes('พักผ่อน') || text.includes('เหนื่อย')) {
      return 'นอนให้ได้อย่างน้อย 7-8 ชั่วโมงต่อคืน เพราะการพักผ่อนช่วยให้ระบบเมตาบอลิซึมและการฟื้นตัวดีขึ้นครับ';
    }
    if (text.includes('ข้าวสวย')) {
      return 'ข้าวสวย 1 ทัพพีให้พลังงานประมาณ 80 kcal โดยมีคาร์โบไฮเดรตประมาณ 18 กรัม โปรตีน 2 กรัม และไขมัน 0.2 กรัมครับ';
    }
    return 'ผมช่วยได้ทั้งเรื่องเมนูอาหาร ตารางออกกำลังกาย และเคล็ดลับสุขภาพ ลองถามมาได้เลยครับ';
  };

  const sendMessage = () => {
    if (!currentUser || !messageText.trim() || isTyping) return;
    const text = messageText.trim();
    const userMsg = { role: 'user', text, time: new Date().toLocaleTimeString('th-TH') };
    const nextHistory = [...(currentUser.chatHistory || []), userMsg];
    updateUser({ chatHistory: nextHistory });
    setMessageText('');
    setIsTyping(true);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      const aiMsg = { role: 'ai', text: getTrainerResponse(text), time: new Date().toLocaleTimeString('th-TH') };
      updateUser({ chatHistory: [...nextHistory, aiMsg] });
      setIsTyping(false);
      typingTimeout.current = null;
    }, 1200);
  };

  const addMealEntry = (entry) => {
    if (!currentUser) return;
    const now = new Date();
    const macros = estimateMacrosFromDish(entry.dish);
    const mealEntry = {
      id: `${Date.now()}`,
      date: now.toLocaleDateString('th-TH'),
      time: now.toLocaleTimeString('th-TH'),
      dish: entry.dish,
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      mealType: entry.mealType,
      // Do NOT persist uploaded image — clear immediately after analysis/save
      image: null,
    };
    const stats = currentUser.usageStats || {};
    stats.mealLogsCount = (stats.mealLogsCount || 0) + 1;
    updateUser({ mealLog: [...(currentUser.mealLog || []), mealEntry], usageStats: stats });
  };

  const selectCourse = (courseId) => {
    if (currentUser?.selectedCourse) return;
    const course = COURSE_PLANS.find((item) => item.id === courseId);
    if (!course) return;
    if (course.premium) {
      setPendingPremiumCourse(course);
      setPendingExerciseSchedule(course.exerciseSchedule.map((item) => ({ ...item })));
      return;
    }
    updateUser({ selectedCourse: courseId });
    setActiveTab('home');
  };

  const savePremiumCourseSelection = () => {
    if (!pendingPremiumCourse || !currentUser) return;
    updateUser({
      selectedCourse: pendingPremiumCourse.id,
      customExerciseSchedule: pendingExerciseSchedule,
    });
    setPendingPremiumCourse(null);
    setPendingExerciseSchedule([]);
    setActiveTab('home');
  };

  const cancelPremiumCourseSelection = () => {
    setPendingPremiumCourse(null);
    setPendingExerciseSchedule([]);
  };

  // Analyze image via external API if configured, otherwise fallback to filename-based detection
  const detectDishFromPredictions = (predictions) => {
    if (!predictions || predictions.length === 0) return 'อาหารทั่วไป';
    const allLabels = predictions.map((pred) => pred.className || '').join(' ');
    const dishFromLabels = detectDishFromLabel(allLabels);
    if (dishFromLabels && dishFromLabels !== 'อาหารทั่วไป') return dishFromLabels;
    const topLabel = predictions[0]?.className || '';
    return detectDishFromLabel(topLabel) || topLabel || 'อาหารทั่วไป';
  };

  const analyzeImage = async (imageData, fileName) => {
    const apiUrl = import.meta.env.VITE_IMAGE_API_URL;
    const apiKey = import.meta.env.VITE_IMAGE_API_KEY;
    if (USE_GOOGLE_VISION) {
      try {
        const visionResult = await analyzeWithGoogleVision(imageData);
        if (visionResult?.dish) {
          const macros = estimateMacrosFromDish(visionResult.dish);
          return {
            dish: visionResult.dish,
            calories: macros.calories,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            confidence: visionResult.confidence || 75,
            similar: [],
          };
        }
      } catch (e) {
        console.warn('Google Vision failed', e);
      }
    }

    if (apiUrl) {
      try {
        const resp = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({ image: imageData, filename: fileName }),
        });
        if (!resp.ok) throw new Error('API failed');
        const json = await resp.json();
        const dishName = json.dish || detectDishFromText(fileName) || 'อาหารทั่วไป';
        const macros = estimateMacrosFromDish(dishName);
        return {
          dish: dishName,
          calories: json.calories ?? macros.calories,
          protein: json.protein ?? macros.protein,
          carbs: json.carbs ?? macros.carbs,
          fat: json.fat ?? macros.fat,
          confidence: json.confidence ?? 70,
          similar: json.similar || [],
        };
      } catch (e) {
        const dish = detectDishFromText(fileName);
        return { ...estimateMacrosFromDish(dish), dish, confidence: 60, similar: [] };
      }
    }

    if (tfModel) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageData;
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
        const predictions = await tfModel.classify(img);
        if (predictions && predictions.length > 0) {
          const dish = detectDishFromPredictions(predictions);
          const macros = estimateMacrosFromDish(dish);
          return {
            dish,
            calories: macros.calories,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            confidence: Math.round(((predictions[0]?.probability || 0) * 100)),
            similar: [],
          };
        }
      } catch (e) {
        console.warn('tf classify failed', e);
      }
    }
    const dish = detectDishFromText(fileName);
    return { ...estimateMacrosFromDish(dish), dish, confidence: 50, similar: [] };
  };
 

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = reader.result;
      // analyze but DO NOT save automatically — show temporary analysis with Save/Discard
      setUploadedImage(imageData);
      setImageFeedback({ analyzing: true });
      const analysis = await analyzeImage(imageData, file.name);
      setImageFeedback(analysis);
    };
    reader.readAsDataURL(file);
  };

  const saveAnalysis = (mealTypeOverride) => {
    if (!imageFeedback || !imageFeedback.dish) return;
    const now = new Date();
    const hour = now.getHours();
    const mealType = mealTypeOverride || analysisMealType || (hour < 10 ? 'เช้า' : hour < 15 ? 'กลางวัน' : 'เย็น');
    addMealEntry({ dish: imageFeedback.dish, mealType });
    setUploadedImage(null);
    setImageFeedback(null);
    setAnalysisMealType('');
  };

  const discardAnalysis = () => {
    setUploadedImage(null);
    setImageFeedback(null);
    setAnalysisMealType('');
  }; 

  if (!currentUser) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-header">
            <div>
              <p className="eyebrow">Health Trainer</p>
              {verificationStep === 'otp' ? (
                <h1>ยืนยันอีเมล</h1>
              ) : (
                <h1>{authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h1>
              )}
              <p>{verificationStep === 'otp' ? 'กรุณากรอก OTP ที่ส่งไปยังอีเมลของคุณ' : 'เริ่มต้นดูแลสุขภาพของคุณง่าย ๆ วันนี้'}</p>
            </div>
            {verificationStep !== 'otp' && (
              <div className="auth-switch">
                <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>เข้าสู่ระบบ</button>
                <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>สมัครสมาชิก</button>
              </div>
            )}
          </div>

          {verificationStep === 'otp' ? (
            <div className="auth-form">
              <label>OTP Code
                <input 
                  type="text" 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value)} 
                  placeholder="กรอก 6 หลัก" 
                  maxLength="6"
                />
              </label>
            </div>
          ) : (
            <div className="auth-form">
              {authMode === 'register' && (
                <>
                  <label>ชื่อ<input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ชื่อของคุณ" /></label>
                  <label>อายุ<input type="number" min="12" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="อายุ" /></label>
                  <label>เพศ
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                      <option value="female">หญิง</option>
                      <option value="male">ชาย</option>
                      <option value="other">อื่น ๆ</option>
                    </select>
                  </label>
                  <label>น้ำหนักตัวปัจจุบัน (กก.)<input type="number" min="30" value={form.currentWeight} onChange={(e) => setForm({ ...form, currentWeight: e.target.value })} placeholder="เช่น 75" /></label>
                  <label>น้ำหนักเป้าหมาย (กก.)<input type="number" min="1" value={form.targetWeight} onChange={(e) => setForm({ ...form, targetWeight: e.target.value })} placeholder="เช่น 65" /></label>
                </>
              )}
              <label>อีเมล (Gmail เท่านั้น)<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@gmail.com" /></label>
              <label>รหัสผ่าน<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="รหัสผ่าน" /></label>
            </div>
          )}

          {verificationStep === 'otp' ? (
            <button type="button" className="button primary" onClick={handleVerifyOtp}>ยืนยัน OTP</button>
          ) : (
            <button type="button" className="button primary" onClick={authMode === 'login' ? handleLogin : handleRegister}>{authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</button>
          )}

          {verificationStep !== 'otp' && (
            <p className="auth-note">
              {authMode === 'login' ? 'ยังไม่มีบัญชี?' : 'มีบัญชีแล้ว?'}{' '}
              <button type="button" className="text-link" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</button>
            </p>
          )}

          {verificationStep === 'otp' && (
            <p className="auth-note">
              <button type="button" className="text-link" onClick={() => { setVerificationStep(null); setOtpCode(''); setSentOtpCode(''); }}>ย้อนกลับ</button>
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentWeight = currentUser.weights?.[currentUser.weights.length - 1]?.weight || currentUser.currentWeight;
  const selectedCourse = COURSE_PLANS.find((course) => course.id === currentUser.selectedCourse);
  const selectedCourseWithSchedule = selectedCourse
    ? { ...selectedCourse, exerciseSchedule: currentUser.customExerciseSchedule || selectedCourse.exerciseSchedule }
    : null;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${showSidebar ? '' : 'collapsed'}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-icon"><Activity size={22} /></div>
            {showSidebar && (<div><p className="brand-label">Health Trainer</p><p className="brand-subtitle">ดูแลสุขภาพง่าย ๆ</p></div>)}
          </div>
          <button type="button" className="icon-button" onClick={() => setShowSidebar(!showSidebar)}>{showSidebar ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
        <nav className="nav-list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button type="button" key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
                <Icon size={18} />
                {showSidebar && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <button type="button" className="logout" onClick={logout}><LogOut size={18} />{showSidebar && <span>ออกจากระบบ</span>}</button>
      </aside>
      <main className="content">
        <div className="page-header">
          <div>
            <p className="header-badge"><Star size={16} /> สวัสดี {currentUser.name || 'ผู้ใช้งาน'}</p>
            <h1>ยินดีต้อนรับสู่ Health Trainer</h1>
            <p>ติดตามอาหาร ออกกำลังกาย และความก้าวหน้าในที่เดียว</p>
          </div>
          <div className="stat-pill"><span><strong>{currentWeight} กก.</strong></span></div>
        </div>
        {activeTab === 'home' ? (
          currentUser.selectedCourse ? (
            <HomeTab currentUser={currentUser} selectedCourse={selectedCourseWithSchedule} mealLog={currentUser.mealLog || []} />
          ) : pendingPremiumCourse ? (
            <PremiumScheduleSetup
              course={pendingPremiumCourse}
              schedule={pendingExerciseSchedule}
              setSchedule={setPendingExerciseSchedule}
              onSave={savePremiumCourseSelection}
              onCancel={cancelPremiumCourseSelection}
            />
          ) : (
            <CourseSelectionGate onSelectCourse={selectCourse} />
          )
        ) : activeTab === 'meals' ? (
          <MealsTab
            recipes={RECIPES}
            selectedRecipe={selectedRecipe}
            setSelectedRecipe={setSelectedRecipe}
            uploadedImage={uploadedImage}
            imageFeedback={imageFeedback}
            onImageUpload={handleImageUpload}
            onAddMeal={addMealEntry}
            saveAnalysis={saveAnalysis}
            discardAnalysis={discardAnalysis}
            selectedCourse={selectedCourseWithSchedule}
            mealLog={currentUser.mealLog || []}
            analysisMealType={analysisMealType}
            setAnalysisMealType={setAnalysisMealType}
            modelLoading={modelLoading}
          />
        ) : activeTab === 'exercise' ? (
          <ExerciseTab exercises={EXERCISES} selectedCourse={selectedCourseWithSchedule} />
        ) : activeTab === 'progress' ? (
          <ProgressTab user={currentUser} currentWeight={currentWeight} addWeight={addWeight} />
        ) : activeTab === 'chat' ? (
          <ChatTab chatHistory={currentUser.chatHistory || []} messageText={messageText} setMessageText={setMessageText} onSend={sendMessage} isTyping={isTyping} />
        ) : activeTab === 'settings' ? (
          <SettingsTab user={currentUser} addZwiftActivity={addZwiftActivity} addAppleHealthData={addAppleHealthData} />
        ) : null}
      </main>
    </div>
  );
}

function CourseSelectionGate({ onSelectCourse }) {
  return (
    <div className="course-selection-shell card">
      <div className="card-head"><Calendar size={20} /><h2>เลือกคอร์สก่อนเข้าใช้งาน</h2></div>
      <p>กรุณาเลือกคอร์สแรกก่อนเพื่อให้ระบบแสดงแผนอาหารและตารางออกกำลังกายที่เหมาะสม</p>
      <div className="course-selection-list">
        {COURSE_PLANS.map((course) => (
          <div key={course.id} className={`course-selection-card ${course.premium ? 'course-selection-card-premium' : ''}`}>
            {course.premium && <div className="course-premium-badge">PREMIUM</div>}
            <div className="course-selection-header"><strong>{course.name}</strong><span>{course.duration}</span></div>
            <p>{course.details}</p>
            <div className="course-selection-meta">
              <span>เป้าหมาย {course.goal}</span>
              <span>ระดับ {course.difficulty}</span>
            </div>
            <button type="button" className="button primary" onClick={() => onSelectCourse(course.id)}>เลือกคอร์สนี้</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PremiumScheduleSetup({ course, schedule, setSchedule, onSave, onCancel }) {
  return (
    <div className="course-selection-shell card">
      <div className="card-head"><Dumbbell size={20} /><h2>ปรับเวลาออกกำลังกาย</h2></div>
      <p>คอร์ส {course.name} เป็นคอร์สพรีเมี่ยม คุณสามารถปรับเวลาออกกำลังกายก่อนเข้าใช้งานได้</p>
      <div className="premium-schedule-editor">
        {schedule.map((item, index) => (
          <div key={`${item.activity}-${index}`} className="premium-schedule-row">
            <div className="schedule-detail">
              <strong>{item.activity}</strong>
            </div>
            <input
              type="time"
              className="time-input"
              value={item.time}
              onChange={(e) => {
                const next = [...schedule];
                next[index] = { ...next[index], time: e.target.value };
                setSchedule(next);
              }}
            />
          </div>
        ))}
      </div>
      <div className="editor-actions">
        <button type="button" className="button secondary" onClick={onCancel}>ย้อนกลับ</button>
        <button type="button" className="button primary" onClick={onSave}>บันทึกและเข้าสู่หน้าแรก</button>
      </div>
    </div>
  );
}

function HomeTab({ currentUser, selectedCourse, mealLog }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const mealHistory = mealLog || [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const monthLabel = today.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
  const monthDaysCount = today.getDate();

  const parseThaiDate = (dateString) => {
    const parts = dateString.split('/').map((item) => Number(item));
    if (parts.length < 3) return null;
    const [d, m, y] = parts;
    return new Date(y, m - 1, d);
  };

  const dayMap = mealHistory.reduce((acc, entry) => {
    const parsed = parseThaiDate(entry.date);
    if (!parsed || parsed.getFullYear() !== currentYear || parsed.getMonth() !== currentMonth) return acc;
    if (!acc[entry.date]) acc[entry.date] = { entries: [], calories: 0 };
    acc[entry.date].entries.push(entry);
    acc[entry.date].calories += entry.calories || 0;
    return acc;
  }, {});

  const monthDays = Array.from({ length: monthDaysCount }, (_, index) => {
    const date = new Date(currentYear, currentMonth, index + 1);
    const dateKey = date.toLocaleDateString('th-TH');
    const dayLabel = date.toLocaleDateString('th-TH', { weekday: 'short' });
    return {
      date: dateKey,
      dayLabel,
      displayDate: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      entries: dayMap[dateKey]?.entries || [],
      calories: dayMap[dateKey]?.calories || 0,
    };
  });

  useEffect(() => {
    if (!selectedDate && monthDays.length > 0) {
      setSelectedDate(monthDays[monthDays.length - 1]?.date);
    }
  }, [monthDays, selectedDate, monthDaysCount]);

  const selectedDay = monthDays.find((item) => item.date === selectedDate) || monthDays[monthDays.length - 1] || null;
  const dailyLimit = getCourseCalorieLimit(selectedCourse);
  const selectedDayLabel = selectedDay ? `${selectedDay.dayLabel} ${selectedDay.displayDate}` : '';
  const todayCalories = selectedDay ? selectedDay.calories : 0;
  const percentUsed = selectedDay ? Math.min(100, Math.round((todayCalories / dailyLimit) * 100)) : 0;
  const isOver = todayCalories > dailyLimit;

  return (
    <div className="grid-layout">
      <section className="welcome-card card">
        <div className="card-head"><Calendar size={20} /><h2>ภาพรวม</h2></div>
        <p>คุณกำลังตั้งเป้าน้ำหนักจาก {currentUser.currentWeight} กก. ไป {currentUser.targetWeight} กก.</p>
        {selectedCourse ? (
          <>
            {selectedCourse.premium && (
              <div className="premium-course-banner">
                <strong>Premium</strong> — ติดตามอาหารและออกกำลังกายตามนี้เท่านั้น เพื่อเป้าหมายลด 30 กก. ใน 3 เดือน
              </div>
            )}
            <div className="header-info">
              <div><p>แผนที่เลือก</p><strong>{selectedCourse.name}</strong></div>
              <div><p>ระยะเวลา</p><strong>{selectedCourse.duration}</strong></div>
              <div><p>เป้าหมาย</p><strong>{selectedCourse.goal}</strong></div>
              <div><p>น้ำหนักที่คาดหวัง</p><strong>{selectedCourse.weightTarget} กก.</strong></div>
              <div><p>ระดับความยาก</p><strong>{selectedCourse.difficulty}</strong></div>
            </div>
          </>
        ) : (
          <p className="empty-state">ยังไม่ได้เลือกแผนการฝึก สามารถเลือกได้ในหน้าสมัครสมาชิกเท่านั้น</p>
        )}
      </section>

      <section className="food-schedule-card card">
        <div className="card-head"><Flame size={20} /><h2>ตารางอาหาร</h2></div>
        <div className="schedule-list">
          {selectedCourse.mealSchedule.map((item) => (
            <div key={`${item.time}-${item.menu}`} className="schedule-item">
              <div className="schedule-time">{item.time}</div>
              <div className="schedule-detail">{item.menu}</div>
            </div>
          ))}
        </div>
        <div className="food-chips">
          <h3>อาหารแนะนำ</h3>
          <div className="tags">
            {selectedCourse.recommendedFoods.map((food) => (<span key={food} className="tag">{food}</span>))}
          </div>
        </div>
      </section>

      <section className="exercise-schedule-card card">
        <div className="card-head"><Dumbbell size={20} /><h2>ตารางออกกำลังกาย</h2></div>
        <div className="schedule-list">
          {selectedCourse.exerciseSchedule.map((item) => (
            <div key={`${item.time}-${item.activity}`} className="schedule-item">
              <div className="schedule-time">{item.time}</div>
              <div className="schedule-detail">{item.activity}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="meal-history-card card">
        <div className="card-head"><Flame size={20} /><h2>ประวัติการกิน {monthLabel}</h2></div>
        <div className="history-panel">
          <div className="history-list">
            <div className="history-list-header">
              <span>วันที่</span>
              <span>สถานะ</span>
              <span>แคลอรี่</span>
            </div>
            {monthDays.map((day) => (
              <button
                key={day.date}
                type="button"
                className={`history-day-item ${day.date === selectedDate ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDate(day.date);
                  setDetailsOpen(true);
                }}
              >
                <div className="history-date">
                  <strong>{day.displayDate}</strong>
                  <span>{day.dayLabel}</span>
                </div>
                <span className={`history-status ${day.calories > dailyLimit ? 'over' : 'ok'}`}>
                  {day.calories > dailyLimit ? 'เกิน' : 'ปกติ'}
                </span>
                <span className="history-cal">{day.calories} kcal</span>
              </button>
            ))}
          </div>

          <div className="history-graph">
            <div className="pie-ring" style={{ background: `conic-gradient(var(--primary) 0deg ${percentUsed}%, rgba(249,250,251,1) ${percentUsed}% 360deg)` }}>
              <div className="pie-center">
                <strong>{percentUsed}%</strong>
                <span>{isOver ? 'เกินเป้า' : 'ในเป้า'}</span>
              </div>
            </div>
            <div className="history-summary">
              <p>แคลอรี่วันนี้: <strong>{todayCalories}</strong> kcal</p>
              <p>จำกัดเป้า: <strong>{dailyLimit}</strong> kcal</p>
              <p>มื้อวันนี้: <strong>{selectedDay?.entries.length || 0}</strong></p>
              <p>สถานะ: <strong>{isOver ? 'เกินเป้า' : 'ไม่เกินเป้า'}</strong></p>
            </div>
          </div>
        </div>
      </section>

      {detailsOpen && selectedDay && (
        <div className="detail-modal-overlay" onClick={() => setDetailsOpen(false)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div>
                <p className="detail-modal-label">รายละเอียดอาหาร</p>
                <h3>{selectedDayLabel}</h3>
              </div>
              <button type="button" className="icon-button detail-modal-close" onClick={() => setDetailsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="detail-modal-body">
              {selectedDay.entries.length === 0 ? (
                <p className="empty-state">ไม่มีบันทึกมื้ออาหารในวันที่เลือก</p>
              ) : (
                selectedDay.entries.map((entry) => (
                  <div key={entry.id} className="meal-detail-item">
                    <div>
                      <strong>{entry.dish}</strong>
                      <p>{entry.mealType} • {entry.time}</p>
                    </div>
                    <span>{entry.calories} kcal</span>
                  </div>
                ))
              )}
            </div>
            <div className="detail-modal-footer">
              <button type="button" className="button secondary" onClick={() => setDetailsOpen(false)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MealsTab({ recipes, selectedRecipe, setSelectedRecipe, uploadedImage, imageFeedback, onImageUpload, onAddMeal, saveAnalysis, discardAnalysis, selectedCourse, mealLog, analysisMealType, setAnalysisMealType, modelLoading }) {
  const [newDish, setNewDish] = useState('');
  const [newMealType, setNewMealType] = useState('เช้า');

  const recipe = recipes.find((item) => item.id === selectedRecipe);
  const today = new Date().toLocaleDateString('th-TH');
  const todayMeals = mealLog.filter((entry) => entry.date === today);
  const totalCalories = todayMeals.reduce((sum, entry) => sum + (entry.calories || 0), 0);
  const totalProtein = todayMeals.reduce((sum, entry) => sum + (entry.protein || 0), 0);
  const totalCarbs = todayMeals.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
  const totalFat = todayMeals.reduce((sum, entry) => sum + (entry.fat || 0), 0);
  const dailyLimit = getCourseCalorieLimit(selectedCourse);
  const splitMeals = selectedCourse ? groupMealsByType(selectedCourse.mealSchedule) : null;

  const mealCards = selectedCourse ? [
    { label: 'เช้า', items: splitMeals.breakfast },
    { label: 'กลางวัน', items: splitMeals.lunch },
    { label: 'เย็น', items: splitMeals.dinner },
  ] : [];

  const handleAddMeal = () => {
    if (!newDish.trim()) return;
    onAddMeal({ dish: newDish.trim(), mealType: newMealType });
    setNewDish('');
    setNewMealType('เช้า');
  };

  return (
    <div className="grid-layout">
      <section className="nutrition-card card">
        <div className="card-head"><Flame size={20} /><h2>เมนูสุขภาพ</h2></div>
        <div className="recipe-list">
          {recipes.map((item) => (
            <button key={item.id} type="button" className={`recipe-item ${selectedRecipe === item.id ? 'active' : ''}`} onClick={() => setSelectedRecipe(item.id)}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
              <span>{item.calories} kcal</span>
            </button>
          ))}
        </div>
      </section>

      <section className="meal-plan-card card">
        <div className="card-head"><Calendar size={20} /><h2>{selectedCourse ? `แผนอาหาร ${selectedCourse.name}` : 'แผนอาหารประจำสัปดาห์'}</h2></div>
        {selectedCourse ? (
          <div className="meal-summary-grid">
            {mealCards.map((block) => (
              <div key={block.label} className="meal-summary-block">
                <div className="meal-summary-header"><strong>{block.label}</strong></div>
                <div className="meal-summary-items">
                  {block.items.map((item) => (
                    <div key={`${item.time}-${item.menu}`} className="meal-summary-line">
                      <span>{item.time}</span>
                      <span>{item.menu}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="weekly-meal-grid">
            {MEAL_PLAN.map((item) => (
              <div key={item.day} className="weekly-meal-card">
                <div className="weekly-meal-header"><strong>{item.day}</strong></div>
                <div className="weekly-meal-row"><span>เช้า</span><span>{item.breakfast}</span></div>
                <div className="weekly-meal-row"><span>กลางวัน</span><span>{item.lunch}</span></div>
                <div className="weekly-meal-row"><span>เย็น</span><span>{item.dinner}</span></div>
              </div>
            ))}
          </div>
        )}
        {selectedCourse && (
          <div className="food-chips">
            <h3>อาหารแนะนำ</h3>
            <div className="tags">
              {selectedCourse.recommendedFoods.map((food) => (<span key={food} className="tag">{food}</span>))}
            </div>
          </div>
        )}
      </section>

      <section className="calorie-summary-card card">
        <div className="card-head"><BarChart3 size={20} /><h2>สรุปแคลอรี่รายวัน</h2></div>
        <p>กินไม่เกินนี้ต่อวัน: <strong>{dailyLimit}</strong> kcal</p>
        <div className="calorie-bar"><div className="calorie-fill" style={{ width: `${Math.min(100, (totalCalories / dailyLimit) * 100)}%` }} /></div>
        <div className="calorie-meta"><span>{totalCalories} kcal</span><span>{dailyLimit} kcal</span></div>
        <div className="macro-summary">
          <span>โปรตีน {totalProtein.toFixed(1)} กรัม</span>
          <span>คาร์โบไฮเดรต {totalCarbs.toFixed(1)} กรัม</span>
          <span>ไขมัน {totalFat.toFixed(1)} กรัม</span>
        </div>
        {totalCalories > dailyLimit && <p className="warning">คุณเกินเกณฑ์แล้ว ลองปรับมื้อเย็นให้เบาลง</p>}
      </section>

      <section className="meal-log-card card">
        <div className="card-head"><CheckCircle2 size={20} /><h2>บันทึกแคลอรี่วันนี้</h2></div>
        <p>รวมแคลอรี่วันนี้: <strong>{totalCalories}</strong> kcal</p>
        <div className="meal-log-form">
          <label>ชื่ออาหาร<input type="text" value={newDish} onChange={(e) => setNewDish(e.target.value)} placeholder="เช่น ข้าวกล้องผัดผัก" /></label>
          <label>มื้ออาหาร
            <select value={newMealType} onChange={(e) => setNewMealType(e.target.value)}>
              <option value="เช้า">เช้า</option>
              <option value="กลางวัน">กลางวัน</option>
              <option value="เย็น">เย็น</option>
              <option value="ว่าง">ว่าง</option>
            </select>
          </label>
          <button type="button" className="button primary" onClick={handleAddMeal}>AI คำนวณแคลอรี่ให้</button>
        </div>
        {todayMeals.length > 0 ? (
          <div className="meal-log-list">
            {todayMeals.map((entry) => (
              <div key={entry.id} className="meal-log-item">
                <div>
                  <strong>{entry.dish}</strong>
                  <span>{entry.mealType} - {entry.time}</span>
                  <div className="meal-log-details">
                    <span>{entry.calories} kcal</span>
                    <span>โปรตีน {entry.protein || 0} กรัม</span>
                    <span>คาร์บ์ {entry.carbs || 0} กรัม</span>
                    <span>ไขมัน {entry.fat || 0} กรัม</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">ยังไม่มีบันทึกมื้อวันนี้ ลองอัพโหลดภาพอาหารหรือเพิ่มรายการด้วยตัวเอง</p>
        )}
      </section>

      <section className="graph-card card">
        <div className="card-head"><Upload size={20} /><h2>วิเคราะห์ภาพอาหาร</h2></div>
        <label className="upload-box"><Upload size={20} /><span>คลิกเพื่ออัพโหลดภาพ</span><input type="file" accept="image/*" onChange={onImageUpload} /></label>
        <p className="upload-help">*ระบบจะพยายามวิเคราะห์จากภาพและชื่อไฟล์ โดยใช้ Google Vision API หากเปิดใช้งาน หรือโมเดล MobileNet ในเครื่องเป็นตัวสำรอง</p>
        {modelLoading && <p className="upload-status">กำลังโหลดโมเดลวิเคราะห์ภาพ... กรุณารอสักครู่</p>}
        {uploadedImage && (
          <div className="upload-preview">
            <img src={uploadedImage} alt="อาหาร" />
            <div className="analysis-panel">
              {imageFeedback?.analyzing ? (
                <p>กำลังวิเคราะห์ภาพ...</p>
              ) : (
                <>
                  <p>เมนู: {imageFeedback?.dish}</p>
                  <p>แคลอรี่: {imageFeedback?.calories}</p>
                  <p>โปรตีน: {imageFeedback?.protein} กรัม</p>
                  <p>คาร์โบไฮเดรต: {imageFeedback?.carbs} กรัม</p>
                  <p>ไขมัน: {imageFeedback?.fat} กรัม</p>
                  <p>ความมั่นใจ: {imageFeedback?.confidence}%</p>
                  <label>มื้ออาหาร
                    <select value={analysisMealType} onChange={(e) => setAnalysisMealType(e.target.value)}>
                      <option value="">อัตโนมัติ</option>
                      <option value="เช้า">เช้า</option>
                      <option value="กลางวัน">กลางวัน</option>
                      <option value="เย็น">เย็น</option>
                      <option value="ว่าง">ว่าง</option>
                    </select>
                  </label>
                  <div className="analysis-actions">
                    <button type="button" className="button primary" onClick={() => saveAnalysis()}>บันทึก</button>
                    <button type="button" className="button" onClick={discardAnalysis}>ยกเลิก</button>
                  </div>
                  {imageFeedback?.similar && imageFeedback.similar.length > 0 && (
                    <div className="similar-images">
                      <h4>ตัวอย่างภาพที่คล้ายกัน</h4>
                      <div className="similar-list">
                        {imageFeedback.similar.map((u, i) => (
                          <img key={i} src={u} alt={`similar-${i}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {recipe && (
        <section className="recipe-card card">
          <div className="card-head"><CheckCircle2 size={20} /><h2>{recipe.title}</h2></div>
          <p>{recipe.description}</p>
        </section>
      )}
    </div>
  );
}

function ExerciseTab({ exercises, selectedCourse }) {
  const today = new Date();
  const weekdays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const themes = ['คาร์ดิโอ', 'ฟื้นฟู', 'แรงต้าน', 'ยืดหยุ่น', 'ความทนทาน', 'ฟิตเนส', 'คูลดาวน์'];
  const weekday = weekdays[today.getDay()];
  const theme = themes[today.getDay()];
  const routine = selectedCourse ? (selectedCourse.exerciseSchedule || []).map((item) => ({
    ...item,
    activity: `${item.activity} (${theme})`,
  })) : [];

  return (
    <div className="grid-layout">
      <section className="exercise-card card">
        <div className="card-head"><Dumbbell size={20} /><h2>ออกกำลังกายง่าย ๆ</h2></div>
        <p className="exercise-card-note">ตารางจะอัปเดตทุกวันตามวันในสัปดาห์ และมีธีมประจำวันให้คุณทำตามได้ง่าย</p>
        <div className="exercise-list">
          {exercises.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="exercise-card-item">
                <div className="exercise-icon"><Icon size={20} /></div>
                <div className="exercise-content">
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </div>
                <span className="exercise-badge">ง่าย</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="exercise-schedule-card card">
        <div className="card-head"><Activity size={20} /><h2>{selectedCourse ? `ตาราง ${weekday}` : 'ตารางออกกำลังกายของคอร์ส'}</h2></div>
        {selectedCourse ? (
          <>
            <p className="exercise-schedule-note">วันนี้เป็นวัน{weekday} ธีมการออกกำลังกาย: {theme}</p>
            <div className="exercise-schedule-grid">
              {routine.map((item) => (
                <div key={`${item.time}-${item.activity}`} className="exercise-schedule-card-item">
                  <div className="schedule-time">{item.time}</div>
                  <div className="schedule-detail">{item.activity}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="empty-state">เลือกคอร์สเพื่อตรวจสอบตารางออกกำลังกายแบบเข้าใจง่าย</p>
        )}
      </section>
    </div>
  );
}

function ProgressTab({ user, currentWeight, addWeight }) {
  const target = user.targetWeight;
  const progress = target ? Math.max(0, Math.min(100, ((user.currentWeight - target) / user.currentWeight) * 100)) : 0;
  return (
    <div className="grid-layout">
      <section className="progress-card card">
        <div className="card-head"><BarChart3 size={20} /><h2>ความก้าวหน้า</h2></div>
        <div className="header-info"><div><p>น้ำหนักปัจจุบัน</p><strong>{currentWeight} กก.</strong></div><div><p>เป้าหมาย</p><strong>{target} กก.</strong></div></div>
        <div className="progress-section"><div className="progress-labels"><span>ความคืบหน้า</span><strong>{Math.round(progress)}%</strong></div><div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div></div>
      </section>
      <section className="settings-card card"><div className="card-head"><Target size={20} /><h2>บันทึกน้ำหนัก</h2></div><div className="weight-input"><input type="number" placeholder="น้ำหนักใหม่ (กก.)" disabled /><button type="button" className="button primary" onClick={() => addWeight(currentWeight)}>เพิ่มน้ำหนัก</button></div><div className="weight-history">{user.weights.map((entry, index) => (<div key={`${entry.date}-${index}`} className="weight-entry"><span>{entry.date}</span><strong>{entry.weight} กก.</strong></div>))}</div></section>
    </div>
  );
}

function ChatTab({ chatHistory, messageText, setMessageText, onSend, isTyping }) {
  const renderMessageText = (text) => {
    return text.split(/(https?:\/\/[^\r\n\s]+)/g).map((part, index) => {
      if (/https?:\/\/[^\r\n\s]+/i.test(part)) {
        return (
          <a key={index} href={part} target="_blank" rel="noreferrer" className="chat-link">
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="card chat-shell">
      <div className="chat-header">
        <div className="card-head"><MessageSquare size={20} /><h2>แชท AI</h2></div>
        <p>ถามผู้ช่วยเกี่ยวกับสุขภาพได้ทันที</p>
      </div>
      <div className="chat-messages">
        {chatHistory.length === 0 ? (
          <p className="empty-state">ยังไม่มีข้อความ ลองพิมพ์เพื่อเริ่มต้น</p>
        ) : (
          chatHistory.map((message, index) => (
            <div key={index} className={`chat-message ${message.role}`}>
              <span className="chat-role">{message.role === 'ai' ? 'Trainer' : 'คุณ'}</span>
              <p>{renderMessageText(message.text)}</p>
              <span className="chat-time">{message.time}</span>
            </div>
          ))
        )}
        {isTyping && (
          <div className="chat-message typing">
            <span className="chat-role">Trainer</span>
            <div className="typing-dots"><span></span><span></span><span></span></div>
          </div>
        )}
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isTyping && onSend()}
          placeholder={isTyping ? 'กำลังคิดคำตอบ...' : 'พิมพ์ข้อความของคุณ...'}
          disabled={isTyping}
        />
        <button type="button" className="button primary" onClick={onSend} disabled={isTyping}>
          {isTyping ? 'กำลังพิมพ์...' : 'ส่ง'}
        </button>
      </div>
    </div>
  );
}

function SettingsTab({ user, addZwiftActivity, addAppleHealthData }) {
  const [zwiftInput, setZwiftInput] = useState('');
  const [appleHealthInput, setAppleHealthInput] = useState('');
  
  const handleAddZwiftActivity = () => {
    if (!zwiftInput.trim()) return;
    const [device, duration, distance, calories] = zwiftInput.split(',').map(s => s.trim());
    addZwiftActivity({
      deviceName: device || 'ลู่วิ่ง',
      duration: parseInt(duration) || 30,
      distance: parseFloat(distance) || 3,
      calories: parseInt(calories) || 250,
      activityType: 'วิ่ง',
      averageHeartRate: 140,
    });
    setZwiftInput('');
    alert('บันทึก Zwift กิจกรรมเรียบร้อยแล้ว');
  };

  const handleAddAppleHealth = () => {
    if (!appleHealthInput.trim()) return;
    const [dataType, value] = appleHealthInput.split(',').map(s => s.trim());
    addAppleHealthData({
      dataType: dataType || 'ก้าวเดิน',
      value: parseInt(value) || 0,
      unit: 'ก้าว',
    });
    setAppleHealthInput('');
    alert('บันทึก Apple Health ข้อมูลเรียบร้อยแล้ว');
  };

  const lastLogin = user.usageStats?.lastLogin ? new Date(user.usageStats.lastLogin).toLocaleString('th-TH') : 'ไม่มีข้อมูล';

  return (
    <div className="settings-shell">
      <section className="settings-card card">
        <div className="card-head"><Settings size={20} /><h2>ตั้งค่าผู้ใช้งาน</h2></div>
        <label>ชื่อ<input type="text" value={user.name} readOnly /></label>
        <label>อายุ<input type="number" value={user.age} readOnly /></label>
        <label>เพศ<input type="text" value={user.gender === 'male' ? 'ชาย' : user.gender === 'female' ? 'หญิง' : 'อื่น ๆ'} readOnly /></label>
        <label>อีเมล<input type="email" value={user.email} readOnly /></label>
        <label>สถานะยืนยันอีเมล<input type="text" value={user.emailVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'} readOnly /></label>
        <label>เป้าหมายน้ำหนัก<input type="number" value={user.targetWeight} readOnly /></label>
      </section>

      <section className="card">
        <div className="card-head"><Activity size={20} /><h2>สถิติการใช้งาน</h2></div>
        <div className="small-cards">
          <div><strong>ครั้งที่ล็อกอิน</strong><p>{user.usageStats?.logins || 0} ครั้ง</p></div>
          <div><strong>บันทึกมื้ออาหาร</strong><p>{user.usageStats?.mealLogsCount || 0} ครั้ง</p></div>
          <div><strong>บันทึกออกกำลังกาย</strong><p>{user.usageStats?.exerciseLogsCount || 0} ครั้ง</p></div>
          <div><strong>ล็อกอินล่าสุด</strong><p>{lastLogin}</p></div>
        </div>
      </section>

      <section className="card">
        <div className="card-head"><Dumbbell size={20} /><h2>Zwift Integration - บันทึกการออกกำลังกาย</h2></div>
        <p>บันทึกการออกกำลังกายจากเครื่องลู่วิ่ง ปั่นจักรยาน หรือเครื่องอื่น ๆ</p>
        <div className="zwift-input-form">
          <label>ข้อมูลการออกกำลังกาย
            <input 
              type="text" 
              value={zwiftInput}
              onChange={(e) => setZwiftInput(e.target.value)}
              placeholder="เช่น: ลู่วิ่ง, 30, 5, 300" 
              title="รูปแบบ: ชื่อเครื่อง, ระยะเวลา(นาที), ระยะทาง(กม.), แคลอรี่"
            />
          </label>
          <button type="button" className="button primary" onClick={handleAddZwiftActivity}>บันทึก Zwift Activity</button>
        </div>
        {user.zwiftActivities && user.zwiftActivities.length > 0 && (
          <div className="activity-list">
            <h3>กิจกรรมล่าสุด</h3>
            {user.zwiftActivities.slice(-5).map((activity) => (
              <div key={activity.id} className="activity-item">
                <strong>{activity.deviceName}</strong> - {activity.duration} นาที - {activity.distance} กม. - {activity.calories} kcal
                <span className="activity-date">{activity.date} {activity.time}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-head"><Heart size={20} /><h2>Apple Health Integration - บันทึกข้อมูลสุขภาพ</h2></div>
        <p>เชื่อมต่อข้อมูลสุขภาพจาก Apple Health เช่น ก้าวเดิน หัวใจ ฯลฯ</p>
        <div className="health-input-form">
          <label>ข้อมูล Apple Health
            <input 
              type="text" 
              value={appleHealthInput}
              onChange={(e) => setAppleHealthInput(e.target.value)}
              placeholder="เช่น: ก้าวเดิน, 8000" 
              title="รูปแบบ: ประเภทข้อมูล, ค่า"
            />
          </label>
          <button type="button" className="button primary" onClick={handleAddAppleHealth}>บันทึก Apple Health</button>
        </div>
        {user.appleHealthData && user.appleHealthData.length > 0 && (
          <div className="health-list">
            <h3>ข้อมูลล่าสุด</h3>
            {user.appleHealthData.slice(-5).map((data) => (
              <div key={data.id} className="health-item">
                <strong>{data.dataType}</strong>: {data.value} {data.unit}
                <span className="health-date">{data.date} {data.time}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-head"><Star size={20} /><h2>เคล็ดลับดี ๆ</h2></div>
        <div className="small-cards">
          <div><strong>นอนให้เพียงพอ</strong><p>ช่วยฟื้นฟูร่างกาย</p></div>
          <div><strong>กินครบ 5 หมู่</strong><p>ทำให้ร่างกายทำงานดีขึ้น</p></div>
        </div>
      </section>
    </div>
  );
}

export default App;

