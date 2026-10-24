const DEFAULT_VIEW = '3';
const VALID_VIEWS = new Set(['1', '2', '3']);

export function normalizeCaseStudyView(value) {
  const candidate = String(value ?? '');
  return VALID_VIEWS.has(candidate) ? candidate : DEFAULT_VIEW;
}

export function readCaseStudyView(search) {
  return normalizeCaseStudyView(new URLSearchParams(search).get('view'));
}

export function writeCaseStudyView(search, view) {
  const params = new URLSearchParams(search);
  params.set('view', normalizeCaseStudyView(view));
  return `?${params.toString()}`;
}

export function applyCaseStudyView(root, buttons, view) {
  const activeView = normalizeCaseStudyView(view);
  root.dataset.caseView = activeView;
  buttons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.caseViewChoice === activeView));
  });
  return activeView;
}

export function pauseAutoplayForReducedMotion(doc, reduceMotion) {
  if (!reduceMotion) return;
  doc.querySelectorAll('video[autoplay]').forEach((video) => {
    video.removeAttribute('autoplay');
    video.pause();
  });
}

export function initCaseStudyView(doc = document, win = window) {
  pauseAutoplayForReducedMotion(doc, Boolean(win.matchMedia?.('(prefers-reduced-motion: reduce)').matches));

  const switcher = doc.querySelector('[data-case-view-switcher]');
  if (!switcher) return;

  const buttons = Array.from(switcher.querySelectorAll('[data-case-view-choice]'));
  const setView = (view, updateUrl) => {
    const activeView = applyCaseStudyView(doc.documentElement, buttons, view);
    if (updateUrl) {
      const next = `${win.location.pathname}${writeCaseStudyView(win.location.search, activeView)}${win.location.hash}`;
      win.history.replaceState({}, '', next);
    }
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.caseViewChoice, true));
  });
  setView(readCaseStudyView(win.location.search), false);
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  initCaseStudyView();
}
