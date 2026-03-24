const STORAGE_KEY = 'ascend-system-mvp-v1';

const defaultState = {
  profile: {
    name: 'Ануар',
    level: 3,
    xp: 120,
    xpToNext: 200,
    rank: 'E-Rank',
    streak: 4,
    stats: {
      discipline: 11,
      mind: 14,
      body: 7,
      creativity: 13,
      career: 9,
      social: 6,
    }
  },
  quests: [
    {
      id: crypto.randomUUID(),
      title: 'Подготовить 10 ответов на визовое интервью',
      description: 'Собери 10 сильных коротких ответов для Work and Travel interview и проговори их вслух 2 раза.',
      type: 'Boss Quest',
      xp: 120,
      penalty: -25,
      status: 'active',
      rewards: ['+2 Mind', '+2 Discipline', '+1 Social']
    },
    {
      id: crypto.randomUUID(),
      title: 'Закрыть один учебный хвост до вечера',
      description: 'Выбери одну задачу, которую давно откладывал, и закрой её полностью без полумер.',
      type: 'Main Quest',
      xp: 55,
      penalty: -15,
      status: 'active',
      rewards: ['+1 Discipline', '+1 Career']
    },
    {
      id: crypto.randomUUID(),
      title: '30 минут фокусной работы без телефона',
      description: 'Поставь таймер и поработай 30 минут в полном фокусе. Никаких соцсетей и скачков между задачами.',
      type: 'Daily Quest',
      xp: 25,
      penalty: -8,
      status: 'active',
      rewards: ['+1 Discipline']
    }
  ],
  logs: [
    { id: crypto.randomUUID(), time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), title: 'System initialized', body: 'MVP активирован. Квесты назначены. Штрафной протокол включён.', epic: true },
    { id: crypto.randomUUID(), time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), title: 'Victor note', body: 'Не копи квесты. Лучше закрыть один полностью, чем пять наполовину.', epic: false }
  ]
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : structuredClone(defaultState);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

const statsGrid = document.getElementById('statsGrid');
const questList = document.getElementById('questList');
const systemLog = document.getElementById('systemLog');
const questTemplate = document.getElementById('questTemplate');

document.getElementById('generateQuestBtn').addEventListener('click', () => {
  const pool = [
    ['Side Quest', 'Сделать 20 минут английского', 'Пройди speaking practice или повтори 20 новых слов.', 18, -5, ['+1 Mind']],
    ['Hidden Quest', 'Выйти на прогулку на 20 минут', 'Просто выйди на улицу, проветрись и пройдись без телефона.', 16, -4, ['+1 Body']],
    ['Main Quest', 'Доделать один экран дизайна', 'Выбери один экран и доведи его до аккуратного рабочего состояния.', 35, -10, ['+1 Creativity', '+1 Career']],
    ['Daily Quest', 'Разобрать 1 важный документ', 'Открой, прочитай и разложи по полочкам один нужный файл или тему.', 20, -6, ['+1 Mind']],
  ];
  const [type, title, description, xp, penalty, rewards] = pool[Math.floor(Math.random() * pool.length)];
  state.quests.unshift({ id: crypto.randomUUID(), type, title, description, xp, penalty, status: 'active', rewards });
  state.logs.unshift(makeLog('New quest assigned', `Получен новый квест: ${title}`, true));
  saveState();
  render();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(defaultState);
  render();
});

function makeLog(title, body, epic = false) {
  return {
    id: crypto.randomUUID(),
    time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    title,
    body,
    epic,
  };
}

function updateRank() {
  const xp = state.profile.xp;
  if (xp >= 700) state.profile.rank = 'A-Rank';
  else if (xp >= 500) state.profile.rank = 'B-Rank';
  else if (xp >= 300) state.profile.rank = 'C-Rank';
  else if (xp >= 180) state.profile.rank = 'D-Rank';
  else state.profile.rank = 'E-Rank';
  state.profile.level = Math.max(1, Math.floor(state.profile.xp / 80) + 1);
  state.profile.xpToNext = state.profile.level * 80;
}

function completeQuest(id) {
  const quest = state.quests.find(q => q.id === id);
  if (!quest || quest.status !== 'active') return;
  quest.status = 'completed';
  state.profile.xp += quest.xp;
  state.profile.streak += 1;
  applyRewards(quest.rewards, true);
  updateRank();
  state.logs.unshift(makeLog('Quest completed', `${quest.title} закрыт. Получено ${quest.xp} XP.`, true));
  saveState();
  render();
}

function failQuest(id) {
  const quest = state.quests.find(q => q.id === id);
  if (!quest || quest.status !== 'active') return;
  quest.status = 'failed';
  state.profile.xp = Math.max(0, state.profile.xp + quest.penalty);
  state.profile.streak = 0;
  state.profile.stats.discipline = Math.max(0, state.profile.stats.discipline - 1);
  updateRank();
  const penaltyQuest = {
    id: crypto.randomUUID(),
    title: `Штрафной квест: восстановление после "${quest.title}"`,
    description: 'Сделай короткое восстановительное действие, чтобы вернуть темп: 15 минут фокуса без отвлечений.',
    type: 'Penalty Quest',
    xp: 12,
    penalty: -4,
    status: 'active',
    rewards: ['+1 Discipline']
  };
  state.quests.unshift(penaltyQuest);
  state.logs.unshift(makeLog('Penalty applied', `${quest.title} провален. Применён штраф ${quest.penalty} XP и выдан восстановительный квест.`, true));
  saveState();
  render();
}

function applyRewards(rewards, positive) {
  rewards.forEach(reward => {
    const key = reward.toLowerCase();
    if (key.includes('discipline')) state.profile.stats.discipline += positive ? 1 : -1;
    if (key.includes('mind')) state.profile.stats.mind += positive ? 1 : -1;
    if (key.includes('body')) state.profile.stats.body += positive ? 1 : -1;
    if (key.includes('creativity')) state.profile.stats.creativity += positive ? 1 : -1;
    if (key.includes('career')) state.profile.stats.career += positive ? 1 : -1;
    if (key.includes('social')) state.profile.stats.social += positive ? 1 : -1;
  });
}

function renderStats() {
  statsGrid.innerHTML = '';
  const labels = {
    discipline: 'Discipline',
    mind: 'Mind',
    body: 'Body',
    creativity: 'Creativity',
    career: 'Career',
    social: 'Social'
  };
  Object.entries(state.profile.stats).forEach(([key, value]) => {
    const div = document.createElement('div');
    div.className = 'stat-item';
    div.innerHTML = `<span>${labels[key]}</span><strong>${value}</strong>`;
    statsGrid.appendChild(div);
  });
}

function renderQuests() {
  questList.innerHTML = '';
  state.quests.forEach(quest => {
    const node = questTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('.quest-type').textContent = quest.type;
    node.querySelector('.quest-title').textContent = quest.title;
    node.querySelector('.quest-desc').textContent = quest.description;
    const status = node.querySelector('.quest-status');
    status.textContent = quest.status === 'active' ? 'Активен' : quest.status === 'completed' ? 'Выполнен' : 'Провален';
    status.className = `quest-status ${quest.status}`;
    const rewardsWrap = node.querySelector('.quest-rewards');
    rewardsWrap.innerHTML = `
      <span class="pill gold">+${quest.xp} XP</span>
      <span class="pill red">${quest.penalty} XP</span>
      ${quest.rewards.map(item => `<span class="pill dark">${item}</span>`).join('')}
    `;
    const completeBtn = node.querySelector('.complete-btn');
    const failBtn = node.querySelector('.fail-btn');
    if (quest.status !== 'active') {
      completeBtn.disabled = true;
      failBtn.disabled = true;
      completeBtn.style.opacity = .45;
      failBtn.style.opacity = .45;
    }
    completeBtn.addEventListener('click', () => completeQuest(quest.id));
    failBtn.addEventListener('click', () => failQuest(quest.id));
    questList.appendChild(node);
  });
}

function renderLogs() {
  systemLog.innerHTML = '';
  state.logs.slice(0, 12).forEach(log => {
    const div = document.createElement('div');
    div.className = `log-item ${log.epic ? 'epic' : ''}`;
    div.innerHTML = `<small>${log.time}</small><strong>${log.title}</strong><p>${log.body}</p>`;
    systemLog.appendChild(div);
  });
}

function renderSummary() {
  const active = state.quests.filter(q => q.status === 'active').length;
  const completed = state.quests.filter(q => q.status === 'completed').length;
  const failed = state.quests.filter(q => q.status === 'failed').length;

  document.getElementById('playerName').textContent = state.profile.name;
  document.getElementById('rankBadge').textContent = state.profile.rank;
  document.getElementById('levelText').textContent = `Level ${state.profile.level}`;
  document.getElementById('xpText').textContent = `${state.profile.xp} / ${state.profile.xpToNext}`;
  document.getElementById('xpFill').style.width = `${Math.min(100, (state.profile.xp / state.profile.xpToNext) * 100)}%`;
  document.getElementById('activeCount').textContent = active;
  document.getElementById('completedCount').textContent = completed;
  document.getElementById('failedCount').textContent = failed;
  document.getElementById('streakCount').textContent = state.profile.streak;
}

function render() {
  saveState();
  renderSummary();
  renderStats();
  renderQuests();
  renderLogs();
}

updateRank();
render();