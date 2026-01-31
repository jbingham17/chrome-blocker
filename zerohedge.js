// ZeroHedge Blocker
// Blocks the entire site

(function() {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    body > * {
      display: none !important;
    }
    body::before {
      content: "ZeroHedge is blocked";
      display: flex !important;
      justify-content: center;
      align-items: center;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #f8f9fa;
      color: #54595d;
      font-size: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      z-index: 999999;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

})();
