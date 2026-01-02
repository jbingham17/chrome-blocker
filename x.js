// X.com (Twitter) Content Blocker
// Allows viewing individual tweets/threads and profile info
// Blocks feed, recommendations, and user posts on profiles

(function() {
  'use strict';

  // Check if we're on a tweet/status page (allowed)
  function isOnTweetPage() {
    return window.location.pathname.includes('/status/');
  }

  // Mark body with current page type for CSS targeting
  function markPageType() {
    const path = window.location.pathname;
    document.body.removeAttribute('data-page');

    if (path === '/' || path === '/home') {
      document.body.setAttribute('data-page', 'home');
    } else if (isOnTweetPage()) {
      document.body.setAttribute('data-page', 'tweet');
    } else if (path.startsWith('/explore') || path.startsWith('/search')) {
      document.body.setAttribute('data-page', 'explore');
    } else {
      document.body.setAttribute('data-page', 'profile');
    }
  }

  // Hide the bottom sign-up bar
  function hideBottomBar() {
    const bottomBar = document.querySelector('[data-testid="BottomBar"]');
    if (bottomBar) {
      bottomBar.style.setProperty('display', 'none', 'important');
    }

    // Also hide the "Don't miss what's happening" banner
    const banners = document.querySelectorAll('[role="complementary"]');
    banners.forEach(el => {
      if (el.textContent.includes("Don't miss") || el.textContent.includes("Sign up")) {
        el.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // Track the last URL to detect navigation
  let lastUrl = window.location.href;

  // Scroll to the top of the tweet on tweet pages
  function scrollToTweet() {
    // Small delay to let Twitter finish rendering
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }

  // Main blocker function
  function runBlocker() {
    markPageType();
    hideBottomBar();

    // Check if we navigated to a new tweet page
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      if (isOnTweetPage()) {
        scrollToTweet();
      }
    }

    // On tweet pages, don't hide anything else - let CSS handle visibility
    if (isOnTweetPage()) {
      return;
    }
  }

  // Initial run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      runBlocker();
      if (isOnTweetPage()) {
        scrollToTweet();
      }
    });
  } else {
    runBlocker();
    if (isOnTweetPage()) {
      scrollToTweet();
    }
  }

  // Watch for dynamic content (X is a SPA)
  const observer = new MutationObserver((mutations) => {
    if (observer.timeout) clearTimeout(observer.timeout);
    observer.timeout = setTimeout(runBlocker, 100);
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

  // Run on navigation (X uses History API)
  window.addEventListener('popstate', runBlocker);

  // Intercept pushState and replaceState for SPA navigation
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(this, arguments);
    setTimeout(runBlocker, 100);
  };

  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    setTimeout(runBlocker, 100);
  };

  // Run periodically to catch any missed content
  setInterval(runBlocker, 2000);

})();
