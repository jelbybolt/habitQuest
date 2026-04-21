document.getElementById('regForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const nombre = document.getElementById('rNombre').value.trim();
  const apellido = document.getElementById('rApellido').value.trim();
  const email = document.getElementById('rEmail').value.trim().toLowerCase();
  const carrera = document.getElementById('rCarrera').value;
  const pass = document.getElementById('rPass').value;
  const pass2 = document.getElementById('rPass2').value;
  const err = document.getElementById('errMsg');
  
  err.classList.remove('show');
  
  if (pass !== pass2) {
    err.textContent = 'LAS CONTRASEÑAS NO COINCIDEN';
    err.classList.add('show');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('hq_users') || '[]');
  
  if (users.find(u => u.email === email)) {
    err.textContent = 'ESE CORREO YA ESTÁ REGISTRADO';
    err.classList.add('show');
    return;
  }
  
  const newUser = {
    id: Date.now(),
    nombre,
    apellido,
    email,
    carrera,
    pass,
    xp: 0,
    streak: 0,
    lastStudy: null,
    completedGames: [],
    gameResults: [],
    metas: [],
    createdAt: new Date().toISOString(),
    role: 'student'
  };
  
  users.push(newUser);
  localStorage.setItem('hq_users', JSON.stringify(users));
  localStorage.setItem('hq_current', JSON.stringify(newUser));
  
  document.getElementById('successMsg').classList.add('show');
  document.getElementById('regForm').style.display = 'none';
  
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1800);
});