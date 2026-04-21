const LEVELS = [
  { n: '🌱 SEMILLERO', x: 0 },
  { n: '📖 APRENDIZ', x: 200 },
  { n: '⚡ ESTUDIOSO', x: 500 },
  { n: '🎓 ACADÉMICO', x: 1000 },
  { n: '🏆 MAESTRO', x: 2000 },
  { n: '🌟 LEYENDA', x: 4000 }
];

let currentUser = null;

function init() {
  const u = localStorage.getItem('hq_current');
  if (!u) {
    window.location.href = 'login.html';
    return;
  }
  currentUser = JSON.parse(u);
  if (currentUser.role === 'admin') {
    window.location.href = 'admin.html';
    return;
  }
  document.getElementById('navUser').textContent = currentUser.nombre.toUpperCase();
  syncUser();
  updateUI();
  renderGames();
  renderResults();
  renderMetas();
}

function syncUser() {
  const users = JSON.parse(localStorage.getItem('hq_users') || '[]');
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx >= 0) {
    currentUser = users[idx];
    localStorage.setItem('hq_current', JSON.stringify(currentUser));
  }
}

function saveUser() {
  const users = JSON.parse(localStorage.getItem('hq_users') || '[]');
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx >= 0) {
    users[idx] = currentUser;
    localStorage.setItem('hq_users', JSON.stringify(users));
    localStorage.setItem('hq_current', JSON.stringify(currentUser));
  }
}

function updateUI() {
  const xp = currentUser.xp || 0;
  const streak = currentUser.streak || 0;
  const games = (currentUser.completedGames || []).length;
  const metas = (currentUser.metas || []).filter(m => m.done).length;
  
  document.getElementById('navXP').textContent = xp;
  document.getElementById('hStreak').textContent = '🔥 ' + streak;
  document.getElementById('hXP').textContent = '⚡ ' + xp;
  document.getElementById('hGames').textContent = '🎮 ' + games;
  document.getElementById('hMetas').textContent = '✅ ' + metas;
  
  let lvl = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].x) {
      lvl = i;
      break;
    }
  }
  const next = lvl < LEVELS.length - 1 ? LEVELS[lvl + 1].x : LEVELS[lvl].x + 1000;
  const cur = LEVELS[lvl].x;
  const pct = Math.min(100, ((xp - cur) / (next - cur)) * 100);
  
  document.getElementById('levelName').textContent = LEVELS[lvl].n;
  document.getElementById('levelNum').textContent = lvl + 1;
  document.getElementById('levelXP').textContent = xp;
  document.getElementById('levelNext').textContent = next;
  document.getElementById('levelBar').style.width = pct + '%';
}

function renderGames() {
  const done = currentUser.completedGames || [];
  const gamesList = window.GAMES || [];
  
  const html = gamesList.map(g => {
    const isDone = done.includes(g.id);
    return `<div class="game-card" onclick="startGame('${g.id}')">
      <div class="game-thumb ${g.class}"><div class="game-pixel-grid"></div><span>${g.emoji}</span></div>
      <div class="game-info">
        <div class="game-title">${g.title}</div>
        <div class="game-desc">${g.desc}</div>
        ${isDone ? `<span class="game-done">✓ COMPLETADO</span>` : `<span class="game-xp">+${g.xp} XP</span>`}
      </div></div>`;
  }).join('');
  
  document.getElementById('homeGames').innerHTML = html;
  document.getElementById('allGames').innerHTML = html;
}

function renderResults() {
  const results = currentUser.gameResults || [];
  const el = document.getElementById('resultsList');
  
  if (!results.length) {
    el.innerHTML = '<div style="background:var(--card);border:3px solid var(--border);padding:28px;text-align:center;font-family:var(--pixel);font-size:.4rem;color:rgba(245,230,200,.4);">AÚN NO HAS JUGADO<br>¡COMPLETA TU PRIMERA DINÁMICA!</div>';
    return;
  }
  
  el.innerHTML = results.slice().reverse().map(r => {
    const sc = r.score >= 80 ? 'score-s' : r.score >= 50 ? 'score-m' : 'score-l';
    return `<div class="result-item">
      <div><div class="result-game">${r.gameName}</div><div class="result-date" style="font-size:.8rem;color:rgba(245,230,200,.5);">${new Date(r.date).toLocaleDateString('es')}</div></div>
      <div class="result-score ${sc}">${r.score}% | +${r.xpEarned} XP</div></div>`;
  }).join('');
}

function renderMetas() {
  const metas = currentUser.metas || [];
  const el = document.getElementById('metasList');
  
  if (!metas.length) {
    el.innerHTML = '<div style="color:rgba(245,230,200,.4);padding:20px;text-align:center;font-family:var(--pixel);font-size:.38rem;">AGREGA TU PRIMERA META</div>';
    return;
  }
  
  el.innerHTML = metas.map((m, i) => `
    <div style="background:var(--card);border:3px solid ${m.done ? 'var(--teal)' : 'var(--border)'};padding:14px 18px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div onclick="toggleMeta(${i})" style="width:22px;height:22px;border:2px solid ${m.done ? 'var(--teal)' : 'var(--border)'};background:${m.done ? 'var(--teal)' : 'transparent'};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.8rem;">${m.done ? '✓' : ''}</div>
        <span style="font-size:.95rem;${m.done ? 'text-decoration:line-through;color:rgba(245,230,200,.4);' : ''}">${m.text}</span>
      </div>
      <button onclick="deleteMeta(${i})" style="background:none;border:none;color:rgba(245,230,200,.4);cursor:pointer;font-size:1.1rem;">🗑</button>
    </div>`).join('');
}

function addMeta() {
  const inp = document.getElementById('metaInput');
  const val = inp.value.trim();
  if (!val) return;
  if (!currentUser.metas) currentUser.metas = [];
  currentUser.metas.unshift({ text: val, done: false, createdAt: new Date().toISOString() });
  saveUser();
  renderMetas();
  inp.value = '';
  showToast('★ META AGREGADA', '¡Completa tus metas para ganar XP!');
}

function toggleMeta(i) {
  if (currentUser.metas[i].done) return;
  currentUser.metas[i].done = true;
  currentUser.xp = (currentUser.xp || 0) + 30;
  updateStreak();
  saveUser();
  renderMetas();
  updateUI();
  showToast('✅ META COMPLETADA', '+30 XP ganados');
  spawnConfetti();
}

function deleteMeta(i) {
  currentUser.metas.splice(i, 1);
  saveUser();
  renderMetas();
}

function updateStreak() {
  const today = new Date().toDateString();
  if (currentUser.lastStudy !== today) {
    if (currentUser.lastStudy) {
      const diff = Math.floor((new Date() - new Date(currentUser.lastStudy)) / 86400000);
      currentUser.streak = diff === 1 ? (currentUser.streak || 0) + 1 : 1;
    } else {
      currentUser.streak = 1;
    }
    currentUser.lastStudy = today;
  }
}

function showToast(title, sub) {
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastSub').textContent = sub;
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function showTab(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  if (id === 'results') renderResults();
  if (id === 'metas') renderMetas();
}

function logout() {
  localStorage.removeItem('hq_current');
  window.location.href = 'index.html';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function openModal(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function spawnConfetti() {
  const colors = ['#c0392b', '#f39c12', '#1abc9c', '#00d4ff', '#e74c3c'];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;z-index:9998;width:${6 + Math.random() * 8}px;height:${6 + Math.random() * 8}px;background:${colors[Math.floor(Math.random() * colors.length)]};left:${Math.random() * 100}vw;top:0;animation:fall ${1.5 + Math.random() * 2}s linear forwards;border-radius:${Math.random() > .5 ? '50%' : '0'};`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
}

const style = document.createElement('style');
style.textContent = '@keyframes fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1;}100%{transform:translateY(100vh) rotate(720deg);opacity:0;}}';
document.head.appendChild(style);

init();