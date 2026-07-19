(function () {
  'use strict';

  const tree = document.getElementById('manualTree');
  if (!tree) return;

  let finished = false;
  let settleTimer = null;

  function labelFor(row) {
    const label = row.querySelector('.tree-link, .tree-label');
    return label ? label.textContent.trim().toLowerCase() : '';
  }

  function applyNextDefault() {
    if (finished) return;

    const rootList = tree.querySelector(':scope > .tree-list');
    if (!rootList) return;

    const folderItems = Array.from(tree.querySelectorAll('.tree-item.has-children'));

    for (const item of folderItems) {
      const row = item.querySelector(':scope > .tree-row');
      const toggle = row && row.querySelector('.tree-toggle');
      if (!toggle) continue;

      const isTopLevel = item.parentElement === rootList;
      const isWsiNodes = labelFor(row) === 'wsi nodes';
      const shouldBeExpanded = !isTopLevel && !isWsiNodes;
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

      if (isExpanded !== shouldBeExpanded) {
        toggle.click();
        return;
      }
    }

    finished = true;
    observer.disconnect();
  }

  function scheduleApply() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(applyNextDefault, 0);
  }

  const observer = new MutationObserver(scheduleApply);
  observer.observe(tree, { childList: true, subtree: true });
  scheduleApply();
}());
