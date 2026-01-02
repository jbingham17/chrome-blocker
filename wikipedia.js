// Wikipedia Link Remover
// Removes clickable links to other articles while preserving search functionality

(function() {
  'use strict';

  // Selectors for links we want to disable (article content links)
  const articleLinkSelectors = [
    // Main article content links
    '#mw-content-text a[href^="/wiki/"]',
    '#bodyContent a[href^="/wiki/"]',
    '.mw-parser-output a[href^="/wiki/"]',
    // Infobox links
    '.infobox a[href^="/wiki/"]',
    // Categories
    '#catlinks a[href^="/wiki/"]',
    // See also, references that link to other articles
    '.hatnote a[href^="/wiki/"]',
    '.navbox a[href^="/wiki/"]',
  ];

  // Selectors for links we want to KEEP functional
  const preserveSelectors = [
    // Search
    '#searchInput',
    '#searchButton',
    '#searchform',
    '.search-container',
    '#p-search',
    // Navigation/menu
    '#p-logo',
    '#p-navigation',
    '#mw-panel',
    '#mw-head',
    '.mw-header',
    // Edit functionality
    '#ca-edit',
    '#ca-viewsource',
    '.mw-editsection',
    // External links (not internal wiki links)
    '.external',
    // Login/account
    '#pt-login',
    '#pt-createaccount',
    '#p-personal',
    // Language links
    '#p-lang',
    '.interlanguage-link',
    // Footer
    '#footer',
    // Table of contents
    '#toc',
    '.toc',
    '#mw-panel-toc',
    // Tabs (article, talk, history, etc.)
    '.mw-list-item',
    '#p-views',
    '#p-namespaces',
    '#p-cactions',
    // Main page link
    '#p-logo a',
  ];

  // Check if an element or its parents match any preserve selector
  function shouldPreserve(element) {
    for (const selector of preserveSelectors) {
      if (element.matches(selector) || element.closest(selector)) {
        return true;
      }
    }
    // Preserve external links
    if (element.classList.contains('external') || element.classList.contains('extiw')) {
      return true;
    }
    // Preserve links that are not wiki article links
    const href = element.getAttribute('href');
    if (href && !href.startsWith('/wiki/')) {
      return true;
    }
    // Preserve special pages, file pages, etc.
    if (href && (
      href.includes('/wiki/Special:') ||
      href.includes('/wiki/File:') ||
      href.includes('/wiki/Help:') ||
      href.includes('/wiki/Wikipedia:') ||
      href.includes('/wiki/Template:') ||
      href.includes('/wiki/Category:') ||
      href.includes('/wiki/Portal:')
    )) {
      return true;
    }
    return false;
  }

  // Remove article links completely from DOM
  function removeArticleLinks() {
    // Find all links in article content
    document.querySelectorAll('a[href^="/wiki/"]').forEach(link => {
      // Skip if already processed
      if (link.dataset.wikiLinkRemoved === 'true') return;

      // Skip if should be preserved
      if (shouldPreserve(link)) return;

      // Mark as being processed (in case mutation observer fires during replacement)
      link.dataset.wikiLinkRemoved = 'true';

      // Create a span with the same content
      const span = document.createElement('span');
      span.innerHTML = link.innerHTML;

      // Copy over any classes (except link-specific ones)
      if (link.className) {
        span.className = link.className;
      }

      // Replace the link with the span
      link.parentNode.replaceChild(span, link);
    });
  }

  // Initial run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeArticleLinks);
  } else {
    removeArticleLinks();
  }

  // Watch for dynamic content
  const observer = new MutationObserver((mutations) => {
    if (observer.timeout) clearTimeout(observer.timeout);
    observer.timeout = setTimeout(removeArticleLinks, 100);
  });

  // Start observing when body is available
  function startObserver() {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      setTimeout(startObserver, 10);
    }
  }

  startObserver();

})();
