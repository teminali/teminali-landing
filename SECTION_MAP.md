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
| 4 | Hub | Pill → H2 → subcopy → radial module hub: filled concentric circles at centre, ~8 icon tiles in a ring around it, each a rounded square icon over a label. |
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
