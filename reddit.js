// Reddit Content Blocker
// Blocks homepage and non-whitelisted subreddits

(function() {
  'use strict';

  // CONFIGURE YOUR WHITELISTED SUBREDDITS HERE
  // Add subreddit names without the r/ prefix
  const WHITELISTED_SUBREDDITS = [
    'claudeai',
    'claudecode',
    'claudexplorers',
    'cscareerquestions',
    'salesengineers',
    'k12sysadmin'
  ];

  // Normalize subreddit names for comparison
  const normalizedWhitelist = WHITELISTED_SUBREDDITS.map(s => s.toLowerCase());

  // Track if user arrived from external source
  const initialReferrer = document.referrer;
  const isExternalReferral = !initialReferrer || !initialReferrer.includes('reddit.com');
  const entryUrl = window.location.href;

  // Check if URL is a thread/comments page
  function isThreadPage(path) {
    return path.includes('/comments/');
  }

  // Check if this page was accessed externally (and is a thread)
  function isExternalThreadAccess() {
    const path = window.location.pathname.toLowerCase();
    // Only allow if: came from external site AND landed on a thread AND still on that thread
    return isExternalReferral && isThreadPage(entryUrl) && isThreadPage(path);
  }

  // Check if current page is a whitelisted subreddit
  function isWhitelistedSubreddit() {
    const path = window.location.pathname.toLowerCase();

    // Match /r/subredditname or /r/subredditname/...
    const subredditMatch = path.match(/^\/r\/([^\/]+)/);

    if (!subredditMatch) return false;

    const subreddit = subredditMatch[1];
    return normalizedWhitelist.includes(subreddit);
  }

  // Check if on a blocked page
  function isBlockedPage() {
    const path = window.location.pathname.toLowerCase();

    // Allow threads accessed from external links
    if (isExternalThreadAccess()) return false;

    // Block homepage
    if (path === '/' || path === '') return true;

    // Block /r/popular, /r/all, /r/home
    if (path === '/r/popular' || path.startsWith('/r/popular/')) return true;
    if (path === '/r/all' || path.startsWith('/r/all/')) return true;
    if (path === '/r/home' || path.startsWith('/r/home/')) return true;

    // Block if it's a subreddit page that's not whitelisted
    const subredditMatch = path.match(/^\/r\/([^\/]+)/);
    if (subredditMatch && !isWhitelistedSubreddit()) return true;

    // Block these general paths
    const blockedPaths = ['/best', '/hot', '/new', '/top', '/rising'];
    if (blockedPaths.some(blocked => path === blocked || path.startsWith(blocked + '/'))) return true;

    return false;
  }

  // Check if on user profile or settings (allow these)
  function isAllowedUtilityPage() {
    const path = window.location.pathname.toLowerCase();

    // Allow user pages, settings, messages, etc.
    const allowedPrefixes = ['/user/', '/settings', '/message/', '/prefs', '/wiki/'];
    return allowedPrefixes.some(prefix => path.startsWith(prefix));
  }

  // Hide feed content and suggestions
  function hideContent() {
    if (!isBlockedPage()) return;

    // Selectors for feed content to hide
    const hideSelectors = [
      // Main feed
      '[data-testid="post-container"]',
      'shreddit-post',
      'faceplate-partial[src*="listing"]',
      // Suggested/popular content
      '[data-testid="frontpage-sidebar"]',
      '#SHORTCUT_FOCUSABLE_DIV > div:not(nav)',
      // Feed container
      '.ListingLayout-outerContainer',
      'main[role="main"]',
      // New Reddit feed
      '[data-scroller-first]',
      '.Post',
      // Trending/popular sidebars
      '[aria-label*="Popular"]',
      '[aria-label*="Trending"]',
      // Community recommendations
      'aside',
    ];

    hideSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
    });
  }

  // Create and show blocked message
  function showBlockedMessage() {
    if (!isBlockedPage()) {
      removeBlockedMessage();
      return;
    }

    if (document.getElementById('reddit-blocker-message')) return;

    const message = document.createElement('div');
    message.id = 'reddit-blocker-message';
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 20px;
      color: #818384;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      text-align: center;
      padding: 40px;
      background: #1a1a1b;
      border-radius: 8px;
      border: 1px solid #343536;
      z-index: 99999;
      max-width: 400px;
    `;

    const whitelistDisplay = WHITELISTED_SUBREDDITS.length > 0
      ? WHITELISTED_SUBREDDITS.map(s => `r/${s}`).join(', ')
      : 'None configured';

    message.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 16px; color: #d7dadc;">Reddit Blocked</div>
      <div style="margin-bottom: 20px;">Homepage and non-whitelisted subreddits are blocked.</div>
      <div style="font-size: 14px; color: #6a6a6b;">
        <strong>Allowed subreddits:</strong><br>
        ${whitelistDisplay}
      </div>
      <div style="font-size: 12px; color: #4a4a4b; margin-top: 16px;">
        Threads from external links (Google, etc.) are allowed.
      </div>
    `;

    document.body.appendChild(message);
  }

  // Remove blocked message
  function removeBlockedMessage() {
    const message = document.getElementById('reddit-blocker-message');
    if (message) {
      message.remove();
    }
  }

  // Hide left sidebar and suggestions everywhere
  function hideSuggestions() {
    const suggestionSelectors = [
      // Left sidebar
      '#left-sidebar',
      '#left-sidebar-container',
      '[data-testid="left-sidebar"]',
      'nav[aria-label="Primary"]',
      'reddit-sidebar-nav',
      'left-sidebar-container',
      // Communities list
      '[aria-label="Communities"]',
      '[aria-label="Your Communities"]',
      '[data-testid="community-list"]',
      // Suggested communities
      '[aria-label*="Suggested"]',
      '[aria-label*="Recommended"]',
      // Popular communities sidebar
      '#right-sidebar-container [data-testid="subreddit-list"]',
      // Trending today
      '[data-testid="trending-searches"]',
      // Create community prompts
      '[href*="/subreddits/create"]',
    ];

    suggestionSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
    });
  }

  // Main blocker function
  function runBlocker() {
    if (isBlockedPage() && !isAllowedUtilityPage()) {
      hideContent();
      showBlockedMessage();
    } else {
      removeBlockedMessage();
      // Still hide suggestions on allowed pages
      hideSuggestions();
    }
  }

  // Initial run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBlocker);
  } else {
    runBlocker();
  }

  // Watch for dynamic content (Reddit is a SPA)
  const observer = new MutationObserver(() => {
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
