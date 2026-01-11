// Smol AI News Content Filter
// Hides Discord recap sections on issue pages

(function() {
  'use strict';

  // Only run on issues pages
  function isIssuesPage() {
    return window.location.pathname.includes('/issues/');
  }

  function hideDiscordSections() {
    if (!isIssuesPage()) return;

    // Find the AI Discord Recap heading and hide it + everything after
    const discordHeading = document.getElementById('ai-discord-recap');
    if (discordHeading) {
      let sibling = discordHeading;
      while (sibling) {
        sibling.style.setProperty('display', 'none', 'important');
        sibling = sibling.nextElementSibling;
      }
    }

    // Also hide TOC links that reference discord sections
    const discordTocSelectors = [
      'a[href="#ai-discord-recap"]',
      'a[href="#discord-high-level-discord-summaries"]',
      'a[href="#discord-detailed-by-channel-summaries-and-links"]',
      'a[href*="-discord"]',
      'a[href*="discord-"]',
      'a[href*="-messages"]'  // Catches all sub-channel links like "#channel--subchannel-123-messages"
    ];

    discordTocSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(link => {
        // Hide the link and its parent container (usually a div or li)
        let parent = link.parentElement;
        while (parent && parent.tagName !== 'NAV' && parent.tagName !== 'ASIDE' && parent.tagName !== 'BODY') {
          if (parent.children.length === 1 || parent.classList.contains('font-medium')) {
            parent.style.setProperty('display', 'none', 'important');
            break;
          }
          parent = parent.parentElement;
        }
        link.style.setProperty('display', 'none', 'important');
      });
    });
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideDiscordSections);
  } else {
    hideDiscordSections();
  }

  // Watch for dynamic content changes
  const observer = new MutationObserver(hideDiscordSections);

  function startObserver() {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      hideDiscordSections();
    } else {
      setTimeout(startObserver, 10);
    }
  }

  startObserver();
})();
