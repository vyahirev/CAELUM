# CAELUM

Plain HTML/CSS/JavaScript fashion storefront based on the CAELUM Figma design.

## Project structure

- `index.html` — semantic page structure, overlays, hero media, and external scripts
- `style.css` — reset, design tokens, component styles, animations, and responsive rules
- `script.js` — feature initialization and interaction logic
- `images/` — product and fallback hero images
- `videos/` — hero video media

## JavaScript architecture

`script.js` keeps each behavior isolated in a small initializer:

- `initLoadingScreen()` — font-aware loading screen and GSAP SplitText reveal
- `initHero()` — fallback image, looping hero video, and scroll-driven opacity
- `initCardReveal()` — IntersectionObserver card reveal
- `initMenu()` — fullscreen menu state and staggered transitions
- `initProductOverlay()` — product empty-state overlay
- `initKeyboardControls()` — Escape handling for overlays
- `initCustomCursor()` — desktop-only cursor tracking and hover sizing

The project has no build step, framework, package manager, or runtime dependency. GSAP and SplitText are loaded from CDN only for the loading-logo reveal.

## Running locally

Open `index.html` in a browser or serve the project directory with any static HTTP server. A local server is recommended for reliable video and CDN loading.
