# Chrome-Blocker

A Chrome extension that blocks distracting content on social media sites while keeping essential features accessible.

## Supported Sites

### Instagram
- Blocks the main feed, stories, reels, and DMs
- Allows access to search and user profiles

### YouTube
- Hides homepage feed, recommendations sidebar, and Shorts
- Removes autoplay, end screen suggestions, and pause overlay suggestions
- Hides search bar and left sidebar
- Allows direct video playback via URL

### Reddit
- Blocks homepage, r/popular, r/all, and non-whitelisted subreddits
- Allows configurable subreddit whitelist (edit `reddit.js` to customize)
- Permits threads accessed from external links (Google, etc.)
- Hides sidebars and community suggestions

### X (Twitter)
- Hides the right sidebar (trends, who to follow)
- Hides most navigation items (Home, Notifications, Messages, Grok, Communities, etc.)
- Keeps only Explore and Profile accessible

### LinkedIn
- Blocks the main feed
- Allows access to profiles, posts, jobs, messages, notifications, and search

### TikTok
- Completely blocks the entire site

### Wikipedia
- Blocks the main portal and language-specific main pages
- Removes clickable internal article links (prevents wiki rabbit holes)
- Preserves navigation, search, table of contents, and external links
- Disambiguation pages keep links functional

### JetPunk
- Completely blocks the entire site
- Configurable exceptions in `jetpunk.js` (one quiz currently allowed)

### smol.ai
- Hides Discord recap sections

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder

## Configuration

### Reddit Whitelist
Edit the `WHITELISTED_SUBREDDITS` array in `reddit.js` to allow specific subreddits:

```javascript
const WHITELISTED_SUBREDDITS = [
  'claudeai',
  'claudecode',
  // add your subreddits here
];
```

## License

MIT
