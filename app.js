/* Amber Morrey Studio — shared behaviour */
(function () {
  // header scroll state
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // fire above-the-fold reveals immediately
  document.querySelectorAll('[data-hero] .reveal').forEach(el => setTimeout(() => el.classList.add('in'), 80));

  // hero image zoom on load (home + about)
  requestAnimationFrame(() => {
    document.querySelectorAll('.hero, .about-split').forEach(el => el.classList.add('loaded'));
  });

  // mobile menu
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  }

  // graceful image fallback so nothing renders empty
  let seed = 10;
  document.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', function () {
      if (this.dataset.fell) return;
      this.dataset.fell = 1;
      this.src = 'https://picsum.photos/seed/amber' + (seed++) + '/800/1000?grayscale';
    });
  });

  /* -------- Contact mad-lib form -------- */
  const cform = document.getElementById('contactForm');
  if (cform) {
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = (document.getElementById('mlName').value || 'A prospective client').trim();
      const goal = document.getElementById('mlGoal').value;
      const occ = document.getElementById('mlOccasion').value;
      const email = document.getElementById('cEmail').value.trim();
      const phone = document.getElementById('cPhone').value.trim();
      const note = document.getElementById('contactNote');
      if (!email) { document.getElementById('cEmail').focus(); return; }
      const subject = encodeURIComponent('Atelier enquiry — ' + name);
      const body = encodeURIComponent(
        'Hi Amber,\n\nI\'m ' + name + ', and I\'m looking to ' + goal + ' for my ' + occ + '.\n\n' +
        'Email: ' + email + (phone ? '\nPhone: ' + phone : '') + '\n\nThank you.'
      );
      note.classList.add('show');
      note.textContent = 'Thank you, ' + name + ' — opening your email to send this to the atelier…';
      window.location.href = 'mailto:hello@ambermorrey.com.au?subject=' + subject + '&body=' + body;
    });
  }

  /* -------- Services: Style Goal Quiz -------- */
  const quiz = document.getElementById('quiz');
  if (quiz) {
    const packages = {
      audit: {
        rec: 'Wardrobe Audit',
        tag: 'Start with clarity, not chaos.',
        desc: 'Based on your goals, the best first step is a thorough audit — editing what you own, identifying the gaps, and giving you a precise blueprint to shop intentionally.',
        service: 'The Wardrobe Audit', price: 450, meta: '3 Hours'
      },
      shopping: {
        rec: 'Personal Shopping',
        tag: 'Buy less, buy better.',
        desc: 'You know your style — you just need the right pieces. A guided, unhurried shopping session through Melbourne\'s finest sustainable labels will build the investment wardrobe you\'re after.',
        service: 'Personal Shopping', price: 620, meta: '4 Hours'
      },
      event: {
        rec: 'Event & Occasion Styling',
        tag: 'Command the room.',
        desc: 'With a defining moment on the horizon, a fully architected look — from silhouette to accessory — will ensure you arrive with quiet, undeniable authority.',
        service: 'Event & Occasion Styling', price: 780, meta: 'Bespoke'
      }
    };
    const questions = [
      { q: 'Where are you starting from?', opts: [
        { t: 'My wardrobe feels chaotic and full', v: 'audit' },
        { t: 'I shop often but rarely buy right', v: 'shopping' },
        { t: 'I have a specific event on the horizon', v: 'event' } ] },
      { q: 'What would make the biggest difference?', opts: [
        { t: 'Clarity — knowing what to keep', v: 'audit' },
        { t: 'Better, longer-lasting purchases', v: 'shopping' },
        { t: 'One flawless, complete look', v: 'event' } ] },
      { q: 'What is your timeline?', opts: [
        { t: 'Ongoing — I want a foundation', v: 'audit' },
        { t: 'This season, at my own pace', v: 'shopping' },
        { t: 'A fixed date I\'m dressing for', v: 'event' } ] }
    ];
    const steps = quiz.querySelector('#quizSteps');
    const result = quiz.querySelector('#quizResult');
    const progress = quiz.querySelector('#quizProgress');
    const track = quiz.querySelector('#quizTrack');
    const fill = quiz.querySelector('#quizFill');
    const count = quiz.querySelector('#quizCount');
    const pad = n => String(n).padStart(2, '0');
    let idx = 0; const tally = { audit: 0, shopping: 0, event: 0 };

    // the progress line lives outside #quizSteps so it survives each re-render
    // and can animate between questions rather than being rebuilt at its new width
    function setProgress(step) {
      fill.style.width = (step / questions.length * 100) + '%';
      count.textContent = pad(step) + ' / ' + pad(questions.length);
      track.setAttribute('aria-valuenow', step);
    }

    function render() {
      const s = questions[idx];
      setProgress(idx + 1);
      steps.innerHTML =
        '<div class="quiz-step">' +
          '<div class="quiz-q">Question ' + (idx + 1) + ' — ' + s.q + '</div>' +
          '<div class="quiz-options">' +
            s.opts.map((o, i) => '<button class="quiz-opt" data-v="' + o.v + '">' + o.t + '</button>').join('') +
          '</div>' +
        '</div>';
      steps.querySelectorAll('.quiz-opt').forEach(btn => btn.addEventListener('click', () => {
        tally[btn.dataset.v]++;
        if (idx < questions.length - 1) { idx++; render(); }
        else finish();
      }));
    }
    function finish() {
      const best = Object.keys(tally).reduce((a, b) => tally[a] >= tally[b] ? a : b);
      const p = packages[best];
      steps.style.display = 'none';
      progress.style.display = 'none';
      result.innerHTML =
        '<div class="quiz-rec-label">Your recommendation</div>' +
        '<h3 class="display quiz-rec-title">' + p.rec + '</h3>' +
        '<div class="quiz-rec-tag">' + p.tag + '</div>' +
        '<p class="quiz-rec-desc">' + p.desc + '</p>' +
        '<div class="quiz-actions">' +
          '<button type="button" class="btn btn-amber" data-book data-service="' + p.service +
            '" data-price="' + p.price + '" data-meta="' + p.meta + '">Book ' + p.rec + '</button>' +
          '<button class="quiz-retake" id="quizRetake"><svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/></svg>Retake</button>' +
        '</div>';
      result.classList.add('show');
      document.getElementById('quizRetake').addEventListener('click', reset);
    }
    function reset() {
      idx = 0; tally.audit = tally.shopping = tally.event = 0;
      result.classList.remove('show'); result.innerHTML = '';
      steps.style.display = 'block'; progress.style.display = ''; render();
    }
    render();
  }

  /* -------- Concierge booking drawer --------
     NOTE: there is no payment processor behind this. "Pay & reserve" only
     advances the panel — nothing is charged, stored, or sent anywhere. The
     booking exists in this tab and disappears on refresh. Wire a real
     provider (and a real confirmation email) before taking live bookings. */
  if (document.querySelector('[data-book], #quiz')) {
    const SLOTS = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM'];
    const ARROW = '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    const CARD = '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>';
    const TICK = '<svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg>';

    const esc = t => String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const host = document.createElement('div');
    host.innerHTML =
      '<div class="cx-scrim" id="cxScrim"></div>' +
      '<aside class="cx-drawer" id="cxDrawer" role="dialog" aria-modal="true" aria-labelledby="cxTitle" aria-hidden="true">' +
        '<button class="cx-close" id="cxClose" aria-label="Close booking">' +
          '<svg viewBox="0 0 24 24"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></button>' +
        '<div class="cx-inner">' +
          '<div class="cx-eyebrow">The Concierge</div>' +
          '<h2 class="display cx-title" id="cxTitle"></h2>' +
          '<div class="cx-sub" id="cxSub"></div>' +
          '<div class="cx-steps" id="cxSteps" role="progressbar" aria-label="Booking progress" aria-valuemin="1" aria-valuemax="3" aria-valuenow="1">' +
            '<span class="cx-seg"></span><span class="cx-seg"></span><span class="cx-seg"></span></div>' +
          '<div id="cxBody"></div>' +
        '</div>' +
      '</aside>';
    document.body.appendChild(host);

    const drawer = host.querySelector('#cxDrawer');
    const scrim = host.querySelector('#cxScrim');
    const panel = host.querySelector('#cxBody');
    const segs = host.querySelectorAll('.cx-seg');
    const stepsEl = host.querySelector('#cxSteps');
    let opener = null;
    const s = {};

    const todayISO = () => {
      const d = new Date();
      return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    };
    const prettyDate = iso => {
      if (!iso) return '';
      const [y, m, d] = iso.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return isNaN(dt) ? iso : dt.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    };
    const when = () => prettyDate(s.date) + ' · ' + s.time;

    const field = (id, label, type, val, extra) =>
      '<div class="cx-field"><label class="cx-label" for="' + id + '">' + label + '</label>' +
      '<input class="cx-input" id="' + id + '" type="' + type + '" value="' + esc(val) + '" ' + (extra || '') + '></div>';
    const row = (k, v) => '<div class="cx-row"><dt>' + k + '</dt><dd>' + esc(v) + '</dd></div>';

    function step1() {
      return '<div class="cx-step-label">Step 1 — Introduce yourself</div>' +
        field('cxName', 'Your name', 'text', s.name, 'autocomplete="name"') +
        field('cxEmail', 'Email', 'email', s.email, 'autocomplete="email"') +
        field('cxPhone', 'Phone (optional)', 'tel', s.phone, 'autocomplete="tel"') +
        '<div class="cx-actions"><button type="button" class="cx-btn cx-primary" data-next>Continue' + ARROW + '</button></div>';
    }
    function step2() {
      return '<div class="cx-step-label">Step 2 — Choose a time</div>' +
        field('cxDate', 'Preferred date', 'date', s.date, 'min="' + todayISO() + '"') +
        '<div class="cx-field"><span class="cx-label">Time</span><div class="cx-slots">' +
          SLOTS.map(t => '<button type="button" class="cx-slot' + (s.time === t ? ' sel' : '') +
            '" data-slot="' + t + '" aria-pressed="' + (s.time === t) + '">' + t + '</button>').join('') +
        '</div></div>' +
        '<div class="cx-field"><label class="cx-label" for="cxNotes">Anything I should know? (optional)</label>' +
          '<textarea class="cx-input" id="cxNotes">' + esc(s.notes) + '</textarea></div>' +
        '<div class="cx-actions"><button type="button" class="cx-btn cx-back" data-back>Back</button>' +
          '<button type="button" class="cx-btn cx-primary" data-next>Continue' + ARROW + '</button></div>';
    }
    function step3() {
      return '<div class="cx-step-label">Step 3 — Confirm &amp; secure</div>' +
        '<dl class="cx-summary">' + row('Service', s.service) + row('When', when()) + row('Name', s.name) +
          '<div class="cx-total"><dt>Total</dt><dd>$' + esc(s.price) + '</dd></div></dl>' +
        '<div class="cx-note">' + CARD + '<span>Payment is processed securely. You will not be charged until your session is confirmed.</span></div>' +
        '<div class="cx-actions"><button type="button" class="cx-btn cx-back" data-back>Back</button>' +
          '<button type="button" class="cx-btn cx-primary cx-pay" data-pay>Pay &amp; reserve $' + esc(s.price) + '</button></div>';
    }
    function stepDone() {
      return '<div class="cx-done"><div class="cx-tick">' + TICK + '</div>' +
        '<h3>Your session is reserved</h3>' +
        '<div class="cx-done-svc">' + esc(s.service) + '</div>' +
        '<div class="cx-done-when">' + esc(when()) + '</div>' +
        '<p class="cx-done-note">A confirmation has been noted to ' + esc(s.email) +
          '. Amber will be in touch personally before your appointment.</p>' +
        '<button type="button" class="cx-btn" data-close>Close</button></div>';
    }

    function paint() {
      segs.forEach((el, i) => el.classList.toggle('on', i < s.step));
      stepsEl.setAttribute('aria-valuenow', Math.min(s.step, 3));
      drawer.classList.toggle('cx-final', s.step === 4);
      panel.innerHTML = [step1, step2, step3, stepDone][s.step - 1]();
      wire();
      drawer.scrollTop = 0;
      const first = panel.querySelector('input,textarea,button:not(:disabled)');
      if (first) first.focus({ preventScroll: true });
    }

    function validate() {
      const next = panel.querySelector('[data-next]');
      if (!next) return;
      next.disabled = s.step === 1
        ? !(s.name.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email.trim()))
        : !(s.date && s.time);
    }

    function wire() {
      const map = { cxName: 'name', cxEmail: 'email', cxPhone: 'phone', cxDate: 'date', cxNotes: 'notes' };
      Object.keys(map).forEach(id => {
        const el = panel.querySelector('#' + id);
        if (el) el.addEventListener('input', () => { s[map[id]] = el.value; validate(); });
      });
      panel.querySelectorAll('[data-slot]').forEach(b => b.addEventListener('click', () => {
        s.time = b.dataset.slot;
        panel.querySelectorAll('[data-slot]').forEach(o => {
          const on = o === b;
          o.classList.toggle('sel', on);
          o.setAttribute('aria-pressed', on);
        });
        validate();
      }));
      const go = d => { s.step += d; paint(); };
      const next = panel.querySelector('[data-next]');
      if (next) next.addEventListener('click', () => go(1));
      const back = panel.querySelector('[data-back]');
      if (back) back.addEventListener('click', () => go(-1));
      const pay = panel.querySelector('[data-pay]');
      if (pay) pay.addEventListener('click', () => { s.step = 4; paint(); });
      const cl = panel.querySelector('[data-close]');
      if (cl) cl.addEventListener('click', close);
      validate();
    }

    function open(btn) {
      opener = btn;
      s.service = btn.dataset.service || 'Styling session';
      s.price = btn.dataset.price || '';
      s.meta = btn.dataset.meta || '';
      s.name = s.email = s.phone = s.date = s.time = s.notes = '';
      s.step = 1;
      host.querySelector('#cxTitle').textContent = s.service;
      host.querySelector('#cxSub').textContent = (s.meta ? s.meta + ' · ' : '') + '$' + s.price;
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('cx-open');
      scrim.classList.add('open');
      drawer.classList.add('open');
      paint();
    }
    function close() {
      drawer.classList.remove('open');
      scrim.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('cx-open');
      if (opener) opener.focus();
    }

    // delegated so the quiz's recommendation button works too — it is rendered
    // after this code runs, so a direct binding would never reach it
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-book]');
      if (!b) return;
      e.preventDefault();
      open(b);
    });
    scrim.addEventListener('click', close);
    host.querySelector('#cxClose').addEventListener('click', close);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) close();
    });
    drawer.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = [...drawer.querySelectorAll('button,input,textarea,select,a[href]')]
        .filter(el => !el.disabled && el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
})();
