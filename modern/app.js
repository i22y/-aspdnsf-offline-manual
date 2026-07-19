(function () {
  'use strict';

  const state = {
    root: null,
    activePath: 'welcome.htm',
    expanded: new Set(),
    flat: [],
    byPath: new Map(),
    search: '',
    textSize: readTextSize()
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

  function decodeTitle(value) {
    entities.innerHTML = String(value || '').replace(/&nbsp;/gi, ' ');
    return entities.value.replace(/\s+/g, ' ').trim();
  }

  function normalizePath(value) {
    if (!value) return '';
    const clean = String(value).split('#')[0].split('?')[0];
    return clean.substring(clean.lastIndexOf('/') + 1).toLowerCase();
  }

  function node(type, title, link) {
    return {
      type,
      title: decodeTitle(title),
      link: link || '',
      path: normalizePath(link),
      children: [],
      parent: null,
      id: Math.random().toString(36).slice(2)
    };
  }

  // Adapter functions consumed by the legacy contents_data.js file.
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
      status: document.getElementById('searchStatus'),
      frame: document.getElementById('legacyFrame'),
      body: document.getElementById('articleBody'),
      loading: document.getElementById('loadingState'),
      breadcrumbs: document.getElementById('breadcrumbs'),
      outline: document.getElementById('outline'),
      outlineLinks: document.getElementById('outlineLinks'),
      previous: document.getElementById('previousPage'),
      next: document.getElementById('nextPage'),
      original: document.getElementById('originalLink'),
      menu: document.getElementById('menuButton'),
      scrim: document.getElementById('scrim')
    };
  }

  function indexTree() {
    state.flat = [];
    state.byPath.clear();

    function walk(item, ancestors) {
      const trail = ancestors.concat(item);
      if (item.link && item.path) {
        item.trail = trail;
        state.flat.push(item);
        if (!state.byPath.has(item.path)) state.byPath.set(item.path, item);
      }
      item.children.forEach(child => walk(child, trail));
    }

    state.root.children.forEach(child => walk(child, []));
  }

  function highlight(text, query) {
    if (!query) return escapeHtml(text);
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index < 0) return escapeHtml(text);
    return escapeHtml(text.slice(0, index)) + '<mark>' + escapeHtml(text.slice(index, index + query.length)) + '</mark>' + escapeHtml(text.slice(index + query.length));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function matchingCount(item, query) {
    let count = item.title.toLowerCase().includes(query) ? 1 : 0;
    item.children.forEach(child => { count += matchingCount(child, query); });
    return count;
  }

  function renderTree() {
    const el = elements();
    const query = state.search.trim().toLowerCase();
    let totalMatches = 0;

    function renderItems(items) {
      const list = document.createElement('ul');
      list.className = 'tree-list';

      items.forEach(item => {
        const subtreeMatches = query ? matchingCount(item, query) : 1;
        if (query && subtreeMatches === 0) return;
        if (query) totalMatches += item.title.toLowerCase().includes(query) ? 1 : 0;

        const li = document.createElement('li');
        const row = document.createElement('div');
        row.className = 'tree-row';
        const hasChildren = item.children.length > 0;
        const isOpen = query ? true : state.expanded.has(item.id);

        if (hasChildren) {
          const toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.className = 'tree-toggle';
          toggle.setAttribute('aria-label', (isOpen ? 'Collapse ' : 'Expand ') + item.title);
          toggle.setAttribute('aria-expanded', String(isOpen));
          toggle.addEventListener('click', () => {
            if (state.expanded.has(item.id)) state.expanded.delete(item.id);
            else state.expanded.add(item.id);
            renderTree();
          });
          row.appendChild(toggle);
        } else {
          const spacer = document.createElement('span');
          spacer.className = 'tree-toggle-spacer';
          row.appendChild(spacer);
        }

        if (item.link) {
          const link = document.createElement('a');
          link.className = 'tree-link' + (item.path === state.activePath ? ' active' : '');
          link.href = '#page=' + encodeURIComponent(item.link);
          link.innerHTML = highlight(item.title, query);
          link.title = item.title;
          link.addEventListener('click', () => closeMobileNav());
          row.appendChild(link);
        } else {
          const label = document.createElement('span');
          label.className = 'tree-link';
          label.innerHTML = highlight(item.title, query);
          row.appendChild(label);
        }

        li.appendChild(row);
        if (hasChildren && isOpen) li.appendChild(renderItems(item.children));
        list.appendChild(li);
      });

      return list;
    }

    el.tree.replaceChildren(renderItems(state.root.children));
    el.status.textContent = query ? (totalMatches + (totalMatches === 1 ? ' matching topic' : ' matching topics')) : (state.flat.length + ' topics');
  }

  function openAncestors(item) {
    let current = item && item.parent;
    while (current) {
      state.expanded.add(current.id);
      current = current.parent;
    }
  }

  function currentFromHash() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    return normalizePath(params.get('page') || 'welcome.htm') || 'welcome.htm';
  }

  function navigateFromHash() {
    const requested = currentFromHash();
    const item = state.byPath.get(requested);
    state.activePath = item ? item.path : requested;
    if (item) openAncestors(item);
    renderTree();
    renderBreadcrumbs(item);
    updatePageNavigation(item);
    elements().original.href = '../' + (item ? item.link : requested);

    if (requested === 'welcome.htm') {
      renderHome();
      return;
    }

    loadLegacyPage(item ? item.link : requested);
  }

  function renderBreadcrumbs(item) {
    const el = elements().breadcrumbs;
    el.replaceChildren();

    const home = document.createElement('a');
    home.href = '#page=welcome.htm';
    home.textContent = 'Manual';
    el.appendChild(home);

    if (!item) return;
    item.trail.forEach((part, index) => {
      const span = document.createElement('span');
      if (index === item.trail.length - 1 || !part.link) {
        span.textContent = part.title;
      } else {
        const link = document.createElement('a');
        link.href = '#page=' + encodeURIComponent(part.link);
        link.textContent = part.title;
        span.appendChild(link);
      }
      el.appendChild(span);
    });
  }

  function updatePageNavigation(item) {
    const el = elements();
    const index = item ? state.flat.indexOf(item) : -1;
    configurePageLink(el.previous, index > 0 ? state.flat[index - 1] : null, 'Previous');
    configurePageLink(el.next, index >= 0 && index < state.flat.length - 1 ? state.flat[index + 1] : null, 'Next');
  }

  function configurePageLink(anchor, item, label) {
    if (!item) {
      anchor.hidden = true;
      anchor.removeAttribute('href');
      anchor.textContent = '';
      return;
    }
    anchor.hidden = false;
    anchor.href = '#page=' + encodeURIComponent(item.link);
    anchor.innerHTML = '<small>' + label + '</small><span>' + escapeHtml(item.title) + '</span>';
  }

  function renderHome() {
    const el = elements();
    el.frame.src = 'about:blank';
    el.loading.hidden = true;
    el.outline.hidden = true;
    el.body.innerHTML = '';

    const hero = document.createElement('section');
    hero.className = 'home-hero';
    hero.innerHTML = '<h1>ASPDotNetStorefront 10 Manual</h1><p>A cleaner way to browse the complete offline documentation. Search by topic, expand the organized table of contents, and read every article in a focused layout.</p>';
    el.body.appendChild(hero);

    const grid = document.createElement('div');
    grid.className = 'home-grid';
    state.root.children.filter(item => item.title && item.link).forEach(item => {
      const card = document.createElement('a');
      card.className = 'home-card';
      card.href = '#page=' + encodeURIComponent(item.link);
      const count = countLinkedDescendants(item);
      card.innerHTML = '<strong>' + escapeHtml(item.title) + '</strong><span>' + count + (count === 1 ? ' article' : ' articles') + '</span>';
      grid.appendChild(card);
    });
    el.body.appendChild(grid);
    document.title = 'ASPDotNetStorefront 10 Manual — Modern Reader';
    document.getElementById('article').focus({ preventScroll: true });
  }

  function countLinkedDescendants(item) {
    let count = item.link ? 1 : 0;
    item.children.forEach(child => { count += countLinkedDescendants(child); });
    return count;
  }

  function loadLegacyPage(path) {
    const el = elements();
    el.body.innerHTML = '';
    el.loading.hidden = false;
    el.outline.hidden = true;
    el.frame.src = '../' + path;
  }

  function frameLoaded() {
    const el = elements();
    if (!el.frame.src || el.frame.src === 'about:blank') return;

    try {
      const doc = el.frame.contentDocument;
      if (!doc || !doc.body) throw new Error('The article document could not be read.');
      const source = doc.querySelector('.page_body') || doc.querySelector('#tdpage') || doc.body;
      const clone = document.createElement('div');
      clone.className = 'legacy-article';
      clone.innerHTML = source.innerHTML;
      cleanArticle(clone, el.frame.contentWindow.location.href);
      const item = state.byPath.get(state.activePath);
      const title = item ? item.title : extractTitle(clone, doc);

      el.body.innerHTML = '';
      const kicker = document.createElement('p');
      kicker.className = 'article-kicker';
      kicker.textContent = item && item.parent ? item.parent.title : 'Documentation';
      const heading = document.createElement('h1');
      heading.className = 'article-title';
      heading.textContent = title;
      const content = document.createElement('div');
      content.className = 'article-content';
      content.appendChild(clone);

      removeDuplicateHeading(content, title);
      el.body.append(kicker, heading, content);
      el.loading.hidden = true;
      document.title = title + ' — ASPDotNetStorefront Manual';
      buildOutline(content);
      document.getElementById('article').focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (error) {
      el.loading.hidden = true;
      el.body.innerHTML = '<div class="error-box"><strong>This article could not be loaded in the modern reader.</strong><br>' + escapeHtml(error.message) + '<br><br><a href="../' + encodeURI(state.activePath) + '">Open the original article</a></div>';
    }
  }

  function cleanArticle(root, baseUrl) {
    root.querySelectorAll('script, style, link, meta, iframe, object, embed, .pageprop').forEach(node => node.remove());
    root.querySelectorAll('.var_breadcrumbs').forEach(node => {
      const parent = node.closest('p');
      (parent || node).remove();
    });
    root.querySelectorAll('[id="txtsearch"], #google_translate_element, .search_container').forEach(node => node.remove());

    root.querySelectorAll('[src]').forEach(node => {
      const value = node.getAttribute('src');
      if (!value || value.startsWith('data:') || value.startsWith('javascript:')) return;
      try { node.setAttribute('src', new URL(value, baseUrl).href); } catch (_error) { /* keep original */ }
    });

    root.querySelectorAll('a[href]').forEach(anchor => {
      const value = anchor.getAttribute('href');
      if (!value || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('javascript:')) return;
      if (value.startsWith('#')) {
        anchor.href = '#';
        anchor.dataset.manualAnchor = value.slice(1);
        return;
      }
      try {
        const url = new URL(value, baseUrl);
        const path = normalizePath(url.pathname);
        if (/\.html?$/i.test(path) && state.byPath.has(path)) {
          anchor.href = '#page=' + encodeURIComponent(path);
          anchor.dataset.manualPath = path;
          anchor.removeAttribute('target');
        } else {
          anchor.href = url.href;
          anchor.target = '_blank';
          anchor.rel = 'noopener';
        }
      } catch (_error) { /* keep original */ }
    });
  }

  function extractTitle(root, doc) {
    const heading = root.querySelector('.heading, h1, h2');
    return heading ? heading.textContent.trim() : (doc.title || 'Manual article').replace(/^ASPDNSF\s*-\s*/i, '');
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
    const headings = Array.from(content.querySelectorAll('h1, h2, h3, .heading')).filter(heading => heading.textContent.trim());
    const seen = new Set();
    el.outlineLinks.replaceChildren();

    headings.slice(0, 18).forEach((heading, index) => {
      let slug = slugify(heading.textContent) || ('section-' + (index + 1));
      while (seen.has(slug)) slug += '-2';
      seen.add(slug);
      heading.id = heading.id || slug;
      const link = document.createElement('a');
      link.href = '#';
      link.dataset.manualAnchor = heading.id;
      link.textContent = heading.textContent.trim();
      if (heading.matches('h3')) link.className = 'level-3';
      el.outlineLinks.appendChild(link);
    });

    el.outline.hidden = headings.length < 2;
  }

  function slugify(value) {
    return value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);
  }

  function setTextSize(value) {
    state.textSize = Math.max(14, Math.min(22, value));
    document.documentElement.style.setProperty('--article-size', state.textSize + 'px');
    try { localStorage.setItem('manualTextSize', String(state.textSize)); } catch (_error) { /* storage may be unavailable */ }
  }

  function openMobileNav() {
    document.body.classList.add('nav-open');
    elements().menu.setAttribute('aria-expanded', 'true');
  }

  function closeMobileNav() {
    document.body.classList.remove('nav-open');
    elements().menu.setAttribute('aria-expanded', 'false');
  }

  function bindEvents() {
    const el = elements();
    window.addEventListener('hashchange', navigateFromHash);
    el.frame.addEventListener('load', frameLoaded);
    el.search.addEventListener('input', event => {
      state.search = event.target.value;
      renderTree();
    });
    el.menu.addEventListener('click', () => document.body.classList.contains('nav-open') ? closeMobileNav() : openMobileNav());
    el.scrim.addEventListener('click', closeMobileNav);
    document.getElementById('printButton').addEventListener('click', () => window.print());
    document.getElementById('decreaseText').addEventListener('click', () => setTextSize(state.textSize - 1));
    document.getElementById('increaseText').addEventListener('click', () => setTextSize(state.textSize + 1));

    document.addEventListener('click', event => {
      const anchorLink = event.target.closest('a[data-manual-anchor]');
      if (anchorLink) {
        event.preventDefault();
        const target = document.getElementById(anchorLink.dataset.manualAnchor);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      const pageLink = event.target.closest('a[data-manual-path]');
      if (!pageLink) return;
      event.preventDefault();
      location.hash = 'page=' + encodeURIComponent(pageLink.dataset.manualPath);
    });

    document.addEventListener('keydown', event => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (event.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        event.preventDefault();
        el.search.focus();
      }
      if (event.key === 'Escape') {
        closeMobileNav();
        if (document.activeElement === el.search && el.search.value) {
          el.search.value = '';
          state.search = '';
          renderTree();
        }
      }
    });
  }

  function start() {
    state.root = window.foldersTree;
    if (!state.root || !Array.isArray(state.root.children)) {
      elements().loading.hidden = true;
      elements().body.innerHTML = '<div class="error-box">The table of contents could not be initialized.</div>';
      return;
    }

    indexTree();
    bindEvents();
    setTextSize(state.textSize);
    if (!location.hash) history.replaceState(null, '', '#page=welcome.htm');
    navigateFromHash();
  }

  window.ManualReader = { start };
}());
