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
   → window.scrollY      read inside the render loop, in the same frame it is drawn
   → smoothed in scroll  frame-rate-independent exponential smoothing (no momentum, instant reversal)
     space
   → keyframe index      with a continuous ease that slows toward each stop but never freezes
   → CatmullRomCurve3    camera position and look-at target on two splines through the keyframes
   → camera              + a small pointer parallax
```

* **One scroll system.** Native page scroll only. The page just provides scroll *length*: tall, empty
  `[data-journey-section]` elements (`#top`, `#about`, `#experience`, … `#contact`). They double as anchors, so
  nav links, the back button, deep links and keyboard scrolling all work, and nothing intercepts the wheel.
  There is no GSAP/ScrollControls/Lenis: `journey.ts` is plain mutable state read inside `useFrame`, so scrolling
  causes no React renders.
* **The path is built from content** (`world/path.ts`). One keyframe per job, project and event
  (plus hero, about, contact). Add an entry to `src/content/*` and the road gets longer automatically.
* **Content lives in the world** via `<Anchor kf nx ny d>` (`world/layout.tsx`): a group fixed in world space at
  `(nx, ny)` of the visible area, `d` units in front of that keyframe's camera. The same layout therefore adapts to a
  phone or a monitor, while the result is a fixed place the camera really flies past.
  * **3D lettering**: extruded `Text3D` titles (SAHAR REFAEI, ABOUT, company names, HACKATHON, …).
  * **3D objects**: the chrome orb rig, one sculpture per project (`ProjectModels.tsx`), floating photo frames,
    a dot-matrix `HELLO` made of instanced spheres.
  * **Readable copy**: real DOM panels (`Panel` in `ui3d.tsx`). Each frame a panel's anchor point is projected
    through the WebGL camera, so it sits at a real place in the world, scales with distance and moves with parallax,
    yet stays selectable, crawlable and accessible. See *Text sharpness* below for why this is not a CSS 3D transform.
* **Depth cues** (`Backdrop.tsx`): ~3k drifting dots through the whole volume, hoops the camera flies through
  between stops, chrome shards at varying distances, and fog + background colour that change per section.
* **Culling without churn**: every anchor stays mounted and is only *shown* while the camera is within a few
  keyframes (`useNearKf`). Nothing is created, compiled or uploaded while the visitor scrolls (see *Scroll feel*).

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
  content/             typed data: profile, experience, projects, events. Edit copy here
  world/               THE 3D EXPERIENCE
    path.ts            keyframes → camera + look-at splines, per-keyframe camera frames
    journey.ts         scroll → keyframe index (+ dwell/travel easing)
    CameraRig.tsx      camera motion, atmosphere (background/fog/light)
    layout.tsx / layoutCore.ts   Anchor, responsive layout, near-keyframe culling
    ui3d.tsx           Title3D (extruded text), Panel (DOM in 3D)
    Backdrop.tsx       stars, gates, shards
    ProjectModels.tsx  one 3D sculpture per project
    stations/          Intro (hero, about) · Work (experience, projects) · Showcase (events, contact)
    lightboxStore.ts   tiny external store for the fullscreen photo viewer
    WorldExperience.tsx  loader, scroll track, progress rail
  detail/              PROJECT & EXPERIENCE DETAIL VIEWS (see below)
    detailStore.ts     external store + URL/history sync (open, swap, close, Back/Forward, restore scroll + focus)
    routes.ts          /projects/<id> and /experience/<id>: parse and build
    model.ts           project or job → one view model (sections, facts, links, prev/next)
    DetailOverlay.tsx  the full-screen dialog (lazy chunk)   blocks.tsx  header, sections, metrics, gallery, pager
    DetailHost.tsx     scroll lock, inert background, focus/scroll restore, lazy-loads the overlay
    DetailTrigger.tsx  the "View details" link used by every panel and card   FramePause.tsx  stops a <Canvas>
  scene/               OrbRig (shared signature object), Composition + SceneHost (flat mode only)
  sections/            flat-mode sections
  components/          Lightbox, DotText, Header, motion helpers, …
  lib/                 dot-matrix font, capability detection, shared pointer state
public/fonts/          3D typeface (see below)   public/events/   event photos
scripts/               instance-font.py, build-typeface.mjs (how the 3D typeface was produced)
```

## Events & community: editing the gallery

Everything lives in `src/content/events.ts` (the file's header comment repeats these steps).

1. Put photos in `public/events/` (JPG/WebP, about 1600 px on the long side keeps the scene light; re-saving also strips
   EXIF/GPS metadata).
2. Add `{ src: '/events/<file>.jpg', alt: '...' }` to an event. `alt` describes what is visible.
3. Each event is one stop on the journey; its photos float along the road, and the road lengthens with the photo count
   (`eventLeg` in `world/path.ts`), so a big gallery never collides with the next event.
4. `role` and `date` are optional and hidden when absent.

Honesty is built into the UI: an event with `verified: false` shows a **Sample event** badge and a "SAMPLE" 3D title, and any
photo with `sample: true` shows a **Sample photo** badge (also drawn in 3D under the frame and inside the viewer). Use those
flags for placeholders; real events need neither.

Current content: one gallery, *Events in Berlin* (10 photos), described as moments from events in Berlin "including the
Claude × Taxfix Hackathon, which I organised". The photos come from more than one event, so none is claimed to be from a
specific one; add more events (each becomes its own stop) if you want to separate them.

Viewer: click a floating frame, a thumbnail or *View photos*. Arrow keys / swipe change photo, Escape closes, focus
is trapped and restored.

## Project & experience detail views

Every project and job is clickable (the whole card, plus a visible **View details →** link) and opens a full-screen
editorial overlay without leaving the page.

* **URLs.** `/projects/<id>` and `/experience/<id>`, e.g. `/projects/federated-vit`, `/experience/btu`. They are real
  deep links: Netlify's `/* → /index.html` rewrite serves them, and the "View details" control is an `<a href>` so it can be
  copied or opened in a new tab. Opening pushes a history entry; Back/Forward open and close the view; closing goes back
  (a deep-linked entry has nothing of ours to go back to, so it just resets the URL to `/`). The pager and cross-links swap
  the item with `replaceState`, so a single Back always closes the view.
* **Camera and scroll.** The page cannot scroll while the view is open (`overflow: hidden` on `<html>`), and the camera is
  driven by scroll, so it simply stays put. Each pushed history entry stores the scroll position it was opened from, so
  closing, Back, and even a reload put the camera back exactly. A direct link parks the background world at that item's
  stop (`detailKeyframe` in `world/path.ts`, `scrollYForKeyframe` in `world/journey.ts`).
* **Cost while open.** `FramePause` stops the render loop of the 3D world (and the flat page's scene), so the background
  costs no GPU or CPU time; the last frame stays on screen. The overlay is its own lazy chunk (prefetched on hover, focus and
  idle) and mounts nothing until used. Opening and closing re-render only `InertScope`, `DetailHost`, `FramePause` and the
  overlay, never the 3D tree.
* **Text.** The overlay is ordinary DOM text with no transform left on it at rest (the iris mask is removed once open,
  `.detail[data-settled]`). Only the paused canvas element moves (a slight push-in), never any text.
* **Accessibility.** A real `role="dialog"` with `aria-modal`, labelled by the title; the rest of the page is `inert`, so
  nothing behind can take focus; Tab is trapped; Escape and a visible Close button close it; focus moves to the dialog and
  returns to the control that opened it; `prefers-reduced-motion` swaps the iris and slides for a fade (and that visitor is
  on the flat page anyway).
* **Content.** All copy lives in `src/content/projects.ts` and `experience.ts` (`detail` on each entry; types in
  `content/detail.ts`). Sections with no data are not rendered, so a thin entry stays honest. To add a project or job: add
  the entry, nothing else (the journey, panels, flat page, URLs and pager all derive from the arrays). Add `gallery`
  (images under `public/`), `impact.metrics` (only numbers that can be backed up) and `live` when they exist. The artwork in
  the header is a generated illustration and is labelled as one; it is never presented as a screenshot.

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

## Scroll feel (smoothness)

Measured root causes of the earlier "laggy / choppy" feel, and what was done:

| Cause (measured) | Fix |
| --- | --- |
| Dead zones: the stop-easing froze the camera for the first ~25% of every leg, then it surged. A wheel notch could do nothing for ~400 ms (headed Chrome, 120 Hz) | `easeK` is continuous: speed goes from 0.45× at a stop to ~1.5× mid-leg and never reaches zero; legs are ~20% longer so each notch moves the camera less |
| ~240 ms of smoothing on top of Chrome's own scroll animation | smoothing now happens in **scroll space**, is exponential (frame-rate independent, memoryless, so reversing direction is instant), and its rate rises with the gap so a flick is tracked tightly. A notch is ~90% done after ~1 frame, settled in ~250 ms (was ~370 ms with a slow start) |
| Scroll handled in an event, camera moved in another callback | `window.scrollY` is read inside `useFrame`, so the camera is always in step with the frame being drawn. No scroll listener does work any more |
| One-off hitches (shader link, geometry and texture upload, React mounts) when each station first came into view | every station is mounted at load and the whole scene is **pre-compiled** (`WarmUp`) behind the loader; afterwards only `visible` toggles. Event photos load lazily, decode off the main thread (`ImageBitmap`) and are uploaded **one texture per frame** (drei's `useTexture` uploaded all of them at once, ~90 ms) |
| Full-screen `mix-blend-mode` on the progress rail forced blending over the canvas every frame | removed |
| Chrome DOM writes on every scroll event | the rail/hint update at most once per frame and only when their value changed |

No React state changes while scrolling except the rare "near / far" flips. GPU cost at 2x density is ~3.5-4.5 ms/frame
(`readPixels`-synced) on an Apple M5 Pro, 100-200k triangles and 14-73 draw calls.

## Text sharpness

Measured with an objective test: the same string is rendered flat (no transforms) and inside the scene at the same
on-screen size on a 2x display, and Laplacian edge energy is compared.

* **Cause:** drei's `<Html transform>` puts panels in a `matrix3d` + perspective layer. Chrome rasterises that text and then
  *resamples* it with a fractional scale and offset, which softened it to **76-94%** of flat-text sharpness (varying with
  position). The WebGL canvas was also capped at 1.5x on 2x displays, which softens 3D edges.
* **Fix:** panels are projected into screen space and positioned with `translate3d(x, y) scale(s)`, with x/y snapped to
  whole **device** pixels and `s` quantised, so the browser rasterises the text natively at its final size.
  Result: **102-112%** of the flat reference, at rest and while the camera moves. The canvas now renders at the display's
  native density (max 2x); `DprGovernor` only steps down after ~2 s of sustained slowness, never oscillates and never goes
  below 1.5x unless the frame rate is genuinely poor.
* Panels trade the perspective *skew* of CSS 3D for crispness; they still scale and move with the camera.

## Performance

* Lazy-loaded 3D chunk; phones/touch render fewer polygons, particles and shards.
* Headed Chrome at 120 Hz (Apple M5 Pro, production build, 2x display): 113-120 fps through slow glides, mouse notches, fast
  flicks and rapid direction reversals; across two full passes (one cold) only 3 frames exceeded 24 ms and none was a
  long animation frame. Layout shift 0.0003. **Not measured on real low-end phones.**
* Profile it yourself: open the site with `?debug` (or use `npm run dev`) to expose `window.__journey` (camera position, smoothed
  scroll) and `window.__gl` (the renderer: `info.render`, `getPixelRatio()`).

## Content rules

`src/content/*` uses only information from the profile README, the previous portfolio and public GitHub repositories.
Company-internal systems and metrics from the previous site were intentionally left out of the experience entries.
Add a verified demo URL to a project's `live` field and the "Live demo" button appears automatically.

The four company projects (Advertiser Platform, HubSpot ↔ BigQuery Sync, User Suppression, Grid Operations Dashboard) are
sanitised case studies: they describe what was built and how, and deliberately leave out internal system names, volumes and
company metrics. Hard numbers are shown only where they come from the owner's own research (the federated-learning results).

## Known follow-ups

* Confirm exact dates for Taxfix (start) and Almedia (end; currently "Jun 2025 – 2026") and the M.Sc. period. The Taxfix
  detail view only contains what was already public on the site; add more when there is something to say.
* The User Suppression project has no year: the previous site listed 2024, which predates the Almedia start date it gives.
* The Federated Learning repository (`Reliable-and-Secure-Systems/Federated-learning`) is private, so its GitHub link was
  removed from `projects.ts` (it would 404 for visitors). Add `github` back once the repository is public.
* Link previews (og:title / og:image) are the same for every URL: the site is a static SPA with no per-route HTML.
* `THREE.Clock` deprecation warning in the console comes from `@react-three/fiber` internals, not this code.
* No automated test runner exists in the repository; verification used type-checking, ESLint, the production build,
  axe-core, and scripted real-Chrome runs (wheel/touch/nav/back/viewer/keyboard, camera position readout).
