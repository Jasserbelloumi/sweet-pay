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
  const burger     = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('a, .btn').forEach(el => {
    el.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  /* ── Intersection observer (animations) ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  /* ── Exchange rate simulation (for rates table + ticker) ── */
  let baseRate = 0.842;

  function jitter(val, pct) { return val * (1 + (Math.random() - 0.5) * pct); }
  function updateRate() {
    baseRate = Math.max(0.80, Math.min(0.90, jitter(baseRate, 0.002)));
    const t1 = document.getElementById('t1');
    if (t1) t1.textContent = baseRate.toFixed(4);
  }
  setInterval(updateRate, 5000);

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── Rates table ── */
  const pairs = [
    { pair:'SWC / SWP', name:'SweetCoin → SweetPay',  price:() => baseRate.toFixed(4), change:'+2.14%', up:true,  vol:'$48.7M', a:'swc', b:'swp' },
    { pair:'SWC / USD', name:'SweetCoin → US Dollar',  price:() => '$0.038',            change:'+1.87%', up:true,  vol:'$12.3M', a:'swc', b:'usd' },
    { pair:'SWP / USD', name:'SweetPay → US Dollar',   price:() => '$0.045',            change:'+0.94%', up:true,  vol:'$8.9M',  a:'swp', b:'usd' },
    { pair:'SWC / BTC', name:'SweetCoin → Bitcoin',    price:() => '0.00000082',        change:'+3.21%', up:true,  vol:'$6.1M',  a:'swc', b:'btc' },
    { pair:'SWC / ETH', name:'SweetCoin → Ethereum',   price:() => '0.000014',          change:'-0.55%', up:false, vol:'$4.4M',  a:'swc', b:'eth' },
  ];

  function coinIcon(sym) {
    const labels  = { swc:'SWC', swp:'SWP', usd:'USD', btc:'BTC', eth:'ETH' };
    const classes = { swc:'coin-icon--swc', swp:'coin-icon--swp' };
    return `<div class="coin-icon ${classes[sym]||''}">${labels[sym]||sym.toUpperCase()}</div>`;
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
        <div class="rate-row__change change--${p.up?'up':'down'}">${p.change}</div>
        <div class="rate-row__vol">${p.vol}</div>
        <div class="rate-row__action"><a href="register.html" class="btn btn--primary">Start</a></div>`;
      ratesBody.appendChild(row);
    });
  }

  /* ── Nav: show user pill if already logged in ── */
  const session = JSON.parse(localStorage.getItem('sp_session') || 'null');
  const navActions = document.getElementById('nav-actions');
  if (session && navActions) {
    const initials = session.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    navActions.innerHTML = `
      <a href="card.html" class="nav__user-pill">
        <div class="nav__user-avatar">${initials}</div>
        <span>${session.name.split(' ')[0]}</span>
      </a>`;
  }

})();
