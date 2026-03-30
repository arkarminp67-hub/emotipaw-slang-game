/* script.js — EmoTiPaw Auth
   Single source of truth for login + signup.
   - Signup: saves to SheetDB (for tracking) + localStorage (for session)
   - Login:  checks localStorage first, then SheetDB fallback
*/

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const SHEETDB_URL = "https://sheetdb.io/api/v1/cy20viq6veajs";

const toast = (msg, ms = 2200) => {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), ms);
};

const nextParam = () => {
  const p = new URLSearchParams(location.search);
  const n = p.get('next');
  return n ? `&next=${encodeURIComponent(n)}` : '';
};

const redirectNext = () => {
  const params = new URLSearchParams(location.search);
  const next = params.get('next') || 'play.html';
  location.href = next;
};

const goToTab = (name) => {
  const base = location.pathname.split('/').pop() || 'auth.html';
  location.href = `${base}?tab=${name}${nextParam()}`;
};

const DB_KEY  = 'sq.users';
const CUR_KEY = 'sq.currentUser';

const dbLoad = () => {
  try { return JSON.parse(localStorage.getItem(DB_KEY) || '[]'); }
  catch { return []; }
};
const dbSave = (arr) => localStorage.setItem(DB_KEY, JSON.stringify(arr));

const setCurrentUser = (email, nickname) => {
  localStorage.setItem(CUR_KEY, JSON.stringify({ email, nickname, ts: Date.now() }));
  localStorage.setItem('nickname', nickname);
};

// Tabs
(function tabs() {
  const tabsEl = $('.js-tabs');
  if (!tabsEl) return;
  const glider = $('.glider', tabsEl);
  const tabs = $$('.tab', tabsEl);
  const loginForm  = $('#loginForm');
  const signupForm = $('#signupForm');

  const activate = (name) => {
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === name));
    if (name === 'login') {
      loginForm.classList.remove('is-hidden');
      signupForm.classList.add('is-hidden');
      glider.style.transform = 'translateX(0)';
    } else {
      loginForm.classList.add('is-hidden');
      signupForm.classList.remove('is-hidden');
      glider.style.transform = 'translateX(100%)';
    }
    history.replaceState(null, '', `?tab=${name}${nextParam()}`);
  };

  tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.tab)));
  $$('.js-switch').forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.to)));

  const params = new URLSearchParams(location.search);
  activate(params.get('tab') === 'signup' ? 'signup' : 'login');
})();

// Password toggles
(function pwToggles() {
  $$('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      target.type = target.type === 'password' ? 'text' : 'password';
      btn.textContent = target.type === 'password' ? '👁' : '🙈';
    });
  });
})();

// Sign-up
$('#signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nickname = $('#suNickname').value.trim();
  const email    = $('#suEmail').value.trim().toLowerCase();
  const pw       = $('#suPassword').value;
  const confirm  = $('#suConfirm').value;

  if (!nickname || !email || pw.length < 6) return toast('Fill all fields (password min 6 chars).');
  if (pw !== confirm) return toast('Passwords do not match.');

  const users = dbLoad();
  if (users.some(u => u.email === email)) return toast('Email already registered. Please log in.');

  const btn = $('#signupForm .btn[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }

  // SheetDB tracking (fire-and-forget)
  const now        = new Date();
  const date       = now.toLocaleDateString();
  const launchDate = new Date("2025-10-26");
  const diffWeeks  = Math.floor((now - launchDate) / (1000 * 60 * 60 * 24 * 7)) + 1;
  const week       = "Week " + diffWeeks;

  fetch(SHEETDB_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [{ nickname, email, date, week }] })
  }).catch(() => {});

  // Save locally so login works on any device/session
  users.push({ email, nickname, pw });
  dbSave(users);
  setCurrentUser(email, nickname);

  toast('Account created! Redirecting…', 1000);
  setTimeout(redirectNext, 800);
});

// Login
$('#loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = $('#loginEmail').value.trim().toLowerCase();
  const pw    = $('#loginPassword').value;

  if (!email || pw.length < 6) return toast('Enter a valid email and password (min 6 chars).');

  const btn = $('#loginForm .btn[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Logging in…'; }
  const resetBtn = () => { if (btn) { btn.disabled = false; btn.textContent = 'Log in'; } };

  // Check localStorage first
  const users = dbLoad();
  const localUser = users.find(u => u.email === email);

  if (localUser) {
    if (localUser.pw !== pw) { resetBtn(); return toast('Incorrect password.'); }
    setCurrentUser(localUser.email, localUser.nickname);
    toast('Welcome back! Redirecting…', 900);
    return setTimeout(redirectNext, 700);
  }

  // Fallback: check SheetDB (user signed up on a different device)
  try {
    const res   = await fetch(`${SHEETDB_URL}/search?email=${encodeURIComponent(email)}`);
    const found = await res.json();

    if (!found || found.length === 0) {
      resetBtn();
      toast('No account found. Please sign up first.');
      return setTimeout(() => goToTab('signup'), 800);
    }

    const user = found[0];
    // Cache them locally for future logins
    users.push({ email: user.email || email, nickname: user.nickname || 'Player', pw });
    dbSave(users);
    setCurrentUser(email, user.nickname || 'Player');

    toast('Welcome back! Redirecting…', 900);
    setTimeout(redirectNext, 700);

  } catch (err) {
    resetBtn();
    toast('Could not reach server. Check your connection and try again.');
    console.error('Login error:', err);
  }
});
