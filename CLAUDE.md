# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An **eleven-page** static marketing site for Raajlaxmi Group: `index.html` (home), `projects.html` (browse-all collection, and the Completed view via `?status=completed`), `projects-ongoing.html` and `projects-redevelopment.html` (the same collection UI locked to one status), `project.html` (one property's detail page), `testimonials.html` (client voices), `services.html`, `contact.html` (enquiry page), and the three legal pages `privacy.html`, `terms.html` and `disclaimer.html`. No build step, no package manager, no dependencies, no test suite. Each page is one self-contained document — `<style>` in `<head>`, markup in `<body>`, one `<script>` at the end — plus a handful of loose image files in the repo root and `assets/`.

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
| Owners | **5 real people, each with a portrait and a role; no bios.** The `.ow-bio` line is removed per card when the field is empty, so the cards run name + role |
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
| I | Hero | `hero` | Night skyline (inline base64 JPEG) under the CMS film, mouse parallax, property-selector form. **The headline and its sub-paragraph are gone** — markup, CSS, the line-mask entrance and `fitHeadline()` with them, so the page carries no `<h1>`; see *The hero headline and its sub-paragraph are GONE*. **Its remaining copy, and the three dropdown lists, come from the `homepage` singleton** — the four localities hard-coded in the markup (Gomti Nagar, Hazratganj, Sushant Golf City, Vibhuti Khand) are in **Lucknow**, not this developer's corridor; the seeded CMS values replace them with Vasai / Nallasopara / Virar / Saphale. |
| II | About | `about` | Ivory. Plate showing **the CMS's About video** (`assets/about-plate.jpg` is only the fallback underneath it), four counting stats, then a full-width RERA / CREDAI-MCHI trust strip (`.ab-creds`, a sibling of `.ab-inner`, not inside the content column). **It holds exactly one screen** — see *The About section holds one screen*. The ghost word "Legacy" that used to sit behind the copy is gone, markup, CSS, parallax and schema field alike. |
| III | Signature Projects | `signature` | Four project cards, corner blueprint decor with slow parallax, rotating seal. The section now ends on the card grid, so its **bottom** padding alone sets the run into Why — it was written to mirror `.about`'s old `clamp(5rem,14vh,140px)`, which **no longer exists**: About was rebuilt to one screen and its padding is now much tighter, so this value is a standalone constant that only looks like it is paired with something. |
| IV | Why Raajlaxmi | `why` | Team photograph as the feature plate, **sized so the heading and the photograph share one screen** (see *The Why heading and photograph share one screen*), four numbered rows, a year timeline (2004→2026), closing quote + spinning seal. The auto-scrolling brand marquee (`.why-carousel`) that used to sit before the quote is gone — Section X replaced it. |
| XI | Meet Our Owners | `owners` | **Sits between Why and Brands in scroll order**, despite the number. Portrait cards running as a **continuous right-to-left marquee**, the same mechanism as the reviews on `testimonials.html` — a CSS animation on `.ow-grid` (`@keyframes ow-marquee`, `--ow-loop` / `--ow-dur`, `SPEED` 30 px/s, the slowest of the three strips because a tall portrait going past at speed is harder to read than a line of text). `.ow-stage` carries `overflow:hidden` and the edge-fade mask. The copy sits over the foot of the photograph behind a gradient scrim, so the card *is* the picture rather than a picture with a caption under it. **Hovering one card pauses the strip and blurs and dims the others** — pure CSS (`.ow-stage:hover .ow-grid` for the pause, `.ow-grid:hover .ow-card:not(:hover)` for the blur), with `:focus-within` carrying both for a keyboard, and the blur dropped below 620px where `:hover` sticks after a tap. **Clicking a card opens the detail panel** — hover is the invitation, the click is the choice; see *The owner detail panel*. **Copies are computed, not fixed**, exactly as the client photo strip does it: `build()` measures a card, renders `max(2, ceil(stageWidth / setWidth) + 1)` sets and re-measures, so two published owners loop as cleanly as six. **The CMS fills the cards from a later block**, so that block fires **`rl:owners`** and this one rebuilds the strip from whatever it left — the same handshake the About counters use with `rl:home-stats`. Reduced motion renders a single set, puts the scroller and scroll-snap back and drops the mask, so no card is stranded off a stage that no longer moves. **Driven by the `ownersPage` singleton, not the home-page document** — see *The owners live on their own document*. **Its six cards are bracketed placeholders and it is the one section on the home page that removes itself**: an empty `owners` list deletes the section rather than printing "[Owner name]" six times to the public, and it returns the moment anyone is published. With Sanity unreachable the placeholders stay, so a failed fetch never costs the design. **The card prints the name and the role only** — "About them" is the detail panel's content and never appears here; it rides on the card as `data-bio` so the panel can read it off whichever card was opened. The card carries the person, the panel carries what there is to say about them. |
| X | Brands We Use | `brands` | Follows Why in scroll order. `OUR PARTNERS` header, six category tabs (All / Structure / Interiors / Electrical / Fittings / Utilities) and a card grid, all rendered from the `BRANDS` array in the Section X IIFE — adding a supplier is one line of data, no markup. Each row is `[name, logo file, trade, tab]`: `trade` is the line from the client's sheet and prints on the card, `tab` is the coarser bucket the tabs filter by. Johnson and Hindware appear twice on purpose, under two different trades. Its header (`.br-head` / `.br-label` / `.br-title` / `.br-intro`) is a **copy of Section IV's** rather than a shared rule — change one and the other will not follow. |

`projects.html` — one section, `#projects` ("Section V — Our Collection"): cards rendered from the `P` array in JS, city filter chips derived from each entry's location field, a **Western line corridor band** (`.cor`, between the pagination and the consultation strip) showing the delivered portfolio under four stations — Vasai / Nallasopara / Virar / Saphale. It is the client's finished banner used whole (`assets/projects/western-line.jpg`), **by explicit instruction — do not substitute a markup rebuild for it**. **Its twelve painted logos are clickable**: `.cor-hot` boxes inside `.cor-map` lie over the artwork as percentages of it, so they ride the image at every width — including the 900px plate inside the phone scroller, which is why the img is wrapped in `.cor-plate` (`.cor-figure` becomes the narrower scroll container and cannot be the positioning context). The boxes are measured from the ink, so **a recrop or a replacement banner invalidates all twelve**; `paint()` removes the whole layer if the CMS supplies a banner that is a *different* picture. It tells them apart by **SHA-1**: Sanity names an uploaded asset after the hash of its bytes, so the check is exact rather than a guess — and the usual answer is that they are the same file, because `seed-collections.mjs` uploaded this very banner and the live page therefore serves it from the CDN under a different URL. **Replacing `western-line.jpg` means updating `ART` in that guard**, or the boxes vanish the moment the CMS copy is re-uploaded. Each box carries `data-project` — the name *as the artwork paints it* — and `wireBanner()` matches it against the published projects to set the href, so a slug fixed in the Studio is picked up with no code change. `nameKey()` does the matching and is deliberately forgiving: it folds case and punctuation, collapses doubled letters (`Raajlaxmi`/`Rajlaxxmi` → `rajlaxmi`, `Pearrl` → `pearl`) and drops a trailing plural (`Towers` → `tower`), because the banner and the CMS do not spell the names the same way. **A box with no published project stays inert** — no href, no pointer, no hover tint; `Midas Heights` is painted on the banner but has no document, so today it is the one logo that does not respond. The layer is also inert with Sanity unreachable, which is correct: `project.html?p=` needs Sanity to render anything anyway; a `?status=` filter (exact case-insensitive match on `p.status`, ANDed with the active city chip, read once on load so the chips never clear it, with a `.col-empty` message when nothing matches) — the nav's **Projects** item *and* its **Completed** sub-item both deep-link to `?status=completed`, so the bar reaches the Completed view whether or not the dropdown is used and the browse-everything view is now reached only from the footer and the in-page "See the whole collection" / "Clear filters" links, a "showing N of M" line and a consultation CTA. **The pagination is gone** — the 1/2/3 buttons were decorative markup that never paged anything (every matching card always rendered), so they promised a second page that did not exist. Cross-links back to `index.html#about` / `index.html#signature`.

`testimonials.html` — one section, `#testimonials` ("Section VII — Testimonials"): a **continuously scrolling marquee** of review cards, a hidden client-photo slider under it, and a closing consultation strip. The reviews come from Sanity (the five written into the `T` array are only the fallback); each card carries the reviewer's initials rather than a photograph, and a Google button when that review has a link. The arrows and dots are `display:none` — a strip with no discrete slides has nothing for them to point at. All the detail is under *Content management → Testimonials*. The nav's Testimonials item points here from every page.

`services.html` — one section, `#services` ("Section IX — Services"), seven blocks: hero, philosophy, the five-step journey rail, six service cards, the six-step buying flow, a FAQ accordion and a closing CTA. Both rails fill their gold line from scroll position (`--fill` on `.sv-rail` / `.sv-flow`). Each block carries `data-rev` and gets its own observer, so the page reveals in movements rather than all at once. Its first two blocks are **finished artwork with the copy painted in**: `Services_start.png` is the hero band (`.sv-band`, full-bleed at its native 2164:380 — any max-height crops the label off the top; `.sv-mid` carries top padding so the plate below clears it rather than butting against it, which read as one accidental block of two photographs) and `assets/service-philosophy.jpg` is the philosophy plate (`.sv-side`, flush left at `--sv-side-w`, default 52%). The source artwork is 1376x768, **cropped on disk to 1376x513 (2.68:1)** — the extra height was empty cream above and below the copy and made the plate half again as tall as the banner. Any recrop must keep y150–635 of the original or it starts eating the paragraph, which is why it cannot reach the old 2.94:1 exactly. `--sv-side-w` is set by readability: much below ~40% the painted type stops being legible. The superseded `service_side.png` has been deleted (recoverable from git).
  - **The new plate's painted headline has a typo**: it reads "feel as carefully designed the homes we create", dropping the second "as". The live copy in the markup (which takes over below 820px) is correct, so the page says two different things depending on width. Only a redraw fixes the artwork. Both keep their copy in the markup for screen readers, and the plate swaps to live text below 820px where its painted type would render ~6px. **Everything else is an unfilled `.sv-slot` placeholder** reading `[INSERT … IMAGE HERE]` — to fill one, drop the inner `<span>` and set `background-image` on the slot; ratio, radius and shadow are already right.

`contact.html` — one section, `#contact` ("Section VIII — Contact"): the invitation and a 2×2 contact grid on the left, a floating consultation card on the right, then the location card + drawn map and a closing CTA. **The form has no backend** — the submit handler validates, then swaps the card to a thank-you state and nothing is sent. Wire it to Netlify Forms (`name="contact"` + `data-netlify="true"` on the `<form>`) or an endpoint before launch, or enquiries are lost. Deliberately carries no corner artwork, per the brief.

**Every consultation CTA on the site points here**: the nav/sheet `Book Consultation` on every page, `Schedule a Consultation` (collection), `Book a Private Consultation` (testimonials) and `Schedule a Site Visit` (detail page) — the last three deep-link to `contact.html#ctForm`, which scrolls the card into view.

`project.html` — one section, `#project` ("Section VI — Project Detail"), **rebuilt from the client's mock** and currently written for **Romal Kirti only**. Two columns: the left bleeds to the viewport edge and carries the photography (hero with painted-on copy, crossfading slides, arrows, slide ticks, and a four-up captioned thumb strip under it); the right is a padded rail of facts (breadcrumb, kind, title, location, price, a four-cell fact bar, Project Highlights, six amenity chips, two CTAs and the direct line). Arrow keys still drive the gallery.

**The first screen is a full screen, and that is what sizes the photograph.**
`.pd-grid` is `align-items:stretch` with
`min-height:calc(100svh - var(--pd-top))` (`--pd-top` is the section's own top
padding, the thing that clears the fixed navbar), `.pd-left` is a flex column and
the hero is `flex:1 1 auto`. So the hero absorbs whatever the facts rail does not
use, and the thumb strip lands exactly on the bottom of the screen.

Four parts of that are load-bearing:

- **`min-height`, not `height`.** Every project today is sparse — none has an
  overview, amenities or specs — so the rail is short and the photograph takes
  the slack. A project with real copy makes the rail taller than the screen, and
  the row has to grow with it rather than scroll inside itself.
- **The hero is capped at one screen** (`max-height:calc(100svh - var(--pd-top))`).
  Without it, that same tall rail dragged the photograph to 1340px on a 900px
  screen.
- **The strip is NOT `margin-top:auto`.** It was, briefly. The hero is the thing
  that grows, so the strip follows it onto the floor of the column anyway when the
  rail is short — and pinning it opened a gap between the picture and its own
  thumbnails once the hero hit its cap.
- **The `aspect-ratio` (`1045/520`) is the floor**, used when the column has no
  definite height: below 1100px, where the layout stacks, `.pd-left` returns to
  `display:block` and the grid's `min-height` is reset to 0.

Measured at 1920x1080, 1440x900, 1366x768 and 1280x800: the strip's bottom edge
is level with the foot of the screen to the pixel, with no gap above it. **Below
about 660px of height the page scrolls, and that is the facts rail, not the
photograph** — at 1280x620 the rail alone is 588px against 535px of screen, so
no amount of shrinking the hero would fit it.

**The Prime Location block is gone** — the pin, the three landmarks and the drawn
map that used to sit under the thumb strip, along with `.pd-place`, `.pd-near`,
`.pd-map` and their CSS, the `NEAR_ICON` set and the hand-written fallback
landmarks. `landmarks` and `geo` are **no longer queried** from Sanity; both are
still on the `project` schema, so the data survives — the same situation
`floorPlans` is in. The inline-SVG map and the live-Google-map swap went with it.

**"Contact Agent" is gone too**, leaving the direct line as the only thing in
`.pd-contact`. That made an existing bug visible: with no `phone` on the document
the line removes itself, which used to leave the agent beside it but now leaves
an **empty row still drawing its top border** across the rail. The row now
removes itself when no link is left in it.

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
hand-written Romal Kirti page — that is the fallback. The home page's
Signature Projects cards **no longer land there**: each one now resolves its own
`project.html?p=<slug>` (see *The signature cards point at projects*), and a bare
`project.html` typed into a card's link field is ignored for exactly that reason.

`privacy.html` / `terms.html` / `disclaimer.html` — one section each,
`#legal` ("Section XII — Legal pages"). **One stylesheet, one behaviour block
and one Sanity block serve all three**; they differ only in their copy and in
which `legalPage` document they read, which the block works out from the
filename — the same arrangement the three collection files use for
`collectionPage`. There is nothing per-page to keep in step.

A reading page rather than a designed one: one column at `max-width:52rem`
(~70 characters a line), generous leading, clauses numbered by a **CSS counter**
so nobody types "01" and inserting a clause in the middle renumbers the rest by
itself, a gold-tinted closing panel, and a "see also" row linking the other two.
Below 620px the hanging number moves above its heading. Nothing moves while you
are trying to read a clause beyond a gentle per-clause reveal.

The **footer's three legal links were `href="#"` on every page** and now resolve.
`project.html` is the one page with no footer (by design), so it is the one page
that does not link to them.

**The fallback rule here is the opposite of everywhere else, and it matters.**
On every other page the markup is a design fallback and the CMS is the real
content. On these three the markup is a *legal position*: if Sanity is
unreachable, the text written into the HTML is what a visitor is held to. So:

- a missing field **leaves the markup alone** rather than clearing it;
- the clause list is replaced **wholesale** only when the CMS actually carries
  one;
- and the copy in the file and the copy in the document have to be kept in step.
  `studio/scripts/seed-legal.mjs` is **generated from the same source** as the
  HTML for exactly that reason — they cannot drift as long as both are
  regenerated together.

**The body fields are plain text, deliberately.** The client writes into a
textarea: a blank line starts a new paragraph, a single newline is a line break,
and any web or email address becomes a link by itself. Everything is **escaped
before** those substitutions, so nothing typed into the Studio can inject markup
— verified with `<script>alert(1)</script>` in a clause body, which renders as
text. No other markup is interpreted, and none is needed.

**The copy is a drafted starting point, not legal advice.** It is written for an
Indian real-estate developer and is specific to that — RERA registration, carpet
area as defined by the 2016 Act, artist's impressions, the DPDP Act's Grievance
Officer, NDNC consent. Anything that is a *fact about the client* rather than a
position they take is left as a **[bracketed blank]**: the registered entity,
the CIN, the registered office, RERA numbers, the Grievance Officer's name and
email, and the jurisdiction city. Those are the client's to supply and a
lawyer's to check before launch.

## Architecture

**The `<head>` CSS is duplicated across all eleven files.** Lines ~1–978 of `index.html`, `projects.html`, `projects-ongoing.html`, `projects-redevelopment.html`, `project.html`, `testimonials.html`, `services.html`, `contact.html`, `privacy.html`, `terms.html` and `disclaimer.html` are the same stylesheet — base tokens, cursor, nav, mobile sheet, and the CSS for sections I–V — differing in only ~100 lines (title, nav/logo sizing on the inner pages). Each page then renders only its own sections. **Any edit to shared chrome (nav, `.nav-wrap.on-light`, cursor, burger/sheet, `:root` tokens, the hidden page scrollbar) must be applied to all eleven files or the pages drift.** The page scrollbar is hidden by request (`html{scrollbar-width:none}` + `html::-webkit-scrollbar{display:none}`); it is scoped to `html`, **not** `*`, on purpose — the scrollbar on `.cor-figure` is the only cue that the line-map banner pans sideways on a phone, so a blanket rule would break that.

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
live in the shared head stylesheet, so all eleven files carry a copy — but only
`index.html` has the markup, so only its copy renders. The other ten were
already carrying an **older** version (the ghost word at `top:-.44em`, `.ab-text`
at 560px) before this change, and the one-screen rewrite was applied to
`index.html` alone. Treat the Section II block in the other ten as dead code;
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

**It also stands down while the owner detail panel is open.** That panel sits at
`z-index:880`, just under this one, so a popup arriving on top of it would bury
the thing the visitor deliberately opened. The timer re-arms every 4s instead and
**nothing is written to `rl-lead-seen` while it waits**, so the popup is deferred
rather than spent — it arrives as soon as the panel is closed.

**The owner detail panel.** `.owd` / `#owDetail`, the element before the lead
popup on `index.html`. **Clicking** a card in Section XI enlarges that card,
blurs the page behind a `backdrop-filter` scrim and opens a centred panel
carrying the whole of that owner: the portrait on the left, the name, role and
biography on the right. It is the layout the section briefly had as a page of its
own, kept as the thing *behind* each card rather than instead of them.

Five things about it are deliberate:

- **It opens on CLICK, not on hover.** It opened on hover-intent until 4 Nov —
  a 300ms dwell, `OPEN_MS` — which read well in the abstract and badly in use:
  the strip never stops, so a card could drift under a still pointer and open a
  panel for somebody the visitor had not chosen, and a pointer travelling across
  the row to reach the card it wanted tripped over the ones in between. A click
  names the card. **Hover is still the invitation** — it pauses the strip and
  recedes the neighbours, which is what says the card is live — and the click is
  the choice; `cursor:pointer` and `aria-haspopup="dialog"` say the same thing to
  a mouse and to a screen reader. There is now **one pointer handler**, because a
  click is the same event for a mouse and for a tap: no hover path to keep in
  step and no touch-emulated hover to race, so the old `pointerType === 'touch'`
  guard and the `pointerout` cancel are gone with the timer. Enter and Space on a
  focused card still open it. A click on an `<a>` inside a card is the link's,
  not the card's.
- **It does not close on pointer-out.** The panel is centred and the card may be
  anywhere, so the pointer has to cross the scrim to reach it; closing on leave
  would make it unreadable. Esc, the close button and a click on the scrim close
  it — which is also what works on a touch screen.
- **It reads the CARD, not the CMS.** The cards are already painted by the home
  page block and the marquee clones them, so taking the content off whichever
  card was opened makes this work for the duplicates, for the hand-written
  fallback cards with Sanity unreachable, and with no second copy of the data to
  keep in step. Two things ride on the card as attributes rather than being
  printed on it:
  - **`data-bio`** — the "About them" text. It is **not shown on the card at
    all**; the card is the person and the panel is what there is to say about
    them. The placeholder cards carry a bracketed one in the markup, so the
    panel is not blank in the fallback either.
  - **`data-photo`** — the bare asset URL, because the one thing a card cannot
    give is an uncropped portrait. The panel re-requests it at `w=900&h=1080`,
    5:6 and matching `.owd-ph`, rather than reusing the card's 3:4 crop.
- **The card stays enlarged underneath and blurs with everything else.** Keeping
  it sharp above the scrim is not possible from inside `.ow-stage`, which clips
  and therefore creates its own stacking context — and the panel is carrying a
  far larger copy of the same photograph anyway.
- **It closes on `rl:owners`.** The strip is rebuilt from scratch when the CMS
  lands, so the card it was opened from no longer exists by then.
- **The blossom sketch sits in its top-right corner** (`.owd-art`,
  `assets/project-floral-right.png` — the same drawing the collection pages
  carry down their right edge). **The file has no alpha channel**: it is an
  opaque near-white rectangle, its ground sampling at 254–255, so it is dropped
  in with `mix-blend-mode:multiply`, which takes the white to nothing and leaves
  only the ink over the panel's cream. That is the idiom `.col-decor` already
  uses; a plain `<img>` would paint a pale box over the corner. A radial mask
  fades it out before it reaches the copy, and it sits at `z-index:0` with the
  figure and the body lifted to 1 and the close button to 2. `.owd-card` gained
  **`overflow:hidden`** so the artwork stops at the 26px radius rather than
  spilling past it.

The role and the biography are **removed when empty** rather than left as blank
paragraphs, and the biography is justified with `hyphens:auto` (left-aligned
below 760px, where there are too few words per line to justify). Checked at
1440x900, 1366x768, 820x900 and 420x860, by tap as well as hover, and under
`prefers-reduced-motion`, which drops every transform.

Anything that should animate in after the cover lifts registers with **`window.onIntro(fn)`**, not `window.load` — on load the cover is still up and the sequence would play out of sight. `index.html`'s hero choreography is the only current caller. When the cover is removed the block fires a synthetic `resize`, because the adaptive nav sampled the cover rather than the page and would otherwise be stuck in the wrong state. The two status pages are clones of `projects.html`, so they duplicate its whole Section V as well — a fix to a collection card, chip or the Sanity query has to be made in three files, not one. That now includes the Projects dropdown: `.nav-drop` / `.nav-menu` in the bar and `.sheet-sub` in the mobile sheet, both present in all eleven files. The menu is pure CSS — `:hover` plus `:focus-within` for keyboards — with an invisible `::after` bridge spanning the gap so the pointer can travel down without it closing. It sits inside `#navWrap`, which the adaptive-nav sampler skips wholesale, so it cannot confuse the light/dark detection. Section-specific CSS still lives only where it is used, under its `/* ===== SECTION N — NAME ===== */` banner; `project.html`, `testimonials.html`, `contact.html` and `services.html` each append their own section block (VI–IX) after that shared run.

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
CMS filler stands down — whichever lands second, the real data wins.

**Budget is the exception: it is bands, not prices, and it is always shown.** It
used to be filled from the projects like the other two — a dropdown of the literal
figures the client had typed ("₹1.8 Cr") — and to remove itself below two of them,
so the field came and went as prices were entered. It now reads a fixed set of
bands from `heroBudgetOptions` on the `homepage` document and is painted by the
home-page content block like any other CMS copy.

That only works because **the collection pages match a band by overlapping RANGES,
not by string equality**. Compared with `===`, as it was, a band could only ever
match a project whose `price` was that exact text, so every band returned nothing.
`money()` (in the Section V block of all three collection files) turns either side
into a `[low, high]` pair in rupees and tests for overlap. Four things it handles,
each of them a real case from this dataset:

- **Lacs / Lakhs / Cr / Crore / K**, so "₹48 Lacs" and "₹1.8 Cr" are comparable.
- **The unit comes from the LAST figure when the first has none** — "45 – 65 Lacs"
  is 45 *lacs* to 65 lacs, not 45 rupees.
- **A trailing `+`, `onwards`, `above` or `plus`** means no upper bound.
- **Commas are stripped, not spaced.** Spacing them turned "1,25,00,000" into four
  separate numbers and the smallest won, which read as ₹0.
- Text with **no number in it** ("Price on request") returns `null`, which keeps
  such a project out of every specific band while leaving it in "Any budget".

Only one project carries a price today (`Raajlaxmi Apartment`, ₹1.8 Cr), so most
bands correctly return the "nothing matches" line. Verified end to end: no band
→ 14 cards; ₹80 Lacs + → that one project; ₹45 – 65 Lacs → none.

**The navbar's `Book Consultation` went nowhere on six of eight pages.** It was
`href="#ctForm"` — a same-page anchor, and `#ctForm` is the enquiry card on
`contact.html` alone. Everywhere else the bar's one primary button, and the
mobile sheet's, simply did nothing. Both are `contact.html#ctForm` now on every
page but `contact.html` itself, where the bare anchor is correct. (`project.html`
was already pointing at `contact.html`, so it needed no change.)

**Phones were audited across twelve viewports** — 280x653 (Fold closed),
320x568, 360x640, 360x780, 375x667, 390x844, 393x852, 412x915, 414x896,
430x932, and both landscapes (667x375, 844x390) — on all eleven pages. The good
news first: **there was no horizontal overflow anywhere**, at any size, on any
page. The layout already held. Two things did not.

**1. The home hero collided with the navbar on short screens.** `.hero-content`
was absolutely positioned and centred on 57% of a 100vh hero (it is anchored to
the foot now — see *The search form is anchored to the foot of the hero*), which
is right on a desktop. Below 520px the search form flips to a column and stands ~287px tall,
making the whole block taller than the screen — so centring pushed its top under
the fixed bar and its bottom past the fold. Measured at 360x640: navbar 90px,
headline top at y=56 (34px *inside* the bar), submit button 10px below the fold.
The old tier's answer, pulling the block to 52%, moves the collision rather than
removing it.

On a phone the block now **flows** instead: `.hero` becomes `height:auto` with
`min-height:100svh`, `.hero-content` drops out of absolute centring and takes
`margin:auto` with top padding that clears the bar. A short headline still fills
the screen; a long CMS sub-heading now costs a short scroll rather than hiding
the headline — the same trade the About section already makes. Measured after:
the headline clears the bar by 21px at every size down to 280px wide, the hero
always grows to fit its content, and the submit button is always inside it.

**The tier is `(max-width:620px),(max-height:560px)`, and the second half is
load-bearing**: a phone in landscape is **844px wide and 390px tall**, so a
width-only query misses it completely — and short is exactly the case this
exists for.

**2. The label type fell under 11px.** The site sets its small-caps labels
between .58rem and .68rem with .16em to .34em of tracking; on a phone that
measured 9.3px for the hero's PROPERTY / LOCATION / BUDGET, 9.6px for a project
card's category, 9.9px for the lead popup's eyebrow and the detail page's fact
labels, and 9.0px for the brand-card trades. That is under the ~11px both
platforms treat as the floor for secondary text, and worse than the number looks
because wide tracking costs legibility fastest at small sizes.

One block, **identical in all eleven files**, floors seventeen selectors at
.72–.74rem (11.5–11.8px) and eases the tracking wherever it was .22em or more.
It is identical rather than tailored on purpose: a selector that does not exist
on a given page costs nothing, and one string copied eleven times cannot drift
the way eleven tailored ones would. It changes no layout.

Two details worth keeping: the tier is scoped
`(hover:none),(max-width:620px),(max-height:560px)` for the same landscape
reason, with `hover:none` catching tablets; and **`.sv-card .sv-slot span` had
to be named explicitly**, because it is more specific than `.sv-slot span` and
was still winning at .56rem.

**One audit result is a false positive, and will be again.** `services.html`
reports its first heading 7px under the navbar at every size. That heading is
`h1.sv-sr` — the screen-reader-only alt text for the painted hero band, clipped
to a 1px box. Nothing visible is colliding.

**Adaptive navbar** (last IIFE, every file). It samples the actual painted background behind `#navWrap` at three x-positions per scroll tick, averages relative luminance, and toggles `.on-light` (charcoal text) above a threshold of 150. Reading the live background rather than tagging sections means it keeps working when light sections are added. Full-bleed overlays that darken a light section from above carry `pointer-events:none`, so `elementsFromPoint` can't see them — they're listed in the `DARK_OVERLAYS` array (currently `['veil']`) and tested by geometry/opacity instead. **If you add another full-bleed dark overlay, add its id to `DARK_OVERLAYS` in all eleven files.**

**Single-column grid tracks need `minmax(0,1fr)`, not `1fr`.** A `1fr` track floors at its content's min-width, so one nowrap child (the detail page's tab row) inflates the whole column past a narrow viewport instead of scrolling inside its own `overflow-x:auto` container. Every stacking rule in the Section VI media queries uses `minmax(0,…)` for this reason.

**Clipped elements report zero intersection.** Anything hidden with `clip-path: inset(0 0 100% 0)` never fires an `IntersectionObserver` watching it directly — being clipped is what suppresses the observer that would reveal it. Always observe an unclipped wrapper and add the reveal class to a child.

**Motion.** `transform` and `opacity` only — no layout-triggering properties. Easing is `cubic-bezier(.16,1,.3,1)` throughout, exposed as the `--lux` CSS var and the `LUX` JS const (`--lux-2` for secondary moves). Every page has a `prefers-reduced-motion` branch: five `@media (prefers-reduced-motion:reduce)` blocks unclip and settle the compositions, and the script's `reduce` flag skips scroll-driven effects. Preserve that branch when adding effects.

## Content management (Sanity)

**Edits take about a minute to show.** The pages read `apicdn.sanity.io`, whose
responses carry `cache-control: max-age=60`, so a change published in the Studio
appears within roughly a minute — and a browser that already fetched the query may
hold its own copy for that minute too. When something looks like it did not save,
check the document in the Studio before suspecting the page.

`studio/` is a Sanity Studio with **nine schemas** (`studio/schemaTypes/`), and
by now it drives nearly every page:

| Schema | Shape | Drives |
|---|---|---|
| `project` | one per property | the three collection pages and `project.html?p=<slug>` |
| `homepage` | singleton `homepage` | all of `index.html` — hero, About, Why, Signature |
| `collectionPage` | four fixed ids | the wording and banner on each listing view |
| `ownersPage` | singleton | Section XI of `index.html` — see *The owners live on their own document* |
| `testimonial` | one per review | the marquee cards on `testimonials.html` |
| `testimonialsPage` | singleton | that page's wording and the client photo slider |
| `contactPage` | singleton | all of `contact.html` |
| `legalPage` | three fixed ids | `privacy.html`, `terms.html`, `disclaimer.html` |
| `siteSettings` | singleton | social handles and the footer contact, on every page with a footer |

**The owners live on their own document.** `ownersPage`, fixed id
`owners-page`, holding `label` / `heading` / `intro` and the `owners` array of
name / role / bio / portrait. It drives **Section XI of the home page**, not a
page of its own — the id is a leftover and is kept on purpose.

The short history, because the id will otherwise look like a mistake: these
fields began as a fifth group on the `homepage` singleton; on 31 Oct the section
was given a page of its own (`owners.html`) and `studio/scripts/move-owners.mjs`
moved them onto this document; later the same day the page was dropped and the
marquee went back to the home page — but the content stayed where it was, because
the client had filled it in by then and moving a document a second time to tidy
up an id would have risked their work for nothing. The home page's query reaches
across for it:

```groq
"ownersPage":*[_id=="owners-page"][0]{label,heading,intro,
  owners[]{name,role,bio,"photoUrl":photo.asset->url}}
```

`move-owners.mjs` has been run and is spent. It is kept because it documents the
move and is a no-op if run again — it refuses to overwrite anything already on
the owners document.

The portrait is requested at `w=900&h=1200&fit=crop&crop=focalpoint`, so the
**hotspot steers the crop** — worth setting on the face, because the card is 3:4
and the copy covers its bottom third.

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
heading, intro and the four cards — see below). The numbered points are numbered by position,
so the client never types "01"; the sketched tower in the timeline is a sibling of
the dated events and is moved back to last after the list is rebuilt, or the gold
rail stops running behind them. `studio/scripts/seed-home.mjs` fills it with the copy that was
written into `index.html` and uploads the About plate, so the client opens a
filled form rather than a blank one; it is `createOrReplace`, so re-running it
**discards their edits** — only run it on a fresh dataset.

**The signature cards point at projects.** Each of the four cards on the home
page carries a **reference to a `project` document**, and the project fills the
card: name, category, location, short description (`blurb`), card photograph and
the "View Project" link all come from it, so editing the property updates the home
page too. Every other field on the card is an **override** — fill one in only to
say something different there than on the collection card. The reference exists
because the link used to be a hand-typed string: the client cannot reasonably be
expected to write `project.html?p=the-slug`, and in practice typed `project.html`
once and left the other three blank, so three of the four buttons were `href="#"`
and the fourth opened Romal Kirti under another property's name.

**All four were linked for real on 4 Nov**, by
`studio/scripts/link-signature-projects.mjs`. Until then every card was still a
block of hand-typed text with no reference at all — the three that worked worked
only through the name-match fallback below, and the fourth did not work at all.
The script published the one project that existed only as a draft, copied each
card's wording onto its project wherever the project was empty, set the
reference, and cleared every card field that had become a duplicate of the
project's. It is idempotent and `--dry`-runnable; the reasoning for each decision
is in its header.

**The overrides are collapsed in the Studio**, in a fieldset called *Say
something different on this card*, with the project reference alone above it and
now `required`. The flat form is how four cards came to be typed in by hand with
no project behind any of them: the override fields read as *the* form, and
picking a project looked optional. A filled override still shows through the
collapsed summary, which is what makes a deliberate disagreement easy to find.

**Three overrides were deliberately LEFT** rather than cleared, because the card
and the project genuinely say different things and only the client can say which
wins: Rajlaxxmi Park's card says `Residential` where the project says
`Luxury Apartment`; Aarvi Apartment's says `Luxury Living` against `Residential`;
and Nakshatra Auris's card carries the abbreviated `Virar-Nsp link Road` against
the project's fuller `Virar-Nallasopara Link Road`. Deleting one in the Studio
hands that wording back to the project, and both pages then agree — which is
what *Project names differ between pages* has been asking for.

Four things in that resolution are load-bearing:

- **`project.html` with no `?p=` is treated as *unset*.** That file is the
  hand-written Romal Kirti fallback, which is never the card's own property, so
  honouring it would send a card to the wrong building.
- **A card with no reference is matched by name** against the published projects,
  using the same forgiving key as the collection banner's hotspots (`spKey` —
  folds case and punctuation, collapses doubled letters, so `Rajlaxxmi` and
  `Raajlaxmi` agree). This is what makes the cards the client already typed by
  hand link correctly with no CMS edit at all; the reference is then only needed
  when the two spell a name differently. The lookup rides along in the home
  page's existing query as `"projects":*[_type=="project" && …]` — no second
  request.
- **If nothing resolves, the button is removed** rather than left on the markup's
  href. A "View Project" that opens a different property's page is worse than no
  button, and its absence is the visible signal that the property has no document
  yet. With Sanity unreachable `paint()` never runs, so the hand-written cards
  keep their own buttons.
- **An UNPUBLISHED project is the same as no project**, and this is the trap that
  actually bit. Shanti Niwas's missing button looked like a missing document; the
  document existed, filled in and filed `completed`, as `drafts.c365c797…`, left
  unpublished in the Studio since 28 Oct. The public API cannot see a draft, so
  the name match found nothing and the button removed itself — correctly. **Check
  for a draft before concluding a document does not exist**: a token-authenticated
  `getCliClient()` query returns drafts and the public endpoint does not, so the
  two disagree, and `*[_id in path("drafts.**")]` is what settles it. For the same
  reason a reference must never point at a `drafts.` id: it resolves to nothing
  for a visitor.

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
**runs as a continuous marquee, the same way the reviews above it do** — a CSS
animation on `.tg-track` (`@keyframes tg-marquee`, `--tg-loop` / `--tg-dur`,
`SPEED` 42 px/s, slower than the reviews' 70 because these are photographs
rather than lines of text). The compositor drives it, `.tg-stage:hover` and
`:focus-within` pause it with no script, a background tab stops it for free, and
it is verifiable in headless Chrome. The stage carries the same edge-fade mask as
the reviews. It ships with `hidden` on it and is revealed only once the CMS
carries at least one photograph — the one place on the site where an empty block
removes itself rather than falling back to markup.

**The number of copies is computed, not fixed.** A marquee has to be at least one
full set wider than its stage or translating by one set width runs off the end
and shows a gap. The reviews can render exactly twice because six cards already
overflow the stage; the gallery cannot, because it may hold a single photograph —
with one, a 300px tile against a 1312px stage needs **six** copies. `build()`
measures a tile, works out `max(2, ceil(stageWidth / setWidth) + 1)` sets, renders
that many and re-measures; it re-runs on `load`, `fonts.ready` and `resize`,
because a wider window needs more of them. Copies past the first carry
`aria-hidden` and an empty `alt`.

**Reduced motion keeps every photograph reachable**, which is where this differs
from the reviews: that strip simply rests, leaving later cards unreachable. Here
the branch renders a *single* set, puts `overflow-x:auto` and the scroll-snap
back on the track, drops the mask and **brings the arrows back** (they are
`display:none` in the marquee, where there are no discrete slides to point at).
`ends()` returns early unless the branch is active, and the `change` listener on
the media query rebuilds if the preference is toggled live.

**The tiles are square** (`.tg-ph{aspect-ratio:1/1}`, requested at `w=760&h=760`).
They were 4:3, which threw away 25% of the height of a 1:1 file — on the first
photograph the client uploaded, that was exactly the "CONGRATULATIONS TO …" line
along the bottom. These are handover posters and the client's are square, so the
tile matches the source and nothing is cropped. **The two have to be changed
together**: the CSS ratio and the `h=` in the image request are what keep the
request and the box in agreement. A non-square photograph added later *will*
still be cropped to fill — switch the request to `fit=clip` if mixed shapes
become the norm, which letterboxes instead.

The field is **`gallery`**, not `photos`, and the intro is **`introText`**, not
`intro` — worth knowing before concluding from a hand-written GROQ query that
the client has not published anything.

**Site settings.** A singleton (`site-settings`) holding the **social handles**
and the footer's telephone, email, address and copyright line. Its block is
identical in all ten files that have a footer and reads one document, so the number that used to
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

**The hero headline and its sub-paragraph are GONE** — markup, CSS, entrance
animation, `fitHeadline()`, the `paint()` branch and the GROQ fields alike. The
hero is now the film and the search form, and nothing else. The client's own
film carries a title card ("EVERY GREAT JOURNEY BEGINS WITH A VISION.",
~10.3s–15.3s of every loop, centred) which was landing across the sub-heading;
two sets of copy over one photograph read as a mistake.

What went, so nobody hunts for half of it:

- the `<h1 class="headline">` and its `.line-reveal` / `.line-inner` spans, and
  the `<p class="sub">`;
- the `.headline`, `.line-reveal`, `.line-inner`, `.line-rule` and `.sub` rules
  **and their phone-tier overrides** — `index.html` only. **The other ten files
  still carry all of them** in their copy of the shared stylesheet, where they
  are equally dead because no other page has a hero. Do not "sync" them back;
- the line-mask entrance loop and the `.line-inner` line in the reduced-motion
  branch;
- `fitHeadline()`, its `resize` listener, its `fonts.ready` hook and both call
  sites. Nothing in the hero now has a size that depends on how much text the
  CMS sends, which is what that function existed for;
- `heroHeadline` and `heroSub` from the home query in the `<head>` block.

Three things are deliberately NOT done:

- **`heroHeadline` and `heroSub` are still on the `homepage` document and still
  in the schema.** Clearing them would destroy the client's copy to tidy a form.
  The consequence is that editing either in the Studio now does nothing, and
  that is the one confusing thing about this change.
- **`reveal()` keeps its null guard** even though the only call left
  (`#heroSearch`) can never be null. These calls sit one after another in a
  single `onIntro` callback, so a throw on a missing element does not skip that
  element — it aborts every reveal after it. That is exactly what leaving the
  sub-paragraph's call in place would have done to the search form's entrance.
- **The page now has no `<h1>` at all.** That is a real SEO cost on a marketing
  home page and it was the client's explicit call, made after being told. If it
  is ever wanted back without the visible text, the idiom is `.sv-sr` on
  `services.html`: an `<h1>` clipped to a 1px box.

Measured after, at 390x844, 360x640, 844x390 (landscape), 280x653, 1024x800 and
1440x900: **no horizontal overflow at any size** (`scrollWidth` equals the
viewport at all six), the form clears the navbar and sits inside the fold
everywhere, and no console errors. The trimmed query was run against live Sanity
and still returns all 27 keys.

**Measure this sort of thing with CDP `Emulation.setDeviceMetricsOverride`, not
with `--window-size --screenshot`.** The latter produced a picture showing the
form running off the right edge at 390px that the DOM flatly contradicted, and
`innerWidth` falls back to **756** whenever the override does not take. Two
traps that cost time here: reading the form mid-entrance reports `opacity:0` and
looks like a broken reveal (it is up by ~5s — `delay 1820ms` + `1200ms`, timed
from when the loader lifts); and **`set -- $s` does not word-split in zsh**, so
a viewport loop silently passes `W=NaN` and every row comes back 756.

**The search form is anchored to the foot of the hero, not centred on a
percentage.** `.hero-content` was `top:57%` with `translate:0 -50%`, which was
right while the box held a headline, a paragraph and the form and the three were
centred as one composition. The form is all that is left of it, and the client
asked for it lower — measured off their marked-up screenshot, a box centred at
**88.8%** of a 1600x997 viewport.

A percentage top would have delivered that at one size only: the gap under the
form shrinks as the window gets shorter, and at 1024x640 a centre of 88.8% leaves
under 30px of floor. So it is `top:auto` with
**`bottom:clamp(2.5rem,6.5vh,5.5rem)`** — a constant gap from the fold, floored
at 40px on a short window and capped at 88px on a tall one. Measured, that lands
the centre at 88.8% at 1440x900 and 89.2% at the client's own 1600x997, inside
4px of where they drew it. No `translate` is needed any more; the mouse parallax
still arrives as `transform`, which the reduced-motion rule clears by itself.

**The phone tier's `bottom:auto` is load-bearing.** That tier takes
`.hero-content` out of absolute positioning (`position:relative`, `margin:auto`),
and on a relative element a leftover `bottom` does not anchor anything — it
*shifts the box upward* by that much, which would lift the form back under the
navbar on exactly the screens that tier exists to protect.

Measured at 1600x997, 1440x900, 1920x1080, 1366x768, 1024x640, 1024x800, and the
phones 844x390, 390x844, 360x640 and 280x653: no horizontal overflow anywhere,
the form clears the navbar and stays inside the fold at every size, and the
phones are untouched (they still flow). Note the form is **two rows at and below
1024px wide**, so it stands ~142px rather than ~86px there and its centre sits
higher (82–85%) — that is the form wrapping, not the anchor failing.

**Hero, About and Why can each take a video.** `mountVideo()` in the home-page
block is shared by all three: it drops a silent looping `<video>` into an element
that is already showing a picture, and is **skipped on phones, on data-saver
connections, on a 2G-class link and under `prefers-reduced-motion`**, removing
itself if the file errors or autoplay is refused. The photograph is always
painted first, which is what every one of those cases falls back to. The CSS is
**`index.html`-only** — `.hero-vid` / `.cms-vid` appear in no other file — so
unlike the rest of the shared stylesheet there is nothing here to sync.

**The video never appears until it can actually play, and that rule is the
whole design.** On 4 Nov the client uploaded the edit master into the hero slot:
**3840x2160, 24fps, 81.5 Mbps, 265.6 MB**, with a 317 kbps AAC track on a video
the site plays muted. A visitor needs 81.5 Mbps *sustained* to keep up with that,
which no consumer connection delivers. Measured on a 12 Mbps link with the old
code: the element went to **opacity 1 at 254ms with `readyState` 0**, first
frames at 5.6s, then stalled at 6.0s, 10.1s and 14.0s — **24 seconds of wall
clock bought 1.63 seconds of playback.** That is the "laggy, keeps pausing" bug.

Four rules now stand between the file and the visitor, and each one is that
failure:

- **It is not fetched until the page has loaded** (`whenQuiet`, capped at 2.5s so
  one hanging image cannot hold it for ever). It is the biggest thing the page
  fetches and nobody is waiting for it; starting it at once makes everything that
  *is* being waited for late.
- **It is revealed only on a promise about the future** — `canplaythrough`, or a
  real runway of five buffered seconds ahead (the whole clip, for one shorter
  than that). An earlier draft fell back to `readyState >= 3` on a timer, which
  is HAVE_FUTURE_DATA, *"the next frame exists"* — true of a 265MB file three
  seconds in, so it faded the video up and straight into the stutter. **Having a
  next frame is not the same as being able to keep having one.**
- **Three visible stalls and the photograph wins.** Stalls before it is shown are
  not counted; the visitor cannot see those, and counting them would retire a
  video that was merely buffering.
- **Never ready at 20s and it is dropped**, so a visitor's data is not spent on
  something they will never see.

It fades in over .9s (`.on`), stops when off-screen or the tab is hidden, and
every exit leaves the still showing rather than a black box.

**Only a `NotAllowedError` from `play()` may remove the video, and that is not
a nicety.** The observer pauses a video mounted below the fold a frame or two
after `play()` is called, and that pause **rejects the pending promise with
`AbortError`**. A blanket `go.catch(kill)` therefore deleted the About plate's
video the instant it mounted — while the hero survived, because it happens to
be on screen, so nothing ever interrupted its `play()`. The symptom was a
section whose video silently reverted to its photograph with no console error
of any kind. A rejected `play()` is not by itself a refused autoplay.

Measured on the fixed page: with the hero on screen and About below the fold,
`hero-vid on paused=false | cms-vid on paused=true` — the About video mounted,
ready and correctly held; scrolled to About it resumes (`paused=false`); at the
foot of the page **both** are paused, where the old code left both decoding for
ever. Measured with the
265MB file still in place: **opacity 0.00 for the whole visit, zero visible
stutter, the photograph holding** — so the code alone fixes the symptom even
before the file is replaced. With a 7.5MB 1080p encode: mounted 2.5s,
`canplaythrough` 2.54s, dissolved in 2.75s, **zero stalls**, real-time playback.

**Both CMS videos are camera masters and want re-encoding.** Neither is a code
problem; both are an asset swap, and `studio/scripts/replace-hero-video.mjs`
does it (it uploads, patches `homepage`, prints the old asset ids first, and
never deletes the original, so it is reversible). Measured against the master,
scaled to 1080p, as the SSIM reference:

| | size | vs now | SSIM |
|---|---|---|---|
| hero, as uploaded (4K, 81.5 Mbps) | 265.6 MB | — | — |
| hero 1080p CRF 23 | 14.2 MB | 19x smaller | 0.983 |
| hero 1080p CRF 26 | 9.6 MB | 28x smaller | 0.977 |
| hero 1080p CRF 28 | 7.5 MB | 35x smaller | 0.972 |
| hero 1080p CRF 30 | 5.9 MB | 45x smaller | 0.967 |
| About, as uploaded (630x830, 11 Mbps, 4.5s) | 6.13 MB | — | — |
| About CRF 23 | 0.59 MB | 10x smaller | — |

Encoded with `-an` (the site plays them muted, so the audio track is waste),
`-movflags +faststart` and `-g 48`. Denoising first was tried and bought nothing
on this footage. **1440p was measured too and is not worth it** — 15.7 MB for a
background behind a dark scrim. The schema's own advice ("under about 10 seconds
and 8MB") is the right target and was simply not followed.

**The hero was swapped a second time on 4 Nov, and this one was NOT re-encoded.**
The client supplied `Homepage video.mp4` — **1280x720, 24fps, 4.64 Mbps, 27.2s,
15.8 MB**, already faststart (`moov` ahead of `mdat`), with a 2.7 kbps AAC track
on a video the site plays muted. It went up as a **stream copy**
(`-c:v copy -an -movflags +faststart`), so the video bitstream is **byte-identical
to the file they handed over** — verified by comparing the MD5 of the video track
either side (`fd14bb593f8ef1a991cc5397306568aa` both times). Only the dead audio
track was dropped.

That is the opposite of the first swap, and the measurements are why:

| | size | bitrate | SSIM vs their file |
|---|---|---|---|
| stream copy (what shipped) | 15.06 MB | 4.64 Mbps | identical |
| 720p CRF 18 | 13.60 MB | 4.19 Mbps | 0.990 |
| 720p CRF 20 | 10.63 MB | 3.28 Mbps | 0.988 |
| 720p CRF 22 | 8.26 MB | 2.55 Mbps | 0.985 |

The 4K master compressed 35x for SSIM 0.972 because it was a wildly inefficient
camera encode. **This file is not** — it is dense, finely-detailed rendered
footage that is already near the knee of its own rate curve, so CRF 18 buys 1.5 MB
for measurable loss. Re-encoding it is bad value; do not "optimise" it again
without re-running these numbers.

**The price of shipping it whole is that slow connections get no video at all,
and that is deliberate.** Measured on the real page: at **12 Mbps** it mounted at
2.5s, hit `canplaythrough` at 2.6s, dissolved in by 2.75s, buffered the whole
27s and played real-time with **zero stalls**. At **3.2 Mbps** — below the clip's
own 4.64 Mbps, so it can never keep up — it **never reached the reveal gate,
stayed at opacity 0 for the entire visit and was removed at 22.5s** by the 20s
give-up, leaving the photograph. Nothing stuttered; the visitor simply never saw
a video. That is the four rules above working, not a fault. Dropping to CRF 22
(2.55 Mbps) is the lever if reaching those visitors ever matters more than the
last 1.5% of SSIM.

**It is 720p where the previous file was 1080p.** That is the source, not a
choice — upscaling adds bytes and no detail.

**The footage has copy burnt into it, and it collides with the hero's own.**
"EVERY GREAT JOURNEY BEGINS WITH A VISION." fades up at **~10.3s and clears by
~15.3s** — five seconds of every 27-second loop — centred in frame, which puts it
straight across `.hero-content`'s sub-heading. Screenshotted at 1440x900: the
video's line runs through "Discover thoughtfully crafted spaces where innovation
meets elegance…" and the two tangle. **No CSS fixes this**: the hero is
`object-fit:cover` and at 16:9 there is almost nothing to crop, and the headline
is where the design wants it. It needs either a re-edit with the title card
removed, or the 10–15s segment cut out of the clip. The clip also **cuts hard at
the loop point** — it ends on a daylight exterior and restarts on an interior.
Both are the client's to decide.

**`.gitignore` now ignores root-level `*.mp4` / `*.mov`.** The repo *is* the
deploy, so a master left in the working directory and committed by reflex would
ship to the CDN for nothing. Videos belong in Sanity.

**`replace-hero-video.mjs` rotates its undo file rather than overwriting it.**
The script can be run more than once and each run records only one step back;
clobbering `.video-revert.json` would strand every earlier version with nothing
pointing at it, though the assets are all still in the dataset. The live file is
always the most recent step (what `revert-videos.mjs` reads) and the
`.video-revert.<timestamp>.json` copies are the trail behind it.

**A note on the still underneath.** `heroImage` is **empty** on the `homepage`
document, so the hero's fallback is the inline base64 night skyline built into
`index.html` — while the video is a sunlit interior cutting to a golden-hour
aerial. The dissolve is therefore a change of scene, not a cross-fade. Setting
`heroImage` to a frame from the video would make the hand-off invisible; it is
a content decision and has not been made.

**Do not give `.why-feature .img` a `position` other than `absolute`.** It is
`position:absolute; inset:0`, and making it `relative` drops the inset and
collapses the banner to zero height — which is exactly what happened when the
video CSS first tried to make it a positioning context. It and `.ab-photo` are
both already positioned, so the video anchors without help; only
`overflow:hidden` is needed, for the About plate's 30px radius. (The inset used
to be `-9% 0`, an overhang for the parallax; both are gone — see below.)

**The Why heading and photograph share one screen.** Two rounds of client
feedback: first the plate cropped the group (it was ~2.2:1 against a 3:2
photograph, so `cover` ate the ceiling and the front row's feet), then the
heading and the photograph together ran well past the fold — the plate's bottom
sat ~280px below it at every size. The section as a whole still scrolls (the
numbered rows, timeline and quote follow); it is the **first movement** that
holds one screen.

- `.why` declares **`--why-h:min(50vh,540px,44vw)`** and `.why-stage` is
  `width:min(100%,calc(var(--why-h) * 2))`, so the plate is sized from what is
  left *after the header* rather than from the viewport alone. `44vw` is the same
  guard the About plate needs — it stops a short, wide window making the plate
  wider than its column.
- **The plate is `aspect-ratio:2/1` and that crop is deliberate.** It removes
  ceiling, not people: the group occupies **y 43%–89%** of the frame, with 43%
  dead ceiling above and 11% floor below, so a 2:1 window (75% of the height)
  holds the whole line-up with room either side. `background-position:center 85%`
  places that window at 21%–96%. **Going wider than about 2.3:1 starts eating the
  front row's feet** — measured, not guessed. This is why the plate is 2:1 rather
  than the photograph's own 3:2: at 3:2 it has to be ~630px tall to be 945 wide,
  and the heading then cannot share the screen with it.
- **The stage is narrowed to the plate, not the plate centred inside a
  full-width stage.** The rotating seal is a *sibling* of `.why-feature` — it has
  to be, because the plate is `overflow:hidden` and the seal overhangs its corner
  — so it only stays pinned to that corner when the stage is exactly the plate's
  width.
- The header was compressed to make room: top padding
  `clamp(8.4rem,calc(7.4rem + 1.6vh),9.4rem)` (it was `clamp(6rem,17vh,170px)`,
  which is the gap the client asked to cut), `.why-title` down from
  `clamp(2.6rem,5.2vw,74px)` to `clamp(2rem,3.6vw,52px)`, and tighter label,
  intro and stage margins. **Two short-window tiers** (`max-height:820px` and
  `max-height:700px`) step the heading down further; without the second, the
  plate cleared the fold by 9px at 1024x640.
- **The feature image's parallax is gone.** The `.img` used to carry
  `inset:-9% 0` as an overhang to slide, which cropped a further 9% top and
  bottom. It is `inset:0` now, so translating it would drag an edge off the plate
  and show the ground behind. The blueprint corners still drift.

Beware `.why-title`'s font-size line: **Section X's `.br-title` carries the
identical declaration**, so a blind search-and-replace hits both.

Measured at 1920x1080, 1600x1000, 1536x864, 1440x900, 1366x768, 1280x800,
1024x800 and 1024x640: ratio exactly 2.000, plate clear of the fold by 16–132px,
seal still on its corner.

**Studio sidebar**, in order: `Home page`; **All Projects** — which holds the
browse-everything page's own content and then one folder per stage
(`Completed`, `Ongoing`, `Redevelopment`), each containing that listing's **Page
content** and its **Projects** list, with the `project-by-stage` template so a
project created inside a folder is already filed, plus `Not yet filed` and
`Every project` at the bottom as the safety net; then `Testimonials` (Page
content + Reviews), `Meet Our Owners`, `Contact page`, **Legal pages** (Privacy
Policy / Terms of Use / Disclaimer), a divider, and `Site settings`. Every
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

**Every query starts in the document `<head>`, not in the trailing script.** This
is the one thing to know before touching any Sanity block.

The queries used to be issued from the trailing `<script>`, behind the whole of
the body. On a cold connection the browser had to receive the entire document —
854KB on `index.html`, most of it the inline base64 hero — and queue the ~2.5MB
of photography the markup asks for, before it so much as asked the CMS a
question. Measured at 400KB/s: **the first query left at 2.3s and the content
changed on screen at 3.5s**, by which time the loader had lifted, so a visitor
on a cold cache watched the fallback copy and placeholder photographs written
into the file get replaced in front of them. That is the bug this arrangement
exists to prevent; with the same throttle the queries now leave at **14ms** and
are all answered by **1.2s**, before the HTML has finished arriving at 2.3s.

The `<head>` block, immediately after the favicons and marked
`===== THE CMS QUERIES START HERE =====`, is the page's **data layer**: the one
`SANITY` config, the GROQ text for every query that page makes, and a `get()`
that fires them at once. It publishes `window.RL`:

| | |
|---|---|
| `RL.sanity` | `{projectId, dataset, apiVersion}` — one per file now, not one per block |
| `RL.q` | the queries, by name: `RL.q.settings`, `RL.q.home`, `RL.q.projects`, … |
| `RL.p` | the already-encoded tail for a query that takes a GROQ parameter — only `project.html`'s `$p` uses it |
| `RL.get(query, params)` | the memoised fetch; returns the parsed JSON |

Four rules follow from it:

- **The query text lives in the head block and nowhere else.** A block at the
  foot of the page asks by name — `RL.get(RL.q.settings)` — and must never write
  the query out again: `get` memoises on the query string, so a second copy that
  drifted by one character would quietly miss the memo and fetch twice. Adding a
  query is one entry in `q` plus one `RL.get()` where it is painted.
- **A query whose text depends on the URL is computed in the head too** — the
  legal pages' `DOC`, the collection pages' `DOC_ID`, the detail page's `?p=`.
  Each derivation is duplicated from the block that also needs it for its own
  guard; the two have to agree, and both handle Netlify's `.html`-less URLs.
- **`get` memoises, so two blocks wanting the same answer share one request**,
  and a block that runs late gets an already-resolved promise rather than a
  second round trip. A query that resolves to a falsy string (an unknown legal
  file, a detail page with no `?p=`) is never sent.
- **The `if(!SANITY.projectId) return;` guards are now `if(!window.RL) return;`.**
  Every block still keeps its own fallback on failure, unchanged.

Each page also `preconnect`s to `lc9w15ba.apicdn.sanity.io` and `cdn.sanity.io`,
so the TLS handshake for both is open before the stylesheet has been read.

`projects.html` reads the collection with a single GROQ query over plain HTTP in its Section V
IIFE — no SDK, no build step, no token, so the no-dependency rule still holds.
The eight cards written into the file are the fallback: they render when
`SANITY.projectId` is blank, when the query fails, and when the dataset is empty,
so the page can never come up empty. Card data moved from the old positional
tuples to named fields (`p.name`, `p.status`, …) so the CMS and the fallback
share one shape.

The Studio is hosted at <https://raajlaxmi.sanity.studio> (project `lc9w15ba`);
`npm run deploy` in `studio/` republishes it after a schema change.

Setup — project id, CORS origins, dataset visibility — is in `studio/README.md`.
**The id must be set in twelve places**: `studio/.env` and the `SANITY` block in
the `<head>` of each of the eleven HTML files. That is more files than before but
one block per file instead of two or three — the per-block `const SANITY = {…}`
objects are gone, so there is exactly one place per page that names the project.
The id also appears a second time in each file, in the `preconnect` href, which
cannot be built from a variable. Renaming a schema field means renaming it in the
GROQ text in those same head blocks.

Note the Studio's source sits inside the Netlify publish directory, so its config
files ship with the site. They hold nothing secret (a Sanity project id is public
by design, and `.env` is gitignored), but don't put a write token there.

## Photography and assets

Photography is a mix of committed local files and `picsum.photos` placeholders layered over a tonal gradient fallback (so the composition holds offline).

- Committed and referenced: `seal-top.png`, `seal-bottom.png`, `sketch-tower.jpg`, `house-sketch.jpg`, `floor-plan.jpg`, `floor-plan-l.jpg`, `assets/project-blueprint-left.png`, `assets/project-floral-right.png` (760x424, **no alpha** — every use of it is `mix-blend-mode:multiply` over a cream ground, on the three collection pages, `testimonials.html` and now the owner detail panel on `index.html`).
- `assets/cert-maharera.png` and `assets/cert-credai-mchi.png` are the accreditation marks in Section II's `.ab-creds` row, cut out of one flat client sheet and keyed transparent. Their captions are live HTML, not baked into the artwork, so they reflow and stay readable — keep it that way if the marks are ever re-exported.
- `assets/projects/western-line.jpg` is the corridor banner (1923x514, JPEG q94 — PNG was 498KB for no visible gain). Its copy is painted into the artwork, so the same content is written out in the `img`'s `alt` for screen readers and search. The band's background is set to the artwork's own ground (`#F4F0EF`) so the banner dissolves into it rather than showing as a rectangle, and one stray white pixel column was cropped off the left edge to make that work.
- The banner is 3.7:1 with baked-in type, so below 760px it would render the station names at ~6px. It is put in a horizontal scroller at a fixed 900px instead.
- `assets/projects/associates.jpg` is the **Associates & Consultant plate** on `projects-redevelopment.html` (1094x728, JPEG q94 — 134KB, down from 547KB as PNG). Its ground is `#F4F0EF`, the same as the corridor banners, so the band dissolves into it with no extra work. Unlike those strips it is **1.5:1**, so `.cor-figure.plate` centres it at `max-width:860px` rather than bleeding it to the band's edges — full-bleed would stand ~800px tall and swamp the page. Below 760px it scrolls sideways at a fixed 820px, same reason as the banners: the names are painted in and would otherwise render at ~7px. All 21 names are written out in the `img`'s `alt`.
  - **The artwork carries three copy errors**, none fixable in code: the last architect reads "ARCHITECH KAUSHIK PATEL" (should be ARCHITECT), the header reads "REDEVELOPING HOME REBUILDING LIVES" (reads as "Redeveloping Homes, Rebuilding Lives"), and the title is "ASSOCIATES & CONSULTANT" singular. The `alt` text spells all three correctly. Only a redraw fixes the plate itself.
  - It came in at 1094px wide but displays at 860 CSS px, so it is soft on a retina screen. Ask the client for the original export (~1720px or wider) and swap the file — nothing else needs to change.
- The 12 individual `assets/projects/*.png` marks were left over from an earlier markup rebuild of this band and have been **deleted** (~300KB, recoverable from git if the banner is ever rebuilt). Only `western-line.jpg` and `western-line-ongoing.jpg` remain in that folder.
- `assets/logos/` holds **30 brand marks** for Section X. Nine were already committed; the other 21 were cut out of the client's category sheet, so they are only ~175px wide — fine at display size, soft on a retina screen. Swap in vendor-supplied files when they arrive. **All 30 have been trimmed to their ink**, because each carried its own padding and the grid's sizing depends on them being tight; re-trim anything you replace.
- Section X fits every mark into an identical box with `object-fit:contain` rather than capping height alone — capping height left a 3x spread in optical weight between a wide lockup and a square roundel.
- `assets/why-team.jpg` is the Section IV feature plate's **fallback** (the group photograph, 2000×1332, 3:2); the `homepage` document carries its own 3508×2340 copy of the same shot. The plate crops it to **2:1**, which removes ceiling rather than people — the group sits at y 43%–89% of the frame. Do not re-crop the source file: the CSS crop is what lets the heading and the photograph share one screen, and it is tuned to those percentages. See *The Why heading and photograph share one screen*.
- Still placeholders: four `picsum.photos/seed/rl-*` URLs in `index.html` — the Signature Projects cards (Heights / Villa / Crest / Essence) — plus the seeded card art in the `projects.html` fallback list (real card images now come from Sanity). Replace by swapping the URL in the inline `background-image` (or the Sanity document) for the real asset. Earlier notes here claiming ten placeholders were stale.
- The About plate is `assets/about-plate.jpg` (excavator on site, 810×1212), set as `background-image` on `.ab-photo` in CSS. It used to be copied off the hero by the About IIFE; that JS is gone, so **don't reintroduce an inline `style.backgroundImage` there** — it would override the stylesheet. The one deliberate exception is the home-page content block, which sets an inline background **only when the `homepage` document actually carries a photograph**; with the field empty the stylesheet keeps this file. It is now only the **fallback under the CMS video** — the `homepage`
  document carries a 630x830 `aboutVideo` and no `aboutImage`, so this file shows
  only while the video is loading, on phones, on data-saver, under
  `prefers-reduced-motion`, or if the file fails. The plate keeps the `5/6.6`
  ratio exactly (it is the video's ratio) and is sized by height — see *The About
  section holds one screen*.
- `quote-strip.png` (the Vikram Raajlaxmi quote banner) has been **deleted** — Section III's `.sp-quote-img` figure was removed earlier. Recoverable from git if the quote is ever wanted back.
- The root-level `Generate_*.jpeg` / `download.png` / `Minimalist_*.jpeg` source art has been **deleted** — it was working material, not site assets. `footer.png`, `Services_start.png`, the seals and the sketches are all still referenced and remain.
- **Favicon**: `favicon.ico` (16/32/48, at the repo root so browsers find it unprompted) plus `assets/favicon-32.png`, `assets/favicon-192.png` and `assets/apple-touch-icon.png` (180). All eleven pages link them from `<head>`, right after `</title>`. Cut from the logo's building glyph with its dark ground **keyed out to transparency** (unmatted, so no dark fringe survives onto a light tab bar), squared up and centred with ~12% margin — the mark has to survive being read at 16px, so it sits deliberately large in frame.
- The logo ships as **two external PNGs**, `assets/logo.png` (brown/charcoal ink, for ivory grounds) and `assets/logo-light.png` (gold/cream ink, for the dark navbar **and the footer** — `.ft-mark`, which used to be the word RAAJLAXMI set in Cinzel with a tagline span under it; the artwork already carries both, so the text version was removed), both ~17KB with a transparent ground. The nav carries both stacked inside `.brand`; `.nav-wrap.on-light` crossfades between them via opacity, replacing the old `filter:` hack. Regenerating either from a new master means keying out its flat background and re-cutting both variants — edit them as a pair or the two states drift.

## Known content placeholders

**`projects-ongoing.html` / `projects-redevelopment.html`** are copies of `projects.html` with four differences: the `<title>`, the `.col-head` label/title/intro, `STATUS` hard-coded instead of read from the URL, and the Western Line banner swapped: the ongoing page carries its own (`assets/projects/western-line-ongoing.jpg`, "Rising Along the Western Line" — Vasai / Virar / Saphale, five projects), and the redevelopment page carries the **associates plate** (`assets/projects/associates.jpg`) in that slot instead — it has no corridor banner of its own. Both banners are client artwork used whole, same rules as the completed one: the band takes the artwork's ground colour so it dissolves, and below 760px it scrolls sideways at a fixed 900px because the station names are painted in. The redevelopment page additionally carries **placeholder cards** and one extra rule in its Sanity handler — `if(!result.some(inStatus)) return;` — so the live list is ignored while it contains no redevelopment project, which would otherwise blank the page. Publish one with that status and the placeholders are never seen again.

- **The dataset is the client's own (checked 4 Nov 2026).** The seeded placeholders
  are gone; there are **15 real projects with real photography** (14 until Shanti
  Niwas's draft was published on 4 Nov), and **every one is
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
- **`Shanti Niwas` is fixed** (4 Nov). Its "View Project" button was missing
  because its project document existed only as an unpublished **draft** — see
  *An unpublished project is the same as no project*. It is published now, at
  `project.html?p=shanti-niwas`, filed `completed`, and is the 15th card on the
  collection page as a result. All four signature cards now carry a real
  reference.
- **The four signature descriptions are still the invented placeholder copy**, and
  they are now the `blurb` on the four projects rather than text on the cards —
  `link-signature-projects.mjs` moved them there so the card could stop carrying
  its own copy. So they print on the collection cards too, and replacing them is
  one edit each in the Studio instead of two. Nakshatra Auris's was overwritten in
  the same move: that document is the seeded `project-raajlaxmi-villa` renamed, and
  its blurb still advertised "Exclusive villas" on a tower.
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
- **The stat figures are Playfair Display, and the reason is numeral design,
  not taste.** Cormorant Garamond — which the rest of Section II is set in —
  has **old-style figures** by default: the 1 is a short stroke with no flag and
  no foot, so `14+` rendered as `I4+` and `1 Million+` as `I Million+`, with the
  figure reading as a capital I. Playfair is **lining** (every digit cap-height,
  on the baseline), so a 1 is unmistakably a one. It is weight **600**, because
  these are the only figures left on the page and they are what the section is
  selling, and it is already in the `<head>` font link at 500/600/700 for the
  headings — **no extra request, no extra bytes**. `.ab-num .u` (the gold `+`)
  repeats the 600, because it is a separate node and would otherwise inherit
  nothing. `font-feature-settings:"lnum"` plus `font-variant-numeric` is
  belt-and-braces: Playfair is lining anyway, but asking explicitly means a
  future family swap cannot quietly bring old-style figures back and re-create
  the bug. **`index.html` only**, like the rest of the live Section II CSS — the
  other ten files carry a dead copy of these rules and must not be synced.
  Measured after the change: one line per figure at 1440x900 (31.7px) and at
  390x844 (24px), `0.9 Million+` being the longest, and the trust strip still
  22px inside the section's bottom edge, so Section II still holds one screen.
  The client first asked for **Valuta Solid**; it is not on Google Fonts, is not
  on the machine, and no file was supplied — the nearest real family is
  *Valute*, a different name, sold by Authentype. That request was dropped
  rather than shipped as a dead font name.
- The About counters take `data-to` / `data-suffix` plus two additions: `data-dec` (decimal places, so 0.9 does not round to 1) and `data-unit` (a word set in ink between the figure and the gold suffix, e.g. "Million"). They are the only counters left on the page.

## Performance

**Done.** The CMS queries start in the `<head>` — see *Every query starts in the
document `<head>`*, which is where the reasoning and the measurements are. Each
page preconnects to `apicdn.sanity.io` and `cdn.sanity.io`. The three rotating
seals on `index.html` carry `loading="lazy" decoding="async"`: they are
`seal-top.png` (259KB) and `seal-bottom.png` (**716KB**), they sit in Sections
III and IV, well below the fold, and together they were ~975KB of decoration
competing with the first screen on a cold load. Nothing about how they look
changed.

### Still to do

1. **`seal-bottom.png` is 716KB for a 620×620 mark** and `seal-top.png` 258KB for
   640×640 — between them the heaviest thing on the home page after the hero.
   They are flat gold line-work on transparency, so a re-export should be a
   fraction of that. This is an asset swap, not a code change.
2. `index.html` carries ~665KB of base64 (the hero JPEG) of a 773KB file. Extract to external AVIF/WebP with `srcset`. (The logo is already external — see Photography and assets.)
3. Subset or self-host the Google Fonts (Archivo Black, Cinzel, Cormorant Garamond, Inter, Playfair Display — five families on every page).
4. Give the hero plate `fetchpriority="high"` to improve LCP.
