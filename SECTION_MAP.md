# Section map — derived from the 26 reference screenshots

Read from `~/Desktop/landing-refference/`, ordered by capture time, which is
scroll order. This is the layout half of `BUILD_SPEC.md`; that file holds the
motion half. Structure and rhythm are taken; palette, copy and imagery are ours.

## Global chrome

- **Fixed nav.** Logo in a bordered square cell flush to the left edge and the
  full height of the bar, wordmark beside it, centred link row, and a solid CTA
  block welded into the top-right corner — taller than the bar, no margin,
  square outer corners. Translucent dark backdrop with blur.
- **Scroll spy.** The link for the section in view turns accent-coloured.
- **Technical rule overlay.** Vertical hairlines at a ~56px gutter each side plus
  occasional horizontals, drawn over everything at very low alpha. It reads as
  a drafting grid and is what ties the page together.
- **Container.** Content sits inside the gutters; product screenshots
  deliberately break out and bleed off one edge.

## Order

| # | Section | Structure |
| --- | --- | --- |
| 1 | Hero | Centred H1 (2 lines, light weight) over a concentric-circle radar; two subcopy paragraphs; mouse-outline scroll indicator with a falling dot and a letterspaced "Scroll". |
| 2 | Laptop rail | The pinned Three.js sequence. Laptop rises closed from below, lid opens, camera dollies until the screen fills the frame, then three scene groups cross-fade on it. |
| 3 | Solutions | Centred pill badge on a full-width hairline → large left-aligned 2-line H2 → left subcopy → three alternating feature rows. |
| 4 | Hub | Pill → two-column head (H2 left; paragraph + mono stat row right, 2rem clear of the centre rule) → module wheel: ten 6rem `--solid-4` tiles at 36° steps on one ellipse (rx `min(34vw, 30rem)`, ry .62·rx, hairline `--line-12` orbit), mono 11px labels .75rem under, a 16×8rem accent pill with two rings (22×13.64rem at `--accent-18`, 30×18.6rem at `--accent-8`) and a 40px glow. Tilt ≤3deg/6px; a click steps the wheel to .9 and slides it just clear of a 22rem `--solid-8` detail card. |
| 5 | Demo CTA | Large bordered card; a collage of product screenshots rotated ~15° as its background; H2, subcopy, and a joined email-input + button pill. |
| 6 | Process | Pill → centred H2 → centred subcopy → 4 columns, each a large `01.` numeral with a hairline running right from it, a title, and 2–3 short paragraphs. |
| 7 | Why us | Pill → centred H2 → sub-headline → paragraph → two cards: ours (✓ rows) and the alternative (✕ rows). Each row is a small rounded-square icon plus a paragraph. |
| 8 | Mid CTA | Full-bleed band over a dot-matrix world map; centred H2, subcopy, joined email + button. |
| 9 | About | Pill → centred H2 → centred subcopy → two image/text rows. The photo carries floating UI cards that overlap its top and bottom edges and break its bounding box. |
| 10 | Mission | Pill → large left-aligned 2-line H2 → a bold lead line → two columns of body copy → three feature cards in a row (icon square, title, paragraph). |
| 11 | Roadmap CTA | Bordered rounded card, dot-matrix world map inside it, centred H2 + subhead + paragraph + joined email/button. |
| 12 | Stats | Left-aligned H2 across the top, then a photo bleeding off the left edge beside a 2×3 stat grid — a large number or short phrase over a small paragraph. |
| 13 | Contact + footer | Oversized "Contact Us" H1 left with quick-contact rows (icon + text) and the logo/copyright beneath; 2×2 form fields plus a full-width textarea and a Send button right; legal links centred at the very bottom. |

## The three laptop scene groups

Each is a base screenshot, one detail element that **breaks out past the screen
bezel**, a rounded-square accent icon badge, and a single caption line centred
under the badge. The breakout is what sells the depth — the detail leaves the
screen plane and floats in front of the laptop.

| Scene | Base | Breakout element | Caption shape |
| --- | --- | --- | --- |
| 1 | Full dashboard | A metrics panel lifts and scales out of the page | one line, ~28px |
| 2 | Detail/inspection view | The right-hand side card detaches and floats above the bezel | one line |
| 3 | A picker grid | One tile scales up out of the grid | one line |

## Typography and components

- Geometric grotesk. Headlines are **light weight** and large (H1 ~56px, H2
  ~44px); body is ~15px at a relaxed measure; kickers are ~11px uppercase with
  wide letterspacing and dim colour.
- Pill badge: rounded-full, 1px border, ~13px, sits centred on a hairline.
- Feature row: kicker → H3 → paragraph → three icon+text rows separated by
  hairlines → CTA button.
- Cards: 1px border, barely-raised fill, ~12px radius, no shadow.
- Buttons: solid fill, ~8px radius, generous horizontal padding.

## Where we deliberately differ

- **Palette.** Reventador runs deep navy with a saturated blue accent. Teminali
  Code is achromatic — `#151515` ground, off-white `#e8e8e8` accent. Depth comes
  from a 1px border one step lighter than the fill and nothing else; the token
  sheet is explicit that gradients and glow are out.
- **Primary is green.** `--accent` is `#65c466`, a terminal green, on the user's
  explicit instruction: every button, the wordmark glyph, the scroll-spy link,
  `::selection` and the focus ring. The ground and all type stay achromatic, so
  green is the only hue carrying brand. The mark is `>_<` — a terminal prompt
  joined to a closing angle bracket — and keeps its own `--mark` token (aliased
  to `--accent`) so it can be retuned without moving every button with it.
  Do not "fix" any of this back to off-white. `public/favicon.svg` is the
  canonical drawing of the mark — Nav, the footer and `tools/brand.mjs` all
  carry its coordinates divided by 32, and `tools/brand.mjs` regenerates the
  og card and the apple-touch icon from them.
- **Below 860px, and under `prefers-reduced-motion`, there is no rail.** The
  hero becomes a single screen of copy with the end state shown as a framed
  still beneath it, and the nav's link row collapses into a sheet. The 560vh
  scroll only exists to scrub a scene; without one it is five screens of a
  motionless image.
- **The app frames are real screenshots, not drawings.** Every studio frame is
  a capture of the shipping product, taken by `tools/studio-scenes.mjs` against
  the real studio on `:3000` at a 900px CSS viewport and 4x DPR (3600x2252), so
  it stays sharp all the way through the dolly push-in onto the laptop screen.
  The viewport is deliberately narrow: at a 1280px capture the app's own 14px
  type renders around 8px inside a figure and is unreadable, where at 900px it
  is comfortably legible at the same figure size.

  This reverses an earlier decision. The frames used to be drawn in DOM, which
  could not go stale against a build and stayed sharp at any scale; realism won
  instead, so **re-run the capture tool whenever the studio's shell changes**.
  The session content is seeded through the store's own `localStorage` key, the
  way any staged product screenshot is — the chrome, sidebar, tool-call cards
  and run metrics are all the app's real components.
- **`1em = 1cqw` still governs the DOM overlays.** The `BreakoutCard` — the
  element that leaves the screen plane — is still laid out in `em` against
  `1em = 1% of the frame width`, because stepped `text-[Npx]` values only hold
  at the width they were picked for.
- **Lid mechanism.** They morph-target the lid. We hinge it, which is visually
  identical for an opening lid and costs us no glTF, no Draco decoder and no
  third-party asset. Recorded here so it does not read as a missed requirement.

## Audit notes — 2026-09-05

Measured against the reference's own stylesheet (`reventador.webflow.shared`)
and Webflow interaction JSON rather than the screenshots alone. Corrections to
the text above:

- **The bar is 4.5rem, not 56px**, and the drafting rules sit **4.5rem** in from
  each edge — the width of the logo cell, not the 3rem container gutter. The
  rule continues the cell's right border straight down the page. The CTA block
  is the bar's full height, not taller.
- **The hero H1 is the h2 step** (3rem, weight 400, 1.25) on a 60rem measure,
  two paragraphs at 1.125rem on a 48rem measure, and no buttons. The nav CTA
  is the download. The copy block is `space-between`'d against an empty spacer
  and the scroll cue, with an 8.5rem spacer inside it, which is what puts it
  just below centre.
- **Scroll cue**: 2.5×4.5rem ring with a 0.125rem inset, an 0.5rem dot, and a
  white fill that wipes down the ring. Four keyframe groups, 2.3s per loop;
  ported to a GSAP timeline in `HeroRail.tsx`.
- **Intro**: circles draw over 1.6/1.4/1.2s from 0/0.2/0.4s; every line and
  text block (and the nav) rises from `yPercent: 150` over 1.4s starting at 0.4s.
- **Section head**: pill on a 67.5rem row between two hairlines that fade
  towards the edges, 4rem below it; H2 on a 64rem measure, body on 38rem.
- **Split rows** live on the 84rem container: text `1fr`, figure column 49%,
  the shot itself 50vw (max 53rem) so it bleeds off the outer edge; 10rem gap,
  8.5rem between rows, 1.5rem list rhythm with a hairline between items.
- **Type**: h3 2rem/1.3 for row and card titles, h4 1.5rem/1.5 for card
  headings, body 1rem/1.5, dimmed copy at 70% white. Buttons are 1rem padding,
  0.75rem radius, 11.25rem minimum.
- **Real captures.** `public/shots/{copilot,editor,editor-wide,record,take,
  export,settings,home}.webp` are screenshots of v1.2.8 supplied on 2026-09-05,
  encoded at their native 2880px. The staged `run/route/verify` captures stay
  for the agent, routing and verification scenes, which the real set does not
  cover.
- `~/Downloads/refference-landing.{webp,mp4}` are **not** the reference: they
  are a ".vid_it" video-editor template. The reference is
  `~/Desktop/landing-refference/` and the live site.

### Follow-up — 2026-09-05 (evening)

- **Split shots stop at the drafting rules.** `.rule-clip { clip-path: inset(0 var(--rule)) }`
  on `#platform` and `#stats`. The 50vw shots still lay out as before; the part
  that used to run under the 4.5rem rule to the viewport edge is hidden, so the
  rule reads as the shot's outer edge. Stats only bleeds below ~1300px.
- **Laptop scenes use the real captures.** agent → `copilot`, video → `take`,
  route → `settings`; verify keeps the staged `verify` (no real capture of a
  verification run exists). Float-card copy was rewritten to match each shot.
  The veil (`overlay-n`) reaches opacity 1 at each hold, which keeps the caption
  legible over the busier real screens.
- **Contact audited against the reference sheet.** `.contact_wrap` 1fr/50% at
  7.5rem, details gap 3.25rem, link column 2rem/1.5rem, copyright margin 3rem,
  `.form-field-2-col` 1.5rem/2rem, `.form-input` 3.5rem min / 1.125rem 1.5rem,
  textarea 11.25rem, `.footer_legal` 5rem — all already matched. The one
  deviation was the Send button at 16rem; it is now the plain 11.25rem `.btn`.
- **Drafting rules sit behind content.** `GridOverlay` moved from `z-30` to
  `-z-10`, so cards, inputs, badges and shots cover the rules and they only show
  in the gaps. Card surfaces (`.compare-card`, `.mission-card` and its hover)
  moved from the white-alpha `--fill-3/4/8` to the opaque `--solid-3/4/8`
  twins in `tokens.css` (`color-mix(in srgb, var(--ground), white N%)`, the
  same colour over the ground) so the rule cannot ghost through them. Icon
  plates and the rail float card keep their alpha fills.
  The studio hub keeps its translucent green rings and glow; instead
  `.software_core::before` is a ground-coloured ellipse at `inset: -4rem`
  around the 30×18.6rem core (past the glow's 40px blur tail), which hides
  the rule under the core. The tiles are opaque `--solid-4` and cover it.

### Follow-up, 2026-09-05 (night)

- **Contact, measured (step 2).** `.contact-grid` is two `minmax(0, 1fr)`
  columns split on the centre rule; `.contact-details` gap 3rem with
  `padding-right: 4rem`, `.contact-form` gap 1.25rem with `padding-left: 3rem`
  (4rem from 1280px), so nothing sits on the line. Head gap 1.5rem, body
  `max-width: 30rem`; quick-contact gap 2rem, list gap 1.5rem, column heading
  1.25rem medium, links `gap: .625rem` with a 1.5rem icon box. Controls:
  `.input` min-height 3.25rem, padding .875rem 1.125rem, `--r-sm`, `--line-12`
  on `--solid-3`, 15px/1.4, hover `--line-16`, focus accent plus
  `--focus-ring`; textarea 9rem; `.field-label` mono 11px .16em `--text-60`
  at `margin-bottom: .625rem`, required mark in the accent; `.form-2col`
  column gap 1.5rem, row gap 1.25rem; Send at `margin-top: .75rem`, the
  3.25rem `.btn` (padding .75rem 1.5rem, `--r-md`). `.footer-bar` runs under
  both columns: `padding: 1.5rem 0 2rem`, `--line-12` top hairline, 13px
  `--text-60`, copy gap .75rem, legal links gap 2rem. Below 991px one column,
  `row-gap: 4rem`, paddings 0, footer stacked at 1rem.
- **Hero rail, measured (step 3).** `.float-card` 19rem wide, padding 1rem
  1.125rem, `--line-12` on `--solid-8`, `--r-md`, `--shadow-float`, tabular
  numerals, two slots hung off the bezel: `is-top-right` at `top: -1.5rem;
  right: -2.5rem`, `is-bottom-right` at `bottom: 3rem; right: -2.5rem`.
  Kicker mono 11px .16em `--text-60` behind a 6px dot (1.6s pulse when live);
  title 15px/1.35 medium white at .625rem; sub 12px/1.4 `--text-60` at .25rem;
  chips at .75rem, `.25rem .5rem`, `--solid-12` on `--line-12`, `--r-sm`, mono
  11px `--text-75`. The caption is a lower third: `.hero_intro-text-wrap`
  `padding: 0 3rem 2.5rem` at the screen's bottom, `.hero-intro_h` 1.75rem/1.2
  at -.01em medium white, `max-width: 36rem`; the veil `.home-intro_overlay`
  is 16rem tall, ground to 60% at half to transparent. `.home-intro_screen`
  clips (`overflow: hidden`, radius .5rem) while `#laptop-overlay` stays
  visible so the card can overlap the bezel. On the timeline each card
  arrives `y: 12 -> 0` with `z: 40` at `'<0.15'` after its caption.
- **The video scene is a player.** `scenes[].video` (`site.ts`) names the
  YouTube id and title; `ScreenPlayer` in `HeroRail.tsx` renders inside that
  scene's `.home-intro_screen`. Poster state: a 3.25rem play circle and a
  2.25rem "Full screen" pill centred on the screen, both `--solid-8` on
  `--line-12`; only they take the pointer (the rail stays
  `pointer-events: none`). Play mounts a `youtube-nocookie` embed (`fs=0`)
  filling the screen above a 2.75rem `--solid-4` bar: live dot, "Now playing",
  the title, "Full screen" and stop. `.is-playing` on the wrap hides the float
  card, which otherwise sits on the embed's top-right chrome. "Full screen"
  opens `VideoDialog`, a modal `<dialog>` that is its own 94% ground backdrop
  with the embed at 16:9, `min(90vw, (100vh - 12rem) * 16/9)` wide, a 3.25rem
  close circle at 1.5rem and a mono meta line (title, "Esc to close"). Lenis
  is stopped while it is open (`lockScroll` in `motion.ts`). One state
  (`poster | inline | theatre`) drives both, so only one embed exists at a
  time, and a `MutationObserver` on the wrap's inline style unmounts the
  inline embed once the scrub fades it under 0.5. The image wraps now tween
  `autoAlpha`, not `opacity`, so a hidden scene's controls cannot be hit.
  Without the rail the compact list gets a "Watch the video" pill that opens
  the same dialog.
- **The last scene is the demo.** Its `shot` is `demo-poster.webp`, a 2312x1364
  retina capture of the studio's home screen supplied by the user (YouTube's
  own thumbnail is a bright webcam frame and a still from the video carried
  the recording's cursor; both were rejected). Caption "Watch it run, start
  to finish.", float
  card "Demo video", "Teminali Code demo · 4:17", bottom-right. The play
  control is the page's one accent control: a 4rem `--accent` disc with the
  ground-coloured glyph on the screen's exact centre (`top/left: 50%`,
  translated back by half), a 1px `--accent-18` ring at -.5rem breathing
  (2.8s, scale 1.14, opacity .3; off under reduced motion), a 1px
  `--accent-8` ring at -1.25rem and a 40px `--accent-18` glow, the hub core's
  language. The Full screen pill hangs at `calc(50% + 3.75rem)`. Both are
  `data-intro="player-4"` and arrive as the scene's last beat on the scrub
  timeline (`autoAlpha`, 0.5, at `'<0.3'` after the float card), so they never
  show during the crossfade; they stay mounted and `hidden` while playing so
  that tween target survives.
- **Downloads read the live release.** `downloads.tsx` derives the GitHub
  repo from `site.releaseUrl` (`teminali/releases`; the old constant named a
  repo that does not exist, so the page had always fallen back to the static
  copy). The latest-release response is cached in `sessionStorage` under
  `tc:release` for one hour, because the unauthenticated API allows 60
  requests an hour per IP. The page shows the version, the release date and
  each asset's real size. Detection is best effort and only ever promotes a
  build, never hides one: phones and tablets (UA-CH `mobile`, the mobile UA
  strings, a Mac UA with more than one touch point) get no recommendation;
  then Windows, Linux and Mac by `userAgentData.platform` or the UA; on a Mac
  the architecture comes from the `architecture` client hint first, then the
  WebGL renderer string, defaulting to Apple Silicon. The match is promoted
  into a "Recommended for this computer" block above the cards with a direct
  link to that asset.
