function init() {
  const u = localStorage.getItem('hq_current');
  if (!u) {
    window.location.href = 'login.html';
    return;
  }
  const cu = JSON.parse(u);
  if (cu.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return;
  }
  loadAll();
}

function loadAll() {
  const users = JSON.parse(localStorage.getItem('hq_users') || '[]');
  const sessions = JSON.parse(localStorage.getItem('hq_game_sessions') || '[]');
  
  // Overview stats
  document.getElementById('ovUsers').textContent = users.length;
  document.getElementById('ovSessions').textContent = sessions.length;
  const avg = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length) : 0;
  document.getElementById('ovAvgScore').textContent = avg + '%';
  const maxXP = users.length ? Math.max(...users.map(u => u.xp || 0)) : 0;
  document.getElementById('ovTopXP').textContent = maxXP;
  
  // Top 5
  const top5 = [...users].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 5);
  const topT = document.getElementById('topTable');
  topT.innerHTML = '<tr><th>#</th><th>NOMBRE</th><th>CARRERA</th><th>XP</th><th>JUEGOS</th><th>RACHA</th></tr>';
  top5.forEach((u, i) => {
    const row = topT.insertRow();
    row.innerHTML = `<td style="font-family:var(--pixel);font-size:.45rem;color:var(--gold)">#${i + 1}</td>
      <td>${u.nombre} ${u.apellido}</td>
      <td>${u.carrera || '-'}</td>
      <td style="font-family:var(--pixel);font-size:.42rem;color:var(--gold)">${u.xp || 0}</td>
      <td>${(u.completedGames || []).length}</td>
      <td style="color:var(--red)">🔥${u.streak || 0}</td>`;
  });
  if (!top5.length) topT.innerHTML += '<tr><td colspan="6" class="empty-state">SIN USUARIOS AÚN</td></tr>';
  
  // Recent sessions
  const recT = document.getElementById('recentTable');
  recT.innerHTML = '<tr><th>ESTUDIANTE</th><th>DINÁMICA</th><th>PUNTAJE</th><th>XP</th><th>FECHA</th></tr>';
  const recent = sessions.slice(-8).reverse();
  recent.forEach(s => {
    const row = recT.insertRow();
    const sc = s.score >= 80 ? 'badge-s' : s.score >= 50 ? 'badge-m' : 'badge-l';
    row.innerHTML = `<td>${s.userName || '?'}</td>
      <td style="font-family:var(--pixel);font-size:.35rem;color:var(--gold)">${s.gameName}</td>
      <td><span class="badge ${sc}">${s.score}%</span></td>
      <td style="color:var(--gold)">+${s.xpEarned}</td>
      <td style="color:rgba(245,230,200,.5)">${new Date(s.date).toLocaleDateString('es')}</td>`;
  });
  if (!recent.length) recT.innerHTML += '<tr><td colspan="5" class="empty-state">SIN PARTIDAS AÚN</td></tr>';
}

function showTab(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  if (id === 'users') renderUsers();
  if (id === 'sessions') renderSessions();
  if (id === 'charts') renderCharts();
}

function renderUsers() {
  const users = JSON.parse(localStorage.getItem('hq_users') || '[]');
  const wrap = document.getElementById('usersTableWrap');
  if (!users.length) {
    wrap.innerHTML = '<div class="empty-state">NO HAY USUARIOS REGISTRADOS AÚN</div>';
    return;
  }
  let html = `<table><tr><th>NOMBRE</th><th>EMAIL</th><th>CARRERA</th><th>XP</th><th>JUEGOS</th><th>RACHA</th><th>REGISTRO</th><th>ACCIONES</th></tr>`;
  users.forEach(u => {
    html += `<tr>
      <td><strong>${u.nombre} ${u.apellido}</strong></td>
      <td>${u.email}</td>
      <td>${u.carrera || '-'}</td>
      <td style="font-family:var(--pixel);font-size:.42rem;color:var(--gold)">${u.xp || 0}</td>
      <td>${(u.completedGames || []).length}/4</td>
      <td style="color:var(--red)">🔥${u.streak || 0}</td>
      <td>${new Date(u.createdAt || Date.now()).toLocaleDateString('es')}</td>
      <td><button class="btn-sm btn-view" onclick="viewUser(${u.id})">VER</button> <button class="btn-sm btn-del" onclick="deleteUser(${u.id})">DEL</button></td>
    </tr>`;
  });
  html += '</table>';
  wrap.innerHTML = html;
}

function renderSessions() {
  const sessions = JSON.parse(localStorage.getItem('hq_game_sessions') || '[]');
  const wrap = document.getElementById('sessionsTableWrap');
  if (!sessions.length) {
    wrap.innerHTML = '<div class="empty-state">NO HAY PARTIDAS REGISTRADAS AÚN</div>';
    return;
  }
  let html = `<table><tr><th>ESTUDIANTE</th><th>DINÁMICA</th><th>PUNTAJE</th><th>XP GANADO</th><th>FECHA Y HORA</th></tr>`;
  sessions.slice().reverse().forEach(s => {
    const sc = s.score >= 80 ? 'badge-s' : s.score >= 50 ? 'badge-m' : 'badge-l';
    html += `<tr>
      <td><strong>${s.userName || '?'}</strong></td>
      <td style="font-family:var(--pixel);font-size:.35rem;color:var(--gold)">${s.gameName}</td>
      <td><span class="badge ${sc}">${s.score}%</span></td>
      <td style="color:var(--gold)">+${s.xpEarned} XP</td>
      <td>${new Date(s.date).toLocaleString('es')}</td>
    </tr>`;
  });
  html += '</table>';
  wrap.innerHTML = html;
}

function renderCharts() {
  const sessions = JSON.parse(localStorage.getItem('hq_game_sessions') || '[]');
  const users = JSON.parse(localStorage.getItem('hq_users') || '[]');
  const games = ['QUIZ BOSS', 'MEMORY MATRIX', 'TIME BREAKER', 'PRIORITY RUSH'];
  let gc = '';
  games.forEach(g => {
    const gs = sessions.filter(s => s.gameName === g);
    const avg = gs.length ? Math.round(gs.reduce((a, s) => a + s.score, 0) / gs.length) : 0;
    gc += `<div class="chart-bar-row">
      <div class="chart-label">${g}</div>
      <div class="chart-bar-bg"><div class="chart-bar-fill" style="width:${avg}%"></div></div>
      <div class="chart-val">${avg}% (${gs.length})</div>
    </div>`;
  });
  document.getElementById('gamesChart').innerHTML = gc || '<div class="empty-state">SIN DATOS AÚN</div>';
  
  // XP ranges
  const ranges = [{ l: '0-99', min: 0, max: 99 }, { l: '100-499', min: 100, max: 499 }, { l: '500-999', min: 500, max: 999 }, { l: '1000+', min: 1000, max: 99999 }];
  let xc = '';
  const maxU = Math.max(1, ...ranges.map(r => users.filter(u => (u.xp || 0) >= r.min && (u.xp || 0) <= r.max).length));
  ranges.forEach(r => {
    const cnt = users.filter(u => (u.xp || 0) >= r.min && (u.xp || 0) <= r.max).length;
    const pct = Math.round((cnt / maxU) * 100);
    xc += `<div class="chart-bar-row">
      <div class="chart-label">${r.l} XP</div>
      <div class="chart-bar-bg"><div class="chart-bar-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--teal),var(--gold))"></div></div>
      <div class="chart-val">${cnt} usuarios</div>
    </div>`;
  });
  document.getElementById('xpChart').innerHTML = xc || '<div class="empty-state">SIN USUARIOS AÚN</div>';
}

function viewUser(id) {
  const users = JSON.parse(localStorage.getItem('hq_users') || '[]');
  const u = users.find(x => x.id === id);
  if (!u) return;
  const sessions = JSON.parse(localStorage.getItem('hq_game_sessions') || '[]');
  const userSess = sessions.filter(s => s.userId === id);
  
  document.getElementById('modalContent').innerHTML = `
    <div class="modal-title">👤 ${u.nombre} ${u.apellido}</div>
    <table style="margin-bottom:16px;">
      <tr><td style="font-family:var(--pixel);font-size:.35rem;">EMAIL</td><td>${u.email}</td></tr>
      <tr><td style="font-family:var(--pixel);font-size:.35rem;">CARRERA</td><td>${u.carrera || '-'}</td></tr>
      <tr><td style="font-family:var(--pixel);font-size:.35rem;">XP TOTAL</td><td style="color:var(--gold)">${u.xp || 0}</td></tr>
      <tr><td style="font-family:var(--pixel);font-size:.35rem;">RACHA</td><td style="color:var(--red)">🔥 ${u.streak || 0} días</td></tr>
      <tr><td style="font-family:var(--pixel);font-size:.35rem;">JUEGOS</td><td>${(u.completedGames || []).join(', ') || 'ninguno'}</td></tr>
      <tr><td style="font-family:var(--pixel);font-size:.35rem;">REGISTRO</td><td>${new Date(u.createdAt || Date.now()).toLocaleString('es')}</td></tr>
    </table>
    <div style="font-family:var(--pixel);font-size:.38rem;color:var(--gold);margin-bottom:10px;">RESULTADOS (${userSess.length} partidas)</div>
    ${userSess.length ? userSess.map(s => {
      const sc = s.score >= 80 ? 'badge-s' : s.score >= 50 ? 'badge-m' : 'badge-l';
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--card2);border:1px solid var(--border);margin-bottom:6px;">
        <span style="font-family:var(--pixel);font-size:.32rem;color:var(--gold)">${s.gameName}</span>
        <span class="badge ${sc}">${s.score}%</span>
        <span style="color:var(--gold);">+${s.xpEarned}</span>
        <span style="color:rgba(245,230,200,.5);">${new Date(s.date).toLocaleDateString('es')}</span>
      </div>`;
    }).join('') : '<div class="empty-state">SIN PARTIDAS</div>'}
    <button class="btn-close" onclick="closeModal()">✕ CERRAR</button>`;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function deleteUser(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  let users = JSON.parse(localStorage.getItem('hq_users') || '[]');
  users = users.filter(u => u.id !== id);
  localStorage.setItem('hq_users', JSON.stringify(users));
  renderUsers();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function logout() {
  localStorage.removeItem('hq_current');
  window.location.href = 'index.html';
}

init();