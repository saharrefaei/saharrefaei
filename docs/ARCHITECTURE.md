# Portfolio architecture & decisions

> `README.md` at the repository root is the GitHub **profile README** (this repo is `saharrefaei/saharrefaei`), so
> developer documentation lives here instead.

## Preview locally

```bash
npm ci
npm run dev        # http://localhost:5173  (dev builds also expose window.__journey with the live camera position)
npm run build      # tsc -b && vite build  → dist/
npm run preview    # serve the production build
npm run lint
```

Deployment is unchanged: Netlify runs `npm run build` and publishes `dist/` (`netlify.toml`, with the SPA fallback
redirect). No new build step or environment variable was introduced. Static assets live in `public/`
(`/fonts`, `/events`, `og.jpg`).

## The core idea: a camera journey, not a page

The site is **one fixed WebGL world**. Scrolling does not move content past a static camera; it moves a
`PerspectiveCamera` along a spline through the scene, and every piece of content is placed at a real position in
that scene.

```
native scroll (wheel / trackpad / touch / keyboard / anchors)
   → journey.k           float "keyframe index" derived from where you are in the page
   → damped + eased      smooth interpolation, with a dwell at each stop so copy is readable
   → CatmullRomCurve3    camera position and look-at target on two splines through the keyframes
   → camera              + a small pointer parallax
```

* **One scroll system.** Native page scroll only. The page just provides scroll *length*: tall, empty
  `[data-journey-section]` elements (`#top`, `#about`, `#experience`, … `#contact`). They double as anchors, so
  nav links, the back button, deep links and keyboard scrolling all work, and nothing intercepts the wheel.
  There is no GSAP/ScrollControls/Lenis: `journey.ts` is plain mutable state read inside `useFrame`, so scrolling
  causes no React renders.
* **The path is built from content** (`world/path.ts`). One keyframe per job, project, interest group and event
  (plus hero, about, contact). Add an entry to `src/content/*` and the road gets longer automatically.
* **Content lives in the world** via `<Anchor kf nx ny d>` (`world/layout.tsx`): a group fixed in world space at
  `(nx, ny)` of the visible area, `d` units in front of that keyframe's camera. The same layout therefore adapts to a
  phone or a monitor, while the result is a fixed place the camera really flies past.
  * **3D lettering**: extruded `Text3D` titles (SAHAR REFAEI, ABOUT, company names, HACKATHON, …).
  * **3D objects**: the chrome orb rig, one sculpture per project (`ProjectModels.tsx`), floating photo frames,
    a dot-matrix `HELLO` made of instanced spheres.
  * **Readable copy**: real DOM in `<Html transform>` panels (`ui3d.tsx`). They share the WebGL camera's matrices,
    so they get true perspective and parallax, yet stay selectable, crawlable and accessible.
* **Depth cues** (`Backdrop.tsx`): ~3k drifting dots through the whole volume, hoops the camera flies through
  between stops, chrome shards at varying distances, and fog + background colour that change per section.
* **Culling**: anchors only mount while the camera is within a few keyframes (`useNearKf`), so only the nearby
  part of the world is ever alive.

### Two renderings of the same content

`App.tsx` chooses at runtime:

| Mode | When | What |
| --- | --- | --- |
| **world** | WebGL works, device not very low-end, no reduced-motion preference | the camera journey above |
| **flat** | no WebGL, very low-end device, `prefers-reduced-motion`, or WebGL context lost mid-session | the ordinary accessible scrolling page (`src/sections/*`) with a static decorative orb |

Both read the same data in `src/content/`. The 3D code is a lazy chunk the flat page never downloads.

## Source layout

```
src/
  App.tsx              mode switch (world / flat), skip link, header
  content/             typed data: profile, experience, projects, interests, events. Edit copy here
  world/               THE 3D EXPERIENCE
    path.ts            keyframes → camera + look-at splines, per-keyframe camera frames
    journey.ts         scroll → keyframe index (+ dwell/travel easing)
    CameraRig.tsx      camera motion, atmosphere (background/fog/light)
    layout.tsx / layoutCore.ts   Anchor, responsive layout, near-keyframe culling
    ui3d.tsx           Title3D (extruded text), Panel (DOM in 3D)
    Backdrop.tsx       stars, gates, shards
    ProjectModels.tsx  one 3D sculpture per project
    stations/          Intro (hero, about) · Work (experience, projects) · Showcase (focus, events, contact)
    lightboxStore.ts   tiny external store for the fullscreen photo viewer
    WorldExperience.tsx  loader, scroll track, progress rail
  scene/               OrbRig (shared signature object), Composition + SceneHost (flat mode only)
  sections/            flat-mode sections
  components/          Lightbox, DotText, Header, motion helpers, …
  lib/                 dot-matrix font, capability detection, shared pointer state
public/fonts/          3D typeface (see below)   public/events/   event photos
scripts/               instance-font.py, build-typeface.mjs (how the 3D typeface was produced)
```

## Events & community: replacing the sample photos

Everything lives in `src/content/events.ts`.

1. Put your photos in `public/events/` (JPG/WebP, about 1600 px on the long side keeps the scene light).
2. Edit each photo's `src`, `alt`, `caption` and **delete `sample: true`**.
3. Add photos or whole events by copying an entry; each event becomes one stop on the journey.
4. Delete the two *Sample event* entries when you have real ones.

Honesty is built into the UI: an event with `verified: false` shows a **Sample event** badge, and any photo with
`sample: true` shows a **Sample photo** badge (also drawn in 3D under the frame and inside the viewer). The
*Claude × Taxfix Hackathon* entry states only what was provided: Berlin, "helped organize". Add `date` once you
want it shown. The placeholder JPGs are generated, clearly labelled images, not stock photos.

Viewer: click a floating frame, a thumbnail or *View photos*. Arrow keys / swipe change photo, Escape closes, focus
is trapped and restored.

## The 3D typeface

`public/fonts/bricolage-800-cond.typeface.json` was generated from Bricolage Grotesque (SIL OFL, licence in
`public/fonts/OFL.txt`): `scripts/instance-font.py` pins the variable font to `wght 800 / wdth 75`, then
`scripts/build-typeface.mjs` converts the outlines to the JSON that drei `<Text3D>` reads. Re-run these two steps
(needs `fonttools`, `brotli`, and `npm i --no-save opentype.js`) to add glyphs.

## Accessibility & motion

* The canvas is `aria-hidden`; the *readable* content is real DOM (panels) plus one `sr-only` `h1`. Each panel is
  self-contained (its own `h2`), so the outline stays valid whichever panels are mounted. A visible
  **Simple version / 3D journey** switch is the second tab stop; the choice is remembered.
* Off-screen panels are `visibility: hidden`, which also removes their links from the tab order, so keyboard focus
  can never land on something you cannot see. Page-level keyboard scrolling (Space, PageDown, End) drives the camera.
* `prefers-reduced-motion` → the flat page (no camera travel). Decorative animation is also disabled in CSS.
* The fullscreen viewer is a real dialog (focus trap, Escape, restores focus, scroll lock, `aria-live` counter).
* Touch: the canvas is `touch-action: pan-y`, so vertical swipes scroll the page (and fly the camera) while taps
  still reach the photo frames.

## Performance

* Lazy-loaded 3D chunk; DPR capped at 1.5; phones/touch render fewer polygons, particles and shards.
* Typeface preloaded with the world; event photos are fetched only when the camera is a few stops away.
* Dev-measured (headless Chrome, Apple M5 Pro, production build): 60 fps idle and while scrolling at
  1440×860 @2×; layout shift 0.0002. **Not measured on real low-end phones.**

## Content rules

`src/content/*` uses only information from the profile README, the previous portfolio and public GitHub repositories.
Company-internal systems and metrics from the previous site were intentionally left out of the experience entries.
Add a verified demo URL to a project's `live` field and the "Live demo" button appears automatically.

## Known follow-ups

* Confirm exact dates for Taxfix and Almedia and the M.Sc. period.
* `THREE.Clock` deprecation warning in the console comes from `@react-three/fiber` internals, not this code.
* No automated test runner exists in the repository; verification used type-checking, ESLint, the production build,
  axe-core, and scripted real-Chrome runs (wheel/touch/nav/back/viewer/keyboard, camera position readout).
