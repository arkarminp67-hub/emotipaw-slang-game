/* script.js — SlangQuest Auth (client-side mock)
   - Tabs
   - Validation + localStorage “accounts”
   - After sign-up, send user to Login (not auto-login)
*/

const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

const toast = (msg, ms=1800) => {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(()=> el.classList.remove('show'), ms);
};

// handy: preserve ?next=... when switching tabs or redirecting to this page
const nextParam = () => {
  const p = new URLSearchParams(location.search);
  const n = p.get('next');
  return n ? `&next=${encodeURIComponent(n)}` : '';
};
const goToTab = (name) => {
  // reload THIS auth page but on the requested tab, preserving ?next
  const base = location.pathname.split('/').pop() || 'auth.html';
  location.href = `${base}?tab=${name}${nextParam()}`;
};

// --- Tabs ---
(function tabs(){
  const tabsEl = $('.js-tabs');
  if (!tabsEl) return;
  const glider = $('.glider', tabsEl);
  const tabs = $$('.tab', tabsEl);
  const loginForm = $('#loginForm');
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

// --- Password show/hide ---
(function pwToggles(){
  $$('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      target.type = target.type === 'password' ? 'text' : 'password';
      btn.textContent = target.type === 'password' ? '👁' : '🙈';
    });
  });
})();

// --- Local storage “DB” helpers ---
const DB_KEY = 'sq.users';
const CUR_KEY = 'sq.currentUser';

const dbLoad = () => {
  try { return JSON.parse(localStorage.getItem(DB_KEY) || '[]'); }
  catch { return []; }
};
const dbSave = (arr) => localStorage.setItem(DB_KEY, JSON.stringify(arr));
const setCurrent = (email) => localStorage.setItem(CUR_KEY, JSON.stringify({ email, ts: Date.now() }));

const redirectNext = () => {
  const params = new URLSearchParams(location.search);
  const next = params.get('next') || 'index.html#play';
  location.href = next;
};

// --- Login handler ---
$('#loginForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = $('#loginEmail').value.trim().toLowerCase();
  const pw = $('#loginPassword').value;

  if (!email || pw.length < 6) return toast('Enter a valid email and password (min 6).');

  const users = dbLoad();
  const u = users.find(x => x.email === email);

  if (!u) {
    toast('No account found. Please sign up first.');
    setTimeout(() => goToTab('signup'), 700);
    return;
  }
  if (u.pw !== pw) return toast('Email or password is incorrect.');

  setCurrent(email);
  toast('Logged in! Redirecting…', 900);
  setTimeout(redirectNext, 700);
});

// --- Sign-up handler ---
$('#signupForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const nickname = $('#suNickname').value.trim();
  const email = $('#suEmail').value.trim().toLowerCase();
  const pw = $('#suPassword').value;
  const confirm = $('#suConfirm').value;

  if (!nickname || !email || pw.length < 6) return toast('Fill all fields (password ≥ 6).');
  if (pw !== confirm) return toast('Passwords do not match.');

  const users = dbLoad();
  if (users.some(u => u.email === email)) return toast('This email is already registered.');

  users.push({ email, nickname, pw });
  dbSave(users);

  // IMPORTANT: do NOT auto-login after sign-up.
  // Send them to the Login tab so they sign in explicitly.
  toast('Account created! Please log in.', 1200);
  setTimeout(() => goToTab('login'), 900);
});
