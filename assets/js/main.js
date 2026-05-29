/* ============================================================
   SWEET PAY — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Nav scroll ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── Mobile menu ── */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  /* ── Intersection observer (animations) ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  /* ── Exchange rate simulation ── */
  let baseRate = 0.842;
  const rateEl = document.getElementById('rate-val');

  function jitter(val, pct) {
    return val * (1 + (Math.random() - 0.5) * pct);
  }

  function updateRate() {
    baseRate = jitter(baseRate, 0.002);
    baseRate = Math.max(0.80, Math.min(0.90, baseRate));
    if (rateEl) rateEl.textContent = baseRate.toFixed(4);
    calculateOutput();
  }
  setInterval(updateRate, 5000);

  /* ── Converter ── */
  const swcInput = document.getElementById('swc-input');
  const swpOutput = document.getElementById('swp-output');
  const saveVal = document.getElementById('save-val');

  function calculateOutput() {
    const val = parseFloat(swcInput.value) || 0;
    const out = val * baseRate;
    swpOutput.value = out > 0 ? out.toFixed(4) : '';
    const saved = val * 0.002 * 0.038;
    saveVal.textContent = '$' + saved.toFixed(4) + ' vs competitors';
  }

  swcInput.addEventListener('input', calculateOutput);
  calculateOutput();

  /* ── Swap button ── */
  document.getElementById('swap-btn').addEventListener('click', () => {
    const swc = swcInput.value;
    swcInput.value = swpOutput.value || '';
    swpOutput.value = '';
    calculateOutput();
  });

  /* ── Exchange button / modal ── */
  const modal = document.getElementById('success-modal');
  const modalMsg = document.getElementById('modal-msg');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');

  document.getElementById('exchange-btn').addEventListener('click', () => {
    const amt = parseFloat(swcInput.value) || 0;
    if (amt <= 0) { swcInput.focus(); return; }
    const out = (amt * baseRate).toFixed(4);
    modalMsg.innerHTML = `Converting <strong>${amt.toFixed(2)} SWC</strong> to <strong>${out} SWP</strong>.<br/>Estimated arrival: <strong>~30 seconds</strong>`;
    modal.classList.add('open');
  });

  modalOverlay.addEventListener('click', () => modal.classList.remove('open'));
  modalClose.addEventListener('click', () => modal.classList.remove('open'));

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── Rates table ── */
  const pairs = [
    { pair: 'SWC / SWP', name: 'SweetCoin → SweetPay', price: () => baseRate.toFixed(4), change: '+2.14%', up: true, vol: '$48.7M', a: 'swc', b: 'swp' },
    { pair: 'SWC / USD', name: 'SweetCoin → US Dollar', price: () => '$0.038', change: '+1.87%', up: true, vol: '$12.3M', a: 'swc', b: 'usd' },
    { pair: 'SWP / USD', name: 'SweetPay → US Dollar', price: () => '$0.045', change: '+0.94%', up: true, vol: '$8.9M', a: 'swp', b: 'usd' },
    { pair: 'SWC / BTC', name: 'SweetCoin → Bitcoin', price: () => '0.00000082', change: '+3.21%', up: true, vol: '$6.1M', a: 'swc', b: 'btc' },
    { pair: 'SWC / ETH', name: 'SweetCoin → Ethereum', price: () => '0.000014', change: '-0.55%', up: false, vol: '$4.4M', a: 'swc', b: 'eth' },
  ];

  function coinIcon(sym) {
    const labels = { swc: 'SWC', swp: 'SWP', usd: 'USD', btc: 'BTC', eth: 'ETH' };
    const classes = { swc: 'coin-icon--swc', swp: 'coin-icon--swp' };
    const cls = classes[sym] || '';
    return `<div class="coin-icon ${cls}">${labels[sym] || sym.toUpperCase()}</div>`;
  }

  const ratesBody = document.getElementById('rates-body');
  if (ratesBody) {
    pairs.forEach(p => {
      const row = document.createElement('div');
      row.className = 'rate-row';
      row.innerHTML = `
        <div class="rate-row__pair">
          <div class="rate-row__icons">${coinIcon(p.a)}${coinIcon(p.b)}</div>
          <div><div class="rate-row__name">${p.pair}</div><div class="rate-row__sub">${p.name}</div></div>
        </div>
        <div class="rate-row__price">${p.price()}</div>
        <div class="rate-row__change change--${p.up ? 'up' : 'down'}">${p.change}</div>
        <div class="rate-row__vol">${p.vol}</div>
        <div class="rate-row__action"><a href="#exchange" class="btn btn--primary">Trade</a></div>
      `;
      ratesBody.appendChild(row);
    });
  }

  /* ── Live ticker price update ── */
  setInterval(() => {
    const t1 = document.getElementById('t1');
    if (t1) t1.textContent = baseRate.toFixed(4);
  }, 5000);

})();

/* ============================================================
   AUTH SYSTEM
   ============================================================ */

/* ── Simple hash (SHA-256 via SubtleCrypto) ── */
async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

/* ── LocalStorage helpers ── */
function getUsers() { return JSON.parse(localStorage.getItem('sp_users') || '[]'); }
function saveUsers(u) { localStorage.setItem('sp_users', JSON.stringify(u)); }
function getSession() { return JSON.parse(localStorage.getItem('sp_session') || 'null'); }
function saveSession(u) { localStorage.setItem('sp_session', JSON.stringify(u)); }
function clearSession() { localStorage.removeItem('sp_session'); }

/* ── Modal helpers ── */
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); }
  if (!document.querySelector('.auth-modal.open')) document.body.style.overflow = '';
}

/* ── Nav state ── */
function renderNavAuth() {
  const session = getSession();
  const actions = document.getElementById('nav-actions');
  if (!actions) return;
  if (session) {
    const initials = session.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
    actions.innerHTML = `
      <button class="nav__user" id="user-pill" aria-expanded="false">
        <div class="nav__user-avatar">${initials}</div>
        <span class="nav__user-name">${session.name.split(' ')[0]}</span>
        <svg class="nav__user-caret" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>`;
    document.getElementById('user-pill').addEventListener('click', toggleDropdown);
    // fill dropdown
    const initials2 = session.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
    document.getElementById('ud-avatar').textContent = initials2;
    document.getElementById('ud-name').textContent = session.name;
    document.getElementById('ud-email').textContent = session.email;
  } else {
    actions.innerHTML = `
      <button class="btn btn--ghost" id="nav-login-btn">Log In</button>
      <button class="btn btn--primary" id="nav-signup-btn">Sign Up</button>`;
    document.getElementById('nav-login-btn').addEventListener('click', () => openModal('login-modal'));
    document.getElementById('nav-signup-btn').addEventListener('click', () => openModal('signup-modal'));
  }
}

function toggleDropdown() {
  const dd = document.getElementById('user-dropdown');
  const pill = document.getElementById('user-pill');
  const isHidden = dd.hidden;
  dd.hidden = !isHidden;
  if (pill) pill.setAttribute('aria-expanded', String(isHidden));
}

document.addEventListener('click', (e) => {
  const dd = document.getElementById('user-dropdown');
  const pill = document.getElementById('user-pill');
  if (!dd || dd.hidden) return;
  if (!dd.contains(e.target) && (!pill || !pill.contains(e.target))) {
    dd.hidden = true;
  }
});

/* ── Open/close modal via data attributes ── */
document.addEventListener('click', (e) => {
  const closeTarget = e.target.closest('[data-close]');
  if (closeTarget) { closeModal(closeTarget.dataset.close); }

  const switchBtn = e.target.closest('.auth-switch-btn');
  if (switchBtn) {
    if (switchBtn.dataset.closeSelf) closeModal(switchBtn.dataset.closeSelf);
    if (switchBtn.dataset.open) openModal(switchBtn.dataset.open);
  }
});

/* ── Show/hide password ── */
document.querySelectorAll('.auth-field__eye').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById(btn.dataset.target);
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
    btn.style.color = inp.type === 'text' ? 'var(--gold)' : '';
  });
});

/* ── Password strength ── */
const pwInput = document.getElementById('signup-password');
const pwStrength = document.getElementById('pw-strength');
const pwFill = document.getElementById('pw-fill');
const pwLabel = document.getElementById('pw-label');
if (pwInput) {
  pwInput.addEventListener('input', () => {
    const v = pwInput.value;
    pwStrength.hidden = v.length === 0;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const levels = [
      { w:'25%', bg:'#ef4444', label:'Weak' },
      { w:'50%', bg:'#f59e0b', label:'Fair' },
      { w:'75%', bg:'#3b82f6', label:'Good' },
      { w:'100%', bg:'#10b981', label:'Strong' },
    ];
    const lvl = levels[Math.max(0, score - 1)];
    pwFill.style.width = lvl.w;
    pwFill.style.background = lvl.bg;
    pwLabel.textContent = lvl.label;
    pwLabel.style.color = lvl.bg;
  });
}

/* ── Helper: set loading state ── */
function setLoading(formId, isLoading) {
  const btn = document.querySelector(`#${formId} .auth-submit`);
  if (!btn) return;
  btn.querySelector('.auth-submit__text').hidden = isLoading;
  btn.querySelector('.auth-submit__loader').hidden = !isLoading;
  btn.disabled = isLoading;
}

/* ── REGISTER ── */
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const pass = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const terms = document.getElementById('signup-terms').checked;

    let valid = true;
    const clear = id => { const el = document.getElementById(id); if(el) el.textContent = ''; };
    const err = (id, msg) => { const el = document.getElementById(id); if(el) el.textContent = msg; valid = false; };

    clear('signup-name-err'); clear('signup-email-err'); clear('signup-pass-err'); clear('signup-confirm-err'); clear('signup-terms-err'); clear('signup-global-err');

    if (!name || name.length < 2) err('signup-name-err', 'Please enter your full name.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err('signup-email-err', 'Enter a valid email address.');
    if (!pass || pass.length < 8) err('signup-pass-err', 'Password must be at least 8 characters.');
    if (pass !== confirm) err('signup-confirm-err', 'Passwords do not match.');
    if (!terms) err('signup-terms-err', 'You must accept the terms to continue.');
    if (!valid) return;

    const users = getUsers();
    if (users.find(u => u.email === email)) {
      document.getElementById('signup-global-err').textContent = 'An account with this email already exists.';
      return;
    }

    setLoading('signup-form', true);
    await new Promise(r => setTimeout(r, 900));
    const hash = await hashPassword(pass);
    const cardNum = generateCardNumber();
    const newUser = { name, email, hash, cardNum, cardActivated: false, createdAt: Date.now() };
    users.push(newUser);
    saveUsers(users);
    const session = { name, email, cardNum, cardActivated: false };
    saveSession(session);
    setLoading('signup-form', false);
    closeModal('signup-modal');
    renderNavAuth();
    showCardModal();
  });
}

/* ── LOGIN ── */
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass = document.getElementById('login-password').value;

    document.getElementById('login-email-err').textContent = '';
    document.getElementById('login-pass-err').textContent = '';
    document.getElementById('login-global-err').textContent = '';

    let valid = true;
    if (!email) { document.getElementById('login-email-err').textContent = 'Email is required.'; valid = false; }
    if (!pass) { document.getElementById('login-pass-err').textContent = 'Password is required.'; valid = false; }
    if (!valid) return;

    setLoading('login-form', true);
    await new Promise(r => setTimeout(r, 800));
    const hash = await hashPassword(pass);
    const users = getUsers();
    const user = users.find(u => u.email === email && u.hash === hash);
    setLoading('login-form', false);

    if (!user) {
      document.getElementById('login-global-err').textContent = 'Incorrect email or password.';
      return;
    }
    saveSession({ name: user.name, email: user.email, cardNum: user.cardNum, cardActivated: user.cardActivated });
    closeModal('login-modal');
    renderNavAuth();
    showCardModal();
  });
}

/* ── LOGOUT ── */
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    clearSession();
    document.getElementById('user-dropdown').hidden = true;
    renderNavAuth();
  });
}

/* ── NAV buttons (initial) ── */
const initLogin = document.getElementById('nav-login-btn');
const initSignup = document.getElementById('nav-signup-btn');
const initSignupMob = document.getElementById('nav-signup-btn-mob');
if (initLogin) initLogin.addEventListener('click', () => openModal('login-modal'));
if (initSignup) initSignup.addEventListener('click', () => openModal('signup-modal'));
if (initSignupMob) initSignupMob.addEventListener('click', () => openModal('signup-modal'));

/* ── Generate card number ── */
function generateCardNumber() {
  const groups = Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000));
  return groups.join(' ');
}

/* ── VIRTUAL CARD MODAL ── */
function showCardModal() {
  const session = getSession();
  if (!session) return;
  const existing = document.getElementById('card-modal');
  if (existing) existing.remove();

  const initials = session.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  const expiry = (() => {
    const d = new Date(); d.setFullYear(d.getFullYear() + 3);
    return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(-2)}`;
  })();

  const modal = document.createElement('div');
  modal.id = 'card-modal';
  modal.className = 'auth-modal open';
  modal.setAttribute('role','dialog');
  modal.innerHTML = `
    <div class="auth-modal__overlay" id="card-modal-overlay"></div>
    <div class="auth-modal__box card-modal-box">
      <div class="card-modal-header">
        <div class="card-status-badge card-status-badge--pending">
          <span class="badge__dot"></span> Card Opened — Activation Required
        </div>
      </div>

      <!-- VIRTUAL CARD VISUAL -->
      <div class="vcard">
        <div class="vcard__shine"></div>
        <div class="vcard__top">
          <div class="vcard__logo-row">
            <div class="vcard__brand">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="url(#vlg)"/><path d="M10 16.5C10 13.462 12.462 11 15.5 11H19a3 3 0 010 6h-3.5a1.5 1.5 0 000 3H19" stroke="#fff" stroke-width="2" stroke-linecap="round"/><defs><linearGradient id="vlg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#f59e0b"/><stop offset="1" stop-color="#d97706"/></linearGradient></defs></svg>
              <span>Sweet<strong>Pay</strong></span>
            </div>
            <div class="vcard__type">VIRTUAL CARD</div>
          </div>
        </div>
        <div class="vcard__chip">
          <svg width="36" height="28" viewBox="0 0 36 28" fill="none"><rect width="36" height="28" rx="4" fill="#d4a847"/><rect x="13" y="0" width="10" height="28" fill="#c49535" opacity=".5"/><rect x="0" y="9" width="36" height="10" fill="#c49535" opacity=".5"/><rect x="13" y="9" width="10" height="10" rx="2" fill="#b8892e"/></svg>
        </div>
        <div class="vcard__number">${session.cardNum}</div>
        <div class="vcard__bottom">
          <div class="vcard__holder">
            <div class="vcard__label">Card Holder</div>
            <div class="vcard__value">${session.name.toUpperCase()}</div>
          </div>
          <div class="vcard__expiry">
            <div class="vcard__label">Expires</div>
            <div class="vcard__value">${expiry}</div>
          </div>
          <div class="vcard__network">
            <svg width="42" height="26" viewBox="0 0 42 26" fill="none"><circle cx="16" cy="13" r="13" fill="#eb001b" opacity=".9"/><circle cx="26" cy="13" r="13" fill="#f79e1b" opacity=".9"/><path d="M21 5.5a13 13 0 010 15" stroke="#fff" stroke-width="1.5" fill="none" opacity=".5"/></svg>
          </div>
        </div>
        <div class="vcard__locked-overlay">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="14" width="20" height="14" rx="3" fill="rgba(255,255,255,.15)" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/><path d="M10 14v-4a6 6 0 0112 0v4" stroke="rgba(255,255,255,.4)" stroke-width="1.5" stroke-linecap="round"/><circle cx="16" cy="21" r="2" fill="rgba(255,255,255,.5)"/></svg>
          <span>Inactive</span>
        </div>
      </div>

      <div class="card-modal-body">
        <h3 class="card-modal-title">Your card is ready!</h3>
        <p class="card-modal-desc">
          We've opened your Sweet Pay virtual card. To activate it and start using it for payments, please complete the one-time activation fee below.
        </p>

        <div class="activation-price">
          <span class="activation-price__label">One-time Activation Fee</span>
          <span class="activation-price__amount">$6.99</span>
        </div>

        <div class="payment-methods">
          <div class="payment-methods__label">Pay via</div>
          <div class="payment-methods__grid">
            <button class="pay-method" data-method="flexi" onclick="selectPayment(this)">
              <div class="pay-method__icon pay-method__icon--flexi">F</div>
              <div>
                <div class="pay-method__name">Flexi</div>
                <div class="pay-method__sub">بريد الجزائر</div>
              </div>
            </button>
            <button class="pay-method" data-method="baridimob" onclick="selectPayment(this)">
              <div class="pay-method__icon pay-method__icon--baridi">B</div>
              <div>
                <div class="pay-method__name">BaridiMob</div>
                <div class="pay-method__sub">بريد موب</div>
              </div>
            </button>
          </div>
        </div>

        <div class="payment-instructions" id="payment-instructions" hidden></div>

        <button class="btn btn--primary btn--full" id="confirm-payment-btn" style="margin-top:16px;" hidden onclick="confirmPayment()">
          I've Sent the Payment — Activate My Card
        </button>

        <p class="card-modal-note">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.2"/><path d="M8 7v5M8 5v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          Your card details are secured and encrypted. Activation is a one-time fee.
        </p>
      </div>
    </div>`;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  document.getElementById('card-modal-overlay').addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = '';
  });
}

window.selectPayment = function(btn) {
  document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const method = btn.dataset.method;
  const instrEl = document.getElementById('payment-instructions');
  const confirmBtn = document.getElementById('confirm-payment-btn');

  const instructions = {
    flexi: `
      <div class="pay-instr">
        <div class="pay-instr__title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#f59e0b" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          How to pay via Flexi
        </div>
        <ol class="pay-instr__steps">
          <li>Open the <strong>Flexi</strong> app or go to any <strong>Algérie Poste</strong> branch</li>
          <li>Select <strong>Transfer / Payment</strong></li>
          <li>Send <strong>1,050 DZD</strong> (~$6.99) to the following number:</li>
        </ol>
        <div class="pay-instr__account">
          <span class="pay-instr__label">CCP Account</span>
          <span class="pay-instr__number">0020 4756 38 — Clé 72</span>
        </div>
        <div class="pay-instr__account">
          <span class="pay-instr__label">Account Name</span>
          <span class="pay-instr__number">Sweet Pay DZ</span>
        </div>
        <p class="pay-instr__note">After sending, click the button below and your card will be activated within 30 minutes.</p>
      </div>`,
    baridimob: `
      <div class="pay-instr">
        <div class="pay-instr__title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#f59e0b" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          How to pay via BaridiMob
        </div>
        <ol class="pay-instr__steps">
          <li>Open your <strong>BaridiMob</strong> app</li>
          <li>Tap <strong>Transfer</strong> then <strong>By RIP</strong></li>
          <li>Send <strong>1,050 DZD</strong> (~$6.99) to this RIP number:</li>
        </ol>
        <div class="pay-instr__account">
          <span class="pay-instr__label">RIP Number</span>
          <span class="pay-instr__number">00799999 0020475638 72</span>
        </div>
        <div class="pay-instr__account">
          <span class="pay-instr__label">Account Name</span>
          <span class="pay-instr__number">Sweet Pay DZ</span>
        </div>
        <p class="pay-instr__note">After sending, click the button below and your card will be activated within 30 minutes.</p>
      </div>`
  };

  instrEl.innerHTML = instructions[method] || '';
  instrEl.hidden = false;
  confirmBtn.hidden = false;
};

window.confirmPayment = function() {
  const btn = document.getElementById('confirm-payment-btn');
  btn.textContent = 'Verifying payment...';
  btn.disabled = true;
  setTimeout(() => {
    const modal = document.getElementById('card-modal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
    showSuccessToast('Payment received! Your card will be activated within 30 minutes.');
  }, 1500);
};

function showSuccessToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:28px;right:28px;z-index:999;background:var(--surface);border:1px solid var(--green);border-radius:12px;padding:14px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,.4);animation:modal-in .3s ease;max-width:360px;`;
  t.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#10b981"/><path d="M6 10l3 3 5-6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="font-size:.9rem;color:var(--text)">${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 6000);
}

/* ── Init auth on page load ── */
renderNavAuth();
