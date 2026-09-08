/* ═══════════════════════════════════════════════════════════════════
   Prisom Halder — Portfolio · interactions
   i18n · theme · custom cursor · 3D tilt · reveal · nav
   3D project carousel · counters · contact form
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── i18n ──────────────────────────────────────────────────────── */
  var I18N = window.I18N || { en: {}, bn: {} };

  function applyLang(lang) {
    var dict = I18N[lang] || I18N.en;
    $$('[data-i18n]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n')];
      if (v == null) return;
      if (el.hasAttribute('data-i18n-html') || v.indexOf('<') > -1) el.innerHTML = v;
      else el.textContent = v;
    });
    $$('[data-i18n-ph]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n-ph')];
      if (v != null) el.setAttribute('placeholder', v);
    });
    root.setAttribute('data-lang', lang);
    root.lang = lang;
    try { localStorage.setItem('ph-lang', lang); } catch (e) {}
  }

  var langToggle = $('#langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', function () {
      applyLang(root.getAttribute('data-lang') === 'bn' ? 'en' : 'bn');
    });
  }
  applyLang(root.getAttribute('data-lang') || 'en');

  /* ── theme ─────────────────────────────────────────────────────── */
  var themeToggle = $('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('ph-theme', next); } catch (e) {}
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'light' ? '#F6F7FB' : '#0A0C10');
    });
  }

  /* ── nav ───────────────────────────────────────────────────────── */
  var nav = $('#nav');
  var navLinks = $('#navLinks');
  var hamburger = $('#hamburger');
  var progress = $('.scroll-progress');
  var linkEls = $$('.nav-links a');
  var sections = $$('section[id], header[id]');

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('scrolled', y > 8);

    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';

    var current = '';
    sections.forEach(function (s) { if (y >= s.offsetTop - 140) current = s.id; });
    linkEls.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toTop = $('#toTop');
  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ── reveal on scroll ──────────────────────────────────────────── */
  var revealEls = $$('.reveal');
  function revealAll() { revealEls.forEach(function (el) { el.classList.add('in'); }); }
  function revealInView() {
    var vh = window.innerHeight || 800;
    revealEls.forEach(function (el) {
      if (el.classList.contains('in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.95 && r.bottom > 0) el.classList.add('in');
    });
  }

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });

    /* safety nets — never leave content hidden if IO misfires */
    window.addEventListener('load', revealInView);
    window.addEventListener('scroll', revealInView, { passive: true });
    setTimeout(revealInView, 400);
    setTimeout(revealAll, 2600);
  } else {
    revealAll();
  }

  /* ── counters ──────────────────────────────────────────────────── */
  var counters = $$('.stat-num[data-count]');
  function runCounters() {
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var start = performance.now(), dur = 1100;
      function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var heroStats = $('.hero-stats');
  if (heroStats && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { runCounters(); co.disconnect(); }
    }, { threshold: 0.5 });
    co.observe(heroStats);
  } else { runCounters(); }

  /* ── custom cursor (desktop) ───────────────────────────────────── */
  if (finePointer && !reduceMotion) {
    var dot = $('.cursor-dot'), ring = $('.cursor-ring');
    var label = document.createElement('div');
    label.className = 'cursor-label'; label.textContent = 'Open';
    document.body.appendChild(label);

    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      label.style.transform = 'translate(' + mx + 'px,' + (my + 44) + 'px)';
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('[data-cursor]');
      document.body.classList.toggle('cursor-hover', !!t && t.getAttribute('data-cursor') === 'link');
      document.body.classList.toggle('cursor-view', !!t && t.getAttribute('data-cursor') === 'view');
    });
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('[data-cursor]')) {
        document.body.classList.remove('cursor-hover', 'cursor-view');
      }
    });
    document.addEventListener('mousedown', function () { document.body.classList.add('cursor-down'); });
    document.addEventListener('mouseup',   function () { document.body.classList.remove('cursor-down'); });
    document.addEventListener('mouseleave', function () { dot.style.opacity = ring.style.opacity = 0; });
    document.addEventListener('mouseenter', function () { dot.style.opacity = ''; ring.style.opacity = ''; });
  }

  /* ── hero 3D tilt ──────────────────────────────────────────────────
     A gentle idle drift animates the photo in 3D on every device — the
     old version only responded to mouse movement, so anyone on a phone
     or tablet never saw any 3D motion at all. On a fine pointer, real
     cursor position takes over from the drift while the mouse is over
     the hero; touch devices keep the idle drift, since there's no
     hover to take over from. Fully disabled under prefers-reduced-motion
     (a global CSS rule already forces the tilt to a flat transform for
     those users; skipping the loop here just saves the battery/CPU). */
  var hero = $('#hero'), heroTilt = $('#heroTilt');
  if (hero && heroTilt && !reduceMotion) {
    var tiltRX = 0, tiltRY = 0, tiltTX = 0, tiltTY = 0, tiltIdle = true;
    var tiltRAF = null, tiltVisible = true;

    function tiltFrame(t) {
      if (tiltIdle) {
        tiltTX = Math.sin(t / 2600) * 9;
        tiltTY = Math.cos(t / 3300) * 7;
      }
      tiltRX += (tiltTX - tiltRX) * 0.05;
      tiltRY += (tiltTY - tiltRY) * 0.05;
      heroTilt.style.setProperty('--rx', tiltRX.toFixed(2) + 'deg');
      heroTilt.style.setProperty('--ry', tiltRY.toFixed(2) + 'deg');
      if (tiltVisible) tiltRAF = requestAnimationFrame(tiltFrame);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        tiltVisible = entries[0].isIntersecting;
        if (tiltVisible && tiltRAF === null) tiltRAF = requestAnimationFrame(tiltFrame);
      }, { threshold: 0.05 }).observe(hero);
    } else {
      tiltRAF = requestAnimationFrame(tiltFrame);
    }

    if (finePointer) {
      hero.addEventListener('mousemove', function (e) {
        tiltIdle = false;
        var r = hero.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tiltTX = px * 16;
        tiltTY = -py * 16;
      });
      hero.addEventListener('mouseleave', function () { tiltIdle = true; });
    }
  }

  /* ── generic hover tilt [data-tilt] ────────────────────────────── */
  if (finePointer && !reduceMotion) {
    $$('[data-tilt]').forEach(function (el) {
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(700px) rotateX(' + (-py * 7).toFixed(2) +
          'deg) rotateY(' + (px * 7).toFixed(2) + 'deg) translateY(-3px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ── 3D project carousel ───────────────────────────────────────── */
  (function carousel() {
    var stage = $('#projectsStage');
    var track = $('#projectsTrack');
    if (!stage || !track) return;

    var cards = $$('.project-card', track);
    var N = cards.length;
    var step = 360 / N;
    var radius = 440;
    var angle = 0, targetAngle = null;
    var autoSpin = true, hoverPause = false, dragging = false;
    var dragStartX = 0, dragStartAngle = 0, moved = 0, rafId = null;

    var viewToggle = $('#viewToggle');
    var controls = $('#projectsControls');
    var hint = $('#projectsHint');
    var spinBtn = $('#spinToggle');
    var canCarousel = window.matchMedia('(min-width: 1000px) and (pointer: fine)').matches && !reduceMotion;

    function layout() {
      radius = window.innerWidth < 1280 ? 440 : 500;
      cards.forEach(function (c, i) {
        c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + radius + 'px)';
      });
    }

    function frontIndex() {
      return ((Math.round(-angle / step) % N) + N) % N;
    }

    function render() {
      track.style.transform = 'translateZ(-' + radius + 'px) rotateY(' + angle + 'deg)';
      var fi = frontIndex();
      cards.forEach(function (c, i) {
        var a = (((i * step + angle) % 360) + 360) % 360;
        var delta = Math.min(a, 360 - a);              // 0 = front, 180 = back
        var t = 1 - delta / 180;
        var near = Math.max(0, 1 - delta / 90);           // 1 at front, 0 beyond 90deg
        c.style.opacity = (0.3 + 0.7 * t).toFixed(3);
        c.style.filter = 'brightness(' + (0.62 + 0.38 * t).toFixed(3) + ') blur(' + ((1 - near) * 2).toFixed(2) + 'px)';
        c.classList.toggle('is-front', i === fi);
        c.style.pointerEvents = i === fi ? 'auto' : 'none';
      });
    }

    function tick() {
      if (dragging) { /* angle set by pointermove */ }
      else if (targetAngle !== null) {
        angle += (targetAngle - angle) * 0.12;
        if (Math.abs(targetAngle - angle) < 0.05) { angle = targetAngle; targetAngle = null; }
      } else if (autoSpin && !hoverPause) {
        angle -= 0.12;
      }
      render();
      rafId = requestAnimationFrame(tick);
    }

    function enable3D() {
      stage.classList.add('is-3d');
      track.classList.add('mode-3d');
      if (viewToggle) viewToggle.hidden = false;
      if (controls) controls.hidden = false;
      if (hint) hint.hidden = false;
      layout();
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function disable3D() {
      stage.classList.remove('is-3d');
      track.classList.remove('mode-3d');
      if (controls) controls.hidden = true;
      if (hint) hint.hidden = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      cards.forEach(function (c) {
        c.style.transform = c.style.opacity = c.style.filter = c.style.pointerEvents = '';
        c.classList.remove('is-front');
      });
      track.style.transform = '';
    }

    if (!canCarousel) { disable3D(); return; }
    enable3D();

    /* view toggle */
    if (viewToggle) {
      $$('button', viewToggle).forEach(function (b) {
        b.addEventListener('click', function () {
          $$('button', viewToggle).forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          if (b.getAttribute('data-view') === 'grid') disable3D();
          else enable3D();
        });
      });
    }

    /* pause on hover */
    stage.addEventListener('mouseenter', function () { hoverPause = true; });
    stage.addEventListener('mouseleave', function () { hoverPause = false; });

    /* spin toggle */
    if (spinBtn) spinBtn.addEventListener('click', function () {
      autoSpin = !autoSpin;
      spinBtn.textContent = autoSpin ? '❚❚' : '▶';
      if (!autoSpin) targetAngle = Math.round(angle / step) * step;
    });

    /* arrows */
    var prev = $('#prevProj'), next = $('#nextProj');
    function snap() { return Math.round(angle / step) * step; }
    if (prev) prev.addEventListener('click', function () { targetAngle = snap() + step; });
    if (next) next.addEventListener('click', function () { targetAngle = snap() - step; });

    /* drag to spin */
    stage.addEventListener('pointerdown', function (e) {
      dragging = true; moved = 0;
      dragStartX = e.clientX; dragStartAngle = angle; targetAngle = null;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      moved = Math.abs(e.clientX - dragStartX);
      angle = dragStartAngle + (e.clientX - dragStartX) * 0.3;
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      targetAngle = snap();
      try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    /* suppress click after a real drag */
    track.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);

    /* keyboard */
    stage.setAttribute('tabindex', '0');
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { targetAngle = snap() + step; e.preventDefault(); }
      if (e.key === 'ArrowRight') { targetAngle = snap() - step; e.preventDefault(); }
    });

    /* re-evaluate on resize */
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var ok = window.matchMedia('(min-width: 1000px) and (pointer: fine)').matches && !reduceMotion;
        var is3d = track.classList.contains('mode-3d');
        if (ok && is3d) layout();
        else if (!ok && is3d) { disable3D(); if (viewToggle) viewToggle.hidden = true; }
        else if (ok && !is3d && viewToggle && viewToggle.hidden) {
          viewToggle.hidden = false;
        }
      }, 200);
    });
  })();

  /* ── contact form ─────────────────────────────────────────────── */
  var form = $('#contactForm');
  if (form) {
    var note = document.createElement('p');
    note.className = 'form-note';
    form.appendChild(note);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var dict = I18N[root.getAttribute('data-lang')] || I18N.en;
      var name = $('#cName'), email = $('#cEmail'), msg = $('#cMsg');
      var errs = [];
      [name, email, msg].forEach(function (f) { f.classList.remove('invalid'); });

      if (!name.value.trim()) { errs.push(dict['contact.form.errName']); name.classList.add('invalid'); }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { errs.push(dict['contact.form.errEmail']); email.classList.add('invalid'); }
      if (msg.value.trim().length < 5) { errs.push(dict['contact.form.errMsg']); msg.classList.add('invalid'); }

      if (errs.length) { note.className = 'form-note err'; note.textContent = errs[0]; return; }

      note.className = 'form-note ok';
      note.textContent = dict['contact.form.ok'];
      var subject = 'Portfolio contact from ' + name.value.trim();
      var body = 'From: ' + name.value.trim() + ' (' + email.value.trim() + ')\n\n' + msg.value.trim();
      window.location.href = 'mailto:prisomhalder2025@gmail.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ── year in footer already static (2026) ──────────────────────── */
})();
