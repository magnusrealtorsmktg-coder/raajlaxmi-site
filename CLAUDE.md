# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An **eight-page** static marketing site for Raajlaxmi Group: `index.html` (home), `projects.html` (browse-all collection, and the Completed view via `?status=completed`), `projects-ongoing.html` and `projects-redevelopment.html` (the same collection UI locked to one status), `project.html` (one property's detail page), `testimonials.html` (client voices), `services.html` and `contact.html` (enquiry page). No build step, no package manager, no dependencies, no test suite. Each page is one self-contained document — `<style>` in `<head>`, markup in `<body>`, one `<script>` at the end — plus a handful of loose image files in the repo root and `assets/`.

Deployed via Netlify as a plain static publish of the repo root (`.netlify/netlify.toml`, `publish` = the project directory). There is no build command; whatever is on disk is what ships.

**NOTE: `README.md` is stale** — it documents an earlier seven-section, single-file version of this site (Hero / The Long View / The Viewing Room / The Hours / The Exhibition / The Practice / The Six) that no longer exists in the markup. Don't take it as a description of the current build; update or ignore it, but don't propagate its section names.

## Where this stands (handover, 26 Sep 2026)

The site is **complete and working end to end**: eight pages, all serving, all
verified in a headless browser at 1440/1024/420 with no console errors. Sanity
drives every project card and the detail page. What is left is content and
deployment, not construction — see *Known content placeholders* and the three
"do this first" items below.

### Do these first

1. ~~**`git init`.**~~ **Done (26 Sep).** The directory is now a git repo with
   an initial commit, pushed to
   <https://github.com/magnusrealtorsmktg-coder/raajlaxmi-site> (public).
   `studio/node_modules`, `studio/dist`, `studio/.env` and `.netlify/` are
   gitignored — the last because its `netlify.toml` carries an absolute path to
   one machine, so committing it would break a build-from-git setup. If Netlify
   is ever switched from CLI deploys to deploying from GitHub, add a fresh
   `netlify.toml` at the repo root with `publish = "."`.
2. **Deploy the Studio.** `cd studio && npm run deploy`. The `stage` field and
   the three-folder sidebar exist in the local schema and are validated
   (`npx sanity schema validate` → 0 errors) but the **hosted Studio at
   <https://raajlaxmi.sanity.studio> is still running the old schema**, so the
   client cannot use any of it yet.
3. **Set `stage` on the existing documents.** Checked against the live dataset
   on 26 Sep: there are 8 projects and **not one has `stage` set** — the field is
   new. The pages still work because `stageOf()` falls back to the old status
   badge, so the four `Ongoing` and two `Completed` documents land correctly by
   accident. The two `Ready Possession` ones (Heights, Enclave) match no listing
   at all, and nothing is filed as Redevelopment, which is why that page shows
   placeholder cards. `stage` is `required` in the schema, so anyone editing a
   document will be made to pick one; the backlog is the eight that already
   exist.

### A recovery happened — read this before trusting a detail

On 26 Sep a regex in this session matched a CSS comment instead of the JS block
it was aimed at and **deleted most of all eight HTML files**. They were rebuilt
from three sources: `contact.html` from the editor's local history (that morning's
state, and the authoritative copy of the shared chrome), `project.html` from a
backup plus saved Section VI blocks, and the other six from the **August Netlify
deploy** with every subsequent change re-applied from the session transcript.

Everything known to have been in the files has been restored and verified, and
`assets/`, `studio/` and all photography were never touched. But the four
Netlify-derived pages were reconstructed rather than recovered, so **a small
detail could have been missed**. If something looks subtly wrong — a spacing
value, a comment, a copy tweak — treat "it was lost in the rebuild" as a live
possibility rather than assuming it was never there.

Working copies are kept outside the repo, in this session's scratchpad under
`recovery/`: `damaged/` (the broken files), `aug/` (the de-Netlified August
copies), and two snapshots taken during the rebuild.

### Verified working

Nav dropdown, mobile sheet, adaptive light/dark navbar, hidden scrollbar, loader
and its `onIntro` handoff, favicon set, footer logo — all eight files, at parity.
Home: About plate, the four counters, RERA/CREDAI strip, Signature, Why team
plate, 32 Brands cards across six tabs. Collection: 8 cards, city chips, status
filter, Western Line banner. Ongoing: 4 cards + its own banner. Redevelopment:
3 placeholder cards. Detail page: hero, thumb strip, fact bar, amenities, map,
and Sanity hydration via `?p=<slug>`.

### Open decisions for the client

- **13+ years** (Section II) contradicts the 2004 timeline and the "Est. 2004"
  seal artwork. One founding date has to win; the seals are images, so that side
  needs a re-export, not a code change.
- **The services philosophy plate has a typo painted into it** — "feel as
  carefully designed the homes we create", missing the second "as". The live
  copy below 820px is correct, so the page says two different things depending
  on width. Only a redraw fixes it.
- **Neither form has a backend.** The contact form and the 30-second lead
  popup both validate and swap to a thank-you state; nothing is sent. Wire both
  to Netlify Forms before launch or every enquiry is lost — the popup matters
  most here, since it is the one that actively asks.
- Testimonials are written copy, not real clients.

### Deleted in the cleanup (recoverable from git)

`quote-strip.png`, `service_side.png`, the twelve `assets/projects/*.png`
project marks and the root-level source art (`Generate_*.jpeg`,
`Minimalist_*.jpeg`, `generate_*.jpeg`, `download.png`) were all removed once
version control existed — 23 files, ~8MB, none of them referenced by any page.
They are in the initial commit, so `git show <commit>:<path> > <path>` brings
any of them back if a removed section is ever wanted again.

## Previewing and verifying

Open the file directly in a browser, or serve the directory when you need real HTTP (relative image paths, `curl` checks):

```bash
python3 -m http.server 8000        # then http://127.0.0.1:8000/index.html
```

There is no automated test suite. Verification is manual/headless-browser:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --virtual-time-budget=9000 --window-size=1440,900 \
  --screenshot=out.png "http://127.0.0.1:8000/index.html"
```

Check at 1440×900, 1024×800 and 420×860; scroll the full page; confirm no console errors, all reveals firing, and no collision between content and the fixed navbar. Add `--force-prefers-reduced-motion` to exercise the reduced-motion branch. The layout is designed to hold with photography blocked, so also check with the network off.

## The pages

`index.html` — four sections in scroll order:

| # | Section | id | What it does |
|---|---------|-----|--------------|
| I | Hero | `hero` | Night skyline (inline base64 JPEG), "Live Above The City", line-mask entrance, mouse parallax, property-selector form. |
| II | About | `about` | Ivory. Ghost word "Legacy" behind copy, architectural plate (`assets/about-plate.jpg`), four counting stats, then a full-width RERA / CREDAI-MCHI trust strip (`.ab-creds`, a sibling of `.ab-inner`, not inside the content column). |
| III | Signature Projects | `signature` | Four project cards, corner blueprint decor with slow parallax, rotating seal. The section now ends on the card grid, so its **bottom** padding alone sets the run into Why — it mirrors `.about`'s (`clamp(5rem,14vh,140px)`) rather than its own top. |
| IV | Why Raajlaxmi | `why` | Team photograph as the feature plate (`assets/why-team.jpg`), four numbered rows, a year timeline (2004→2026), closing quote + spinning seal. The auto-scrolling brand marquee (`.why-carousel`) that used to sit before the quote is gone — Section X replaced it. |
| X | Brands We Use | `brands` | Follows Why in scroll order. `OUR PARTNERS` header, six category tabs (All / Structure / Interiors / Electrical / Fittings / Utilities) and a card grid, all rendered from the `BRANDS` array in the Section X IIFE — adding a supplier is one line of data, no markup. Each row is `[name, logo file, trade, tab]`: `trade` is the line from the client's sheet and prints on the card, `tab` is the coarser bucket the tabs filter by. Johnson and Hindware appear twice on purpose, under two different trades. Its header (`.br-head` / `.br-label` / `.br-title` / `.br-intro`) is a **copy of Section IV's** rather than a shared rule — change one and the other will not follow. |

`projects.html` — one section, `#projects` ("Section V — Our Collection"): cards rendered from the `P` array in JS, city filter chips derived from each entry's location field, a **Western line corridor band** (`.cor`, between the pagination and the consultation strip) showing the delivered portfolio under four stations — Vasai / Nallasopara / Virar / Saphale. It is the client's finished banner used whole (`assets/projects/western-line.jpg`), **by explicit instruction — do not substitute a markup rebuild for it**; a `?status=` filter (exact case-insensitive match on `p.status`, ANDed with the active city chip, read once on load so the chips never clear it, with a `.col-empty` message when nothing matches) — the nav's **Completed** item deep-links to `?status=completed`, a "showing N of M" line, static pagination, and a consultation CTA. Cross-links back to `index.html#about` / `index.html#signature`.

`testimonials.html` — one section, `#testimonials` ("Section VII — Testimonials"): a five-entry carousel built from the `T` array, three cards visible with the centre one featured, circular arrows outside the track, pagination dots, and a closing consultation strip. The track holds every card and is translated so the active one sits under the viewport's midpoint (measured from live offsets, so it survives whatever width the clamp resolves to); a mask fades the cards leaving frame. The nav's Testimonials item points here from every page.

`services.html` — one section, `#services` ("Section IX — Services"), seven blocks: hero, philosophy, the five-step journey rail, six service cards, the six-step buying flow, a FAQ accordion and a closing CTA. Both rails fill their gold line from scroll position (`--fill` on `.sv-rail` / `.sv-flow`). Each block carries `data-rev` and gets its own observer, so the page reveals in movements rather than all at once. Its first two blocks are **finished artwork with the copy painted in**: `Services_start.png` is the hero band (`.sv-band`, full-bleed at its native 2164:380 — any max-height crops the label off the top; `.sv-mid` carries top padding so the plate below clears it rather than butting against it, which read as one accidental block of two photographs) and `assets/service-philosophy.jpg` is the philosophy plate (`.sv-side`, flush left at `--sv-side-w`, default 52%). The source artwork is 1376x768, **cropped on disk to 1376x513 (2.68:1)** — the extra height was empty cream above and below the copy and made the plate half again as tall as the banner. Any recrop must keep y150–635 of the original or it starts eating the paragraph, which is why it cannot reach the old 2.94:1 exactly. `--sv-side-w` is set by readability: much below ~40% the painted type stops being legible. The superseded `service_side.png` has been deleted (recoverable from git).
  - **The new plate's painted headline has a typo**: it reads "feel as carefully designed the homes we create", dropping the second "as". The live copy in the markup (which takes over below 820px) is correct, so the page says two different things depending on width. Only a redraw fixes the artwork. Both keep their copy in the markup for screen readers, and the plate swaps to live text below 820px where its painted type would render ~6px. **Everything else is an unfilled `.sv-slot` placeholder** reading `[INSERT … IMAGE HERE]` — to fill one, drop the inner `<span>` and set `background-image` on the slot; ratio, radius and shadow are already right.

`contact.html` — one section, `#contact` ("Section VIII — Contact"): the invitation and a 2×2 contact grid on the left, a floating consultation card on the right, then the location card + drawn map and a closing CTA. **The form has no backend** — the submit handler validates, then swaps the card to a thank-you state and nothing is sent. Wire it to Netlify Forms (`name="contact"` + `data-netlify="true"` on the `<form>`) or an endpoint before launch, or enquiries are lost. Deliberately carries no corner artwork, per the brief.

**Every consultation CTA on the site points here**: the nav/sheet `Book Consultation` on every page, `Schedule a Consultation` (collection), `Book a Private Consultation` (testimonials) and `Schedule a Site Visit` (detail page) — the last three deep-link to `contact.html#ctForm`, which scrolls the card into view.

`project.html` — one section, `#project` ("Section VI — Project Detail"), **rebuilt from the client's mock** and currently written for **Romal Kirti only**. Two columns: the left bleeds to the viewport edge and carries the photography and the place (hero with painted-on copy, crossfading slides, arrows, slide ticks, a four-up captioned thumb strip, then the Prime Location block with three landmarks and a map); the right is a padded rail of facts (breadcrumb, kind, title, location, a four-cell fact bar, Project Highlights, six amenity chips, two CTAs and the contact line). Arrow keys still drive the gallery. The location map is drawn as inline SVG rather than embedded — no third-party script, works offline.

**The tabbed card is gone.** The old Project Overview / Floor Plans / Amenities / Location Map tab set, the `#amenities`-style hash linking, the persistent enquiry rail and the corner artwork were all removed with it — every fact is now on screen at once. `floorPlans` is no longer queried from Sanity or rendered anywhere; the data is still in the CMS, it just has nowhere to go on this layout.

`.pd-hero` carries `width:100%` and that is load-bearing: with `aspect-ratio` and `min-height` but no definite width, the browser resolves the ratio against the min-height instead and the hero grows wider than its column, silently clipping the hero copy on phones.

**One page, every property.** `project.html?p=<slug>` looks the project up in
Sanity by `slug.current` and paints the document over the markup — title,
kind, location, fact bar, gallery, overview, amenities, landmarks and (given a
`geo` pin) a live Google map. Collection cards link there automatically from
their slug, so a new property needs **no new file**.

The fact bar is filled from Sanity's free-form `specs[]` (first four label/value
pairs), falling back to config / price / status when a project carries no specs.
The hero's painted-on line ("Modern Living by the Arabian Sea") belongs to Romal
Kirti, so a hydrated project gets its own name and configuration there instead of
inheriting it.

One rule the hydration follows, load-bearing: an empty field *erases* what the
markup says rather than leaving it, and a block with no data removes itself
rather than rendering blank — otherwise every project would inherit Romal Kirti's
copy, figures and amenities.

Loaded **without** `?p=`, none of that runs and the file stands as the
hand-written Romal Kirti page — that is the fallback, and what
the home page's Signature Projects cards still link to.

## Architecture

**The `<head>` CSS is duplicated across all eight files.** Lines ~1–978 of `index.html`, `projects.html`, `projects-ongoing.html`, `projects-redevelopment.html`, `project.html`, `testimonials.html`, `services.html` and `contact.html` are the same stylesheet — base tokens, cursor, nav, mobile sheet, and the CSS for sections I–V — differing in only ~100 lines (title, nav/logo sizing on the inner pages). Each page then renders only its own sections. **Any edit to shared chrome (nav, `.nav-wrap.on-light`, cursor, burger/sheet, `:root` tokens, the hidden page scrollbar) must be applied to all eight files or the pages drift.** The page scrollbar is hidden by request (`html{scrollbar-width:none}` + `html::-webkit-scrollbar{display:none}`); it is scoped to `html`, **not** `*`, on purpose — the scrollbar on `.cor-figure` is the only cue that the line-map banner pans sideways on a phone, so a blanket rule would break that.

**Page loader.** The **first** page of a visit opens with a navy cover (`.ld`, the first child of `<body>`) carrying the mark and a gold rule that creeps in CSS. Four things about it are load-bearing:

- It plays **once per tab session, not once per page**. Each page here is its own document, so without a flag the cover would replay on every nav click and the site would feel like it reboots on every link. The head script sets `rl-intro-seen` in `sessionStorage`; when it is already set the script adds `.ld-skip` to `<html>`, injects `html.ld-skip .ld{display:none!important}` and removes the cover on `DOMContentLoaded`, firing the `onIntro` queue immediately. Because that runs in `<head>`, ahead of `<body>`, the cover is suppressed *before* it can paint rather than hidden after a flash. A new tab, or a later visit, is a new arrival and gets the cover again — switch the two `sessionStorage` calls to `localStorage` to show it only once per browser instead. Both accessors are wrapped in `try/catch`: in private mode a throw simply falls through to playing the cover.

- It is a **cover over the page, not a hidden body** — the content is in the DOM throughout, so crawlers and no-JS visitors still get it, and a `ldFailsafe` keyframe lifts the cover at 7s even if the script never runs.
- Its script lives in **`<head>`, not the trailing `<script>`**. On `index.html` the trailing script sits behind ~660KB of inline base64 and does not execute for a second or more; arming the deadline there left the cover up longest on the page that needed it least. Both timings (`MIN` 900ms, `MAX` 3000ms) are measured from navigation, not from script execution.
- The bar creeps **in CSS** for the same reason — a JS-driven bar sat dead while the page was visibly still working.

**Lead popup.** A dialog (`.lead` / `#leadModal`, last element before the trailing script) that opens **30 seconds into a visit** and asks for name, phone, email and interested location over a blurred backdrop. Four things about it are deliberate:

- The 30s is measured **from arrival, not from page load**. Each page here is its own document, so a per-page timer would restart on every nav click — a visitor clicking around every 20s would never see it, and one sitting still would see it again and again. The arrival timestamp lives in `sessionStorage` (`rl-visit-start`) and the delay is measured from it, floored at 1.5s so it can't slam open mid-navigation.
- It shows **once per tab session** (`rl-lead-seen`) and never again once submitted (`rl-lead-done`, in `localStorage`). Every storage access is wrapped in `try/catch` — private mode falls through to default behaviour rather than throwing.
- **It is suppressed on `contact.html`**, which already *is* this form; covering it with a duplicate is the one place the popup would actively get in the way.
- The blur is `backdrop-filter` on `.lead-scrim`, with an `@supports not` fallback that takes the scrim to near-opaque where the property is unavailable, so the card is never read against live page content. It sits at `z-index:900` — above the nav (100), below the loader (9999), so the cover is never what the backdrop is blurring.

Its location list is the `LOCATIONS` array in the IIFE (one line to edit) and the `<select>` is populated from it. **Like the contact form, it has no backend** — it validates, swaps to a thank-you and sends nothing.

Anything that should animate in after the cover lifts registers with **`window.onIntro(fn)`**, not `window.load` — on load the cover is still up and the sequence would play out of sight. `index.html`'s hero choreography is the only current caller. When the cover is removed the block fires a synthetic `resize`, because the adaptive nav sampled the cover rather than the page and would otherwise be stuck in the wrong state. The two status pages are clones of `projects.html`, so they duplicate its whole Section V as well — a fix to a collection card, chip or the Sanity query has to be made in three files, not one. That now includes the Projects dropdown: `.nav-drop` / `.nav-menu` in the bar and `.sheet-sub` in the mobile sheet, both present in all eight files. The menu is pure CSS — `:hover` plus `:focus-within` for keyboards — with an invisible `::after` bridge spanning the gap so the pointer can travel down without it closing. It sits inside `#navWrap`, which the adaptive-nav sampler skips wholesale, so it cannot confuse the light/dark detection. Section-specific CSS still lives only where it is used, under its `/* ===== SECTION N — NAME ===== */` banner; `project.html`, `testimonials.html`, `contact.html` and `services.html` each append their own section block (VI–IX) after that shared run.

**One IIFE per section, in markup order.** The trailing `<script>` opens with shared behavior (entrance choreography, navbar scrolled state, mouse parallax, custom cursor + magnetic buttons, mobile menu), then one self-contained IIFE per section, then the adaptive-nav block. Each IIFE owns its own `IntersectionObserver`s and scroll-progress math — no shared state between sections, so a section can be rewritten or ported (GSAP `ScrollTrigger`, Framer `useScroll`) in isolation.

**Markup conventions** (wired up by the shared script, so they work on every page):

- `data-hover` — element grows the custom cursor ring
- `data-magnetic` — button pulls toward the pointer
- `data-cursor-gold` — cursor softens to a gold circle over imagery
- `data-anim` — entrance-choreography participant
- `data-to` + `data-suffix` — counter target; counts once when its section arrives
- `.in` on a wrapper — the reveal class every section's observer adds

**Adaptive navbar** (last IIFE, every file). It samples the actual painted background behind `#navWrap` at three x-positions per scroll tick, averages relative luminance, and toggles `.on-light` (charcoal text) above a threshold of 150. Reading the live background rather than tagging sections means it keeps working when light sections are added. Full-bleed overlays that darken a light section from above carry `pointer-events:none`, so `elementsFromPoint` can't see them — they're listed in the `DARK_OVERLAYS` array (currently `['veil']`) and tested by geometry/opacity instead. **If you add another full-bleed dark overlay, add its id to `DARK_OVERLAYS` in all eight files.**

**Single-column grid tracks need `minmax(0,1fr)`, not `1fr`.** A `1fr` track floors at its content's min-width, so one nowrap child (the detail page's tab row) inflates the whole column past a narrow viewport instead of scrolling inside its own `overflow-x:auto` container. Every stacking rule in the Section VI media queries uses `minmax(0,…)` for this reason.

**Clipped elements report zero intersection.** Anything hidden with `clip-path: inset(0 0 100% 0)` never fires an `IntersectionObserver` watching it directly — being clipped is what suppresses the observer that would reveal it. Always observe an unclipped wrapper and add the reveal class to a child.

**Motion.** `transform` and `opacity` only — no layout-triggering properties. Easing is `cubic-bezier(.16,1,.3,1)` throughout, exposed as the `--lux` CSS var and the `LUX` JS const (`--lux-2` for secondary moves). Every page has a `prefers-reduced-motion` branch: five `@media (prefers-reduced-motion:reduce)` blocks unclip and settle the compositions, and the script's `reduce` flag skips scroll-driven effects. Preserve that branch when adding effects.

## Content management (Sanity)

`studio/` is a Sanity Studio whose only schema is `project` — one document per
project. It feeds **all three collection pages and the detail page**
(`projects.html`, `projects-ongoing.html`, `projects-redevelopment.html`,
`project.html?p=<slug>`); every other page is still hand-edited HTML.

**`stage` is the field that decides which listing a project appears on** —
`completed` / `ongoing` / `redevelopment`, required, radio. `status` is now only
the badge text on the photograph and is optional: blank falls back to the stage's
label. That split is what lets a Completed project carry a "Ready Possession"
badge, which the old single field could not express.

The Studio's sidebar has one folder per stage (`sanity.config.js` → `structure`),
and creating a project inside a folder pre-fills its stage via the
`project-by-stage` initial-value template — so the stage cannot be forgotten. A
**Not yet filed** folder lists anything with no stage set, so a stray document
can't go invisible. Renaming any of the three stage values means changing it in
`STAGES` in the config *and* in `STATUS` / `STAGE_LABEL` in all three pages.

The pages read `stage` through `stageOf(p)`, which falls back to `p.status` for
documents written before the field existed — so the migration is not a flag day.
`Ready Possession` documents match no listing until someone sets their stage.

**"View Details" resolves per card** through `detailHref(p)`: an explicit
`detailUrl` wins, otherwise `project.html?p=<slug>`, otherwise `#`. Since `slug`
is required on the schema, every published project gets a working detail link
with nothing to configure.

`projects.html` reads it with a single GROQ query over plain HTTP in its Section V
IIFE — no SDK, no build step, no token, so the no-dependency rule still holds.
The eight cards written into the file are the fallback: they render when
`SANITY.projectId` is blank, when the query fails, and when the dataset is empty,
so the page can never come up empty. Card data moved from the old positional
tuples to named fields (`p.name`, `p.status`, …) so the CMS and the fallback
share one shape.

The Studio is hosted at <https://raajlaxmi.sanity.studio> (project `lc9w15ba`);
`npm run deploy` in `studio/` republishes it after a schema change.

Setup — project id, CORS origins, dataset visibility — is in `studio/README.md`.
**The id must be set in five places**: `studio/.env` and the `SANITY` block in
`projects.html`, `projects-ongoing.html`, `projects-redevelopment.html` and
`project.html`. Renaming a schema field means renaming it in each of those GROQ
queries too.

Note the Studio's source sits inside the Netlify publish directory, so its config
files ship with the site. They hold nothing secret (a Sanity project id is public
by design, and `.env` is gitignored), but don't put a write token there.

## Photography and assets

Photography is a mix of committed local files and `picsum.photos` placeholders layered over a tonal gradient fallback (so the composition holds offline).

- Committed and referenced: `seal-top.png`, `seal-bottom.png`, `sketch-tower.jpg`, `house-sketch.jpg`, `floor-plan.jpg`, `floor-plan-l.jpg`, `assets/project-blueprint-left.png`, `assets/project-floral-right.png`.
- `assets/cert-maharera.png` and `assets/cert-credai-mchi.png` are the accreditation marks in Section II's `.ab-creds` row, cut out of one flat client sheet and keyed transparent. Their captions are live HTML, not baked into the artwork, so they reflow and stay readable — keep it that way if the marks are ever re-exported.
- `assets/projects/western-line.jpg` is the corridor banner (1923x514, JPEG q94 — PNG was 498KB for no visible gain). Its copy is painted into the artwork, so the same content is written out in the `img`'s `alt` for screen readers and search. The band's background is set to the artwork's own ground (`#F4F0EF`) so the banner dissolves into it rather than showing as a rectangle, and one stray white pixel column was cropped off the left edge to make that work.
- The banner is 3.7:1 with baked-in type, so below 760px it would render the station names at ~6px. It is put in a horizontal scroller at a fixed 900px instead.
- The 12 individual `assets/projects/*.png` marks were left over from an earlier markup rebuild of this band and have been **deleted** (~300KB, recoverable from git if the banner is ever rebuilt). Only `western-line.jpg` and `western-line-ongoing.jpg` remain in that folder.
- `assets/logos/` holds **30 brand marks** for Section X. Nine were already committed; the other 21 were cut out of the client's category sheet, so they are only ~175px wide — fine at display size, soft on a retina screen. Swap in vendor-supplied files when they arrive. **All 30 have been trimmed to their ink**, because each carried its own padding and the grid's sizing depends on them being tight; re-trim anything you replace.
- Section X fits every mark into an identical box with `object-fit:contain` rather than capping height alone — capping height left a 3x spread in optical weight between a wide lockup and a square roundel.
- `assets/why-team.jpg` is the Section IV feature plate (the group photograph, 2000×1332). The plate is ~2.2:1 while the photo is 3:2, so the CSS biases the crop to `center 72%` to keep the front row's feet in frame, and below 820px the plate switches to `aspect-ratio:3/2` so a phone shows the whole line-up instead of cropping both ends off it.
- Still placeholders: four `picsum.photos/seed/rl-*` URLs in `index.html` — the Signature Projects cards (Heights / Villa / Crest / Essence) — plus the seeded card art in the `projects.html` fallback list (real card images now come from Sanity). Replace by swapping the URL in the inline `background-image` (or the Sanity document) for the real asset. Earlier notes here claiming ten placeholders were stale.
- The About plate is `assets/about-plate.jpg` (excavator on site, 810×1212), set as `background-image` on `.ab-photo` in CSS. It used to be copied off the hero by the About IIFE; that JS is gone, so **don't reintroduce an inline `style.backgroundImage` there** — it would override the stylesheet. The plate crops to `5/6.6` from the centre.
- `quote-strip.png` (the Vikram Raajlaxmi quote banner) has been **deleted** — Section III's `.sp-quote-img` figure was removed earlier. Recoverable from git if the quote is ever wanted back.
- The root-level `Generate_*.jpeg` / `download.png` / `Minimalist_*.jpeg` source art has been **deleted** — it was working material, not site assets. `footer.png`, `Services_start.png`, the seals and the sketches are all still referenced and remain.
- **Favicon**: `favicon.ico` (16/32/48, at the repo root so browsers find it unprompted) plus `assets/favicon-32.png`, `assets/favicon-192.png` and `assets/apple-touch-icon.png` (180). All eight pages link them from `<head>`, right after `</title>`. Cut from the logo's building glyph with its dark ground **keyed out to transparency** (unmatted, so no dark fringe survives onto a light tab bar), squared up and centred with ~12% margin — the mark has to survive being read at 16px, so it sits deliberately large in frame.
- The logo ships as **two external PNGs**, `assets/logo.png` (brown/charcoal ink, for ivory grounds) and `assets/logo-light.png` (gold/cream ink, for the dark navbar **and the footer** — `.ft-mark`, which used to be the word RAAJLAXMI set in Cinzel with a tagline span under it; the artwork already carries both, so the text version was removed), both ~17KB with a transparent ground. The nav carries both stacked inside `.brand`; `.nav-wrap.on-light` crossfades between them via opacity, replacing the old `filter:` hack. Regenerating either from a new master means keying out its flat background and re-cutting both variants — edit them as a pair or the two states drift.

## Known content placeholders

**`projects-ongoing.html` / `projects-redevelopment.html`** are copies of `projects.html` with four differences: the `<title>`, the `.col-head` label/title/intro, `STATUS` hard-coded instead of read from the URL, and the Western Line banner swapped: the ongoing page carries its own (`assets/projects/western-line-ongoing.jpg`, "Rising Along the Western Line" — Vasai / Virar / Saphale, five projects), the redevelopment page carries none. Both banners are client artwork used whole, same rules as the completed one: the band takes the artwork's ground colour so it dissolves, and below 760px it scrolls sideways at a fixed 900px because the station names are painted in. The redevelopment page additionally carries **placeholder cards** and one extra rule in its Sanity handler — `if(!result.some(inStatus)) return;` — so the live list is ignored while it contains no redevelopment project, which would otherwise blank the page. Publish one with that status and the placeholders are never seen again.

- **No project is filed as Redevelopment yet**, so that page shows three clearly-marked placeholder cards (`[Society name]`, `[Locality]`, `[n] BHK`). Set one project's **Listing** to Redevelopment in the Studio and they disappear for good. Likewise the two `Ready Possession` documents are in no listing until their Listing is set to Completed.
- **Project names differ between pages.** `index.html` Signature Projects lists Heights / Villa / Crest / Essence; `projects.html` lists those plus Business Square, Enclave, Skyline, Vista. Keep the two consistent when adding projects.
- **Every testimonial is written copy**, not a real client — quotes, names and portraits in the `T` array all need replacing before launch. This is the one section whose entire value is that it is true.
- `project.html` carries its own placeholders, each marked with a `PLACEHOLDER` comment: **every figure in the fact bar** (~1,15,000 sq.ft, 8 towers, ~640+ units, Completed) is from the client's mock and unverified, as are the landmark distances and the direct line. Its five gallery shots are seeded `picsum.photos/seed/rl-rk-*` placeholders. "Request Brochure" has no brochure behind it and points at the enquiry form.
- Romal Kirti **is** now published in Sanity and appears in the collection, so `project.html?p=romal-kirti` is reachable from a card. The hand-written fallback in `project.html` (used when the page is opened with no `?p=`) is still the unverified mock content.
- Most nav links and CTAs are `href="#"`; only Projects and the cross-links resolve. Section II's "Discover our story" button and the "Raajlaxmi Group / Building trust. Creating legacy." signature are both gone — the accreditation strip replaced them, so About no longer offers a CTA or a sign-off of its own.
- Section IV's statistics panel (`.why-stats`, the old 20+ / 1500+ / 45+ / 98% placeholders) has been **deleted** — markup, CSS, counter JS and all. Section II's row is now the only set of figures on the page. Its `.why-float` interior card went with it: it overlapped the team photo and hid a dozen faces.
- 13+ years in Section II contradicts the timeline (2004→2026) and "Est. 2004" on the seals (`seal-top.png`, and the Section VII strip art) — those imply ~22 years. Pick one founding date and make the artwork, timeline and counters agree.
- The About counters take `data-to` / `data-suffix` plus two additions: `data-dec` (decimal places, so 0.9 does not round to 1) and `data-unit` (a word set in ink between the figure and the gold suffix, e.g. "Million"). They are the only counters left on the page.

## Performance follow-ups (not yet done)

1. `index.html` carries ~665KB of base64 (the hero JPEG) of a 773KB file. Extract to external AVIF/WebP with `srcset`. (The logo is already external — see Photography and assets.)
2. Subset or self-host the Google Fonts (Archivo Black, Cinzel, Cormorant Garamond, Inter, Playfair Display — five families on every page).
3. Give the hero plate `fetchpriority="high"` to improve LCP.
