# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An **eight-page** static marketing site for Raajlaxmi Group: `index.html` (home), `projects.html` (browse-all collection, and the Completed view via `?status=completed`), `projects-ongoing.html` and `projects-redevelopment.html` (the same collection UI locked to one status), `project.html` (one property's detail page), `testimonials.html` (client voices), `services.html` and `contact.html` (enquiry page). No build step, no package manager, no dependencies, no test suite. Each page is one self-contained document — `<style>` in `<head>`, markup in `<body>`, one `<script>` at the end — plus a handful of loose image files in the repo root and `assets/`.

Deployed to Netlify from the CLI. There is no build step — but **do not publish the repo root**: `studio/node_modules` lives there now. Publish a `git archive` export instead; see *Where this stands*.

`README.md` was rewritten on 26 Sep and now describes this build accurately (it previously documented a seven-section, single-file version that no longer exists). It is the public GitHub landing page; **CLAUDE.md is the detailed reference** — keep architecture notes here, not there.

## Where this stands (handover, 30 Oct 2026)

The site is **built, deployed and live** at
<https://raajlaxmi-site.netlify.app> (Netlify team `magnus realtorsmktg`,
deployed from `magnusrealtorsmktg-coder/raajlaxmi-site` on GitHub), and **almost
every page is now driven by Sanity** — see *Content management*. Construction is essentially done.
What remains is **content** the client has to supply, plus the two launch
blockers below.

### Deploy: pushing to main is the deploy

The site is a Netlify project connected to this GitHub repository, so **`git
push origin main` publishes it** — there is no build command and no deploy
command to run. Netlify clones only the tracked files (87 of them, ~8.5MB),
which is why this is the safe arrangement: `studio/node_modules` is 562MB
across 46,000 files and lives in the working directory, not the repository.

`netlify.toml` at the repo root carries the whole configuration (`publish = "."`,
no build command). `.netlify/` is gitignored local CLI state and is **not**
deploy config — its `publish` still points at one laptop's absolute path.

**If you ever deploy from a laptop anyway**, never run a bare `netlify deploy`
from here: it publishes the *working directory*, `node_modules` and all. Export
the commit first:

```bash
rm -rf /tmp/rl-deploy && mkdir -p /tmp/rl-deploy
git archive HEAD | tar -x -C /tmp/rl-deploy
netlify deploy --prod --dir=/tmp/rl-deploy        # ~87 files, 8.6MB
```

**The Studio deploys separately** (`cd studio && npm run deploy`) — it
republishes the editing interface and does nothing to the website.

**Every origin the site is served from must be listed in Sanity's CORS
allowlist** (manage.sanity.io → project `lc9w15ba` → API → CORS origins,
credentials off). This is the one setting that breaks the site *silently*: a
missing origin does not error, it falls through to the placeholder content
written into the HTML — eight fictional Mumbai projects and five invented
testimonials. Adding a custom domain later means adding that origin too.

**Netlify rewrites the HTML it serves.** Asset post-processing reorders
attributes, re-quotes them and strips `.html` from hrefs, so the live
`projects.html` says `href='/projects?status=completed'` where the repo says
`href="projects.html?status=completed"`. Both spellings are served (the `.html`
URLs still return 200, no redirect), and JS-built links are untouched — which is
why the banner hotspots still emit `project.html?p=<slug>` and still work. Grep
the *repo* rather than the live page when checking whether something shipped.

**Claude Code cannot run a CLI production deploy**: the auto-mode classifier
blocks it as `[Production Deploy]`, and blocks editing
`.claude/settings.local.json` to loosen that as `[Self-Modification]`. The
`Bash(netlify deploy *)` permission rule is present and is *not* what stops it.
Since pushing is now the deploy, **a push to `main` publishes to production** —
treat it as the outward-facing action it is and confirm before pushing.

### Verifying locally — and one headless trap

Serve the directory and check in a headless browser (recipe below). One thing
will mislead you: **headless Chrome throttles `requestAnimationFrame` to about
three frames a second**, so anything rAF-driven looks frozen locally even when
it works in a real browser. It also often never plays the hero entrance, which
leaves the navbar and hero copy invisible in screenshots. Prefer, in order:
computed styles via a sized `<iframe>` harness; CSS animations (they advance
with `--virtual-time-budget`, so two screenshots at different budgets can be
diffed to prove motion); and `--force-prefers-reduced-motion` to settle
compositions. `--window-size` is honored for `--screenshot` but **not** for
`--dump-dom`, where `innerWidth` reports 756 regardless — size an iframe
instead of trusting that number.

### The two launch blockers

- **Neither form has a backend.** The contact form and the 30-second lead popup
  both validate, swap to a thank-you and **send nothing**. The popup is the
  sharper problem: it asks every visitor for a phone number 30 seconds in and
  discards it. Wire both to Netlify Forms (`name="contact"` +
  `data-netlify="true"`) before launch.
- **The project detail pages are nearly empty.** Of 14 projects: **0 have a
  gallery, 1 has an overview, 1 has specs, 1 has a price, and 7 of 14 have a
  configuration**. Cards look right; `project.html?p=<slug>` is sparse, and the
  7 with no configuration cannot appear in any property-type search.

### Content the client still owes

| Thing | State on 30 Oct |
|---|---|
| Projects | **14, all filed `completed`** — so the Ongoing page is empty and Redevelopment still shows its 3 placeholder cards |
| Reviews | **6 real Google reviews**, all with Google links — the invented five are gone from the CMS |
| Client photo slider | empty, so the whole block stays hidden |
| Social handles | none set, so the footer row removes itself |
| Hero background | a photograph is set; no video |

Setting any project's **Listing** to Ongoing or Redevelopment fills those pages
and retires the placeholders for good.

### Open decisions for the client

- **13+ years** (Section II) contradicts the 2004 timeline and the "Est. 2004"
  seal artwork, which imply ~22 years. One founding date has to win; the seals
  are images, so that side needs a re-export, not a code change.
- **The services philosophy plate has a typo painted into it** — "feel as
  carefully designed the homes we create", missing the second "as". The live
  copy below 820px is correct, so the page says two different things depending
  on width. Only a redraw fixes it.
- **The associates plate carries three copy errors** (see *Photography*), and
  the **contact page and footer print different phone numbers**
  (`+91 9890823288` vs `+91 77740 00939`). Both are CMS-editable now; someone
  has to say which is right.
- `project.html`'s hand-written fallback (no `?p=`) is still the client's
  unverified mock: fact-bar figures, landmark distances and the direct line.

### History worth knowing

On 26 Sep a regex matched a CSS comment instead of the JS block it was aimed at
and **deleted most of all eight HTML files**. They were rebuilt from the
editor's local history, a backup and the August Netlify deploy. Everything known
to have been in them was restored and the pages have been edited and verified
many times since, so this is unlikely to bite now — but if some small detail
looks subtly wrong (a spacing value, a stray comment), "lost in the rebuild"
remains a live possibility. **The repo has been under git since 26 Sep**, which
is the real fix.

`quote-strip.png`, `service_side.png`, the twelve `assets/projects/*.png` marks
and the root-level source art were deleted once version control existed — 23
files, ~8MB, none referenced. `git show <commit>:<path> > <path>` brings any of
them back.

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
| I | Hero | `hero` | Night skyline (inline base64 JPEG), "Live Above The City", line-mask entrance, mouse parallax, property-selector form. **All of its copy, and the three dropdown lists, come from the `homepage` singleton** — the four localities hard-coded in the markup (Gomti Nagar, Hazratganj, Sushant Golf City, Vibhuti Khand) are in **Lucknow**, not this developer's corridor; the seeded CMS values replace them with Vasai / Nallasopara / Virar / Saphale. |
| II | About | `about` | Ivory. Plate showing **the CMS's About video** (`assets/about-plate.jpg` is only the fallback underneath it), four counting stats, then a full-width RERA / CREDAI-MCHI trust strip (`.ab-creds`, a sibling of `.ab-inner`, not inside the content column). **It holds exactly one screen** — see *The About section holds one screen*. The ghost word "Legacy" that used to sit behind the copy is gone, markup, CSS, parallax and schema field alike. |
| III | Signature Projects | `signature` | Four project cards, corner blueprint decor with slow parallax, rotating seal. The section now ends on the card grid, so its **bottom** padding alone sets the run into Why — it was written to mirror `.about`'s old `clamp(5rem,14vh,140px)`, which **no longer exists**: About was rebuilt to one screen and its padding is now much tighter, so this value is a standalone constant that only looks like it is paired with something. |
| IV | Why Raajlaxmi | `why` | Team photograph as the feature plate, **shown whole and sized to fit one screen** (see *The Why plate shows the whole photograph*), four numbered rows, a year timeline (2004→2026), closing quote + spinning seal. The auto-scrolling brand marquee (`.why-carousel`) that used to sit before the quote is gone — Section X replaced it. |
| X | Brands We Use | `brands` | Follows Why in scroll order. `OUR PARTNERS` header, six category tabs (All / Structure / Interiors / Electrical / Fittings / Utilities) and a card grid, all rendered from the `BRANDS` array in the Section X IIFE — adding a supplier is one line of data, no markup. Each row is `[name, logo file, trade, tab]`: `trade` is the line from the client's sheet and prints on the card, `tab` is the coarser bucket the tabs filter by. Johnson and Hindware appear twice on purpose, under two different trades. Its header (`.br-head` / `.br-label` / `.br-title` / `.br-intro`) is a **copy of Section IV's** rather than a shared rule — change one and the other will not follow. |

`projects.html` — one section, `#projects` ("Section V — Our Collection"): cards rendered from the `P` array in JS, city filter chips derived from each entry's location field, a **Western line corridor band** (`.cor`, between the pagination and the consultation strip) showing the delivered portfolio under four stations — Vasai / Nallasopara / Virar / Saphale. It is the client's finished banner used whole (`assets/projects/western-line.jpg`), **by explicit instruction — do not substitute a markup rebuild for it**. **Its twelve painted logos are clickable**: `.cor-hot` boxes inside `.cor-map` lie over the artwork as percentages of it, so they ride the image at every width — including the 900px plate inside the phone scroller, which is why the img is wrapped in `.cor-plate` (`.cor-figure` becomes the narrower scroll container and cannot be the positioning context). The boxes are measured from the ink, so **a recrop or a replacement banner invalidates all twelve**; `paint()` removes the whole layer if the CMS supplies a banner that is a *different* picture. It tells them apart by **SHA-1**: Sanity names an uploaded asset after the hash of its bytes, so the check is exact rather than a guess — and the usual answer is that they are the same file, because `seed-collections.mjs` uploaded this very banner and the live page therefore serves it from the CDN under a different URL. **Replacing `western-line.jpg` means updating `ART` in that guard**, or the boxes vanish the moment the CMS copy is re-uploaded. Each box carries `data-project` — the name *as the artwork paints it* — and `wireBanner()` matches it against the published projects to set the href, so a slug fixed in the Studio is picked up with no code change. `nameKey()` does the matching and is deliberately forgiving: it folds case and punctuation, collapses doubled letters (`Raajlaxmi`/`Rajlaxxmi` → `rajlaxmi`, `Pearrl` → `pearl`) and drops a trailing plural (`Towers` → `tower`), because the banner and the CMS do not spell the names the same way. **A box with no published project stays inert** — no href, no pointer, no hover tint; `Midas Heights` is painted on the banner but has no document, so today it is the one logo that does not respond. The layer is also inert with Sanity unreachable, which is correct: `project.html?p=` needs Sanity to render anything anyway; a `?status=` filter (exact case-insensitive match on `p.status`, ANDed with the active city chip, read once on load so the chips never clear it, with a `.col-empty` message when nothing matches) — the nav's **Projects** item *and* its **Completed** sub-item both deep-link to `?status=completed`, so the bar reaches the Completed view whether or not the dropdown is used and the browse-everything view is now reached only from the footer and the in-page "See the whole collection" / "Clear filters" links, a "showing N of M" line and a consultation CTA. **The pagination is gone** — the 1/2/3 buttons were decorative markup that never paged anything (every matching card always rendered), so they promised a second page that did not exist. Cross-links back to `index.html#about` / `index.html#signature`.

`testimonials.html` — one section, `#testimonials` ("Section VII — Testimonials"): a **continuously scrolling marquee** of review cards, a hidden client-photo slider under it, and a closing consultation strip. The reviews come from Sanity (the five written into the `T` array are only the fallback); each card carries the reviewer's initials rather than a photograph, and a Google button when that review has a link. The arrows and dots are `display:none` — a strip with no discrete slides has nothing for them to point at. All the detail is under *Content management → Testimonials*. The nav's Testimonials item points here from every page.

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

The detail page's remaining hard-coded text is now editable too, under the
**Detail page** fieldset: `heroEyebrow` / `heroHeading` / `heroText` (the copy
painted over the gallery — blank falls back to the category, the name and the
configuration-plus-location line), `highlightsTitle`, `brochureUrl` (blank sends
"Request Brochure" to the enquiry form) and `phone`. The direct line is **removed
outright when no number is set** rather than printing the invented mock one, and
the Project Highlights heading is removed along with its paragraph when a project
has no `overview` — a heading left standing alone reads as content that failed to
load.

**Price** is its own field on every project and shows in two places: a gold line
on the collection card, between the configuration/area row and "View Details",
and a larger gold line on the detail page between the location and the fact bar
— the order a buyer reads in (what it is, where it is, what it costs, then the
detail). It is **absent from the fact-bar fallback on purpose**: printed there
as well it read as two different numbers at a glance. A project with no price
shows no line at all in either place rather than an empty row, and the field now
sits beside Area in the Studio rather than inside the collapsed *Detail page*
fieldset, because it is card content as much as detail content.

The fact bar is filled from Sanity's free-form `specs[]` (first four label/value
pairs), falling back to config / status when a project carries no specs.
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

**The About section holds one screen.** The client's complaint was that the
counting stats were cut off at the fold. `.about` is now
`min-height:100svh` (with `100vh` first as the fallback) and a centred flex
column, and **every vertical step inside it is sized in `vh` rather than `rem`**
so the whole composition shrinks with the window instead of spilling past the
fold. Four things are load-bearing:

- **The top padding clears the fixed navbar**, which is 76–122px depending on
  width and scroll state. Once the section is exactly one viewport, that padding
  is the only thing keeping the eyebrow out from under the bar, and it has to
  grow with **both** axes — `clamp(7.2rem,calc(6.2rem + 4vh),8.4rem)`. A `vh`-only
  value left the label buried at 1536px wide, where the bar is tallest.
- **`.ab-photo` is sized by HEIGHT, not width** —
  `height:min(62vh,600px,42vw); width:auto; aspect-ratio:5/6.6`. The client put a
  **630x830 video** in the About plate, which is that exact ratio, so driving the
  box off the available height and letting the width follow is what shows the
  whole frame. Width-driven it had to be ~785px tall, which is what put the stats
  past the fold to begin with. The **`42vw` third bound is load-bearing**: an
  explicit `height` beats `aspect-ratio` when `max-width` clamps the box, so on a
  tall-but-narrow window (1024x800) the plate held its height, lost its width and
  went off-ratio — letterboxing the video it exists to show whole.
- **The plate's video is `object-fit:contain`** (`.ab-photo .cms-vid`), unlike the
  hero's, which stays `cover`. Here the video *is* the content rather than a
  background, so a differently-shaped file letterboxes onto the plate's ground
  instead of losing its edges. Today's file matches the ratio to within 0.2%, so
  nothing letterboxes in practice.
- **The eyebrow sits over the right column, above the heading.** `.ab-top` mirrors
  `.ab-inner`'s grid — both read `--ab-col-a` / `--ab-col-b` / `--ab-gap` off
  `.about` — and the label is `grid-column:2`, so the two stay aligned at every
  width with no padding guesswork. Columns are **38fr/62fr** (was 48/52): the
  plate is height-driven now, so the extra width was dead space.
- **Never put `margin:0 auto` on a child of `.about` again.** It is a flex column,
  and an auto cross-axis margin beats `stretch` — which shrink-wrapped `.ab-top`
  to its one short span and parked it in the middle of the page. Use
  `width:100%` + `margin-inline:auto`.
- **Two step-down tiers**, `max-height:880px` and `max-height:700px`, trim the
  type, the cards and the marks further. They exist because **the CMS copy runs
  longer than the fallback written into the file** — against the real `homepage`
  document the first tier alone still left the trust strip 10px past the fold at
  1024×640. Verify against live Sanity data, not the markup fallback.
- Below `max-height:560px` it gives up and returns to natural flow: hiding
  content under the navbar is worse than a short scroll. Likewise **below 1000px
  it stacks and is no longer one screen** — the plate sits above the copy and it
  cannot be — but its top padding still clears the bar.

A long CMS heading is the thing that could still break it: there is no
`fitHeadline()` here as there is on the hero, so a heading that wraps to four
lines will push the strip past the fold again. Measured fits at 1440×900,
1536×864, 1366×768, 1280×800, 1024×800, 1024×640, 1280×620 and 1680×1050.

**Section II's CSS has drifted from the other seven files.** The `.ab-*` rules
live in the shared head stylesheet, so all eight files carry a copy — but only
`index.html` has the markup, so only its copy renders. The other seven were
already carrying an **older** version (the ghost word at `top:-.44em`, `.ab-text`
at 560px) before this change, and the one-screen rewrite was applied to
`index.html` alone. Treat the Section II block in the other seven as dead code;
do not "sync" it without checking which copy is current.

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

**Navbar legibility over photography.** The bar's links were `--paper-dim`, a 66%
cream, and the scrim behind them only appeared once the page had scrolled. With a
CMS hero that can be a bright sunset, that left the labels almost invisible on the
one screen that has a photograph behind them. The links are now full-strength
`--paper` with a soft shadow, the CTA has a firmer border and ground, and the scrim
is **on from the start and lifts under `.on-light`** instead — over ivory the type
is already charcoal and a dark veil there would be wrong. Shadows are cleared in the
`.on-light` state, where they only muddy charcoal.

**The `Book Consultation` button is a filled gold pill, and carries
`position:relative`.** That last part is load-bearing: `.nav-wrap::before` is the
scroll scrim and it is absolutely positioned, so it paints over any in-flow
sibling. The nav links already carry `relative` for their underline and so escape
it; the button did not, and a dark veil was being laid over the one element on the
bar anyone is meant to click. As an outline it was also the only thing up there
with no ground of its own, so over a bright hero it dissolved into the photograph.
Filled, it is `--champagne` on `#14243C` — a 7:1 contrast ratio, the same treatment
the page's other primary buttons use — and it keeps that fill over ivory too.

**The hero search is built from the published projects.** Property and Location were
a hand-typed list in the `homepage` singleton that matched nothing — a visitor could
choose a locality the group does not build in, and the form merely scrolled the
page. The block at the end of `index.html` now reads the completed projects and
fills both lists from them, so every option has at least one property behind it, and
submitting navigates to `projects.html?status=completed&type=…&loc=…`, which the
three collection files read and AND with the status and the active city chip.

Three details are load-bearing. `"2 & 3 BHK"` is **expanded into separate options**
(`2 BHK`, `3 BHK`) on both sides, or a search for one would never match the other.
The **town is the last part of the address**, not the first — the chips key off the
first part, which is a sub-locality, so the link filters on a substring of the whole
line rather than trying to agree with them; and `"Vasai (East)"` and `"Vasai East"`
are **folded on a punctuation-free key** so one town does not appear twice and a
search matches both spellings. Both blocks fill the same `<select>`s and their
fetches race, so the project-derived list sets `dataset.src = 'projects'` and the
CMS filler stands down — whichever lands second, the real data wins. **Budget hides
itself** while fewer than two projects carry a price: a filter with nothing to sort
on is worse than no filter, and it returns on its own once prices are filled in.

**Adaptive navbar** (last IIFE, every file). It samples the actual painted background behind `#navWrap` at three x-positions per scroll tick, averages relative luminance, and toggles `.on-light` (charcoal text) above a threshold of 150. Reading the live background rather than tagging sections means it keeps working when light sections are added. Full-bleed overlays that darken a light section from above carry `pointer-events:none`, so `elementsFromPoint` can't see them — they're listed in the `DARK_OVERLAYS` array (currently `['veil']`) and tested by geometry/opacity instead. **If you add another full-bleed dark overlay, add its id to `DARK_OVERLAYS` in all eight files.**

**Single-column grid tracks need `minmax(0,1fr)`, not `1fr`.** A `1fr` track floors at its content's min-width, so one nowrap child (the detail page's tab row) inflates the whole column past a narrow viewport instead of scrolling inside its own `overflow-x:auto` container. Every stacking rule in the Section VI media queries uses `minmax(0,…)` for this reason.

**Clipped elements report zero intersection.** Anything hidden with `clip-path: inset(0 0 100% 0)` never fires an `IntersectionObserver` watching it directly — being clipped is what suppresses the observer that would reveal it. Always observe an unclipped wrapper and add the reveal class to a child.

**Motion.** `transform` and `opacity` only — no layout-triggering properties. Easing is `cubic-bezier(.16,1,.3,1)` throughout, exposed as the `--lux` CSS var and the `LUX` JS const (`--lux-2` for secondary moves). Every page has a `prefers-reduced-motion` branch: five `@media (prefers-reduced-motion:reduce)` blocks unclip and settle the compositions, and the script's `reduce` flag skips scroll-driven effects. Preserve that branch when adding effects.

## Content management (Sanity)

**Edits take about a minute to show.** The pages read `apicdn.sanity.io`, whose
responses carry `cache-control: max-age=60`, so a change published in the Studio
appears within roughly a minute — and a browser that already fetched the query may
hold its own copy for that minute too. When something looks like it did not save,
check the document in the Studio before suspecting the page.

`studio/` is a Sanity Studio with **seven schemas** (`studio/schemaTypes/`), and
by now it drives nearly every page:

| Schema | Shape | Drives |
|---|---|---|
| `project` | one per property | the three collection pages and `project.html?p=<slug>` |
| `homepage` | singleton `homepage` | all of `index.html` — hero, About, Why, Signature |
| `collectionPage` | four fixed ids | the wording and banner on each listing view |
| `testimonial` | one per review | the marquee cards on `testimonials.html` |
| `testimonialsPage` | singleton | that page's wording and the client photo slider |
| `contactPage` | singleton | all of `contact.html` |
| `siteSettings` | singleton | social handles and the footer contact, on all eight pages |

**`services.html` is the only page still entirely hand-edited**, and
`project.html` keeps a hand-written Romal Kirti fallback for when it is opened
with no `?p=`.

Each schema has a seed script in `studio/scripts/` that fills it from the copy
originally written into the HTML. **Every one is `createOrReplace` and will
discard the client's edits** — they are for a fresh dataset only. `seed-rest.mjs`
is the exception: it *patches* the Why fields onto the existing home page rather
than replacing it.

**The `homepage` singleton.** One document, fixed id `homepage`, reached from
its own sidebar entry (`sanity.config.js` → `structure`); its generic template
is filtered out of the global "create" menu so a second one cannot be made. It
carries four groups — Hero (headline lines, sub, the three dropdown lists,
button label, and a background photograph or video), About (label, heading
lines, paragraphs, photograph or video, and the four counting figures),
Why Raajlaxmi (label, heading, intro, banner photograph or video, the numbered
points, the timeline, and the closing quote) and Signature Projects (label,
heading, intro and the four cards). The numbered points are numbered by position,
so the client never types "01"; the sketched tower in the timeline is a sibling of
the dated events and is moved back to last after the list is rebuilt, or the gold
rail stops running behind them. `studio/scripts/seed-home.mjs` fills it with the copy that was
written into `index.html` and uploads the About plate, so the client opens a
filled form rather than a blank one; it is `createOrReplace`, so re-running it
**discards their edits** — only run it on a fresh dataset.

**The `collectionPage` documents.** Four of them, fixed ids, one per listing view:
`collection-all` → `projects.html`, `collection-completed` → `projects.html?status=completed`,
`collection-ongoing` and `collection-redevelopment` → their own files. Four rather
than three because `projects.html` does double duty — it is both the
browse-everything page and the Completed view, and the two want different
headings. Each carries the small label, the heading lines, the intro, the banner
artwork (with the painted-in copy written out as its description), the banner's
own label and heading, the "nothing matches" line and the consultation strip.
`studio/scripts/seed-collections.mjs` fills all four and uploads the three
banner plates; like the home-page seed it is `createOrReplace`, so re-running it
**discards client edits**.

The page-side block is **identical in all three collection files** — it works out
which document it wants from the filename and the `?status=`, so there is
nothing per-page to keep in step. It paints only the chrome; the cards still
come from the `project` documents in the Section V block above it.

**Testimonials.** `testimonial` is one document per review (quote, name, which
home, portrait, stars, position); `testimonialsPage` is a singleton with fixed id
`testimonials-page` holding the heading, the intro, the closing strip and **the
client photo slider**. The carousel's five written-in reviews are the fallback —
they show while the query is in flight, if it fails, and while nobody has
published one, so it can never come up empty; a published set replaces them
outright rather than merging, because a half-filled review list mixed with
invented copy is worse than either. `studio/scripts/seed-testimonials.mjs` seeds
the page and those five.

Two headings on that page end in a gold phrase held in its own `<span class="gold">`
— the title and the closing strip — so each is edited as plain text plus a
separate "gold words" field, and the span node is kept and re-appended rather
than rewritten. The carousel's card building was moved into a `render()` so the
spread can be rebuilt and re-measured when the reviews arrive; its click and
keyboard listeners are delegated to `track` and `dots`, which is what lets their
children be replaced without rewiring.

**The reviews run as a continuous marquee**, not a stepped carousel. The set is
rendered **twice**; the script measures one set's width into `--tm-loop` and turns
it into `--tm-dur` at `SPEED` (70) pixels a second, and `@keyframes tm-marquee`
translates by exactly one set width before starting over, so the seam is invisible.
`SPEED` is the one number to turn.

It is **a CSS animation rather than a per-frame transform** for three reasons: the
compositor drives it so it stays smooth while the main thread is busy;
`.tm-stage:hover` pauses it with `animation-play-state` and no script at all; and a
background tab stops it without being asked. It is also the only version that can
be **verified locally** — headless Chrome throttles `requestAnimationFrame` to
about three frames a second, so an rAF marquee looks frozen in every local check,
while a CSS animation advances with virtual time and shows up in a screenshot diff.

Hovering a card draws a **gold border**: the visible half of the same gesture,
saying which card is being held still. The border lives on the rules that already
own `:hover` rather than a rule of its own.

Two consequences of never stopping. **Every card is equal** — there is no settled
middle one to feature, and a card that grew as it drifted past would wobble the
row — so `.tm-card`'s `scale(.94)`/`opacity:.62` side-card treatment is overridden.
And the **arrows and dots are hidden**, because a strip with no discrete slides
gives them nothing to point at; they are `display:none` rather than deleted, so
dropping `.tm-stage .tm-arw` and `.tm-stage .tm-dots` brings the stepped controls
back. Under `prefers-reduced-motion` the animation is `none` and the strip simply
rests.

**The circle beside the name holds initials, not a photograph.** The `portrait`
field has been removed from the schema: nobody attaches a picture to a Google
review, so it sat there as a grey placeholder for ever. `initialsOf()` drops
honorifics and non-letters before taking the first and last initials — "Dhiraj
Solanki" gives DS, "Mr. & Mrs. Deshpande" gives MD rather than M& — and `toneOf()`
picks one of six dark grounds from the site palette by hashing the name, so a person
keeps the same colour between visits instead of flickering on every render.

Each review can carry a **Google review link** (`googleUrl`). When it does, a small
four-colour Google button appears in the bottom-right corner of that card and opens
the review in a new tab; a review without one shows no button. The mark is drawn in
the script rather than loaded, and the button sits in the same row as the name with
`margin-left:auto` rather than being positioned out of the flow, which would have
let it ride over the stars on a narrow card. **The carousel's click and keyboard
handlers now ignore anything inside an `<a>`** — a side card doubles as its own
next/prev button, so without that guard clicking the Google button would also
advance the carousel, and Enter on it would be swallowed by the handler's
`preventDefault` instead of opening the review.

**The client photo slider** (`.tg`, between the carousel and the closing strip)
is a `scroll-snap` scroller rather than a transform track, so touch, trackpad and
keyboard all work without JS; the arrows just nudge the same scroller and are
dimmed, not removed, at the ends. It ships with `hidden` on it and is revealed
only once the CMS carries at least one photograph — the one place on the site
where an empty block removes itself rather than falling back to markup.

**Site settings.** A singleton (`site-settings`) holding the **social handles**
and the footer's telephone, email, address and copyright line. Its block is
identical in all eight files and reads one document, so the number that used to
be typed into every footer is now edited once. The four social icons were
hard-coded with `href="#"`; they are now drawn from the CMS — the SVG paths live
in an `ICON` map in that block, so adding a network is one entry there plus one
option in the schema — and **the row removes itself when no handles are set**,
because four buttons that go nowhere are worse than none.

**Contact page.** A singleton (`contact-page`) covering the label, heading (plus
its gold phrase), intro, the four info boxes, the enquiry card's wording, the
thank-you state and the location card. Each info box swaps between a link and a
paragraph depending on whether the CMS gives it a `link`, so "Business Hours"
stays plain text while "Call Us" becomes a `tel:`. The **map pin is a geopoint**
that drives both the directions button and the embedded Google frame.

**The hero headline sizes itself.** Its length is CMS-written now, so the design
cannot assume it. `.line-reveal` is `width:max-content` with `max-width:100%`,
which means a line too wide for the column does not overflow — it *wraps*, and a
long headline turned into six lines that ran under the navbar and pushed the
search form off the bottom. `fitHeadline()` shrinks the type until the longest
line sits on one line, then until the block clears the navbar and the foot of the
hero (it is centred on 57%, so it may not exceed twice the smaller of the two
gaps). It runs on load, on resize, on `fonts.ready` — Archivo Black lands after
first paint and changes every measurement — and again once the CMS answers. Below
760px the width step is skipped: forcing a long line onto one phone-width line
costs more legibility than wrapping does. `base` honours the CSS clamp's 40px
minimum, or a phone would get smaller type than it had before.

**Hero, About and Why can each take a video.** `mountVideo()` in the home-page
block is shared by all three: it drops a silent looping `<video>` into an element
that is already showing a picture, and is **skipped on phones, on data-saver
connections and under `prefers-reduced-motion`**, removing itself if the file
errors or autoplay is refused. The photograph is always painted first, which is
what those four cases fall back to.

**Do not give `.why-feature .img` a `position` other than `absolute`.** It is
`position:absolute; inset:0`, and making it `relative` drops the inset and
collapses the banner to zero height — which is exactly what happened when the
video CSS first tried to make it a positioning context. It and `.ab-photo` are
both already positioned, so the video anchors without help; only
`overflow:hidden` is needed, for the About plate's 30px radius. (The inset used
to be `-9% 0`, an overhang for the parallax; both are gone — see below.)

**The Why plate shows the whole photograph.** The plate was `height:clamp(22rem,44vw,650px)`
— about 2.2:1 — against a 3:2 photograph, so `background-size:cover` ate the
ceiling and the front row's feet, and `background-position:center 72%` only chose
*which* part to lose. The `.img` also carried `inset:-9% 0`, an overhang for the
parallax, which cropped a further 9% top and bottom. Now:

- `.why` declares **`--why-h:min(70vh,760px,58vw)`** and `.why-stage` is
  `width:min(100%,calc(var(--why-h) * 1.5))`, so the plate is sized from the
  viewport and its width follows the 3:2 ratio. `58vw` is the same bound the
  About plate needs, for the same reason — it stops a short, wide window making
  the plate wider than its column.
- **The stage is narrowed to the plate, not the plate centred inside a
  full-width stage.** The rotating seal is a *sibling* of `.why-feature` — it has
  to be, because the plate is `overflow:hidden` and the seal overhangs its corner
  — so it only stays pinned to that corner when the stage is exactly the
  photograph's width.
- `.why-feature` is `aspect-ratio:3/2; width:100%` and `.img` is `inset:0` with
  **`background-size:contain` and `background-repeat:no-repeat`**. The `no-repeat`
  is not optional with `contain`: without it, any leftover strip tiles a sliver of
  the image. A video in this plate is `object-fit:contain` for the same reason as
  the About plate.
- **The feature image's parallax is gone.** With `inset:0` there is no overhang
  left to slide, so translating it would drag an edge off the plate and show the
  ground behind. The blueprint corners still drift.

The CMS image is 3508x2340 and the committed fallback is 2000x1332 — both 3:2, so
nothing letterboxes. A differently shaped file would letterbox onto the plate's
navy ground rather than lose its edges.

**Studio sidebar**, in order: `Home page`; **All Projects** — which holds the
browse-everything page's own content and then one folder per stage
(`Completed`, `Ongoing`, `Redevelopment`), each containing that listing's **Page
content** and its **Projects** list, with the `project-by-stage` template so a
project created inside a folder is already filed, plus `Not yet filed` and
`Every project` at the bottom as the safety net; then `Testimonials` (Page
content + Reviews), `Contact page`, a divider, and `Site settings`. Every
singleton's generic template is filtered out of the global "create" menu, so a
second copy cannot be made by accident.

**Its hydration rule is the opposite of `project.html`'s**: a missing field
*leaves the markup alone* rather than erasing it. The copy in `index.html` is
real designed content, not another record's leftovers, so blank means "nothing
to say" — which is what lets the client fill it in a piece at a time without the
home page going blank in between. The block reuses the existing nodes (cloning
the last one when the CMS has more rows, removing extras when it has fewer)
rather than rebuilding markup, so every animation hook, `data-hover` and reveal
class survives. Two details are load-bearing: the Signature heading's second
line owns the gold full stop as its own `.dot` node, so a trailing stop is
trimmed off the CMS text before that node is re-appended or the line renders
with two; and the figures may arrive *after* the counters have already counted,
so the block fires `rl:home-stats` and the Section II IIFE re-reads the cells
and counts again.

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
**The id must be set in six places**: `studio/.env` and the `SANITY` block in
`projects.html`, `projects-ongoing.html`, `projects-redevelopment.html`,
`project.html` and `index.html`. Renaming a schema field means renaming it in each of those GROQ
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
- `assets/projects/associates.jpg` is the **Associates & Consultant plate** on `projects-redevelopment.html` (1094x728, JPEG q94 — 134KB, down from 547KB as PNG). Its ground is `#F4F0EF`, the same as the corridor banners, so the band dissolves into it with no extra work. Unlike those strips it is **1.5:1**, so `.cor-figure.plate` centres it at `max-width:860px` rather than bleeding it to the band's edges — full-bleed would stand ~800px tall and swamp the page. Below 760px it scrolls sideways at a fixed 820px, same reason as the banners: the names are painted in and would otherwise render at ~7px. All 21 names are written out in the `img`'s `alt`.
  - **The artwork carries three copy errors**, none fixable in code: the last architect reads "ARCHITECH KAUSHIK PATEL" (should be ARCHITECT), the header reads "REDEVELOPING HOME REBUILDING LIVES" (reads as "Redeveloping Homes, Rebuilding Lives"), and the title is "ASSOCIATES & CONSULTANT" singular. The `alt` text spells all three correctly. Only a redraw fixes the plate itself.
  - It came in at 1094px wide but displays at 860 CSS px, so it is soft on a retina screen. Ask the client for the original export (~1720px or wider) and swap the file — nothing else needs to change.
- The 12 individual `assets/projects/*.png` marks were left over from an earlier markup rebuild of this band and have been **deleted** (~300KB, recoverable from git if the banner is ever rebuilt). Only `western-line.jpg` and `western-line-ongoing.jpg` remain in that folder.
- `assets/logos/` holds **30 brand marks** for Section X. Nine were already committed; the other 21 were cut out of the client's category sheet, so they are only ~175px wide — fine at display size, soft on a retina screen. Swap in vendor-supplied files when they arrive. **All 30 have been trimmed to their ink**, because each carried its own padding and the grid's sizing depends on them being tight; re-trim anything you replace.
- Section X fits every mark into an identical box with `object-fit:contain` rather than capping height alone — capping height left a 3x spread in optical weight between a wide lockup and a square roundel.
- `assets/why-team.jpg` is the Section IV feature plate's **fallback** (the group photograph, 2000×1332, 3:2); the `homepage` document carries its own 3508×2340 copy of the same shot. The plate now carries that ratio itself and fills with `contain`, so the whole line-up is in frame at every width and nothing is cropped — see *The Why plate shows the whole photograph*.
- Still placeholders: four `picsum.photos/seed/rl-*` URLs in `index.html` — the Signature Projects cards (Heights / Villa / Crest / Essence) — plus the seeded card art in the `projects.html` fallback list (real card images now come from Sanity). Replace by swapping the URL in the inline `background-image` (or the Sanity document) for the real asset. Earlier notes here claiming ten placeholders were stale.
- The About plate is `assets/about-plate.jpg` (excavator on site, 810×1212), set as `background-image` on `.ab-photo` in CSS. It used to be copied off the hero by the About IIFE; that JS is gone, so **don't reintroduce an inline `style.backgroundImage` there** — it would override the stylesheet. The one deliberate exception is the home-page content block, which sets an inline background **only when the `homepage` document actually carries a photograph**; with the field empty the stylesheet keeps this file. It is now only the **fallback under the CMS video** — the `homepage`
  document carries a 630x830 `aboutVideo` and no `aboutImage`, so this file shows
  only while the video is loading, on phones, on data-saver, under
  `prefers-reduced-motion`, or if the file fails. The plate keeps the `5/6.6`
  ratio exactly (it is the video's ratio) and is sized by height — see *The About
  section holds one screen*.
- `quote-strip.png` (the Vikram Raajlaxmi quote banner) has been **deleted** — Section III's `.sp-quote-img` figure was removed earlier. Recoverable from git if the quote is ever wanted back.
- The root-level `Generate_*.jpeg` / `download.png` / `Minimalist_*.jpeg` source art has been **deleted** — it was working material, not site assets. `footer.png`, `Services_start.png`, the seals and the sketches are all still referenced and remain.
- **Favicon**: `favicon.ico` (16/32/48, at the repo root so browsers find it unprompted) plus `assets/favicon-32.png`, `assets/favicon-192.png` and `assets/apple-touch-icon.png` (180). All eight pages link them from `<head>`, right after `</title>`. Cut from the logo's building glyph with its dark ground **keyed out to transparency** (unmatted, so no dark fringe survives onto a light tab bar), squared up and centred with ~12% margin — the mark has to survive being read at 16px, so it sits deliberately large in frame.
- The logo ships as **two external PNGs**, `assets/logo.png` (brown/charcoal ink, for ivory grounds) and `assets/logo-light.png` (gold/cream ink, for the dark navbar **and the footer** — `.ft-mark`, which used to be the word RAAJLAXMI set in Cinzel with a tagline span under it; the artwork already carries both, so the text version was removed), both ~17KB with a transparent ground. The nav carries both stacked inside `.brand`; `.nav-wrap.on-light` crossfades between them via opacity, replacing the old `filter:` hack. Regenerating either from a new master means keying out its flat background and re-cutting both variants — edit them as a pair or the two states drift.

## Known content placeholders

**`projects-ongoing.html` / `projects-redevelopment.html`** are copies of `projects.html` with four differences: the `<title>`, the `.col-head` label/title/intro, `STATUS` hard-coded instead of read from the URL, and the Western Line banner swapped: the ongoing page carries its own (`assets/projects/western-line-ongoing.jpg`, "Rising Along the Western Line" — Vasai / Virar / Saphale, five projects), and the redevelopment page carries the **associates plate** (`assets/projects/associates.jpg`) in that slot instead — it has no corridor banner of its own. Both banners are client artwork used whole, same rules as the completed one: the band takes the artwork's ground colour so it dissolves, and below 760px it scrolls sideways at a fixed 900px because the station names are painted in. The redevelopment page additionally carries **placeholder cards** and one extra rule in its Sanity handler — `if(!result.some(inStatus)) return;` — so the live list is ignored while it contains no redevelopment project, which would otherwise blank the page. Publish one with that status and the placeholders are never seen again.

- **The dataset is the client's own (checked 30 Oct 2026).** The seeded placeholders
  are gone; there are **14 real projects with real photography**, and **every one is
  filed as `completed`**. So the **Ongoing page is empty** (it shows its "nothing listed
  yet" line) and Redevelopment still shows placeholders. Midas Glory and Nakshatra Auris
  carry the badge "Ongoing" while filed as Completed — the status/stage split working as
  designed, but probably not what was meant; their **Listing** wants changing. Note the
  count fell from 16 to 14 between 29 and 30 Oct: the client deletes as well as adds, so
  **re-check counts rather than trusting this line**.
- **`Raajlaxmi Tower`'s slug is the literal string `Raajlaxmi Tower`** — a capital and a
  space, not kebab-case — so its detail link is `project.html?p=Raajlaxmi%20Tower`. It
  resolves, but it is the only slug in the dataset like that and it should be corrected to
  `raajlaxmi-tower` in the Studio. Nothing in the code needs changing when it is: both the
  cards and the banner hotspots read the slug live.
- **`Midas Heights` is painted on the Western line banner but has no `project` document**,
  so its hotspot is inert. Publishing it is all that is needed.
- **No project is filed as Redevelopment yet**, so that page shows three clearly-marked placeholder cards (`[Society name]`, `[Locality]`, `[n] BHK`) above the associates plate. Set one project's **Listing** to Redevelopment in the Studio and they disappear for good. Likewise the two `Ready Possession` documents are in no listing until their Listing is set to Completed.
- **Project names differ between pages.** `index.html` Signature Projects lists Heights / Villa / Crest / Essence; `projects.html` lists those plus Business Square, Enclave, Skyline, Vista. Keep the two consistent when adding projects.
- **The testimonials are now real.** The invented five have been replaced by **six
  genuine Google reviews**, each with its Google review link, so this section is no
  longer a launch blocker. The five written into the `T` array remain in the file as the
  offline fallback and are still invented — they show only if the query fails, so do not
  treat anything in that array as true. The client photo slider under the reviews is
  empty and stays hidden until real photographs are added.
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
