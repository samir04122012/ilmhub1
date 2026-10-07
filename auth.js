/**
 * IlmHub AI - Authentication, Classes & Community Chat Manager
 * Handles:
 * - User Sign In / Sign Up with Roles (Student vs Teacher)
 * - Class creation and student enrollment
 * - Class Assignments (sent by teachers, completed by students)
 * - Real-time Class Community Chat
 */

const AUTH_USER_KEY = 'ilmhub_current_user_v2';
const USERS_LIST_KEY = 'ilmhub_registered_users_v2';
const CLASSES_KEY = 'ilmhub_classes_data_v2';
const ASSIGNMENTS_KEY = 'ilmhub_class_assignments_v2';
const CHAT_MESSAGES_KEY = 'ilmhub_class_chat_messages_v2';

// Initial Seed Users
const DEFAULT_USERS = [
  {
    id: 'user_teacher_1',
    name: 'Dilshod Rahmatov',
    email: 'ustoz@ilmhub.uz',
    password: '123',
    role: 'teacher', // 'student' | 'teacher'
    subject: 'Matematika & Aniq Fanlar',
    institution: 'Toshkent IT Akademiyasi',
    avatar: '👨‍🏫',
    classId: 'class_101'
  },
  {
    id: 'user_student_1',
    name: 'Azizbek Mahmudov',
    email: 'student@ilmhub.uz',
    password: '123',
    role: 'student',
    grade: '10-A Sinf',
    classId: 'class_101',
    avatar: '👨‍🎓',
    primarySubject: 'Matematika'
  },
  {
    id: 'user_student_2',
    name: 'Madina Karimova',
    email: 'madina@ilmhub.uz',
    password: '123',
    role: 'student',
    grade: '10-A Sinf',
    classId: 'class_101',
    avatar: '👩‍🎓',
    primarySubject: 'Ingliz tili'
  }
];

// Initial Seed Class
const DEFAULT_CLASSES = [
  {
    id: 'class_101',
    name: '10-A Sinf: Matematika & Aniq Fanlar',
    code: 'ILM-10A',
    teacherId: 'user_teacher_1',
    teacherName: 'Dilshod Rahmatov',
    subject: 'Matematika',
    studentIds: ['user_student_1', 'user_student_2']
  }
];

// Initial Seed Assignments from Teacher
const DEFAULT_ASSIGNMENTS = [
  {
    id: 'assign_1',
    classId: 'class_101',
    title: 'Hosilalar va Limitlar Bo\'yicha 3 Kunlik Intensiv',
    subject: 'Matematika',
    days: 3,
    dailyMinutes: 60,
    topics: [
      '1. Funksiya limiti va uzluksizligi',
      '2. Hosila ta\'rifi va differensiallash qoidalari',
      '3. Murakkab funksiyalarning hosilasi'
    ],
    theoryMinutes: 20,
    practiceMinutes: 40,
    sources: [
      'S.Usmonov "Matematika to\'plami" (14-28 betlar)',
      'Algebra 10-sinf darsligi (bob 3)',
      'Khan Academy Uzbek video darslari'
    ],
    firstStepAdvice: '1-kuni avval asosiy teoremalarni konspekt qiling, so\'ngra 10 ta sodda misol yeching.',
    createdAt: 'Bugun, 09:00',
    completedByStudents: ['user_student_2'] // Madina completed it
  }
];

// Initial Seed Chat Messages
const DEFAULT_CHAT = [
  {
    id: 'msg_1',
    classId: 'class_101',
    senderId: 'user_teacher_1',
    senderName: 'Dilshod Rahmatov (Ustoz)',
    senderRole: 'teacher',
    avatar: '👨‍🏫',
    text: 'Assalomu alaykum o\'quvchilar! Sinfimizga xush kelibsiz. Bugun "Hosilalar" bo\'yicha yangi AI vazifani joyladim. Har biringiz o\'rganishni boshlang.',
    time: '09:05'
  },
  {
    id: 'msg_2',
    classId: 'class_101',
    senderId: 'user_student_1',
    senderName: 'Azizbek Mahmudov',
    senderRole: 'student',
    avatar: '👨‍🎓',
    text: 'Ustoz, Usmonov to\'plamidan 14-betdagi 12-misolda qiyinchilik bo\'lyapti, yechimini chatga tashlasam bo\'ladimi?',
    time: '09:40'
  },
  {
    id: 'msg_3',
    classId: 'class_101',
    senderId: 'user_teacher_1',
    senderName: 'Dilshod Rahmatov (Ustoz)',
    senderRole: 'teacher',
    avatar: '👨‍🏫',
    text: 'Albatta Azizbek, o\'sha misolda avval almashtirish usulidan foydalan, qolganlar ham ko\'rib fikr bildirsin.',
    time: '09:45'
  }
];

class AuthAndClassManager {
  constructor() {
    this.currentUser = this.loadCurrentUser();
    this.users = this.loadUsers();
    this.classes = this.loadClasses();
    this.assignments = this.loadAssignments();
    this.chatMessages = this.loadChatMessages();

    this.init();
  }

  loadCurrentUser() {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) return JSON.parse(saved);
      const isExplicitGuest = localStorage.getItem('ilmhub_explicit_guest');
      if (isExplicitGuest === 'true') return null;
    } catch (e) {}
    // Default to active Demo Student on initial launch so all panels & buttons are instantly testable!
    return DEFAULT_USERS[1]; 
  }

  saveCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.removeItem('ilmhub_explicit_guest');
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.setItem('ilmhub_explicit_guest', 'true');
    }
    this.applyAuthGuard();
  }

  // Authentication Guard: Ensures guests cannot access calculations/data
  applyAuthGuard() {
    const guestLandingSection = document.getElementById('guest-landing-section');
    const protectedAppSection = document.getElementById('protected-app-section');
    const guestArea = document.getElementById('header-guest-area');
    const userArea = document.getElementById('header-user-profile-area');
    const roleNav = document.getElementById('header-role-nav');
    const heroGuestActions = document.getElementById('hero-guest-actions');
    const heroAuthPanel = document.getElementById('hero-authenticated-panel');

    if (!this.currentUser) {
      // Guest Mode: Show informative Landing Page, completely hide calculations and private data
      if (guestLandingSection) guestLandingSection.classList.remove('hidden');
      if (protectedAppSection) protectedAppSection.classList.add('hidden');
      if (guestArea) guestArea.classList.remove('hidden');
      if (userArea) userArea.classList.add('hidden');
      if (roleNav) roleNav.classList.add('hidden');
      if (heroGuestActions) heroGuestActions.classList.remove('hidden');
      if (heroAuthPanel) heroAuthPanel.classList.add('hidden');
    } else {
      // Authenticated Mode: Unlock calculations, AI planner, class assignments, and chat
      if (guestLandingSection) guestLandingSection.classList.add('hidden');
      if (protectedAppSection) protectedAppSection.classList.remove('hidden');
      if (guestArea) guestArea.classList.add('hidden');
      if (userArea) userArea.classList.remove('hidden');
      if (roleNav) roleNav.classList.remove('hidden');
      if (heroGuestActions) heroGuestActions.classList.add('hidden');
      if (heroAuthPanel) {
        heroAuthPanel.classList.remove('hidden');
        const heroName = document.getElementById('hero-auth-user-name');
        const heroRole = document.getElementById('hero-auth-role-badge');
        const heroClass = document.getElementById('hero-auth-class-badge');
        const heroAvatar = document.getElementById('hero-auth-avatar');

        if (heroName) heroName.textContent = this.currentUser.name;
        if (heroRole) heroRole.textContent = this.currentUser.role === 'teacher' ? "Ustoz / O'qituvchi" : "O'quvchi";
        if (heroClass) heroClass.textContent = this.currentUser.grade || (this.currentUser.role === 'teacher' ? this.currentUser.institution : "10-A Sinf");
        if (heroAvatar) heroAvatar.textContent = this.currentUser.avatar || (this.currentUser.role === 'teacher' ? "👨‍🏫" : "👨‍🎓");
      }

      // Teacher tab in main module nav
      const teacherTab = document.getElementById('tab-nav-teacher');
      if (teacherTab) {
        if (this.currentUser.role === 'teacher') {
          teacherTab.classList.remove('hidden');
        } else {
          teacherTab.classList.add('hidden');
        }
      }

      // Restore active module or default to plans
      const currentModule = localStorage.getItem('ilmhub_active_module') || 'plans';
      if (typeof window.switchAppModule === 'function') {
        window.switchAppModule(currentModule);
      }
    }
    if (window.lucide) lucide.createIcons();
  }

  // Guard interceptor for protected actions
  requireAuth(callback) {
    if (!this.currentUser) {
      this.showAuthModal('signin');
      if (window.soundFx) window.soundFx.playError();
      return false;
    }
    if (typeof callback === 'function') {
      callback();
    }
    return true;
  }

  loadUsers() {
    try {
      const saved = localStorage.getItem(USERS_LIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_USERS;
  }

  saveUsers() {
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(this.users));
  }

  loadClasses() {
    try {
      const saved = localStorage.getItem(CLASSES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CLASSES;
  }

  saveClasses() {
    localStorage.setItem(CLASSES_KEY, JSON.stringify(this.classes));
  }

  loadAssignments() {
    try {
      const saved = localStorage.getItem(ASSIGNMENTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_ASSIGNMENTS;
  }

  saveAssignments() {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(this.assignments));
  }

  loadChatMessages() {
    try {
      const saved = localStorage.getItem(CHAT_MESSAGES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CHAT;
  }

  saveChatMessages() {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(this.chatMessages));
  }

  init() {
    this.bindAuthModals();
    this.renderUserHeader();
    this.applyAuthGuard();
    this.renderCurrentViewByRole();
    this.renderClassSection();
  }

  bindAuthModals() {
    // Open Sign In Modal
    const openSignInBtn = document.getElementById('btn-open-signin');
    const openSignUpBtn = document.getElementById('btn-open-signup');
    const authModal = document.getElementById('auth-modal');
    const closeAuthBtn = document.getElementById('btn-close-auth-modal');

    if (openSignInBtn && authModal) {
      openSignInBtn.onclick = () => this.showAuthModal('signin');
    }
    if (openSignUpBtn && authModal) {
      openSignUpBtn.onclick = () => this.showAuthModal('signup');
    }
    if (closeAuthBtn && authModal) {
      closeAuthBtn.onclick = () => authModal.classList.add('hidden');
    }

    // Role radio toggle inside Sign Up
    const roleStudentRadio = document.getElementById('signup-role-student');
    const roleTeacherRadio = document.getElementById('signup-role-teacher');
    const studentExtraFields = document.getElementById('signup-student-fields');
    const teacherExtraFields = document.getElementById('signup-teacher-fields');

    if (roleStudentRadio && roleTeacherRadio) {
      roleStudentRadio.onchange = () => {
        studentExtraFields.classList.remove('hidden');
        teacherExtraFields.classList.add('hidden');
      };
      roleTeacherRadio.onchange = () => {
        studentExtraFields.classList.add('hidden');
        teacherExtraFields.classList.remove('hidden');
      };
    }

    // Sign In Form Submit
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
      signinForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value.trim();
        const pass = document.getElementById('signin-password').value.trim();

        const user = this.users.find(u => u.email === email && u.password === pass);
        if (user) {
          this.login(user);
        } else {
          alert("Email yoki parol noto'g'ri kiritildi! Demo uchun: student@ilmhub.uz yoki ustoz@ilmhub.uz (parol: 123)");
        }
      };
    }

    // Sign Up Form Submit
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const pass = document.getElementById('signup-password').value.trim();
        const isTeacher = document.getElementById('signup-role-teacher').checked;
        const role = isTeacher ? 'teacher' : 'student';

        // Check if exists
        if (this.users.some(u => u.email === email)) {
          alert("Bu email orqali allaqachon ro'yxatdan o'tilgan!");
          return;
        }

        const newUser = {
          id: 'user_' + Date.now(),
          name: name,
          email: email,
          password: pass,
          role: role,
          avatar: role === 'teacher' ? '👨‍🏫' : '👨‍🎓',
          classId: 'class_101'
        };

        if (role === 'teacher') {
          newUser.subject = document.getElementById('signup-teacher-subject').value.trim() || 'Umumiy fanlar';
          newUser.institution = document.getElementById('signup-teacher-institution').value.trim() || 'IlmHub Ta\'lim';
        } else {
          newUser.grade = document.getElementById('signup-student-grade').value.trim() || '10-A Sinf';
          newUser.primarySubject = document.getElementById('signup-student-subject').value || 'Matematika';
        }

        this.users.push(newUser);
        this.saveUsers();
        this.login(newUser);
        alert(`Tabriklaymiz, ${name}! Siz muvaffaqiyatli ro'yxatdan o'tdingiz.`);
      };
    }

    // Quick Demo Login Buttons
    const demoStudentBtn = document.getElementById('btn-demo-student-login');
    const demoTeacherBtn = document.getElementById('btn-demo-teacher-login');
    if (demoStudentBtn) {
      demoStudentBtn.onclick = () => this.login(DEFAULT_USERS[1]);
    }
    if (demoTeacherBtn) {
      demoTeacherBtn.onclick = () => this.login(DEFAULT_USERS[0]);
    }

    // Logout
    const logoutBtn = document.getElementById('btn-user-logout');
    if (logoutBtn) {
      logoutBtn.onclick = () => this.logout();
    }
  }

  showAuthModal(tab = 'signin') {
    const authModal = document.getElementById('auth-modal');
    if (!authModal) return;
    authModal.classList.remove('hidden');

    const signinBox = document.getElementById('auth-signin-box');
    const signupBox = document.getElementById('auth-signup-box');
    const tabSignin = document.getElementById('tab-auth-signin');
    const tabSignup = document.getElementById('tab-auth-signup');

    if (tab === 'signin') {
      signinBox.classList.remove('hidden');
      signupBox.classList.add('hidden');
      tabSignin.className = "px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-md";
      tabSignup.className = "px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800";
    } else {
      signinBox.classList.add('hidden');
      signupBox.classList.remove('hidden');
      tabSignup.className = "px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-md";
      tabSignin.className = "px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800";
    }
  }

  login(user) {
    this.saveCurrentUser(user);
    const authModal = document.getElementById('auth-modal');
    if (authModal) authModal.classList.add('hidden');
    
    // Play audio
    if (window.soundFx) window.soundFx.playCheck(true);

    this.renderUserHeader();
    this.renderCurrentViewByRole();
    this.renderClassSection();

    // Sync app role
    if (window.app) {
      window.app.switchRole(user.role);
    }
  }

  logout() {
    this.saveCurrentUser(null);
    this.renderUserHeader();
    this.showAuthModal('signin');
  }

  renderUserHeader() {
    const guestArea = document.getElementById('header-guest-area');
    const userArea = document.getElementById('header-user-profile-area');
    const userNameEl = document.getElementById('header-user-name');
    const userRoleEl = document.getElementById('header-user-role-badge');
    const userAvatarEl = document.getElementById('header-user-avatar');

    if (!this.currentUser) {
      if (guestArea) guestArea.classList.remove('hidden');
      if (userArea) userArea.classList.add('hidden');
      return;
    }

    if (guestArea) guestArea.classList.add('hidden');
    if (userArea) userArea.classList.remove('hidden');

    if (userNameEl) userNameEl.textContent = this.currentUser.name;
    if (userAvatarEl) userAvatarEl.textContent = this.currentUser.avatar;
    if (userRoleEl) {
      const isTeacher = this.currentUser.role === 'teacher';
      userRoleEl.textContent = isTeacher ? 'Ustoz / O\'qituvchi' : 'O\'quvchi';
      userRoleEl.className = isTeacher 
        ? "text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
        : "text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    }

    lucide.createIcons();
  }

  renderCurrentViewByRole() {
    if (!this.currentUser) return;
    if (window.app) {
      window.app.switchRole(this.currentUser.role);
    }
  }

  // =========================================================================
  // CLASSROOM & ASSIGNMENT MANAGEMENT
  // =========================================================================
  renderClassSection() {
    this.renderAssignmentsList();
    this.renderChatMessages();
    this.bindClassActions();
  }

  bindClassActions() {
    // Send chat message
    const chatForm = document.getElementById('class-chat-form');
    if (chatForm) {
      chatForm.onsubmit = (e) => {
        e.preventDefault();
        const input = document.getElementById('class-chat-input');
        const text = input ? input.value.trim() : '';
        if (!text) return;

        if (!this.currentUser) {
          this.showAuthModal('signin');
          alert("Sinf chatida yozish uchun avval tizimga kiring yoki demo hisobni tanlang!");
          return;
        }

        const newMsg = {
          id: 'msg_' + Date.now(),
          classId: this.currentUser.classId || 'class_101',
          senderId: this.currentUser.id,
          senderName: this.currentUser.role === 'teacher' ? `${this.currentUser.name} (Ustoz)` : this.currentUser.name,
          senderRole: this.currentUser.role,
          avatar: this.currentUser.avatar || (this.currentUser.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'),
          text: text,
          time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
        };

        this.chatMessages.push(newMsg);
        this.saveChatMessages();
        this.renderChatMessages();
        input.value = '';

        if (window.soundFx) window.soundFx.playClick();
      };
    }

    // Teacher adds student to class
    const addStudentForm = document.getElementById('teacher-add-student-to-class-form');
    if (addStudentForm) {
      addStudentForm.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('enroll-student-name').value.trim();
        const subject = document.getElementById('enroll-student-subject').value.trim() || 'Matematika';
        if (!name) return;

        const newStudentUser = {
          id: 'user_std_' + Date.now(),
          name: name,
          email: `std_${Date.now()}@ilmhub.uz`,
          password: '123',
          role: 'student',
          grade: '10-A Sinf',
          classId: 'class_101',
          avatar: '👨‍🎓',
          primarySubject: subject
        };

        this.users.push(newStudentUser);
        this.saveUsers();

        // Also add to active class
        const currentCls = this.classes[0];
        if (currentCls && !currentCls.studentIds.includes(newStudentUser.id)) {
          currentCls.studentIds.push(newStudentUser.id);
          this.saveClasses();
        }

        // Add to window.app.students list so it renders in the teacher cards immediately
        if (window.app) {
          if (!window.app.students) window.app.students = [];
          window.app.students.unshift({
            id: newStudentUser.id,
            name: name,
            avatar: '👨‍🎓',
            subject: subject,
            days: 3,
            dailyMinutes: 60,
            topicsCount: 6,
            completedCount: 0,
            lastActive: 'Hozirgina qo\'shildi',
            status: 'Boshlanmoqda',
            teacherNote: 'Yangi sinfga qabul qilindi. AI tayyorgarlik rejasi berilsin.'
          });
          window.app.saveStudents();
          window.app.renderTeacherDashboard();
        }

        // Add notice to chat
        this.chatMessages.push({
          id: 'msg_' + Date.now(),
          classId: 'class_101',
          senderId: 'system',
          senderName: 'Tizim Bildirishnomasi',
          senderRole: 'system',
          avatar: '📢',
          text: `Yangi o'quvchi ${name} (${subject}) sinfga muvaffaqiyatli qo'shildi! Xush kelibsiz!`,
          time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
        });
        this.saveChatMessages();

        alert(`🎉 O'quvchi ${name} sinfga muvaffaqiyatli qo'shildi va ro'yxatga kiritildi!`);
        document.getElementById('enroll-student-name').value = '';
        this.renderChatMessages();
      };
    }
  }

  renderAssignmentsList() {
    const container = document.getElementById('class-assignments-container');
    if (!container) return;

    container.innerHTML = '';
    const isTeacher = this.currentUser && this.currentUser.role === 'teacher';

    if (this.assignments.length === 0) {
      container.innerHTML = `<div class="p-4 text-center text-xs text-slate-400">Hozircha hech qanday faol vazifa mavjud emas.</div>`;
      return;
    }

    this.assignments.forEach(assign => {
      const isCompletedByMe = this.currentUser && assign.completedByStudents.includes(this.currentUser.id);
      const card = document.createElement('div');
      card.className = `p-5 rounded-2xl glass-panel border transition-all ${
        isCompletedByMe 
          ? 'border-emerald-500/40 bg-emerald-500/5' 
          : 'border-slate-200 dark:border-slate-800'
      }`;

      card.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                ${assign.subject}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400">⏱ ${assign.days} kun • Kuniga ${assign.dailyMinutes} daq</span>
            </div>
            <h4 class="font-heading font-bold text-base text-slate-900 dark:text-white mt-1">
              ${assign.title}
            </h4>
          </div>

          <div class="flex items-center gap-2">
            ${!isTeacher ? `
              <button 
                type="button" 
                class="assign-toggle-btn px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isCompletedByMe 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white'
                }"
                data-id="${assign.id}"
              >
                <i data-lucide="${isCompletedByMe ? 'check-check' : 'circle'}" class="w-4 h-4"></i>
                <span>${isCompletedByMe ? 'Bajarildi ✓' : 'Vazifani Bajarish'}</span>
              </button>
            ` : `
              <span class="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                ${assign.completedByStudents.length} ta o'quvchi bajardi
              </span>
            `}
          </div>
        </div>

        <!-- Details -->
        <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="space-y-1.5">
            <span class="font-semibold text-slate-700 dark:text-slate-300 block">📚 Berilgan Mavzular:</span>
            <ul class="space-y-1 text-slate-600 dark:text-slate-400">
              ${assign.topics.map(t => `<li class="flex items-center gap-1.5">• <span>${t}</span></li>`).join('')}
            </ul>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-slate-700 dark:text-slate-300">Vaqt balansi:</span>
              <span class="text-indigo-600 dark:text-indigo-400 font-medium">Nazariya: ${assign.theoryMinutes} daq</span>
              <span>•</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-medium">Misol/Mashq: ${assign.practiceMinutes} daq</span>
            </div>
            <div>
              <span class="font-semibold text-slate-700 dark:text-slate-300 block">Tavsiya kitoblar:</span>
              <span class="text-slate-500 dark:text-slate-400">${assign.sources.join(', ')}</span>
            </div>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    // Attach student toggle assignment completion
    container.querySelectorAll('.assign-toggle-btn').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.toggleAssignmentCompletion(id);
      };
    });

    lucide.createIcons();
  }

  toggleAssignmentCompletion(assignmentId) {
    if (!this.currentUser) return;
    const assign = this.assignments.find(a => a.id === assignmentId);
    if (!assign) return;

    const idx = assign.completedByStudents.indexOf(this.currentUser.id);
    if (idx >= 0) {
      assign.completedByStudents.splice(idx, 1);
    } else {
      assign.completedByStudents.push(this.currentUser.id);
      // Celebrate
      if (window.soundFx) window.soundFx.playVictory();
      if (window.app && window.app.launchConfetti) window.app.launchConfetti();
    }

    this.saveAssignments();
    this.renderAssignmentsList();
  }

  renderChatMessages() {
    const chatContainer = document.getElementById('class-chat-messages-container');
    if (!chatContainer) return;

    chatContainer.innerHTML = '';
    this.chatMessages.forEach(msg => {
      const isMine = this.currentUser && msg.senderId === this.currentUser.id;
      const isTeacher = msg.senderRole === 'teacher';
      const isSystem = msg.senderRole === 'system';

      const msgEl = document.createElement('div');
      msgEl.className = `flex gap-2.5 ${isMine ? 'justify-end' : 'justify-start'} ${isSystem ? 'justify-center' : ''}`;

      if (isSystem) {
        msgEl.innerHTML = `
          <div class="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            ${msg.text}
          </div>
        `;
      } else {
        msgEl.innerHTML = `
          ${!isMine ? `
            <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm shrink-0 border border-slate-300 dark:border-slate-700">
              ${msg.avatar}
            </div>
          ` : ''}

          <div class="max-w-[75%] space-y-1">
            <div class="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 ${isMine ? 'justify-end' : 'justify-start'}">
              <span class="font-bold ${isTeacher ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'}">
                ${msg.senderName}
              </span>
              <span>•</span>
              <span>${msg.time}</span>
            </div>
            
            <div class="p-3 rounded-2xl text-xs leading-relaxed ${
              isMine 
                ? 'bg-emerald-500 text-white rounded-tr-none shadow-md' 
                : isTeacher 
                ? 'bg-cyan-500/10 border border-cyan-500/30 text-slate-900 dark:text-slate-100 rounded-tl-none' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none shadow-sm'
            }">
              ${msg.text}
            </div>
          </div>

          ${isMine ? `
            <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm shrink-0 border border-emerald-500/30">
              ${msg.avatar}
            </div>
          ` : ''}
        `;
      }

      chatContainer.appendChild(msgEl);
    });

    // Scroll chat to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

function bootstrapAuth() {
  if (!window.authManager) {
    window.authManager = new AuthAndClassManager();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrapAuth);
} else {
  bootstrapAuth();
}
