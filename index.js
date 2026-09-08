const STORAGE_KEY = 'stepPulseState';
const USERS_KEY = 'stepPulseUsers';
const SESSION_KEY = 'stepPulseSession';
const ring = document.getElementById('progressRing');
const ringLength = 540.35;

function getSessionUser() {
  return localStorage.getItem(SESSION_KEY) || 'guest';
}

function getUserStorageKey() {
  const sessionUser = getSessionUser();
  return sessionUser === 'guest' ? STORAGE_KEY : `${STORAGE_KEY}:${sessionUser}`;
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getDateKey(date = new Date()) {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  const year = clone.getFullYear();
  const month = String(clone.getMonth() + 1).padStart(2, '0');
  const day = String(clone.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLongDate(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function getStartOfWeek(date = new Date()) {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + diff);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function getWeekDates(date = new Date()) {
  const startOfWeek = getStartOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + index);
    return day;
  });
}

function renderWeekPicker() {
  if (!elements.weekDays) return;

  const weekDates = getWeekDates(new Date(`${state.selectedDate}T00:00:00`));
  elements.weekDays.innerHTML = weekDates
    .map((date) => {
      const key = getDateKey(date);
      const isActive = key === state.selectedDate;
      const shortDay = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
      const dayNumber = date.getDate();

      return `
        <button
          class="week-day ${isActive ? 'active' : ''}"
          type="button"
          data-date="${key}"
          aria-label="Select ${formatLongDate(key)}"
        >
          <span>${shortDay}</span>
          <strong>${dayNumber}</strong>
        </button>
      `;
    })
    .join('');

  elements.weekDays.querySelectorAll('.week-day').forEach((button) => {
    button.addEventListener('click', () => {
      const nextDate = button.dataset.date;
      state.selectedDate = nextDate;
      state.steps = state.dailySteps[nextDate] || 0;
      state.reason = state.dayReasons[nextDate] || '';
      updateUI();
    });
  });
}

function renderHistoryTable() {
  if (!elements.historyTableBody) return;

  const weekDates = getWeekDates(new Date(`${state.selectedDate}T00:00:00`));

  elements.historyTableBody.innerHTML = weekDates
    .map((date) => {
      const key = getDateKey(date);
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
      const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
      const steps = state.dailySteps?.[key] || 0;
      const isSelected = key === state.selectedDate;

      return `
        <tr class="${isSelected ? 'selected' : ''}">
          <td>${dayName}</td>
          <td>${dateLabel}</td>
          <td>${formatNumber(steps)}</td>
        </tr>
      `;
    })
    .join('');
}

// Default state structure
const defaultState = {
  // Core tracking
  steps: 0,
  goal: 9000,
  theme: 'dark',
  streak: 5,
  reason: '',
  selectedDate: getDateKey(new Date()),
  lastVisitedDate: getDateKey(new Date()),
  dailySteps: {},
  dayReasons: {},
  lastResetDate: new Date().toDateString(),
  
  // Profile
  profile: {
    username: 'Fitness Enthusiast',
    avatar: '👤',
    fitnessLevel: 'Beginner', // Beginner, Intermediate, Advanced
    favoriteActivities: ['Walking'],
  },
  
  // Weekly tracking
  weeklyData: [0, 0, 0, 0, 0, 0, 0], // Last 7 days of steps
  weeklyDates: [],
  bestStreak: 5,
  totalActiveDays: 0,
  totalSteps: 0,
  
  // Quests
  dailyQuests: [],
  completedQuests: [],
  questResetDate: new Date().toDateString(),
  
  // Power-ups
  activePowerups: [],
  powerupPoints: 0,
  
  // Smart goals
  suggestedGoal: 9000,
  suggestedGoalDate: new Date().toDateString(),
  
  // Achievements
  unlockedAchievements: [],
};

const state = loadState();

// ==================== DOM ELEMENTS ====================
const elements = {
  // Dashboard elements
  stepsDisplay: document.getElementById('stepsDisplay'),
  goalDisplay: document.getElementById('goalDisplay'),
  distanceDisplay: document.getElementById('distanceDisplay'),
  caloriesDisplay: document.getElementById('caloriesDisplay'),
  streakDisplay: document.getElementById('streakDisplay'),
  motivationalText: document.getElementById('motivationalText'),
  percentageDisplay: document.getElementById('percentageDisplay'),
  remainingDisplay: document.getElementById('remainingDisplay'),
  paceDisplay: document.getElementById('paceDisplay'),
  progressFill: document.getElementById('progressFill'),
  achievementList: document.getElementById('achievementList'),
  goalInput: document.getElementById('goalInput'),
  reasonInput: document.getElementById('reasonInput'),
  reasonStatus: document.getElementById('reasonStatus'),
  reasonBadge: document.getElementById('reasonBadge'),
  reasonPanel: document.getElementById('reasonPanel'),
  datePicker: document.getElementById('datePicker'),
  selectedDateText: document.getElementById('selectedDateText'),
  weekDays: document.getElementById('weekDays'),
  prevWeekBtn: document.getElementById('prevWeekBtn'),
  nextWeekBtn: document.getElementById('nextWeekBtn'),
  historyTableBody: document.getElementById('historyTableBody'),
  
  // New feature elements
  habitScorePercent: document.getElementById('habitScorePercent'),
  habitScoreBadge: document.getElementById('habitScoreBadge'),
  habitRing: document.getElementById('habitRing'),
  habitText: document.getElementById('habitText'),
  questsList: document.getElementById('questsList'),
  questsProgressBadge: document.getElementById('questsProgressBadge'),
  smartGoalText: document.getElementById('smartGoalText'),
  goalExplainText: document.getElementById('goalExplainText'),
  acceptSmartGoal: document.getElementById('acceptSmartGoal'),
  powerupsList: document.getElementById('powerupsList'),
  
  // Profile elements
  usernameInput: document.getElementById('usernameInput'),
  saveUsernameBtn: document.getElementById('saveUsernameBtn'),
  userAvatar: document.getElementById('userAvatar'),
  userLevel: document.getElementById('userLevel'),
  userTagline: document.getElementById('userTagline'),
  changeAvatarBtn: document.getElementById('changeAvatarBtn'),
  totalStepsDisplay: document.getElementById('totalStepsDisplay'),
  bestStreakDisplay: document.getElementById('bestStreakDisplay'),
  totalDaysDisplay: document.getElementById('totalDaysDisplay'),
  achievementCountDisplay: document.getElementById('achievementCountDisplay'),
  exportDataBtn: document.getElementById('exportDataBtn'),
  resetProfileBtn: document.getElementById('resetProfileBtn'),
};

const hasDashboardState = !!elements.stepsDisplay && !!elements.goalInput;
const hasProfilePage = !!elements.usernameInput;

function setupAuthUI() {
  const topbar = document.querySelector('.topbar');
  if (!topbar || document.getElementById('accountControls')) return;

  const currentUser = getSessionUser();
  const users = getUsers();
  const accountControls = document.createElement('div');
  accountControls.id = 'accountControls';
  accountControls.className = 'account-controls';
  accountControls.innerHTML = currentUser === 'guest'
    ? '<button id="loginBtn" class="account-btn" type="button">Log in</button>'
    : `<span class="account-name">${users[currentUser]?.name || currentUser}</span><button id="logoutBtn" class="account-btn" type="button">Log out</button>`;
  topbar.appendChild(accountControls);

  const modal = document.createElement('div');
  modal.id = 'authModal';
  modal.className = 'auth-modal hidden';
  modal.innerHTML = `
    <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <button id="closeAuthBtn" class="auth-close" type="button" aria-label="Close">&times;</button>
      <p class="eyebrow">Your private tracker</p>
      <h2 id="authTitle">Log in to StepPulse</h2>
      <p class="auth-note">Your account keeps your steps and reflections separate from other users on this browser.</p>
      <form id="authForm">
        <label for="authName">Name <span>(for sign up)</span></label>
        <input id="authName" type="text" autocomplete="name" placeholder="Your name" />
        <label for="authEmail">Email</label>
        <input id="authEmail" type="email" autocomplete="email" placeholder="you@example.com" required />
        <label for="authPassword">Password</label>
        <input id="authPassword" type="password" autocomplete="current-password" minlength="6" placeholder="At least 6 characters" required />
        <p id="authStatus" class="auth-status" role="status"></p>
        <button id="authSubmit" class="primary-cta auth-submit" type="submit">Log in</button>
      </form>
      <button id="authModeBtn" class="auth-mode-btn" type="button">Create a new account</button>
    </div>`;
  document.body.appendChild(modal);

  let signupMode = false;
  const openModal = () => modal.classList.remove('hidden');
  const closeModal = () => modal.classList.add('hidden');
  const setStatus = (message) => { document.getElementById('authStatus').textContent = message; };

  document.getElementById('loginBtn')?.addEventListener('click', openModal);
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    location.reload();
  });
  document.getElementById('closeAuthBtn').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.getElementById('authModeBtn').addEventListener('click', () => {
    signupMode = !signupMode;
    document.getElementById('authTitle').textContent = signupMode ? 'Create your StepPulse account' : 'Log in to StepPulse';
    document.getElementById('authSubmit').textContent = signupMode ? 'Create account' : 'Log in';
    document.getElementById('authModeBtn').textContent = signupMode ? 'I already have an account' : 'Create a new account';
    document.getElementById('authName').required = signupMode;
    setStatus('');
  });
  document.getElementById('authForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('authEmail').value.trim().toLowerCase();
    const password = document.getElementById('authPassword').value;
    const name = document.getElementById('authName').value.trim();
    const accountUsers = getUsers();

    if (signupMode) {
      if (accountUsers[email]) {
        setStatus('An account with this email already exists.');
        return;
      }
      accountUsers[email] = { name: name || 'Fitness Enthusiast', password };
      saveUsers(accountUsers);
    } else if (!accountUsers[email] || accountUsers[email].password !== password) {
      setStatus('Email or password is incorrect.');
      return;
    }

    localStorage.setItem(SESSION_KEY, email);
    location.reload();
  });
}

if (ring) {
  ring.style.strokeDasharray = `${ringLength}`;
}

// ==================== CORE STATE FUNCTIONS ====================
function loadState() {
  const saved = localStorage.getItem(getUserStorageKey());
  if (!saved) return { ...defaultState };

  try {
    const parsed = JSON.parse(saved);
    return { ...defaultState, ...parsed };
  } catch (error) {
    console.error('Error loading state:', error);
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(getUserStorageKey(), JSON.stringify(state));
}

function ensureSelectedDayState() {
  const todayKey = getDateKey(new Date());

  if (!state.selectedDate) {
    state.selectedDate = todayKey;
  }

  if (!state.dailySteps) {
    state.dailySteps = {};
  }

  if (!state.dayReasons) {
    state.dayReasons = {};
  }

  if (state.lastVisitedDate !== todayKey) {
    state.lastVisitedDate = todayKey;
    state.selectedDate = todayKey;
    state.dailySteps[todayKey] = 0;
    state.dayReasons[todayKey] = '';
  }

  if (!(state.selectedDate in state.dailySteps)) {
    state.dailySteps[state.selectedDate] = 0;
  }

  if (!(state.selectedDate in state.dayReasons)) {
    state.dayReasons[state.selectedDate] = '';
  }

  state.steps = state.dailySteps[state.selectedDate] || 0;
  state.reason = state.dayReasons[state.selectedDate] || '';
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.max(0, Math.round(value)));
}

// ==================== THEME MANAGEMENT ====================
// ==================== SMART MOTIVATION SYSTEM ====================
const motivationMessages = {
  veryClose: [
    "Just a few more steps! You're almost there! 🎉",
    "So close to your goal! Keep the momentum going! ⚡",
    "The finish line is in sight! Push through! 💪",
    "You've got this! Only a few steps left! 🏃",
  ],
  halfWay: [
    "Halfway there! Keep up the great pace! 🚶",
    "You're doing amazing! Stay focused! 🎯",
    "The journey continues! Keep moving! 🌟",
    "Great progress! Keep the energy high! ✨",
  ],
  justStarted: [
    "Great start! Keep walking! 👟",
    "Let's build momentum together! 🚀",
    "Every step counts! Get moving! 💫",
    "Time to move! Your body will thank you! 💪",
  ],
  exceeded: [
    "Goal crushed! You're unstoppable! 🏆",
    "Amazing work! You exceeded your goal! 🌟",
    "Legend! Keep this energy going! 🔥",
    "Incredible effort! You're on fire! ⚡",
  ],
  onStreak: [
    "Your streak is on fire! Keep it going! 🔥",
    "Consistency is key! Amazing {streak}-day streak! 🎯",
    "You're a stepping machine! Don't break the chain! ⛓️",
    "Legendary streak! The momentum is yours! 💪",
  ],
};

function getSmartMotivation(steps, goal, streak) {
  const percent = (steps / goal) * 100;
  let messages = [];

  if (percent >= 100) {
    messages = motivationMessages.exceeded;
  } else if (percent >= 80) {
    messages = motivationMessages.veryClose;
  } else if (percent >= 50) {
    messages = motivationMessages.halfWay;
  } else {
    messages = motivationMessages.justStarted;
  }

  if (streak >= 3) {
    messages = motivationMessages.onStreak.map(m => m.replace('{streak}', streak));
  }

  return messages[Math.floor(Math.random() * messages.length)];
}


// ==================== HABIT SCORE SYSTEM ====================
function calculateHabitScore() {
  const today = new Date().toDateString();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);

  // Initialize weekly tracking if needed
  if (!state.weeklyData || state.weeklyData.length !== 7) {
    state.weeklyData = [0, 0, 0, 0, 0, 0, 0];
    state.weeklyDates = [];
  }

  // Count days this week where goal was met
  let daysMetGoal = 0;
  state.weeklyData.forEach((daySteps) => {
    if (daySteps >= state.goal) {
      daysMetGoal++;
    }
  });

  const habitScore = Math.round((daysMetGoal / 7) * 100);
  
  return {
    score: habitScore,
    daysMetGoal,
    totalDays: 7,
    badge: habitScore >= 80 ? 'Excellent' : habitScore >= 60 ? 'Good' : habitScore >= 40 ? 'Fair' : 'Building',
  };
}

function updateHabitUI() {
  if (!elements.habitScorePercent) return;

  const habit = calculateHabitScore();
  elements.habitScorePercent.textContent = `${habit.score}%`;
  elements.habitScoreBadge.textContent = habit.badge;

  // Update habit ring visualization
  if (elements.habitRing) {
    const habitRing = document.querySelector('#habitRing');
    if (habitRing) {
      const circumference = 2 * Math.PI * 80;
      const offset = circumference - (habit.score / 100) * circumference;
      habitRing.style.strokeDasharray = circumference;
      habitRing.style.strokeDashoffset = offset;
    }
  }

  // Update habit text
  if (elements.habitText) {
    elements.habitText.textContent = `You've completed your goal ${habit.daysMetGoal} out of 7 days this week. ${habit.badge} consistency!`;
  }
}

// ==================== SMART GOAL SYSTEM ====================
function calculateSmartGoal() {
  if (!state.weeklyData || state.weeklyData.length === 0) {
    return state.goal;
  }

  // Calculate average of non-zero days
  const nonZeroDays = state.weeklyData.filter(d => d > 0);
  if (nonZeroDays.length === 0) return state.goal;

  const average = nonZeroDays.reduce((a, b) => a + b, 0) / nonZeroDays.length;
  
  // Suggest 5-10% above average
  const suggested = Math.round(average * 1.07 / 500) * 500; // Round to nearest 500
  return Math.max(suggested, state.goal);
}

function updateSmartGoalUI() {
  if (!elements.smartGoalText) return;

  const suggested = calculateSmartGoal();
  const increase = suggested - state.goal;
  const percent = increase > 0 ? Math.round((increase / state.goal) * 100) : 0;

  elements.smartGoalText.textContent = `Based on your weekly performance, we recommend a goal of ${formatNumber(suggested)} steps.`;

  if (elements.goalExplainText) {
    const avgSteps = state.weeklyData.length > 0 
      ? Math.round(state.weeklyData.filter(d => d > 0).reduce((a, b) => a + b, 0) / state.weeklyData.filter(d => d > 0).length)
      : state.goal;
    
    if (percent > 0) {
      elements.goalExplainText.textContent = `Your average this week was ${formatNumber(avgSteps)} steps. We suggest pushing ${percent}% higher!`;
    } else {
      elements.goalExplainText.textContent = `You're maintaining a great pace. Stay consistent!`;
    }
  }
}

// ==================== DAILY QUESTS SYSTEM ====================
const availableQuests = [
  { id: 1, title: '🌅 Early Bird', description: 'Walk 3,000 steps before 12 PM', reward: 500, icon: '🌅' },
  { id: 2, title: '⚡ Speed Demon', description: 'Complete 2,000 steps in quick bursts', reward: 400, icon: '⚡' },
  { id: 3, title: '🎯 Goal Crusher', description: 'Reach 50% of daily goal', reward: 300, icon: '🎯' },
  { id: 4, title: '🔥 On Fire', description: 'Log steps 5 times today', reward: 250, icon: '🔥' },
  { id: 5, title: '💪 Iron Legs', description: 'Walk 5,000+ steps', reward: 600, icon: '💪' },
  { id: 6, title: '🌙 Night Owl', description: 'Walk after 8 PM', reward: 350, icon: '🌙' },
];

function initializeDailyQuests() {
  const today = new Date().toDateString();
  if (state.questResetDate !== today) {
    state.questResetDate = today;
    state.completedQuests = [];
    
    // Select 3 random quests for today
    const shuffled = [...availableQuests].sort(() => Math.random() - 0.5);
    state.dailyQuests = shuffled.slice(0, 3).map(q => ({
      ...q,
      completed: false,
      progress: 0,
    }));
    
    saveState();
  }
}

function checkQuestProgress() {
  if (!state.dailyQuests) return;

  state.dailyQuests.forEach(quest => {
    if (quest.completed) return;

    switch (quest.id) {
      case 1: // Early Bird
        quest.progress = Math.min((state.steps / 3000) * 100, 100);
        if (state.steps >= 3000) quest.completed = true;
        break;
      case 2: // Speed Demon
        quest.progress = Math.min((state.steps / 2000) * 100, 100);
        if (state.steps >= 2000) quest.completed = true;
        break;
      case 3: // Goal Crusher
        quest.progress = Math.min(((state.steps / state.goal) * 50) * 100, 100);
        if (state.steps >= state.goal * 0.5) quest.completed = true;
        break;
      case 4: // On Fire (tracked by adding steps)
        // This would need step count tracking
        break;
      case 5: // Iron Legs
        quest.progress = Math.min((state.steps / 5000) * 100, 100);
        if (state.steps >= 5000) quest.completed = true;
        break;
      case 6: // Night Owl (time-based)
        const hour = new Date().getHours();
        if (hour >= 20) {
          quest.progress = 100;
          quest.completed = true;
        }
        break;
    }
  });
}

function updateQuestsUI() {
  if (!elements.questsList) return;

  initializeDailyQuests();
  checkQuestProgress();

  let completedCount = (state.dailyQuests || []).filter(q => q.completed).length;
  if (elements.questsProgressBadge) {
    elements.questsProgressBadge.textContent = `${completedCount}/3`;
  }

  elements.questsList.innerHTML = (state.dailyQuests || [])
    .map(quest => `
      <div class="quest-item ${quest.completed ? 'completed' : ''}">
        <div class="quest-icon">${quest.icon}</div>
        <div class="quest-content">
          <h4>${quest.title}</h4>
          <p>${quest.description}</p>
          <div class="quest-progress">
            <span class="quest-bar">
              <span class="quest-fill" style="width: ${Math.min(quest.progress, 100)}%"></span>
            </span>
            <span class="quest-reward">+${quest.reward} pts</span>
          </div>
        </div>
        <div class="quest-status">
          ${quest.completed ? '✓' : Math.round(quest.progress) + '%'}
        </div>
      </div>
    `)
    .join('');
}


// ==================== PROFILE MANAGEMENT ====================
function updateProfileUI() {
  if (!hasProfilePage) return;

  if (elements.usernameInput) {
    elements.usernameInput.value = state.profile.username;
  }
  if (elements.userAvatar) {
    elements.userAvatar.textContent = state.profile.avatar;
  }
  if (elements.userLevel) {
    elements.userLevel.textContent = state.profile.fitnessLevel;
  }
  if (elements.userTagline) {
    const taglines = {
      Beginner: 'Starting your fitness journey 🌱',
      Intermediate: 'Building consistent habits 🚶',
      Advanced: 'Living an active lifestyle 🏃',
    };
    elements.userTagline.textContent = taglines[state.profile.fitnessLevel] || 'Keep moving!';
  }

  // Update stats
  if (elements.totalStepsDisplay) {
    elements.totalStepsDisplay.textContent = formatNumber(state.totalSteps);
  }
  if (elements.bestStreakDisplay) {
    elements.bestStreakDisplay.textContent = state.bestStreak;
  }
  if (elements.totalDaysDisplay) {
    elements.totalDaysDisplay.textContent = state.totalActiveDays;
  }
  if (elements.achievementCountDisplay) {
    elements.achievementCountDisplay.textContent = (state.unlockedAchievements || []).length;
  }
}

function saveProfileChanges() {
  if (!elements.usernameInput) return;

  const newUsername = elements.usernameInput.value.trim() || 'Fitness Enthusiast';
  state.profile.username = newUsername;
  saveState();

  if (elements.usernameInput) elements.usernameInput.value = newUsername;
}

// ==================== ACHIEVEMENTS ====================
function getAchievementList() {
  return [
    { threshold: 2000, label: 'Starter Spark', details: '2k steps', icon: '🚶' },
    { threshold: 5000, label: 'Momentum Mode', details: '5k steps', icon: '⚡' },
    { threshold: 7500, label: 'Strong Pace', details: '7.5k steps', icon: '🔥' },
    { threshold: 10000, label: 'Goal Crusher', details: '10k steps', icon: '🏆' },
    { threshold: 15000, label: 'Endurance King', details: '15k steps', icon: '👑' },
    { threshold: 20000, label: 'Legend Status', details: '20k steps', icon: '⭐' },
  ];
}

function updateAchievements() {
  if (!elements.achievementList) return;

  const list = getAchievementList();
  elements.achievementList.innerHTML = list
    .map((item) => {
      const unlocked = state.steps >= item.threshold;
      return `
        <li class="${unlocked ? 'done' : ''}">
          <span>${item.icon}</span>
          <div class="achievement-text">
            <strong>${item.label}</strong>
            <small>${unlocked ? 'Unlocked' : item.details}</small>
          </div>
        </li>
      `;
    })
    .join('');
}

function updateReasonPanel() {
  if (!elements.reasonPanel || !elements.reasonBadge || !elements.reasonStatus || !elements.reasonInput) return;

  const missedGoal = state.steps < state.goal;
  elements.reasonPanel.style.display = missedGoal ? 'grid' : 'none';
  elements.reasonBadge.textContent = missedGoal ? 'Goal missed' : 'Goal reached';
  elements.reasonBadge.classList.toggle('warning', missedGoal);

  if (state.reason) {
    elements.reasonStatus.textContent = `Saved reflection: “${state.reason}”`;
    elements.reasonInput.value = state.reason;
  } else {
    elements.reasonStatus.textContent = missedGoal
      ? 'No reason saved yet.'
      : 'You hit your goal — no reflection needed.';
    elements.reasonInput.value = '';
  }
}

function updateUI() {
  if (!hasDashboardState) return;

  ensureSelectedDayState();

  const percent = Math.min((state.steps / state.goal) * 100, 100);
  const remaining = Math.max(state.goal - state.steps, 0);
  const distance = (state.steps * 0.00076).toFixed(2);
  const calories = Math.round(state.steps * 0.05);
  const pace = Math.round(state.steps / 8);

  elements.stepsDisplay.textContent = formatNumber(state.steps);
  elements.goalDisplay.textContent = formatNumber(state.goal);
  elements.distanceDisplay.textContent = `${distance} km`;
  elements.caloriesDisplay.textContent = `${formatNumber(calories)} kcal`;
  elements.streakDisplay.textContent = `${state.streak} days`;
  elements.goalInput.value = state.goal;

  if (elements.selectedDateText) {
    elements.selectedDateText.textContent = formatLongDate(state.selectedDate);
  }

  if (elements.datePicker) {
    elements.datePicker.value = state.selectedDate;
  }

  elements.progressFill.style.width = `${percent}%`;
  elements.percentageDisplay.textContent = `${Math.round(percent)}%`;
  elements.remainingDisplay.textContent = remaining > 0 ? `${formatNumber(remaining)} to goal` : 'Goal reached!';
  elements.paceDisplay.textContent = `${formatNumber(pace)} steps/hr`;

  const ringOffset = ringLength - (percent / 100) * ringLength;
  if (ring) {
    ring.style.strokeDashoffset = `${ringOffset}`;
  }

  // Smart motivation
  elements.motivationalText.textContent = getSmartMotivation(state.steps, state.goal, state.streak);

  // Update all feature UIs
  updateAchievements();
  updateReasonPanel();
  updateHabitUI();
  updateQuestsUI();
  updateSmartGoalUI();
  updateProfileUI();

  state.dailySteps[state.selectedDate] = state.steps;
  state.dayReasons[state.selectedDate] = state.reason;
  saveState();
}

function addSteps(amount) {
  if (!hasDashboardState) return;
  ensureSelectedDayState();
  state.steps += amount;
  state.totalSteps += amount;
  state.dailySteps[state.selectedDate] = state.steps;
  updateUI();
}

function resetSteps() {
  if (!hasDashboardState) return;
  ensureSelectedDayState();
  state.totalSteps = Math.max(0, state.totalSteps - state.steps);
  state.steps = 0;
  state.reason = '';
  state.dailySteps[state.selectedDate] = 0;
  state.dayReasons[state.selectedDate] = '';
  updateUI();
}

function applyGoal() {
  if (!hasDashboardState) return;

  const nextGoal = Number(elements.goalInput.value);
  if (!Number.isFinite(nextGoal) || nextGoal < 1000) {
    elements.goalInput.value = state.goal;
    return;
  }

  state.goal = Math.round(nextGoal / 500) * 500;
  elements.goalInput.value = state.goal;
  updateUI();
}

function saveReason() {
  if (!elements.reasonInput || !elements.reasonStatus) return;

  const reasonText = elements.reasonInput.value.trim();
  if (!reasonText) {
    elements.reasonStatus.textContent = 'Please write a reason before saving.';
    return;
  }

  state.reason = reasonText;
  state.dayReasons[state.selectedDate] = reasonText;
  elements.reasonStatus.textContent = `Saved reflection: “${reasonText}”`;
  saveState();
}

function clearReason() {
  if (!elements.reasonInput || !elements.reasonStatus) return;
  state.reason = '';
  state.dayReasons[state.selectedDate] = '';
  elements.reasonInput.value = '';
  elements.reasonStatus.textContent = 'Reflection cleared.';
  saveState();
}

const addButtons = document.querySelectorAll('[data-add]');
addButtons.forEach((button) => {
  button.addEventListener('click', () => {
    addSteps(Number(button.dataset.add));
  });
});

document.querySelectorAll('.feature-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    const target = document.querySelector(pill.dataset.target);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  });
});

const surpriseButton = document.getElementById('surpriseBtn');
if (surpriseButton) {
  surpriseButton.addEventListener('click', () => {
    const randomBoost = Math.floor(Math.random() * 1200) + 350;
    addSteps(randomBoost);
  });
}

const resetButton = document.getElementById('resetBtn');
if (resetButton) resetButton.addEventListener('click', resetSteps);

const setGoalButton = document.getElementById('setGoalBtn');
if (setGoalButton) setGoalButton.addEventListener('click', applyGoal);

const saveReasonButton = document.getElementById('saveReasonBtn');
if (saveReasonButton) saveReasonButton.addEventListener('click', saveReason);

const clearReasonButton = document.getElementById('clearReasonBtn');
if (clearReasonButton) clearReasonButton.addEventListener('click', clearReason);

document.querySelectorAll('.reason-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    if (elements.reasonInput) {
      elements.reasonInput.value = chip.dataset.reason;
    }
  });
});

if (elements.goalInput) {
  elements.goalInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') applyGoal();
  });
}

if (elements.datePicker) {
  elements.datePicker.addEventListener('change', (event) => {
    const selectedKey = getDateKey(new Date(event.target.value));
    state.selectedDate = selectedKey;
    state.steps = state.dailySteps[selectedKey] || 0;
    state.reason = state.dayReasons[selectedKey] || '';
    updateUI();
  });
}

if (elements.prevWeekBtn) {
  elements.prevWeekBtn.addEventListener('click', () => {
    const currentDate = new Date(`${state.selectedDate}T00:00:00`);
    currentDate.setDate(currentDate.getDate() - 7);
    state.selectedDate = getDateKey(currentDate);
    state.steps = state.dailySteps[state.selectedDate] || 0;
    state.reason = state.dayReasons[state.selectedDate] || '';
    updateUI();
  });
}

if (elements.nextWeekBtn) {
  elements.nextWeekBtn.addEventListener('click', () => {
    const currentDate = new Date(`${state.selectedDate}T00:00:00`);
    currentDate.setDate(currentDate.getDate() + 7);
    state.selectedDate = getDateKey(currentDate);
    state.steps = state.dailySteps[state.selectedDate] || 0;
    state.reason = state.dayReasons[state.selectedDate] || '';
    updateUI();
  });
}

// Smart goal accept
if (elements.acceptSmartGoal) {
  elements.acceptSmartGoal.addEventListener('click', () => {
    const suggested = calculateSmartGoal();
    state.goal = suggested;
    if (elements.goalInput) elements.goalInput.value = suggested;
    updateUI();
  });
}

// Export data function
function exportData() {
  const csvContent = [
    ['Date', 'Steps', 'Goal', 'Reached'],
    ...(state.weeklyData || []).map((steps, idx) => [
      state.weeklyDates?.[idx] || new Date(Date.now() - (6 - idx) * 24 * 60 * 60 * 1000).toDateString(),
      steps,
      state.goal,
      steps >= state.goal ? 'Yes' : 'No'
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'step-data.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

// Profile page events
if (hasProfilePage) {
  if (elements.saveUsernameBtn) {
    elements.saveUsernameBtn.addEventListener('click', saveProfileChanges);
  }

  if (elements.usernameInput) {
    elements.usernameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveProfileChanges();
    });
  }

  if (elements.changeAvatarBtn) {
    elements.changeAvatarBtn.addEventListener('click', () => {
      const selector = document.querySelector('.avatar-selector');
      if (selector) {
        selector.style.display = selector.style.display === 'none' ? 'grid' : 'none';
      }
    });
  }

  document.querySelectorAll('.avatar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.profile.avatar = btn.dataset.avatar;
      if (elements.userAvatar) elements.userAvatar.textContent = btn.dataset.avatar;
      saveState();
      const selector = document.querySelector('.avatar-selector');
      if (selector) selector.style.display = 'none';
    });
  });

  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.profile.fitnessLevel = btn.dataset.level;
      document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      saveState();
      updateProfileUI();
    });
  });

  document.querySelectorAll('.activity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const activity = btn.dataset.activity;
      if (state.profile.favoriteActivities.includes(activity)) {
        state.profile.favoriteActivities = state.profile.favoriteActivities.filter(a => a !== activity);
        btn.classList.remove('active');
      } else {
        state.profile.favoriteActivities.push(activity);
        btn.classList.add('active');
      }
      saveState();
    });
  });

  if (elements.exportDataBtn) {
    elements.exportDataBtn.addEventListener('click', exportData);
  }

  if (elements.resetProfileBtn) {
    elements.resetProfileBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset your profile? This cannot be undone.')) {
        localStorage.removeItem(getUserStorageKey());
        location.reload();
      }
    });
  }
}

setupAuthUI();
updateUI();

const introOverlay = document.getElementById('introOverlay');
if (introOverlay) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.body.classList.add('ready');
      document.body.classList.remove('intro-active');
      introOverlay.classList.add('hidden');
    }, 1300);
  });
}

