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
