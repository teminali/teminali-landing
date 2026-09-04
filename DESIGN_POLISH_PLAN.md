# Design polish plan (2026-09-05)

Source: the user's live review of http://localhost:4000/ with three screenshots
(Studio hub, Contact, hero rail float card). The ask, verbatim in spirit:
"enhance the whole design, each element three times more: stronger design and
cleaner code structure, much more polished components, especially the floating
components around the mockups. Professional, not just good-looking. The hub is
good but too distracting; cleaner, more space, better alignment. The form inputs
almost touch the centre line." Those two are examples; the whole page gets the
same pass.

Reference stays https://www.reventador.global/ for rhythm and scale, but this
pass is allowed to beat the reference where it is sloppy (the contact form
sitting on the centre rule is the reference's own layout and is now rejected).

## Principles (apply to every section)

1. **Rule discipline.** Nothing sits on a drafting rule. Content columns keep at
   least 2rem clear of the centre rule; cards may cover a rule fully (opaque
   surface) but never straddle it with text or controls.
2. **One surface system.** Fills `--solid-3/4/8/12` (opaque twins in
   `src/styles/tokens.css`; add `--solid-12`), hairlines 1px `--line-12`
   (hover `--line-16`), radius scale 0.5 / 0.75 / 1 / 1.25rem, one shadow token
   `--shadow-float: 0 24px 48px -24px rgba(0,0,0,.6)` used only by floating
   layers. Retire the ad-hoc `rgba()` fills in `src/styles/index.css`
   (`.software_icon-wrap` `--fill-16` and its `.3` hover, `.software_card` glass,
   `.software_card-icon-wrap` border `.32`, `.float-card`).
3. **Type roles.** Kickers and labels: mono 11px, uppercase, tracking .16em,
   `--text-60`. Card titles: 14-15px/1.35 white medium. Card meta: 12px
   `--text-60`. No 12px Inter labels on dark tiles. Numerals tabular
   (`font-variant-numeric: tabular-nums`) in stats and float cards.
4. **Motion restraint.** Parallax/tilt at most 3deg / 6px. Reveals 0.6s, stagger
   40-80ms, translate 12px, no scale. Hover lift 2px, not 3. No continuous
   floating loops.
5. **Rhythm.** Label-to-control 0.625rem, control height 3.25rem, card padding
   1.5-2rem, in-section blocks on 2 / 3 / 5rem steps.

## A. Hero rail float cards and caption

Where: `src/components/HeroRail.tsx:195-218`, `.float-card` at
`src/styles/index.css:759`, scene data in `src/content/site.ts` (`scenes[].float`).

Now: a 230px-min dark translucent card at a per-scene absolute position over the
app screenshot, covering the sidebar and repo list; a second green check badge
floats mid-screen over the chat text; the caption `h2` is centred over the UI.
Three layers compete and none is anchored to anything.

Target:

- Card: fixed width 19rem, padding 1rem 1.125rem, radius .75rem, `--solid-8`,
  1px `--line-12`, `--shadow-float`, no backdrop blur (blur over a moving
  screenshot shimmers).
- Two anchor slots only, relative to the laptop frame, not the screen content:
  `top-right` (top -1.5rem, right -2.5rem, overlapping the bezel corner) and
  `bottom-left` (bottom 3rem, left -2.5rem). Assign per scene in `site.ts`:
  agent → bottom-left, video → top-right, route → bottom-left, verify → top-right.
  The card must never cover the app's sidebar or its primary text.
- Anatomy: row 1 kicker (6px `--accent` dot + mono label); row 2 title; row 3
  sub; optional row 4 a 2px progress hairline or three mono stat chips.
- Remove the standalone check badge; fold its status into the kicker dot
  (green pass, amber warning).
- Caption: leave the screen area. A lower-third band under the screen edge,
  max-width 36rem, 28px/1.2 at lg, left-aligned to the laptop's left bezel
  + 3rem; the veil becomes a 10rem gradient from `--ground` upward. The
  reduced-motion list at `HeroRail.tsx:236-256` follows the same type.
- Transitions: cards slide 12px + fade, 0.5s, 80ms stagger.

## B. Studio hub

Where: `src/sections/upper.tsx:181-250`, `.software_*` at
`src/styles/index.css:776-990`.

Now: ten 140px tiles (`--fill-16`, radius 2rem, 3rem icons) on a loose oval
around three glow rings and a green pill; Inter 15px labels; scroll tilt; heavy
glow. Reads busy and the tiles are not on one curve.

Target:

- Tiles 6rem, radius 1.25rem, `--solid-4` + 1px `--line-12`; icon 1.5rem white
  at 90%; hover `--solid-8`, `--line-16`, translateY(-2px).
- Labels: mono 11px uppercase tracking .16em `--text-60`, .75rem under the tile,
  centred; hover/active label white.
- Layout: an exact ellipse. Ten tiles at equal 36° steps from -90°, rx = 34vw
  capped at 30rem, ry = .62·rx. Use CSS trig with a per-tile `--i`:
  `transform: translate(calc(cos(var(--a)) * var(--rx)), calc(sin(var(--a)) * var(--ry)))`
  (Chrome 111+, Safari 15.4+, Firefox 108+). If the grid-area layout must stay,
  move each area to that ellipse's coordinates.
- A 1px `--line-12` SVG ellipse behind the tiles so the ring reads as a system.
- Core: pill 16rem × 8rem `--accent`, mark 3.5rem, "STUDIO" mono 11px tracking
  .3em in `--ground`. Two rings instead of three (middle .18, outer .08), glow
  blur 40px at .08. Keep the `::before` ground disc that hides the rule.
- Motion: tilt capped at 3deg / 6px; tiles reveal with a 40ms stagger; no loop.
- Detail cards (`.software_card`): width 22rem, `--solid-8`, 1px `--line-12`,
  no blur, slide 16px from the side; icon wrap 2.5rem `--solid-12`; close
  button 2rem ghost.
- Section head: keep the left h2; add a right column at lg with one paragraph
  and a mono "12 panel kinds · 1 gateway · 127.0.0.1" row so the top of the
  section is not a lone heading beside empty space.

## C. Contact

Where: `src/sections/lower.tsx:350+`, contact rules at
`src/styles/index.css:501-525`, form rules nearby.

Now: `.contact-grid` is `1fr 50%` with a 7.5rem gap, which lands the form's
left edge exactly on the centre rule; labels sit on the rule; the legal links
are centred across the rule with "Terms" on it; the copyright floats mid-column
with dead space below.

Target:

- Grid `minmax(0,1fr) minmax(0,1fr)`, no column gap; form column
  `padding-left: 3rem` (lg 4rem); left column `padding-right: 4rem`. The
  heading keeps its 12px from the left rule (section inset).
- Fields: `.form-field-2-col` gap 1.25rem × 1.5rem; label mono 11px uppercase
  tracking .16em `--text-60`, margin-bottom .625rem, required mark `--accent`;
  inputs 3.25rem high, radius .5rem, `--solid-3` + 1px `--line-12`; focus
  border `--accent` + `0 0 0 3px rgba(101,196,102,.18)`; textarea min-height
  9rem, `resize: vertical`.
- Send: `.btn` at 11.25rem × 3.25rem to match the inputs.
- Left column: heading, lede max-width 30rem, Quick Contact list with 2.5rem
  gaps.
- Footer bar across both columns: 1px `--line-12` top rule, 1.5rem padding,
  copyright + mark left, legal links right with 2rem gaps. This replaces the
  floating copyright and the centred legal row.

## D. Section sweep checklist (capture first, then fix)

Capture every section at 1512×865 and 1280×800 with `tools/sections.mjs`
before touching them, and audit against the principles:

1. **Nav.** The lone status dot beside the links reads as an artefact: label it
   (mono "gateway · live") or remove it. The full-bleed green Download block is
   the heaviest element on the page; try a `.btn-primary` at 3.25rem inside the
   nav rail with the rail hairline and compare captures.
2. **Mission cards.** Icon-to-title gap 3.25rem leaves the card hollow; use
   2rem, padding 2rem, icon 2.75rem `--solid-12`.
3. **Compare cards.** Rows on a 2.5rem grid; check/cross plates 2rem `--solid-8`.
4. **Platform split rows.** Give each shot a 1px `--line-12` frame and 1rem
   radius; the text column keeps 2rem from the centre rule.
5. **About figures.** The rule shows dimly through the translucent gradient at
   `src/styles/index.css:456`; put a ground-coloured `::before` backing behind
   the figure wrapper (same pattern as the hub disc).
6. **Stats.** Tabular numerals; baseline-align the labels.
7. **Process / roadmap.** Same surface system as the cards.
8. **Downloads page.** Same tokens; confirm the `bg-surface-sunken` band does
   not hide the rules unintentionally.

## 0. Copy pass: no em dashes

The user wants every em dash gone from the site copy. Grep `src` for the
character (`rg -n "—" src`; 53 hits, 28 of them in `src/content/site.ts`) and
rewrite each sentence with a full stop, a comma or a colon; never a hyphen or a
spaced en dash. Code comments count too. Same rule for new copy written during
this pass and for these docs.

## Order of work

0. Copy pass: remove every em dash (section 0). One commit.
1. Tokens and surface system (`tokens.css`, retire ad-hoc rgba in `index.css`).
2. Contact (C). Small and immediately visible.
3. Hero float cards and caption (A). Verify with rail captures at every hold.
4. Studio hub (B). Pixel-check the ellipse spacing.
5. Section sweep (D), one commit per section.

Each step: `npx tsc --noEmit -p tsconfig.json`, `npm run build`, captures via
`tools/sections.mjs` at 1512×865 and 1280×800, zero page errors. One commit
per step. Update `SECTION_MAP.md` with the measured values that change.
