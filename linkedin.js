// LinkedIn Content Blocker
// Blocks ads and suggested content, only shows posts from connections or their engagement

(function() {
  'use strict';

  // Track hidden vs shown counts for debugging
  let hiddenCount = 0;
  let shownCount = 0;

  // Check if a post is an ad (Promoted content)
  function isAd(postElement) {
    // Look for "Promoted" text in the post header area
    const promotedIndicators = [
      'span:contains("Promoted")',
      '[data-ad-banner]',
      '.update-components-actor__description',
      '.feed-shared-actor__sub-description',
      '.update-components-actor__sub-description',
    ];

    // Check for Promoted text
    const textContent = postElement.textContent || '';
    if (textContent.includes('Promoted')) {
      // Make sure it's actually the post label, not just mentioned
      const actorDescription = postElement.querySelector('.update-components-actor__sub-description, .feed-shared-actor__sub-description');
      if (actorDescription && actorDescription.textContent.includes('Promoted')) {
        return true;
      }
      // Also check the header/description area
      const header = postElement.querySelector('.update-components-header, .feed-shared-update-v2__description');
      if (header && header.textContent.includes('Promoted')) {
        return true;
      }
    }

    // Check for ad-specific attributes
    if (postElement.querySelector('[data-ad-banner]')) return true;
    if (postElement.querySelector('[data-is-sponsored="true"]')) return true;
    if (postElement.getAttribute('data-is-sponsored') === 'true') return true;

    return false;
  }

  // Check if a post is suggested content (not from your network)
  function isSuggestedContent(postElement) {
    const textContent = postElement.textContent || '';

    // Look for "Suggested" indicator
    const suggestedPhrases = [
      'Suggested',
      'Suggested for you',
    ];

    for (const phrase of suggestedPhrases) {
      if (textContent.includes(phrase)) {
        // Verify it's in the header/description area, not just post content
        const headerArea = postElement.querySelector(
          '.update-components-header, ' +
          '.feed-shared-update-v2__description, ' +
          '.update-components-actor__description, ' +
          '.update-components-actor__sub-description, ' +
          '.feed-shared-actor__sub-description'
        );
        if (headerArea && headerArea.textContent.includes(phrase)) {
          return true;
        }
      }
    }

    return false;
  }

  // Check if post is from a connection or shows connection engagement
  function isFromNetworkOrEngagement(postElement) {
    const textContent = postElement.textContent || '';

    // Patterns that indicate connection engagement
    const engagementPatterns = [
      / likes? this$/i,
      / liked this$/i,
      / loves? this$/i,
      / celebrates? this$/i,
      / commented on this$/i,
      / shared this$/i,
      / reposted this$/i,
      / replied to/i,
      / finds? this insightful$/i,
      / finds? this funny$/i,
      / is curious about this$/i,
      / supports? this$/i,
    ];

    // Check header for engagement indicators
    const headerArea = postElement.querySelector(
      '.update-components-header, ' +
      '.feed-shared-update-v2__description, ' +
      '.update-components-text-view'
    );

    if (headerArea) {
      const headerText = headerArea.textContent || '';
      for (const pattern of engagementPatterns) {
        if (pattern.test(headerText)) {
          return true;
        }
      }
    }

    // If there's no "Promoted" or "Suggested" label, it's likely from your network
    // The absence of those indicators usually means it's organic content
    const hasNoPromoIndicator = !isAd(postElement) && !isSuggestedContent(postElement);

    return hasNoPromoIndicator;
  }

  // Check if this is a feed post element
  function isFeedPost(element) {
    // LinkedIn feed posts have these common patterns
    return element.matches(
      '[data-id^="urn:li:activity"], ' +
      '[data-urn^="urn:li:activity"], ' +
      '.feed-shared-update-v2, ' +
      '.occludable-update, ' +
      '[data-id*="ugcPost"], ' +
      '[data-id*="share"]'
    );
  }

  // Process a single post
  function processPost(postElement) {
    // Skip if already processed
    if (postElement.dataset.linkedinBlockerProcessed === 'true') {
      return;
    }
    postElement.dataset.linkedinBlockerProcessed = 'true';

    // Check if should be hidden
    if (isAd(postElement)) {
      postElement.style.setProperty('display', 'none', 'important');
      hiddenCount++;
      return;
    }

    if (isSuggestedContent(postElement)) {
      postElement.style.setProperty('display', 'none', 'important');
      hiddenCount++;
      return;
    }

    // If it passed both checks, it should be from network
    shownCount++;
  }

  // Find and process all feed posts
  function processFeed() {
    // Main feed post selectors
    const postSelectors = [
      '[data-id^="urn:li:activity"]',
      '[data-urn^="urn:li:activity"]',
      '.feed-shared-update-v2',
      '.occludable-update',
      '[data-id*="ugcPost"]',
      '[data-id*="share"]:not([data-id*="reshare"])',
    ];

    postSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(processPost);
    });
  }

  // Hide sidebar ads and suggestions
  function hideSidebarContent() {
    const sidebarSelectors = [
      // Right sidebar ads
      '.ad-banner-container',
      '[data-ad-banner]',
      '.aside-widget--ad',
      // News module (LinkedIn News)
      '.news-module',
      '[data-view-name="news-module"]',
      '#feed-news-module',
      '.scaffold-finite-scroll__content .news-module',
      '[aria-label="LinkedIn News"]',
      // People you may know
      '.mn-abi-form',
      '[data-view-name="pymk-module"]',
      // Follow recommendations
      '.feed-follows-module',
      // "Add to your feed" section
      '[aria-label="Add to your feed"]',
      // Course recommendations
      '.learning-top-courses',
      // Game section
      '.games-home__teasers',
      '[data-view-name="games-teasers"]',
      // Promoted job listings in sidebar
      '.jobs-premium-spotlight',
      // Collaborative articles
      '.feed-shared-article-cta',
    ];

    sidebarSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
    });
  }

  // Hide promoted/suggested in feed regardless of position
  function hidePromotedElements() {
    // Find any element with "Promoted" as a label
    document.querySelectorAll('.update-components-actor__sub-description, .feed-shared-actor__sub-description').forEach(el => {
      if (el.textContent.trim() === 'Promoted') {
        // Find the parent post container and hide it
        const post = el.closest('[data-id^="urn:li:activity"], [data-urn^="urn:li:activity"], .feed-shared-update-v2, .occludable-update');
        if (post) {
          post.style.setProperty('display', 'none', 'important');
        }
      }
    });

    // Also look for "Suggested" labeled content
    document.querySelectorAll('.update-components-header__text-view, .update-components-text-view').forEach(el => {
      if (el.textContent.includes('Suggested')) {
        const post = el.closest('[data-id^="urn:li:activity"], [data-urn^="urn:li:activity"], .feed-shared-update-v2, .occludable-update');
        if (post) {
          post.style.setProperty('display', 'none', 'important');
        }
      }
    });
  }

  // Main blocker function
  function runBlocker() {
    processFeed();
    hideSidebarContent();
    hidePromotedElements();
  }

  // Initial run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBlocker);
  } else {
    runBlocker();
  }

  // Watch for dynamic content (LinkedIn is a SPA with infinite scroll)
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

  // Also run on scroll (for infinite scroll loading)
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(runBlocker, 200);
  }, { passive: true });

  // Run periodically to catch any missed content
  setInterval(runBlocker, 2000);

})();
