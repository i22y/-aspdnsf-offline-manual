(function () {
  'use strict';

  if (!('history' in window)) return;

  try { history.scrollRestoration = 'manual'; } catch (_error) { /* unsupported browser */ }

  const articleBody = document.getElementById('articleBody');
  const loadingState = document.getElementById('loadingState');
  let pendingRestore = null;
  let linkNavigation = false;
  let saveTimer = null;
  let restoreTimer = null;

  function currentPath() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    return (params.get('page') || 'welcome.htm').toLowerCase();
  }

  function replaceScrollState(scrollY) {
    const existing = history.state && typeof history.state === 'object' ? history.state : {};
    const next = Object.assign({}, existing, {
      manualPath: currentPath(),
      manualScrollY: Math.max(0, Math.round(scrollY))
    });

    try { history.replaceState(next, '', location.href); } catch (_error) { /* ignore restricted state writes */ }
  }

  function saveCurrentPosition() {
    replaceScrollState(window.scrollY || window.pageYOffset || 0);
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveCurrentPosition, 80);
  }

  function articleIsReady() {
    return articleBody &&
      articleBody.querySelector('.article-title') &&
      (!loadingState || loadingState.hidden);
  }

  function restoreWhenReady(attempt) {
    clearTimeout(restoreTimer);
    if (pendingRestore === null) return;

    if (!articleIsReady()) {
      if (attempt < 80) restoreTimer = setTimeout(function () { restoreWhenReady(attempt + 1); }, 25);
      return;
    }

    const target = Math.max(0, Number(pendingRestore) || 0);
    pendingRestore = null;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        window.scrollTo({ top: target, left: 0, behavior: 'auto' });
        replaceScrollState(target);
      });
    });
  }

  function deferRestore() {
    clearTimeout(restoreTimer);
    restoreTimer = setTimeout(function () { restoreWhenReady(0); }, 0);
  }

  window.addEventListener('scroll', scheduleSave, { passive: true });
  window.addEventListener('pagehide', saveCurrentPosition);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') saveCurrentPosition();
  });

  document.addEventListener('click', function (event) {
    const link = event.target.closest('a[data-manual-path]');
    if (!link) return;

    saveCurrentPosition();
    pendingRestore = 0;
    linkNavigation = true;
    setTimeout(function () { linkNavigation = false; }, 1200);
  }, true);

  window.addEventListener('popstate', function (event) {
    linkNavigation = false;
    const state = event.state && typeof event.state === 'object' ? event.state : {};
    pendingRestore = Number.isFinite(Number(state.manualScrollY)) ? Number(state.manualScrollY) : 0;
  });

  window.addEventListener('hashchange', function () {
    if (linkNavigation) {
      pendingRestore = 0;
      linkNavigation = false;
    } else if (pendingRestore === null) {
      const state = history.state && typeof history.state === 'object' ? history.state : {};
      pendingRestore = Number.isFinite(Number(state.manualScrollY)) ? Number(state.manualScrollY) : 0;
    }

    /* Let the reader's hashchange handler clear the old article before testing readiness. */
    deferRestore();
  });

  if (articleBody) {
    new MutationObserver(function () {
      if (pendingRestore !== null) deferRestore();
    }).observe(articleBody, { childList: true, subtree: true });
  }

  if (!history.state || !Number.isFinite(Number(history.state.manualScrollY))) {
    replaceScrollState(window.scrollY || 0);
  }
}());
