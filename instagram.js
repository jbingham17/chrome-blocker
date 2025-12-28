// Instagram Content Blocker
// Blocks feed while allowing search, explore, and profile viewing

(function() {
  'use strict';

  // Inject critical CSS immediately to hide stories and suggestions before render
  const criticalCSS = document.createElement('style');
  criticalCSS.textContent = `
    /* Immediate stories blocking - injected at document_start */
    div[aria-label*="Stories"],
    canvas[aria-label*="Stories"],
    a[href^="/stories/"],
    div:has(> div > div > canvas[height="66"]),
    div:has(> div > div > canvas[height="56"]),
    div:has(> ul > li canvas) {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* Hide "Suggested for you" See All link */
    a[href="/explore/people/"] {
      display: none !important;
    }
  `;
  (document.head || document.documentElement).appendChild(criticalCSS);

  // Block navigation to /stories/ URLs
  function blockStoriesNavigation() {
    // Intercept clicks on story elements
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/stories/"]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Also block clicks on canvas elements (story avatars)
      const canvas = e.target.closest('canvas');
      if (canvas && canvas.closest('div:not([role="dialog"])')) {
        const container = canvas.closest('div');
        if (container && !container.closest('article')) {
          // Likely a story avatar, check for story link nearby
          const parentLink = canvas.closest('a');
          if (parentLink && parentLink.href && parentLink.href.includes('/stories/')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
        }
      }
    }, true); // Use capture phase to intercept before other handlers

    // Block programmatic navigation to /stories/
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      if (args[2] && typeof args[2] === 'string' && args[2].includes('/stories/')) {
        console.log('[Blocker] Blocked navigation to stories');
        return;
      }
      return originalPushState.apply(this, args);
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function(...args) {
      if (args[2] && typeof args[2] === 'string' && args[2].includes('/stories/')) {
        console.log('[Blocker] Blocked navigation to stories');
        return;
      }
      return originalReplaceState.apply(this, args);
    };
  }

  // Run immediately
  blockStoriesNavigation();

  // Selectors for elements to hide (only on home feed)
  const HIDE_SELECTORS = [
    // Feed posts
    'article',
    // Stories - comprehensive selectors
    'div[role="menu"]',
    '[aria-label*="Stories"]',
    'a[href^="/stories/"]',
    'div:has(> div > div > canvas[height="66"])',
    'div:has(> div > div > canvas[height="56"])',
    // Suggested users sidebar
    'aside',
    // Reels nav link
    '[href*="/reels/"]',
    // Notification content
    '[aria-label="Notifications"] > div > div:not(:first-child)',
    // Suggested for you link
    'a[href="/explore/people/"]',
  ];

  // Get direct text content (not from children)
  function getDirectText(el) {
    let text = '';
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      }
    }
    return text.trim();
  }

  // Hide "Suggested for you" sections and "You're all caught up" by text content
  function hideSuggestionsAndCaughtUp() {
    // Find spans with exact "Suggested for you" text
    document.querySelectorAll('span').forEach(el => {
      const directText = getDirectText(el);
      const fullText = el.textContent?.trim();

      // Only match if this span directly contains the text (not inherited from children)
      if (directText === 'Suggested for you' || directText === 'Suggestions for you' ||
          (fullText === 'Suggested for you' && el.children.length === 0)) {
        // Find the suggestions container - go up until we find a reasonable boundary
        let container = el.parentElement;
        for (let i = 0; i < 8; i++) {
          if (container && container.parentElement) {
            const parent = container.parentElement;
            // Stop if we hit main structural elements
            if (parent.tagName === 'MAIN' || parent.tagName === 'BODY' ||
                parent.tagName === 'SECTION' || parent.getAttribute('role') === 'main') {
              break;
            }
            container = parent;
          }
        }
        if (container && container.tagName !== 'MAIN' && container.tagName !== 'BODY') {
          container.style.setProperty('display', 'none', 'important');
        }
      }

      // Hide "You're all caught up" message
      if (directText === "You're all caught up" ||
          (fullText === "You're all caught up" && el.children.length === 0)) {
        let container = el.parentElement;
        for (let i = 0; i < 5; i++) {
          if (container?.parentElement &&
              container.parentElement.tagName !== 'MAIN' &&
              container.parentElement.tagName !== 'BODY') {
            container = container.parentElement;
          }
        }
        if (container && container.tagName !== 'MAIN' && container.tagName !== 'BODY') {
          container.style.setProperty('display', 'none', 'important');
        }
      }
    });
  }

  // Selectors for elements to always keep visible
  const KEEP_SELECTORS = [
    'nav',
    'header',
    '[role="search"]',
    'input[aria-label*="Search"]',
    'input[placeholder*="Search"]',
    '[data-testid="search-results"]',
    '[role="listbox"]',
  ];

  // Check if current page is allowed (profile, explore, or post view)
  function isAllowedPage() {
    const path = window.location.pathname;

    // Block these paths
    const blockedPaths = ['/reels', '/direct', '/stories'];

    // Allow these paths explicitly
    const allowedPaths = ['/explore', '/p/'];

    // Home feed is blocked
    if (path === '/' || path === '') return false;

    // Check if explicitly blocked
    if (blockedPaths.some(blocked => path.startsWith(blocked))) return false;

    // Check if explicitly allowed (explore, individual posts)
    if (allowedPaths.some(allowed => path.startsWith(allowed))) return true;

    // Everything else (profile pages like /{username}/) is allowed
    return true;
  }

  // Alias for backward compatibility
  function isProfilePage() {
    return isAllowedPage();
  }

  // Check if on search results
  function isSearchActive() {
    return document.querySelector('[role="dialog"] input[aria-label*="Search"]') !== null ||
           document.querySelector('[data-testid="search-results"]') !== null;
  }

  // Hide unwanted elements
  function hideElements() {
    // Don't hide on profile pages (user navigated via search)
    if (isProfilePage()) {
      return;
    }

    HIDE_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Don't hide if it's part of search
        const isPartOfSearch = KEEP_SELECTORS.some(keepSel =>
          el.closest(keepSel) || el.querySelector(keepSel)
        );

        if (!isPartOfSearch) {
          el.style.setProperty('display', 'none', 'important');
        }
      });
    });
  }

  // Show blocked message
  function showBlockedMessage() {
    if (isProfilePage() || isSearchActive()) return;

    const main = document.querySelector('main[role="main"]');
    if (main && !document.getElementById('blocker-message')) {
      const existingContent = main.querySelector('section > main');
      if (existingContent) {
        existingContent.style.setProperty('visibility', 'hidden', 'important');
      }

      const message = document.createElement('div');
      message.id = 'blocker-message';
      message.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        height: 60vh;
        font-size: 20px;
        color: #8e8e8e;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        text-align: center;
        padding: 20px;
      `;
      message.textContent = 'Feed blocked — Use search to find people';

      // Insert at beginning of main
      if (!main.querySelector('#blocker-message')) {
        main.insertBefore(message, main.firstChild);
      }
    }
  }

  // Remove blocked message when on allowed pages
  function removeBlockedMessage() {
    const message = document.getElementById('blocker-message');
    if (message && (isProfilePage() || isSearchActive())) {
      message.remove();
      const main = document.querySelector('main[role="main"] section > main');
      if (main) {
        main.style.removeProperty('visibility');
      }
    }
  }

  // Run blocker
  function runBlocker() {
    hideElements();
    // Always hide suggestions, even on profile pages
    hideSuggestionsAndCaughtUp();
    if (isProfilePage()) {
      removeBlockedMessage();
    } else {
      showBlockedMessage();
    }
  }

  // Initial run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBlocker);
  } else {
    runBlocker();
  }

  // Watch for dynamic content (Instagram is a SPA)
  const observer = new MutationObserver((mutations) => {
    runBlocker();
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

  // Also run on navigation (SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(runBlocker, 100);
    }
  }).observe(document, { subtree: true, childList: true });

})();
