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
        href: 'contact.html'
      },
      shopping: {
        rec: 'Personal Shopping',
        tag: 'Buy less, buy better.',
        desc: 'You know your style — you just need the right pieces. A guided, unhurried shopping session through Melbourne\'s finest sustainable labels will build the investment wardrobe you\'re after.',
        href: 'contact.html'
      },
      event: {
        rec: 'Event & Occasion Styling',
        tag: 'Command the room.',
        desc: 'With a defining moment on the horizon, a fully architected look — from silhouette to accessory — will ensure you arrive with quiet, undeniable authority.',
        href: 'contact.html'
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
    let idx = 0; const tally = { audit: 0, shopping: 0, event: 0 };

    function render() {
      const s = questions[idx];
      steps.innerHTML =
        '<div class="quiz-step">' +
          '<div class="quiz-q">Question ' + (idx + 1) + ' — ' + s.q + '</div>' +
          '<div class="quiz-options">' +
            s.opts.map((o, i) => '<button class="quiz-opt" data-v="' + o.v + '">' + o.t + '</button>').join('') +
          '</div>' +
          '<div class="quiz-progress">' + (idx + 1) + ' / ' + questions.length + '</div>' +
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
      result.innerHTML =
        '<div class="quiz-rec-label">Your recommendation</div>' +
        '<h3 class="display quiz-rec-title">' + p.rec + '</h3>' +
        '<div class="quiz-rec-tag">' + p.tag + '</div>' +
        '<p class="quiz-rec-desc">' + p.desc + '</p>' +
        '<div class="quiz-actions">' +
          '<a href="' + p.href + '" class="btn btn-amber">Book ' + p.rec + '</a>' +
          '<button class="quiz-retake" id="quizRetake"><svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/></svg>Retake</button>' +
        '</div>';
      result.classList.add('show');
      document.getElementById('quizRetake').addEventListener('click', reset);
    }
    function reset() {
      idx = 0; tally.audit = tally.shopping = tally.event = 0;
      result.classList.remove('show'); result.innerHTML = '';
      steps.style.display = 'block'; render();
    }
    render();
  }
})();
