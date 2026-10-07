/**
 * IlmHub AI - Core Application Logic
 * Implements:
 * 1. Smart Distribution Algorithm for 6 topics across N days with daily minutes.
 * 2. Strict validation (rejection of 0 or invalid days).
 * 3. Exact test cases (e.g. 6 topics, 3 days, 650 min => 2 topics/day @ 325 min/topic).
 * 4. Real-time progress bar (e.g. 3 of 6 topics => 50%).
 * 5. State persistence via localStorage.
 * 6. Student View & Teacher Dashboard with Subscription Tier mockups.
 * 7. Focus study timer & AI study assistant tips.
 */

// Storage Keys
const STORAGE_KEY = 'ilmhub_exam_planner_state_v1';
const TEACHER_STUDENTS_KEY = 'ilmhub_teacher_students_v1';
const SUBSCRIPTION_KEY = 'ilmhub_subscription_plan_v1';
const TASKS_STORAGE_KEY = 'ilmhub_personal_tasks_v2';
const MODULE_STORAGE_KEY = 'ilmhub_active_module';

// Initial Sample Personal Tasks (To-Do List)
const INITIAL_TASKS = [
  {
    id: 'task_1',
    title: "Usmonov to'plamidan 14-betdagi 15 ta misolni yechish",
    subject: "Matematika",
    priority: "high",
    dueDate: "Bugun, 18:00",
    completed: false,
    isTeacher: false
  },
  {
    id: 'task_2',
    title: "Hosilalar va trigonometrik funksiyalar bo'yicha AI testini topshirish",
    subject: "Matematika",
    priority: "high",
    dueDate: "Bugun, 20:00",
    completed: true,
    isTeacher: true
  },
  {
    id: 'task_3',
    title: "Ingliz tili: 20 ta yangi akademik so'zni yodlash va flashcard tuzish",
    subject: "Ingliz tili",
    priority: "medium",
    dueDate: "Ertaga, 12:00",
    completed: false,
    isTeacher: false
  },
  {
    id: 'task_4',
    title: "Fizika: Termodinamika birinchi qonuni bo'yicha konspekt yozish",
    subject: "Fizika",
    priority: "low",
    dueDate: "Indinga, 16:00",
    completed: false,
    isTeacher: false
  }
];

// Default initial state
const DEFAULT_STATE = {
  days: 3,
  dailyMinutes: 650,
  topics: [
    '1. Matematika: Hosila va Integrallar',
    '2. Fizika: Termodinamika va Ideal Gaz',
    '3. Ona tili: Murakkab Sintaksis',
    '4. Tarix: Yangi Davr va Temuriylar',
    '5. Ingliz tili: IELTS Reading & Vocab',
    '6. Biologiya: Genetika va DNK strukturasi'
  ],
  completedTopics: [0, 1, 2], // Default has 3 completed for instant test case demonstration (50%)
  notes: {},
  activeRole: 'student', // 'student' | 'teacher'
  theme: 'dark',
  audioEnabled: true
};

// Comprehensive Subject Knowledge Base with Theory/Practice balance, Books and Step-by-Step guides
const SUBJECT_DATABASE = {
  matematika: {
    name: "Matematika",
    topics: [
      "1. Ratsional tenglamalar va tengsizliklar tizimi",
      "2. Funksiya xossalari va grafigini yasash",
      "3. Ko'rsatkichli va logarifmik ifodalar",
      "4. Trigonometrik ayniyatlar va hisoblashlar",
      "5. Hosilaning geometrik va fizik ma'nosi",
      "6. Aniq va noaniq integrallar, yuzalarni topish"
    ],
    theoryRatio: 0.35, // 35% theory, 65% practice
    books: [
      "S.Usmonov — 'Matematika masalalar to'plami' (1-qism, 14-25 betlar)",
      "Algebra va analiz asoslari 10-11 sinf darsligi",
      "DTM Matematika test variantlari (2024-2025)",
      "Khan Academy Uzbek — Matematika moduli"
    ],
    firstStepAdvice: "Avval barcha asosiy formulalarni alohida daftarga qayd qiling. Nazariy qoidani 15-20 daqiqa tushunib olib, o'sha mavzuga oid 10 ta eng sodda misoldan boshlang."
  },
  tarix: {
    name: "Tarix (O'zbekiston va Jahon)",
    topics: [
      "1. Qadimgi Baqtriya, So'g'diyona va Xorazm davlatchiligi",
      "2. Amir Temur va Temuriylar saltanati madaniy yuksalishi",
      "3. O'zbek xonliklari davri (Buxoro, Xiva, Qo'qon)",
      "4. Turkiston jadidchilik harakati va ma'rifatparvarlar merosi",
      "5. Jahon tarixi: Yangi davr inqiloblari va kashfiyotlar",
      "6. Yangi O'zbekistonning mustaqillik va taraqqiyot bosqichlari"
    ],
    theoryRatio: 0.60, // 60% theory, 40% practice
    books: [
      "O'zbekiston Tarixi 8, 9, 10-sinf darsliklari",
      "Jahon Tarixi xronologik jadvallar to'plami",
      "Tarixdan qisqa test konspektlari va xaritalar",
      "Milliy kutubxona tarixiy manbalari"
    ],
    firstStepAdvice: "Asosiy tarixiy voqealarni va shaxslarni xronologik vaqt o'qi bo'ylab joylashtiring. Sanalarni yodlashda flesh-kartalardan foydalaning."
  },
  ingliz: {
    name: "Ingliz tili (IELTS / CEFR)",
    topics: [
      "1. English Tenses: Present Perfect vs Past Simple tahlili",
      "2. Passive Voice & Conditionals (If Clauses)",
      "3. Relative Clauses & Gerund vs Infinitive qo'llanilishi",
      "4. IELTS Reading: Skimming, Scanning & Keywords strategiyasi",
      "5. IELTS Writing Task 2: Essay Structure & Linking Words",
      "6. Academic Vocabulary: Top 200 Collocations & Idioms"
    ],
    theoryRatio: 0.30, // 30% theory, 70% practice
    books: [
      "Raymond Murphy — 'English Grammar in Use' (B1-B2)",
      "Cambridge IELTS Academic Practice Tests 16-18",
      "Destination B2 Grammar and Vocabulary",
      "Oxford Word Skills Intermediate"
    ],
    firstStepAdvice: "Dastlab 15 ta yangi so'zni kontekstda o'rganing. Grammatik qoidani ko'rib chiqqach, darhol 20 ta gap tuzing va 1 ta matnni tahlil qiling."
  },
  rus_tili: {
    name: "Rus tili",
    topics: [
      "1. Имя существительное: Род, число и падежные окончания",
      "2. Спряжение глаголов и виды глаголов (СВ и НСВ)",
      "3. Имя прилагательное и согласование с существительными",
      "4. Синтаксис: Сложносочиненные и сложноподчиненные предложения",
      "5. Употребление предлогов с разными падежами в контексте",
      "6. Разговорная речь, аудирование и написание эссе"
    ],
    theoryRatio: 0.40, // 40% theory, 60% practice
    books: [
      "В.В. Бабайцева — 'Русский язык: Теория и практика'",
      "Русская грамматика в таблицах и схемах",
      "Сборник тестов для поступающих в ВУЗы",
      "Учебник русского языка 10-11 класс"
    ],
    firstStepAdvice: "Avval fe'l va otlarning kelishik (падеж) jadvallarini ko'rib chiqing. O'rganilgan qoidaga binoan mashqlar to'plamidan 15 ta misol yozing."
  },
  ona_tili: {
    name: "Ona tili va Adabiyot",
    topics: [
      "1. Tovushlar tizimi, fonetik hodisalar va orfoepiya",
      "2. So'z yasalishi, morfemika va lug'at boyligi",
      "3. Mustaqil so'z turkumlari (Ot, Sifat, Fe'l grammatikasi)",
      "4. Ergashgan qo'shma gaplar va ularning tuzilishi",
      "5. Tinish belgilarining ishlatilish me'yorlari",
      "6. Matn tahlili, uslubiyat va insho yozish qoidalari"
    ],
    theoryRatio: 0.40, // 40% theory, 60% practice
    books: [
      "A.G'ulomov, M.Asqarova — 'Hozirgi o'zbek adabiy tili'",
      "Ona tili 8-11 sinf umumta'lim darsliklari",
      "Milliy sertifikat va DTM Ona tili test to'plami",
      "O'zbek adabiyoti antologiyasi"
    ],
    firstStepAdvice: "Qoidani o'qib bo'lgach, badiiy asardan o'sha sintaktik birlik qatnashgan 5 ta namunaviy gapni ko'chirib, sintaktik tahlil qiling."
  },
  fizika: {
    name: "Fizika",
    topics: [
      "1. Kinematika: To'g'ri chiziqli tekis va o'zgaruvchan harakat",
      "2. Nyuton dinamika qonunlari va og'irlik kuchi",
      "3. Mexanik energiya va impulsning saqlanish qonunlari",
      "4. Molekulyar kinetik nazariya va ideal gaz qonunlari",
      "5. Termodinamika asoslari va issiqlik dvigatellari FIKi",
      "6. Elektr maydoni, Kulon qonuni va Om qonuni zanjirlari"
    ],
    theoryRatio: 0.35, // 35% theory, 65% practice
    books: [
      "A.P. Rimkevich — 'Fizika masalalar to'plami'",
      "Fizika 9-10-11 sinf darsliklari",
      "A.Ismoilov — 'Fizika qo'llanmasi va formulalar'",
      "DTM Fizika milliy sertifikat test bazasi"
    ],
    firstStepAdvice: "Har bir formuladagi kattaliklar va SI birliklarini aniq bilib oling. Masalani chizmasiz yechmang, har doim kuchlar yo'nalishini chizing."
  },
  biologiya: {
    name: "Biologiya",
    topics: [
      "1. Hujayra tuzilishi, membranasi va organoidlari",
      "2. Moddalar almashinuvi: Fotosintez va Hujayra nafasi",
      "3. Genetika asoslari: Mendel qonunlari va genotip",
      "4. Seleksiya va zamonaviy biotexnologiya yutuqlari",
      "5. Evolyutsiya nazariyasi va Darvin ta'limoti",
      "6. Ekologiya va biosferada tirik organizmlar muvozanati"
    ],
    theoryRatio: 0.60, // 60% theory, 40% practice
    books: [
      "Umumiy Biologiya 10-11 sinf darsliklari",
      "A.G'ofurov — 'Biologiya qo'llanmasi'",
      "Genetikadan masalalar yechish metodikasi",
      "DTM Biologiya testlar to'plami"
    ],
    firstStepAdvice: "Biologik atamalarni rasm va sxemalar orqali o'rganing. Genetik masalalarni qat'iy panjara (Pennet) usulida yeching."
  },
  kimyo: {
    name: "Kimyo",
    topics: [
      "1. Atom tuzilishi, davriy qonun va elementlar xossalari",
      "2. Kimyoviy bog'lanish turlari va moddalar tuzilishi",
      "3. Anorganik moddalar sinflari: Oksid, Asos, Kislota, Tuz",
      "4. Kimyoviy reaksiyalar tezligi va muvozanat",
      "5. Eritmalar va eruvchanlik: Foiz va Molyar konsentratsiya",
      "6. Organik kimyo: Uglevodorodlar (Alkan, Alken, Aren)"
    ],
    theoryRatio: 0.35, // 35% theory, 65% practice
    books: [
      "I.R. Asqarov — 'Umumiy va Anorganik Kimyo'",
      "N.L. Glinka — 'Kimyodan masalalar to'plami'",
      "Kimyo 9-10 sinf darsliklari",
      "DTM Kimyo savolnomalari to'plami"
    ],
    firstStepAdvice: "Reaksiyalarni tenglashtirish va mol tushunchasini mukammal o'rganing. Konsentratsiyaga oid masalalarni formulalar orqali bajaring."
  }
};

// Preset Topic Kits (backward compatible)
const TOPIC_PRESETS = {
  dtm: SUBJECT_DATABASE.matematika.topics,
  sat_ielts: SUBJECT_DATABASE.ingliz.topics,
  it_coding: [
    '1. Frontend: React State Management & Hooks',
    '2. Backend: REST API & Authentication (JWT)',
    '3. Ma\'lumotlar Bazasi: PostgreSQL & Queries',
    '4. Algoritmlar: Binary Search & Two Pointers',
    '5. DevOps: Docker Containerization asoslari',
    '6. Git & GitHub: Pull Requests & CI/CD'
  ]
};

// Initial Sample Students for Teacher Dashboard
const INITIAL_STUDENTS = [
  {
    id: 'std_1',
    name: 'Jasur Aliyev',
    avatar: '👨‍🎓',
    subject: 'Milliy Sertifikat / Fizika-Matematika',
    days: 3,
    dailyMinutes: 650,
    topicsCount: 6,
    completedCount: 3, // 50%
    lastActive: '5 daqiqa oldin',
    status: 'O\'rganmoqda',
    teacherNote: 'Mavzularni juda yaxshi o\'zlashtirmoqda, formulalarni takrorlash tavsiya etiladi.'
  },
  {
    id: 'std_2',
    name: 'Malika Karimova',
    avatar: '👩‍🎓',
    subject: 'IELTS Academic 7.5+',
    days: 4,
    dailyMinutes: 480,
    topicsCount: 6,
    completedCount: 5, // 83%
    lastActive: '12 daqiqa oldin',
    status: 'A\'lo darajada',
    teacherNote: 'Reading bo\'yicha test natijalari 8.0 dan yuqori chiqdi.'
  },
  {
    id: 'std_3',
    name: 'Bobur Mirzayev',
    avatar: '👨‍🎓',
    subject: 'SAT Digital Math & English',
    days: 2,
    dailyMinutes: 600,
    topicsCount: 6,
    completedCount: 2, // 33%
    lastActive: 'Bugun, 09:30',
    status: 'Diqqat zarur',
    teacherNote: 'Geometriya masalalariga ko\'proq vaqt ajratishi kerak.'
  },
  {
    id: 'std_4',
    name: 'Nilufar Saidova',
    avatar: '👩‍🎓',
    subject: 'Tibbiyot Universiteti / Kimyo-Biologiya',
    days: 6,
    dailyMinutes: 720,
    topicsCount: 6,
    completedCount: 6, // 100%
    lastActive: 'Kecha, 18:40',
    status: 'Tugallandi 🏆',
    teacherNote: 'Reja to\'liq bajarildi! Sinov imtihoniga tayyor.'
  }
];

class ExamPlannerApp {
  constructor() {
    this.state = this.loadState();
    this.students = this.loadStudents();
    this.subscription = this.loadSubscription();
    this.currentTimer = null;
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.isTimerRunning = false;

    this.init();
  }

  // Load from localStorage or return default
  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.topics) && parsed.topics.length > 0) {
          return { ...DEFAULT_STATE, ...parsed };
        }
      }
    } catch (e) {
      console.warn('LocalStorage yuklashda xatolik:', e);
    }
    return { ...DEFAULT_STATE };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('LocalStorage saqlashda xatolik:', e);
    }
  }

  loadStudents() {
    try {
      const saved = localStorage.getItem(TEACHER_STUDENTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return INITIAL_STUDENTS;
  }

  saveStudents() {
    try {
      localStorage.setItem(TEACHER_STUDENTS_KEY, JSON.stringify(this.students));
    } catch (e) {}
  }

  loadSubscription() {
    try {
      const saved = localStorage.getItem(SUBSCRIPTION_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return { plan: 'pro', name: 'Pro Ustoz', expiresAt: '2026-12-31' };
  }

  saveSubscription(planData) {
    this.subscription = planData;
    try {
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(planData));
    } catch (e) {}
    this.renderHeaderBadges();
  }

  init() {
    // Apply Theme
    this.applyTheme(this.state.theme);

    // Audio status
    if (window.soundFx) {
      window.soundFx.enabled = this.state.audioEnabled;
    }

    // Populate inputs from state
    this.populateInputs();

    // Attach Event Listeners
    this.bindEvents();

    // Render Initial UI
    this.renderRoleView();
    this.calculateAndRenderPlan(false); // initial render without error noise
    this.renderSubjectBreakdown();
    this.renderTeacherDashboard();
    this.renderHeaderBadges();
  }

  applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
    }
    this.state.theme = theme;
    this.saveState();

    if (window.heroScene) {
      window.heroScene.setTheme(theme === 'dark');
    }

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === 'light' 
        ? `<i data-lucide="moon" class="w-5 h-5 text-indigo-400"></i>`
        : `<i data-lucide="sun" class="w-5 h-5 text-amber-400"></i>`;
      lucide.createIcons();
    }
  }

  toggleTheme() {
    const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
    if (window.soundFx) window.soundFx.playClick();
  }

  toggleAudio() {
    this.state.audioEnabled = !this.state.audioEnabled;
    if (window.soundFx) {
      window.soundFx.enabled = this.state.audioEnabled;
      if (this.state.audioEnabled) window.soundFx.playClick();
    }
    this.saveState();
    this.renderAudioButton();
  }

  renderAudioButton() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (!audioBtn) return;
    if (this.state.audioEnabled) {
      audioBtn.innerHTML = `<i data-lucide="volume-2" class="w-5 h-5 text-emerald-400"></i>`;
      audioBtn.title = "Ovoz effektlari: Yoqilgan";
    } else {
      audioBtn.innerHTML = `<i data-lucide="volume-x" class="w-5 h-5 text-slate-400"></i>`;
      audioBtn.title = "Ovoz effektlari: O'chirilgan";
    }
    lucide.createIcons();
  }

  populateInputs() {
    const daysInput = document.getElementById('input-days');
    const minutesInput = document.getElementById('input-minutes');
    if (daysInput) daysInput.value = this.state.days;
    if (minutesInput) minutesInput.value = this.state.dailyMinutes;

    this.renderTopicsInputFields(this.state.topics);
    this.updateMinutesHelperText();
  }

  updateMinutesHelperText() {
    const minutesInput = document.getElementById('input-minutes');
    const helper = document.getElementById('minutes-helper-text');
    if (!minutesInput || !helper) return;

    const val = parseInt(minutesInput.value, 10);
    if (isNaN(val) || val <= 0) {
      helper.textContent = 'Noto\'g\'ri vaqt';
      helper.className = 'text-xs text-rose-400';
    } else {
      const hours = Math.floor(val / 60);
      const mins = val % 60;
      helper.textContent = `Kuniga ~ ${hours} soat ${mins > 0 ? mins + ' daqiqa' : ''}`;
      helper.className = 'text-xs text-emerald-400 font-medium';
    }
  }

  bindEvents() {
    // Role switch tabs
    document.querySelectorAll('[data-role-switch]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const role = e.currentTarget.getAttribute('data-role-switch');
        this.switchRole(role);
      });
    });

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Audio toggle
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => this.toggleAudio());
    }

    // Subject selector buttons (Matematika, Tarix, Ingliz tili, Rus tili, Ona tili, Fizika, Biologiya, Kimyo)
    document.querySelectorAll('[data-subject-select]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const subKey = e.currentTarget.getAttribute('data-subject-select');
        this.selectSubject(subKey);
      });
    });

    // Send Assignment to Class (Teacher feature)
    const sendAssignBtn = document.getElementById('btn-send-plan-to-class');
    if (sendAssignBtn) {
      sendAssignBtn.addEventListener('click', () => {
        this.sendCurrentPlanToClass();
      });
    }

    // Plan Mode Tabs (AI vs Manual)
    const tabAi = document.getElementById('tab-mode-ai');
    const tabManual = document.getElementById('tab-mode-manual');
    if (tabAi) tabAi.onclick = () => this.setPlanMode('ai');
    if (tabManual) tabManual.onclick = () => this.setPlanMode('manual');

    // Add Topic Field Button (Manual mode)
    const addTopicBtn = document.getElementById('btn-add-topic-field');
    if (addTopicBtn) {
      addTopicBtn.onclick = () => {
        this.addTopicField('');
        if (window.soundFx) window.soundFx.playClick();
      };
    }

    // AI Auto Generate Button
    const aiAutoBtn = document.getElementById('btn-ai-auto-generate');
    if (aiAutoBtn) {
      aiAutoBtn.onclick = () => {
        const subKey = this.currentSubjectKey || 'matematika';
        this.selectSubject(subKey);
        this.calculateAndRenderPlan(true);
      };
    }

    // Quick preset buttons
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const presetKey = e.currentTarget.getAttribute('data-preset');
        this.applyPreset(presetKey);
      });
    });

    // Quick Day Selection buttons (2, 3, 5, 7 kun)
    document.querySelectorAll('[data-quick-days]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dayVal = parseInt(e.currentTarget.getAttribute('data-quick-days'), 10);
        const daysInput = document.getElementById('input-days');
        if (daysInput) {
          daysInput.value = dayVal;
          if (window.soundFx) window.soundFx.playClick();
          this.calculateAndRenderPlan(true);
        }
      });
    });

    // Calculate Form Submit
    const planForm = document.getElementById('planner-form');
    if (planForm) {
      planForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculateAndRenderPlan(true);
      });
    }

    // Minutes input listener for helper
    const minutesInput = document.getElementById('input-minutes');
    if (minutesInput) {
      minutesInput.addEventListener('input', () => this.updateMinutesHelperText());
    }

    // Reset All Plan Button
    const resetBtn = document.getElementById('reset-plan-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("Haqiqatan ham barcha bajarilgan belgilarni tozalashni xohlaysizmi?")) {
          this.state.completedTopics = [];
          this.saveState();
          this.renderProgress();
          this.renderSchedule();
          if (window.soundFx) window.soundFx.playClick();
        }
      });
    }

    // Focus Study Timer Controls
    this.bindTimerControls();

    // Teacher add student modal
    this.bindTeacherControls();
  }

  selectSubject(subjectKey) {
    const data = SUBJECT_DATABASE[subjectKey] || SUBJECT_DATABASE.matematika;
    this.currentSubjectKey = subjectKey;

    // Update active style on subject pill buttons
    document.querySelectorAll('[data-subject-select]').forEach(btn => {
      const k = btn.getAttribute('data-subject-select');
      if (k === subjectKey) {
        btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border border-emerald-400 flex items-center gap-1.5 transition-all";
      } else {
        btn.className = "px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center gap-1.5 transition-all";
      }
    });

    // Populate topics inputs dynamically
    this.state.topics = [...data.topics];
    this.renderTopicsInputFields(data.topics);

    this.saveState();
    if (window.soundFx) window.soundFx.playClick();
    this.calculateAndRenderPlan(false);
    this.renderSubjectBreakdown(data);
  }

  setPlanMode(mode = 'ai') {
    this.planMode = mode;
    const tabAi = document.getElementById('tab-mode-ai');
    const tabManual = document.getElementById('tab-mode-manual');
    const aiSubjectsArea = document.getElementById('ai-subjects-selection-area');
    const manualAddTopicBtn = document.getElementById('btn-add-topic-field');
    const customSubjectInput = document.getElementById('manual-custom-subject-input');

    if (mode === 'ai') {
      if (tabAi) tabAi.className = "flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-md flex items-center justify-center gap-1.5";
      if (tabManual) tabManual.className = "flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center justify-center gap-1.5";
      if (aiSubjectsArea) aiSubjectsArea.classList.remove('hidden');
      if (customSubjectInput) customSubjectInput.classList.add('hidden');
    } else {
      if (tabManual) tabManual.className = "flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-md flex items-center justify-center gap-1.5";
      if (tabAi) tabAi.className = "flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center justify-center gap-1.5";
      if (aiSubjectsArea) aiSubjectsArea.classList.add('hidden');
      if (customSubjectInput) customSubjectInput.classList.remove('hidden');
    }
    if (window.soundFx) window.soundFx.playClick();
  }

  renderTopicsInputFields(topicsList = []) {
    const container = document.getElementById('topics-inputs-container');
    if (!container) return;
    container.innerHTML = '';

    topicsList.forEach((topicText, idx) => {
      this.addTopicField(topicText);
    });
  }

  addTopicField(text = '') {
    const container = document.getElementById('topics-inputs-container');
    if (!container) return;

    const count = container.querySelectorAll('.topic-input-row').length + 1;
    const row = document.createElement('div');
    row.className = 'topic-input-row flex items-center gap-2';

    row.innerHTML = `
      <span class="w-6 text-xs font-bold text-slate-400 text-center">${count}</span>
      <input 
        type="text" 
        class="topic-input-field glass-input flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium" 
        placeholder="${count}-Mavzu nomi..." 
        value="${text || `${count}-Mavzu`}"
        required
      />
      <button 
        type="button" 
        class="btn-remove-topic p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors" 
        title="O'chirish"
      >
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;

    container.appendChild(row);

    row.querySelector('.btn-remove-topic').onclick = () => {
      if (container.querySelectorAll('.topic-input-row').length <= 1) {
        alert("Kamida 1 ta mavzu bo'lishi kerak!");
        return;
      }
      row.remove();
      this.reindexTopicFields();
      this.calculateAndRenderPlan(false);
    };

    lucide.createIcons();
  }

  reindexTopicFields() {
    const container = document.getElementById('topics-inputs-container');
    if (!container) return;
    container.querySelectorAll('.topic-input-row').forEach((row, idx) => {
      const span = row.querySelector('span');
      if (span) span.textContent = idx + 1;
      const inp = row.querySelector('.topic-input-field');
      if (inp && !inp.value.includes(':')) {
        inp.placeholder = `${idx + 1}-Mavzu nomi...`;
      }
    });
  }

  renderSubjectBreakdown(data) {
    if (!data) {
      data = SUBJECT_DATABASE[this.currentSubjectKey || 'matematika'] || SUBJECT_DATABASE.matematika;
    }

    const container = document.getElementById('ai-subject-breakdown-card');
    if (!container) return;

    const totalMins = parseInt(document.getElementById('input-minutes').value, 10) || this.state.dailyMinutes || 60;
    const theoryMins = Math.round(totalMins * data.theoryRatio);
    const practiceMins = totalMins - theoryMins;

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-base">🧠</span>
            <h4 class="font-heading font-bold text-sm text-slate-900 dark:text-white">
              AI Metodikasi: ${data.name}
            </h4>
          </div>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Kunlik ${totalMins} daqiqa taqsimoti
          </span>
        </div>

        <!-- Theory vs Practice Bar -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Nazariya: ${theoryMins} daqiqa (${Math.round(data.theoryRatio * 100)}%)
            </span>
            <span class="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Misol/Mashq: ${practiceMins} daqiqa (${Math.round((1 - data.theoryRatio) * 100)}%)
            </span>
          </div>

          <div class="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
            <div class="bg-indigo-500 h-full" style="width: ${Math.round(data.theoryRatio * 100)}%" title="Nazariya: ${theoryMins} daqiqa"></div>
            <div class="bg-emerald-500 h-full" style="width: ${Math.round((1 - data.theoryRatio) * 100)}%" title="Amaliyot: ${practiceMins} daqiqa"></div>
          </div>
        </div>

        <!-- First Step Advice (Nimadan boshlash kerak) -->
        <div class="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-1">
          <span class="font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
            <i data-lucide="compass" class="w-4 h-4"></i> Nimadan boshlash kerak (1-Qadam):
          </span>
          <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
            ${data.firstStepAdvice}
          </p>
        </div>

        <!-- Recommended Books & Sources (Manbalar va Kitoblar) -->
        <div class="space-y-1.5 text-xs">
          <span class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <i data-lucide="library" class="w-3.5 h-3.5 text-amber-500"></i> Tavsiya etiladigan manbalar va kitoblar:
          </span>
          <ul class="space-y-1 text-slate-600 dark:text-slate-400 pl-2">
            ${data.books.map(b => `<li class="flex items-start gap-1.5"><span>📖</span> <span>${b}</span></li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    lucide.createIcons();
  }

  sendCurrentPlanToClass() {
    if (!window.authManager || !window.authManager.currentUser) {
      alert("Iltimos, avval o'qituvchi hisobingizga kiring!");
      return;
    }

    const currentSub = SUBJECT_DATABASE[this.currentSubjectKey || 'matematika'] || SUBJECT_DATABASE.matematika;
    const days = this.state.days || 3;
    const minutes = this.state.dailyMinutes || 60;
    const theoryMins = Math.round(minutes * currentSub.theoryRatio);
    const practiceMins = minutes - theoryMins;

    const newAssignment = {
      id: 'assign_' + Date.now(),
      classId: window.authManager.currentUser.classId || 'class_101',
      title: `${currentSub.name} bo'yicha ${days} Kunlik Intensiv Vazifa`,
      subject: currentSub.name,
      days: days,
      dailyMinutes: minutes,
      topics: [...this.state.topics],
      theoryMinutes: theoryMins,
      practiceMinutes: practiceMins,
      sources: currentSub.books,
      firstStepAdvice: currentSub.firstStepAdvice,
      createdAt: 'Hozirgina',
      completedByStudents: []
    };

    window.authManager.assignments.unshift(newAssignment);
    window.authManager.saveAssignments();

    // Send automatic notice to class community chat
    window.authManager.chatMessages.push({
      id: 'msg_' + Date.now(),
      classId: 'class_101',
      senderId: window.authManager.currentUser.id,
      senderName: `${window.authManager.currentUser.name} (Ustoz)`,
      senderRole: 'teacher',
      avatar: '👨‍🏫',
      text: `📢 Diqqat o'quvchilar! Sinfimiz uchun yangi vazifa yuklandi: "${newAssignment.title}" (${days} kun, kuniga ${minutes} daq). Hamma o'rganishni boshlasin!`,
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    });
    window.authManager.saveChatMessages();

    window.authManager.renderAssignmentsList();
    window.authManager.renderChatMessages();

    if (window.soundFx) window.soundFx.playVictory();
    alert(`🎉 Ajoyib! "${newAssignment.title}" rejasi sinfga vazifa qilib muvaffaqiyatli tashlandi va sinf chatida e'lon qilindi!`);
  }

  applyPreset(presetKey) {
    const list = TOPIC_PRESETS[presetKey];
    if (!list) return;

    this.state.topics = [...list];
    for (let i = 0; i < 6; i++) {
      const topicInput = document.getElementById(`input-topic-${i + 1}`);
      if (topicInput) topicInput.value = list[i];
    }
    this.saveState();
    if (window.soundFx) window.soundFx.playClick();
    this.calculateAndRenderPlan(true);
  }

  switchRole(role) {
    this.state.activeRole = role;
    this.saveState();
    if (window.soundFx) window.soundFx.playClick();
    this.renderRoleView();
    if (window.authManager && window.authManager.currentUser) {
      window.authManager.currentUser.role = role;
      window.authManager.renderUserHeader();
    }
  }

  renderRoleView() {
    const studentSection = document.getElementById('student-view-section');
    const teacherSection = document.getElementById('teacher-view-section');

    const studentTabBtn = document.getElementById('tab-btn-student');
    const teacherTabBtn = document.getElementById('tab-btn-teacher');

    if (this.state.activeRole === 'student') {
      if (studentSection) studentSection.classList.remove('hidden');
      if (teacherSection) teacherSection.classList.add('hidden');

      if (studentTabBtn) {
        studentTabBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2";
      }
      if (teacherTabBtn) {
        teacherTabBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all flex items-center gap-2";
      }
    } else {
      if (studentSection) studentSection.classList.add('hidden');
      if (teacherSection) teacherSection.classList.remove('hidden');

      if (studentTabBtn) {
        studentTabBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all flex items-center gap-2";
      }
      if (teacherTabBtn) {
        teacherTabBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2";
      }
      this.renderTeacherDashboard();
    }
    lucide.createIcons();
  }

  renderHeaderBadges() {
    const badgeEl = document.getElementById('user-tier-badge');
    if (!badgeEl) return;
    badgeEl.innerHTML = `
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        ${this.subscription.name}
      </span>
    `;
  }

  // =========================================================================
  // SMART DISTRIBUTION ALGORITHM (2 va 3-qadam)
  // Dynamic distribution algorithm for any number of topics across N days
  // =========================================================================
  calculateDistribution(days, dailyMinutes, topics) {
    if (isNaN(days) || days <= 0) {
      throw new Error("Kunlar soni kamida 1 kun bo'lishi shart! 0 kunlik yoki manfiy qiymat qabul qilinmaydi.");
    }
    if (isNaN(dailyMinutes) || dailyMinutes <= 0) {
      throw new Error("Kunlik daqiqa musbat son bo'lishi shart!");
    }
    if (!Array.isArray(topics) || topics.length === 0) {
      throw new Error("Kamida 1 ta mavzu nomi kiritilishi shart!");
    }

    const totalTopics = topics.length;
    const schedule = [];

    if (days >= totalTopics) {
      for (let d = 0; d < days; d++) {
        if (d < totalTopics) {
          schedule.push({
            dayNumber: d + 1,
            topics: [{
              index: d,
              title: topics[d],
              allocatedMinutes: dailyMinutes
            }],
            totalMinutes: dailyMinutes,
            isRevisionDay: false
          });
        } else {
          schedule.push({
            dayNumber: d + 1,
            topics: [{
              index: -1,
              title: "O'rganilgan mavzularni chuqur qaytarish va sinov testi (Revision & Quiz)",
              allocatedMinutes: dailyMinutes
            }],
            totalMinutes: dailyMinutes,
            isRevisionDay: true
          });
        }
      }
      return schedule;
    }

    // When days < totalTopics
    const baseCount = Math.floor(totalTopics / days);
    const remainder = totalTopics % days;

    let topicPointer = 0;
    for (let d = 0; d < days; d++) {
      const countForThisDay = d < remainder ? baseCount + 1 : baseCount;
      const dayTopics = [];
      const minutesPerTopic = countForThisDay > 0 ? Math.round(dailyMinutes / countForThisDay) : dailyMinutes;

      for (let t = 0; t < countForThisDay; t++) {
        if (topicPointer < totalTopics) {
          dayTopics.push({
            index: topicPointer,
            title: topics[topicPointer],
            allocatedMinutes: minutesPerTopic
          });
          topicPointer++;
        }
      }

      schedule.push({
        dayNumber: d + 1,
        topics: dayTopics,
        totalMinutes: dailyMinutes,
        isRevisionDay: false
      });
    }

    return schedule;
  }

  calculateAndRenderPlan(playAudio = false) {
    const errorAlert = document.getElementById('validation-error-alert');
    const daysInput = document.getElementById('input-days');
    const minutesInput = document.getElementById('input-minutes');

    const days = parseInt(daysInput.value, 10);
    const dailyMinutes = parseInt(minutesInput.value, 10);

    // Read topics from all topic inputs dynamically
    const topicInputs = document.querySelectorAll('.topic-input-field');
    const currentTopics = [];
    if (topicInputs.length > 0) {
      topicInputs.forEach((inp, idx) => {
        const val = inp.value.trim();
        if (val) currentTopics.push(val);
      });
    }

    // Fallback if none provided
    if (currentTopics.length === 0) {
      for (let i = 0; i < 6; i++) {
        const inp = document.getElementById(`input-topic-${i + 1}`);
        const val = inp ? inp.value.trim() : '';
        if (val) currentTopics.push(val);
      }
    }
    if (currentTopics.length === 0) {
      currentTopics.push("1. Kirish va asosiy tushunchalar");
    }

    try {
      // Calculate
      const schedule = this.calculateDistribution(days, dailyMinutes, currentTopics);

      // Validation succeeded
      if (errorAlert) {
        errorAlert.classList.add('hidden');
        errorAlert.textContent = '';
      }

      // Update state
      this.state.days = days;
      this.state.dailyMinutes = dailyMinutes;
      this.state.topics = currentTopics;
      this.saveState();

      // Render Schedule Cards
      this.currentSchedule = schedule;
      this.renderSchedule();
      this.renderProgress();

      if (playAudio && window.soundFx) {
        window.soundFx.playClick();
      }

      // Smooth scroll to schedule on mobile/tablets
      const planHeading = document.getElementById('plan-results-heading');
      if (planHeading && window.innerWidth < 1024) {
        planHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } catch (err) {
      // Show strict validation error
      if (errorAlert) {
        errorAlert.innerHTML = `
          <div class="flex items-center gap-3">
            <i data-lucide="alert-triangle" class="w-5 h-5 text-rose-400 shrink-0"></i>
            <span>${err.message}</span>
          </div>
        `;
        errorAlert.classList.remove('hidden');
        lucide.createIcons();
      }
      if (playAudio && window.soundFx) {
        window.soundFx.playError();
      }
    }
  }

  renderSchedule() {
    const container = document.getElementById('schedule-cards-grid');
    if (!container || !this.currentSchedule) return;

    container.innerHTML = '';

    this.currentSchedule.forEach((dayData) => {
      const isDayFullyCompleted = dayData.topics.every(t => 
        t.index === -1 ? true : this.state.completedTopics.includes(t.index)
      );

      const dayHours = Math.floor(dayData.totalMinutes / 60);
      const dayMins = dayData.totalMinutes % 60;
      const timeStr = `${dayHours} soat ${dayMins > 0 ? dayMins + ' daq' : ''}`;

      const card = document.createElement('div');
      card.className = `glass-panel rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${
        isDayFullyCompleted ? 'border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-950/30' : 'border-slate-800'
      }`;

      // Topics HTML
      let topicsHtml = '';
      dayData.topics.forEach((topic) => {
        const isTopicCompleted = topic.index !== -1 && this.state.completedTopics.includes(topic.index);
        const tHours = Math.floor(topic.allocatedMinutes / 60);
        const tMins = topic.allocatedMinutes % 60;
        const topicTimeStr = tHours > 0 ? `${tHours}s ${tMins > 0 ? tMins + 'd' : ''}` : `${tMins} daqiqa`;

        topicsHtml += `
          <div class="topic-card flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 ${
            isTopicCompleted 
              ? 'completed border-emerald-500/30 bg-emerald-500/10' 
              : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700'
          }" data-topic-index="${topic.index}">
            <div class="pt-0.5">
              ${topic.index !== -1 ? `
                <input 
                  type="checkbox" 
                  class="custom-checkbox topic-checkbox" 
                  data-index="${topic.index}"
                  ${isTopicCompleted ? 'checked' : ''}
                  aria-label="Mavzuni bajarilgan deb belgilash"
                />
              ` : `
                <span class="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">★</span>
              `}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <h4 class="topic-title text-sm font-semibold ${isTopicCompleted ? 'text-slate-400 line-through' : 'text-slate-100'} truncate">
                  ${topic.title}
                </h4>
                <span class="shrink-0 text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ${topicTimeStr}
                </span>
              </div>
              <div class="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-xs text-slate-400">
                <span class="flex items-center gap-1">
                  <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i>
                  ${topic.allocatedMinutes} daqiqa fokus
                </span>
                <button 
                  type="button" 
                  class="start-topic-timer-btn text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
                  data-minutes="${topic.allocatedMinutes}"
                  data-name="${topic.title.replace(/"/g, '&quot;')}"
                >
                  <i data-lucide="play-circle" class="w-3.5 h-3.5"></i>
                  Taymerda o'rganish
                </button>
              </div>
            </div>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/20">
              ${dayData.dayNumber}
            </div>
            <div>
              <h3 class="font-heading font-bold text-base text-slate-100 flex items-center gap-2">
                ${dayData.dayNumber}-Kun Rejasi
                ${isDayFullyCompleted ? '<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-normal">Tugallandi ✓</span>' : ''}
              </h3>
              <p class="text-xs text-slate-400">Ajratilgan umumiy vaqt: <span class="text-emerald-400 font-semibold">${timeStr} (${dayData.totalMinutes} daq)</span></p>
            </div>
          </div>
          <span class="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50">
            ${dayData.topics.length} ta mavzu
          </span>
        </div>

        <div class="space-y-2.5">
          ${topicsHtml}
        </div>
      `;

      container.appendChild(card);
    });

    // Attach listeners for checkboxes
    container.querySelectorAll('.topic-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        this.toggleTopicCompletion(idx, e.target.checked);
      });
    });

    // Attach listeners for Quick Timer buttons
    container.querySelectorAll('.start-topic-timer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mins = parseInt(e.currentTarget.getAttribute('data-minutes'), 10);
        const name = e.currentTarget.getAttribute('data-name');
        this.startTimerForTopic(name, mins);
      });
    });

    lucide.createIcons();
  }

  // =========================================================================
  // KUZATISH, PROGRESS BAR VA STATE PERSISTENCE (4-qadam)
  // =========================================================================
  toggleTopicCompletion(topicIndex, isChecked) {
    if (isChecked) {
      if (!this.state.completedTopics.includes(topicIndex)) {
        this.state.completedTopics.push(topicIndex);
      }
    } else {
      this.state.completedTopics = this.state.completedTopics.filter(i => i !== topicIndex);
    }

    this.saveState();
    this.renderProgress();
    this.renderSchedule();

    // Trigger audio & celebratory animations
    const count = this.state.completedTopics.length;
    const totalTopics = this.state.topics.length || 6;
    if (window.soundFx) {
      if (count === totalTopics && totalTopics > 0) {
        window.soundFx.playVictory();
        this.launchConfetti();
      } else if (count === Math.ceil(totalTopics / 2)) {
        window.soundFx.playHalfway();
      } else {
        window.soundFx.playCheck(isChecked);
      }
    }
  }

  /**
   * DYNAMIC REAL-TIME PROGRESS CALCULATION:
   * Supports any number of topics (e.g. 3 topics -> 1 done = 33%, 2 done = 67%, 3 done = 100%).
   * 6 topics -> 3 done = 50%, 6 done = 100%.
   */
  renderProgress() {
    const total = this.state.topics.length || 6;
    const completed = this.state.completedTopics.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Percentage displays
    const percentLabel = document.getElementById('progress-percentage-label');
    const circularPercent = document.getElementById('circular-progress-text');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const completedCounter = document.getElementById('completed-count-text');
    const remainingTimeBadge = document.getElementById('remaining-minutes-badge');

    if (percentLabel) percentLabel.textContent = `${percentage}%`;
    if (circularPercent) circularPercent.textContent = `${percentage}%`;
    if (progressBarFill) {
      progressBarFill.style.width = `${percentage}%`;
    }
    if (completedCounter) {
      completedCounter.textContent = `${completed} / ${total} ta mavzu bajarildi (${percentage}%)`;
    }

    // Circular SVG Dashoffset calculation
    const circle = document.getElementById('circular-progress-svg-circle');
    if (circle) {
      const radius = 42;
      const circumference = 2 * Math.PI * radius; // ~263.89
      const offset = circumference - (percentage / 100) * circumference;
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      circle.style.strokeDashoffset = offset;
    }

    // Remaining Minutes Calculation
    if (remainingTimeBadge && this.currentSchedule) {
      let totalAllMinutes = this.state.days * this.state.dailyMinutes;
      // Proportional remaining
      let remainingPercent = 100 - percentage;
      let remainingMinutes = Math.round((remainingPercent / 100) * totalAllMinutes);
      let rHours = Math.floor(remainingMinutes / 60);
      let rMins = remainingMinutes % 60;
      remainingTimeBadge.textContent = `${rHours} soat ${rMins > 0 ? rMins + ' daqiqa' : ''} qoldi`;
    }

    // Status Banner text
    const statusBanner = document.getElementById('progress-status-banner');
    if (statusBanner) {
      if (percentage === 100) {
        statusBanner.innerHTML = `
          <div class="flex items-center gap-2 text-emerald-400 font-bold">
            <i data-lucide="award" class="w-5 h-5"></i>
            Mukammal natija! Barcha 6 ta mavzu muvaffaqiyatli yakunlandi. Siz imtihonga 100% tayyorsiz!
          </div>
        `;
      } else if (percentage === 50) {
        statusBanner.innerHTML = `
          <div class="flex items-center gap-2 text-cyan-400 font-semibold">
            <i data-lucide="zap" class="w-5 h-5"></i>
            Yarim yo'l bosib o'tildi (50%)! Ajoyib temp, diqqatni susaytirmang!
          </div>
        `;
      } else if (percentage > 0) {
        statusBanner.innerHTML = `
          <div class="flex items-center gap-2 text-slate-300">
            <i data-lucide="trending-up" class="w-4 h-4 text-emerald-400"></i>
            Faol o'rganish jarayonida: ${percentage}% o'zlashtirildi.
          </div>
        `;
      } else {
        statusBanner.innerHTML = `
          <div class="flex items-center gap-2 text-slate-400">
            <i data-lucide="compass" class="w-4 h-4 text-slate-500"></i>
            Tayyorgarlikni boshlash uchun mavzularni bajaring va belgilang.
          </div>
        `;
      }
      lucide.createIcons();
    }
  }

  launchConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#3b82f6']
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#06b6d4']
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#8b5cf6', '#ec4899']
        });
      }, 250);
    }
  }

  // =========================================================================
  // FOCUS STUDY TIMER & POMODORO (Qo'shimcha Qulaylik)
  // =========================================================================
  bindTimerControls() {
    const playBtn = document.getElementById('timer-play-pause-btn');
    const resetBtn = document.getElementById('timer-reset-btn');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (this.isTimerRunning) {
          this.pauseTimer();
        } else {
          this.startTimer();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetTimer();
      });
    }
  }

  startTimerForTopic(topicTitle, minutes) {
    const topicDisplay = document.getElementById('current-timer-topic-name');
    if (topicDisplay) topicDisplay.textContent = topicTitle;

    this.timerSeconds = minutes * 60;
    this.updateTimerDisplay();
    this.startTimer();

    // Scroll smoothly to timer widget
    const timerWidget = document.getElementById('study-timer-widget');
    if (timerWidget) {
      timerWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      timerWidget.classList.add('ring-2', 'ring-cyan-400');
      setTimeout(() => timerWidget.classList.remove('ring-2', 'ring-cyan-400'), 1200);
    }
  }

  startTimer() {
    if (this.timerSeconds <= 0) {
      this.timerSeconds = 25 * 60; // Default 25 min Pomodoro
    }
    this.isTimerRunning = true;
    if (window.soundFx) window.soundFx.playClick();

    const playBtn = document.getElementById('timer-play-pause-btn');
    if (playBtn) {
      playBtn.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i> To'xtatish`;
      playBtn.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-500/20";
      lucide.createIcons();
    }

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        this.updateTimerDisplay();
      } else {
        this.pauseTimer();
        if (window.soundFx) window.soundFx.playVictory();
        alert("Vaqt tugadi! Ajoyib fokus mashg'uloti yakunlandi.");
      }
    }, 1000);
  }

  pauseTimer() {
    this.isTimerRunning = false;
    clearInterval(this.timerInterval);
    if (window.soundFx) window.soundFx.playClick();

    const playBtn = document.getElementById('timer-play-pause-btn');
    if (playBtn) {
      playBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i> Boshlash`;
      playBtn.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20";
      lucide.createIcons();
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.timerSeconds = 25 * 60;
    this.updateTimerDisplay();
    const topicDisplay = document.getElementById('current-timer-topic-name');
    if (topicDisplay) topicDisplay.textContent = "Standart Pomodoro (25 daq)";
  }

  updateTimerDisplay() {
    const display = document.getElementById('study-timer-countdown');
    if (!display) return;
    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // =========================================================================
  // TEACHER DASHBOARD & SUBSCRIPTION MOCKUP (4-qism)
  // =========================================================================
  bindTeacherControls() {
    // Open new student modal
    const addStudentBtn = document.getElementById('btn-open-add-student-modal');
    const modal = document.getElementById('add-student-modal');
    const closeModalBtn = document.getElementById('btn-close-student-modal');
    const form = document.getElementById('add-student-form');

    if (addStudentBtn && modal) {
      addStudentBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        if (window.soundFx) window.soundFx.playClick();
      });
    }

    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-student-name').value.trim();
        const subject = document.getElementById('new-student-subject').value.trim();
        const days = parseInt(document.getElementById('new-student-days').value, 10) || 3;
        const minutes = parseInt(document.getElementById('new-student-minutes').value, 10) || 600;

        if (!name || !subject) return;

        const newStudent = {
          id: 'std_' + Date.now(),
          name: name,
          avatar: '👨‍🎓',
          subject: subject,
          days: days,
          dailyMinutes: minutes,
          topicsCount: 6,
          completedCount: 0,
          lastActive: 'Hozirgina qo\'shildi',
          status: 'Boshlanmoqda',
          teacherNote: 'Yangi tayyorgarlik rejasi tuzildi.'
        };

        this.students.unshift(newStudent);
        this.saveStudents();
        this.renderTeacherDashboard();
        modal.classList.add('hidden');
        form.reset();
        if (window.soundFx) window.soundFx.playCheck(true);
      });
    }

    // Subscription Upgrade Buttons
    document.querySelectorAll('[data-plan-upgrade]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const planKey = e.currentTarget.getAttribute('data-plan-upgrade');
        this.handlePlanUpgrade(planKey);
      });
    });
  }

  handlePlanUpgrade(planKey) {
    const plans = {
      free: { plan: 'free', name: 'Starter (Bepul)', expiresAt: 'Cheksiz' },
      pro: { plan: 'pro', name: 'Pro Ustoz', expiresAt: '2026-12-31' },
      institutional: { plan: 'institutional', name: 'Edu Maktab/Markaz', expiresAt: '2027-01-01' }
    };

    const selected = plans[planKey] || plans.pro;
    this.saveSubscription(selected);
    if (window.soundFx) window.soundFx.playVictory();
    alert(`🎉 Tabriklaymiz! "${selected.name}" tarifiga muvaffaqiyatli obuna bo'ldingiz.`);
    this.renderTeacherDashboard();
  }

  renderTeacherDashboard() {
    const container = document.getElementById('teacher-students-list');
    if (!container) return;

    // Summary Metrics
    const totalStudentsEl = document.getElementById('metric-total-students');
    const avgProgressEl = document.getElementById('metric-avg-progress');
    const totalHoursEl = document.getElementById('metric-total-hours');

    if (totalStudentsEl) totalStudentsEl.textContent = this.students.length;

    // Calculate Average
    let totalPercents = 0;
    let totalMins = 0;
    this.students.forEach(s => {
      totalPercents += Math.round((s.completedCount / s.topicsCount) * 100);
      totalMins += (s.days * s.dailyMinutes);
    });

    const avg = this.students.length > 0 ? Math.round(totalPercents / this.students.length) : 0;
    if (avgProgressEl) avgProgressEl.textContent = `${avg}%`;
    if (totalHoursEl) totalHoursEl.textContent = `${Math.round(totalMins / 60)} soat`;

    // Render Student Cards
    container.innerHTML = '';
    this.students.forEach(student => {
      const percent = Math.round((student.completedCount / student.topicsCount) * 100);
      const row = document.createElement('div');
      row.className = 'glass-panel rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-all duration-200';

      row.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
              ${student.avatar}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-heading font-bold text-base text-slate-100">${student.name}</h4>
                <span class="text-xs px-2 py-0.5 rounded-full ${
                  percent === 100 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : percent >= 50 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'bg-amber-500/20 text-amber-400'
                }">${student.status}</span>
              </div>
              <p class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>📚 ${student.subject}</span>
                <span>•</span>
                <span>⏱ ${student.days} kun / kuniga ${student.dailyMinutes} daq</span>
              </p>
            </div>
          </div>

          <!-- Progress Section -->
          <div class="flex-1 max-w-xs">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="text-slate-400">Reja bajarilishi</span>
              <span class="font-bold font-mono text-emerald-400">${student.completedCount}/${student.topicsCount} mavzu (${percent}%)</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <button 
              type="button" 
              class="student-note-btn text-xs px-3 py-1.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              data-id="${student.id}"
            >
              <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
              Tavsiya
            </button>
            <button 
              type="button" 
              class="student-load-plan-btn text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-white flex items-center gap-1.5 transition-all"
              data-name="${student.name}"
              data-days="${student.days}"
              data-minutes="${student.dailyMinutes}"
            >
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              Rejasini tekshirish
            </button>
            <button 
              type="button" 
              class="student-delete-btn text-xs p-1.5 rounded-xl border border-slate-700/80 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              data-id="${student.id}"
              title="Sinfdan o'chirish"
            >
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <!-- Teacher Note Quote -->
        <div class="mt-3 pt-2.5 border-t border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
          <div class="flex items-center gap-2 italic">
            <i data-lucide="edit-3" class="w-3 h-3 text-cyan-400 shrink-0"></i>
            <span>Ustoz izohi: "${student.teacherNote}"</span>
          </div>
          <span class="text-[11px] text-slate-500 shrink-0">${student.lastActive}</span>
        </div>
      `;

      container.appendChild(row);
    });

    // Attach student note editing
    container.querySelectorAll('.student-note-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const st = this.students.find(s => s.id === id);
        if (st) {
          const newNote = prompt(`${st.name} uchun yangi tavsiya yoki izoh yozing:`, st.teacherNote);
          if (newNote !== null && newNote.trim() !== '') {
            st.teacherNote = newNote.trim();
            this.saveStudents();
            this.renderTeacherDashboard();
          }
        }
      });
    });

    // Attach student delete from class
    container.querySelectorAll('.student-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm("Ushbu o'quvchini sinf ro'yxatidan o'chirishni xohlaysizmi?")) {
          this.students = this.students.filter(s => s.id !== id);
          this.saveStudents();
          this.renderTeacherDashboard();
          if (window.soundFx) window.soundFx.playClick();
        }
      });
    });

    // Attach "Rejasini tekshirish" (loads into planner view)
    container.querySelectorAll('.student-load-plan-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const days = parseInt(e.currentTarget.getAttribute('data-days'), 10);
        const minutes = parseInt(e.currentTarget.getAttribute('data-minutes'), 10);
        const name = e.currentTarget.getAttribute('data-name');

        const daysInput = document.getElementById('input-days');
        const minutesInput = document.getElementById('input-minutes');
        if (daysInput) daysInput.value = days;
        if (minutesInput) minutesInput.value = minutes;

        this.switchRole('student');
        this.calculateAndRenderPlan(true);
        alert(`👨‍🎓 ${name} ning tayyorgarlik rejasi yuklandi: ${days} kun, kuniga ${minutes} daqiqa.`);
      });
    });

    lucide.createIcons();
  }

  // =========================================================================
  // KEYINGI BOSQICH: AI IMTIHON SINOVI & TAYYORGARLIK SERTIFIKATI (PHASE 2)
  // =========================================================================
  initPhase2Exam() {
    this.quizAnswers = {};
    this.quizSubmitted = false;

    // Generate questions dynamically based on the 6 current topics
    this.generateTopicQuiz();

    // Attach listeners for quiz
    const submitBtn = document.getElementById('btn-submit-ai-quiz');
    if (submitBtn) {
      submitBtn.onclick = () => this.evaluateQuiz();
    }

    const printCertBtn = document.getElementById('btn-print-certificate');
    if (printCertBtn) {
      printCertBtn.onclick = () => {
        window.print();
      };
    }

    const retakeBtn = document.getElementById('btn-retake-quiz');
    if (retakeBtn) {
      retakeBtn.onclick = () => {
        this.quizAnswers = {};
        this.quizSubmitted = false;
        this.generateTopicQuiz();
        const resEl = document.getElementById('quiz-results-container');
        if (resEl) resEl.classList.add('hidden');
      };
    }

    const shareBtn = document.getElementById('btn-share-plan');
    if (shareBtn) {
      shareBtn.onclick = () => {
        const text = `🎓 IlmHub AI orqali imtihonga tayyorgarlik rejam:\n📚 ${this.state.topics.join('\n')}\n⏱ ${this.state.days} kun, kuniga ${this.state.dailyMinutes} daqiqa.\nBajarildi: ${this.state.completedTopics.length}/6 mavzu (${Math.round((this.state.completedTopics.length/6)*100)}%).`;
        navigator.clipboard.writeText(text).then(() => {
          alert("📋 Tayyorgarlik rejasi va natijangiz xotiraga nusxalandi! Do'stlaringizga yuborishingiz mumkin.");
        });
      };
    }
  }

  generateTopicQuiz() {
    const container = document.getElementById('ai-quiz-questions-list');
    if (!container) return;

    container.innerHTML = '';
    const sampleOptions = [
      {
        q: "ushbu mavzuning fundamental tamoyili va asosiy qonuniyati nima?",
        options: [
          "Nazariy asoslarni tizimli qo'llash va formulalar tahlili (To'g'ri)",
          "Faqat yodlab olish va kontekstsiz eslab qolish",
          "Mavzuni o'rganmasdan test yechishga o'tish",
          "Hech qanday mantiqiy bog'liqliksiz tasodifiy tahlil"
        ],
        correct: 0
      },
      {
        q: "ushbu mavzuni imtihonda yechishda eng samarali yondashuv qaysi?",
        options: [
          "Barcha shartlarni diqqat bilan ajratib, oraliq hisob-kitoblarni tekshirish (To'g'ri)",
          "Birinchi ko'ringan variantni darhol belgilash",
          "Vaqtni faqat bitta murakkab bandga to'liq sarflash",
          "Xatolik ehtimolini e'tiborsiz qoldirish"
        ],
        correct: 0
      }
    ];

    this.state.topics.forEach((topicName, idx) => {
      const qCard = document.createElement('div');
      qCard.className = "p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3 transition-all";

      const optType = sampleOptions[idx % 2];
      const optHtml = optType.options.map((opt, oIdx) => `
        <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500/30 cursor-pointer transition-all bg-white dark:bg-slate-900/40">
          <input 
            type="radio" 
            name="quiz_q_${idx}" 
            value="${oIdx}" 
            class="text-emerald-500 focus:ring-emerald-500 w-4 h-4"
            onchange="window.app.quizAnswers[${idx}] = ${oIdx}"
          />
          <span class="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
            ${['A', 'B', 'C', 'D'][oIdx]}) ${opt}
          </span>
        </label>
      `).join('');

      qCard.innerHTML = `
        <div class="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span class="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            ${idx + 1}-Savol • ${topicName.split(':')[0]}
          </span>
          <span class="text-[11px] text-slate-500 dark:text-slate-400">1 ball</span>
        </div>
        <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          "${topicName}" ${optType.q}
        </p>
        <div class="space-y-2 pt-1">
          ${optHtml}
        </div>
      `;

      container.appendChild(qCard);
    });

    lucide.createIcons();
  }

  evaluateQuiz() {
    let score = 0;
    const total = this.state.topics.length || 6;
    for (let i = 0; i < total; i++) {
      if (this.quizAnswers[i] === 0) {
        score++;
      }
    }

    const percent = Math.round((score / total) * 100);
    const resultsContainer = document.getElementById('quiz-results-container');
    const scoreText = document.getElementById('quiz-score-badge');
    const scoreAdvice = document.getElementById('quiz-score-advice');

    if (scoreText) scoreText.textContent = `${score} / ${total} ta to'g'ri (${percent}%)`;

    if (scoreAdvice) {
      if (percent >= 80) {
        scoreAdvice.textContent = "🏆 A'lo natija! Siz barcha asosiy mavzularni chuqur o'zlashtirgansiz. Haqiqiy imtihonda yuqori ball olishga to'liq tayyorsiz.";
      } else if (percent >= 50) {
        scoreAdvice.textContent = "👍 Yaxshi daraja! Asosiy konsepsiyalarni bilasiz, biroq xatolarni kamaytirish uchun qiyin mavzularga qo'shimcha fokus qiling.";
      } else {
        scoreAdvice.textContent = "💡 Qo'shimcha takrorlash zarur. Rejadagi mavzularni yana bir bor taymer yordamida chuqur ko'rib chiqishni tavsiya etamiz.";
      }
    }

    if (resultsContainer) {
      resultsContainer.classList.remove('hidden');
      resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Populate certificate
    this.updateCertificate(score, percent);

    if (window.soundFx) {
      if (percent >= 80) {
        window.soundFx.playVictory();
        this.launchConfetti();
      } else {
        window.soundFx.playHalfway();
      }
    }
  }

  updateCertificate(score, percent) {
    const studentNameEl = document.getElementById('cert-student-name');
    const certDateEl = document.getElementById('cert-date');
    const certHoursEl = document.getElementById('cert-total-hours');
    const certScoreEl = document.getElementById('cert-score-badge');
    const certTopicsEl = document.getElementById('cert-topics-list');

    if (studentNameEl) studentNameEl.textContent = "Imtihon Nomzodi (O'quvchi)";
    if (certDateEl) {
      const now = new Date();
      certDateEl.textContent = now.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    const totalHours = Math.round((this.state.days * this.state.dailyMinutes) / 60);
    if (certHoursEl) certHoursEl.textContent = `${totalHours} soatlik intensiv tayyorgarlik`;
    if (certScoreEl) certScoreEl.textContent = `${percent}% Tayyorgarlik Darajasi`;

    if (certTopicsEl) {
      certTopicsEl.innerHTML = this.state.topics.map(t => `
        <span class="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          ${t}
        </span>
      `).join(' ');
    }
  }
}

// Global robust bootstrap
function bootstrapApp() {
  if (!window.app) {
    window.app = new ExamPlannerApp();
    if (window.app.initPhase2Exam) {
      window.app.initPhase2Exam();
    }
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}

