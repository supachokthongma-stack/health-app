import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'หน้าแรก', icon: Home },
  { id: 'meals', label: 'อาหาร', icon: Flame },
  { id: 'exercise', label: 'ออกกำลังกาย', icon: Dumbbell },
  { id: 'progress', label: 'ความก้าวหน้า', icon: TrendingDown },
  { id: 'chat', label: 'แชท', icon: MessageSquare },
  { id: 'settings', label: 'ตั้งค่า', icon: Settings },
];

const COURSE_PLANS = [
  { id: 1, name: 'Quick Start', duration: '3 เดือน', details: 'เริ่มต้นช้า ๆ พร้อมผลลัพธ์จริง', color: 'emerald' },
  { id: 2, name: 'Balanced Plan', duration: '4 เดือน', details: 'โฟกัสอาหารและออกกำลังกาย', color: 'blue' },
  { id: 3, name: 'Power Start', duration: '5 เดือน', details: 'เน้นการเผาผลาญและความแข็งแรง', color: 'orange' },
];

const RECIPES = [
  { id: 1, title: 'ไข่ต้มสุขภาพ', calories: 78, description: 'ง่าย สะอาด โปรตีนสูง' },
  { id: 2, title: 'สลัดอกไก่', calories: 220, description: 'ผักสดกับโปรตีนลีน' },
  { id: 3, title: 'สมูทตี้เบอร์รี่', calories: 160, description: 'สดชื่นและมีไฟเบอร์' },
];

const EXERCISES = [
  { id: 1, title: 'เดินเร็ว 30 นาที', summary: 'เพิ่มหัวใจและการเผาผลาญ' },
  { id: 2, title: 'สควอท 3 เซ็ต', summary: 'ฝึกขาและแกนกลางลำตัว' },
  { id: 3, title: 'แพลงก์ 2 นาที', summary: 'สร้างแกนกลางลำตัวแข็งแรง' },
];

const AI_RESPONSES = [
  'เยี่ยมมาก! วันนี้คุณทำได้ดีแล้ว 💪',
  'ดื่มน้ำเพิ่มอีกสักแก้วนะครับ 💧',
  'พักผ่อนให้เพียงพอ แล้วลุยต่อพรุ่งนี้',
  'ตั้งเป้าเล็ก ๆ แล้วขยับให้สม่ำเสมอ',
];

const INITIAL_USER = {
  id: '',
  name: '',
  email: '',
  password: '',
  currentWeight: 75,
  targetWeight: 65,
  selectedCourse: null,
  startDate: null,
  weights: [],
  chatHistory: [],
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
  const [activeTab, setActiveTab] = useState('home');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [messageText, setMessageText] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageFeedback, setImageFeedback] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    localStorage.setItem('healthAppUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('healthAppCurrent', currentUser.id);
    else localStorage.removeItem('healthAppCurrent');
  }, [currentUser]);

  const handleRegister = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    if (!name || !email || !password) { alert('กรุณากรอกข้อมูลให้ครบ'); return; }
    if (users.some((item) => item.email === email)) { alert('อีเมลนี้ถูกใช้งานแล้ว'); return; }
    const newUser = { ...INITIAL_USER, id: `${Date.now()}`, name, email, password, startDate: new Date().toISOString().split('T')[0], weights: [{ date: new Date().toLocaleDateString('th-TH'), weight: 75 }] };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setForm({ name: '', email: '', password: '' });
    setActiveTab('home');
  };

  const handleLogin = () => {
    const email = form.email.trim();
    const password = form.password.trim();
    const user = users.find((item) => item.email === email && item.password === password);
    if (!user) { alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); return; }
    setCurrentUser(user);
    setForm({ name: '', email: '', password: '' });
    setActiveTab('home');
  };

  const logout = () => { setCurrentUser(null); setActiveTab('home'); };

  const updateUser = (updates) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsers(users.map((item) => (item.id === updated.id ? updated : item)));
  };

  const addWeight = (weight) => {
    if (!currentUser) return;
    const today = new Date().toLocaleDateString('th-TH');
    updateUser({ weights: [...currentUser.weights, { date: today, weight }], currentWeight: weight });
  };

  const sendMessage = () => {
    if (!currentUser || !messageText.trim()) return;
    const userMsg = { role: 'user', text: messageText.trim(), time: new Date().toLocaleTimeString('th-TH') };
    const aiMsg = { role: 'ai', text: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)], time: new Date().toLocaleTimeString('th-TH') };
    updateUser({ chatHistory: [...currentUser.chatHistory, userMsg, aiMsg] });
    setMessageText('');
  };

  const selectCourse = (courseId) => { updateUser({ selectedCourse: courseId }); };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setUploadedImage(reader.result); setImageFeedback({ dish: 'ไข่ต้ม', calories: 85, confidence: 88 }); };
    reader.readAsDataURL(file);
  };

  if (!currentUser) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-header">
            <div>
              <p className="eyebrow">Health Trainer</p>
              <h1>{authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h1>
              <p>เริ่มต้นดูแลสุขภาพของคุณง่าย ๆ วันนี้</p>
            </div>
            <div className="auth-switch">
              <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>เข้าสู่ระบบ</button>
              <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>สมัครสมาชิก</button>
            </div>
          </div>
          <div className="auth-form">
            {authMode === 'register' && (
              <label>ชื่อ<input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ชื่อของคุณ" /></label>
            )}
            <label>อีเมล<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
            <label>รหัสผ่าน<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="รหัสผ่าน" /></label>
          </div>
          <button type="button" className="button primary" onClick={authMode === 'login' ? handleLogin : handleRegister}>{authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</button>
          <p className="auth-note">
            {authMode === 'login' ? 'ยังไม่มีบัญชี?' : 'มีบัญชีแล้ว?'}{' '}
            <button type="button" className="text-link" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</button>
          </p>
        </div>
      </div>
    );
  }

  const currentWeight = currentUser.weights?.[currentUser.weights.length - 1]?.weight || currentUser.currentWeight;
  const selectedCourse = COURSE_PLANS.find((course) => course.id === currentUser.selectedCourse);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${showSidebar ? '' : 'collapsed'}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-icon">💪</div>
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
        {activeTab === 'home' && (<HomeTab currentUser={currentUser} selectedCourse={selectedCourse} selectCourse={selectCourse} />)}
        {activeTab === 'meals' && (<MealsTab recipes={RECIPES} selectedRecipe={selectedRecipe} setSelectedRecipe={setSelectedRecipe} uploadedImage={uploadedImage} imageFeedback={imageFeedback} onImageUpload={handleImageUpload} />)}
        {activeTab === 'exercise' && (<ExerciseTab exercises={EXERCISES} />)}
        {activeTab === 'progress' && (<ProgressTab user={currentUser} currentWeight={currentWeight} addWeight={addWeight} />)}
        {activeTab === 'chat' && (<ChatTab chatHistory={currentUser.chatHistory || []} messageText={messageText} setMessageText={setMessageText} onSend={sendMessage} />)}
        {activeTab === 'settings' && (<SettingsTab user={currentUser} />)}
      </main>
    </div>
  );
}

function HomeTab({ currentUser, selectedCourse, selectCourse }) {
  return (
    <div className="grid-layout">
      <section className="welcome-card card">
        <div className="card-head"><Calendar size={20} /><h2>ภาพรวม</h2></div>
        <p>คุณกำลังตั้งเป้าน้ำหนักจาก {currentUser.currentWeight} กก. ไป {currentUser.targetWeight} กก.</p>
        {selectedCourse ? (<div className="header-info"><div><p>แผนที่เลือก</p><strong>{selectedCourse.name}</strong></div><div><p>ระยะเวลา</p><strong>{selectedCourse.duration}</strong></div></div>) : (<p className="empty-state">ยังไม่ได้เลือกแผนการฝึก ลองเลือกด้านล่าง</p>)}
      </section>
      <section className="course-card card">
        <div className="card-head"><Star size={20} /><h2>แผนการฝึก</h2></div>
        <div className="course-list">
          {COURSE_PLANS.map((course) => (
            <button key={course.id} type="button" className={`course-card-item ${currentUser.selectedCourse === course.id ? 'active' : ''}`} onClick={() => selectCourse(course.id)}>
              <div><strong>{course.name}</strong><p>{course.details}</p></div><span>{course.duration}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function MealsTab({ recipes, selectedRecipe, setSelectedRecipe, uploadedImage, imageFeedback, onImageUpload }) {
  const recipe = recipes.find((item) => item.id === selectedRecipe);
  return (
    <div className="grid-layout">
      <section className="nutrition-card card">
        <div className="card-head"><Flame size={20} /><h2>เมนูสุขภาพ</h2></div>
        <div className="recipe-list">
          {recipes.map((item) => (
            <button key={item.id} type="button" className={`recipe-item ${selectedRecipe === item.id ? 'active' : ''}`} onClick={() => setSelectedRecipe(item.id)}>
              <div><strong>{item.title}</strong><p>{item.description}</p></div>
              <span>{item.calories} แคลอรี่</span>
            </button>
          ))}
        </div>
      </section>
      <section className="graph-card card">
        <div className="card-head"><Upload size={20} /><h2>วิเคราะห์ภาพอาหาร</h2></div>
        <label className="upload-box"><Upload size={20} /><span>คลิกเพื่ออัพโหลดภาพ</span><input type="file" accept="image/*" onChange={onImageUpload} /></label>
        {uploadedImage && (<div className="upload-preview"><img src={uploadedImage} alt="อาหาร" /><div className="analysis-panel"><p>เมนู: {imageFeedback?.dish}</p><p>แคลอรี่: {imageFeedback?.calories}</p><p>ความมั่นใจ: {imageFeedback?.confidence}%</p></div></div>)}
      </section>
      {recipe && (<section className="recipe-card card"><div className="card-head"><CheckCircle2 size={20} /><h2>{recipe.title}</h2></div><p>{recipe.description}</p></section>)}
    </div>
  );
}

function ExerciseTab({ exercises }) {
  return (
    <div className="grid-layout">
      <section className="exercise-card card">
        <div className="card-head"><Dumbbell size={20} /><h2>ออกกำลังกาย</h2></div>
        <div className="exercise-list">
          {exercises.map((item) => (
            <div key={item.id} className="exercise-item"><span><strong>{item.title}</strong><p>{item.summary}</p></span></div>
          ))}
        </div>
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

function ChatTab({ chatHistory, messageText, setMessageText, onSend }) {
  return (
    <div className="card chat-shell">
      <div className="chat-header"><div className="card-head"><MessageSquare size={20} /><h2>แชท AI</h2></div><p>ถามผู้ช่วยเกี่ยวกับสุขภาพได้ทันที</p></div>
      <div className="chat-messages">{chatHistory.length === 0 ? (<p className="empty-state">ยังไม่มีข้อความ ลองพิมพ์เพื่อเริ่มต้น</p>) : chatHistory.map((message, index) => (<div key={index} className={`chat-message ${message.role}`}><span className="chat-role">{message.role === 'ai' ? 'Trainer' : 'คุณ'}</span><p>{message.text}</p><span className="chat-time">{message.time}</span></div>))}</div>
      <div className="chat-input-row"><input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSend()} placeholder="พิมพ์ข้อความของคุณ..." /><button type="button" className="button primary" onClick={onSend}>ส่ง</button></div>
    </div>
  );
}

function SettingsTab({ user }) {
  return (
    <div className="settings-shell">
      <section className="settings-card card"><div className="card-head"><Settings size={20} /><h2>ตั้งค่าผู้ใช้งาน</h2></div><label>ชื่อ<input type="text" value={user.name} readOnly /></label><label>อีเมล<input type="email" value={user.email} readOnly /></label><label>เป้าหมายน้ำหนัก<input type="number" value={user.targetWeight} readOnly /></label></section>
      <section className="card"><div className="card-head"><Star size={20} /><h2>เคล็ดลับดี ๆ</h2></div><div className="small-cards"><div><strong>นอนให้เพียงพอ</strong><p>ช่วยฟื้นฟูร่างกาย</p></div><div><strong>กินครบ 5 หมู่</strong><p>ทำให้ร่างกายทำงานดีขึ้น</p></div></div></section>
    </div>
  );
}

export default App;
