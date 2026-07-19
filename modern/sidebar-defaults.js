(function () {
  'use strict';

  const tree = document.getElementById('manualTree');
  if (!tree) return;

  let finished = false;

  function closeReleaseNotesOnce() {
    if (finished) return;

    const rows = Array.from(tree.querySelectorAll('.tree-row'));
    const releaseRow = rows.find(row => {
      const label = row.querySelector('.tree-link, .tree-label');
      return label && label.textContent.trim().toLowerCase() === 'release notes';
    });

    if (!releaseRow) return;

    const toggle = releaseRow.querySelector('.tree-toggle');
    if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
      toggle.click();
    }

    finished = true;
    observer.disconnect();
  }

  const observer = new MutationObserver(closeReleaseNotesOnce);
  observer.observe(tree, { childList: true, subtree: true });
  closeReleaseNotesOnce();
}());
