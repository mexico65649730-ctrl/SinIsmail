// Md Ismail portfolio — wiring for the Sakuga controls.
// The component files themselves are untouched; this only listens to their
// documented events and calls their documented methods.
(function () {
  'use strict';

  var EMAIL = 'devmdismail@gmail.com';
  var toast = document.getElementById('toast');
  function say(msg) { if (toast) toast.show(msg); }

  // ---------- dark / light mode ----------
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    // The head script already set data-theme from storage before paint.
    // Setting checked from code jumps to the end with no animation: right for init.
    toggle.checked = root.getAttribute('data-theme') === 'dark';
    toggle.addEventListener('change', function () {
      var dark = toggle.checked;
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
      try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) { /* private mode */ }
    });
  }

  // ---------- hero CTAs ----------
  var btnResume = document.getElementById('btnResume');
  if (btnResume) btnResume.addEventListener('click', function () {
    var a = document.createElement('a');
    a.href = 'resume.pdf';
    a.download = 'Md-Ismail-Resume.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    btnResume.done(); // the check: the download started
  });

  var btnGithub = document.getElementById('btnGithub');
  if (btnGithub) btnGithub.addEventListener('click', function () {
    window.open('https://github.com/sinismail', '_blank', 'noopener');
  });

  var btnContact = document.getElementById('btnContact');
  if (btnContact) btnContact.addEventListener('click', function () {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  });

  // ---------- project tabs ----------
  var tabs = document.getElementById('projectTabs');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.project-card'));
  var empty = document.getElementById('projectsEmpty');
  if (tabs) tabs.addEventListener('change', function (e) {
    var v = (e.detail && e.detail.value) || 'all';
    var shown = 0;
    cards.forEach(function (card) {
      var cats = (card.getAttribute('data-cats') || '').split(' ');
      var show = v === 'all' || cats.indexOf(v) !== -1;
      card.hidden = !show;
      if (show) shown += 1;
    });
    if (empty) empty.hidden = shown !== 0;
  });

  // ---------- skill bars: fill when scrolled into view ----------
  var bars = Array.prototype.slice.call(document.querySelectorAll('.level-bar'));
  function fillBar(bar, delay) {
    setTimeout(function () { bar.set(parseFloat(bar.getAttribute('data-level')) || 0); }, delay);
  }
  if ('IntersectionObserver' in window && bars.length) {
    var seen = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          fillBar(entry.target, i * 150); // slight stagger so the clouds don't all shout at once
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(function (bar) { io.observe(bar); });
  } else {
    bars.forEach(function (bar, i) { fillBar(bar, i * 150); });
  }

  // ---------- journey slider ----------
  var JOURNEY = {
    2023: 'PUC done — Government Boys College, Mudigere. B.Voc begins at JSS College, Mysore.',
    2024: 'B.Voc, year two — JSS College, Mysore.',
    2025: 'B.Voc, final year — JSS College, Mysore.',
    2026: 'B.Voc done, CGPA 7.96/10. MCA begins at CMRIT, Bengaluru (Karnataka PGCET).',
    2027: 'MCA, year two — in progress.',
    2028: 'MCA done, expected — first full-time role.'
  };
  var slider = document.getElementById('journeySlider');
  var readout = document.getElementById('journeyReadout');
  function showYear(year) {
    if (!readout) return;
    var text = JOURNEY[year] || JOURNEY[2026];
    readout.innerHTML = '<strong>' + year + '</strong> — ' + text;
  }
  if (slider) {
    showYear(slider.value);
    slider.addEventListener('input', function () { showYear(slider.value); });
  }

  // ---------- copy email ----------
  var btnCopy = document.getElementById('btnCopyEmail');
  function copyEmail(done) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(function () { done(true); }, fallback);
    } else {
      fallback();
    }
  }
  if (btnCopy) btnCopy.addEventListener('click', function () {
    copyEmail(function (ok) {
      if (ok) { say('Email copied to clipboard'); btnCopy.done(); }
      else { say('Copy failed — the address is below'); }
    });
  });

  // ---------- contact form: no backend, builds a mailto link ----------
  var form = document.getElementById('contactForm');
  var btnSend = document.getElementById('btnSend');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.querySelector('[name="name"]').value.trim();
    var email = form.querySelector('[name="email"]').value.trim();
    var message = form.querySelector('[name="message"]').value.trim();
    if (!name || !email || !message) { say('Fill in all three fields'); return; }
    if (email.indexOf('@') < 1 || email.indexOf('.') < 0 || email.indexOf('@') > email.lastIndexOf('.')) {
      say('That email looks off');
      return;
    }
    var subject = 'Portfolio contact from ' + name;
    var body = message + '\n\n— ' + name + ' (' + email + ')';
    var url = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    window.__lastMailto = url; // verification hook: lets a headless check read the built link
    window.location.href = url;
    say('Opening your email app…');
    if (btnSend) btnSend.done();
  });
})();
