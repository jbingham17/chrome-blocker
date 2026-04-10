// LinkedIn Content Blocker
// Blocks only the home feed while allowing profiles, posts, and other pages

(function() {
  'use strict';

  // Check if on the home feed page
  function isBlockedPage() {
    const path = window.location.pathname.toLowerCase();
    if (path === '/feed' || path === '/feed/' || path.startsWith('/feed?')) return true;
    if (path === '/' || path === '') return true;
    return false;
  }

  const BLOCKER_ID = 'linkedin-blocker-overlay';

  function applyBlock() {
    if (document.getElementById(BLOCKER_ID)) return;

    const overlay = document.createElement('div');
    overlay.id = BLOCKER_ID;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #f3f2ef;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    overlay.innerHTML = `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        text-align: center;
        padding: 40px;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 400px;
      ">
        <div style="font-size: 24px; margin-bottom: 16px; color: #0a66c2;">LinkedIn Feed Blocked</div>
        <div style="font-size: 20px; color: #666; margin-bottom: 20px;">The home feed is blocked to help you stay focused.</div>
        <div style="font-size: 14px; color: #666;">
          You can still access:<br>
          <span style="color: #0a66c2;">Profiles, Posts, Jobs, Messages, Notifications, and Search</span>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  function removeBlock() {
    const overlay = document.getElementById(BLOCKER_ID);
    if (overlay) overlay.remove();
  }

  // Check current page and apply/remove block accordingly
  function check() {
    if (!document.body) return;
    if (isBlockedPage()) {
      applyBlock();
    } else {
      removeBlock();
    }
  }

  // Poll the URL to catch all navigation (SPA, pushState, popstate, etc.)
  let lastUrl = '';
  function pollUrl() {
    const url = window.location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      check();
    }
    requestAnimationFrame(pollUrl);
  }

  // Start polling once body exists
  function init() {
    if (document.body) {
      check();
      pollUrl();
    } else {
      setTimeout(init, 10);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
