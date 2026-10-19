# Portfolio architecture & decisions

> `README.md` at the repository root is the GitHub **profile README** (this repo is `saharrefaei/saharrefaei`), so
> developer documentation lives here instead.

## Preview locally

```bash
npm ci
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build  → dist/
npm run preview    # serve the production build
npm run lint
```

Deployment is unchanged: Netlify runs `npm run build` and publishes `dist/` (`netlify.toml`, with the SPA fallback
redirect). No new build step or environment variable was introduced.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Build / UI | Vite 8, React 19, TypeScript | Unchanged from the existing project. |
| 3D | three.js via `@react-three/fiber` + `@react-three/drei` | Already installed; drei is used for `Environment`, `Lightformer`, `MeshDistortMaterial` only. |
| Motion | `framer-motion` (Motion for React) | One animation library for reveals and scroll-linked values. GSAP was deliberately **not** added. |
| Styling | Plain CSS: design tokens + one CSS file per component | No runtime CSS library; `sass`, `clsx`, `tailwind-merge`, `lucide-react` and `lenis` were removed (unused or counter to the brief). |
| Fonts | `@fontsource-variable/bricolage-grotesque` (display), `@fontsource-variable/instrument-sans` (body) | Both SIL OFL, self-hosted (no Google Fonts request). Bricolage's width axis gives the condensed poster lettering. |

## Source layout

```
src/
  App.tsx              page shell (skip link, header, scene host, sections, footer)
  styles/              tokens.css (colour/type/spacing) · base.css (reset, utilities, .on-ink/.on-paper/.on-heat)
  content/             typed data: profile, experience, projects, interests — edit copy here, not in JSX
  sections/            Hero · About · Experience · Projects · Interests · Contact (+ colocated CSS)
  components/          DotText, DotTicker, motion (FadeUp, MaskHeading, ScrollWords, ScrollBand),
                       SectionHead, ProjectVisual, Header, CursorFollower, SiteFooter
  scene/               SceneHost (lazy, guarded) → SceneLayer (Canvas) → Composition (objects) · poses.ts
  lib/                 dotFont (5×7 glyph table), sceneInput (scroll/pointer state), capabilities (feature detection, media-query hooks)
```

## Key decisions

1. **Content first, 3D as enhancement.** Every section is real HTML that works without WebGL. `SceneHost` only mounts
   the 3D layer when WebGL context creation succeeds, the device is not very low-end, and the browser is idle after
   first paint. The WebGL code is a separate lazy chunk (~253 kB gzip) so the main bundle stays ~110 kB gzip.
   Failure modes fall back to the same CSS orb stand-ins in the hero: no WebGL, context loss (`webglcontextlost`), or
   an exception in the scene tree (error boundary).
2. **One fixed canvas, choreographed by scroll.** The canvas is `position: fixed` at `z-index: 1`; section backgrounds
   paint below it and `.container` content (`z-index: 2`) above it, so the objects drift *between* backgrounds and
   text. Each `<section data-scene-section>` has a pose in `scene/poses.ts` (position, scale, ring spread, yaw);
   `lib/sceneInput.ts` turns scroll position into a float section index that holds a pose for the first 55 % of a
   section and eases to the next. Scroll and pointer state live in a plain mutable object read inside `useFrame`,
   never in React state, so scrolling causes no React re-renders.
3. **No scroll hijacking.** Smooth wheel scrolling (Lenis) was removed; all motion is driven *by* native scroll.
   The native cursor is never hidden; the trailing ring (`CursorFollower`) is added only for fine pointers.
4. **Original dot-matrix typography, not a font.** `lib/dotFont.ts` is a hand-authored 5×7 glyph table drawn on
   `<canvas>` by `DotText`: a light-on reveal, pointer-proximity swell and an endless `DotTicker`. This echoes the
   LED-display feel of the reference without using its proprietary typeface.
5. **Generated project visuals instead of fake screenshots.** `ProjectVisual` draws an SVG illustration per
   project (network, radar, orb, pipeline, bars, layers). They illustrate the idea of a project and never imitate a UI.
6. **Lighting without network fetches.** Chrome reflections come from `Lightformer`s baked once into the environment
   map, so no HDR file is downloaded from a CDN.
7. **Outlines are avoided on the variable display font.** `-webkit-text-stroke` exposes the font's overlapping
   contours, so large "ghost" type uses tonal fills instead.

## Accessibility & motion

- Semantic landmarks (`header`, `nav`, `main`, labelled `section`s, `footer`), one `h1`, skip link, visible 3 px focus
  ring on every control, new-tab links announced to screen readers.
- `prefers-reduced-motion`: CSS animations are disabled globally; `MotionConfig reducedMotion="user"` drops transform
  animations; reveals render in their final state; the canvas switches to `frameloop="demand"` with a static pose; the
  cursor follower, scroll bands and dot reveals are off.
- Decorative visuals (`DotText` with `label=""`, ticker, band, project art, canvas) are `aria-hidden`; the
  information they show is always present as real text elsewhere.
- Interests are real `<button>`s: hover, focus and tap all drive the readout, which is an `aria-live` region.

## Performance notes

- DPR is capped at 1.5, low-end devices skip WebGL, phones/tablets render fewer segments and halo dots.
- Dot canvases only run `requestAnimationFrame` while revealing or while the pointer is near; otherwise they are static.
- Measured on an Apple M5 Pro in headless Chrome (production build): 60 fps idle, 54 fps under scripted scrolling at
  1440×860 @2×; 60 fps at 390×844 @3×. **Not measured on real low-end phones.**

## Content rules

`src/content/*` uses only information from the profile README, the previous portfolio and public GitHub repositories.
Company-internal systems and metrics from the previous site were intentionally left out of the experience entries.
Add a verified demo URL to a project's `live` field and the "Live demo" button appears automatically.

## Known follow-ups

- Confirm exact dates for Taxfix and Almedia and the M.Sc. period (see the summary in the pull request / hand-off).
- `THREE.Clock` deprecation warning in the console comes from `@react-three/fiber` internals, not this code.
- There is no automated test runner in the repository; verification used type-checking, ESLint, the production build,
  axe-core, and scripted Chromium checks (see the hand-off summary).
