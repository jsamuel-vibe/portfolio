// Site behaviour: "View all" toggles, back-to-top button, and the section rail on case studies.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollBehavior = reduceMotion ? 'auto' : 'smooth';

  // "View all" toggles. Extra items stay visible unless this script runs,
  // so the page never hides content it can't reveal again.
  document.querySelectorAll('[data-toggle-more]').forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute('aria-controls'));
    if (!target) return;
    var showLabel = btn.textContent;
    target.hidden = true;
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var open = target.hidden;
      target.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Show fewer' : showLabel;
      // Collapsing removes content above the button; keep it under the cursor.
      if (!open) btn.scrollIntoView({ block: 'center' });
    });
  });

  // Back to top: appears once the reader is well into the page.
  var toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<span aria-hidden="true">↑</span>';
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: scrollBehavior });
  });
  document.body.appendChild(toTop);

  // Section rail: one line per section, the current one highlighted,
  // hover shows the section's title and first line, click jumps there.
  var sections = [];
  var intro = document.querySelector('.project-intro h1');
  if (intro) {
    document.querySelectorAll('main section, main header').forEach(function (el) {
      var heading = el === intro.closest('header') ? intro : el.querySelector(':scope > h2, :scope > div > h2, :scope > div > div > h2');
      if (!heading) return;
      var first = el.querySelector('.t-body');
      var text = first ? first.textContent.trim() : '';
      sections.push({
        el: el,
        heading: heading,
        title: el.tagName === 'HEADER' ? 'Overview' : heading.textContent.trim(),
        snippet: text.length > 120 ? text.slice(0, 117).trim() + '…' : text
      });
    });
  }

  if (sections.length > 2) {
    var rail = document.createElement('nav');
    rail.className = 'rail';
    rail.setAttribute('aria-label', 'Sections');
    var tip = document.createElement('div');
    tip.className = 'rail-tip';
    tip.setAttribute('aria-hidden', 'true');
    tip.innerHTML = '<strong></strong><span></span>';
    rail.appendChild(tip);

    sections.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'rail-item';
      b.setAttribute('aria-label', s.title);
      b.innerHTML = '<span class="rail-line"></span>';
      b.addEventListener('click', function () {
        s.heading.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      });
      var show = function () {
        tip.firstChild.textContent = (i + 1) + '. ' + s.title;
        tip.lastChild.textContent = s.snippet;
        tip.style.top = (b.offsetTop + b.offsetHeight / 2) + 'px';
        rail.classList.add('show-tip');
      };
      b.addEventListener('mouseenter', show);
      b.addEventListener('focus', show);
      b.addEventListener('mouseleave', function () { rail.classList.remove('show-tip'); });
      b.addEventListener('blur', function () { rail.classList.remove('show-tip'); });
      s.button = b;
      rail.appendChild(b);
    });
    document.body.appendChild(rail);
  }

  var ticking = false;
  function onScroll() {
    ticking = false;
    toTop.classList.toggle('is-visible', window.scrollY > 700);
    if (!sections.length || !sections[0].button) return;
    var line = window.innerHeight * 0.35;
    var current = 0;
    sections.forEach(function (s, i) {
      if (s.heading.getBoundingClientRect().top <= line) current = i;
    });
    sections.forEach(function (s, i) {
      s.button.classList.toggle('is-active', i === current);
      if (i === current) s.button.setAttribute('aria-current', 'true');
      else s.button.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
})();
