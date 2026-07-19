(function () {
  'use strict';

  const STORAGE_KEY = 'manualTheme';
  const root = document.documentElement;
  const themeColor = document.getElementById('themeColor');
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeToggleIcon');
  const text = document.getElementById('themeToggleText');
  const systemPreference = window.matchMedia('(prefers-color-scheme: light)');

  function readStoredTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (_error) {
      return null;
    }
  }

  function systemTheme() {
    return systemPreference.matches ? 'light' : 'dark';
  }

  function updateControl(theme) {
    if (!toggle) return;

    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', 'Switch to ' + nextTheme + ' mode');
    toggle.setAttribute('title', 'Switch to ' + nextTheme + ' mode');
    toggle.setAttribute('aria-pressed', String(theme === 'light'));

    if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
    if (text) text.textContent = theme === 'dark' ? 'Light' : 'Dark';
  }

  function applyTheme(theme, persist) {
    const resolved = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;

    if (themeColor) {
      themeColor.setAttribute('content', resolved === 'light' ? '#f7f8fa' : '#050505');
    }

    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, resolved); } catch (_error) { /* storage can be unavailable */ }
    }

    updateControl(resolved);
  }

  function toggleTheme() {
    applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true);
  }

  const initialTheme = root.dataset.theme || readStoredTheme() || systemTheme();
  applyTheme(initialTheme, false);

  if (toggle) toggle.addEventListener('click', toggleTheme);

  const handleSystemChange = function () {
    if (!readStoredTheme()) applyTheme(systemTheme(), false);
  };

  if (typeof systemPreference.addEventListener === 'function') {
    systemPreference.addEventListener('change', handleSystemChange);
  } else if (typeof systemPreference.addListener === 'function') {
    systemPreference.addListener(handleSystemChange);
  }
}());
