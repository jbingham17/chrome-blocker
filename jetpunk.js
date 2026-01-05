// JetPunk Full Blocker
// Completely blocks access to jetpunk.com (with exceptions)

(function() {
  'use strict';

  // Allowed URLs (not blocked)
  const allowedPaths = [
    '/user-quizzes/1314339/bodies-of-water-on-the-world-map'
  ];

  // Check if current path is allowed
  const currentPath = window.location.pathname;
  if (allowedPaths.some(path => currentPath.startsWith(path))) {
    // Remove the blocking CSS by injecting override styles
    const style = document.createElement('style');
    style.textContent = `
      html, body { overflow: auto !important; }
      body > * { display: revert !important; }
      body::before { display: none !important; }
    `;
    (document.head || document.documentElement).appendChild(style);
    return; // Don't block this page
  }

  // Stop page load immediately
  window.stop();

  // Clear the page and show blocked message
  function blockPage() {
    document.documentElement.innerHTML = `
      <head>
        <title>Blocked</title>
        <style>
          body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #1a1a2e;
            color: #eee;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .blocked-message {
            text-align: center;
          }
          .blocked-message h1 {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .blocked-message p {
            font-size: 18px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="blocked-message">
          <h1>🚫</h1>
          <p>jetpunk.com is blocked</p>
        </div>
      </body>
    `;
  }

  // Block immediately if possible
  if (document.documentElement) {
    blockPage();
  } else {
    document.addEventListener('DOMContentLoaded', blockPage);
  }
})();
