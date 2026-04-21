function toggleMobileMenu() {
  document.getElementById('mm').classList.toggle('open');
}

const users = JSON.parse(localStorage.getItem('hq_users') || '[]');
const sess = JSON.parse(localStorage.getItem('hq_game_sessions') || '[]');

function animNum(el, t) {
  let s = 0;
  let step = t / 50;
  let i = setInterval(() => {
    s += step;
    if (s >= t) {
      s = t;
      clearInterval(i);
    }
    el.textContent = Math.floor(s);
  }, 30);
}

animNum(document.getElementById('sUsers'), users.length);
animNum(document.getElementById('sGames'), sess.length);