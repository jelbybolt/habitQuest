const GAMES = [
  { id: 'quiz', emoji: '❓', title: 'QUIZ BOSS', desc: 'Responde todas las preguntas correctamente para derrotar al jefe. ¡Sin errores!', xp: 100, type: 'quiz', class: 'gt3' },
  { id: 'memory', emoji: '🧩', title: 'MEMORY MATRIX', desc: 'Empareja técnicas de estudio con sus definiciones.', xp: 60, type: 'memory', class: 'gt2' },
  { id: 'time', emoji: '⏱️', title: 'TIME BREAKER', desc: 'Ordena los bloques de tiempo en el horario correcto.', xp: 80, type: 'time', class: 'gt1' },
  { id: 'priority', emoji: '🎯', title: 'PRIORITY RUSH', desc: 'Clasifica tareas en la Matriz Eisenhower.', xp: 70, type: 'priority', class: 'gt4' }
];

let gameState = {};

// QUIZ QUESTIONS
const QUIZ_QS = [
  { q: '¿Cuántos minutos de trabajo propone el Método Pomodoro?', opts: ['15 min', '20 min', '25 min', '30 min'], c: 2 },
  { q: '¿Qué hace la Repetición Espaciada?', opts: ['Memoriza en una noche', 'Repasa en intervalos crecientes', 'Estudia solo de noche', 'Usa colores'], c: 1 },
  { q: '¿Cómo se llama el estrés moderado que mejora el rendimiento?', opts: ['Distress', 'Burnout', 'Eustress', 'Ansiedad'], c: 2 },
  { q: 'Según Ausubel, el aprendizaje significativo requiere...', opts: ['Memorización pura', 'Relación con conocimientos previos', 'Estudiar solo', 'Leer en voz alta'], c: 1 },
  { q: '¿Qué porcentaje de retención se reduce al dormir menos de 6 horas?', opts: ['10%', '20%', '30%', '40%'], c: 3 },
  { q: '¿Qué es la Regla 80/20 aplicada al estudio?', opts: ['Estudiar 80% del día', '20% esfuerzo produce 80% resultados', 'Hacer 80% de tareas', 'Descansar 20 min'], c: 1 },
  { q: '¿Cuál técnica consiste en explicar un tema como a un niño?', opts: ['Método SQ3R', 'Técnica Feynman', 'Mapa Mental', 'Pomodoro'], c: 1 }
];

let quizState = {};

function startGame(id) {
  const g = GAMES.find(x => x.id === id);
  if (!g) return;
  gameState = { id, xp: g.xp, name: g.title };
  if (g.type === 'quiz') startQuiz();
  else if (g.type === 'memory') startMemory();
  else if (g.type === 'time') startTime();
  else if (g.type === 'priority') startPriority();
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============ QUIZ BOSS ============
function startQuiz() {
  quizState = {
    qs: shuffle([...QUIZ_QS]).slice(0, 5),
    current: 0,
    errors: 0
  };
  showQuizQ();
}

function showQuizQ() {
  const q = quizState.qs[quizState.current];
  const dots = quizState.qs.map((_, i) => `<div class="qp-dot ${i < quizState.current ? 'done' : i === quizState.current ? 'active' : ''}"></div>`).join('');
  
  openModal(`
    <div class="modal-title">❓ QUIZ BOSS — PREGUNTA ${quizState.current + 1}/${quizState.qs.length}</div>
    <div class="quiz-progress" style="display:flex;gap:6px;margin-bottom:20px;">${dots}</div>
    <div class="quiz-q" style="font-size:1.05rem;font-weight:600;margin-bottom:18px;">${q.q}</div>
    <div class="quiz-opts" style="display:flex;flex-direction:column;gap:10px;">
      ${q.opts.map((o, i) => `<button class="quiz-opt" onclick="answerQuiz(${i})" style="background:#000;border:2px solid var(--border);padding:12px;cursor:pointer;text-align:left;">${o}</button>`).join('')}
    </div>`);
}

function answerQuiz(idx) {
  const q = quizState.qs[quizState.current];
  const btns = document.querySelectorAll('.quiz-opt');
  
  btns.forEach((b, i) => {
    b.style.pointerEvents = 'none';
    if (i === q.c) b.classList.add('correct');
    if (i === idx && idx !== q.c) b.classList.add('wrong');
  });
  
  if (idx !== q.c) {
    quizState.errors++;
    setTimeout(() => {
      openModal(`<div class="modal-title" style="color:var(--red)">❌ ¡INCORRECTO!</div>
        <div style="text-align:center;padding:16px;margin-bottom:24px;">Debes responder TODAS correctamente.<br>Reiniciando desde la pregunta 1...</div>
        <div style="text-align:center;"><button class="btn-sm btn-red" onclick="startQuiz()">🔄 REINTENTAR</button></div>`);
    }, 800);
    return;
  }
  
  setTimeout(() => {
    quizState.current++;
    if (quizState.current < quizState.qs.length) showQuizQ();
    else completeGame(100, 100);
  }, 700);
}

// ============ MEMORY MATRIX ============
const MEM_PAIRS = [
  { k: 'POMODORO', v: '25 min concentrado + 5 min descanso' },
  { k: 'FEYNMAN', v: 'Explica el tema como a un niño' },
  { k: 'EUSTRESS', v: 'Estrés moderado que mejora el rendimiento' },
  { k: 'AUSUBEL', v: 'Aprendizaje significativo con conocimientos previos' },
  { k: 'PDCA', v: 'Planificar-Hacer-Verificar-Actuar' },
  { k: '80/20', v: '20% esfuerzo produce 80% resultados' }
];

let memState = {};

function startMemory() {
  const pairs = shuffle([...MEM_PAIRS]).slice(0, 4);
  const cards = shuffle([
    ...pairs.map(p => ({ text: p.k, pair: p.k, matched: false })),
    ...pairs.map(p => ({ text: p.v, pair: p.k, matched: false }))
  ]);
  memState = { cards, flipped: [], matched: 0, moves: 0 };
  renderMemory();
}

function renderMemory() {
  openModal(`<div class="modal-title">🧩 MEMORY MATRIX</div>
    <div style="text-align:center;margin-bottom:14px;font-family:var(--pixel);font-size:.38rem;">MOVIMIENTOS: ${memState.moves} | PARES: ${memState.matched}/4</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
      ${memState.cards.map((c, i) => {
        const isFlipped = memState.flipped.includes(i) || c.matched;
        const cls = c.matched ? 'mem-card matched' : `mem-card ${isFlipped ? 'flipped' : ''}`;
        return `<div class="${cls}" onclick="flipCard(${i})" style="aspect-ratio:1;background:#000;border:2px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.7rem;text-align:center;padding:6px;">${isFlipped ? c.text : '?'}</div>`;
      }).join('')}
    </div>`);
}

function flipCard(i) {
  const c = memState.cards;
  if (c[i].matched || memState.flipped.includes(i) || memState.flipped.length >= 2) return;
  
  memState.flipped.push(i);
  memState.moves++;
  
  if (memState.flipped.length === 2) {
    const [a, b] = memState.flipped;
    if (c[a].pair === c[b].pair && a !== b) {
      c[a].matched = true;
      c[b].matched = true;
      memState.matched++;
      memState.flipped = [];
      renderMemory();
      if (memState.matched === 4) setTimeout(() => completeGame(100, 100), 400);
    } else {
      renderMemory();
      setTimeout(() => {
        memState.flipped = [];
        renderMemory();
      }, 900);
    }
  } else {
    renderMemory();
  }
}

// ============ TIME BREAKER ============
const TIME_SLOTS = [
  { label: 'Estudiar Matemáticas', ideal: 0 },
  { label: 'Descanso activo', ideal: 1 },
  { label: 'Revisar apuntes', ideal: 2 },
  { label: 'Ejercicios prácticos', ideal: 3 },
  { label: 'Repaso final del día', ideal: 4 }
];

let timeState = {};

function startTime() {
  timeState = {
    slots: shuffle([...TIME_SLOTS]),
    dragIdx: null,
    timer: 30,
    score: 0
  };
  renderTime();
  let t = setInterval(() => {
    timeState.timer--;
    const el = document.getElementById('timerDisplay');
    if (el) el.textContent = timeState.timer + 's';
    if (timeState.timer <= 0) {
      clearInterval(t);
      checkTime();
    }
  }, 1000);
  timeState.interval = t;
}

function renderTime() {
  openModal(`<div class="modal-title">⏱️ TIME BREAKER</div>
    <div style="text-align:center;font-family:var(--pixel);font-size:.5rem;color:var(--gold);margin-bottom:16px;">TIEMPO: <span id="timerDisplay">${timeState.timer}s</span></div>
    <p style="margin-bottom:14px;">Ordena las actividades en el orden correcto:</p>
    <div id="timeSlots">
      ${timeState.slots.map((s, i) => `
        <div class="time-slot" draggable="true" data-i="${i}" 
          ondragstart="timeState.dragIdx=${i}" 
          ondragover="event.preventDefault();this.classList.add('drag-over')"
          ondragleave="this.classList.remove('drag-over')"
          ondrop="dropTime(${i},this)"
          style="background:#000;border:2px solid var(--border);padding:10px;margin-bottom:8px;cursor:grab;">
          <span style="font-family:var(--pixel);font-size:.35rem;color:var(--gold);margin-right:10px;">${i + 1}.</span>${s.label}
        </div>`).join('')}
    </div>
    <button class="btn-sm btn-gold" onclick="checkTime()" style="width:100%;margin-top:8px;">✓ VERIFICAR ORDEN</button>`);
}

function dropTime(toIdx, el) {
  el.classList.remove('drag-over');
  const from = timeState.dragIdx;
  if (from === null || from === toIdx) return;
  const tmp = timeState.slots[from];
  timeState.slots[from] = timeState.slots[toIdx];
  timeState.slots[toIdx] = tmp;
  renderTime();
}

function checkTime() {
  clearInterval(timeState.interval);
  let correct = 0;
  timeState.slots.forEach((s, i) => { if (s.ideal === i) correct++; });
  const pct = Math.round((correct / TIME_SLOTS.length) * 100);
  completeGame(pct, Math.round(pct * 0.8));
}

// ============ PRIORITY RUSH ============
const TASKS = [
  { text: 'Entregar proyecto de Programación I', u: true, i: true },
  { text: 'Revisar redes sociales', u: false, i: false },
  { text: 'Estudiar para examen de Cálculo', u: false, i: true },
  { text: 'Llamada de papás', u: true, i: false },
  { text: 'Leer capítulo de Física II', u: false, i: true },
  { text: 'Ver serie en Netflix', u: false, i: false },
  { text: 'Reunión urgente del equipo', u: true, i: true },
  { text: 'Ordenar el escritorio', u: false, i: false }
];

let prioState = {};

function startPriority() {
  prioState = {
    tasks: shuffle([...TASKS]),
    placed: { q1: [], q2: [], q3: [], q4: [] },
    selected: null,
    timer: 45
  };
  renderPriority();
  let t = setInterval(() => {
    prioState.timer--;
    const el = document.getElementById('prioTimer');
    if (el) el.textContent = prioState.timer + 's';
    if (prioState.timer <= 0) {
      clearInterval(t);
      checkPriority();
    }
  }, 1000);
  prioState.interval = t;
}

function renderPriority() {
  const placed = Object.values(prioState.placed).flat();
  const remaining = prioState.tasks.filter(t => !placed.includes(t.text));
  
  openModal(`<div class="modal-title">🎯 PRIORITY RUSH</div>
    <div style="text-align:center;font-family:var(--pixel);font-size:.5rem;color:var(--gold);margin-bottom:12px;">TIEMPO: <span id="prioTimer">${prioState.timer}s</span></div>
    <p style="margin-bottom:12px;">Haz clic en una tarea y luego en el cuadrante:</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
      ${remaining.map(t => `<div class="task-item" onclick="selectTask('${t.text.replace(/'/g, "\\'")}')" style="background:#000;border:2px solid var(--border);padding:7px 10px;cursor:pointer;${prioState.selected === t.text ? 'border-color:var(--gold);' : ''}">${t.text}</div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;">
      <div class="matrix-cell" onclick="placeTo('q1')" style="background:var(--card2);border:2px solid var(--border);padding:12px;"><h4 style="color:var(--red);">🔴 URGENTE+IMPORTANTE</h4>${(prioState.placed.q1 || []).map(t => `<div style="font-size:.75rem;">✓ ${t}</div>`).join('')}</div>
      <div class="matrix-cell" onclick="placeTo('q2')" style="background:var(--card2);border:2px solid var(--border);padding:12px;"><h4 style="color:var(--gold);">🟡 NO URGENTE+IMPORTANTE</h4>${(prioState.placed.q2 || []).map(t => `<div style="font-size:.75rem;">✓ ${t}</div>`).join('')}</div>
      <div class="matrix-cell" onclick="placeTo('q3')" style="background:var(--card2);border:2px solid var(--border);padding:12px;"><h4 style="color:var(--teal);">🟢 URGENTE+NO IMPORTANTE</h4>${(prioState.placed.q3 || []).map(t => `<div style="font-size:.75rem;">✓ ${t}</div>`).join('')}</div>
      <div class="matrix-cell" onclick="placeTo('q4')" style="background:var(--card2);border:2px solid var(--border);padding:12px;"><h4 style="color:rgba(245,230,200,.5);">⚫ NO URG+NO IMP</h4>${(prioState.placed.q4 || []).map(t => `<div style="font-size:.75rem;">✓ ${t}</div>`).join('')}</div>
    </div>
    ${remaining.length === 0 ? `<button class="btn-sm btn-gold" onclick="checkPriority()" style="width:100%;margin-top:10px;">✓ VERIFICAR</button>` : ''}`);
}

function selectTask(txt) {
  prioState.selected = txt;
  renderPriority();
}

function placeTo(q) {
  if (!prioState.selected) return;
  prioState.placed[q].push(prioState.selected);
  prioState.selected = null;
  renderPriority();
  const placed = Object.values(prioState.placed).flat();
  if (placed.length === prioState.tasks.length) setTimeout(() => checkPriority(), 400);
}

function checkPriority() {
  clearInterval(prioState.interval);
  let correct = 0;
  TASKS.forEach(t => {
    const correctQ = t.u && t.i ? 'q1' : !t.u && t.i ? 'q2' : t.u && !t.i ? 'q3' : 'q4';
    if ((prioState.placed[correctQ] || []).includes(t.text)) correct++;
  });
  const pct = Math.round((correct / TASKS.length) * 100);
  completeGame(pct, Math.round(pct * 0.7));
}

// ============ COMPLETE GAME ============
function completeGame(score, xpMult) {
  const xpEarned = Math.round(gameState.xp * (xpMult / 100));
  currentUser.xp = (currentUser.xp || 0) + xpEarned;
  
  if (!currentUser.completedGames) currentUser.completedGames = [];
  if (!currentUser.completedGames.includes(gameState.id)) {
    currentUser.completedGames.push(gameState.id);
  }
  
  if (!currentUser.gameResults) currentUser.gameResults = [];
  currentUser.gameResults.push({
    gameId: gameState.id,
    gameName: gameState.name,
    score: score,
    xpEarned: xpEarned,
    date: new Date().toISOString()
  });
  
  // Global sessions for admin
  const sess = JSON.parse(localStorage.getItem('hq_game_sessions') || '[]');
  sess.push({
    userId: currentUser.id,
    userName: currentUser.nombre + ' ' + currentUser.apellido,
    gameId: gameState.id,
    gameName: gameState.name,
    score: score,
    xpEarned: xpEarned,
    date: new Date().toISOString()
  });
  localStorage.setItem('hq_game_sessions', JSON.stringify(sess));
  
  updateStreak();
  saveUser();
  updateUI();
  renderGames();
  
  const grade = score >= 80 ? 'S RANK 🏆' : score >= 60 ? 'A RANK ⭐' : 'B RANK 📚';
  
  openModal(`<div class="modal-title" style="color:var(--teal);">✅ ¡COMPLETADO!</div>
    <div style="text-align:center;padding:20px;">
      <div style="font-size:3.5rem;margin-bottom:12px;">${score >= 80 ? '🏆' : score >= 60 ? '⭐' : '📚'}</div>
      <div style="font-family:var(--pixel);font-size:.8rem;color:var(--gold);margin-bottom:8px;">${grade}</div>
      <div style="font-family:var(--pixel);font-size:1.2rem;color:var(--teal);margin-bottom:8px;">${score}%</div>
      <div style="font-family:var(--pixel);font-size:.55rem;color:var(--gold);margin-bottom:20px;">+${xpEarned} XP GANADOS</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="btn-sm btn-teal" onclick="closeModal()">VER RESULTADOS</button>
        <button class="btn-sm btn-gold" onclick="startGame('${gameState.id}')">REPETIR</button>
      </div>
    </div>`);
  
  spawnConfetti();
  showToast('🏆 ' + grade, '+' + xpEarned + ' XP | ' + gameState.name);
}