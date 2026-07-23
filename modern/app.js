(function () {
  'use strict';

  const BUILD = '2026.07.22-fulltext-2';
  const MOBILE_BREAKPOINT = 900;
  const RAW_BASE = 'https://raw.githubusercontent.com/i22y/-aspdnsf-offline-manual/modern-reader/';
  let nextId = 1;

  const state = {
    root: null,
    activePath: 'welcome.htm',
    flat: [],
    byPath: new Map(),
    collapsed: new Set(),
    mobileDefaultsApplied: false,
    textSize: readTextSize(),
    loadToken: 0,
    searchIndex: null,
    searchIndexPromise: null,
    searchIndexError: false
  };

  const entities = document.createElement('textarea');

  function readTextSize() {
    try {
      const value = Number(localStorage.getItem('manualTextSize') || 17);
      return Number.isFinite(value) ? value : 17;
    } catch (_error) {
      return 17;
    }
  }

  function isMobile() {
    return window.matchMedia('(max-width: ' + MOBILE_BREAKPOINT + 'px)').matches;
  }

  function decodeTitle(value) {
    entities.innerHTML = String(value || '').replace(/&nbsp;/gi, ' ');
    return entities.value.replace(/\s+/g, ' ').trim();
  }

  function normalizePath(value) {
    if (!value) return '';
    let clean = String(value).trim();
    try { clean = decodeURIComponent(clean); } catch (_error) { /* keep original */ }
    clean = clean.split('#')[0].split('?')[0].replace(/\\/g, '/');
    return clean.substring(clean.lastIndexOf('/') + 1).toLowerCase();
  }

  function encodePath(path) {
    return String(path || '')
      .replace(/^\/+/, '')
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');
  }

  function node(type, title, link) {
    return {
      type,
      title: decodeTitle(title),
      link: link || '',
      path: normalizePath(link),
      children: [],
      parent: null,
      trail: [],
      id: 'topic-' + nextId++
    };
  }

  // Adapter functions consumed by the original contents_data.js file.
  window.gFld = function (title, link) { return node('folder', title, link); };
  window.gLnk = function (_target, title, link) { return node('document', title, link); };
  window.insFld = function (parent, child) {
    child.parent = parent;
    parent.children.push(child);
    return child;
  };
  window.insDoc = function (parent, child) {
    child.parent = parent;
    parent.children.push(child);
    return child;
  };

  function elements() {
    return {
      tree: document.getElementById('manualTree'),
      search: document.getElementById('navSearch'),
      clearSearch: document.getElementById('clearSearch'),
      resultsSection: document.getElementById('searchResultsSection'),
      resultsList: document.getElementById('searchResultsList'),
      searchStatus: document.getElementById('searchStatus'),
      topicCount: document.getElementById('topicCount'),
      body: document.getElementById('articleBody'),
      loading: document.getElementById('loadingState'),
      breadcrumbs: document.getElementById('breadcrumbs'),
      outline: document.getElementById('outline'),
      outlineLinks: document.getElementById('outlineLinks'),
      previous: document.getElementById('previousPage'),
      next: document.getElementById('nextPage'),
      original: document.getElementById('originalLink'),
      article: document.getElementById('article'),
      menuButton: document.getElementById('menuButton'),
      closeMenuButton: document.getElementById('closeMenuButton'),
      scrim: document.getElementById('menuScrim'),
      contents: document.getElementById('contentsPanel')
    };
  }

  function indexTree() {
    state.flat = [];
    state.byPath.clear();

    function walk(item, ancestors) {
      item.trail = ancestors.concat(item);
      if (item.link && item.path) {
        state.flat.push(item);
        if (!state.byPath.has(item.path)) state.byPath.set(item.path, item);
      }
      item.children.forEach(child => walk(child, item.trail));
    }

    state.root.children.forEach(child => walk(child, []));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[character]));
  }

  function applyMobileCollapseDefaults() {
    if (!isMobile() || state.mobileDefaultsApplied) return;
    state.collapsed.clear();

    function collapseBranches(item) {
      if (item.children.length) state.collapsed.add(item.id);
      item.children.forEach(collapseBranches);
    }

    state.root.children.forEach(collapseBranches);
    state.mobileDefaultsApplied = true;
    expandActiveTrail(state.byPath.get(state.activePath));
  }

  function expandActiveTrail(item) {
    let current = item;
    while (current) {
      state.collapsed.delete(current.id);
      current = current.parent;
    }
  }

  function renderTree() {
    const el = elements();

    function renderItems(items) {
      const list = document.createElement('ul');
      list.className = 'tree-list';

      items.forEach(item => {
        const hasChildren = item.children.length > 0;
        const isCollapsed = hasChildren && state.collapsed.has(item.id);
        const li = document.createElement('li');
        li.className = 'tree-item' + (hasChildren ? ' has-children' : '') + (isCollapsed ? ' is-collapsed' : '');
        li.dataset.topicId = item.id;

        const row = document.createElement('div');
        row.className = 'tree-row';

        if (hasChildren) {
          const toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.className = 'tree-toggle';
          toggle.setAttribute('aria-expanded', String(!isCollapsed));
          toggle.setAttribute('aria-controls', item.id + '-children');
          toggle.setAttribute('aria-label', (isCollapsed ? 'Expand ' : 'Collapse ') + (item.title || 'section'));
          toggle.dataset.toggleTopic = item.id;
          toggle.innerHTML = '<span aria-hidden="true">›</span>';
          row.appendChild(toggle);
        } else {
          const spacer = document.createElement('span');
          spacer.className = 'tree-toggle-spacer';
          spacer.setAttribute('aria-hidden', 'true');
          row.appendChild(spacer);
        }

        const label = item.link ? document.createElement('a') : document.createElement('span');
        label.className = (item.link ? 'tree-link' : 'tree-label') + (item.path === state.activePath ? ' active' : '');
        label.textContent = item.title || 'Untitled';

        if (item.link) {
          label.href = makePageHash(item.link);
          label.dataset.manualPath = item.link;
        }

        row.appendChild(label);
        li.appendChild(row);

        if (hasChildren) {
          const children = renderItems(item.children);
          children.id = item.id + '-children';
          children.hidden = isCollapsed;
          li.appendChild(children);
        }

        list.appendChild(li);
      });

      return list;
    }

    el.tree.replaceChildren(renderItems(state.root.children));
    el.topicCount.textContent = state.flat.length + ' topics';
  }

  function toggleTreeItem(id) {
    if (state.collapsed.has(id)) state.collapsed.delete(id);
    else state.collapsed.add(id);
    renderTree();
  }

  function loadSearchIndex() {
    if (state.searchIndexPromise) return state.searchIndexPromise;

    state.searchIndexPromise = new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'search-index.js?build=' + encodeURIComponent(BUILD);
      script.onload = () => {
        const data = window.MANUAL_SEARCH_INDEX;
        if (data && Array.isArray(data.pages)) state.searchIndex = data.pages;
        else state.searchIndexError = true;
        resolve();
      };
      script.onerror = () => {
        state.searchIndexError = true;
        resolve();
      };
      document.head.appendChild(script);
    });

    return state.searchIndexPromise;
  }

  function buildSnippet(text, query, tokens) {
    const lower = text.toLowerCase();
    let position = lower.indexOf(query);
    let matchLength = query.length;

    if (position === -1) {
      position = lower.indexOf(tokens[0]);
      matchLength = tokens[0].length;
    }
    if (position === -1) return '';

    const radius = 80;
    const start = Math.max(0, position - radius);
    const end = Math.min(text.length, position + matchLength + radius);
    let snippet = text.slice(start, end);
    if (start > 0) snippet = '…' + snippet.replace(/^\S*\s/, '');
    if (end < text.length) snippet = snippet.replace(/\s\S*$/, '') + '…';

    // Collect highlight ranges on the plain snippet, merge overlaps, then
    // emit escaped text with <mark> wrappers so markup is never corrupted.
    const snippetLower = snippet.toLowerCase();
    const terms = Array.from(new Set([query].concat(tokens).filter(Boolean)));
    const ranges = [];
    terms.forEach(term => {
      let from = 0;
      while (true) {
        const at = snippetLower.indexOf(term, from);
        if (at === -1) break;
        ranges.push([at, at + term.length]);
        from = at + term.length;
      }
    });
    ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);

    const merged = [];
    ranges.forEach(range => {
      const last = merged[merged.length - 1];
      if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
      else merged.push(range.slice());
    });

    let html = '';
    let cursor = 0;
    merged.forEach(([from, to]) => {
      html += escapeHtml(snippet.slice(cursor, from)) + '<mark>' + escapeHtml(snippet.slice(from, to)) + '</mark>';
      cursor = to;
    });
    html += escapeHtml(snippet.slice(cursor));
    return html;
  }

  function appendSearchResult(list, path, item, title, snippetHtml) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = makePageHash(path);
    link.dataset.manualPath = path;
    link.textContent = item
      ? item.trail.map(part => part.title).filter(Boolean).join(' / ')
      : title;
    li.appendChild(link);

    if (snippetHtml) {
      const snippet = document.createElement('p');
      snippet.className = 'result-snippet';
      snippet.innerHTML = snippetHtml;
      li.appendChild(snippet);
    }

    list.appendChild(li);
  }

  function renderSearchResults() {
    const el = elements();
    const query = el.search.value.trim().toLowerCase();
    el.resultsList.replaceChildren();

    if (!query) {
      el.resultsSection.hidden = true;
      el.searchStatus.textContent = '';
      return;
    }

    const tokens = query.split(/\s+/).filter(Boolean);
    const matchedPaths = new Set();

    // Pass 1: topic titles and tree trails (always available).
    const titleMatches = state.flat.filter(item => {
      const trailText = item.trail.map(part => part.title).join(' ');
      return (item.title + ' ' + trailText + ' ' + item.link).toLowerCase().includes(query);
    });

    titleMatches.forEach(item => {
      matchedPaths.add(item.path);
      appendSearchResult(el.resultsList, item.link, item, item.title, '');
    });

    // Pass 2: full page text (lazy-loaded index).
    if (!state.searchIndex && !state.searchIndexError) {
      loadSearchIndex().then(renderSearchResults);
      el.searchStatus.textContent = titleMatches.length + ' title ' +
        (titleMatches.length === 1 ? 'match' : 'matches') + ' — loading full-text index…';
      el.resultsSection.hidden = false;
      return;
    }

    let contentMatches = 0;
    if (state.searchIndex) {
      const phraseHits = [];
      const tokenHits = [];

      state.searchIndex.forEach(page => {
        const path = normalizePath(page.p);
        if (matchedPaths.has(path)) return;
        const haystack = (page.t + ' ' + page.x).toLowerCase();
        if (haystack.includes(query)) phraseHits.push(page);
        else if (tokens.length > 1 && tokens.every(token => haystack.includes(token))) tokenHits.push(page);
      });

      const MAX_CONTENT_RESULTS = 50;
      phraseHits.concat(tokenHits).slice(0, MAX_CONTENT_RESULTS).forEach(page => {
        const path = normalizePath(page.p);
        const item = state.byPath.get(path) || null;
        appendSearchResult(el.resultsList, page.p, item, page.t, buildSnippet(page.x, query, tokens));
        contentMatches += 1;
      });
    }

    const total = titleMatches.length + contentMatches;
    let status = total + (total === 1 ? ' matching page' : ' matching pages');
    if (state.searchIndexError) status += ' (full-text index unavailable — titles only)';
    el.searchStatus.textContent = status;
    el.resultsSection.hidden = false;
  }

  function makePageHash(path) {
    return '#page=' + encodeURIComponent(path);
  }

  function currentFromHash() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    return normalizePath(params.get('page') || 'welcome.htm') || 'welcome.htm';
  }

  function navigateFromHash() {
    const requested = currentFromHash();
    const item = state.byPath.get(requested) || null;
    const exactPath = item ? item.link : requested;
    state.activePath = requested;
    expandActiveTrail(item);

    renderTree();
    renderBreadcrumbs(item, requested);
    updatePageNavigation(item);
    elements().original.href = new URL('../' + encodePath(exactPath), document.baseURI).href;
    loadArticle(exactPath, item);
  }

  function renderBreadcrumbs(item, requested) {
    const el = elements().breadcrumbs;
    el.replaceChildren();

    const home = document.createElement('a');
    home.href = makePageHash('welcome.htm');
    home.dataset.manualPath = 'welcome.htm';
    home.textContent = 'docs';
    el.appendChild(home);

    if (!item) {
      const unknown = document.createElement('span');
      unknown.textContent = requested;
      el.appendChild(unknown);
      return;
    }

    item.trail.forEach((part, index) => {
      const span = document.createElement('span');
      if (part.link && index < item.trail.length - 1) {
        const link = document.createElement('a');
        link.href = makePageHash(part.link);
        link.dataset.manualPath = part.link;
        link.textContent = part.title;
        span.appendChild(link);
      } else {
        span.textContent = part.title;
      }
      el.appendChild(span);
    });
  }

  function updatePageNavigation(item) {
    const index = item ? state.flat.indexOf(item) : -1;
    configurePageLink(elements().previous, index > 0 ? state.flat[index - 1] : null, 'Previous');
    configurePageLink(elements().next, index >= 0 && index < state.flat.length - 1 ? state.flat[index + 1] : null, 'Next');
  }

  function configurePageLink(anchor, item, label) {
    if (!item) {
      anchor.hidden = true;
      anchor.removeAttribute('href');
      anchor.replaceChildren();
      return;
    }

    anchor.hidden = false;
    anchor.href = makePageHash(item.link);
    anchor.dataset.manualPath = item.link;
    anchor.innerHTML = '<small>' + label + '</small><span>' + escapeHtml(item.title) + '</span>';
  }

  async function loadArticle(path, item) {
    const el = elements();
    const token = ++state.loadToken;
    el.loading.hidden = false;
    el.body.replaceChildren();
    el.outline.hidden = true;
    el.outlineLinks.replaceChildren();

    try {
      const result = await fetchManualFile(path);
      if (token !== state.loadToken) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(result.html, 'text/html');
      const source = doc.querySelector('.page_body') || doc.querySelector('#tdpage') || doc.querySelector('main') || doc.body;
      if (!source) throw new Error('The article file did not contain readable HTML.');

      const clone = document.createElement('div');
      clone.className = 'legacy-article';
      clone.innerHTML = source.innerHTML;
      cleanArticle(clone, result.url);

      const title = item ? item.title : extractTitle(clone, doc, path);
      removeDuplicateHeading(clone, title);

      const heading = document.createElement('h1');
      heading.className = 'article-title';
      heading.textContent = title;

      const sourceLine = document.createElement('p');
      sourceLine.className = 'article-source';
      sourceLine.textContent = path + (result.fallback ? ' · loaded from repository fallback' : '');

      el.body.append(heading, sourceLine, clone);
      el.loading.hidden = true;
      document.title = title + ' — ASPDotNetStorefront Developer Documentation';
      buildOutline(el.body);
      el.article.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (error) {
      if (token !== state.loadToken) return;
      el.loading.hidden = true;
      renderLoadError(path, error);
    }
  }

  async function fetchManualFile(path) {
    const encodedPath = encodePath(path);
    const pageUrl = new URL('../' + encodedPath, document.baseURI).href;
    const rawUrl = RAW_BASE + encodedPath;
    const attempts = [
      { url: pageUrl, fallback: false },
      { url: rawUrl, fallback: true }
    ];
    const errors = [];

    for (const attempt of attempts) {
      try {
        const response = await fetch(attempt.url, { cache: 'no-store', credentials: 'omit' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const html = await response.text();
        if (!html || /<title>\s*(Page not found|404)\s*<\/title>/i.test(html)) throw new Error('Page-not-found response');
        return { html, url: attempt.url, fallback: attempt.fallback };
      } catch (error) {
        errors.push(attempt.url + ' (' + error.message + ')');
      }
    }

    throw new Error(errors.join(' | '));
  }

  function cleanArticle(root, baseUrl) {
    root.querySelectorAll('script, style, link, meta, iframe, object, embed, noscript, .pageprop').forEach(node => node.remove());
    root.querySelectorAll('.var_breadcrumbs, #google_translate_element, .search_container, .print_button, .bookmark_button').forEach(node => {
      const parent = node.closest('p');
      (parent || node).remove();
    });
    root.querySelectorAll('[id="txtsearch"]').forEach(node => node.remove());

    root.querySelectorAll('[src]').forEach(node => {
      const value = node.getAttribute('src');
      if (!value || /^(data:|blob:|javascript:)/i.test(value)) return;
      try { node.setAttribute('src', new URL(value, baseUrl).href); } catch (_error) { /* preserve original */ }
    });

    root.querySelectorAll('a[href]').forEach(anchor => {
      const value = anchor.getAttribute('href');
      if (!value) return;

      if (/^javascript:/i.test(value)) {
        anchor.removeAttribute('href');
        return;
      }

      if (/^(mailto:|tel:)/i.test(value)) return;

      if (value.startsWith('#')) {
        anchor.href = '#';
        anchor.dataset.manualAnchor = value.slice(1);
        return;
      }

      try {
        const url = new URL(value, baseUrl);
        const path = normalizePath(url.pathname);
        if (/\.html?$/i.test(path)) {
          anchor.href = makePageHash(path);
          anchor.dataset.manualPath = path;
          anchor.removeAttribute('target');
          anchor.removeAttribute('rel');
        } else {
          anchor.href = url.href;
          anchor.target = '_blank';
          anchor.rel = 'noopener';
        }
      } catch (_error) {
        // Leave unusual but valid legacy links unchanged.
      }
    });
  }

  function extractTitle(root, doc, path) {
    const heading = root.querySelector('.heading, h1, h2');
    if (heading && heading.textContent.trim()) return heading.textContent.trim();
    if (doc.title && !/^aspdnsf\s*-\s*1000$/i.test(doc.title.trim())) return doc.title.trim();
    return path.replace(/\.html?$/i, '').replace(/[_-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
  }

  function removeDuplicateHeading(content, title) {
    const first = content.querySelector('.heading, h1');
    if (first && normalizeText(first.textContent) === normalizeText(title)) {
      const parent = first.closest('p');
      (parent || first).remove();
    }
  }

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function buildOutline(content) {
    const el = elements();
    const headings = Array.from(content.querySelectorAll('h2, h3, h4, .heading'))
      .filter(heading => heading.textContent.trim() && !heading.classList.contains('article-title'));
    const seen = new Set();
    el.outlineLinks.replaceChildren();

    headings.forEach((heading, index) => {
      let slug = heading.id || slugify(heading.textContent) || ('section-' + (index + 1));
      const base = slug;
      let suffix = 2;
      while (seen.has(slug)) slug = base + '-' + suffix++;
      seen.add(slug);
      heading.id = slug;

      const link = document.createElement('a');
      link.href = '#';
      link.dataset.manualAnchor = slug;
      link.textContent = heading.textContent.trim();
      if (heading.matches('h3, h4')) link.className = 'level-3';
      el.outlineLinks.appendChild(link);
    });

    el.outline.hidden = headings.length === 0;
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 70);
  }

  function renderLoadError(path, error) {
    const el = elements();
    const directUrl = new URL('../' + encodePath(path), document.baseURI).href;
    const rawUrl = RAW_BASE + encodePath(path);
    el.body.innerHTML =
      '<div class="error-box">' +
      '<strong>Unable to load this documentation file.</strong><br><br>' +
      '<code>' + escapeHtml(path) + '</code><br><br>' +
      escapeHtml(error.message) + '<br><br>' +
      '<a href="' + escapeHtml(directUrl) + '" target="_blank" rel="noopener">Open published file</a><br>' +
      '<a href="' + escapeHtml(rawUrl) + '" target="_blank" rel="noopener">Open repository file</a>' +
      '</div>';
  }

  function setTextSize(value) {
    state.textSize = Math.max(14, Math.min(22, value));
    document.documentElement.style.setProperty('--article-size', state.textSize + 'px');
    try { localStorage.setItem('manualTextSize', String(state.textSize)); } catch (_error) { /* storage can be unavailable */ }
  }

  function openMenu() {
    const el = elements();
    document.body.classList.add('nav-open');
    el.menuButton.setAttribute('aria-expanded', 'true');
    el.contents.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => el.closeMenuButton.focus());
  }

  function closeMenu(options) {
    if (!isMobile()) return;
    const settings = options || {};
    const el = elements();
    document.body.classList.remove('nav-open');
    el.menuButton.setAttribute('aria-expanded', 'false');
    el.contents.setAttribute('aria-hidden', 'true');
    if (settings.restoreFocus) el.menuButton.focus();
  }

  function syncResponsiveState() {
    const el = elements();

    if (isMobile()) {
      applyMobileCollapseDefaults();
      el.contents.setAttribute('aria-hidden', document.body.classList.contains('nav-open') ? 'false' : 'true');
    } else {
      document.body.classList.remove('nav-open');
      el.menuButton.setAttribute('aria-expanded', 'false');
      el.contents.removeAttribute('aria-hidden');
    }

    renderTree();
  }

  function bindEvents() {
    const el = elements();
    let resizeTimer = null;

    window.addEventListener('hashchange', navigateFromHash);
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(syncResponsiveState, 120);
    });

    let searchTimer = null;
    el.search.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(renderSearchResults, 120);
    });
    el.clearSearch.addEventListener('click', () => {
      el.search.value = '';
      renderSearchResults();
      el.search.focus();
    });

    el.menuButton.addEventListener('click', openMenu);
    el.closeMenuButton.addEventListener('click', () => closeMenu({ restoreFocus: true }));
    el.scrim.addEventListener('click', () => closeMenu({ restoreFocus: true }));

    document.getElementById('printButton').addEventListener('click', () => window.print());
    document.getElementById('decreaseText').addEventListener('click', () => setTextSize(state.textSize - 1));
    document.getElementById('increaseText').addEventListener('click', () => setTextSize(state.textSize + 1));

    document.addEventListener('click', event => {
      const toggle = event.target.closest('[data-toggle-topic]');
      if (toggle) {
        event.preventDefault();
        toggleTreeItem(toggle.dataset.toggleTopic);
        return;
      }

      const anchorLink = event.target.closest('a[data-manual-anchor]');
      if (anchorLink) {
        event.preventDefault();
        const target = document.getElementById(anchorLink.dataset.manualAnchor);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      const pageLink = event.target.closest('a[data-manual-path]');
      if (pageLink) {
        event.preventDefault();
        const path = pageLink.dataset.manualPath;
        const newHash = 'page=' + encodeURIComponent(path);
        if (location.hash.replace(/^#/, '') === newHash) navigateFromHash();
        else location.hash = newHash;
        closeMenu();
      }
    });

    document.addEventListener('keydown', event => {
      const tag = document.activeElement && document.activeElement.tagName;

      if (event.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !isMobile()) {
        event.preventDefault();
        el.search.focus();
      }

      if (event.key === 'Escape') {
        if (document.body.classList.contains('nav-open')) {
          closeMenu({ restoreFocus: true });
          return;
        }

        if (document.activeElement === el.search && el.search.value) {
          el.search.value = '';
          renderSearchResults();
        }
      }
    });
  }

  function start() {
    state.root = window.foldersTree;
    if (!state.root || !Array.isArray(state.root.children)) {
      elements().loading.hidden = true;
      elements().body.innerHTML = '<div class="error-box">The original table of contents could not be initialized.</div>';
      return;
    }

    indexTree();
    state.activePath = currentFromHash();
    applyMobileCollapseDefaults();
    renderTree();
    renderSearchResults();
    bindEvents();
    setTextSize(state.textSize);
    document.documentElement.dataset.readerBuild = BUILD;
    syncResponsiveState();

    if (!location.hash) history.replaceState(null, '', makePageHash('welcome.htm'));
    navigateFromHash();
  }

  window.ManualReader = { start, build: BUILD };
}());
