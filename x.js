// X/Twitter Content Blocker - Hide right sidebar, show only Explore and Profile in nav

(function() {
  'use strict';

  function hideElements() {
    // Hide the right sidebar column
    const sidebar = document.querySelector('[data-testid="sidebarColumn"]');
    if (sidebar) {
      sidebar.style.display = 'none';
    }

    // Hide nav items we don't want (keep Explore and Profile)
    const navItemsToHide = [
      'a[href="/home"]',
      'a[href="/i/connect_people"]',
      'a[href="/i/grok"]',
      'a[href$="/communities"]',
      'a[href="/notifications"]',
      'a[href="/messages"]',
      'a[href="/i/bookmarks"]',
      'a[href="/i/lists"]',
      'a[href$="/lists"]',
      'a[href="/i/premium_sign_up"]',
      'a[href="/i/verified-choose"]',
      '[data-testid="AppTabBar_Home_Link"]',
      '[data-testid="AppTabBar_Notifications_Link"]',
      '[data-testid="AppTabBar_DirectMessage_Link"]',
      '[data-testid="AppTabBar_Grok_Link"]',
      '[data-testid="AppTabBar_Communities_Link"]',
      '[data-testid="AppTabBar_More_Menu"]',
      'a[data-testid="SideNav_NewTweet_Button"]',
      'a[aria-label="Lists"]',
      'a[aria-label="Bookmarks"]',
      'a[aria-label="Premium"]'
    ];

    navItemsToHide.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'none';
      });
    });

    // Also hide Lists link that has dynamic username in href
    document.querySelectorAll('a[href$="/lists"]').forEach(el => {
      el.style.display = 'none';
    });
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideElements);
  } else {
    hideElements();
  }

  // Use MutationObserver to handle dynamically loaded content
  const observer = new MutationObserver(hideElements);

  function startObserving() {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      hideElements();
    } else {
      requestAnimationFrame(startObserving);
    }
  }

  startObserving();
})();
