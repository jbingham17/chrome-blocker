// YouTube Content Blocker
// Removes recommendations, autoplay, and end-of-video suggestions

(function() {
  'use strict';

  // Disable autoplay programmatically
  function disableAutoplay() {
    // Try to find and disable the autoplay toggle
    const autoplayButton = document.querySelector('.ytp-autonav-toggle-button');
    if (autoplayButton) {
      const isEnabled = autoplayButton.getAttribute('aria-checked') === 'true';
      if (isEnabled) {
        autoplayButton.click();
      }
    }

    // Also try the settings-based autoplay toggle
    const autoplayToggle = document.querySelector('paper-toggle-button#toggle');
    if (autoplayToggle && autoplayToggle.checked) {
      autoplayToggle.click();
    }
  }

  // Remove end screen elements
  function removeEndScreen() {
    const endScreenSelectors = [
      '.ytp-endscreen-content',
      '.ytp-ce-element',
      '.ytp-ce-covering-overlay',
      '.ytp-autonav-endscreen',
      '.ytp-autonav-endscreen-countdown-overlay',
      '.html5-endscreen',
      '.ytp-videowall-still',
      '.ytp-videowall-still-image',
      '.ytp-suggestion-set',
      '.ytp-suggestions',
      '.ytp-ce-video',
      '.ytp-ce-playlist',
      '.ytp-ce-channel',
      '.ytp-endscreen-paginate',
      '.annotation',
      '.video-annotations',
      '.ytp-cards-teaser',
      '.ytp-cards-button',
      '.ytp-player-content.ytp-iv-player-content',
    ];

    endScreenSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        el.remove();
      });
    });

    // Also hide any element with endscreen-related attributes
    document.querySelectorAll('[class*="endscreen"], [class*="videowall"], [class*="suggestion"]').forEach(el => {
      if (el.closest('.ytp-player-content') || el.closest('.html5-video-player')) {
        el.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // Remove sidebar recommendations
  function removeSidebar() {
    const sidebarSelectors = [
      '#secondary',
      '#related',
      'ytd-watch-next-secondary-results-renderer',
    ];

    sidebarSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
    });
  }

  // Remove pause overlay suggestions
  function removePauseOverlay() {
    const overlays = document.querySelectorAll('.ytp-pause-overlay-container, .ytp-pause-overlay');
    overlays.forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }

  // Cancel any pending autoplay
  function cancelAutoplay() {
    // Find the video player
    const video = document.querySelector('video.html5-main-video');
    if (video) {
      // Remove autoplay attribute
      video.removeAttribute('autoplay');

      // Prevent the next video from loading automatically
      video.addEventListener('ended', (e) => {
        e.stopPropagation();
        e.preventDefault();
      }, true);
    }

    // Try to cancel the autoplay countdown if it exists
    const cancelButton = document.querySelector('.ytp-autonav-endscreen-upnext-cancel-button');
    if (cancelButton) {
      cancelButton.click();
    }
  }

  // Remove Shorts from the page
  function removeShorts() {
    const shortsSelectors = [
      'ytd-reel-shelf-renderer',
      'ytd-rich-shelf-renderer[is-shorts]',
      'ytd-reel-item-renderer',
    ];

    shortsSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
    });
  }

  // Remove left sidebar
  function removeLeftSidebar() {
    const sidebarSelectors = [
      '#guide',
      '#guide-content',
      'ytd-guide-renderer',
      'ytd-mini-guide-renderer',
      'tp-yt-app-drawer',
      'app-drawer#guide',
    ];

    sidebarSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
    });

    // Adjust content margin
    const content = document.querySelector('#content.ytd-app');
    if (content) {
      content.style.setProperty('margin-left', '0', 'important');
    }
  }

  // Remove filter chips bar
  function removeChipsBar() {
    const chipSelectors = [
      'ytd-feed-filter-chip-bar-renderer',
      '#chip-bar',
      '#chips-wrapper',
      'yt-chip-cloud-renderer',
    ];

    chipSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
    });
  }

  // Remove search bar
  function removeSearchBar() {
    const searchSelectors = [
      '#search-form',
      '#search',
      'ytd-searchbox',
      '#center',
      '#search-container',
    ];

    searchSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
    });
  }

  // Remove homepage feed
  function removeHomepageFeed() {
    // Check if we're on the homepage
    const isHomepage = window.location.pathname === '/' ||
                       window.location.pathname === '/feed/subscriptions' === false &&
                       document.querySelector('ytd-browse[page-subtype="home"]');

    if (window.location.pathname === '/') {
      const homepageSelectors = [
        'ytd-browse[page-subtype="home"] #contents',
        'ytd-rich-grid-renderer',
        'ytd-browse[page-subtype="home"] #primary',
      ];

      homepageSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.style.setProperty('display', 'none', 'important');
        });
      });
    }
  }

  // Main blocker function
  function runBlocker() {
    disableAutoplay();
    removeEndScreen();
    removeSidebar();
    removePauseOverlay();
    cancelAutoplay();
    removeShorts();
    removeLeftSidebar();
    removeChipsBar();
    removeSearchBar();
    removeHomepageFeed();
  }

  // Initial run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBlocker);
  } else {
    runBlocker();
  }

  // Watch for dynamic content (YouTube is a SPA)
  const observer = new MutationObserver((mutations) => {
    // Debounce to avoid processing too frequently
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

  // Also run on navigation (YouTube uses History API)
  window.addEventListener('yt-navigate-finish', runBlocker);
  window.addEventListener('yt-page-data-updated', runBlocker);

  // Run periodically to catch any missed content
  setInterval(runBlocker, 2000);

  // Intercept autoplay before it starts
  document.addEventListener('yt-autonav-start', (e) => {
    e.stopPropagation();
    e.preventDefault();
  }, true);

})();
