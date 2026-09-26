# Raajlaxmi Group — luxury site build

Single self-contained file. Open `index.html` in any browser; no build step, no
dependencies, no network required for layout (fonts and placeholder photos are
the only external requests).

---

## The seven sections

| # | Section | id | What it does |
|---|---------|-----|--------------|
| 1 | **Hero** | `hero` | Night skyline, "Live above the city". Slow zoom, haze drift, mouse parallax. |
| 2 | **The Long View** | `descent` | Ivory panels close like an aperture, leaving a window onto the branded tower. Headline: "Three years to build. Thirty to matter." |
| 3 | **The Viewing Room** | `viewing` | Pinned horizontal gallery wall — four residences, each in the same window proportion. |
| 4 | **The Hours** | `hours` | Six chapters (Listen → Belong) as huge words with photography read through the letterforms. Background travels ivory → the hero's night navy. |
| 5 | **The Exhibition** | `gal` | Dawn lifts; the collection hung on a broken editorial grid with underline filters. |
| 6 | **The Practice** | `prac` | Drafting sheet — six admissions on a staircase grid, rules that draw themselves. |
| 7 | **The Six** | `six` | One frame, six names. Hovering a partner brings them forward inside the group's frame. |

The arc is deliberate: night → descent → gallery → a full day passing → dawn →
the drawings → the people. Section 4 ends in the exact navy the hero began in,
so the page closes its own loop.

---

## Placeholders you must replace before launch

### 1. Photography
Every image except the hero and the tower is a seeded stand-in from
`picsum.photos`, layered over a tonal gradient so the composition still holds
if the network is unavailable.

They are declared in four arrays, one per section — search the file for these:

| Constant | Section | Count | What to shoot |
|---|---|---|---|
| `RES_ART`  | Viewing Room | 4 | Residences, tall portrait crop |
| `HOUR_ART` | The Hours | 6 | Interiors: marble, timber, glass, low sun |
| `GAL_ART`  | Exhibition | 5 | Buildings at the listed aspect ratios |
| `PRAC_ART` | The Practice | 3 | **Material detail, close range** — a stone edge in raking light, a timber-to-glass junction, a lobby at blue hour |

Swap one line each:

```js
// before
PLACE('rl-stone-timber', 1400, 760, 'stone')
// after
'url("/img/enclave-stone-detail.jpg")'
```

Section 7 (`The Six`) sets its portraits inline via `PLACE(p.dataset.seed, ...)`.
**Shoot all seven frames with one identical crop** — same lens, same distance,
same eye-line. The illusion that a partner steps forward inside a fixed frame
collapses if the crops differ.

### 2. Names, prices, people
- **Residences** — Section 3 uses *Vespera, Meridian, Almora, Solaire* (Lucknow);
  Section 5 uses *Raajlaxmi Altitude, Elevate, Enclave, Vistas, The Skyline*
  (Mumbai). **These two sets contradict each other.** Pick one and propagate.
- **Prices** are invented. Replace all.
- **The six partners** — names, roles and philosophy lines are all placeholder.
- **Verifiable claims** — "thirty-one years", "fourth tower", "half of what we
  place is never listed", "1994". These carry the section's credibility.
  Use your real numbers or cut the sentences.

### 3. Logo
The mark is drawn for dark grounds. On the ivory sections the navbar currently
compensates with `filter: brightness(.62) saturate(1.25)`, which is a stopgap —
it will crush any white in the artwork. Export a dark-ink variant and swap the
`src` on `.nav-wrap.on-light` instead.

---

## Notes for the developer

**Adaptive navbar.** The bar samples the actual painted background behind it at
three x-positions, averages relative luminance, and flips to charcoal above 150.
This is why it tracks the two sections that change colour mid-scroll. Overlays
that darken from above (`galDawn`, `veil`) carry `pointer-events: none`, so
`elementsFromPoint` cannot see them — they are tested separately by geometry.
If you add another full-bleed dark overlay, add its id to `DARK_OVERLAYS`.

**Clipped elements report zero intersection.** Any element hidden with
`clip-path: inset(0 0 100% 0)` will never fire an IntersectionObserver watching
it — it hides itself, which prevents the thing that would reveal it. Always
observe an unclipped **wrapper** and apply the reveal class to the child.
This bit the build twice; `.pl.in .plate` and `.lot.in .fr` are the correct pattern.

**Aperture geometry (Section 2).** `--ap-l/r/t/b` are tuned so the tower signage
sits centred in the window: measured margins L40 R41 T45 at 1440×900, holding
within a few px from 1280 to 1680. If you change the tower photograph, re-tune
these four values.

**Pinned stages clear the navbar** via `padding-top` on `.vw-stage` and
`.hr-stage`. If you change the logo size, re-check that clearance.

**Motion.** Everything animates `transform` and `opacity` only. Easing is
`cubic-bezier(.16, 1, .3, 1)` throughout. `prefers-reduced-motion` unpins every
section and renders static compositions.

**Performance for production.**
1. Extract the two base64 images (hero skyline, tower) to external AVIF/WebP with
   `srcset` — that removes roughly 1MB from the HTML payload.
2. Subset the two Google fonts, or self-host them.
3. Add `<img fetchpriority="high">` for the hero plate to improve LCP.

**Porting to GSAP / Framer.** The scroll logic is vanilla so it runs anywhere.
Each section's script is a self-contained IIFE with its progress mapping in one
place, so translating to `ScrollTrigger` (`scrub: 1.2–1.4`, `pin: true`) or
`useScroll` + `useTransform` is a direct substitution.

---

## Tested

Headless Chromium at 1440×900, 1024×800 and 420×860 — full-page scroll, no
console errors, all reveals firing, no collisions between pinned content and the
navbar. Verified with placeholder photography deliberately blocked, so the
layout holds offline.
