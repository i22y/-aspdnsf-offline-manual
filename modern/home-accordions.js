(function () {
  'use strict';

  const HOME_SELECTOR = '.manual-home-grid';

  function transformHomeDirectory(root) {
    const grid = root.querySelector(HOME_SELECTOR);
    if (!grid || grid.dataset.accordionsReady === 'true') return;

    const intro = root.querySelector('.manual-home-intro p');
    if (intro) {
      intro.textContent = 'Every section is expanded so its articles are visible immediately. Release Notes stays collapsed until you need version history.';
    }

    const cards = Array.from(grid.children);

    cards.forEach(card => {
      if (!card.classList.contains('manual-home-card') || card.tagName === 'DETAILS') return;

      const titleLink = card.querySelector('.manual-home-card-title a');
      const description = card.querySelector('.manual-home-card-description');
      const number = card.querySelector('.manual-home-card-number');
      const links = card.querySelector('.manual-home-links');
      const title = titleLink ? titleLink.textContent.trim() : 'Documentation section';

      const details = document.createElement('details');
      details.className = card.className;
      details.open = title.toLowerCase() !== 'release notes';

      const summary = document.createElement('summary');
      summary.className = 'manual-home-summary';

      const copy = document.createElement('span');
      copy.className = 'manual-home-summary-copy';

      const heading = document.createElement('span');
      heading.className = 'manual-home-card-title';
      heading.textContent = title;
      copy.appendChild(heading);

      if (description) {
        const summaryDescription = document.createElement('span');
        summaryDescription.className = 'manual-home-card-description';
        summaryDescription.textContent = description.textContent.trim();
        copy.appendChild(summaryDescription);
      }

      const meta = document.createElement('span');
      meta.className = 'manual-home-card-meta';

      if (number) {
        const sectionNumber = document.createElement('span');
        sectionNumber.className = 'manual-home-card-number';
        sectionNumber.textContent = number.textContent.trim();
        meta.appendChild(sectionNumber);
      }

      const toggle = document.createElement('span');
      toggle.className = 'manual-home-toggle';
      toggle.setAttribute('aria-hidden', 'true');
      meta.appendChild(toggle);

      summary.append(copy, meta);

      const content = document.createElement('div');
      content.className = 'manual-home-card-content';

      if (titleLink) {
        const overview = document.createElement('p');
        overview.className = 'manual-home-overview';

        const overviewLink = titleLink.cloneNode(true);
        overviewLink.textContent = 'Open ' + title + ' overview';
        overview.appendChild(overviewLink);
        content.appendChild(overview);
      }

      if (links) content.appendChild(links);

      details.append(summary, content);
      card.replaceWith(details);
    });

    grid.dataset.accordionsReady = 'true';
  }

  function scan() {
    const articleBody = document.getElementById('articleBody');
    if (articleBody) transformHomeDirectory(articleBody);
  }

  const articleBody = document.getElementById('articleBody');

  if (articleBody) {
    new MutationObserver(scan).observe(articleBody, { childList: true, subtree: true });
  }

  scan();
}());
