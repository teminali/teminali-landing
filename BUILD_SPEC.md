# Teminali Code — landing page build spec

Everything below was extracted from the reference material, not guessed. Nothing
is built yet: this session prepared the ground and handed over.

## What the reference actually does

Inspiration: https://www.reventador.global/ (Webflow site, last published
2025-05-30). The saved view-source dump was Chrome's escaped HTML viewer; it is
decoded to real markup at `_ref/reventador.html` (173 KB, 1304 source lines).

**The laptop is not a CSS parallax.** It is a Three.js scene. Their bundle
(`_ref/threejsAnimation.js`, 657 KB, from the public npm package
`@yes-chef/reventador@0.0.2`) uses:

| Signal | Count | Meaning |
| --- | --- | --- |
| `morphTarget*` | 130 | the lid opens via **morph targets**, not a bone rig or rotation |
| `gsap` | 61 | GSAP drives the timeline |
| `WebGLRenderer` | 44 | plain Three.js renderer |
| `GLTFLoader` | 27 | model is glTF |
| `DRACOLoader` | 2 | geometry is Draco-compressed |
| `ScrollTrigger` | 7+16 | scroll is the timeline scrubber |

Mesh names found in the bundle: `screen`, `keyboard`, `solid`.

**The one scroll trigger that governs the whole hero**, verbatim from their code:

```js
scrollTrigger: { trigger: "#hero-scroll-wrap", start: "top top", end: "bottom 150%", scrub: 2 }
```

`scrub: 2` is the signature of the feel — a 2-second eased catch-up, not a 1:1
scroll lock. `end: "bottom 150%"` gives the rail half a viewport of overscroll
past its own bottom, which is what makes the laptop linger.

Smooth scroll is **Lenis** (`_ref/smoothScroll.js`, 11 KB; the page carries
`lenis`, `lenis-smooth`, `lenis-stopped`, `lenis-prevent` classes). GSAP
ScrollTrigger must be driven from Lenis's rAF loop or the scrub will jitter.

### The hero DOM structure they use

```html
<section id="hero-scroll-wrap" class="hero_scroll-wrap pointer-events-off">
  <div class="hero_animation-rail">
    <div id="laptop-animation" class="hero_laptop-animation">
      <div class="laptop">
        <canvas id="laptop-scene"></canvas>
        <div id="laptop-overlay"></div>
      </div>
    </div>
    <div data-intro="wrap" class="home-intro_content-wrap">
      <div data-intro="image-wrap-1" class="home-intro_img-wrap is-1">
        <img data-intro="img-1"> <img data-intro="img-2">
        <div data-intro="overlay-1"></div>
        <div data-intro="text-wrap-1">…</div>
      </div>
      <!-- image-wrap-2 (img-3, img-4), image-wrap-3 (img-5, img-6) -->
    </div>
  </div>
</section>
```

**Three scene groups**, each = a base screenshot + an overlay screenshot + an
overlay scrim + a text block. The laptop screen is where these composite. A
separate `#hero-img-mobile` static image replaces the whole canvas on mobile —
copy that fallback, the WebGL scene is not worth it on a phone.

Also present: `home-mobile-slider.js` (mobile swap), `hub.js`, and a
`hero_scroll-ind` scroll indicator with an animated dot.

## Our brand — do not import theirs

Teminali Code is near-monochrome dark. From
`frontier/studio/src/styles/tokens.css`:

```
--ground #151515   --surface #212121   --surface-raised #262626
--border #262626   --border-strong #313131
--text #ededed     --text-bright #f0f0f0
--accent #e8e8e8   --accent-hover #ffffff   --accent-dim #9f9f9f
--success #65c466  --warning #f2ca44        --danger #ec6765
```

The accent is *off-white*, not a colour. Reventador is a green/earth
sustainability brand — take their **motion, layout and component structure**,
never their palette, imagery, copy or the Reventador name.

## Recommended stack

Match the app so the team is not learning a second toolchain:
**Vite 6 + React 19 + TypeScript 5.7 + Tailwind 3.4** (exactly what
`frontier/studio` runs), plus `three`, `gsap` (with ScrollTrigger) and `lenis`,
none of which the studio currently has.

Next.js is the alternative if SSG/SEO metadata matters more than stack parity.
That is a real fork and the user has not been asked yet — **ask before scaffolding.**

## Reference assets

| Path | What |
| --- | --- |
| `_ref/reventador.html` | decoded real markup |
| `_ref/threejsAnimation.js` | their Three.js bundle — read for technique, do not ship |
| `_ref/home.js`, `_ref/smoothScroll.js` | GSAP choreography, Lenis setup |
| `_ref/frames/f_001…015.jpg` | 15 stills at 1 per 3 s from the 46 s walkthrough |
| `~/Desktop/landing-refference/` | 26 screenshots (up to 3.2 MB each) + the 3024×1964 recording |

The 26 screenshots were **not** read this session — context was exhausted. They
are the highest-value unread input; a fresh session should read them in batches
and derive the section-by-section layout from them.

## Build order

1. Ask: Vite or Next; confirm folder name `landing/`.
2. Scaffold, wire Lenis → GSAP ScrollTrigger rAF, prove `scrub: 2` feel on a box.
3. Source or model a laptop glTF with a lid morph target; Draco-compress it.
4. Composite our own studio screenshots as the three `data-intro` scene groups.
5. Static `<img>` fallback under the mobile breakpoint; `prefers-reduced-motion`
   must skip the scroll-driven scene entirely.
6. Remaining sections from the 26 screenshots.

## Legal line

Match the *effect*, the layout rhythm and the component structure. Do not ship
their bundle, their glTF, their copy, their imagery or their brand. `_ref/` is
research input and should be gitignored or removed before any publish.
