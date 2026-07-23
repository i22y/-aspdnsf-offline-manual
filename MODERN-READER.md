# ASPDotNetStorefront Manual — Modern Reader

This branch contains a separate reading interface for the archived ASPDotNetStorefront 10 manual.

## Start here

Open `modern/index.html`.

The original manual files remain unchanged. The modern reader uses the existing `contents_data.js`, HTML articles, images, and downloads already stored in this repository.

## Improvements

- Full-text search across every manual page (with highlighted snippets), not just topic titles
- Searchable, collapsible table of contents
- Cleaner typography and focused article width
- Breadcrumb navigation
- Previous and next article controls
- Automatic on-page outline for longer articles
- Adjustable article text size
- Responsive mobile navigation
- Print-friendly article layout
- Link to the untouched original page from every article

## Full-text search index

Search matches topic titles instantly, then lazy-loads `modern/search-index.js` (a pre-built full-text index of every article body) the first time you type a query. If any manual `*.htm` page changes, rebuild the index:

```bash
node modern/build-search-index.mjs
```

Commit the regenerated `modern/search-index.js` along with the page changes.

## Branch separation

The `main` branch is the preserved original offline manual. This `modern-reader` branch is the alternate version.

## GitHub Pages

Publish this branch from `/(root)`. The root `index.html` redirects visitors to the modern reader.
