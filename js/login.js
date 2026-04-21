document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('lEmail').value.trim().toLowerCase();
  const pass = document.getElementById('lPass').value;
  const err = document.getElementById('errMsg');
  
  err.classList.remove('show');
  
  // Admin check
  if (email === 'admin@habitquest.com' && pass === 'admin2026') {
    localStorage.setItem('hq_current', JSON.stringify({
      id: 'admin',
      nombre: 'Admin',
      apellido: 'HabitQuest',
      email: email,
      role: 'admin'
    }));
    window.location.href = 'admin.html';
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('hq_users') || '[]');
  const user = users.find(u => u.email === email && u.pass === pass);
  
  if (!user) {
    err.textContent = 'CORREO O CONTRASEÑA INCORRECTOS';
    err.classList.add('show');
    return;
  }
  
  localStorage.setItem('hq_current', JSON.stringify(user));
  window.location.href = 'dashboard.html';
});