# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **thirteen-page** static marketing site for Raajlaxmi Group: `index.html` (home), `projects.html` (browse-all collection, and the Completed view via `?status=completed`), `projects-ongoing.html`, `projects-upcoming.html` and `projects-redevelopment.html` (the same collection UI locked to one status), `project.html` (one property's detail page), `testimonials.html` (client voices), `services.html`, `contact.html` (enquiry page), `emi.html` (the EMI calculator), and the three legal pages `privacy.html`, `terms.html` and `disclaimer.html`. No build step, no package manager, no dependencies, no test suite. Each page is one self-contained document — `<style>` in `<head>`, markup in `<body>`, one `<script>` at the end — plus a handful of loose image files in the repo root and `assets/`. **There is exactly one exception to the self-contained rule**: Saathi, the chat assistant, is `assets/saathi.css` and `assets/saathi.js`, linked from all thirteen. No build step and no dependencies either way — see *Saathi, the rule-based assistant* for why that one was worth breaking.

Deployed to Netlify from the CLI. There is no build step — but **do not publish the repo root**: `studio/node_modules` lives there now. Publish a `git archive` export instead; see *Where this stands*.

`README.md` was rewritten on 26 Sep and now describes this build accurately (it previously documented a seven-section, single-file version that no longer exists). It is the public GitHub landing page; **CLAUDE.md is the detailed reference** — keep architecture notes here, not there.

## Where this stands (handover, 16 Nov 2026)

The site is **built, deployed and live** at
<https://raajlaxmi-site.netlify.app> (Netlify team `magnus realtorsmktg`,
deployed from `magnusrealtorsmktg-coder/raajlaxmi-site` on GitHub), and **almost
every page is now driven by Sanity** — see *Content management*. Construction is
essentially done. **The client commits to this repo themselves** — ten
commits on 9 Nov were theirs (the EMI page, the testimonials running order,
the hero search). Run `git log` before assuming the working tree is only
yours, and `git fetch` before pushing.

**NOTHING IS UNPUSHED. `main` is level with `origin/main`** through `e48751c`
(SOLD OUT as the badge's text). The line that stood here until 16 Nov saying
`235d30f` — the Why Raajlaxmi timeline — was "COMMITTED BUT NOT PUSHED" was
true when written and is not any more; it went out with the commits after it.
**Check `git log origin/main..HEAD` rather than trusting this paragraph**: the
client commits here too, and a sentence about what is pushed goes stale the
moment either of you pushes.

**Live since 16 Nov:** the rupee sign on every rendered price and the WhatsApp
button on all twelve pages (`223e4e6`, `3c943f1`), then the badge reduced to
SOLD OUT-or-nothing and the collection strip's invented telephone and email
replaced with the real pair off `site-settings`. See *The rupee sign is added
at render*, *The WhatsApp button is on every page* and *SOLD OUT is the only
badge there is*.

**No live defect is known on the site.** The one found on 14 Nov — six new
free-text prices breaking the budget filter, so that "Under ₹25 Lacs" returned
₹42-Lac projects — was fixed the same day, with a `price` per configuration
and a parser that no longer reads "1 BHK" as one rupee. See *A price per
configuration, and the budget bands that it fixed*; one hand-over step is
left there (`split-prices.mjs`, unrun).

**Three untracked files sit at the repo root and are deliberately not
committed**: `EMI-image.png` and `main-loggo.png` (working art — the logo was
already re-cut from the second into `assets/`), and
`brands_we_build_with_3d_prototype/`, which is a separate deliverable, not
part of this site. See *The 3D walkthrough prototype is a separate thing*.

**THE ONE THING BLOCKING LAUNCH IS THE DOMAIN**, and it is not a code job — see
*The domain cutover*. Everything else below is content the client owes or a
decision only they can make.

### Start here if you are picking this up cold

This file is long because the page is full of decisions that look arbitrary
and are not. The ones that will cost you an afternoon if you do not know them:

| before you touch… | read |
|---|---|
| anything in the shared chrome | *The `<head>` CSS is duplicated across all twelve files* — nav, footer, loader, the WhatsApp button and the `:root` tokens live in twelve copies |
| the WhatsApp button or its chat card | *The WhatsApp button is on every page* — it stands aside for two things, and both were found by measuring rather than by eye. It publishes its geometry, because Saathi's launcher stacks on it. A tap opens the card in `assets/wa-chat.*`, which shares Saathi's slot and takes its number from the button's href |
| the chat assistant, or either file in `assets/saathi.*` | *Saathi, the rule-based assistant* — the ONE piece of shared chrome that is not duplicated twelve times, and the one place a suggested chip can be offered and then not answered |
| a price anywhere on screen | *The rupee sign is added at render* — the CMS holds the figure without one, so `₹` is never in the stored string |
| any Sanity query | *Every query starts in the document `<head>`* — the query text lives in one place per file and `get` memoises on the string |
| a collection page | the three files are clones; a fix goes in all three |
| a `project` document in a script | *Drafts shadow the live site* — a token-authenticated query sees drafts, the public API does not, and this has bitten twice |
| the services band, its film or its sound | *The services page runs a film* — full screen with two cuts; the `object-position` tiers are measured from the watermark and subtitles burnt into the footage, and the sound must stay behind a tap |
| a video of any kind | *Hero, About and Why can each take a video* and the encode tables under it; every client upload so far has been a 60–265 MB master |
| a headless check | *Verifying locally — and one headless trap* — and measure with CDP device metrics, never `--window-size --screenshot` |
| any of the three moving strips | *The owners strip gives way and comes back* — the owners, the reviews and the photo gallery all run **one** implementation now; verify the drift by driving Chrome over CDP in real time, NOT with `--virtual-time-budget`, which reports zero for a working strip and a dead one alike — see *It shipped dead, and the harness is what hid it* |
| a price, a budget band or the EMI link | *A price per configuration, and the budget bands that it fixed* — `sizes[].price` is read first, and a configuration must never reach `money()` |
| the Why Raajlaxmi timeline | *The timeline shows headings and opens sideways* — the rail is a year and a name, and `data-detail` is the one source the panel and the rail label both come from |

**Deploys:** `git push origin main` publishes the site. The Studio is separate
and **Claude Code cannot run either** — the classifier blocks both. Hand the
command over.

**FOUR THINGS ARE WAITING ON SOMEONE DOING THEM BY HAND:**

1. **THE STUDIO NEEDS REDEPLOYING — DEFINITELY, as of 17 Nov.** `npm run
   build` passes (checked 17 Nov). THREE separate changes are waiting on it:

   - `upcoming` on the `project` schema's `stages` list and in `STAGES` in
     `sanity.config.js` (16 Nov) — until it is deployed the tick-box does not
     exist and nothing can be filed onto the Upcoming page. See *The Upcoming
     listing*.
   - the `ocReceived` boolean (16 Nov) — until it is deployed the OC mark
     falls back to the hard-coded list of nine names and the client cannot
     change it per project. See *The pill is the stage tag*.
   - the **rewritten amenity field** (17 Nov) — `icon` is no longer required,
     the list is 29 options instead of 14, and `label` is retitled *Name*.
     See *Amenities are the client's to invent*. **The site half of this is
     already live and works without the deploy** — checked against the
     deployed `project.html` on 17 Nov by running its own shipped resolver
     over twenty invented names: every one renders, the worst case being a
     plain tick.

     **BUT THE FORM IS WHERE THE CLIENT IS STOPPED, so this is not cosmetic.**
     The Studio they are using still has `icon` **required** from a closed
     list of fourteen, so an invented amenity cannot be saved without
     attaching an icon that was never meant for it. They can type any Name
     today; they cannot leave the icon alone. The deploy is the whole of what
     stands between them and inventing one. The row's preview now also says
     *icon chosen from the name* where the icon is blank, so the form explains
     itself rather than looking unfinished.

   The older, separate question below is still open:

1. **Earlier schema changes — PROBABLY deployed. Check before acting.**
   `cd studio && npm run build && npx sanity deploy --no-build -y`. Claude Code
   cannot run this; the classifier blocks `sanity deploy`.

   Four schema changes are in the repo and may or may not be in the deployed
   Studio: the `stages` tick-boxes (7 Nov), and `soldOut` / `sizes` /
   `walkthrough` plus four amenity icons (14 Nov). **The evidence is
   contradictory and this could not be settled from a terminal**, so do not
   repeat either claim without looking:

   - *For* it being deployed: Krishna Niwas carries the amenity icons
     `gazebo`, `indoor` and `landscape`, and three projects carry a populated
     `sizes` array. Those values have no way into a document except the Studio
     — or the API, which validates nothing.
   - *Against*: the amenity write is timestamped three minutes BEFORE the
     commit that added those options to the schema file.
   - **`raajlaxmi.sanity.studio` now 302s to the authenticated Sanity
     dashboard** (`www.sanity.io/@oRickwjyo/studio/…`), so the deployed schema
     can no longer be inspected without signing in. That is new.

   **The decisive check takes ten seconds**: open any project in the Studio and
   look for **Sizes by configuration** and **3D walkthrough**. If they are
   there, this item is done and the only thing missing is the `green` amenity
   (Common Green Space), which is in the schema but used by no project.
2. **Gmail forwarding** from `rajjlaxmi20@gmail.com` to whoever on the client's
   side should read enquiries. Until it is set up **an enquiry exists in
   exactly one inbox and nowhere else** — see *The forms post to Web3Forms*.
3. ~~**`soldOut` needs clearing off the documents.**~~ **Done, and then
   reversed.** The script was run, and on 14 Nov the client asked for sold-out
   back — so `soldOut` is a field again and three projects (Raajlaxmi Tower,
   Raajlaxmi Apartment, Nakshatra Auris) carry `true`. Because the retirement
   had actually run, nothing lit up on its own when the field returned; that
   was verified against the live dataset before the field was re-added.
   `scripts/retire-sold-out.mjs` is still in the tree and **must not be run
   again** — it would now clear live content. See *SOLD OUT sits under the
   blurb*.
4. **The Google sign-in app needs publishing.** It is in *Testing*, so the
   contact page's Continue with Google button works only for accounts added by
   hand as test users. Publishing needs a homepage and privacy-policy URL on
   the Branding page first, and no Google review. See *Continue with Google*.

### The domain cutover (not done)

`raajlaxmi.com` still points at Hostinger. The plan, settled on 6 Nov:

1. Client renews the Hostinger **Business** plan for 24 months (₹17,813.28 —
   3.3x cheaper over two years than hosting separately from email, and it
   covers both domains' mailboxes). **Never remove `raajlaxmi.com` from the
   plan**: the free email entitlement is attached to the domain on it.
2. Confirm both email rows read **2028** before touching DNS.
3. Then, and only then: delete **`ALIAS @ → raajlaxmi.com.cdn.hstgr.net`** and
   **`CNAME www → www.raajlaxmi.com.cdn.hstgr.net`** — those two and nothing
   else. (Seen in hPanel on 19 Nov. There are no separate `A`/`AAAA` rows on
   `@`; the two IPv4 and two IPv6 addresses a public `dig` returns all come
   from that one ALIAS to Hostinger's CDN. Delete before adding — hPanel will
   not hold a second `@`/`www` website record beside the old one. If the
   ALIAS comes back, the old website's Hostinger CDN is still on and must be
   switched off first.) Then add
   `A @ 75.2.60.5` and `CNAME www → raajlaxmi-site.netlify.app`. **Touch
   nothing else** — MX, SPF, DKIM and DMARC are what keep the 21 mailboxes
   working and are independent of the A/CNAME records.
4. **Add the new origin to Sanity's CORS allowlist in the same sitting.** This
   is the step that fails silently: a missing origin does not error, the site
   simply falls through to the placeholder content written into the HTML —
   eight fictional Mumbai projects and five invented testimonials.
5. **Point the Google app's Branding URLs at the live domain** — homepage,
   privacy policy and terms, which today name the Netlify host because
   `raajlaxmi.com/privacy` is a 404 on the old site. The *origins* already
   list both `raajlaxmi.com` and `www.raajlaxmi.com`, so sign-in itself keeps
   working across the cutover; it is only the consent screen that would
   otherwise go on citing a netlify.app address. See *Continue with Google*.

### Deploy: pushing to main is the deploy

The site is a Netlify project connected to this GitHub repository, so **`git
push origin main` publishes it** — there is no build command and no deploy
command to run. Netlify clones only the tracked files (**116 of them**, counted
16 Nov — the 87 recorded here before that was long stale, and the size figure
beside it was dropped rather than guessed at; `git ls-files | wc -l` settles
it), which is why this is the safe arrangement: `studio/node_modules` is 562MB
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
netlify deploy --prod --dir=/tmp/rl-deploy        # 116 files as of 16 Nov
```

**The Studio deploys separately** (`cd studio && npm run deploy`) — it
republishes the editing interface and does nothing to the website.
**Claude Code cannot run it either**: the auto-mode classifier blocks
`sanity deploy` the same way it blocks a Netlify production deploy, so a schema
change always needs the client-facing command run by hand. `npm run build` is
*not* blocked and is the way to prove a schema change compiles before handing
the deploy over. **`--dry-run` IS BLOCKED TOO, as of 17 Nov** — it was not on
16 Nov, so the classifier reads the whole `sanity deploy` command now and not
its flags. Do not spend a turn on it. `sanity.cli.js` still pins no
`studioHost`, so the CLI resolves `https://raajlaxmi.sanity.studio` from the
project rather than from the repo, and only the real deploy will print it.

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

### What the CMS holds, measured 14 Nov

**Re-run these counts rather than trusting them.** The client edits daily, and
often while you are working — twice now a document has changed shape between
two queries in the same session.

| | state |
|---|---|
| Projects | **15.** Completed 9, Ongoing 4, Redevelopment 3 — Krishna Niwas is in two listings, which is what `stages` exists for. Aarvi Apartment was unpublished on 8 Nov, see *Aarvi Apartment was taken off the site* |
| Sold out | **Back, per property, since 14 Nov**; since 16 Nov the card prints the WORDS `SOLD OUT` and the artwork is unused. **Eight carry `true`**, verified live on 16 Nov: Priti Pearrl, Priti Chaaya, Raajlaxmi Tower, Raajlaxmi Apartment, Shakun Solitaire, Midas Enclave, Midas Glory, Nakshatra Auris. **The other seven now print NO badge at all** — the status fallback is gone. See *SOLD OUT is the only badge there is* |
| Sizes by configuration | **3 of 15**, two rows each: Raajlaxmi Tower, Raajlaxmi Apartment (both `1 BHK 380-400 Sq. Ft.` / `2 BHK 360-550 Sq.ft`) and Nakshatra Auris (`315 – 373 Sq. Ft.` / `461-501 Sq. Ft.`). The other twelve still print the old `config` + `area` pair, which is the designed fallback |
| 3D walkthrough | **NONE.** The field exists on `project` and the button is wired, but no project carries a video, so the button renders nowhere. Untested against a real file |
| Detail-page content | **6 of 15 have a gallery** (Rajlaxxmi Park 4, Priti Pearrl 3, and 2 each on Krishna Niwas, Raajlaxmi Avenue, Raajlaxmi Meenakshi, Shanti Niwas), **6 a price**, 7 a configuration. The gallery count was 0 on 8 Nov |
| Prices | **SIX, all still in the one-line free-text field.** Priti Darpan `26 Lacs Onwards`; Priti Pearrl, Priti Chaaya, Raajlaxmi Tower, Raajlaxmi Apartment and Shakun Solitaire all in the form `42 Lacs Onwards for 1 BHK & 60 Lacs Onwards for 2 BHK`. **Nothing uses `sizes[].price` yet** — `split-prices.mjs` moves them and has not been run. See *A price per configuration, and the budget bands that it fixed*. **None of the six carries a `₹` and none should** — the symbol is added at render, see *The rupee sign is added at render* |
| Amenity icons in use | `play`, `gazebo`, `indoor`, `landscape`, `security`, `gym`, `garden`, `planning`, `parking`, `lift`, `power`, `pool` — and one project has an amenity with **no icon set at all**. That one used to be deleted from the page in silence; since 17 Nov it gets a mark guessed from its label. `green` (Common Green Space) is in the schema and used by nobody |
| Brochures | **3 on published projects** (Nakshatra Auris 18.0 MB, Shanti Niwas 7.7 MB, Rajlaxxmi Park 5.0 MB). A fourth, 0.4 MB, is on the unpublished Aarvi Apartment draft |
| Reviews | **6 real Google reviews** (`testimonial` documents), all with Google links |
| Client photo slider | **8 photographs** — the block is live now, no longer hidden |
| Owners | **5 real people, each with a portrait and a role; no bios.** The card runs name + role and the panel is where a bio would show |
| Social handles | **YouTube, WhatsApp, Instagram.** Facebook, LinkedIn and X are unset, so they do not render |
| Hero background | the desktop film. `heroVideoMobile` is **empty on the published document**, so phones still use the committed `assets/hero-mobile.mp4` fallback — **but a portrait film is sitting in `drafts.homepage`, unpublished**, along with a swapped About video. See *The homepage has an unpublished draft, and it is holding two videos* |
| Hero dropdowns | `heroButton` **Discover Your Space**; `heroPropertyOptions` 1 BHK / 2 BHK / 3 BHK / Jodi Flats / Office / Shops (the last three match nothing); `heroBudgetOptions` **six bands since 14 Nov** — ₹18–25, ₹25–35, ₹35–45, ₹45–65, ₹65–80, ₹80 Lacs + — the second added to close a gap, and the top two match nothing because nothing is priced above ₹60 Lacs; `heroLocationOptions` the four towns, **now painted on the page** — the derivation that was overwriting them was removed on 9 Nov |

**THE BROCHURES ARE NOT LINEARISED — none of the four.** Checked by reading the
first 2KB of each: no `/Linearized`. The asset CDN answers range requests, so a
linearised PDF would paint page one immediately; these cannot, so the whole
file has to arrive first. At 18 MB that is roughly **29 seconds of blank
screen on a 5 Mbps phone**. Three of the four have `_compressed` in the
filename, so the client did act on the size advice; Nakshatra Auris did not.
Re-saving with Fast Web View, or `qpdf --linearize`, fixes this without
touching the content. They serve `content-type: application/pdf` and
`content-disposition: inline`, so they do open in the browser as intended.

### The homepage has an unpublished draft, and it is holding two videos

Found on 14 Nov while adding the budget band, and **it is the reason that
write went to the wrong document first**. `drafts.homepage` exists, was last
touched at 14:37 that day, and differs from the published document in three
fields — one of which was the band, which is now on both.

**THE OTHER TWO ARE THE CLIENT'S, AND THEY ARE NOT LIVE:**

| field | published | draft |
|---|---|---|
| `heroVideoMobile` | **unset** | `file-672c74bc…-mp4` |
| `aboutVideo` | `file-b733e6e3…-mp4` | `file-49023557…-mp4` (a different file) |

- **`heroVideoMobile` has been uploaded and never published.** Every note in
  here saying it is "still empty" is describing the *published* document and
  is correct about what the site serves — phones are still falling back to the
  committed `assets/hero-mobile.mp4` — but it is wrong to conclude nobody has
  supplied one. Somebody did. One press of **Publish** puts it live.
- **The About video has been swapped in the draft too**, so publishing the
  mobile hero publishes that as well. They go together, which is why this was
  left for the client rather than published from a script.

**THE TRAP THIS REVEALED, AND IT WILL BITE AGAIN.** A token-authenticated
`*[_type=="homepage"][0]` returns the DRAFT when one exists. The first cut of
`add-budget-band.mjs` did exactly that, patched `drafts.homepage`, and printed
"written to drafts.homepage" — a success message for a change the live site
could not see. **Any script that writes a singleton must address it by `_id`**,
and should patch `drafts.<id>` as well so the change survives the next Publish.
That is what the script does now. The public API cannot see drafts at all, so
a `curl` check of the published value is the honest confirmation — this is the
third time drafts have shadowed the live site on this project.

### Aarvi Apartment was taken off the site

Asked for on 8 Nov: remove every project card of Aarvi Apartment, and put a
property that is not sold out in its place on the home page. Both halves are
**CMS data, not code** — no HTML changed and no deploy was needed.
`studio/scripts/retire-aarvi.mjs` did it and is idempotent.

- **It is UNPUBLISHED, not deleted.** The published document was copied to
  `drafts.94cf850b-df7b-4a68-b43f-3854050b9ace` and the published copy deleted.
  The public API cannot see a draft, so its cards left `projects.html` and
  `projects-redevelopment.html` and its detail page resolves to nothing — the
  same mechanism that hid Shanti Niwas for a week in October. The client's
  content, the card photograph and the 0.4 MB brochure all survive, and one
  press of Publish brings the property back. **It is therefore a new orphan
  draft**, the second in the Studio after the duplicate Rajlaxxmi Park; do not
  let a future script adopt it, and do not read it as work in progress.
- **The signature card was repointed to Krishna Niwas, not removed.** The grid
  is drawn for four and `fit()` reuses the existing `<article>` nodes, so a
  deleted card would also drop that node's animation hooks. Krishna Niwas is
  the only project with `soldOut` explicitly `false` rather than unset (that
  field is gone now), and the only one the client deliberately filed into two
  listings.
- **The card's `category` override was cleared in the same patch.** It read
  `Luxury Living`, which was a deliberate disagreement about *Aarvi*; left in
  place it would have silently relabelled Krishna Niwas.
- **The home page had to be patched BEFORE the document was touched.** Sanity
  refuses to delete a document something still references, so the order is not
  a preference — reversed, the unpublish fails.
- **`project.html?p=aarvi-apartment` now falls through to the hand-written
  Romal Kirti mock**, exactly as `?p=romal-kirti` has since 6 Nov. Nothing on
  the site links to it, so it is reachable only from a stale bookmark or an
  indexed URL. The page has no "not found" state; that is the pre-existing gap,
  not something this change introduced.
- **Krishna Niwas has no `blurb`**, and the home page's hydration rule leaves
  markup text alone when a field is empty — so signature card four still prints
  *"Thoughtfully designed homes that blend luxury, space and functionality in
  perfect harmony."* That is the invented placeholder copy, and it is the same
  sentence Aarvi's card printed, so nothing regressed on screen. Its
  **collection** card shows no description at all. One `blurb` in the Studio
  fixes both.
- ~~**Nakshatra Auris, signature card three, is still `soldOut`.**~~ Moot since
  9 Nov: sold-out is gone from the site altogether.
- **The ongoing corridor banner still paints "Aarvi Apartment".**
  `assets/projects/western-line-ongoing.jpg` has the name burnt into the
  artwork and `projects-ongoing.html`'s `alt` lists it to match. The alt was
  left agreeing with the picture rather than quietly disagreeing with it. Only
  a redraw fixes the plate — and note the artwork was already wrong before
  this, since Aarvi had been refiled from Ongoing to Redevelopment.

### Open decisions for the client

**Added 9 Nov, all content rather than code:**

- ~~**No project has a price**~~ — six do since 14 Nov. They briefly broke the
  budget bands; fixed the same day. See *A price per configuration, and the
  budget bands that it fixed*.
- **`Jodi Flats`, `Office` and `Shops` match no project.** They are offered in
  the hero's PROPERTY dropdown but no project's `config` names them, so each
  returns an empty collection. The matcher folds plurals and spacing, so typing
  "Shop" or "Jodi Flat" into a project's configuration is all it takes.
- **`1 RK` was dropped** from that dropdown, and `4 BHK` / `5 BHK` are no longer
  offered although Nakshatra Auris and Midas Glory have them.
- **Krishna Niwas has no `blurb`**, so signature card four prints the invented
  placeholder sentence and its collection card shows no description.
- **Every card now claims OC RECEIVED, including the four Ongoing projects**,
  which cannot have an Occupancy Certificate yet. See *Every collection card
  carries the OC RECEIVED mark* for the one-field fix if the client wants it
  per project.
- ~~**The hero's LOCATION dropdown shows sub-locality spellings and no Virar**~~
  — resolved 9 Nov by dropping the derivation; it reads the client's four towns
  now. See *LOCATION is a fixed list too*. One consequence to be aware of: the
  hero search no longer pins itself to the Completed view, because Virar has no
  completed property.
- **`seal-top.png` (259KB) is referenced by nothing** and still ships.
- **`EMI-image.png` (924KB) sits untracked at the repo root.** Nothing
  references it — `assets/emi-hero.jpg` is what the EMI page uses — so it is
  working material, not a missing asset. Delete it or leave it; it is not
  committed and so never reaches the site.

- **Which phone number is right.** The contact page prints `+91 9890823288`
  and the footer `+91 77740 00939`. This stopped being cosmetic when the
  footer's number started receiving WhatsApp messages — see *The WhatsApp
  handle is rebuilt, not trusted* — and **since 16 Nov the footer's number is
  also what the floating WhatsApp button on all twelve pages dials**, so it is
  now the number a visitor is most likely to use. See *The WhatsApp button is
  on every page*.
- **The location card describes a different street from the address above
  it**, and the map pin may not have moved with the office. See *The office
  address changed on 16 Nov* under *Content management → Contact page*.
- **The footer prints `info@raajlaxmigroup.com`, which does not exist.** It is
  not one of the 21 Hostinger mailboxes; `info@raajlaxmi.com` is. **Since
  16 Nov the collection pages' "Can't Find What You're Looking For?" strip
  prints it too**, both reading the one `site-settings` document — so this is
  now wrong in two places at once and right in neither, and one Studio edit
  fixes both. Worth settling before launch: it is the address the client's
  own site invites people to write to.
- **Two badges disagree with their listing.** Shanti Niwas is filed
  Redevelopment and Raajlaxmi Avenue is Redevelopment-and-sold-out, but both
  print a **Completed** badge. That is `status` (free text) overriding the
  listing label, working as designed — clearing `status` makes the badge follow
  the listing.
- **An orphan draft: a duplicate `Rajlaxxmi Park`**,
  `drafts.26839014-0fed-4e80-9bb1-5ffe9f513cac`, created 10:40:39 on 7 Nov and
  untouched two seconds later. It has never been on the site. Publish or delete
  it in the Studio; nothing automated should adopt it.
- **13+ years** (Section II) contradicts the 2004 timeline and the "Est. 2004"
  seal artwork, which imply ~22 years. One founding date has to win; the seals
  are images, so that side needs a re-export, not a code change.
- **The associates plate carries three copy errors** (see *Photography*). Only
  a redraw fixes the plate; the `alt` text already spells all three correctly.
- **`services.html` still has no CMS behind it**, and neither does `emi.html`.
  Both are hand-edited.
- **The EMI calculator is not in the navigation bar**, by measurement rather
  than preference — see *The EMI calculator*. Putting it there means dropping
  one of the five existing items, which is the client's call.
- `project.html`'s hand-written fallback (no `?p=`) is still the client's
  unverified mock, and it now describes **Romal Kirti, which they deleted**.
  Nothing on the site links to it (every route carries `?p=`), so it is a
  latent oddity rather than a live bug.
- ~~**The services philosophy plate has a typo painted into it**~~ — fixed on
  5 Nov by deleting the plate; the band is film with no copy over it at all.

### The 3D walkthrough prototype is a separate thing

`brands_we_build_with_3d_prototype/` sits at the repo root and is **untracked
on purpose** — the client asked for it to be kept out of this repository
("dont push the 3d model that is different"). It is a first-person walkthrough
of an apartment interior, built so the brands the group builds with can be
pointed at in place rather than listed on a wall of logos. Do not `git add` it
without being asked.

What a future session needs to know about it:

- **One file, `index.html`**, Three.js r160 over an importmap, with
  PointerLockControls, GLTFLoader and raycast hotspots. No build step, in
  keeping with the rest of this repo.
- **The model's scale is 551.9 units per metre**, measured from four objects —
  not millimetres, which is what the first cut assumed and why the camera
  spawned above the roof. `UNITS_PER_METRE` is the constant; eye height 1.62m.
- **Ground-finding must start INSIDE the room** (`from = 1.7`). A ray dropped
  from above hits the roof slab at 3.4m and reports it as the floor.
- **Four hotspots** — switchboard, wall finish, kitchen tiles, plumbing — each
  opening a right-hand panel of brand logos and closing back into the
  walkthrough.
- **There is a drag-look fallback** for contexts where Pointer Lock is refused
  (an iframe, most notably), chosen by `dragLook` with a `pointerlockerror`
  listener and a 1200ms timeout. Both paths must never drive the camera at once.
- **The body state class is `authoring`, NOT `author`** — the base stylesheet
  carries `.author{display:none}`, which matched `<body>` and blanked the page.
- **Two things are unresolved and belong to the client**: the GLB is **10MB**
  and wants decimating, and it is **CC BY 4.0 (Sketchfab, Katydid)**, so
  attribution has to be settled before it goes in front of anyone.
- **Ten of the thirty site brands cannot be placed** in it: the model has no
  bathroom and no lift. Two more are filed oddly on the site itself — Polycab
  and Havells are under Wire rather than Switches.

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
| II | About | `about` | Ivory. Plate showing **the CMS's About video** (`assets/about-plate.jpg`, the client's gold wireframe elevation, is only the fallback underneath it), four counting stats, then a full-width RERA / CREDAI-MCHI trust strip (`.ab-creds`, a sibling of `.ab-inner`, not inside the content column). **It holds exactly one screen** — see *The About section holds one screen*. The ghost word "Legacy" that used to sit behind the copy is gone, markup, CSS, parallax and schema field alike. |
| III | Signature Projects | `signature` | Four project cards and corner blueprint decor with slow parallax. **It holds one screen above 1080px** — see *Signature Projects holds one screen*. The rotating `seal-top.png` that used to float in its top-right corner is **gone** (9 Nov, client's request); the same file still draws Section IV's seal, so it is not orphaned. |
| IV | Why Raajlaxmi | `why` | Team photograph as the feature plate, **sized so the heading and the photograph share one screen** (see *The Why heading and photograph share one screen*), four numbered rows, **a year timeline that prints a year and the name of a milestone and opens
the full account sideways** (see *The timeline shows headings and opens
sideways*), and a closing quote. **The Est. 2004 medallion beside that quote is gone** (12 Nov, client's request) — see *No seal is drawn anywhere now*. The auto-scrolling brand marquee (`.why-carousel`) that used to sit before the quote is gone — Section X replaced it. |
| XI | Meet Our Owners | `owners` | **Sits between Why and Brands in scroll order**, despite the number. Portrait cards running as a **continuous right-to-left marquee that the visitor can take hold of** — see *The owners strip gives way and comes back*. `SPEED` is 30 px/s, the slowest of the three strips because a tall portrait going past at speed is harder to read than a line of text. `.ow-stage` is the scroll container and carries the edge-fade mask. The copy sits over the foot of the photograph behind a gradient scrim, so the card *is* the picture rather than a picture with a caption under it. **THE NAME AND THE ROLE EACH SIT IN A RESERVED BOX** (`min-height` 2.5em and 4.8em), and that is what makes the row line up: `.ow-text` is pinned to the FOOT of the card, so the block grows upward, and a one-line role left its name 1.6em lower than a card whose role ran to three — across five portraits the names stepped up and down the row. Reserved, **not clamped**, so nothing is ever truncated: the live roles run one to three lines and the names one to two, so 3 and 2 cover the data with the alignment exact. A fourth line of role would step that one card's name up again; raise the reserve or shorten the role in the Studio. Measured 0px of spread on both. **THE NAME SITS AT THE FOOT OF ITS BOX** (`display:grid;align-content:end`, 17 Nov, the client's request): filling that reserve from the TOP is what put a whole empty line between a one-line name and its role — **36px** under *Mr. Jigar Jawaharlal Shah* against **9px** under *Mr. Hemant Deepak Sampat*, which wraps to two lines and so had nothing spare. The slack is spent above the name now, so the role sits the same distance under the name on **every card at 1440, 900 and 390**, measured on the live data — 9px as first shipped, then **`.ow-role{margin-top}` taken from .55rem to .35rem on 18 Nov** at the client's request, so 5.6px — and the names line up on their LAST line — which is the line the role has to follow. Grid and not flex: an anonymous grid item is a block and wraps the way the text already did, where a flex item would be sized from its max-content first. **Hovering one card pauses the strip and blurs and dims the others** — the blur is pure CSS (`.ow-grid:hover .ow-card:not(:hover)`), the pause is now JS, with `:focus-within` / `focusin` carrying both for a keyboard, and the blur dropped below 620px where `:hover` sticks after a tap. **Clicking a card opens the detail panel** — hover is the invitation, the click is the choice; see *The owner detail panel*. **Copies are computed, not fixed**, exactly as the client photo strip does it: `build()` measures a card, renders `max(3, ceil(stageWidth / setWidth) + 2)` sets and re-measures, so two published owners loop as cleanly as six. (The photo strip uses `+ 1`; this one needs `+ 2` because it can be pushed backwards.) **The CMS fills the cards from a later block**, so that block fires **`rl:owners`** and this one rebuilds the strip from whatever it left — the same handshake the About counters use with `rl:home-stats`. Reduced motion renders a single set, puts scroll-snap back and drops the mask, so no card is stranded off a stage that no longer moves. **Driven by the `ownersPage` singleton, not the home-page document** — see *The owners live on their own document*. **Its six cards are bracketed placeholders and it is the one section on the home page that removes itself**: an empty `owners` list deletes the section rather than printing "[Owner name]" six times to the public, and it returns the moment anyone is published. With Sanity unreachable the placeholders stay, so a failed fetch never costs the design. **The card prints the name and the role only** — "About them" is the detail panel's content and never appears here; it rides on the card as `data-bio` so the panel can read it off whichever card was opened. The card carries the person, the panel carries what there is to say about them. |
| X | Brands We Use | `brands` | Follows Why in scroll order. `OUR PARTNERS` header, six category tabs (All / Structure / Interiors / Electrical / Fittings / Utilities) and a card grid, all rendered from the `BRANDS` array in the Section X IIFE — adding a supplier is one line of data, no markup. Each row is `[name, logo file, trade, tab]`: `trade` is the line from the client's sheet and prints on the card, `tab` is the coarser bucket the tabs filter by. Johnson and Hindware appear twice on purpose, under two different trades. Its header (`.br-head` / `.br-label` / `.br-title` / `.br-intro`) is a **copy of Section IV's** rather than a shared rule — change one and the other will not follow. **On a phone the All view is clipped to the first six cards behind a "Show all 30 brands" pill** — see *Brands are clipped on a phone*. |

### Signature Projects holds one screen

The client's complaint, with a screenshot: the four cards were cut off at the
fold. Measured, the section stood **1156–1303px against a 768–1080px window**,
so it was over by 223–388px at every desktop size. It is now `min-height:100svh`
and a flex column **anchored to the top**, and **every vertical step inside it is sized in `vh`
rather than `rem`** — the same treatment `.about` and `.why` already have.

- **IT IS ANCHORED TO THE TOP, NOT CENTRED (9 Nov).** It was
  `justify-content:center` for a day, which split the leftover height above and
  below the composition — 181px of it at 1920 — so it spent on empty paper the
  room the cards wanted and pushed the label 103px down the screen. The client
  drew a line across their screenshot asking for the header higher and the
  cards taller; both are the same fix. `justify-content:flex-start` now puts
  the header straight after the top padding, a steady **9–12px under the
  navbar** at every size, and the cards take the rest.
- **The media box is sized by HEIGHT, not by ratio, above 1080px.**
  `aspect-ratio:4/3.1` is a function of the card's *width*, so a wider screen
  made the card taller — 275px of photograph at 1920 — which is the opposite of
  what fitting a fold needs. **The ratio comes back in the stacked tiers**,
  which must reset `height:auto` or it wins over `aspect-ratio`.
- **Its height is a LINE THROUGH THE MEASUREMENTS, not a plain `vh`:**
  `clamp(128px,calc(68.6vh - 374px),352px)`. What is left for the picture after
  the navbar, the header and the card's own body does not scale with the
  window — those are close to fixed — so the slack grows *faster* than the
  viewport does. A straight `vh` therefore left 181px unused at 1920 and
  nothing at 768. The `-374px` is fitted to both ends with 16px held back so
  the cards never touch the fold, and **the 352px cap is a taste limit, not a
  fit one**: the card is ~357px wide there, so beyond that the photograph goes
  portrait. On a very tall monitor the cap binds and the spare height is left
  as whitespace below the cards (180px at 1200, 396px at 1440).
- **Card heights now run 367px at 1366×768 to 609px at 2560×1440**, against a
  flat 447–565px before any of this. Growing the card means growing the
  picture, since the body is content-sized — so the media/body split goes from
  roughly 49/51 to 59/41 at 1920. That is a real change in the card's balance
  and it was the client's call.
- **`.sp-desc` is clamped to three lines (four when stacked), and that is what
  holds the budget.** The text is the project's CMS `blurb`, so its length is
  the one thing on the card the page does not decide; one long blurb would put
  all four cards back past the fold.
- **`.sp-wrap` must never carry `margin:0 auto` again.** `.sp` is a flex column
  now, and an auto cross-axis margin beats `stretch` — it shrink-wraps the box
  to its content. This is the identical trap `.ab-top` fell into; use
  `width:100%` + `margin-inline:auto`.
- **The navbar measures a flat 122px at ≥1366 (114 at 1080, 111 at 1024)**, and
  the section scrolls *under* it. While the content is centred inside
  `min-height` the top padding is only a floor and the centring does the work —
  but in the two tiers where centring is off (stacked, and a short window) the
  padding is the only thing holding the label clear, so each of those tiers
  sets its own. Measured, the label cleared the bar by **−15px** before that was
  added.
- **One screen is off the table below 1080px**, where the grid becomes two
  columns and therefore two rows, and below 620px of height. Both return the
  section to natural flow — the same concession `.about` makes when it stacks.

Measured at 1920×1080, 1920×1200, 2560×1440, 1600×997, 1536×864, 1440×900,
1366×768 and 1280×800: the section is one viewport at every one, the cards
finish **57–83px above the fold** (more where the media cap binds), **all four
`VIEW PROJECT` buttons are inside the fold**, and the label clears the navbar
by **9–12px**. At 1440×600,
1080×900, 1024×800, 768×1024, 390×844 and 844×390 it is correctly taller than
the window, with the label clear by 14–57px. No horizontal overflow and no
console errors anywhere.

**Verifying the reveal headlessly does not work and is not a regression.**
`.sp`'s `IntersectionObserver` (`threshold:.12`) does not deliver inside a
sized iframe under `--virtual-time-budget`, so `.sp` never gains `.in` and
every card reads `opacity:0`. The **pre-change file behaves identically** —
checked side by side with `git show HEAD:index.html` — so compare against that
rather than concluding the reveal broke. `--force-prefers-reduced-motion` takes
the `reduce` branch, which adds `.in` outright, and there all four cards and
their buttons read as revealed.

### Brands are clipped on a phone

Thirty-two cards at two columns is **fifteen rows** of scroll before the rest of
the page. On a phone the `All` view now shows the **first six** and a `Show all
30 brands` pill opens the rest. Measured at 390x844: the section is **1188px
collapsed against 3226px open** — about 2.4 screens of scroll saved.

- **The breakpoint lives only in CSS, and nothing duplicates it in JS.** The
  script toggles `.br-clip` on the grid and unhides the button; both rules that
  act on those — `.br-grid.br-clip .br-item:nth-child(n+7){display:none}` and the
  button's `display:flex` — sit inside the phone tier, so on a desktop `.br-clip`
  paints nothing and the button cannot be reached. The same idiom as the hero
  capsule. Verified at 1440x900: grid carries `.br-clip`, all 32 cards visible,
  button `display:none`.
- **`SHOWN = 6` in the script is not what does the clipping** — the
  `nth-child(n+7)` rule is. The constant only decides which cards to re-stagger
  when the button is tapped, so the two have to agree.
- **The tier is `(max-width:620px),(max-height:560px)`**, the second clause
  catching a handset in landscape (844x390, where the grid is three columns and
  six cards is two rows) — a width-only query sails straight past it.
- **Only the `All` view is ever clipped.** The longest trade is eight cards,
  which is four rows and wants no button; switching tabs hides the button and
  drops `.br-clip` outright.
- **The figure in the label counts SUPPLIERS, not cards.** Johnson and Hindware
  each have a card under two trades on purpose, so there are **32 cards and 30
  brands** — "Show all 32 brands" would be a false claim about the one thing the
  sentence is counting.
- **Clipped cards are `display:none`, not merely invisible**, so their
  `loading="lazy"` logos are never requested: six image requests on a cold phone
  load instead of thirty-two. Measured, `loaded` went 6 → 24 only after the
  button was tapped.
- **Collapsing holds the button under the finger.** It deletes a dozen rows from
  *above* the button, so the page would otherwise jump and leave the thumb
  pointing at something else; the handler records `getBoundingClientRect().top`,
  collapses, and `scrollBy`s the difference. Measured drift **0px** at all four
  phone sizes.
- The rows revealed on opening already carry `.show` from the section's own
  reveal, so they are un-shown and re-staggered rather than snapping in. Under
  `prefers-reduced-motion` they are simply shown.

Measured at 390x844, 360x640, 844x390, 280x653 and 1440x900, in every state
(collapsed, open, re-collapsed, a trade tab, back to All) and under
`--force-prefers-reduced-motion`: no horizontal overflow, no console errors, the
pill one line at 46px even at 280px wide. **Section X is `index.html`-only**, so
unlike the shared chrome there is nothing to sync to the other ten files.

### The timeline shows headings and opens sideways

Asked for on 14 Nov: show only the heading on the timeline — "2012 The
Beginning", "2016 The Foundation" — and open a div with "the landscape
timeline with complete details" when a year is clicked. `235d30f`.
**Committed and verified locally, NOT YET PUSHED.**

The rail was printing the whole account of each milestone. The client's copy
runs 55–115 words an entry and there are five entries, so measured at
1440x900 the rail stood **1845px against the 721px editorial list beside it**
and therefore set the height of the whole `.why-grid`. It is **552px and ten
words** now, the grid takes the list's 721px, and Section IV lost **1,125px of
scroll** (3167 → 2042).

- **THE RAIL STARTS ON THE FIRST TITLE'S LINE (17 Nov).** The client asked
  for the timeline and "Architecture That Inspires" to line up, and they did
  not: both columns are `.why-grid` items and both began at the grid's top
  edge, **which is not where either column's type begins**. `.why-row` pads
  itself `clamp(1.1rem,1.8vw,1.5rem)` before the heading, and a 2rem Cormorant
  cap then sits ~0.13em below the top of its line box, while the year — 1.35rem
  Inter at `line-height:1` — sits almost on its own. The year set out **28px
  above** the first heading at 1440.
  `.why-time` now carries `margin-top:clamp(1.27rem,.3rem + 1.63vw,1.78rem)`,
  which is that distance: the row's padding plus the difference in leading, so
  it **tracks the heading's clamp** instead of being a flat number. The clamp's
  two ends are where the quantities behind it stop moving — the row's padding
  caps at 1333px, the heading at 1454px, and below 978px both are at their
  minimum. Verified by measuring the **ink top** of each (canvas
  `actualBoundingBoxAscent`, not the box top, which differs by the leading that
  caused this): they agree **within 1.4px at fifteen widths from 921 to
  1920px**. Zeroed at ≤920px, where the grid is one column and the timeline
  follows the list.
  **MARGIN, NOT PADDING** — the rail and every dot are positioned against
  `.why-time` and `top` resolves to the *padding* edge, so a padding would have
  left the gold rail standing on its own above the first dot.
- **AND THE RAIL ENDS WHERE THE LIST ENDS (17 Nov, the same request).** Four
  rows against five entries under `align-items:start` left the rail **141px
  short** at 1440 with an empty corner beneath it. `.why-time` is now
  `align-self:stretch` + `display:flex;flex-direction:column` +
  `justify-content:space-between`, so it takes the grid row's full height — the
  list's — and spreads its entries down it. The bottoms agree **to the pixel at
  all twelve widths from 921 to 1920px**; the entries sit ~155px apart at 1440
  where they sat 110px.
  - **`gap` IS A FLOOR, NOT THE SPACING.** `space-between` distributes what is
    left *after* the gaps, so above 920px the gap never comes into it. It is
    what holds the rail together where there is nothing to distribute: the
    stacked tier, where this column is its own content's height, and a CMS
    carrying so many entries that the rail becomes the taller column (seven, at
    1440). Both then read exactly as they did, because the floor is the clamp
    the entries used to carry as a padding.
  - **THE SPREAD IS GUARDED BY `:has(.why-ev:nth-child(4))`.** The client owns
    this list, and three entries spread down a 693px column sit **277px**
    apart — not alignment, a column that has come apart. Under four entries the
    rail keeps its own height and its own spacing, which is what it had before.
    Verified at **two to seven entries at 1440 and 1100** — twelve cases, each
    either aligned at both ends or at its floor, none overflowing.
  - **The entries no longer carry a `padding-bottom`**, because a trailing one
    is exactly what `space-between` cannot see. Worth knowing: that padding is
    where the gold tail below the final dot used to come from, and
    `.why-ev:last-of-type`, which was meant to remove it, **matched nothing** —
    `.why-tower` is a `div` too, so the sketch, not the last entry, is the last
    of its type. The rail now stops 16px past the final dot at every width.
- **`.why-tower` IS CAPPED AT 31rem, AND 31rem IS TODAY'S SKETCH, MEASURED.**
  The art is 500x964 and `contain` fits it to whichever edge binds first: above
  ~1230px that is the box's height — 90% of a 552px rail, 496px — and below it
  the box's width, 72% of the column. Stretching the rail took that height to
  623px and the sketch grew by a fifth, crowding the entries it sits behind.
  `height:min(90%,31rem)` pins the binding edge where it already was: the
  sketch renders at **exactly** its old size — 257x496 wide, 236x454 at 1100,
  197x380 at 921 — and simply sits lower in a taller column. The one exception
  is the band around 1150–1230px, where the old rail was 527–551px tall and so
  bound *below* the cap: 2.8% larger there, 7px of width at worst. A flat cap
  cannot follow a height derived from the entries themselves, and 7px is not
  worth a wrapper to chase. The `90%` still governs the stacked tier, where
  this column is its own content's height — and there the sketch **is** ~9%
  smaller than before, because the column lost that dead trailing padding.
- **LANDSCAPE IS THE POINT, NOT DECORATION.** A 55–115 word paragraph wants
  roughly 65 characters a line to read, which is ~620px; the rail column is
  332px at 1440. Turning the timeline on its side is the only way the detail
  gets a readable measure — and it keeps the other four years in sight, so the
  panel is a way through the story rather than a dead end per year.
- **`data-detail` IS THE ONE SOURCE, AND THE CMS PAINT NO LONGER TOUCHES
  `.tt`.** Each `.why-ev` carries the whole CMS field; the panel parses it, and
  **the rail's own label is written from that same parse**. Before this, the
  paint set `.tt` to the raw text — which would now both put all 115 words back
  on the rail and destroy the spans the label is written through. This is the
  arrangement the owner panel already uses (it fills itself from the card that
  was clicked), and it is why the change needed no second query and no second
  schema field.
- **The entry format is a heading line, then the prose**, and the dash splits
  the name from its strapline: `The Beginning – Where Our Vision Took Shape`
  becomes `The Beginning` on the rail, with the strapline as the panel's gold
  subtitle. En dash, em dash and hyphen are all matched **but only when
  spaced**, so "Virar-Nallasopara Link Road" is never cut in half.
- **An entry with nothing behind it is not a button.** No strapline and no
  paragraphs means `.bare`: the arrow goes, the cursor goes, and the button is
  `disabled`. The same rule an unmatched banner hotspot and a project with no
  walkthrough already follow.
- **`rl:why-timeline` is the handshake**, exactly like `rl:owners`: the paint
  fires it, the panel closes itself and re-reads the rail. Necessary because
  `fit()` replaces those nodes wholesale.
- **A tablist, because that is literally what it is** — a row of years
  selecting one panel. Arrow keys move between years **only while a year has
  focus**; hijacked globally they would stop the keyboard scrolling a long
  entry, which is the one thing they are needed for there. Previous/Next covers
  every other case and **clamps rather than wrapping**: a timeline has a
  beginning and an end, and the disabled button says which one you are at.
- **The equal year widths are load-bearing.** The gold line is drawn as a
  segment per year (`::before`, `left:-50%` to `right:50%`), which lands on the
  previous dot's centre only while every year is the same width. With
  `flex-basis:auto` the segments miss by half the difference in two names'
  lengths and the rail reads as a broken line. Segments rather than one line on
  the scroll container, because only segments scroll with the years and stop at
  the first and last dot.
- **THE PHONE TIER CARRIES `(max-height:560px)` AS WELL AS A WIDTH.** At
  844x390 — a handset in landscape — a width-only query sailed straight past
  and left a 424px card in a 390px window with no way to scroll it. Caught by
  measurement, not by eye. Same clause, same reason, as the brands tier's.
- **The rail pans on a phone rather than wrapping**, and scrolls the year being
  read into view; the half-cut year at the edge is the affordance. The same
  answer as the town filter capsule.
- **The arrows keep an `aria-label`** because `.lb` is `display:none` below
  420px, where the buttons are an arrow glyph that is itself `aria-hidden` —
  without the label they would have no accessible name at all.
- **The lead popup and the owners strip both stand down** while it is open
  (`html.wtl-open`), joining `owd-open` and `pdw-open`.
- **The four fallback entries were rewritten.** They said 2004 and "Founded on
  trust", which is not a recognisable placeholder — it is the wrong founding
  date stated plainly, and it contradicted the CMS, which says 2012. They are
  the client's five real years and milestone names now, with the opening
  sentence of each. The full paragraphs are **not** duplicated into the markup:
  one copy to keep current, in Sanity.
- **`.wtl-*` IS INDEX-ONLY**, like Section X's `.br-*`. Section IV's markup
  exists in no other file, so there is nothing to sync to the other eleven.
  Note that the `.why-*` rules **are** in all twelve, inertly, because the whole
  `<head>` block was copied once — that is an accident of copying, not a reason
  to copy these too.
- **The tower sketch still overlaps the rail text, and far less than it did.**
  Measured at 390x844 the overlap went from **228px on every row to 1–67px**;
  at 1440 three of the five rows are now completely clear. It is a `multiply`
  wash at 0.34 behind text and always has been.

Measured at 1920x1080, 1440x900, 1280x800, 1024x768, 900x500, 844x390,
820x1180, 760x900, 430x932, 412x915, 390x844, 360x640, 280x653 and 653x280:
the panel is reachable at every one, no nav, card or page overflow anywhere,
the rail pans and keeps the active year in view, focus returns to the entry
that opened it, Esc and the scrim close it, reduced motion takes its branch and
closes without the delay, and **with `*sanity.io*` blocked the fallback rail
still labels and still opens**. No console errors or exceptions.

### The owners strip gives way and comes back

The client asked for a carousel that **runs by itself, follows the finger or
the mouse the moment anyone pushes it, and resumes on its own a few seconds
after they stop** — on a phone and on a desktop both. Section XI does that
since 6 Nov, and **both strips on `testimonials.html` were given the same
behaviour on 9 Nov** — the reviews first, then the client photo gallery once
the client confirmed the reviews felt right. **All three strips on the site now
share this implementation**; there is no CSS-animation marquee left anywhere.

**IT DRIVES `scrollLeft`, NOT A TRANSFORM, AND THAT IS THE WHOLE CHANGE.** The
other two marquees animate a `translateX` in CSS, which the compositor runs for
free. A transform is not a scroll position, so there is nothing for a finger to
take hold of: native panning would have had to be re-implemented, including
momentum, and handing control back mid-animation means reading a matrix out of
the computed style. A scroll container is the thing a browser already lets
people push. So `.ow-stage` is now `overflow-x:auto` with the scrollbar hidden,
`.ow-grid` is a plain flex row, and a rAF loop adds `SPEED * dt` to
`stage.scrollLeft` each frame. `@keyframes ow-marquee`, `--ow-loop` and
`--ow-dur` are gone.

What leaving the compositor costs, and why each cost is survivable: the work is
on the main thread (one scroll write a frame); rAF stops in a background tab,
which is the same free pause the CSS animation got; `dt` is clamped to 100ms so
returning from a stall advances the strip a frame rather than teleporting it;
and the whole loop is **gated on an `IntersectionObserver`**, which the CSS
animation never was — nothing runs while the section is off screen.

Seven things are load-bearing:

- **Three sets minimum, `ceil(stage/set) + 2`, where the photo strip uses
  `+ 1`.** That marquee only ever travelled one way. A visitor can push this one
  **backwards**, and `scrollLeft` cannot go below zero, so the position is kept
  in `[loop, 2*loop)` with a whole set either side of it to give back. `norm()`
  folds it by exactly one set width at either edge; one set is identical to the
  next, so the fold is invisible. Verified: seated at `2*loop - 20` it folds
  back and keeps going; forced to `scrollLeft = 4` it folds up to `loop`.
- **`norm()` returns the shift it applied**, and a drag in progress adds that to
  its own origin. Without it, folding mid-drag snaps the strip back a whole set
  on the next `pointermove`.
- **`held` is a DEADLINE, not a flag plus a timer.** A scroll event fires dozens
  of times a second and overwriting a number is cheaper than clearing and
  re-arming a `setTimeout`. `IDLE` is 2600ms.
- **THE `scroll` LISTENER MUST NOT BE WHAT DETECTS THE VISITOR.** The strip's
  own writes fire `scroll` too, so a handler that called `take()` would suspend
  the auto-advance permanently on its own first frame. It only **extends** a
  hold that a real input event (`pointerdown`, a sideways `wheel`) already
  placed — which is also what keeps a momentum fling from being cut off at 2.6s
  and then fought by the auto-advance, since every scroll a fling emits pushes
  the deadline out. `frame()` zeroes `held` when it expires, so once it is back
  to zero the strip's own writes land there harmlessly.
- **`setPointerCapture` happens only once the drag passes `SLOP` (6px), NEVER on
  `pointerdown`.** Pointer capture also retargets the compatibility mouse
  events, so capturing on every press made `mouseup`'s target the stage rather
  than the card — and a click's target is the common ancestor of press and
  release, so **every click on a card arrived at the stage** and the detail
  panel's `closest('.ow-card')` found nothing. This is the one bug in the change
  that was invisible until clicked.
- **A drag is not a click.** A `click` listener on the stage in the **capture**
  phase stops propagation after a real drag, which is what keeps a push of the
  strip from opening a panel for whichever card the mouse was over. A touch
  swipe needs no equivalent: the browser already withholds the click after a
  scroll gesture, which is also why a tap still opens a card.
- **Touch and pen pan natively; only a mouse is dragged by hand.** Nothing could
  match the platform's own momentum, and `overflow-y` stays `hidden` so a
  vertical swipe over the strip scrolls the page. Measured: a 260px vertical
  touch gesture over the stage moves the page 253px and the strip 1px.

The strip also holds still while the **owner detail panel** is open (it checks
`html.owd-open`), which the CSS version got for free from `:hover`.

Measured at 1440x900, 844x390, 412x915, 390x844, 360x640 and 280x653, by mouse
drag and by synthesized touch gesture: the strip advances at exactly 30 px/s,
follows a 200px drag by 200px, holds at 0px movement through the idle window,
resumes at 30 px/s, does not open a panel on a drag or a swipe, **does** open
one on a click or a tap, holds still while that panel is open and resumes when
it closes. Under `--force-prefers-reduced-motion`: a single set, 0px of drift,
snap back on, mask off, still scrollable by hand. No console exceptions and no
horizontal page overflow anywhere. The `rl:owners` rebuild was exercised by
replacing the grid with one card and firing the event — it re-copies to six and
keeps running.

`projects.html` — one section, `#projects` ("Section V — Our Collection"): cards rendered from the `P` array in JS, a **town filter capsule** (see *The town filter is a capsule of four towns*), a **Western line corridor band** (`.cor`, between the pagination and the consultation strip) showing the delivered portfolio under four stations — Vasai / Nallasopara / Virar / Saphale. It is the client's finished banner used whole (`assets/projects/western-line.jpg`), **by explicit instruction — do not substitute a markup rebuild for it**. **Its twelve painted logos are clickable**: `.cor-hot` boxes inside `.cor-map` lie over the artwork as percentages of it, so they ride the image at every width — including the 900px plate inside the phone scroller, which is why the img is wrapped in `.cor-plate` (`.cor-figure` becomes the narrower scroll container and cannot be the positioning context). The boxes are measured from the ink, so **a recrop or a replacement banner invalidates all twelve**; `paint()` removes the whole layer if the CMS supplies a banner that is a *different* picture. It tells them apart by **SHA-1**: Sanity names an uploaded asset after the hash of its bytes, so the check is exact rather than a guess — and the usual answer is that they are the same file, because `seed-collections.mjs` uploaded this very banner and the live page therefore serves it from the CDN under a different URL. **Replacing `western-line.jpg` means updating `ART` in that guard**, or the boxes vanish the moment the CMS copy is re-uploaded. Each box carries `data-project` — the name *as the artwork paints it* — and `wireBanner()` matches it against the published projects to set the href, so a slug fixed in the Studio is picked up with no code change. `nameKey()` does the matching and is deliberately forgiving: it folds case and punctuation, collapses doubled letters (`Raajlaxmi`/`Rajlaxxmi` → `rajlaxmi`, `Pearrl` → `pearl`) and drops a trailing plural (`Towers` → `tower`), because the banner and the CMS do not spell the names the same way. **A box with no published project stays inert** — no href, no pointer, no hover tint. **`Midas Heights` is no longer one of them: that mark is covered over (12 Nov) and its hotspot was deleted** — see *Midas Heights is painted over, not redrawn out*. So there are **eleven** hotspots now, not twelve. The layer is also inert with Sanity unreachable, which is correct: `project.html?p=` needs Sanity to render anything anyway; a `?status=` filter (exact case-insensitive match on `p.status`, ANDed with the active city chip, read once on load so the chips never clear it, with a `.col-empty` message when nothing matches) — **the nav's Projects item opens the whole collection since 16 Nov**, and only its Completed sub-item deep-links to `?status=completed`. It used to go to the same place as that sub-item, which left the bar with no route to "everything" at all — and, less obviously, meant the town capsule could only ever offer towns with a *completed* property in them, so **Virar never appeared**, all three of its projects being ongoing or redevelopment. That was reported as a missing town and was really a missing link, a "showing N of M" line and a consultation CTA. **The pagination is gone** — the 1/2/3 buttons were decorative markup that never paged anything (every matching card always rendered), so they promised a second page that did not exist. Cross-links back to `index.html#about` / `index.html#signature`.

### Midas Heights is painted over, not redrawn out

The client asked on 12 Nov for that one logo to stop showing on the completed
banner. Its copy is painted into `western-line.jpg`, so short of a redraw the
only way to take it off is to lay a patch over it in the artwork's own ground.

- **`.cor-mask` is a plain `#F4F0EF` box**, positioned in percentages inside
  `.cor-map` exactly as the hotspots are, so it rides the image at every width
  — verified identical at 1440, 1100 and 390px, including the 900px plate in
  the phone scroller.
- **The colour is sampled, not guessed.** The pixels around that mark are
  exactly `(244,240,239)`, which is also what `.cor` uses as the band
  background, so the patch dissolves completely instead of reading as a
  rectangle.
- **The box is measured.** All of that mark's ink sits inside x 1171–1368,
  y 191–286 of the 1923x514 artwork; the patch runs 1160–1380 / 180–292,
  clearing the Virar ring above (ends y=161) and the Raajlaxmi Avenue mark
  below (starts y=363) by 14px on every side. **A recrop or a replacement
  banner invalidates it**, exactly as it does the hotspots.
- **Its hotspot was deleted rather than left inert.** It is inert today only
  because that project has no document; publishing Midas Heights in the Studio
  would have brought a live link up under an invisible logo.
- **The `alt` text dropped it too**, so what a screen reader is told still
  matches what is drawn.

**Every project card carries the OC RECEIVED mark, and the SOLD OUT idea is
gone.** Asked for on 9 Nov: drop sold-out from the site and from the Studio,
and put the client's OC stamp on every card at the spot they marked on a
screenshot — to the right of the name, inside the white body. Then, in a
follow-up, the same on the home page's **Signature Projects** cards.

**THE BADGE IS IN FOUR FILES AND TWO RULE SETS.** `.col-oc` / `.col-chead` in
the three collection pages, `.sp-oc` / `.sp-chead` in `index.html`. The width
declaration is deliberately identical (`clamp(56px,22%,80px)`) so the two kinds
of card agree, but **they are separate rules and changing one will not change
the other** — the usual arrangement in this codebase, where `.col-*` lives in
the shared Section V stylesheet and `.sp-*` is Section III's own.

**On the signature cards it costs about 11px of card height**, because the
badge is taller than the category and the name stacked beside it. That section
holds one screen (*Signature Projects holds one screen*), so it was measured
before and after: the lowest VIEW PROJECT button cleared the fold by 74–106px
before and **66–96px after**, the section is still exactly one viewport at
every desktop size, and the label still clears the navbar by 9–12px. There is
room, but it is the budget to check against if anything else is ever added to
that card.

- ~~**IT IS UNCONDITIONAL. Every card gets it.**~~ **NOT SINCE 16 NOV**, and
  the thing this file kept saying was worth querying turned out to be worth
  querying: an Occupancy Certificate is issued when a building is finished, so
  the Ongoing cards were claiming one that cannot exist yet. The client gave
  the **nine** properties that hold one — Nakshatra Auris, Raajlaxmi Tower,
  Raajlaxmi Avenue, Shakun Solitaire, Priti Darpan, Priti Chaaya, Priti
  Pearrl, Midas Glory, Midas Enclave — so six of the fifteen now carry no mark.
  - **`ocReceived` ON THE DOCUMENT IS THE SOURCE OF TRUTH**, and the nine
    names written into the card block are only what answers until the field is
    filled in. A boolean that is set — **either way** — wins outright; the
    names are consulted only where it is `undefined`. So ticking or clearing
    the box takes effect immediately and per project. **ONCE EVERY PROJECT
    CARRIES THE FIELD THOSE LISTS ARE DEAD and should be deleted.**
  - **The list lives in FIVE places** — the four collection files and
    `index.html` — and they must agree. That is the usual duplication here,
    and it is also the reason to retire it in favour of the field.
  - **Matched on the folded key**, case and punctuation dropped and doubled
    letters collapsed, because the client spells Raajlaxmi and Rajlaxxmi both
    ways and this must not depend on which they typed.
  - **The home page's four signature cards needed it too.** They are
    hand-written markup, so without the same rule the home page went on
    claiming a certificate for three properties that have none. `hidden`
    rather than `remove()`: `.sp-oc` sets no `display`, so the attribute does
    the work and the node survives a repaint.
  - **The Studio must be redeployed** before the tick-box appears in the form.
    `npm run build` passes.

- **The signature cards are HAND-WRITTEN MARKUP, four copies**, not a template
  — the home-page content block hydrates the nodes that are already there. So
  the badge is written into each of the four `.sp-card`s. The hydration
  selectors are all descendant queries (`card.querySelector('.sp-cat')`), which
  is why wrapping the category and the name in `.sp-chead` did not break the
  paint.
- **The badge is IN THE FLOW, not absolutely positioned**, which is the
  difference from the stamp it replaces. That stamp hung over the photograph
  where nothing could collide with it; this sits beside live text whose length
  the CMS decides, so `.col-chead` is a flex row and a long name wraps inside
  its own column rather than running under the badge. See the CSS comment for
  why reserving the width in a padding instead would not have held: the
  percentage would resolve against the content box while the badge's resolves
  against the padding box.
- **`assets/oc-received.png` (272x262, 21KB) has a REAL alpha channel.** The
  client supplied flat red line-work on white; it was keyed out by
  colour-to-alpha against white, which un-composites the anti-aliased edges
  properly rather than leaving a halo, then quantised to 128 colours. Verified
  by recompositing over white against the source: max channel error 45 on a
  handful of edge pixels, mean 3.0. So unlike `project-floral-right.png` it
  needs no `mix-blend-mode:multiply` and would survive being moved onto the
  photograph.
- **Measured 19% of the card's width at every size** — 59px on a 311px card at
  1440, 67px at 1920, 56px at 280 where the floor binds. `clamp(56px,22%,80px)`
  because the grid runs four columns, then two, then one: a flat proportion
  would be a postage stamp at one width and a dinner plate at another.
- **What went with sold-out:** `.col-stamp` / `.col-card.is-sold` and the
  picture's `saturate(.72) brightness(.88)` knock-back, the stable sort that
  pushed those cards to the foot of the list, `soldOut` in the GROQ projection
  of all three files, and the field itself from `studio/schemaTypes/project.js`.
  `studio/scripts/mark-sold-out.mjs` was deleted — it set a field that no
  longer exists.
- ~~**`assets/sold-out.png` is referenced by nothing**~~ — **it is back, and
  it is a different file** (14 Nov). See *SOLD OUT is the only badge there is*. The old tilted stamp was replaced by the client's new horizontal
  one, keyed out of its white ground the same way `oc-received.png` was;
  `git show HEAD~1:assets/sold-out.png` recovers the tilted one.
- **REMOVING THE FIELD FROM THE SCHEMA DOES NOT REMOVE IT FROM THE DOCUMENTS.**
  Seven projects still carry `soldOut: true`, and a value with no field behind
  it shows as an "unknown field" warning on every edit in the Studio.
  `studio/scripts/retire-sold-out.mjs` unsets it — **drafts as well as
  published documents**, because a draft left carrying the field would put it
  straight back on the next press of Publish. It is idempotent and takes
  `--dry`. Run it, then redeploy the Studio.

Verified at 1920x1080, 1440x900, 1200x900, 768x1024, 620x900, 390x844, 360x640
and 280x653, on all three collection pages: every card carries the badge, the
file loads, its right edge is level with the body's padding to the pixel, the
name never overlaps it, no `.col-stamp` survives anywhere, no horizontal
overflow and no console exceptions.

On `index.html`, at 2560x1440, 1920x1200, 1920x1080, 1600x997, 1536x864,
1440x900, 1366x768, 1280x800 and the stacked tiers 1080x900, 1024x800,
768x1024, 844x390, 390x844, 360x640 and 280x653: all four cards carry it, it
loads, the name never overlaps it, the section is exactly one viewport at every
desktop size and correctly taller than the window below 1080px, and there is no
overflow and no console exception anywhere. **`loading="lazy"` means a probe
that measures in the same tick as its own `scrollIntoView` reports
`naturalWidth === 0`** — that is the harness, not the badge; wait a beat and
all four read loaded.

### The card can list a size per configuration

Asked for on 14 Nov. The meta row used to be one pair — `config` beside
`area`, "1 & 2 BHK" and "5000+ Sq. Ft." — which cannot say which area belongs
to which flat. A new `sizes` array on `project` holds one `{config, area}` per
row and the card prints them as **"315 – 373 Sq. Ft. for 1 BHK"**, with the
area mark on the measurement and the bed mark on the configuration.

- **IT REPLACES THE PAIR ONLY WHEN IT IS FILLED.** `config` and `area` are
  untouched and still required reading: they feed the detail page's fact-bar
  fallback and its heading line, and they are what the card falls back to.
  **A project with no `sizes` looks exactly as it did** — measured, 13 of the
  15 still render the old pair.
- **A column, not the side-by-side pair.** Each row is a sentence; two of them
  abreast stop being readable at a card's width. `flex-wrap` on the row lets a
  long one break after the area rather than pushing the card out of its track.
- **The card grows with the list**, and the grid stretches its neighbours to
  match. Three rows is about 34px more than the old single row, which is why
  this is opt-in per project rather than a shape every card takes.
- CSS in all twelve files, markup and GROQ in the three collection pages — the
  usual split for `.col-*`.

Measured at 1440, 1200, 900, 620, 390, 360 and 280 with two- and three-row
projects: no card spilling its box, no horizontal page overflow, no console
errors.

### The pill is the stage tag; SOLD OUT has its own mark

**REVERSED LATER THE SAME DAY.** For part of 16 Nov the pill printed
`SOLD OUT` and nothing else, so eight of the fifteen cards said nothing about
what stage they were at. The client asked for the stage tags back, and for
sold-out to have a home of its own. **The card now carries three marks and
they no longer compete for one corner:**

| mark | where | when |
|---|---|---|
| the stage pill | top-left of the photograph | always, via `badgeLine(p)` |
| `OC RECEIVED` | bottom-right of the photograph | always |
| `SOLD OUT` | top-right of the white body, beside the name | only when `soldOut` |

- **`badgeLine(p)` is `status` first, then the listing's label**, which is the
  arrangement that existed before and was restored whole — it is what lets a
  completed project carry `READY POSSESSION`. `STAGE_LABEL` came back with it
  and now has a fourth entry, `upcoming`.
- **It still returns the whole element or nothing.** `.col-badge` has its own
  brown ground and padding, so an empty span is a small blob rather than an
  invisible one.
- **`SOLD OUT` is the client's horizontal stamp over the white card body, so
  it needs no halo** — which is exactly why it could not have gone on the
  photograph without one, and why the OC mark gained a double white
  drop-shadow when it moved there.

- **THE ELEMENT IS OMITTED, NOT LEFT EMPTY.** `.col-badge` is an absolutely
  positioned pill with its own brown ground and padding, so an empty `<span>`
  is not invisible — it paints a small blob in the corner of the photograph.
  Measured: 80x25 where it renders, no element at all where it does not.
- **`STAGE_LABEL` went with it**, in all three files. It existed only to name
  a listing for a project carrying no `status`, and nothing else ever read it.
- **`status` is now read by NOTHING on the collection pages.** It is still on
  the schema and still feeds the detail page's fact-bar fallback, so it is not
  dead data — but editing it no longer changes a card. That is the same quiet
  trap `heroHeadline` and `cardText` set, and it is worth saying out loud
  because `status` reads like the field that would control this.
- ~~**Shakun Solitaire's `Ready Possession` no longer appears anywhere.**~~
  Moot: it is back in the pill, and its card carries the sold-out stamp in
  the body as well. The two no longer share a corner, which is what the
  16 Nov reversal was for.
- **Eight projects carry `soldOut: true`**, verified against the live dataset
  on 16 Nov and matching the client's list exactly: Priti Chaaya, Priti
  Pearrl, Nakshatra Auris, Raajlaxmi Tower, Raajlaxmi Apartment, Shakun
  Solitaire, Midas Enclave, Midas Glory. **This was already correct in the
  CMS** — the 16 Nov request changed the code, not a single document.

**THE ARTWORK IS NOT USED ON A CARD AT ALL ANY MORE.** It had four homes in
three days. Read this table before trusting any comment or commit message
about it:

| | 9 Nov (removed) | 14 Nov, first cut | 14 Nov, shipped | 16 Nov, first cut | 16 Nov, now |
|---|---|---|---|---|---|
| what | the artwork | the artwork | the artwork | the artwork | **the words, in the status pill** |
| where | over the photograph | the card footer | under the blurb | the photograph's corner | **the photograph's corner** |
| with the status | alongside | alongside | alongside | instead of it | **instead of it** |
| ordering | pushed the card to the foot | no effect | no effect | no effect | no effect |

The client tried the stamp in the corner and asked for plain text the same
day: *"dont want the sold out image to be shown but the text in completed must
be SOLD OUT"*. So `.col-badge` prints `Sold Out` where it would otherwise print
`status`, in the identical brown pill, and **`.col-sold` is deleted from all
twelve files**. `assets/sold-out.png` (753x242) is unreferenced and still
ships — client artwork, left alone; `git rm` is all it takes.

**THE BADGE AND THE STATUS ARE MUTUALLY EXCLUSIVE, and that has a
consequence.** Eight of the fifteen projects are sold out today, so eight cards
print no status — including **Shakun Solitaire, whose `Ready Possession` was
the one badge saying something its listing could not**. If that label matters,
the two have to share the corner.

- **The markup writes `Sold Out` in Title Case** and `.col-badge` carries
  `text-transform:uppercase`, the convention this codebase follows for badge
  and button copy. Do not "fix" the source to caps thinking the rendering
  depends on it.
- **DO NOT PUT A BACKTICK IN A COMMENT INSIDE THAT CARD TEMPLATE.** The whole
  card is one JS template literal, so a backtick in an HTML comment nested in
  it ends the string: the first attempt at the comment above used them for
  code names and took all three collection pages down with
  `SyntaxError: missing ) after argument list`. The `node --check` sweep over
  every inline `<script>` is what caught it.
- **`soldOut` is a plain boolean on `project`**, `initialValue:false`.
- **`.col-cfoot` — the flex row built for the 14 Nov first cut — was removed
  entirely** and View Details took its own `margin-top` back. That container no
  longer exists.

- **`soldOut` was removed from the schema on 9 Nov and brought back on
  14 Nov**, `initialValue:false`. `retire-sold-out.mjs` had been run in
  between, so no document carried a stale `true` and nothing lit up on its own
  when the field returned — verified against the live dataset at the time.
- **If the artwork is ever wanted again**: `assets/sold-out.png` is the
  client's horizontal stamp, 753x242, and it was **keyed out, not
  thresholded** — colour-to-alpha against white, which un-composites the
  anti-aliased edges instead of leaving a halo. Same treatment, and the same
  verification, as `assets/oc-received.png`. Over a photograph it needs the
  white double drop-shadow; over the white card body it does not.
- **Markup and GROQ in the three collection pages**, the usual split for
  `.col-*`. There is no `.col-sold` CSS left to keep in step.

### The Upcoming listing

A fourth collection page, `projects-upcoming.html` (16 Nov). It is a clone of
`projects-ongoing.html` locked to `STATUS = 'upcoming'`, so **a fix to a
collection card, chip or query now goes in FOUR files, not three.**

- **`upcoming` is a new `stages` value** on the `project` schema, a new entry
  in `STAGES` in `sanity.config.js` (which gives it its own Studio folder and
  the `project-by-stage` template), a fourth `STAGE_LABEL`, and a line in
  `DOC_ID` in each collection file. **`DOC_ID` appears TWICE per file** — once
  in the `<head>` data layer and once in the Section V block — and both were
  changed; they have to agree.
- **THE STUDIO MUST BE REDEPLOYED before anything can be filed Upcoming.**
  The schema change is in the repo and `npm run build` passes, but Claude
  Code cannot run `sanity deploy`. Until it is deployed the tick-box does not
  exist in the form and the page correctly shows its empty-state message.
- **`collection-upcoming` does not exist in the dataset.** The page asks for
  it like the other three ask for theirs, and falls back to the heading and
  intro written into the markup — which were written to stand on their own
  for that reason rather than as placeholder text. Creating the document in
  the Studio takes the page over with no code change.
- **It carries NO corridor banner.** The other three each hold a piece of the
  client's artwork in that slot with project names painted into it; there is
  none drawn for Upcoming, and borrowing one would put the wrong names on the
  page. The band is absent rather than empty.
- **It has no `if(!result.some(inStatus)) return;` guard**, unlike
  `projects-redevelopment.html`. That guard keeps a page's invented fallback
  cards showing while nothing is filed under its status — which is right for
  a listing that once had content and wrong for one that has never had any.
  An empty Upcoming page says so honestly instead.

### The 3D walkthrough

A `walkthrough` video on a `project` puts a **3D Walkthrough** button on its
detail page, which plays the file in an overlay. No video, no button — the
same rule the direct line follows, because a button that is sometimes inert
is worse than no button.

- **THE `<video>` HAS NO `src` UNTIL THE BUTTON IS PRESSED**, and the src is
  cleared again on close. This is the whole design. A walkthrough can be 50MB+
  and `preload="none"` alone still lets the browser fetch once a src exists.
  Measured: **zero requests for the file until the click**, one after it.
  Clearing the src on close also stops an in-flight download, which pausing
  does not.
- **It autoplays, except under `prefers-reduced-motion`**, where it waits for
  the play button. A refused autoplay is caught and ignored — there is nothing
  to tell the visitor.
- **The button spans the CTA row** (`grid-column:1/-1`). Three buttons across
  that rail leave about 90px each and "3D Walkthrough" does not fit. Charcoal,
  not gold, so it does not compete with the brochure, which is the button that
  collects a lead.
- **The lead popup stands down while the player is open.** It marks the
  document `pdw-open` and the popup's timer re-arms every 4s instead of
  firing, spending nothing — the same handshake `index.html` already had for
  the owner panel. **That re-arm went into all twelve files**, so the block
  stays identical across the eleven; the class simply never appears on the
  other ten. Verified: held back while open, `rl-lead-seen` still unset,
  popup arrives once the player closes.
- **The size rule is a warning above 150MB**, never a block, and is a copy of
  the brochure's rule for the same reason: the size is not in the asset
  reference, so it has to be fetched, and a slow lookup must not stop a
  publish.

**`.pd-btn > span` may now wrap.** `.pd-btn` is `white-space:nowrap` so the
arrow never drops to its own line — but that pinned the label too, and
**"Download Brochure (18 MB)" needed 228px in a 188px button at 1440**, so the
text was clipped and the arrow pushed outside the button from 1280px up. That
was introduced on 12 Nov when the label grew from "View Brochure", and it was
live. The label wraps to a second line now; `min-width:0` is what lets a flex
item shrink below its content at all. Measured clean at 1920 → 390.

**The town filter is a capsule of four towns, not a chip per sub-locality.**
It used to key off the part of `location` BEFORE the first comma, which is a
landmark, not a place: the live dataset produced ten chips reading "Oswal
Nagari", "Opp. Saraswati School", "Near ICICI Bank", "Central Park" — none of
them somewhere a buyer searches for. It now offers **All / Vasai / Nallasopara /
Virar / Saphale**, in Western-line order, the same order the corridor banner and
the hero search already use.

- **The town is the LAST comma-separated part, and it must be read from there
  rather than searched for anywhere in the line.** `Nakshatra Auris` is at
  "Virar-Nallasopara Link Road, Nallasopara (West)" — it names two of the four
  towns and belongs to the second. Matching the whole string files it under
  Virar, which is wrong and is the single case that makes this non-obvious.
- **`townKey()` folds case, drops non-letters and collapses doubled letters**,
  so "Nallasopara (West)", "Nalasopara" and "Vasai East" vs "Vasai (East)" are
  each one town. It is the same forgiving key as the banner's `nameKey`, and it
  is what stops a re-typed address splitting a chip in two.
- **Only towns with a project in the current view are offered**, so a chip can
  never be clicked into a guaranteed "Showing 0". The Ongoing page therefore
  shows `All` alone until something is filed there.
- **The deep link's town has to survive the first build.** `buildChips` runs
  first against the fallback cards written into the file — invented Mumbai
  addresses, no Vasai or Virar — so a `?loc=Virar` town is not among those
  present and is correctly dropped to `all`. If the rebuild that follows Sanity
  passed that `all` back in, the deep link would be silently lost every time,
  which is exactly what happened on the first cut. It is re-offered until
  `userPicked` goes true.
- `?loc=` is still matched **anywhere** in the address line, which is looser
  than the chips. That is deliberate — a deep link may name a sub-locality the
  capsule does not offer — but it means `?loc=Virar` legitimately shows a
  Nallasopara chip, because the Link Road project's address contains "Virar".

Visually it is **one white pill holding segments**, not loose outlined chips: an
exclusive filter should read as one control with one answer. Colours are sampled
from the client's mock rather than guessed — `#94502D` on white is 6.1:1 and
`#111A31` is 17.3:1, both clear AA. Neither is a `:root` token, because they
appear nowhere else and adding tokens would mean editing the shared block in all
ten files to serve one control. **Five towns do not fit a phone**, so the capsule
**pans** (`overflow-x:auto`, scrollbar hidden) rather than wrapping — a pill
broken over two rows stops reading as one control, and the half-cut last segment
is the affordance. Measured at 1440/1024/390/360: no page overflow at any width.

**The CSS is in ten files, the markup and JS in three.** `.col-chips` /
`.col-chip` sit in the shared Section V stylesheet that every page but
`index.html` carries, so the capsule rules were applied to all ten to stop them
drifting; only the three collection pages have `#colChips` and the logic.

`testimonials.html` — one section, `#testimonials` ("Section VII — Testimonials"). **The running order was changed by the client on 9 Nov** and is now: the page header, then the **client photo gallery**, then a second header introducing the reviews (`.tm-head-reviews`), then the **reviews strip**, then the closing consultation strip. The photographs used to sit under the reviews; they now come first and are sized to fill the first screen, with the reviews heading deliberately starting below the fold. **The gallery is no longer hidden** — the CMS carries eight photographs. **Both strips are now real scrollers** with the owners-strip behaviour, not CSS marquees. The reviews come from Sanity (the five written into the `T` array are only the fallback); each card carries the reviewer's initials rather than a photograph, and a Google button when that review has a link. The arrows and dots are `display:none` — a strip with no discrete slides has nothing for them to point at. All the detail is under *Content management → Testimonials*. The nav's Testimonials item points here from every page.

`services.html` — one section, `#services` ("Section IX — Services"), **five** blocks: the film band, the journey rail **with a service card inside each of its five steps** (a card is one centred paragraph now — no heading, no icon), the six-step buying flow, a FAQ accordion and a closing CTA. Both rails fill their gold line from scroll position (`--fill` on `.sv-rail` / `.sv-flow`). Each block carries `data-rev` and gets its own observer, so the page reveals in movements rather than all at once. Its first two blocks **were finished artwork with the copy painted in** (`Services_start.png` at 2164:380 and `assets/service-philosophy.jpg` at 1376:513); the first is **the client's film with no copy at all over it** and the second **is gone** — see *The services page runs a film* below.

**EACH SERVICE CARD LIVES INSIDE ITS JOURNEY STEP (7 Nov).**
Property Consultation → Private Consultation, Private Site Visit → Site Visits,
Home Selection → Investment Advisory, Documentation → Documentation Support,
Welcome Home → After-Sales Support. **Home Personalization was deleted** to make
it five and five, and **the "Our Services" rule-head between the two is gone**.
Those five card headings on the right of each pair no longer appear on the page
— see the first bullet below — but the pairing is what the five cards were
written for, so the list is kept as the record of which copy belongs to which
step.

- **The pairing is the DOM, not two grids that agree.** The cards spent half a
  day as a separate `.sv-grid` aligned to the rail by making both grids share a
  column count, a gap (`--sv-gap`) and a container width (`.sv-svc` with
  `max-width:none`, because `.sv-wrap` caps everything else at 1320px while the
  rail sits in a full-width `.sv-mid`). That measured 0px of drift at 1920,
  1440 and 1200 — but it was three invariants held by hand. A card is now the
  last child of its `.sv-step`, so there is nothing left to keep in step and
  nothing that can come apart at an odd width. `.sv-grid`, `.sv-svc` and
  `.sv-rulehead` are all gone.
- **`.sv-step` is a flex column and the card is `flex:1`.** The grid stretches
  the steps to equal height; without `flex:1` that height would sit under the
  card as white space instead of making the cards match.
- **THE CARD IS A PARAGRAPH AND NOTHING ELSE (9 Nov).** Its own `<h3>` and its
  `.sv-badge` icon were removed at the client's request: the step already
  carries an icon and a heading directly above the card, so each card was
  printing a second, differently-worded pair under them — *Property
  Consultation* over *Private Consultation*, *Welcome Home* over *After-Sales
  Support*. Those five card headings are **gone, not hidden**; the step
  headings above them are what name the five services now.
  - **`.sv-card`'s `text-align:left` went with them**, which is the alignment
    half of the same request. The card overrode `.sv-step`'s centring because
    it read as a little composition of its own; with only the copy left, it
    belongs to the heading above it, so it inherits the step's centring and
    the two line up as one column. Measured at 1920, 1440, 1280, 1100, 1024
    and 390: the card's centre is **exactly** the heading's centre, 0.00px, at
    every width.
  - **`.sv-card p` lost its `margin-top:.5rem`.** That was the gap under the
    card's own heading; as the body's only child it was just adding to the
    top padding.
  - **`.sv-badge` and `.sv-card h3` were DELETED, not left dead.** This page's
    CSS is its own — it is not the stylesheet duplicated across all twelve
    files — so there is no other copy to drift from. `.sv-badge` appears in no
    other file; checked before deleting.
- **`.sv-step > h3` keeps the child combinator** even though no `h3` is left
  inside a card for a bare `.sv-step h3` to reach. It costs nothing and it is
  what stops a heading added inside a card later from silently taking the step
  heading's size.
- **The card has no reveal of its own any more.** The step fades and rises as
  one thing, card included; a second opacity transition inside it only fought
  the first. The hover lift stays.
- **One breakpoint instead of two.** At 1080px the rail becomes a two-column
  list and the cards go with it, still one per step. The cards used to break to
  three columns at 1240 on their own, which would now split the pairing at
  exactly the widths where the rail still shows five.
- **`#ourServices` moved to `.sv-jrn`.** The footer on every page deep-links to
  it and the block it used to name no longer exists.

**The `[INSERT SERVICE IMAGE HERE]` placeholders are GONE**, and `.sv-slot`
with them — base rules, card overrides, the gold-cursor hover and all. The
client never supplied the photographs and six dashed boxes were the first thing
a visitor met on the page. The cards are text only now: icon, heading,
paragraph. `.sv-badge` used to be absolutely positioned so it could ride the
seam between the photograph and the body; with no photograph it is an ordinary
first child of `.sv-cbody`, because absolute it would float off the top of the
card. The one surviving mention of `.sv-slot` is in the shared phone
type-floor block, which is deliberately identical in all twelve files — a
selector that matches nothing there costs nothing.

### The services page runs a film

**REPLACED ON 18 NOV: TWO CUTS, FULL SCREEN, WITH SOUND.** The client supplied
`Services1.mp4` (16:9) and `Services1 Mobile.mp4` (9:16) and asked for them to
replace the old film, fill the screen, and carry their sound. What ships:

| file | from | shape | size | notes |
|---|---|---|---|---|
| `assets/services-film.mp4` | `Services1.mp4` (22.4 MB, 5.6 Mbps) | 1920x1080, 31.5s | **7.66 MB** | CRF 26, maxrate 1.9M, + AAC 128k |
| `assets/services-film-mobile.mp4` | `Services1 Mobile.mp4` (40.5 MB, 10.3 Mbps) | 810x1440, 31.5s | **5.13 MB** | CRF 26, maxrate 1.7M, + AAC 128k |
| `assets/services-film.jpg` / `-mobile.jpg` | frame 0 of each encode | | 100 / 50 KB | the poster, so the dissolve is one shot continuing |

CRF 26 rather than the old film's CRF 30 because **this film has subtitles
burnt in**; CRF 24/26/28 were compared on the subtitle strip and all read
cleanly, and 26 was taken for the footage, not the type. Both masters carry
the **same** soundtrack (identical loudness, −19.6 dB mean / −0.6 dB peak), so
each cut keeps its own. `-movflags +faststart`, `-g 48`, `yuv420p`, High@4.0.
The masters stay in the repo root, where `/*.mp4` in `.gitignore` keeps them
out of the deploy.

**THE BAND IS `100svh`, UNDER THE NAVBAR, AND `.sv{padding-top}` IS 0.** It
used to be a 2:1 strip held 4.6rem clear of the bar. `100svh` comes AFTER
`100vh` so a phone opens on the small viewport rather than one 60px taller than
the screen. The band's and the still's ground is **navy `#0A1018`, and that is
load-bearing**: the adaptive navbar reads the topmost opaque background under
the bar, a `<video>` is transparent, so it reads the still — ivory there put a
solid cream panel across the top of a full-screen film. Same trick as
`.hero-media` on `index.html`.

**THE ANCHOR IS MEASURED, AND IT HAS THREE TIERS.** The desktop cut carries two
things `cover` must not cut: the client's gold mark (**x 79.5–97.0%, y
3.9–12.0%** of the frame) and the burnt-in subtitles (**x 13.9–82.4%, y
92.9–94.9%**, one centred line, 14 of 64 sampled frames). Their clearances are
the budget — 3.9 top / 5.1 bottom, 13.9 left / 3.0 right — and the proportional
split gives **`82% 43%`**, which keeps both whole on every viewport from
**1.48:1 to 1.95:1**. Outside that one has to go, and **the words win both
times**, because the navbar carries the logo a few inches above the film's copy
of it:

- **wider than 1.95:1** (`min-aspect-ratio:39/20`) → `82% 100%`, all overflow off
  the top. A 1920x1080 monitor in a Chrome window is 1920x955 = 2.01:1, so this
  is the commonest desktop there is, not an edge case;
- **narrower than 1.48:1** (`max-aspect-ratio:37/25`) → `55% 43%`, which keeps
  the widest subtitle line whole at a full 4:3 (13.85/25.03). Before this tier a
  1024x768 tablet showed "understood our needs…" with "They" cut off.

**THE CUT IS CHOSEN BY `(orientation:portrait)` ALONE — NO WIDTH CAP**, in the
CSS (poster) and in `mountFilm()` (file), which must agree. The crossover
between a 16:9 and a 9:16 frame is sqrt(1.778 × 0.5625) = exactly 1:1, so
orientation already names the cut that loses less at every size.
`index.html`'s `and (max-width:900px)` would send a 1024x1366 iPad Pro upright
to the landscape cut and lose 58% of its width (25% of height with the portrait
one). The portrait cut is centred: it has no subtitles, and **its copy of the
gold mark is already sliced off by the top edge of the client's own export** —
only the foot of the building rule survives, at x 92.3–99.0%, and a phone's
8.9%-per-side crop takes that out of frame. A clean portrait master would be
worth asking for; anchor it right if one arrives.

**`RATE` IS 1 NOW, NOT 1.4.** The old clip had no words. This one's subtitles
are cut to speech, and at 1.4x the lines leave before they can be read. The
constant stays, still re-applied on `loadedmetadata`.

**PHONES ARE NO LONGER REFUSED.** The `(max-width:620px),(max-height:560px)`
bail is gone — it was right while the band was a 16:9 strip on a phone with no
cut made for it. `saveData`, a 2G-class link and reduced motion still refuse
the film, and the navy-grounded poster then fills the screen alone.

**SOUND IS ONE TAP AWAY, AND IT CANNOT BE MORE.** Every browser refuses
autoplay with sound until the visitor has interacted, and `mountFilm()` treats
a `NotAllowedError` as fatal — so starting unmuted would give **no film**, not
a film with sound. `.sv-sound` is a pill at the band's bottom-left (bottom-right
is the chat/WhatsApp FABs), lifted to `max(5rem, 10vh + .8rem)` to clear the
subtitles' top edge at every tier. It appears only when `show()` dissolves the
film in and leaves on `kill`/`retire`, via `visibility` so it is out of the tab
order while hidden; its state is painted from `volumechange`, never from the
click. **The lead popup mutes it**: the popup's scrim covers the button, so a
`MutationObserver` on `<html>` mutes the film when `lead-open` appears, and it
is NOT unmuted on close — sound returns only on a tap. Off-screen and hidden-tab
pausing already stop the sound with the picture.

Verified 18 Nov over CDP at 14 viewports (2560x1300 to 360x800, both
orientations, iPad Pro both ways): band = viewport, top 0, right cut, revealed,
rate 1, navbar on its scrim over the film and `on-light` past it, subtitles
whole at every one. The sound toggle was driven with real `Input` clicks under
the **default** autoplay policy at five sizes, ×7 runs: starts muted, one click
→ playing with ~126 KB of audio decoded, off-screen → paused, back → playing
with sound, second click → muted, popup → muted and staying muted. **A probe
that runs past 30s of one browser profile hits the lead popup** (the timer is
per visit, kept in sessionStorage) and its scrim swallows the click — clear
storage with `Storage.clearDataForOrigin` before each navigation.

*Everything below this line is the 5–7 Nov history of the clip this replaced.
The 2:1 ratio, the bottom-right watermark, the 1.4x rate and the phone refusal
it describes are all superseded by the above.*

**SWAPPED ON 7 NOV.** The clip here until then was a 7.83s consultant-meeting
shot at 0.9x; the client supplied `Services.mp4` (60.71 MB) and asked for 1.4x
in a loop. It was shipped at CRF 30 / 4.01 MB / SSIM 0.983 in a 2:1 band whose
ratio was pinned by a logo plate burnt in at the bottom right (x 1555–1920,
y 825–985). SSIM against a source needs matched timebases
(`settb=1/24000,setpts=N/24/TB` on both inputs) or ffmpeg warns and the numbers
are wrong — that part still applies to any future encode.

**ONE SLOT, NOT TWO, AND NO COPY OVER IT (5 Nov).** It shipped that morning in
both banner slots with the painted-in copy re-set as live HTML on top. The
client then asked for the whole "Our Philosophy" block to go, and for the band
to carry the footage and nothing else. So:

- the **philosophy plate is deleted outright** — markup, `.sv-side*` CSS, the
  1080px and 820px tiers that shaped it, its entry in the reduced-motion list,
  and the second `mountFilm()` call;
- **`.sv-mid` is a one-column grid** and the journey rail runs full width. It is
  still a grid rather than unwrapped because it is the `[data-rev]` node the
  observer watches and the rail's reveal hangs off it;
- the band's **`.sv-band-copy`, `.sv-band-link` and `.sv-scrim` are gone**. The
  scrim existed only to make type legible over the footage; with no type it
  would be a veil over the one thing the band is for;
- **`mountFilm()` lost its `phase` argument** and the `bandVid` / `rephase()`
  machinery with it. That existed so two copies of one 7.8s clip were never
  showing the same shot; with one video there is nothing to stay out of step
  with;
- **the `(max-height:680px) and (min-width:821px)` tier is gone too.** It existed
  solely to stop a short window clipping the headline inside an
  `overflow:hidden` band. No headline, no clipping, nothing to protect.

**THE PAGE'S `<h1>` IS `.sv-sr` AGAIN.** The band draws no words, and a page
still needs a heading, so there is a real `<h1>` clipped to a 1px box reading
"Services — Beyond Buildings. We Deliver Experiences." That is the same utility
`index.html` is pointed at for the same problem. Do not delete `.sv-sr`
believing nothing uses it — this page's only heading is it.

**It lives in `assets/`, not Sanity.** `.gitignore` only blocks root-level
`*.mp4`, and this is the one page with no CMS behind it — a Sanity asset would
add a hard-coded CDN URL and a dependency to the one page that has none.

Five things about the swap are load-bearing:

- **THE BAND'S RATIO HAD TO CHANGE.** Its 2164:380 (5.69:1) existed only because
  the artwork was that shape; cropping 16:9 footage to it keeps the middle 28%
  of the frame, which turns this clip's middle shot into a band of torsos and a
  sofa cushion with no face in it. Measured, not guessed — the band is
  **2.55:1** now, capped at `min(60vh,540px)` and floored at 240px (300px below
  820px, where 2.55:1 of a phone is a 153px strip too thin to read as footage).
- **THE PAINTED TYPO DIED WITH THE PLATE.** `assets/service-philosophy.jpg` read
  "feel as carefully designed the homes we create", missing the second "as".
  The block no longer exists, so neither does the typo.
- **THE POSTER IS A FRAME OF THE FILM, NOT THE OLD ARTWORK.** The artwork has
  the copy painted into it, so falling back to it would print words over a band
  that is meant to carry none.
- **`mountFilm()` is what `index.html`'s `mountVideo()` USED TO BE** — same reveal
  gate (`canplaythrough`, or five buffered seconds ahead), same
  three-visible-stalls retirement, same 20s give-up, same `NotAllowedError`-only
  kill. `index.html` had all of that stripped out on 5 Nov at the client's
  request (see *The connection and file-size refusals are GONE*); **this page was
  not part of that request and still has every guard** except the phone
  refusal, which went on 18 Nov when the client supplied a portrait cut (see
  the top of this section).

The two superseded artworks are **still on disk and still shipping**
(`Services_start.png` 1.39 MB, `assets/service-philosophy.jpg` 169 KB), now
referenced only from comments. Deleting them saves 1.56 MB from every deploy
and is recoverable from git; it is the client's art, so it was left.

Measured after the removal at 1920x1080, 1440x900, 1024x800, 1440x560, 844x390
and 390x844: no horizontal overflow anywhere, `.sv-mid` a single `1fr` column
with the rail full width at every size, the `<h1>` present and not drawn, one
video at `playbackRate` 0.9 revealed on the three desktop sizes and correctly
refused on the short and phone ones, the poster painted in all six, and **zero
surviving `.sv-side` / `.sv-band-copy` / `.sv-scrim` nodes**. No console errors.

### The enquiry card holds one screen

The client's complaint, with a screenshot: the foot of the form was cut off at
the fold. Measured on the live page, the card stood **795–805px** at every
desktop size, so on a 1366x768 or a 1440x828 laptop the submit button and the
line under it were below the fold. The Continue with Google block and the extra
dropdown row added on 9 Nov are what tipped it over.

It is the same answer `.about` and `.sp` give — size the composition from the
window rather than from the text — with one difference:

- **IT IS DRIVEN BY CUSTOM PROPERTIES, NOT BY `vh` UNITS.** What has to shrink
  here is a stack of a dozen controls whose heights come from their own padding
  and font. A `vh` on each would be a dozen independent clamps to keep in
  agreement; `--ct-gap`, `--ct-pad`, `--ct-area` and `--ct-send` on `.ct-card`
  are four numbers, stepped together in three tiers.
- **Do not size the fields in `vh`.** A text input whose padding is a fraction
  of the window changes shape as a phone's toolbar slides in and out, which is
  worse than the problem it solves.
- **The tiers are guarded by `(min-width:621px) and (min-height:561px)`** — the
  exact inverse of the phone tier this file already carries, so a handset
  upright *and* in landscape keep full-size controls while a laptop at 1366x768
  and a tablet at 1024x768 both get the treatment. On a phone the page plainly
  scrolls and a 44px tap target matters more than the fold.
- Three steps: **≤900px**, **≤800px** and **≤690px** of window height. The last
  also hides the crest, which is ornament where every remaining pixel belongs
  to a control.

Measured at 2560x1440, 1920x1080, 1680x1050, 1600x997, 1536x864, 1440x900,
1440x828, 1366x768, 1280x800, 1280x720, 1366x650, 1024x768 and 1024x640: the
whole card clears the fixed navbar and the fold at every one, with **14-651px
of slack**. The practical floor is about **600px of window height**, where it
is level to within a few pixels. Phones are deliberately excluded and scroll as
before. No horizontal overflow anywhere.

### The left column: three landscape cards, and a render under them

Reworked 9 Nov from a client sketch. The column was label → heading → rule →
invitation paragraph → a 2x2 grid of plain text quadrants separated by
hairlines. It is now label → heading → rule → **four white cards** → **the
building render**, and the paragraph is gone.

- **`.ct-say` and its markup are DELETED**, and `introText` is no longer
  queried or painted. The field stays on the `contact-page` document and in
  the schema — clearing it would destroy the client's copy to tidy a form — so
  this sets the same quiet trap as `cardText` and `heroHeadline`: **editing
  `introText` in the Studio now does nothing.**
- **The card's inner structure is untouched on purpose.** `.ct-item` still
  holds `.ct-ic` and a `div` of `h4` + `a`/`p`, because the CMS block fills
  exactly that shape and `fit()` reuses these nodes rather than rebuilding
  them. Only the CSS changed, plus the `<wbr>` below.
- **THE CARD IS A ROW SINCE 16 NOV, AND IT COULD NOT HAVE BEEN BEFORE.** The
  note here used to say the opposite — four across left each card 148–179px,
  which cannot hold a disc beside a line of text, so the icon went above it.
  At **three** across each card takes about 206–230px at 1440, and the icon
  sits beside the text. The card's height is now one disc rather than a disc
  stacked on two lines.
- **`grid-auto-rows:1fr` IS WHAT HOLDS THE THREE TO ONE HEIGHT WHEN THEY
  STACK.** Across a row they already match, because a grid stretches its
  items; one per row they are three separate rows and each took its own
  content, so Business Hours stood 84px against the other two at 64. Measured
  equal at all twelve widths after.
- **`min-width:0` on the text column** is what lets it shrink inside the row.
  A flex item's floor is its content, so without it a long email widens the
  card past its grid track instead of wrapping inside it.
- ~~**The address decides the height.**~~ **THE ADDRESS CARD IS GONE (16 Nov,
  the client's request)** and it was exactly that: five or six lines against
  one or two, with `stretch` pulling the other three to match, so Call Us and
  Email Us each stood two-thirds empty. The grid was **211–229px**; it is
  **84–90px** across a row now.
  - **The item is NOT deleted from the CMS.** It, its address and its Google
    Maps link are untouched on `contact-page`, and the address is still on
    this page — the location card below carries it with the map and the Get
    Directions button, and so does the footer. Same call as `cardText`,
    `introText` and `heroHeadline`: leave the content, stop painting it. **The
    usual trap follows: a `Visit Us` item edited in the Studio changes
    nothing here.**
  - **It is matched on its title or a map link, NEVER on its position.** The
    client can reorder these in the Studio and an index would then drop
    whichever card had moved into third — the same reasoning as the `mailto:`
    rule below. Renaming it in the Studio brings a card back, which is right:
    that is a new card, not this one.
  - **Measure against the live document, not the file.**
- **THE EMAIL CARD SIZES ITS OWN TRACK, so the address sits on one line**
  (12 Nov, the client's request). `info@raajlaxmigroup.com` measures **148px**
  at `.78rem`, and an equal quarter of this column is only 118–145px at four
  across, so it used to break after the `@` at every desktop size.

  The fix is three declarations, and two of them are not obvious:

  ```css
  .ct-grid{grid-template-columns:repeat(4,minmax(min-content,1fr));}
  @media (min-width:360px){
    .ct-item:has(a[href^="mailto:"]) a{white-space:nowrap;overflow-wrap:normal;}
    .ct-item:has(a[href^="mailto:"]) a wbr{display:none;}
  }
  ```

  - **`min-content` rather than 0 as the track floor** is what lets that one
    card claim the width it needs while the other three share what is left.
  - **`wbr{display:none}` is required**, because **Chrome honours a `<wbr>` as
    a break opportunity even under `white-space:nowrap`** — with nowrap alone
    the address still broke and the track never grew. Measured, not guessed:
    the track stayed at 148px until the `<wbr>` was taken out of the flow.
  - **`overflow-wrap:normal` is required too**, because `anywhere` is counted
    when the browser computes min-content, which pinned the track's floor at
    about one character.
  - **Keyed off `a[href^="mailto:"]`, never `:nth-child(2)`.** The four boxes
    are CMS content and the client can reorder them, so the rule has to find
    the email wherever it is. Only that box gets a `mailto:` from the painter;
    Call Us gets `tel:` and Business Hours is a `<p>`.
  - **The `<wbr>` stays in the markup and in the painter.** Below 360px it is
    live again and the address breaks where a reader expects it to, because
    two across at 280px leaves 113px of card and giving one of them 175px
    would squeeze the other to ~84px. The painter still injects it after
    escaping, so the only markup it ever writes is that tag and `<br>`.

  Measured at 1920 → 280: one line at every width from **360px up**, the email
  track taking 176–184px while the others take 118–177px; 280px is unchanged
  at three lines. No page overflow and no card spill anywhere. The cost is
  that the other three cards are **8px narrower at 1440**, which puts "10:00
  AM – 7:00 PM" onto a third line in Business Hours — that is the trade for
  widening one card in a fixed row, and it was the client's call.
- **Three column counts, and the middle one is still the surprising part.**
  Three across at ≥1440px, **ONE between 1081 and 1439**, three again below
  1081, one below 760. The left column is at its NARROWEST at 1081 — 494px,
  because the section is still two columns there — and gets wider again the
  moment it stacks and takes the full page. So three across is right on
  either side of that band and wrong inside it.
  - **The band runs to 1439, not to 1365**, and that boundary was measured
    rather than inherited. Three across gives each card about 120px of text
    at 1366 and 135px at 1400, which is where `10:00 AM – 7:00 PM` wraps to a
    third line — and because the three are held to one height, that single
    wrap put 62px and then 42px of empty space into each of the other two. At
    1440 they sit at 88px with 22px of slack. The old 1365 edge belonged to
    the four-card layout.
  - **22px of slack in two of the three is the price of equal heights**, and
    is not a defect to chase: Business Hours is two lines and the other two
    are one.
- **`assets/contact-render.jpg`** (1088x460, 60KB) is a **background layer
  pinned to the bottom-left of the screen**, not a block at the foot of the
  column. Its own ground samples `#F8F6F2`, exactly this section's background,
  so it dissolves into the page with no band or border — the same trick the
  Western-line corridor banners use. It is `aria-hidden` with an empty `alt`:
  decoration, and the section's own heading says what the page is.
  **It displays up to 1088 CSS px wide**, so it is soft on a retina screen;
  ask the client for a wider export, as with the associates plate.
  - **It is a SIBLING of the two columns, not a child of the left one.** A
    child could neither start at the screen edge nor pass behind the cards
    reliably: it would begin at the column's padded edge, and taking it out of
    the flow inside a box its siblings also paint in makes the stacking order
    depend on their opacity transitions. `.ct-top` carries `position:relative`
    for it, and `.ct-left` / `.ct-card` carry `position:relative;z-index:1` so
    they paint over it.
  - **`left:50%` + `margin-left:-50vw`, NOT a negative padding.** `.ct-wrap`
    caps the content at 1500px and centres it, so on a 1920 screen there are
    another 210px of margin either side that a padding-sized offset knows
    nothing about — measured, the artwork started **146px in from the edge**.
    Pinning to the container's centre and stepping back half a viewport lands
    on the screen edge whatever the wrapper is doing.
  - **`z-index:0`, not `-1`.** At `-1` it would paint behind `.ct`'s own
    background and vanish.
  - **`width:min(52vw,1088px)` is measured.** The left column's right edge
    lands at 50.8% of the window at 1440 and 51% at 1920, so 52vw reaches it
    and stops inside the gutter: it clears the enquiry card by 40–399px at
    every size tested.
  - **It is pinned to `.ct-top`, not to `.ct`.** The section runs on past the
    location card and the closing strip, so `bottom:0` there would drop the
    artwork to the foot of the page.
  - **IT HANGS BELOW `.ct-top` BY EXACTLY `.ct-loc`'S TOP MARGIN**,
    `bottom:calc(-1 * clamp(3.5rem,6vw,5.5rem))`. At `bottom:0` the artwork
    stopped level with the foot of the enquiry card and left 56–88px of bare
    ivory between it and the location card, which the client pointed at. The
    same expression is used here as on that margin on purpose: the two cannot
    drift apart. Measured, the gap below the render is now **0px at every
    desktop size**.
  - **`.ct-loc` therefore carries `position:relative;z-index:1` too.** The
    render reaches into that card's margin, and a positioned element at
    `z-index:0` paints over an unpositioned block however late it comes in
    the DOM — without it the artwork would lie across the top of the location
    card.
  - **Moving it down cost the overlap with the contact cards**, which is the
    trade the client asked for: 47–257px before, **0–180px after**, and at
    1600x997 the two no longer meet at all. The artwork's lower edge is also a
    HARD CUT rather than a fade, which did not show while there was ivory
    under it. A mask would soften it if that ever matters.
  - **Stacked below 1080px it goes back into the flow**, still bleeding to the
    screen edge. `.ct-top`'s bottom edge is under the *enquiry card* there, so
    a bottom-pinned layer would sit behind the form. In that order it lands
    after the form rather than under the cards, which is deliberate — a
    decorative band must not push the form down the page on a phone.

Measured at 1920x1080, 1600x997, 1440x900, 1366x768, 1280x800, 1081x900,
1024x800, 768x1024, 620x900, 390x844, 360x640 and 280x653, against the live
CMS text: four items at every size, the right column count in each band, no
card ever wider than its track, no horizontal overflow and no console
exceptions. For the render, at 2560x1440 down to 360x640: it starts at **x=0**
at every desktop size, leaves **0px** between itself and the location card,
overlaps the contact cards by 0–180px with **the cards painting on top in
every case** (tested with `elementFromPoint` inside the overlap, not by eye),
and clears the enquiry card by 40–399px.

**One trap in testing this:** `elementFromPoint` takes VIEWPORT coordinates, so
scrolling the location card to centre puts the contact cards above the window
and every stacking probe on them returns `false` — which reads exactly like a
z-index regression. Scroll the element you are probing into view, not its
neighbour.

### The card has no intro paragraph, and it never really had one

**`cardText` is not painted and the paragraph is not in the markup** - removed
9 Nov at the client's request, along with its CSS and its entry in the GROQ
projection. The heading and the controls are the whole card.

It had in fact **never been visible**, which is how it survived this long
unnoticed. It was `<p class="lead">`, and the lead POPUP's base rule is a bare
`.lead{position:fixed;inset:0;visibility:hidden;opacity:0}` in the stylesheet
all twelve files carry - it matched this paragraph too, and `.ct-card .lead`
restyled the type while re-declaring none of those four. So the client's
`cardText` was an **invisible, viewport-sized, fixed-position box inside the
card**. That is also why a naive
`querySelector('.ct-card p.lead').getBoundingClientRect().height` reported
roughly the viewport height and looked like a broken measurement.

Renaming it `.ct-lead` made it appear; the client looked at it and asked for it
to go. **Fixing the collision and deleting the element are two separate things
and both were wanted** - had only the first been done, the next person to add
a `class="lead"` paragraph to a page would have hit the same silent
disappearance. `contact.html` was the only file using `.lead` for copy, checked
before renaming.

**`cardText` STAYS on the document and in the schema.** Clearing it would
destroy the client's copy to tidy a form. The consequence is the same quiet
trap `heroHeadline` sets on the home page: editing it in the Studio now does
nothing.

### The enquiry card asks the hero's three questions

**`I'm interested in` is GONE** (9 Nov, the client's request). In its place the
enquiry card carries **Property / Location / Budget** — the hero search's own
three fields, with the same wording and the same lists — and **they arrive
pre-filled with whatever the visitor chose in the hero.**

- **The lists come from the `homepage` singleton, not from `contact-page`.**
  That is the point: `heroPropertyOptions` / `heroLocationOptions` /
  `heroBudgetOptions` fill the hero and this card both, so the question asked
  on the way in and the question asked on the way out cannot drift. One edit in
  the Studio moves both. It is a new `hero` entry in `contact.html`'s `<head>`
  query block. The options written into the markup are the offline fallback and
  are byte-identical to the live document today.
- **THE CARRIER IS `sessionStorage`, NOT THE QUERY STRING, and it has to be.**
  Nothing links to the enquiry page with a query on it — it is reached from the
  navigation bar's `Enquiry Now` and from the various "Schedule a Consultation"
  links, none of which pass anything along. The hero writes `rl-search`
  (`{type, loc, budget}`) **when its form is submitted**, and this card reads
  it. `?type=&loc=&budget=` is read too and **wins over storage**, which is
  what makes the behaviour testable and leaves the door open for a future link
  to say what it means.
- **Session, not local.** It is this visit's search, not a standing preference;
  it should not still be answering for somebody who comes back next week. Every
  access is in a `try/catch` like the rest of the site's storage, and losing it
  only means the form opens empty.
- **Written on SUBMIT only.** Idly opening a dropdown is not a choice.
- **A remembered value is NEVER invented as an option.** It is selected only if
  the list actually offers it — session storage can outlive a Studio edit, and
  appending a stale option would put a choice in front of the client that no
  longer exists. Matching folds case, spacing and a trailing plural (`shop` →
  `Shops`, `VIRAR` → `Virar`), the same forgiving key `typeKey`/`townKey` use
  on the collection pages.
- **`seed()` runs TWICE and that is load-bearing.** The CMS lands after the
  markup has already been seeded and *replaces* the `<option>` nodes, which
  would drop the selection; so it is re-applied after the rebuild. The
  placeholder `<option value="">` is preserved by reference, the same idiom the
  hero's own fillers use.
- **`.picked` has to be set by hand on every path that sets a value.** It is
  what takes a select from placeholder grey to ink, and the markup's `change`
  listener does not fire for a value set from script.
- **ALL THREE ARE OPTIONAL**, where the one field they replace was `required`.
  Three compulsory dropdowns on an enquiry form is a real increase in friction
  and budget is the one people least want to commit to. Adding `required` back
  is one word each if the client would rather have the data than the lead.
- **The enquiry email changes shape**: `interest` is gone and `property`,
  `location` and `budget` arrive instead. Nothing needed doing for that — the
  handler posts `Object.fromEntries(new FormData(form))`, so a renamed field
  carries itself through.
- **Layout is 2-up then full width**, not three across: at the card's ~520px of
  inner width three columns leave about 90px of text per control after the icon
  and the caret, which `₹45 – 65 Lacs` does not fit in.

Verified end to end in a real browser: choosing 2 BHK / Virar / ₹45–65 Lacs in
the hero and submitting writes `rl-search`, and the enquiry card then opens
with all three set and inked; the Web3Forms payload carries them; a query
string overrides storage; stale values (`5 BHK`, `Pune`, `nonsense`) are
ignored with no option invented; `shop` and `VIRAR` fold to `Shops` and
`Virar`; a clean visit opens empty; and with the CMS answering a *different*
list the options are replaced and the seed is re-applied. No console
exceptions, no page overflow.

### Continue with Google (contact page only)

The enquiry card carries a **Continue with Google** button above the form,
which fills **Name and Email** and nothing else. Added 9 Nov at the client's
request. It is `contact.html`-only — the 30-second lead popup, which is on all
twelve pages, was deliberately left alone.

- **The client id is `GOOGLE_ID` in that file's `<head>` data-layer block**,
  beside `W3F` and the Sanity config, published as `RL.gid`. It is
  `1021223830481-q994u4gkueeceit5gojmk7dcflgk8p19.apps.googleusercontent.com`,
  and it is **public by design** — every site offering Google sign-in has one
  in its page source. The *client secret* is the half that must never appear
  here, and this flow never uses one.
- **BLANK IS A SUPPORTED STATE AND IS THE FALLBACK FOR EVERY FAILURE.** With no
  id the button is not drawn, **Google's script is never even requested**
  (verified: zero requests to `accounts.google.com`) and the form is byte-for-
  byte the form it was. The same is true if the library is blocked, the visitor
  is offline, or `initialize()` throws. The block ships `hidden` and is revealed
  only once there is something to show, so a failure never leaves an empty slot
  above the form.
- **THERE IS NO PHONE NUMBER IN IT, AND THERE IS NO WAY TO GET ONE.** Basic
  consent carries name, email, picture and locale. A phone needs a sensitive
  scope, a Google verification review, and a number on the person's Google
  profile that most people have never set. **Phone stays typed by hand** — worth
  knowing before someone goes hunting for the bug, because it is the field the
  client's team actually calls on.
- **The token's signature is NOT verified, and nothing may be built on this.**
  Verifying it needs a server and this site has none, so the JWT payload is
  read straight out of the browser. That is fine for putting text in two boxes
  and fine for nothing else: **nothing may treat the address as proven and the
  enquiry email must never say it is**. A verified identity is a backend, not a
  tweak.
- **The consent tick-box is deliberately NOT ticked by signing in.** Agreeing to
  be contacted is a different act, and ticking it on someone's behalf is both
  wrong and worthless as a record.
- **It OVERWRITES what is already typed.** Clicking the button is an explicit
  request to be filled in; declining because a box had a character in it reads
  as the button not working.
- **One Tap is not used** — only the rendered button, so nothing depends on
  third-party cookies or on FedCM, and nobody is interrupted by a sign-in
  prompt they did not ask for.
- **The JWT payload is decoded as UTF-8, not with bare `atob`.** `atob` gives
  one byte per character, so any non-ASCII letter — which is most of this
  client's enquirers — arrives mangled. Verified with `Priyá Deshpande-Ünal`.
- **Google draws the button; the CSS only shapes the space around it.** Their
  terms ask for their own mark and wording, and what `renderButton` returns
  cannot be styled from here. **Width is the one dimension their API takes**, so
  `widthOf()` measures the slot, clamps to their 200–400 range and hands the
  number over; it is re-drawn on resize. Measured: 400px inside the card at
  1440 and 1024, 298 at 390, 268 at 360, 188 at 280 — fits at every one, no page
  overflow.
- **The button renders in the VISITOR's language, not English.** A headless
  screenshot with no `Accept-Language` shows Arabic; that is the harness, not a
  bug. Pin it with `locale:'en'` in `initialize()` if a single language is ever
  wanted.
- **`http://localhost:8000` is an authorized origin**, which is why local
  testing works — serve on that exact port or the button draws and then does
  nothing. Origins are matched exactly, scheme and host and port.

**STILL TO DO BEFORE LAUNCH, and it is not a code job:** the Google app is in
**Testing**, so it works only for accounts added by hand under *Test users*
(100 maximum). **Publish it** — Google Auth Platform → Audience → *Publish app*
— which needs a homepage and a privacy-policy URL filled in on the **Branding**
page first. Those currently point at the Netlify host because
`raajlaxmi.com/privacy` is a 404 on the old Hostinger site; **swap all three
Branding URLs to `raajlaxmi.com` at the domain cutover**, alongside adding the
new origin to Sanity's CORS allowlist. With only `openid`/`email`/`profile` —
the non-sensitive scopes — publishing is self-serve and needs no Google review.
`raajlaxmi.com` and `www.raajlaxmi.com` are already in the client's authorized
origins, so the cutover needs no change there.

`contact.html` — one section, `#contact` ("Section VIII — Contact"): the invitation and a 2×2 contact grid on the left, a floating consultation card on the right, then the location card + drawn map and a closing CTA. **The form posts to Netlify Forms** as `contact`, and the thank-you state is shown only once that POST has succeeded — see *The forms post to Netlify Forms*. Deliberately carries no corner artwork, per the brief.

**Every consultation CTA on the site points here**: the nav/sheet `Book Consultation` on every page, `Schedule a Consultation` (collection), `Book a Private Consultation` (testimonials) and `Schedule a Site Visit` (detail page) — the last three deep-link to `contact.html#ctForm`, which scrolls the card into view.

`project.html` — one section, `#project` ("Section VI — Project Detail"), **rebuilt from the client's mock** and currently written for **Romal Kirti only**. Two columns: the left bleeds to the viewport edge and carries the photography (hero with painted-on copy, crossfading slides, arrows, slide ticks, and **a captioned thumbnail strip along its floor** — see *The gallery is a strip along the floor*); the right is a padded rail of facts (breadcrumb, kind, title, location, price, a four-cell fact bar, Project Highlights, six amenity chips, two CTAs and the direct line). Arrow keys still drive the gallery.

### The gallery is a strip along the floor

**THE PHOTOGRAPH RUNS TO THE FOOT OF THE FIRST SCREEN AND THE THUMBNAILS LIE
ALONG ITS FLOOR (17 Nov, the client's request).**

**THIS IS THE THIRD ARRANGEMENT OF THE SAME TWO PARTS** and the history is the
point, because each one fixed what the last one broke:

| | what it gave | what it cost |
|---|---|---|
| **column + four-up strip** (to 16 Nov) | landscape tiles, captions | the strip ate a band of the first screen and the picture stopped short |
| **row + vertical rail** (16–17 Nov) | the picture ran to the fold | a 58–80px column: no caption fitted, a landscape shot was 40px tall |
| **column + bottom strip** (now) | both | nothing yet |

What makes "both" possible is that **the strip is a definite height and the
photograph takes everything else**. `.pd-left` is a flex column with a definite
height; `.pd-thumbs` is `flex:none` at `clamp(88px,11.5vh,122px)`; `.pd-hero` is
`flex:1 1 auto` and absorbs the remainder. Measured at 1920/1600/1440/1280: the
hero is 839/678/681/605px, the strip 122/103/103/92px, and the two together land
on the foot of the screen.

- **`align-self:start` PLUS A DEFINITE HEIGHT is what makes "to the bottom of
  the screen" exact.** `.pd-grid` keeps `min-height` rather than `height`, so
  the row still grows when the facts rail is longer than a screen — but the
  photograph no longer grows with it, which is what used to drag it to 1340px
  on a 900px screen.
- **The tiles are 288/213 again**, the ratio the photography is actually shot
  in. The square was a concession to the 58–80px rail and went with it. Their
  height is the strip's, so the width follows from the ratio and they stay a
  consistent size however many there are — **120–165px wide at desktop.**
- **It scrolls sideways rather than shrinking.** `overflow-x:auto` with the
  scrollbar hidden, and `overscroll-behavior-x:contain` so a trackpad flick at
  the end of the strip does not navigate back a page. Tiles that get smaller
  as the gallery grows stop reading as buttons, and the four-up grid this
  replaced wrapped onto a second line at five shots.
- **THE CAPTION IS BACK, AND IT IS ONE LINE WITH AN ELLIPSIS.** It was turned
  off for the rail, where the rule needed **three classes** to beat
  `.pd-thumb .cap` and the first attempt with two let it keep painting and
  spill out of an 80px tile. That whole rule is gone: the text now sits in its
  own `.cap .t` span with `white-space:nowrap;text-overflow:ellipsis`, so a
  long caption from Sanity is **cut, not wrapped**. The stacked tier releases
  the nowrap and lets it wrap again.
- **The strip carries EVERY shot, the one on screen included.** It used to skip
  it (`GAL.slice(1)`), because the four-up row would then have shown the same
  photograph twice and wrapped. A strip that scrolls has neither problem, and
  the ringed tile is what says which is open.
- **Below 1100px it is a four-up grid**, and everything the single-screen
  layout fixes is released there: the column's height, the sideways scroll and
  the one-line caption. **Miss any one of those resets and the tiles are sized
  against a height that no longer exists.**
- **NOTHING IN THE GALLERY IS CROPPED ANY MORE (17 Nov).** The client reported
  amenity boards losing their titles, and the picture was being cut **twice**:
  `IMG()` asked Sanity for `fit=crop` at 1600x1160, which trimmed the file
  server-side, and then `background-size:cover` trimmed *that* to whatever
  shape the hero happened to be. A wide board in a nearly square hero lost the
  top and the right edge.
  - **`fit=clip` is the request now**, which scales the image to sit inside
    1600x1160 and never cuts it, so what arrives is the whole picture at its
    own ratio.
  - **The slide shows it with `contain`, and the frame is filled by the SAME
    picture blown up and blurred** — `::before` at `cover` with a blur,
    `::after` at `contain` over it. Both take `background-image:inherit` from
    the URL the script set on the slide, so the browser fetches it **once**.
    The blurred layer is `scale(1.14)` because a blur samples beyond its own
    box and would otherwise show a soft seam at the frame.
  - **The strip tiles are `contain` too**, so a thumbnail previews the whole
    shot rather than a crop of it — which is the point of a thumbnail when
    the set is mixed boards, elevations and floor plans.
  - **`IMG()` feeds nothing else**, so this is scoped to the gallery; the
    collection cards keep their deliberate `cover` crop.

`.pd-grid` is `align-items:stretch` with
`min-height:calc(100svh - var(--pd-top))` (`--pd-top` is the section's own top
padding, the thing that clears the fixed navbar).

Four parts of that are load-bearing:

- **`min-height`, not `height`.** Every project today is sparse — none has an
  overview, amenities or specs — so the rail is short and the photograph takes
  the slack. A project with real copy makes the rail taller than the screen, and
  the row has to grow with it rather than scroll inside itself.
- **The hero is capped at one screen** (`max-height:calc(100svh - var(--pd-top))`).
  Without it, that same tall rail dragged the photograph to 1340px on a 900px
  screen.
- **The strip is NOT `margin-top:auto`** — and the strip is back under the
  picture since 17 Nov, so this is live again. The hero is the thing that
  grows, so the strip follows it onto the floor of the column by itself.
  Pinning it with an auto margin instead leaves a gap between the picture and
  its own thumbnails on a project whose facts rail runs past the hero's cap.
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
configuration-plus-location line), `highlightsTitle`, `brochure` and `phone`.

**The brochure is an UPLOADED PDF, not a link (6 Nov).** `brochureUrl` was a
string, so filling it meant hosting the file somewhere else first — there was
nowhere to put the brochure the client actually has. It is now a `file` field
with `accept: 'application/pdf'`. No project ever had the old string set, so
the swap lost nothing and the field was removed rather than left dead.

**THE BUTTON NO LONGER OPENS THE FILE. IT OPENS THE LEAD POPUP (12 Nov)** —
see *The brochure asks for details first*. With a PDF attached the label
becomes **"Download Brochure"** and **above 5MB it prints the weight**
("Download Brochure (48 MB)"), because someone on mobile data should know
before committing; with none it stays "Request Brochure". **The `href` is left
pointing at the enquiry form in both cases** and is never repointed at the
asset — that would hand the file to anyone who opened the link in a new tab,
which is the one thing the form exists to stop. The Studio warns — never blocks — above 25MB; the size is not in
the asset reference, so that rule goes and asks for it, which is also why a
failed lookup lets the publish through.

Three measured facts about serving a large PDF from Sanity, since the client's
brochures may run to 60MB:

- **Size is not the obstacle.** This dataset already holds a **278MB** file
  asset (an old hero master) and a 129MB one, so a 60MB upload is unremarkable.
  Sanity's docs state no per-file limit for non-image assets; the 100MB in
  *technical limits* is a request-body figure, and these uploads plainly exceed
  it.
- **It opens rather than downloads**, because the asset CDN sends
  `content-disposition: inline` — verified against a live file on this project.
  `?dl=name.pdf` on the URL flips it to `attachment` if a forced download is
  ever wanted.
- **The CDN answers range requests** (`accept-ranges: bytes`), which is what
  lets a browser's PDF viewer paint page one without fetching all 60MB first —
  **but only if the PDF was saved linearised** ("Fast Web View"). Saved
  otherwise, the whole file has to arrive before anything is drawn: about 95
  seconds on a 5 Mbps phone connection, on a blank screen.

**Bandwidth is the real cost, not storage.** The free plan carries 100GB of
assets (this dataset uses ~756MB) and **100GB of bandwidth a month, with no
pay-as-you-go on that plan** — the next tier up is Growth at $15/seat/month,
where overage is $0.30/GB. Every Sanity-served byte counts against it, the hero
film included. At 60MB a brochure, **1,700 opens would spend the entire monthly
allowance**; at 6MB it is 17,000. Compressing the brochure is worth more than
any code change here. The direct line is **removed
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

### Amenities are the client's to invent

**THE CLIENT CAN ADD AN AMENITY THE CODE HAS NEVER HEARD OF AND IT APPEARS
(17 Nov).** It could not before, and the failure was silent.

The old arrangement was a closed set in two halves that had to agree:
`icon` was `required` with a 14-value dropdown in
`studio/schemaTypes/project.js`, and `project.html` ran

```js
(DOC.amenities || []).filter(a => ICON[a.icon])      // <- the bug
```

so an amenity whose key that page did not know was **deleted from the render —
no icon, no row, no console error**. Adding one therefore meant a developer
editing two files and a Studio redeploy, which is not something a client can
do. The CMS audit had already caught one project with an amenity carrying no
icon at all; it was simply not on the site.

**AND A STORED `check` IS NOT A CHOICE, IT IS THE ABSENCE OF ONE (18 Nov).**
The client reported ticks everywhere and they were right: **26 of the 36
amenity marks on six live project pages were the plain tick**, and the guess
was not at fault — it never ran. Queried from the API, **87 of the 99 distinct
amenity labels in the dataset carry `icon: 'check'`**, seeded that way, and
since `check` IS a key in `ICON` the old line took it and never read the name:

```js
ICON[a.icon] ? a.icon : guessIcon(a.label)   // a seeded tick wins
```

`pickIcon` now ignores a stored `check` and falls through to the label. The
tick has also stopped being an option in the Studio, because a setting that
does nothing is worse than no setting. A real icon still wins outright.

**The marks were then drawn from the client's own list, not invented.** Even
with the tick out of the way, 28 of the 99 labels still had nothing to land on,
so there are **fourteen new marks** — `kitchen`, `bath`, `door`, `window`,
`floor`, `school`, `electric`, `waste`, `path`, `streetlight`, `star`, `bbq`,
`bench`, `swing` — each one answering labels that are in the dataset today:
"Modular Kitchen", "Premium Sanitary Fittings", "Vitrified Flooring",
"Pre-School", "Street Lighting", "Barbeque Zone", "Porch Swing", "Star Gazing
Point", "Senior Citizen Area", "Solid Waste Management", "Footpaths",
"Decorative Main Door", "Sliding Windows", "Modular Electrical Switches".
**All 99 labels now resolve to a drawn mark and none to the tick** — 43 marks
in the set. Two of the fourteen were redrawn after being rendered and looked
at: `swing` read as a gazebo until its A-frame became a beam, and `floor` read
as a step until it became tiles in perspective. **Render the sheet and look at
it** — path data that parses can still be a mess.

Rules added with them, and the traps they had to clear: `\bdoor` (not `door`)
because of "outDOOR gym" and "inDOOR games"; the intercom rule stays above it
so "Video Door Phone" is not a door; `gaz[e]*bo` because the client spells it
"Gazeebo"; `game` not `games` for "Game Zone"; `inetrcom`, because that typo is
in the data and the client should not be punished for it; and the `path` rule
sits **above** jogging so "Sky Walk" is a walkway rather than a runner, while
"Jogging Track" and "Walking Track" still fall through to it.

**Three steps resolve the mark now, and none of them can fail:**

1. the icon they chose, if `ICON` has it;
2. else **a guess from the label** — `ICON_GUESS`, a list of
   `[regex, key]` pairs tested in order, first match wins;
3. else `check`, a plain tick in a circle.

The filter now only asks for a non-empty label. `icon` is **optional** in the
schema, the dropdown is **42 options** (the original 14, plus the 15 added on
17 Nov less `check`, which was removed on 18 Nov, plus the 14 new marks), and
`label` is retitled
**Name** because that is what it is.

**ORDER IS THE WHOLE DESIGN OF `ICON_GUESS`, and two false matches were found
by testing it rather than by reading it:**

- `zen` unanchored matched **citi*zen*** — "Senior Citizen Corner" came back
  `yoga`. `spa` unanchored matched **o*pen spa*ce**. Both are now `\bzen\b`
  and `\bspa\b`.
- `tree` unanchored matched **s*tree*t** — "Street Lighting" came back
  `garden`. It is `\btree` now. `plant` matched "sewage treatment **plant**",
  which is plumbing, not horticulture; it is `plantation`.
- `park` matches "Parking" **and** "Children's Park", so the kids rule sits
  above it. `landscap` sits above `garden` for the same reason.

The table is exercised from the shipped source — extract `ICON_GUESS` and
`guessIcon` out of `project.html` with a regex and run labels through them in
Node. **Do that after any edit to it**; reading the list does not find a
substring collision. Thirty-three labels pass, including the ones above.

**Still capped at six on the page** (`AMEN.slice(0,6)`), which the schema
description now says out loud. The grid is three columns by two rows; lifting
the cap means deciding what a third row does to the fold.

**`check` is also offered in the dropdown** ("Other (plain tick)"), so a client
who dislikes the guess can force the neutral mark.

**THEY SIT IN THE FACT BAR'S CARD (17 Nov, the client's request).** Same
ground (`#FBF9F5`), same hairline border, same 14px radius as `.pd-facts`
directly above them, and the cells are divided the same way. They used to be a
bare three-column grid with a `gap`, loose on the ivory page.

- **THE GRID HAS NO `gap`, deliberately.** The cells have to touch for the
  rules to sit *between* them rather than float in a gutter — which is how
  the fact bar does it — so the breathing room is each cell's own padding. It
  is also what makes `width:300%` mean exactly three columns.
- **The fact bar's `+ ::before` trick does NOT carry over.** That is one row
  of four. This is up to six cells over two rows, which needs a vertical rule
  between columns **and** a horizontal one between rows, and `+` would put a
  vertical rule before the first cell of row two — where the row ends, not
  between anything. So both rules exist on **every** cell and are switched by
  `nth-child`.
- **SWITCHED WITH `opacity`, NEVER `display`, and that is load-bearing.** The
  column count changes at 760px and 520px, so which cells start a row changes
  with it, and each tier has to turn rules back ON that a wider tier turned
  off. `opacity` lets every tier restate the same selector shapes at the same
  specificity and win on source order alone. The first attempt used `display`
  and the `:not()`-shaped overrides outranked the plain ones — the 520px tier
  could not reach what the 760px tier had set.
- **`:nth-child(3n+1)` is "first in its row"** and is the only thing that
  changes per tier: `3n+1` at desktop, `2n+1` at 760, every cell at 520.
  `:nth-child(n)` in the 520 block is "every cell" written at the tier
  selectors' specificity so it can switch them all off — a bare
  `.pd-am::before` is one class short and loses.
- **The row rule is drawn once, by the cell that starts the row**, and runs
  the full width of the card (`width:300%` / `200%` / `100%`). Drawing it per
  cell would leave a stub above a row that is not full — four amenities in
  three columns being the common case.

**Verified exhaustively rather than by eye**: 1 to 6 amenities at 1440, 1101,
760, 700, 521, 520 and 390px — 42 cases — asserting for each cell that the
vertical rule is present iff it is not first in its row and the horizontal
rule iff it starts a row below the first. All 42 pass, the row rule measures
within 2px of the card at every tier (the 2px being the border), and nothing
overflows. **Re-run that after touching any of it**; the breakpoint
interactions are not something reading the CSS will tell you.

### The EMI calculator

`emi.html` — one section, `#emi` ("Section XIII — EMI Calculator"), added
7 Nov and **cut back by the client on 9 Nov to the monthly instalment and
nothing else**. A visitor types a property price and gets the instalment. Four
inputs — price, deposit, rate, tenure — each a typed field and a slider driving
the same value, plus a header photograph (`assets/emi-hero.jpg`) on the right.

**The ring, the totals and the year-by-year breakdown are GONE**, in that
order: first the principal/interest ring and its key (`84f802e`), then the
totals beside it (`e0f5100`), then the schedule — **the toggle and its table
on 12 Nov, at the client's request**. The page answers one question now: what
is the monthly instalment.

**The 9 Nov note here claiming the amortisation table had already gone was
WRONG**, and is worth knowing as a warning: `5bebca7` removed the *totals*,
not the schedule. `.emi-more`, `.emi-togg`, `.emi-tbl`, `schedule()`,
`table()` and the `rows` state were all still in the file and still working
until 12 Nov. **Re-read the file rather than trusting a line in here that says
something was deleted.**

- **This time it was taken out properly**, markup and all: the `.emi-more`
  block, 32 lines of CSS, the phone tier's `.emi-tbl{min-width:30rem}`,
  `.emi-more` in the reduced-motion reveal list, `schedule()`, `table()`,
  `rows`, the toggle listener and paint()'s two lines that drove them. A grep
  for any of those names now returns nothing.
- **`total` and `int` went too.** They were computed in `paint()` on every
  keystroke and read by nothing — dead since the totals block was removed, and
  the last thing that might have used them was the schedule.
- **`.emi-ring` and `.emi-key` are still dead CSS** — eleven rules in the
  stylesheet and one more in the reduced-motion block, referenced by no
  markup. Left rather than deleted, so putting the ring back is a markup
  change only.
- **`emiOf()` stays**, obviously, as does its `r === 0` branch: the rate field
  is free text and at r = 0 the formula is 0/0.

**It is the second page with no CMS behind it**, after `services.html`, and the
only one that needs none: it is arithmetic, not content. Nothing is fetched but
the footer's `site-settings`, nothing is posted, and the page keeps working
with Sanity unreachable and with the network off once it has loaded. The
**Every default is 0** (12 Nov, the client's request): the page opens empty —
₹0, 0% down, 0%, 0 years, "Enter a property price to calculate." — and the
visitor fills it in rather than being shown an answer to a question nobody
asked. It needed no new logic: `settle()` already treated 0 as a first-class
value rather than pulling it up to each field's floor, and `emiOf()` and
`paint()` already carried the no-price and no-tenure branches. `DEFAULTS` in
the Section XIII block and the `value=` attributes that mirror it are the only
content in the page, and are where to put real numbers back if that is ever
wanted. **The reset button now reads `Clear`**, because resetting to defaults
and clearing the form are the same act when the defaults are zero.

Six things are load-bearing:

- **THE PERCENTAGE IS AUTHORITATIVE FOR THE DEPOSIT, NOT THE RUPEE FIGURE.**
  People think "twenty percent down", so when the price moves the deposit
  should move with it. Typing a rupee amount sets the percentage from it;
  everything else reads the percentage. Holding the amount instead would mean
  a 20% deposit silently becoming 8% the moment someone looked at a dearer
  flat.
- **The ceiling is applied while typing, the FLOOR only on `blur`/`change`.**
  Clamping the floor on every keystroke turns "8" into "5" before the ".5"
  arrives and the field fights the person using it. `change` is bound as well
  as `blur` because a phone keyboard's "Done" does not reliably produce the
  latter.
- **Which field is being edited is tracked in a `typing` variable**, not read
  off `document.activeElement`. Not because of blur — Chrome has already moved
  `activeElement` to `<body>` by then — but because a SLIDER drag has to be
  able to correct a half-typed box, and `activeElement` still points at that
  box while the pointer is on the slider.
- **The grouped number fields preserve the caret.** Reformatting on every
  keystroke otherwise throws it to the end and editing the middle of a price
  is impossible. The handler counts digits to the left of the caret, reformats,
  and puts it back after the same digit.
- **`input.size` is re-set on every paint.** A text input with `width:auto` is
  20 characters wide whatever is in it, which left the rupee sign stranded half
  a field away from its number; `size` is the only thing that shrinks an input
  to its content without measuring text.
- **`-webkit-slider-thumb` and `-moz-range-thumb` cannot share a selector
  list** — an engine that does not know one of them drops the whole rule — so
  each has its own. WebKit's track cannot see the thumb, so the filled part is
  a gradient stop fed from JS (`--fill`); Firefox has `::-moz-range-progress`
  and ignores it.
- **Below 940px THE ANSWER GOES FIRST** (`.emi-out{order:-1}`). On one column,
  controls above the result would mean scrolling down after every slider drag
  to see what it did.

**THE SLIDERS ARE INDEXES, NOT VALUES (9 Nov).** They used to carry the real
figure — `min="500000" max="50000000" step="50000"` for the price. The client
wanted every slider to read **0 at the extreme left** and only then enter its
working range, which a plain `min`/`max` cannot express: a price slider whose
minimum is ₹15 Lakh can never show zero. So each is `min="0"` over a step
index now, and a `SLIDERS` map converts:

| slider | positions | 0 at left, then |
|---|---|---|
| price | 0–271 | ₹15 Lakh → ₹1.5 Cr, step ₹50,000 |
| deposit | 0–90 | a straight percentage, no offset |
| rate | 0–221 | 5% → 16%, step 0.05% |
| tenure | 0–30 | 1 → 30 years |

`toPos` and `toVal` are inverses and **both have to be edited together** — and
`LIM` (now `price:[1500000,15000000]`) is what clamps the typed field, so a
range change means three edits, not one. Deposit and tenure need no offset
because 0 is already inside their range; price and rate reserve position 0 for
it, which is why their counts are `1 + (span / step)`.

**The disclaimer under it is not boilerplate to trim.** The page prints a
figure that looks like a quote, so it says in as many words that it excludes
fees, insurance, stamp duty, registration and GST, assumes a rate that never
moves, and is not an offer of credit.

**Three routes reach it, and NOT the navigation bar.** A sixth top-level item
does not fit, measured rather than assumed: the bar's contents are already
889px wide inside an 880px bar, and adding "EMI Calculator" takes them to
1023px at 880 and 1043px at 1024. It only fits above about 1300px, and at 1280
the gaps either side collapse to zero. The label length is not the problem —
"EMI" alone still overflows at 880. So:

- the **footer's Explore column**, on all eleven pages that have a footer;
- the **mobile sheet** on all twelve, which is the phone's navigation and
  where the footer alone was leaving it effectively unfindable;
- **`project.html`, under the price** (`.pd-emi`). That page has no footer by
  design, so without this one link a property page is the single place on the
  site with no route to the calculator at all — and it is where someone is
  most likely to want it, standing in front of a price.

**The property page hands its price over** as `emi.html?price=<rupees>`, so
the calculator opens on that flat rather than on its own default. The client
types prices freehand (`₹1.8 Cr`, `₹48 Lacs`, `45 – 65 Lacs`), so the unit is
matched anywhere in the string and the FIRST figure is taken, which is the
asking price on a range. A price with no number in it ("Price on request")
leaves the link generic rather than guessing. The calculator clamps whatever
arrives to the slider's range and ignores anything non-numeric, so a mangled
query string cannot break the page. The link is shown whether or not the
project has a price — the calculator is useful either way, and the price line
above it is the thing that hides itself.

Verified end to end: `₹1.8 Cr` → `emi.html?price=18000000` → the field reads
`1,80,00,000` and the instalment `₹1,24,967`; a project with no price gives a
plain `emi.html`; `?price=abc` falls back to the default.

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

### The forms post to Web3Forms

Both of them, since 5 Nov: the contact card and the 30-second lead popup. One
POST each, to `https://api.web3forms.com/submit`, which emails the enquiry.

**Why not Netlify Forms**, which is where this started and which the site is
already hosted on: Netlify will only send a submission notification **to an
email address belonging to a team member**. The Netlify team here holds other
clients' projects, so making `info@raajlaxmi.com` a valid recipient would have
meant inviting the client into a team where they could see unrelated work. That
is the whole reason for the switch — not price, not features.

**Netlify Forms was briefly kept as a second, silent copy** — a fire-and-forget
POST to `/` that stored the submission without emailing anyone — and was
**removed at the client's request on 5 Nov**. What that cost is the only durable
record: Web3Forms' free plan emails and stores essentially nothing, so **an
enquiry now exists only as a message in one Gmail account**. Lose access to that
inbox and the leads are gone. Restoring it is small: a `fetch('/')` beside the
Web3Forms call, plus `name` / `data-netlify` / a hidden `form-name` field on
both forms, and Form detection re-enabled in the Netlify UI.

Netlify's **Form detection is currently ON and two forms are registered** there
(`contact`, `lead`) from the brief period when this was wired that way. They
collect nothing now and can be deleted in the Netlify UI; nothing in the code
refers to them.

The key facts about the Web3Forms side:

- **The access key IS the recipient.** It is an alias for the one email address
  it was created with; there is no dashboard setting for where mail goes, so
  changing the recipient means **a new key and twelve file edits**. It lives in
  the `<head>` data-layer block beside the Sanity config, published as
  `RL.w3f`, one copy per file — the same arrangement, and the same twelvefold
  edit, as `projectId`.
- **The key is public by design.** Their FAQ: "You do not need to hide the
  access key. Access key is public."
- **One recipient only on the free plan.** Several addresses need `ccemail`,
  which is a PRO feature — so fanning the mail out to the client's team is
  **Gmail forwarding's job**, not the form's.
- **Server-side posting is blocked with HTTP 403** — "Use our API in client side
  or contact support with server IP address (Pro plan is required)". So `curl`
  cannot be used to test the key, and neither can any build-time check.
- **`botcheck` is the honeypot**, a hidden checkbox; the submission is rejected
  if anything fills it. (Web3Forms marks it deprecated in favour of a captcha;
  it costs nothing to keep.) Netlify's `bot-field` went with the Netlify path.
- **`replyto` is set to the enquirer's address**, so the client can reply
  straight from the notification.
- JSON body with a matching `Accept: application/json`. **Do not send JSON under
  an urlencoded header** — their endpoint answers 301 and the browser then
  blocks it as CORS. Their docs call this out specifically.

**The thank-you is shown only once Web3Forms has accepted**, and a failure puts
the button back and reveals `.lead-err` / `.ct-err`, which offers the phone
number. `rl-lead-done` — the flag that retires the popup for ever — is likewise
written only on success, so a visitor whose send failed is asked again rather
than spending their one chance on nothing. Verified: a failed send leaves it
`null` and a retry in the same session goes through. **With no second copy
anywhere, that discipline is now the only thing standing between a failed POST
and a silently lost enquiry.**

**`form.name` does not mean what it looks like**, and this bit once. The
contact handler read the visitor's name as `form.name.value` — the named getter
for the `name` input. The `<form>` carries a `name` attribute, which **shadows
that getter**, so `form.name` is the string `"contact"`. Both handlers go
through `form.elements.namedItem('name')`, which cannot be shadowed.

**VERIFIED END TO END on 5 Nov**, by hand in a real browser on the deployed
site: the form submits, Web3Forms accepts it and the email arrives. Worth
recording how that had to be done, because nothing else works — **`curl` gets
403 by design** (free plan is client-side only), and from headless Chrome on
`http://127.0.0.1` the preflight came back with no `Access-Control-Allow-Origin`
at all. Whether that was their bot protection reacting to a headless browser or
a refusal of a plaintext localhost origin was never established, and is not
worth establishing. **The only way to test this integration is a human, in an
ordinary browser, on the deployed https site.** If it ever regresses, the first
thing to try is sending the body as `application/x-www-form-urlencoded` (also
supported) with `Accept: application/json`, which is a CORS-simple request and
skips the preflight entirely.

**The key delivers to `rajjlaxmi20@gmail.com`** — deliberately a Gmail rather
than one of the 21 Hostinger mailboxes, so enquiries do not depend on a hosting
plan that has to keep being renewed. Since Web3Forms' free plan has one
recipient, **Gmail forwarding is what fans it out** to whoever on the client's
side should read it; that can be changed any time with no code edit, which the
access key itself cannot.


## Architecture

**The `<head>` CSS is duplicated across all twelve files.** Lines ~1–978 of `index.html`, `projects.html`, `projects-ongoing.html`, `projects-redevelopment.html`, `project.html`, `testimonials.html`, `services.html`, `contact.html`, `emi.html`, `privacy.html`, `terms.html` and `disclaimer.html` are the same stylesheet — base tokens, cursor, nav, mobile sheet, and the CSS for sections I–V — differing in only ~100 lines (title, nav/logo sizing on the inner pages). Each page then renders only its own sections. **Any edit to shared chrome (nav, `.nav-wrap.on-light`, burger/sheet, the WhatsApp button, `:root` tokens, the hidden page scrollbar) must be applied to all twelve files or the pages drift.** The exception is **Saathi**, which is two files in `assets/` and is edited once — see *Saathi, the rule-based assistant*; what each page carries of it is one `<link>` and one `<script defer>`, and those two lines do have to stay in step. The cursor rules are in all twelve too and must stay in step, but the cursor itself no longer paints — see *The custom ring cursor is retired, not removed*. The page scrollbar is hidden by request (`html{scrollbar-width:none}` + `html::-webkit-scrollbar{display:none}`); it is scoped to `html`, **not** `*`, on purpose — the scrollbar on `.cor-figure` is the only cue that the line-map banner pans sideways on a phone, so a blanket rule would break that.

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

**The plate's parallax is two-column-only, and that is a fix rather than an
optimisation.** `frame()` in the Section II block drifts `.ab-visual` by up to
46px, subtracted from its top edge on the way in. Side by side with the copy
the plate has its own column and all the room it needs. **Stacked below 1000px
it has none** — the only thing above it is the `ABOUT RAAJLAXMI` label,
separated by an ~18px margin — so the drift pulled the plate up through the
heading. Measured on a phone before the guard:

| | drift | gap |
|---|---|---|
| 412x915 | −17.7px | +2px (just clears) |
| 390x844 | −19.5px | −1px (touching) |
| 360x640 | **−32.3px** | **−18px (overlapping)** |

`.ab-visual` carries **`transform:none !important`** in the 1000px tier and
that is the authority — an `!important` declaration beats the inline style
`frame()` writes — while `frame()` itself now returns early when stacked, which
also clears a value left behind by a resize across the breakpoint. After:
gap +20 / +18 / +14, no overlap at any of the three.

A long CMS heading is the thing that could still break it: there is no
`fitHeadline()` here as there is on the hero, so a heading that wraps to four
lines will push the strip past the fold again. Measured fits at 1440×900,
1536×864, 1366×768, 1280×800, 1024×800, 1024×640, 1280×620 and 1680×1050.

**Section II's CSS has drifted from the other seven files.** The `.ab-*` rules
live in the shared head stylesheet, so all twelve files carry a copy — but only
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

### The brochure asks for details first

**`window.RL.lead.open(opts)` opens this same popup on demand**, wearing
different wording, and `project.html`'s brochure button is its only caller
(12 Nov, the client's request). The point is the lead: a brochure is the one
thing on a property page worth a name and a number, and it was being given
away for nothing.

- **THOSE TWO FLAGS NOW GATE THE TIMER, NOT THE BLOCK**, and that is the part
  that would have bitten. They used to be bare `return`s at the top of the
  IIFE, so for a visitor who had already seen or sent the popup **the submit
  handler was never bound** — opening the modal by hand would have given them
  a form that did a native, page-reloading POST. They are one `autoOK` boolean
  now, read only where the timer is armed. Having sent the callback form is
  also no reason to refuse someone a brochure, so the manual opener ignores
  both.
- **The copy is swapped, not duplicated.** `dress(o)` sets the label, title,
  sub-line and button text, and `dress(null)` on close puts the standing
  wording back — so the 30-second opening is never left wearing a brochure's
  label. Verified: open the brochure popup, close it, and the next automatic
  one reads "Private Enquiry / Let us find your address." again.
- **The file is handed over as a LINK in the thank-you panel** (`.lead-dl`),
  not with `window.open`. That call would land after the async send, outside
  the gesture that started it, and browsers block it as a popup.
- **The wording follows the file.** Only three of the fifteen projects carry a
  PDF, so on the other twelve the title reads "Request the brochure" and the
  thank-you promises to send it, rather than offering a download that cannot
  happen. Both lines open with "Thank you", which is why personalising is a
  prefix swap rather than a second set of strings.
- **A hidden `property` field carries which brochure was asked for**, and the
  subject line says so too — without it the client gets a brochure request
  with no idea which brochure. It is `disabled` when empty, because a disabled
  control is not submitted at all and an always-blank `property:` line in every
  callback email would be noise.
- **The opener is on all twelve pages** (it is shared chrome) but
  `contact.html` still returns before it, since that page already is this
  form. Nothing there calls it.
- **`project.html` wires the click OUTSIDE its `if(DOC)` branch**, so the
  hand-written fallback page behaves the same way, and it falls through to the
  markup `href` if `RL.lead` is missing — the button can never become inert.
- **It is suppressed on `contact.html`**, which already *is* this form; covering it with a duplicate is the one place the popup would actively get in the way.
- The blur is `backdrop-filter` on `.lead-scrim`, with an `@supports not` fallback that takes the scrim to near-opaque where the property is unavailable, so the card is never read against live page content. It sits at `z-index:900` — above the nav (100), below the loader (9999), so the cover is never what the backdrop is blurring.

Its location list is the `LOCATIONS` array in the IIFE (one line to edit) and the `<select>` is populated from it. **Like the contact form, it posts to Netlify Forms**, as `lead` — see *The forms post to Netlify Forms*.

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
paragraphs, and the biography is justified but **never hyphenated**
(left-aligned below 760px, where there are too few words per line to
justify). `hyphens:auto` was splitting words across lines — "lead-" /
"ership" — which the client asked to stop on 16 Nov. The justification
stays, so the right edge is still flush; what goes is the browser's licence
to break a word to reach it, and looser word spacing on an unlucky line is
the accepted cost. `text-wrap:pretty` takes back what it can where it is
supported. **The timeline panel's `.wtl-text p` carries the identical
treatment and was changed with it** — same page, same defect, and its
comment used to point at `.owd-bio` as the precedent. Checked at
1440x900, 1366x768, 820x900 and 420x860, by tap as well as hover, and under
`prefers-reduced-motion`, which drops every transform.

Anything that should animate in after the cover lifts registers with **`window.onIntro(fn)`**, not `window.load` — on load the cover is still up and the sequence would play out of sight. `index.html`'s hero choreography is the only current caller. When the cover is removed the block fires a synthetic `resize`, because the adaptive nav sampled the cover rather than the page and would otherwise be stuck in the wrong state. The two status pages are clones of `projects.html`, so they duplicate its whole Section V as well — a fix to a collection card, chip or the Sanity query has to be made in three files, not one. That now includes the Projects dropdown: `.nav-drop` / `.nav-menu` in the bar and `.sheet-sub` in the mobile sheet, both present in all twelve files. The menu is pure CSS — `:hover` plus `:focus-within` for keyboards — with an invisible `::after` bridge spanning the gap so the pointer can travel down without it closing. It sits inside `#navWrap`, which the adaptive-nav sampler skips wholesale, so it cannot confuse the light/dark detection. Section-specific CSS still lives only where it is used, under its `/* ===== SECTION N — NAME ===== */` banner; `project.html`, `testimonials.html`, `contact.html` and `services.html` each append their own section block (VI–IX) after that shared run.

**One IIFE per section, in markup order.** The trailing `<script>` opens with shared behavior (entrance choreography, navbar scrolled state, mouse parallax, custom cursor + magnetic buttons, mobile menu), then one self-contained IIFE per section, then the adaptive-nav block. Each IIFE owns its own `IntersectionObserver`s and scroll-progress math — no shared state between sections, so a section can be rewritten or ported (GSAP `ScrollTrigger`, Framer `useScroll`) in isolation.

**Markup conventions** (wired up by the shared script, so they work on every page):

- `data-hover` — **INERT since 16 Nov.** It grew the custom cursor ring, and
  that ring is retired; see *The custom ring cursor is retired, not removed*.
  43 elements on `index.html` alone still carry the attribute
- `data-magnetic` — button pulls toward the pointer. Still live: this one is
  the element moving, not the cursor, so it survived the retirement
- `data-cursor-gold` — **INERT, same reason.** It softened the cursor to a gold
  circle over imagery
- `data-anim` — entrance-choreography participant
- `data-to` + `data-suffix` — counter target; counts once when its section arrives
- `.in` on a wrapper — the reveal class every section's observer adds

### The custom ring cursor is retired, not removed

`c853a54` (16 Nov) turned it off in all twelve files, and **the way it was
turned off is why this note exists**. The phone-tier rule that used to hide it,

```css
@media(hover:none),(max-width:760px){ .cursor-ring,.cursor-dot{display:none;} }
```

became an unconditional `.cursor-ring,.cursor-dot{display:none!important}`.
So:

- **The markup, the JS and the attributes are all still there.** `.cursor-ring`
  and `.cursor-dot` are still in every `<body>`, the shared script still tracks
  the pointer and still adds `.hover`, and 43 elements on `index.html` still
  carry `data-hover`. None of it paints.
- **`data-hover` and `data-cursor-gold` are therefore dead markup**, and adding
  either to a new element does nothing. `data-magnetic` is unaffected — it
  moves the button, not the cursor.
- **Putting it back is deleting one declaration**, which is presumably why it
  was done this way. Deleting the machinery instead would be a twelve-file
  change and would throw away the thing this leaves recoverable.
- The earlier version of this file listed "cursor" among the shared chrome to
  keep in step across twelve copies. That is still literally true — the rules
  are in all twelve and must stay identical — but it is no longer a *live*
  part of the design, so do not spend an afternoon reasoning about it.

**Navbar legibility over photography.** The bar's links were `--paper-dim`, a 66%
cream, and the scrim behind them only appeared once the page had scrolled. With a
CMS hero that can be a bright sunset, that left the labels almost invisible on the
one screen that has a photograph behind them. The links are now full-strength
`--paper` with a soft shadow, the CTA has a firmer border and ground, and the scrim
is **on from the start and lifts under `.on-light`** instead — over ivory the type
is already charcoal and a dark veil there would be wrong. Shadows are cleared in the
`.on-light` state, where they only muddy charcoal.

**The nav CTA reads `Enquiry Now` (9 Nov).** It was `Book Consultation`
until then; the client asked for the change and it was made in all twelve
files, in the bar and in the mobile sheet, 24 occurrences. **Both `.nav-cta`
and `.sheet-cta` carry `text-transform:uppercase`**, so the markup keeps the
file's Title Case convention and the button still renders ENQUIRY NOW — do not
"fix" the source to caps thinking the rendering depends on it. **The three
longer CTAs elsewhere were NOT part of that request and still say
consultation**: `Schedule a Consultation` on the three collection pages,
`Book a Private Consultation` on `services.html` and `contact.html`, and
`Schedule a Site Visit` on the detail page.

**The `Enquiry Now` button is a filled gold pill, and carries
`position:relative`.** That last part is load-bearing: `.nav-wrap::before` is the
scroll scrim and it is absolutely positioned, so it paints over any in-flow
sibling. The nav links already carry `relative` for their underline and so escape
it; the button did not, and a dark veil was being laid over the one element on the
bar anyone is meant to click. As an outline it was also the only thing up there
with no ground of its own, so over a bright hero it dissolved into the photograph.
Filled, it is `--champagne` on `#14243C` — a 7:1 contrast ratio, the same treatment
the page's other primary buttons use — and it keeps that fill over ivory too.

**The markup's location list was corrected on 9 Nov** (`a3647e7`) from the four
Lucknow localities to Vasai / Nallasopara / Virar / Saphale — and **later the
same day the derivation that was overwriting it was removed**, so those four
are now what a visitor actually sees. See *LOCATION is a fixed list too* below
for why, and for the one other thing that had to change with it.

**The hero fields were tightened on 9 Nov** (`7cac551`): `.hs-field` went from
`flex:1 1 8.5rem` to `flex:1 1 0` with a `6.5rem` floor, and the select's right
padding from `1.6rem` to `1.15rem`, so each dropdown's chevron sits just after
its word instead of being pushed out to a fixed column — which is what keeps
the longer `Discover Your Space` button on the same row.

**NEITHER hero dropdown is built from the projects any more, since 9 Nov.** All
three — PROPERTY, LOCATION and BUDGET — are now CMS content: written on the
`homepage` singleton, painted by the home-page content block, with the markup as
the offline fallback. Submitting navigates to `projects.html?type=…&loc=…&budget=…`,
which the three collection files read and AND with the active city chip.

They were derived because a hand-typed list matched nothing — a visitor could
choose a locality the group does not build in and the form merely scrolled the
page. Both derivations were removed for the same reason: each one **claimed the
control with `dataset.src='projects'`, so the list the client had typed into the
Studio never reached the page at all.**

**PROPERTY IS A FIXED LIST AGAIN, and the reason is that the derived one was
overwriting the client's own.** It used to split every project's `config`
(`"2 & 3 BHK"` → `2 BHK`, `3 BHK`) and offer the distinct results, so that every
option had a property behind it. Against the live data that printed 1/2/3/4/5
BHK — and `fill()` claims the control with `dataset.src='projects'`, so
`paintSelect()` stood down and **`heroPropertyOptions`, which the client had
already filled in, never reached the page**. It is now fixed, exactly as BUDGET
is: written in the CMS, painted by the home-page content block, the same
whatever the projects carry. `typesOf()` and `byType()` went with the
derivation.

### The navbar type grew, and the breakpoint had to move with it

**The client asked for bigger type on the bar (17 Nov).** Every size on it
moved together so the hierarchy holds: links `.7rem → .8rem`, the Projects
menu `.66 → .74`, the pill `.68 → .76`, the mobile sheet's sub-row
`.68 → .76`, and `.nav-menu`'s `min-width` `13.5rem → 14.5rem` so
REDEVELOPMENT still has room. All thirteen files.

**THE BAR HAD NO SLACK TO SPEND, which is the part worth knowing.** Measured
before anything changed, at 1440x900 down to 861px:

| width | gap, logo to links | gap, links to pill |
|---|---|---|
| 1440 | 169px | 169px |
| 1100 | 37.5px | 37.5px |
| 1000 | 3.7px | 3.7px |
| 900 | **0px** | **0px** |
| 861 | **0px, and the document overflowed horizontally** |  |

So a straight font-size bump would have pushed a 100px-wide band into
horizontal scroll. Two things carry it instead:

- **The gap is elastic**: `gap:clamp(1.3rem,2.6vw,2.6rem)` on `.nav-links`. It
  gives way before the bar does and only reaches its full 2.6rem where there
  is room.
- **The burger takes over at 940px, not 860px.** The desktop bar now only
  exists where it fits. This fixed a **pre-existing** overflow at 861–880px
  that had nothing to do with the type.

Re-measured after: no overflow at any width from 390 to 1920, and 941–990px is
the tight band (links flush against logo and pill, which is where 861–1000px
used to be). `@media(max-width:860px)` appears **once per file** and is this
block — do not confuse it with `max-width:860px` as a *property*, which
`projects-redevelopment.html` uses on `.cor-figure.plate`.

**THE PROJECTS MENU IS IN THE CLIENT'S ORDER: Ongoing, Completed, Upcoming,
Redevelopment.** It is a selling order — what is on sale now comes first — not
alphabetical and not chronological, so do not "tidy" it. The order lives in
**two places per file** and they must not drift: `.nav-menu` in the bar and
`.sheet-sub` in the mobile sheet. Thirteen files, twenty-six lists.

**`projects.html` LISTS ITS CARDS IN THAT SAME ORDER (19 Nov, asked for).**
"All projects" groups the cards Ongoing → Completed → Upcoming → Redevelopment,
so the page reads the way the menu does. Until then the CMS `order` field alone
decided, which put the completed buildings first. `STAGE_RANK` / `rankOf()`
just above `renderCards()`, and three things about it are load-bearing:

- **A project in several stages ranks by its EARLIEST one.** Krishna Niwas and
  Shanti Niwas are filed `ongoing` + `redevelopment` and their pill says
  "Ongoing"; ranked by the later stage they would sit at the foot of the page
  wearing an Ongoing badge among the Upcoming cards. Today no project is
  Redevelopment alone, so that group is empty on the All page.
- **The Studio's `order` field still decides INSIDE each group.** The sort is
  stable and the documents arrive sorted `order asc, _createdAt asc`, so only
  whole groups move. Do not add a tiebreaker — it would take that control away
  from the client.
- **It is in all four collection files**, byte-identical, and is a no-op on the
  three single-stage pages; it is there so the clones stay identical.

Verified against the live CMS through request interception: the same 23
projects as before, grouped 6 Ongoing / 9 Completed / 8 Upcoming, Studio order
unchanged within each, the Virar chip and `?status=completed` still correct,
and the Ongoing, Upcoming and Redevelopment pages card-for-card identical to
live. (The Redevelopment page loads the heaviest artwork; a probe reading it
too early sees 0 cards — wait for `.col-card` before concluding anything.)

**THE MOBILE SHEET'S "Projects" GOES TO `projects.html` TOO (19 Nov).** It had
been left at `?status=completed` when the bar's link was repointed on 16 Nov,
so on a phone "Projects" and its own "Completed" sub-link went to the same
place and the whole collection was unreachable from the menu. All thirteen
files; the sheet's Completed link still carries `?status=completed`.

### The logo and the paragraph text are both a little larger (19 Nov)

**THE LOGO GREW ~10%, BUT ONLY WHERE THE BAR HAS ROOM.** The clamp's *ceiling*
was raised and its vw slope and floor left alone, so the logo is **unchanged
from 941px to ~1250px** — the band the section above calls tight. Measured
before the change: the homepage's links sat **0px** from the logo at
941–960px (inner pages 9px). Below 940px the links have folded into the burger
and there were 100+px spare, so fixed phone sizes go in the first
`@media(max-width:940px)` block of each file.

| | top of page | scrolled | ≤940px top / scrolled |
|---|---|---|---|
| `index.html` | `clamp(42px,4.6vw,58px → 64px)` | `clamp(34px,3.4vw,42px → 46px)` | 46px / 37px (was 42 / 34) |
| the other twelve | `clamp(32px,3.2vw,40px → 44px)` | `clamp(30px,3vw,38px → 42px)` | 35px / 33px (was 32 / 30) |

Re-measured at 11 widths on three pages: identical gaps from 941 to 1100px,
the bar 4–6px taller where the logo grew, no overflow anywhere.

**PARAGRAPH TEXT IS ×1.06 EVERYWHERE — 133 rules in 13 files.** "Increase a
very little everywhere, like the text under *Creating Possibilities*." Scaled
were the `font-size`s of body-copy paragraphs only — found by walking every
page's text nodes (≥45 chars, Inter, not uppercase) on the live site, not by
guessing: `.ab-copy p`, `.ab-cred p`, `.sp-intro`, `.sp-desc`, `.why-intro`,
`.why-rtext p`, `.ow-intro`, `.br-intro`, `.col-intro`, `.col-desc`,
`.col-cta-mid p`, `.pd-hero-p`, `.pd-copy`, `.sv-card p`, `.sv-qb p`,
`.tm-intro`, `.tg-intro`, `.tm-strip p`, `.ct-done p`, `.ct-loc-in p`,
`.ct-consent`, `.emi-intro`, `.emi-note`, `.lg-intro`, `.lg-sec p`,
`.lg-note p`. Headings, eyebrows, labels, buttons, the nav and `.col-loc` (an
address line) were left alone. Every number inside the value scaled, so a
`clamp()` keeps its shape and the phone tiers moved with the desktop ones.

**EVERY COPY OF A RULE WAS SCALED, INCLUDING THE INERT ONES.** Most of these
rules sit in all thirteen heads (the duplicated stylesheet) and render on one
or four pages. Scaling only where they render would have made the clones drift
apart; scaling all of them keeps them identical to each other. The homepage's
copies were already different from the other twelve (its about/why/services
tiers were refined there alone) and still are.

At 1440px the about paragraph is **15.1 → 16.0px**, legal body 15.2 → 16.1,
card descriptions 12.8 → 13.6. Checked at 1440, 1024 and 390 on all thirteen
pages against the live site: no horizontal overflow and nothing clipped by the
change. Two "clipped" readings are pre-existing and identical before and after
— the services FAQ answers are collapsed accordions (height 0 by design), and
`.pd-hero` reports 616>576 at 1024 because of something other than its
paragraph, which sits well inside it.

**FOUR HOMEPAGE AREAS WENT UP AGAIN (19 Nov, the last request before launch),
`index.html` only, 16 rules:**

| area | rule | 1440×900 before → after |
|---|---|---|
| hero search | `.hs-field select` `.82 → .9rem` — PROPERTY / LOCATION / BUDGET are the selects' **placeholder options**, there is no `<label>` | 13.1 → 14.4px |
| About | `.ab-copy p` ×1.08 in all three tiers; `.ab-scap` (stat captions) raised twice the same day, to `clamp(.9rem,.7vw,1rem)` / `clamp(.8rem,.6vw,.88rem)` in the ≤700px-tall tier | 16.0 → 17.3px; 11.5 → 12.8 → **14.4px** |
| Signature cards | `.sp-cat .6→.66rem`, `.sp-name` clamp ×~1.09, `.sp-loc .76→.84`, `.sp-desc .848→.92`, `.sp-btn .64→.7`; phone-tier `.sp-cat`/`.sp-btn` `.72→.76` | name 22.3 → 24.2, desc 13.6 → 14.7px |
| timeline panel | `.wtl-text p` clamp ×~1.1, `.wtl-yr .n`, `.wtl-yrbig`, `.wtl-sub` | 14.4 → 16.0px text |

`.wtl-text p`'s old size string is shared with `.owd-bio` (the leadership
bio) — match on the selector, not the value, or both move.

**Measured against the live CMS copy** (request interception) at 1280×720 to
1920×1080: the hero search stays one row ("PROPERTY" fills 78 of its 89px);
About's trust strip still ends above the fold at every desktop size (after the second caption bump: **12px** spare at 1280×720, the tightest; the stat cards grew 7–26px and the fourth caption runs to three lines everywhere); the last
Signature "View Project" button is **24px** clear of the fold at 1280×720 (33
before), 36px at 1366×768 and 58px at 1440×900 — above the 16px that section's
`68.6vh − 374px` picture formula holds back, so **that formula was not
re-fitted**; the timeline card stays on screen and its text still fits without
the inner scroll. If anything else is added to a Signature card body, the
1280×720 margin is what to re-measure.

### LOCATION is a fixed list too

**The client asked for Vasai / Nallasopara / Virar / Saphale**, in Western-line
order — the same four the corridor banner and the town-filter capsule already
use. The derivation could not produce that list, for two separate reasons:

- **It printed the client's sub-locality spellings.** It read the LAST
  comma-separated part of each address and offered the distinct results, so the
  dropdown read `Nallasopara (West)`, `Saphale (West)`, `Vasai East`.
- **It had no Virar at all.** It queried only `completed` projects, and all
  three Virar properties — Krishna Niwas, Raajlaxmi Meenakshi, Raajlaxmi Avenue
  — are Ongoing or Redevelopment.

`townOf()`, `fill()` and the `RL.q.search` fetch are gone with it. **Nothing
else used that query**, so it was removed from the `<head>` data layer too —
the home page now makes one query fewer.

**THE SUBMIT NO LONGER FORCES `status=completed`, AND THAT IS NOT A SEPARATE
CHANGE.** It is what gives back the one thing the derivation bought: the
guarantee that every option has a property behind it. Pinned to the Completed
view, the client's own Virar option would have answered with "nothing matches".
The hero now searches the whole collection, and with nothing chosen it opens a
bare `projects.html`.

Measured against the live dataset, each of the four returns properties — Vasai
3, Nallasopara 3, Saphale 5, Virar 5. Virar is 5 rather than 4 because `?loc=`
is matched **anywhere** in the address line, so Nakshatra Auris's
"Virar-Nallasopara Link Road, Nallasopara (West)" answers to both Virar and
Nallasopara. That looseness is pre-existing and deliberate — see the note under
*The town filter is a capsule of four towns* — and it errs towards showing a
property rather than hiding one.

**`dataset.src` is now set by nothing.** The guard in `paintSelect()` is kept as
the hook a future derived list would claim a control with; do not delete it
believing it is dead weight, and do not re-add a derivation without reading why
both of these were taken out.

The list is **1 BHK / 2 BHK / 3 BHK / Jodi Flats / Office / Shops** (9 Nov, the
client's wording). It replaced their own `1 RK, 1 BHK, 2 BHK, 3 BHK, Shop,
Office`, so **`1 RK` was dropped** — one Studio edit puts it back. Today the
three BHK options return 1, 3 and 5 projects; **Jodi Flats, Office and Shops
match nothing**, because no project's `config` mentions them.

**The collection pages match the type on a FOLDED KEY, not an exact string.**
`typeKey()` drops case, spaces and punctuation and a trailing plural, so
`Shops` finds a project filed `Shop`, `Jodi Flats` finds `Jodi Flat`, and
`1BHK` and `1 BHK` are one choice. Matched strictly, as it was until 9 Nov,
every one of those pairs returned a confident "nothing matches" — and the
dropdown deliberately offers plurals the client will type as singulars. It is
the same forgiving idea as `nameKey` on the banner hotspots and `townKey` on
the chips, and it lives in **all three collection files**.

Two more details are load-bearing. `"2 & 3 BHK"` is **expanded into separate
options** (`2 BHK`, `3 BHK`) when matching, or a search for one would never
match the other. The **town is the last part of the address**, not the first — the chips key off the
first part, which is a sub-locality, so the link filters on a substring of the whole
line rather than trying to agree with them; and `"Vasai (East)"` and `"Vasai East"`
are **folded on a punctuation-free key** so one town does not appear twice and a
search matches both spellings. (The folding now matters only on the collection
side: nothing derives a list from the projects any more, so there is no longer
a race between two fillers for the same `<select>`.)

**The hero filter's placeholder option IS its heading, and the three fields
carry no `<label>` (9 Nov).** They used to read `Any residence` / `Any location`
/ `Any budget` inside the control with a small gold `PROPERTY` / `LOCATION` /
`BUDGET` label above it. The client asked for the headings in the control; the
labels went with them rather than printing each word twice.

- **The caps are typed into the markup, not set in CSS.** `text-transform` on
  an `<option>` is not honoured reliably, and `.hs-field select` carries none
  anyway — measured `textTransform: none`. So `PROPERTY` is literal text.
- **`aria-label` on each `<select>` replaces the label.** Dropping the `<label>`
  would otherwise leave three controls with no accessible name.
- **The placeholder survives the Sanity rebuild for free.** Both fillers —
  `fill()` in the HERO SEARCH block and `paintSelect()` in the home-page content
  block — do `const keep = sel.querySelector('option[value=""]')`, empty the
  select and put that same node back before appending the CMS values, so the
  node is preserved by reference and its text is irrelevant to them. Nothing
  about this changes when the client edits `heroPropertyOptions`.
- **`.hs-field > label` is now dead** in `index.html`, in the base rule and in
  the phone type-floor tier. Both are left in place: they sit in the stylesheet
  that is byte-identical across all twelve files, and deleting them from one
  copy would start the drift that block exists to prevent.
- Measured after: the form is **77px at 1440** (was ~85) and **125px at 1024**
  (was ~142) — one label row shorter, two where it wraps. The phone capsule is
  unchanged closed at **55px** and **282px open** (was 343), still clearing the
  navbar, still reporting the choice (`3 BHK · Hazratganj`) and still reading
  "Find your home" with nothing set. No overflow and no console errors at
  1440x900, 1024x800, 390x844, 360x640 or 844x390.

**The hero's submit button reads `Discover Your Space` (9 Nov).** It was
`View residences`. **Editing the markup and `seed-home.mjs` is not enough and
this is the trap**: the button is painted by `setText('.hs-submit',
d.heroButton)`, so whatever `heroButton` holds on the live `homepage` document
wins over the markup every time, and `seed-home.mjs` is `createOrReplace` —
for a fresh dataset only, never to be run against the client's. The field was
patched on the live document directly. The markup still carries the new wording
as the offline fallback, and `.hs-submit` is `text-transform:uppercase`, so it
renders DISCOVER YOUR SPACE either way.

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

### The card prints one price, the lowest

**CHANGED 16 NOV.** For two days each configuration printed its own figure
under its own size row — `380-400 Sq. Ft. for 1 BHK` with `42 Lacs Onwards`
beneath it, and again for the 2 BHK. The client asked for those to go and for
**one figure, the cheapest, to close the card** above View Details.

- **`lowestPriceText(p)` returns the client's own STRING, never a number.**
  `money()` decides *which* row is cheapest and is never used to render one:
  the prices are hand-written (`42 Lacs Onwards`, `₹1.8 Cr`) and reformatting
  them would drop the "Onwards" that makes the figure a starting point rather
  than a quote.
- **It compares FLOORS.** Two rows written `42 Lacs Onwards` and `60 Lacs
  Onwards` are compared on 42 and 60 — not on the open-ended ceilings, which
  `closeTop` exists to close for the budget filter.
- **A row with no price, or text with no number in it, is skipped rather than
  read as zero.** Otherwise an unpriced flat type would always win and the
  card would print nothing useful. Verified against a row reading `Price on
  request` beside a priced one: the priced row wins.
- **`p.price` is the fallback**, for a project priced as a whole rather than
  per configuration — which is most of them today. With neither, the line is
  omitted rather than printed empty.
- **THIS CHANGES DISPLAY ONLY.** The budget filter still reads every row,
  through `rowPrices` / `priceRange`, so a project is still matched on its
  full spread even though the card shows only the floor. Do not "simplify"
  the filter to use `lowestPriceText`.
- `.col-meta.col-sizes .zp` and the two-line row rule are gone from all twelve
  files; a size row is a single `.zl` sentence again.

### The rupee sign is added at render

Asked for on 16 Nov: a `₹` on the collection card's price and on every price
on the detail page. **The symbol is NOT stored in the CMS and must not be** —
`withRupee()` puts it on at render, in the three collection files and in
`project.html`.

The reason it is a function rather than a `₹` typed into the template is that
the client writes prices freehand and does not spell them the same way twice.
The live dataset holds `42 Lacs Onwards` beside `₹1.8 Cr`; a hard-coded prefix
would print `₹₹1.8 Cr`.

```js
const withRupee = s => {
  const t = String(s == null ? '' : s).trim();
  if(!t || !/\d/.test(t)) return t;
  return /₹|\brs\.?\b|\binr\b/i.test(t) ? t : '₹' + t;
};
```

- **A string already carrying a currency mark is left exactly as written** —
  `₹`, `Rs`, `Rs.` or `INR`. The client can keep typing whichever they like.
- **A string with NO DIGIT IN IT passes through untouched**, which is the case
  worth knowing: `Price on request` must not become `₹Price on request`. That
  reaches the function because `p.price` / `DOC.price` are returned verbatim
  as the fallback when a project has no priced `sizes` rows — `lowestPriceText`
  only `money()`-checks the rows, not the one-line field.
- **IT IS DISPLAY ONLY, AND NOTHING MAY BE BUILT ON IT.** `money()`,
  `priceRange()`, `closeTop()`, the budget bands and `project.html`'s `rupees()`
  all keep parsing the client's own string. Verified after the change: a
  project priced `42 Lacs Onwards` / `60 Lacs Onwards` per configuration still
  hands the calculator `emi.html?price=4200000`, the cheaper row, exactly as
  before. **Do not "tidy" the filter to read the rendered text.**
- **Four copies, one per file that renders a price** — the three collection
  pages and `project.html` — which is this codebase's usual arrangement rather
  than an oversight. The detail page's copy has its own comment naming
  `rupees()`, because `money()` does not exist on that page.
- **It is applied at three call sites**: `priceLine()` on the card, and on the
  detail page both the `.pdp-row` per-configuration values and the one-line
  `DOC.price` branch.
- **The card template inserts it unescaped**, as `${withRupee(t)}` inside the
  one big template literal. That is the pre-existing convention there — `p.name`
  and `p.category` go in raw too — and was deliberately not changed for one
  field. The detail page uses `textContent`, so it is escaped there.

Verified by driving the real price strings through both render paths against
an intercepted Sanity response, at 1440x900 and 390x844: the card prints
`₹42 Lacs Onwards`, the detail page `₹42 Lacs Onwards 1 BHK` and
`₹60 Lacs Onwards 2 BHK`, `₹1.8 Cr` is not doubled, `Price on request` is
untouched, and the EMI hand-off is unchanged. No console errors.

**"ONWARDS" IS SET AS A QUALIFIER, NOT AS PART OF THE FIGURE (17 Nov, the
client's request, in two steps).** At the price's own weight and size,
`₹42 Lacs Onwards` read as though the whole phrase were the amount. It now
drops to the small gold type of the nearest label — `CALCULATE THE MONTHLY
EMI` on the detail page, `VIEW DETAILS` on the card — **but in Title Case, not
caps.** The client asked for the type first and the case second, and the second
ask is the narrower one: `Onwards`, capital O and the rest lower.

**It is on BOTH surfaces**: the detail page and all four collection files.

- **THE WORD IS NORMALISED IN JS, NOT IN CSS, and that is the whole reason it
  cannot be a `text-transform`.** The same dataset carries `ONWARDS`,
  `onwards` and `Onwards`, and all three must print `Onwards`.
  `text-transform:capitalize` only raises a first letter — it would leave a
  typed `ONWARDS` exactly as it found it. So the case is set on the string:
  `m[0].charAt(0).toUpperCase() + m[0].slice(1).toLowerCase()`.
- **The shared rule on the detail page stops short of the case.** `.pd-emi`
  and `.pd-price .pdp-q` share one declaration of family, size, weight,
  tracking and colour — matching sizes written out twice are matching only
  until somebody adjusts one of them — and `text-transform:uppercase` then
  sits on `.pd-emi` alone. Verified by comparing the two computed styles: the
  five shared properties identical, the transform deliberately not.
- **The card's rule inherits instead of repeating.** `.col-price .cp-q` sets
  only `font-size`, `font-weight` and `letter-spacing` (`.col-details`'s
  values); family and colour come down from `.col-price`, so there is nothing
  there to keep in step.
- **Two code paths, because the two pages build their prices differently.**
  `priceInto()` on the detail page appends **text nodes and one span** — that
  page sets prices with `textContent` everywhere, the CMS string being text
  and not HTML. `priceHtml()` on the cards returns a **string**, because the
  card is one big template literal; **it escapes both halves**, which the rest
  of that template does not do, since this is the one field that now has
  markup built *around* it and the client's own text must not close the span.
- **Matched ANYWHERE in the string** (`/\bonwards?\b/i`), not anchored to the
  end: `42 Lacs Onwards for 1 BHK` is a form this file already knows the
  client writes, and an end-anchor would have missed it. `Onwards` **on its
  own** is left plain — with no amount in front of it there is nothing to
  qualify.

Checked by lifting `withRupee` and the qualifier code out of **both** shipped
files and running them in their own live pages — ten strings each. Every one
keeps its text exactly; `Onwards`, `onwards`, `ONWARDS` and `Onward` all come
back `Onwards`/`Onward`; `45 – 65 Lacs`, `Price on request` and the bare
`Onwards` are untouched; and a price containing `<b>` comes out escaped on the
card. Computed type measured against `.pd-emi` and `.col-details` on the page.

**The local placeholder cards carry no `price`**, so nothing on
`projects.html` shows this over `file://` without forcing a value in — which
is what the check above does. That is the built-in fallback array at the top
of the file, not a statement about the live dataset.


### A price per configuration, and the budget bands that it fixed

**FIXED ON 14 NOV, in the same session that found it.** The section below
describes a defect that was live for part of that day; it is kept because the
cause is worth knowing and because the free-text field it came from still
exists. The fix has two halves: a `price` field **per configuration**, and a
parser that no longer mistakes a configuration for an amount.

Until 13 Nov no project had a `price` at all, so every budget band returned an
empty collection — inert, but honest. The client then priced six projects, and
**five of the six are written as free text that the parser mis-reads**:

| project | `price` | `money()` reads |
|---|---|---|
| Priti Darpan | `26 Lacs Onwards` | ₹26L – ∞ ✓ |
| Priti Pearrl | `19 Lacs Onwards for 1 BHK & 26 Lacs Onwards for 2 BHK` | **₹1 – ∞** |
| Priti Chaaya | `19 Lacs Onwards for 1 BHK ` | **₹1 – ∞** |
| Raajlaxmi Tower | `42 Lacs Onwards for 1 BHK & 60 Lacs Onwards for 2 BHK` | **₹1 – ∞** |
| Raajlaxmi Apartment | `42 Lacs Onwards for 1 BHK & 60 Lacs Onwards for 2 BHK` | **₹1 – ∞** |
| Shakun Solitaire | `35 Lacs Onwards for 1 BHK & 50 Lacs Onwards for 2 BHK` | **₹1 – ∞** |

**`money()` read the "1" of "1 BHK" as one rupee.** Its regex takes every
number in the string, and a number with no unit after it inherits the unit of
the LAST number — which here was the "2" of "2 BHK", itself unitless, so the
multiplier was 1. The configuration digits became rupee amounts, the range
floor collapsed to ₹1, and `onwards` opened the ceiling to infinity. A range of
₹1 to infinity intersects every band, so the Budget dropdown returned:

| band | before | after |
|---|---|---|
| Under ₹25 Lacs | **5**, incl. two ₹42-Lac projects | **2**, both priced from ₹19 Lacs |
| ₹25 – ₹45 Lacs | 6 | 6 |
| ₹1 Cr + | all 6 | 6 — see the note on *onwards* below |

A buyer filtering for a home under ₹25 Lacs was shown homes at ₹42 Lacs.
Returning nothing was a dead end; that was a wrong answer presented as a right
one.

**THE REAL FIX IS `sizes[].price` — A PRICE THAT IS ONLY A PRICE.** The array
that already held a size per configuration now holds that configuration's price
too, so the amount and the flat type are never in the same string and nothing
has to guess which digits are money. It is also the answer to "how do we show
two prices for two flat types", which is the same question from the other end.

- **`priceRange()` prefers the rows and falls back to the one-line field.** A
  project priced per flat type spans from its cheapest configuration to its
  dearest, which is what a buyer filtering by budget means. A row with no
  price, or an unparseable one, is **skipped rather than dragging the floor to
  zero** — that was the original bug's shape and it is not being reintroduced.
- **The free-text line is not printed as well as the rows**, on the card or on
  the detail page. A project carrying both would otherwise state its prices
  twice.
- **`area` is optional now**, so a configuration can be priced without a size
  being quoted. The card drops the "for" sentence and prints the flat type
  alone in that case.
- **The detail page gained `.pdp-row`** — price leading, configuration beside
  it and quieter — and its **EMI link now takes the CHEAPEST** configuration,
  because the calculator should open on the entry price.
- **`project.html`'s own price parse had the same latent bug.** It survived
  only because the amount happened to come first in every live string; written
  "1 BHK – 42 Lacs" it would have handed the calculator one rupee. It drops
  the configuration digits now too.
- **`money()` is still fixed for free text**, because twelve projects may keep
  using that field: any `<digits> bhk|rk|bed(s)` is dropped before anything is
  counted. All six live strings parse correctly through it.
- **"Onwards" no longer means an open-ended PROJECT** (fixed the same day,
  once the migrated data made it visible). `money()` still reads "42 Lacs
  Onwards" as [42L, ∞] because that is right for a **band** — "₹80 Lacs +"
  does mean everything above — but `closeTop()` shuts a **project's** ceiling
  to the dearest figure it actually states. Every price on the site is written
  "Onwards", so with the ceiling open each project matched every band above its
  floor: four of the five bands returned all six priced projects. Priced per
  configuration the rows give a real spread, and Raajlaxmi Tower is 42–60 Lacs,
  not 42 Lacs to infinity. Measured after, against the client's own bands:

  | band | returns |
  |---|---|
  | ₹18 – 25 Lacs | Priti Pearrl, Priti Chaaya |
  | ₹35 – 45 Lacs | Tower, Apartment, Shakun Solitaire |
  | ₹45 – 65 Lacs | Tower, Apartment, Shakun Solitaire |
  | ₹65 – 80 Lacs | none (nothing is priced there) |
  | ₹80 Lacs + | none |

- ~~**PRITI DARPAN MATCHES NO BAND AT ALL**~~ — **fixed the same day by adding
  the missing band**, not by touching code. It is "26 Lacs Onwards" with no
  configurations, so its range is a point at ₹26L, and `heroBudgetOptions`
  jumped straight from `₹18 – 25 Lacs` to `₹35 – 45 Lacs`: nothing covered
  ₹25–35 Lacs and anything priced in that gap was unreachable by budget.
  `scripts/add-budget-band.mjs` inserted `₹25 – 35 Lacs` in place. **All six
  priced projects are now reachable by at least one band**, measured live:

  | band | returns |
  |---|---|
  | ₹18 – 25 Lacs | Priti Chaaya, Priti Pearrl |
  | ₹25 – 35 Lacs | Priti Darpan, Priti Pearrl, Shakun Solitaire |
  | ₹35 – 45 Lacs | Tower, Apartment, Shakun Solitaire |
  | ₹45 – 65 Lacs | Tower, Apartment, Shakun Solitaire |
  | ₹65 – 80 Lacs, ₹80 Lacs + | none — nothing is priced above ₹60 Lacs |

  **THE BANDS ARE FREE TEXT AND NOTHING MAKES THEM CONTIGUOUS.** Re-check for
  a gap whenever they are edited; a project priced into one simply vanishes
  from the filter, silently and with no error.
- **`scripts/split-prices.mjs` migrates the six existing strings** into the
  rows. **It has not been run**: it writes to live content, so it is the
  client's call. It is non-destructive (the free-text `price` is left unless
  `--clear-price`), idempotent, takes `--dry`, and skips a string that names no
  configuration — "26 Lacs Onwards" has nothing to split and the one-line field
  already says it correctly.
- **Both halves need the Studio redeployed** before the client can fill the new
  field in. The parser fix does not.

Verified by driving the real pages against the real dataset, and — for the rows
no project carries yet — against an intercepted Sanity response, at ten
viewports from 1920x1080 to 280x653: the rows render, the price stacks under
its size, the standalone line is suppressed, no card or page overflow, the
detail page lists both prices and links the calculator to the cheaper, and the
bands return the right projects. No console errors.

Two things that still hold from before, and are not bugs:

- **No price line renders where there is no price.** Card and detail page both
  remove the row rather than printing an empty one.
- **`project.html` links to a bare `emi.html` unless the price parses.** The
  handover is `emi.html?price=<rupees>`, so it needs a number. The link is
  shown regardless, which is deliberate.

**The navbar's `Book Consultation` went nowhere on six of eight pages.** It was
`href="#ctForm"` — a same-page anchor, and `#ctForm` is the enquiry card on
`contact.html` alone. Everywhere else the bar's one primary button, and the
mobile sheet's, simply did nothing. Both are `contact.html#ctForm` now on every
page but `contact.html` itself, where the bare anchor is correct. (`project.html`
was already pointing at `contact.html`, so it needed no change.)

**Phones were audited across twelve viewports** — 280x653 (Fold closed),
320x568, 360x640, 360x780, 375x667, 390x844, 393x852, 412x915, 414x896,
430x932, and both landscapes (667x375, 844x390) — on all twelve pages. The good
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
measured 9.3px for the hero's PROPERTY / LOCATION / BUDGET labels (those
labels are gone now — see *The hero filter's placeholder option IS its
heading*), 9.6px for a project
card's category, 9.9px for the lead popup's eyebrow and the detail page's fact
labels, and 9.0px for the brand-card trades. That is under the ~11px both
platforms treat as the floor for secondary text, and worse than the number looks
because wide tracking costs legibility fastest at small sizes.

One block, **identical in all twelve files**, floors seventeen selectors at
.72–.74rem (11.5–11.8px) and eases the tracking wherever it was .22em or more.
It is identical rather than tailored on purpose: a selector that does not exist
on a given page costs nothing, and one string copied twelve times cannot drift
the way twelve tailored ones would. It changes no layout.

Two details worth keeping: the tier is scoped
`(hover:none),(max-width:620px),(max-height:560px)` for the same landscape
reason, with `hover:none` catching tablets; and **`.sv-card .sv-slot span` had
to be named explicitly**, because it is more specific than `.sv-slot span` and
was still winning at .56rem.

**One audit result WAS a false positive, and is now simply gone.** `services.html`
used to report its first heading 7px under the navbar at every size. That
heading was `h1.sv-sr` — the screen-reader-only alt text for the painted hero
band, clipped to a 1px box — so nothing visible was ever colliding. The band is
film now and carries no copy at all, and **that `<h1>` is still `.sv-sr`**, so
the audit would report the same false positive today. The band has no visible
heading to collide with anything.

**Adaptive navbar** (last IIFE, every file). It samples the actual painted background behind `#navWrap` at three x-positions per scroll tick, averages relative luminance, and toggles `.on-light` (charcoal text) above a threshold of 150. Reading the live background rather than tagging sections means it keeps working when light sections are added. Full-bleed overlays that darken a light section from above carry `pointer-events:none`, so `elementsFromPoint` can't see them — they're listed in the `DARK_OVERLAYS` array (currently `['veil']`) and tested by geometry/opacity instead. **If you add another full-bleed dark overlay, add its id to `DARK_OVERLAYS` in all twelve files.**

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
name / role / bio / portrait. **`heading` is no longer painted** — see *The
owners section has no heading any more*. It drives **Section XI of the home page**, not a
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
"ownersPage":*[_id=="owners-page"][0]{label,intro,
  owners[]{name,role,bio,"photoUrl":photo.asset->url}}
```

### The owners section has no heading any more

`<h2 class="ow-title">Meet Our Owners.</h2>` is **gone** (9 Nov, the client's
request), and the small gold `Our Leadership` label above it was enlarged to
carry the job in its place.

- **The label IS the heading now, and is marked up as one.** It was a `<span>`;
  it is an `<h2 class="ow-label">`. Deleting the only heading in a section is
  the SEO cost the hero already pays, and it is not worth repeating when an
  `<h2>` costs nothing. It needs `margin-top:0`, because the UA gives an `h2`
  one and the old rule never had to say so.
- **Its tracking scales with its size.** 6px of letter-spacing is `.43em` at
  14px and reads as a label; held at 6px while the type grew it would push
  "OUR LEADERSHIP" wider than a 280px screen. `font-size:clamp(1.15rem,2.1vw,
  1.9rem)` and `letter-spacing:clamp(3px,.42vw,6px)` bottom out together.
  Measured 18.4px/3px and 200px wide at 280px, 30.4px/6px and 345px at 1920 —
  one line at every size with no horizontal overflow.
- **`.ow-title`, `.ow-ln` and their reveal rules are deleted**, along with the
  `.ow-ln i` line in the reduced-motion branch and the `heading` field in the
  GROQ projection — the same clean-out the hero headline got.
- **`heading` stays on the document and in the schema.** Clearing it would
  destroy the client's copy to tidy a form. The consequence is the same quiet
  trap `heroHeadline` sets: editing "Meet Our Owners." in the Studio now does
  nothing. **To change this heading, edit the `label` field**, not `heading`.
- **Nothing of the client's was lost**, because `label`, `heading` and `intro`
  are all **null** on the live `owners-page` document — everything this section
  shows comes from the markup. The five owners and their portraits are real and
  are untouched.

**`.ow`'s own top padding (63px) is less than the navbar (122px)**, so the
label sits under the bar if you stop with the section's top exactly at the top
of the window. That is **pre-existing** — measured at −57px on the file before
this change and −59px after, the 2px being the taller label — and it is not the
same problem the one-screen sections solve, because nothing lands on this
section's top edge. Raise `.ow`'s `padding-top` if it ever matters.

`move-owners.mjs` has been run and is spent. It is kept because it documents the
move and is a no-op if run again — it refuses to overwrite anything already on
the owners document.

The portrait is requested at `w=900&h=1200&fit=crop&crop=focalpoint`, so the
**hotspot steers the crop** — worth setting on the face, because the card is 3:4
and the copy covers its bottom third.

**`services.html` and `emi.html` are the only pages still entirely hand-edited**, and
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

**The signature cards point at projects, so THERE IS NO SEPARATE SIGNATURE
SCHEMA.** This is the one thing about the home page that reliably confuses
people, and it came up again on 6 Nov as "signature projects do not have
brochure upload". They do: all four cards reference ordinary `project`
documents — today Shanti Niwas, Rajlaxxmi Park, Nakshatra Auris and Krishna
Niwas, the same documents the collection page lists — so every field a
completed project has, a signature project has, the `brochure` PDF included.
What the card object itself holds is a reference plus a few collapsed
*overrides*; it deliberately carries no gallery, price, specs or brochure of
its own, because those belong to the property and are read from it on both
pages. The route is: open the card, click through the reference, fill the
project. The reference field's description says so in as many words.

Each of the four cards carries a **reference to a `project` document**, and the
project fills the card: name, category, location, short description (`blurb`), card photograph and
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

**Two overrides are deliberately LEFT** rather than cleared, because the card
and the project genuinely say different things and only the client can say which
wins: Rajlaxxmi Park's card says `Residential` where the project says
`Luxury Apartment`, and Nakshatra Auris's card carries the abbreviated
`Virar-Nsp link Road` against the project's fuller `Virar-Nallasopara Link
Road`. (There were three. The fourth card's `Luxury Living` belonged to Aarvi
Apartment and was cleared when that card was repointed at Krishna Niwas — an
override is a disagreement about one property and must not be carried to
another.) Deleting one in the Studio
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

### The reviews strip gives way too

**The reviews run as a continuous marquee**, not a stepped carousel — and since
**9 Nov they are a real scroller**, not a CSS animation, because the client
asked for the same behaviour Section XI on the home page has: it runs by
itself, follows the finger or the mouse the moment anyone pushes it, and
resumes a few seconds after they stop.

It is **the owners strip's implementation, ported almost line for line**, so
everything under *The owners strip gives way and comes back* applies here too
and is not repeated: `SPEED` 70 px/s (unchanged), `IDLE` 2600ms, `SLOP` 6px,
`held` as a deadline, the `scroll` listener that only *extends* a hold, capture
only once a drag is real, and the capture-phase `click` that stops a drag from
counting as one. What differs:

- **`.tm-viewport` is the scroller, not `.tm-stage`.** This strip is
  `stage > viewport > track` where the owners' is `stage > grid`; the viewport
  is the element that already clipped and carried the edge mask, so it is the
  one that becomes `overflow-x:auto`.
- **`render()` now lays down ONE set and `build()` clones it.** It used to
  render exactly two, which is all a transform marquee needs. A scroller can be
  pushed *backwards* and `scrollLeft` cannot go below zero, so it needs
  `ceil(stage/set) + 2` sets with a whole one in hand either side. Five reviews
  give **3 sets / 15 cards** at every width measured.
- **The capture-phase `click` guard protects the Google button**, not a detail
  panel. Each card can carry a review link, so without it a drag with the mouse
  over a card would open that review in a new tab.
- **`measure()`, `--tm-loop`, `--tm-dur`, `@keyframes tm-marquee`,
  `will-change:transform` and the two `animation-play-state` rules are all
  gone.** Hover and focus now hold the strip still from the script. The stepped
  carousel's `cards` and `at` state went with them — nothing had read them since
  the arrows and dots were hidden.
- **Reduced motion is now better than it was.** The strip used to simply rest,
  which left every card past the third unreachable. It now renders a single set
  with `scroll-snap-type:x mandatory`, no edge mask and `cursor:auto`, and the
  visitor pushes it themselves — the same concession the owners strip makes.

### It shipped dead, and the harness is what hid it

**The strip did not move at all** between 9 Nov and the fix later the same day.
The client reported it. The cause was a **name collision**, and it is worth
reading in full because the shape of it will recur:

`function frame(t)` — the drift loop — and `function frame()` — the corner
sketches' scroll parallax at the foot of the block — were **two function
declarations of the same name in one IIFE**. That is not two functions: the
later declaration wins for the whole scope, hoisting and all. So `start()`
queued the *parallax* function, which paints the sketches once and never
re-queues. `running` was left `true` for ever, `start()` returned early on
every subsequent call, and the strip advanced exactly zero frames. The parallax
one is **`decorFrame()`** now. **Keep every function in that IIFE uniquely
named** — a scan of all twelve files found this was the only collision on the
site, which is why the owners and gallery strips were unaffected.

**THE EARLIER CLAIM HERE THAT THE DRIFT COULD NOT BE VERIFIED HEADLESSLY WAS
WRONG, and it is what let this ship.** It was measured with
`--virtual-time-budget`, under which `requestAnimationFrame` reports zero ticks
— so the broken strip and the working one both read `0px`, the zeros were taken
as a limitation of the harness, and the conclusion was "confirm it in a real
browser", which nobody did.

**Drive Chrome over CDP with real wall-clock time instead.** Launch it with
`--remote-debugging-port` and **no `--virtual-time-budget`**, open the page over
the DevTools protocol, wait in real seconds and read `scrollLeft` twice. rAF
then ticks at a true 60fps and the drift is exactly measurable. Measured that
way: reviews **70.0 px/s**, owners **30.0 px/s**, gallery **42.0 px/s** — each
its own `SPEED` to the tenth. Two traps in that harness: Chrome **caches the
page across runs** when `--user-data-dir` is reused, so a fix can read as still
broken — add a cache-busting query; and the strip only runs when its
`IntersectionObserver` says it is visible, so `scrollIntoView()` it first.

Verified after the fix, locally at 1440x900: 3 sets / 15 cards, drift **70
px/s**, **0 px/s while hovered**, back to **70** on unhover, a 200px mouse drag
moving it **exactly 200px**, **0 px/s** for the 2.6s idle window after the drag,
**69.9 px/s** once it expires, the corner sketches' parallax still tracking the
scroll, and no horizontal page overflow. Under `--force-prefers-reduced-motion`:
1 set, 0 drift, snap on, mask off, `cursor:auto`, still scrollable by hand.
The same harness against the **live, unfixed** site reproduced the fault — 18
cards, **0 px/s** — while the gallery below it read **42 px/s**, which is what
confirms the collision was local to this one block.

What *is* verifiable was verified at 1440x900, 1920x1080, 390x844 and 360x640:
3 sets, `overflow-x:auto`, `cursor:grab`, no animation on the track, a 200px
mouse drag moving the strip **exactly 200px**, the position seated at one set
width, no horizontal page overflow and no console errors. Under
`--force-prefers-reduced-motion`: 1 set, snap on, mask off, still scrollable.
The photo gallery below still reports `tg-marquee`, confirming it was left
alone.

Hovering a card draws a **gold border**: the visible half of the same gesture,
saying which card is being held still. The border lives on the rules that already
own `:hover` rather than a rule of its own.

Two consequences of never stopping. **Every card is equal** — there is no settled
middle one to feature, and a card that grew as it drifted past would wobble the
row — so `.tm-card`'s `scale(.94)`/`opacity:.62` side-card treatment is overridden.
And the **arrows and dots are hidden**, because a strip with no discrete slides
gives them nothing to point at; they are `display:none` rather than deleted, so
dropping `.tm-stage .tm-arw` and `.tm-stage .tm-dots` brings the stepped controls
back. Under `prefers-reduced-motion` it renders a single set that the visitor
can still push — see above.

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
**runs as a real scroller, the same way the reviews above it do** — the owners
strip's implementation again, ported on 9 Nov after the client confirmed the
reviews strip felt right and asked for this one to match. `SPEED` is **42 px/s**,
slower than the reviews' 70 because these are photographs rather than lines of
text. Everything under *The owners strip gives way and comes back* applies and
is not repeated. **One thing differs from both other strips:**

- **THE TRACK IS THE SCROLLER HERE, NOT THE STAGE.** `.tg-arw` prev/next are
  absolutely positioned children of `.tg-stage`, so making the stage scroll
  would scroll the arrows away with the photographs. The stage keeps the clip
  and the edge mask and stays what the arrows are pinned to; `.tg-track` does
  the scrolling — which is what the reduced-motion branch already did, so that
  branch now only adds the snap and drops the grab cursor.
- **`width:max-content` had to come off `.tg-track`.** A scroller sized to its
  own content never scrolls; the tiles are `flex:0 0 <size>` and overflow it.
- **Copies went from `max(2, ceil(stage/set) + 1)` to `max(3, … + 2)`**, for
  the same reason the reviews did: a transform marquee only travels one way,
  and this one can be pushed backwards past zero.
- **The arrows still only appear under reduced motion.** They steer discrete
  slides, and a drifting strip has none; `ends()` keeps its
  `if(!slow.matches) return;` guard.

`@keyframes tg-marquee`, `--tg-loop`, `--tg-dur`, `will-change:transform` and
the two `animation-play-state` rules are gone. Measured at 1440x900, 1920x1080
and 390x844 with eight photographs: **3 sets / 24 tiles**, `overflow-x:auto`,
`cursor:grab`, no animation, seated at exactly one set width, a 200px mouse
drag moving it **exactly 200px**, arrows hidden, no page overflow, no console
errors. Under `--force-prefers-reduced-motion`: 1 set, snap on, arrows back.
**The strip is `hidden` until Sanity carries a photograph and localhost is not
in the CORS allowlist**, so testing it locally means stubbing `RL.get` for the
query containing `gallery[]` — that is how the numbers above were taken. It ships with `hidden` on it and is revealed only once the CMS
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

### The WhatsApp handle is rebuilt, not trusted

It is the one social entry that
is a phone number rather than a link, and it shipped broken: the client typed
**`https://wa.me/9177740 00939`** — the number spaced as it is printed — and
`wa.me` takes bare digits, so the href could never resolve. `waHref()` in the
footer block of all twelve files now reconstructs it from whatever is in the
field: a `wa.me` link, an `api.whatsapp.com/send?phone=` one, or the bare number
in any spacing. Five things about it:

- **A ten-digit number is given a `91`.** That is an assumption and it is the
  right one here — every number on this site is Indian — but it is the line to
  change if that stops being true.
- **`chat.whatsapp.com` links are passed through untouched.** Those are group
  invites whose code is not a phone number; stripping one to digits would
  produce a link to a number that does not exist.
- **`?phone=` is read before the query string is discarded**, or an
  `api.whatsapp.com` link would have no digits left in its path and would fall
  through unchanged.
- **Anything with fewer than ten digits is left alone** rather than guessed at.
- **The visitor arrives with a message already typed** (`WA_TEXT`), because an
  empty chat box is a worse prompt than a sentence they can edit. A `?text=`
  written into the CMS wins over that default.

Verified against the live document and nine inputs: the live handle resolves to
`https://wa.me/917774000939?text=…`, and the spaced, bare, international,
`api.whatsapp.com` and pre-texted forms all normalise correctly while the group
invite and non-numeric strings pass through.

**It delivers to `+91 77740 00939`** — the footer's number, not the contact
page's `+91 9890823288`. Those two have contradicted each other since before
launch; now that one of them receives WhatsApp messages, the question of which
is right has teeth.

### The WhatsApp button is on every page

Asked for on 16 Nov: a WhatsApp icon in the bottom-right corner of every page,
opening a chat with `+91 77740 00939`. `.wa-fab` / `#waFab`, shared chrome, so
the CSS block and the markup are **byte-identical in all twelve files** — 59
lines of stylesheet and one `<a>` before the lead popup. Verified by hashing
both blocks across the twelve.

**ITS NUMBER COMES FROM THE CMS, NOT FROM THE MARKUP.** The `href` written into
the file is the footer's number and is only the fallback — what works with
Sanity unreachable and in the moment before the settings query lands. The
`SITE SETTINGS` block repoints it through the same `waHref()` the footer icon
uses, so **one edit in the Studio moves this button and the footer icon
together**. Verified by answering with a different handle: all twelve followed
it.

- **THE `if(!foot) return;` GUARD HAD TO GO, AND THAT IS THE ONE STRUCTURAL
  CHANGE HERE.** That block bailed early on any page with no footer, which is
  `project.html` — so the single page without a footer would have become the
  single page whose WhatsApp number could not be changed from the Studio, and
  it would have drifted silently the first time the client edited the handle.
  The guard is `if(!foot && !waFab) return;` now, and `paint()` does the button
  first and *then* returns on a missing footer. Nothing between the two touched
  `foot`, which is what made this safe to split.
- **`waHref()` is what makes it work at all.** The client types the number as
  it is printed — `+91 77740 00939` — and `wa.me` takes bare digits. See *The
  WhatsApp handle is rebuilt, not trusted* above; this button inherits every
  one of those cases for free, the group-invite passthrough included.
- **`z-index:860`, deliberately BELOW both modals.** The owner detail panel is
  880 and the lead popup 900, and each covers the viewport with its own scrim,
  so a visitor who has opened one is not offered a second thing on top of it.

**TWO COLLISIONS, BOTH FOUND BY MEASURING AND NEITHER VISIBLE IN A
SCREENSHOT.** They are the reason this section is long:

1. **It floated over the open mobile sheet.** `.sheet` is `position:fixed;
   inset:0` at **z-index 90**, against this button's 860 — so with the menu
   open the green circle was the top element at its own centre, measured with
   `elementFromPoint`. It now stands down entirely:
   `html:has(.sheet.open) .wa-fab{opacity:0;visibility:hidden;pointer-events:none}`.
   Same idea as the lead popup standing down for the owner panel, and `:has()`
   is already an idiom here — see `.ct-item:has(a[href^="mailto:"])`.
2. **It sat on the hero search capsule's chevron on phones.** That capsule is
   pinned to the foot of the hero (see *On a phone the hero search is a CAPSULE
   that opens on tap*) and the chevron is the right-most thing in it, which is
   exactly where this button lands. Measured overlap **16–19px** at 390x844,
   360x640, 412x915 and 280x653. The button now **steps above the capsule while
   the capsule is on screen** and slides back down once it has scrolled away.

Three things about that lift are load-bearing:

- **`--wa-lift` is a custom property, and the hover rule COMPOSES with it**
  (`translateY(calc(var(--wa-lift) - 2px))`). Written as a bare
  `translateY(-2px)`, the hover would drop the button back onto the capsule at
  the exact moment a pointer was over it.
- **The class is set by an IntersectionObserver in the HERO SEARCH block, and
  it needs no breakpoint of its own.** `.hs-peek` is `display:none` on a
  desktop, and an observer never reports a box with no area — so `wa-lift`
  simply never appears above 620px. Verified: false at 1440x900, true at every
  phone size, false again once scrolled past the hero.
- **`html.wa-lift .wa-fab` is index-only in practice and lives in all twelve
  anyway.** No other page has a capsule to set the class. That is the same
  arrangement `.hs-field > label` and the phone tier's `.sv-slot` already have:
  a selector matching nothing costs nothing, and the block stays identical.

**The lift is `-5rem`, and `-4.2rem` was not enough.** At 4.2rem the button
cleared `.hs-peek` itself but still cut 5px into `.hero-search`, the pill
around it, at 412x915. Measure against the **pill**, not the button.

**WhatsApp green (`#25D366`) rather than the site's gold**, and the glyph is
**filled** rather than the footer's stroked line-icon: this is a utility
control, the colour is the half of it people recognise without reading, and at
~26px a hairline outline of that shape closes up into a blob. It steps from
52px to 46px below 620px (or 560px tall), and respects
`env(safe-area-inset-*)`.

Measured at 1440x900, 412x915, 390x844, 360x640, 844x390 and 280x653 on all
twelve pages: present everywhere, inside the viewport, hit-testable at its own
centre, no horizontal page overflow and no console errors; the lift engages and
releases correctly; the sheet rule hides it; and under
`--force-prefers-reduced-motion` the lift still applies, without the slide.
**One overlap is left and is not a defect**: at 280px the button covers a
collection card's `.col-heart` as you scroll past it. Every fixed button
eventually covers something.

**IT OPENS A CHAT CARD NOW, NOT WHATSAPP (19 Nov, asked for).** A tap opens a
small WhatsApp-looking card — teal header with the brand mark, name and
tagline, one message from Raajlaxmi Group on the chat wallpaper, and a green
**Start chat** that hands over to WhatsApp. Modelled on a TeleCRM widget the
client sent; the "Powered by" line was not copied, and it says *Opens
WhatsApp* instead. It lives in **`assets/wa-chat.css` + `assets/wa-chat.js`**,
wired in beside Saathi's two lines on all thirteen pages, for Saathi's reason:
it carries prose (`NAME`, `TAGLINE`, `GREETING`, `CTA`, `NOTE` at the top of
the JS — edit there, once).

Load-bearing:

- **THE BUTTON IS STILL A PLAIN `<a href="https://wa.me/…">`.** The script
  only intercepts an unmodified primary click. With the script missing, or on
  a ctrl/cmd/shift/middle click, it goes straight to WhatsApp as before.
- **"Start chat" copies `#waFab`'s `href` and watches it** (a
  `MutationObserver` on the attribute). The SITE SETTINGS block repoints that
  href from the CMS through `waHref()`, possibly after the card has opened, so
  the Studio's number reaches this with nothing to keep in step. **Never write
  a number into `wa-chat.js`.**
- **IT TAKES SAATHI'S SLOT, ABOVE BOTH BUTTONS, AND THE TWO ARE EXCLUSIVE.**
  A pointer press on either button already closes the other (both close on an
  outside `pointerdown`). Keyboard does not press anything outside, so: opening
  this calls `.sa-launch.click()` when `html.sa-open` is set (Saathi's only
  public way in), and an observer on `<html>`'s class closes this when
  `sa-open` appears. The same observer closes it for `lead-open` (the 30s
  popup) and `pdw-open` (the walkthrough player on `project.html`). **On a
  phone Saathi hides the WhatsApp button while its panel is open** (its own
  CSS), so there the card simply cannot be reached until Saathi closes.
- **A SHORT SCREEN PUTS IT BESIDE THE BUTTONS** (`max-height:560px`). Above two
  46px buttons on a sideways phone it would start ~130px up and run off the
  top of a 390px screen.
- **The typing dots play on the first open only**, and not under reduced
  motion; reopening shows the message rather than performing it again.
- Focus moves to Start chat on open; Esc and the ✕ return it to the button.
  It stands down under the mobile sheet with the same `:has(.sheet.open)` rule.

Verified with real CDP clicks at 1440x900 (index, services, project),
1024x768, 390x844 (index, contact) and 844x390: opens, shows the message,
`aria-expanded` follows, Start chat's href equals the button's and is
`target=_blank rel=noopener`, Start chat / ✕ / Esc / an outside press / the
button again all close it, never covers either button, never both it and
Saathi open by pointer or keyboard, closes for `lead-open`, hidden under the
sheet, no console errors. **A test tapping "outside" on a phone must check the
point really is outside** — the card is 340px wide on a 390px screen.

### Saathi, the rule-based assistant

A chat launcher sits **directly above the WhatsApp button** on all twelve
pages and opens a small panel. Saathi (साथी, "companion") answers the
questions the site already has answers to and hands everything else to a
person. Asked for on 16 Nov.

**IT IS A KEYWORD MATCHER. There is no model, no API, no key and no network
call of its own** — so it keeps working with Sanity unreachable and with the
network off once the page has loaded, like the rest of this site.

**IT WAS THE FIRST PIECE OF SHARED CHROME NOT DUPLICATED TWELVE TIMES** (the
WhatsApp chat card followed it on 19 Nov, for the same reason), and that is a
deliberate departure from the convention the rest of this file
insists on. It lives in `assets/saathi.css` and `assets/saathi.js`, wired in
with one `<link>` and one `<script defer>` per page. The reason: the thing
most likely to be edited here is the **FAQ prose**, and prose copied twelve
times is exactly what put `+91 22 4123 4567` on three pages for months. The
two rules that actually matter are kept — **no build step and no
dependencies**. The cost is two same-origin requests, both cacheable.

**THE FALLBACK IS THE MOST IMPORTANT ANSWER IN THE FILE.** A matcher only
knows what it has been taught, so everything else has to end somewhere
useful: the telephone number and a link to book a visit. That was the brief.

**What it deliberately will not say:** no prices, no project names, no
counts, no availability. All four change in the Studio without anyone
touching `saathi.js`, and a bot confidently quoting last month's price is
worse than one that says the team will confirm. Those questions are routed
to a human **on purpose, not by omission** — do not "improve" it by hard-
coding a figure.

Four things are load-bearing:

- **A CHIP RESOLVES TO ITS INTENT DIRECTLY, NEVER THROUGH THE MATCHER.** The
  first cut sent a tapped chip back through `match()` like any typed
  sentence, and **"Where do you build?" — a chip the bot itself offers —
  scored one point and fell through to "that one is beyond me".** A
  suggestion the bot makes and then cannot answer is the worst failure this
  kind of bot has. The `CHIP` map binds each label to an intent id. **Every
  label used in a `chips` array must appear in that map.**
- **`--wa-lift` IS DECLARED ON `:root`, NOT ON `.wa-fab`.** Both buttons rise
  together when the hero capsule is on screen. Declared on the button, the
  property never reaches a sibling, and the launcher stood still while the
  WhatsApp button rose 80px straight through it.
- **The WhatsApp button publishes its geometry** as `--wa-size`,
  `--wa-bottom` and `--wa-bottom-r`, because the launcher stacks on it and
  the panel stacks above that. `saathi.css` reads all three and carries the
  same values as fallbacks, so a page that failed to load its inline
  stylesheet still puts them somewhere sensible.
- **Keywords are matched on word boundaries**, so `oc` cannot match
  "location" and "home loan" is not answered by the projects intent merely
  because it contains "home". A phrase scores 4, a word of six letters or
  more 2, anything shorter 1, and **2 is the floor** — one short word is not
  evidence of intent. Hinglish spellings sit beside the English ones because
  this is Vasai-Virar and people type "kitna" and "ghar".
- **A LEADING `!` MARKS A KEYWORD THAT IS STRONG ON ITS OWN (worth 3).**
  Length turned out to be a poor proxy for how much a word tells you: `emi`,
  `bhk`, `oc` and `rera` are three or four letters and are the most specific
  things a visitor can type. Scored by length alone, **"emi calculator" and
  "what sizes do you have" both fell through to the fallback on the live
  site** — caught by testing the deployed page, not the local one.

**The panel has to clear its own launcher, and the measurement said it did.**
The phone tier originally stopped one button-height off the floor, which laid
the panel's lower edge across the launcher — **and the launcher is the close
button**, so on a phone the panel covered the only discoverable way out of
it. It passed every fits-in-viewport check; it was caught in a screenshot.
Both tiers now clear two button-heights plus a gap.

**The transcript survives a page change** (`rl-saathi` in `sessionStorage`,
last 40 messages), because several answers link elsewhere on the site and
losing the thread on arrival would make it feel broken. It does **not**
re-open itself — the conversation is there when the launcher is next
pressed. `rl-saathi-seen` retires the gold pip on the launcher.

**Nothing is ever written as markup.** Message bodies go in through
`textContent` and the action links are built as elements, so a visitor typing
a tag sees a tag. The only `innerHTML` in the file is static chrome and the
inline icons.

**The telephone number and email come from `site-settings`** through the
page's own memoised `RL.get`, so this shares the footer's request rather than
making a thirteenth, and cannot drift from it. The constants at the top of
`saathi.js` are the offline fallback; when the CMS differs, the answers are
patched by string replacement so the number cannot be missed in one of them.

**THE LAUNCHER'S MARK IS THE CLIENT'S ARTWORK, AND IT IS A WHOLE BUTTON.**
`assets/saathi-icon.png` (192x192, 24KB) is their robot supplied as a blue
disc with the robot knocked out of it, so it is sized to **fill** the
launcher rather than sitting inside it as a glyph; the navy ground beneath
is seen only in the open state, behind the cross. The same mark is the
panel header's avatar — it is the bot's face, and a different glyph there
would read as a different thing.

- **The white ground could NOT simply be keyed out, because the robot
  itself is white.** The alpha is a geometric disc instead: the artwork was
  cropped to the circle's own bounding box, squared on its centre, and
  masked with a 4x-supersampled ellipse. Corners read alpha 0, the centre
  the artwork's own `#0063FF`.
- **A re-crop means redoing that mask**, not just swapping the file: a
  source with a different margin around the disc will not line up.
- **The unread pip is positioned for a CIRCLE, not a square.** At
  `top/right:2px` it sat on the corner of the button's *box*, which on a
  round button is outside the disc — it read as a blemish stuck to the edge.
  `11%` puts it inside the circumference at 45 degrees and holds when the
  button steps down to 46px. Its ring is white because the mark is blue; it
  was navy, from when the launcher itself was.
- **The blue is the client's, not the site palette.** A bright blue disc
  above a WhatsApp green one is two borrowed brand colours stacked in the
  corner of a navy-and-gold page. That was the instruction; if it ever
  wants softening, the mark is one file.

**IT ANSWERS SMALL TALK, AND THAT IS NOT DECORATION (16 Nov).** The first
thing many people type into a chat window is not about property —
*how are you*, *are you a bot*, *what can you do* — and answering those with
"that one is beyond me, here is a telephone number" is a cold start that makes
the rest of the conversation less likely to happen. Thirteen conversational
intents now sit between `greet` and `projects`: `howareyou`, `identity`,
`bot`, `capabilities`, `ack`, `present`, `joke`, `maker`, `language`,
`callme`, `browsing`, `complaint` and `rude`.

- **Every one of them still ends by offering something useful.** They are one
  civil exchange, not a personality, and **none of them invents a fact about
  the company** — where a question has a real answer the bot does not have, it
  still hands it over.
- **`bot` answers honestly**: a simple matcher, and not the authority on
  price, availability or paperwork. That is the one piece of small talk worth
  getting right on a property site.
- **`who are you` moved from `about` to `identity`.** In a chat window that is
  a question about the bot, not about the developer; `about raajlaxmi` and the
  company words stayed behind.

**AN `exact` LIST MATCHES THE WHOLE MESSAGE, BEFORE ANY SCORING.** It is the
only way to answer "no" without also answering "no parking": a one-word reply
is an acknowledgement, the same word inside a sentence is not. Keyword scoring
cannot tell those apart, and marking such words strong makes it worse. `ack`
is built entirely from it and carries no keywords at all — which is why the
compile step tolerates a missing `k`.

**THE TEST ASSERTS THE INTENT, NOT "DID THE FALLBACK FIRE".** 51 cases:
the small talk, every property intent as a regression, and four that must
still reach the fallback. It is what caught `bye` — **three letters, scoring 1
against a floor of 2, so a bare "bye" had ALWAYS fallen through to "that one
is beyond me"**, the worst possible answer to someone leaving. That was
pre-existing and no earlier test had asked.

**TIES GO TO THE EARLIER INTENT, AND THAT IS LOAD-BEARING.** `match()` keeps
the first intent to reach the top score, so the array's order is a priority
list. Two cases were decided by it: `price` sits before `config`, so "2 bhk
price" answers with the price rather than the sizes — which needed the
`1 bhk` / `2 bhk` *phrases* dropping from `config`, since a phrase scores 4
and was winning outright. And `soldout` sits before `amenities`, so
"parking available" was answered with sold-out copy until the amenity words
were marked strong. **Both read as passes in a test that only checks for the
fallback**; assert the intent itself.

**To add an answer**: one entry in the `FAQ` array in `assets/saathi.js` —
`{id, k:[keywords], a:'answer', act:[[label, href]], chips:[…]}` — plus an
entry in `CHIP` for any new chip label. Nothing else, and no HTML to touch.

Verified at 1440x900, 844x390, 420x880, 390x844, 360x640 and 280x653: the
launcher stacks 11px above the WhatsApp button and lifts with it, the panel
fits the viewport and clears the launcher at every size, the launcher is the
topmost element at its own centre while the panel is open, every chip the bot
offers is answerable, genuinely unknown questions reach the fallback with the
number, the mobile sheet hides both, and there is no horizontal overflow and
no console error anywhere.

**Site settings.** A singleton (`site-settings`) holding the **social handles**
and the footer's telephone, email, address and copyright line. Its block is
identical in all eleven files that have a footer and reads one document, so the number that used to
be typed into every footer is now edited once. The four social icons were
hard-coded with `href="#"`; they are now drawn from the CMS — the SVG paths live
in an `ICON` map in that block, so adding a network is one entry there plus one
option in the schema — and **the row removes itself when no handles are set**,
because four buttons that go nowhere are worse than none.

**The collection strip reads its telephone and email off this document too
(16 Nov).** "Can't Find What You're Looking For?" printed
`+91 22 4123 4567` and `connect@raajlaxmi.com` — **both invented for the
build, both live for months, and neither matching the footer a few hundred
pixels below them.** Nothing was watching them because they were plain text in
the markup of three files, so nobody noticed when the real numbers were filled
in everywhere else.

- The markup now carries the real pair as the offline fallback, and `paint()`
  overwrites it from `phone` / `email` on `site-settings`.
- **The text sits in its own `<span class="v" data-cc="…">`** rather than as a
  bare text node beside the icon, because there has to be an element to set
  `textContent` on. Keyed on `data-cc`, never `:nth-child`, so reordering the
  two in the markup cannot swap them.
- **The block stays identical in all twelve files** although only the three
  collection pages have a `.col-contact` — the usual arrangement.
- **`project.html` still carries the invented pair** at its `.pd-cline`,
  marked `<!-- PLACEHOLDER: direct line and agent are invented -->`. That one
  is a different component and is effectively unreachable: with a `?p=` the
  line is either the project's own `phone` or removed outright, and the bare
  `project.html` fallback is the Romal Kirti mock that nothing links to. It is
  left because the whole of that mock is stale, not just the number.

**Contact page.** A singleton (`contact-page`) covering the label, heading (plus
its gold phrase), intro, the four info boxes, the enquiry card's wording, the
thank-you state and the location card. Each info box swaps between a link and a
paragraph depending on whether the CMS gives it a `link`, so "Business Hours"
stays plain text while "Call Us" becomes a `tel:`. The **map pin is a geopoint**
that drives both the directions button and the embedded Google frame.
**The enquiry card's three dropdowns are NOT on this document** — Property,
Location and Budget read the hero's own lists off `homepage`; see *The enquiry
card asks the hero's three questions*.

**THE OFFICE ADDRESS CHANGED ON 16 NOV** (`c853a54`) and nothing in this file
recorded it until now. It is:

> Building No. 1, Kala Kutir, Office 1 & 2, Dongarpada Rd, Y. K. Nagar,
> Virar (West), Vasai-Virar, Maharashtra-401303.

It went into the footer's `.ft-cx` fallback in the **eleven files that have a
footer** (`project.html` has none, so it was untouched by that half of the
commit), into `contact.html`'s *Visit Us* card as well, and into both
`seed-rest.mjs` and `seed-legal.mjs`. **The markup is only the fallback**: `address` on
`site-settings` and the `items[]` *Visit Us* box on `contact-page` are what a
visitor actually reads, so **check those two documents carry the new address
too**, or the site will keep printing the old one.

Two things the move left behind, both content rather than code:

- **`locationText` still reads "On Station Road, a short walk from Virar
  station."** The new address is on Dongarpada Rd. The commit changed the
  address strings and not this sentence, so the location card now describes a
  different street from the one above it.
- **The map pin was not moved.** `geo` is still
  `lat 19.5754841, lng 72.8032063` in the seed, which was the old office. It
  drives both the Get Directions button and the embedded Google frame, so if
  that pin is stale the button sends people to the wrong building — the one
  failure here that actually wastes somebody's afternoon. Verify it against
  the live `contact-page` document before launch.

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
  is ever wanted back without the visible text, the idiom is the `.sv-sr` rule
  on `services.html`: an `<h1>` clipped to a 1px box. That page's own `<h1>` is
  exactly this, since its film band carries no words either.

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

**On a phone the hero search is a CAPSULE that opens on tap.** Once the videos
started playing on handsets (above), the form was the thing covering them:
measured open, it is 296px tall — **35% of the hero at 390x844 and 46% at
360x640**. So on the one screen that exists to show a film, half of it was a
control panel. It is now a 55px pill at the foot of the hero — **7% / 9%** —
carrying a search mark, a label and a chevron; tapping it opens the real form
upwards from there.

- **The phone tier also changed `margin:auto` to `margin-top:auto`** on
  `.hero-content`, pinning it to the foot instead of centring it. Centring is
  what put the panel across the middle of the picture.
- **The fields are `display:none` when closed**, not visually hidden, so they
  leave the flex column entirely and the pill collapses to its own height.
- **`display` cannot transition**, so the fields carry a staggered
  `@keyframes hsIn` that runs on appearing. That is also what tells the eye the
  panel grew out of the pill.
- **The label reports the current choice** (`2 BHK · Virar`) rather than always
  reading "Find your home" — collapsed, it is the only thing saying what the
  form is set to, and a control that hides its own state is a trap. A field the
  script has hidden is skipped, since that is not a choice anyone made.
- **The breakpoint lives only in CSS.** The JS toggles a class; `.hs-peek` is
  `display:none` on a desktop, so none of it can be reached there. Nothing
  duplicates the media query.
- Closes on a tap outside, on Esc, and on tapping the pill again. `pointerdown`
  fires before the click that opens it and the pill is inside the form, so the
  two cannot race; a native select's dropdown is not in the document, so
  choosing an option does not close the panel under it.

Measured at 390x844, 360x640 and 412x915: closed 55px, open 343px and clear of
the navbar at all three, no overflow, no console errors. Desktop unchanged —
capsule hidden, form 85px at 1440 with all three fields.

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
that is already showing a picture, and is **skipped on data-saver connections,
on a link too slow to carry that particular file, and under
`prefers-reduced-motion`**, removing itself if the file errors or autoplay is
refused. The photograph is always painted first, which is what every one of
those cases falls back to. The CSS is **`index.html`-only** — `.hero-vid` /
`.cms-vid` appear in no other file — so unlike the rest of the shared
stylesheet there is nothing here to sync.

**It no longer skips phones, and the threshold is now per-file.** Until 5 Nov
it carried a flat `matchMedia('(max-width:620px)')` skip, so **no handset ever
saw any of the three videos** — which was the client's complaint. That rule was
written when the hero slot held a 265MB 4K master and it judged the *device*
rather than the *file*; a phone on wifi plays a 0.59MB clip perfectly well.
The fifth argument `heavy` replaced it, because the two live files are not
comparable:

| | file | size | skips on |
|---|---|---|---|
| About plate | `About (web).mp4` | **0.59 MB** | 2G, data-saver |
| Hero | `Homepage video.mp4` | **15.06 MB** @ 4.64 Mbps | 2G, **3G**, data-saver |

The hero cannot play in real time on a 3G-class link at all. Fetched there it
would never reach the reveal gate, would be dropped at 20s by the rule below,
and would have spent several MB of someone's mobile data to show them nothing;
skipping it outright is the same outcome without the bill. **Re-encode the hero
lighter and the `true` at its call site should come off.**

`navigator.connection` does not exist on iOS, so neither connection test fires
there and iOS always gets the video — correct, since the reveal gate then
decides. Measured on a 390x844 iPhone viewport against live Sanity data:
4G → both mount; 3G → About only; 2G, data-saver and reduced-motion → neither.

### The hero has a PORTRAIT film for phones

~~On a phone the hero's footage is cropped hard~~ — **fixed on 6 Nov.** The
desktop file is 1280x720 and an upright phone's hero box is ~489x961, so about
a quarter of the frame width survived and the burnt-in title card arrived as
*fragments of letters* down both edges. The client supplied a portrait cut and
it is now used on phones.

`assets/hero-mobile.mp4` — **720x1280, 24fps, 21.7s, 3.86 MB at 1.49 Mbps**,
with `assets/hero-still-mobile.jpg` (44 KB) as its first frame.

**THE TEST IS ORIENTATION, NOT WIDTH**, and that is the one thing to get right
here. `matchMedia('(orientation:portrait) and (max-width:900px)')`:

- a **handset in landscape is 844px wide and 390px tall** and wants the WIDE
  film; a width-only query would hand it the portrait one and crop it just as
  badly the other way. Verified at 844x390: it mounts the Sanity desktop file.
- **tablets in portrait are included on purpose.** At 768x1024 the portrait film
  keeps 75% of its height where the landscape film keeps 58% of its width, so it
  is the better of the two there as well.
- **The CSS and the JS carry the same query and must agree.** `.hero-media`
  swaps its background to the portrait still inside that media query; the script
  picks the film with the identical `matchMedia`. Change one, change the other.

**The still had to change with it.** `hero-still.jpg` is a frame of the 16:9
film, so under a portrait video it was a hard crop of a *different shot* — the
dissolve would have been a scene change. The mobile still is the portrait film's
own first frame, which is the same rule the desktop still already follows.

**The file in `assets/` is the FALLBACK; `heroVideoMobile` on the `homepage`
document overrides it.** That is the site's usual rule — the committed file is
the design fallback and the CMS is the real content — and it means this works
with nothing uploaded while the client can still replace it from the Studio.
The schema field exists (`Background video (phones, held upright)`); **the
Studio needs a redeploy (`cd studio && npm run deploy`) before it appears in the
form**, though the site reads it either way.

**The film is chosen ONCE, at paint time.** Rotating a phone after load keeps
the film it has already started buffering rather than discarding it and fetching
another 3.9 MB, which is what anyone on a metered connection would want.

**Re-encoded from a 109 MB master**, 1080x1920 at 32.3 Mbps with an audio track
on a video the site plays muted. Downscaling beat a higher CRF on this footage —
it is dense rendered skyline, so the bits go into detail that a phone cannot
show anyway:

| | size | bitrate | SSIM |
|---|---|---|---|
| 1080x1920 CRF 26 | 6.20 MB | 2.40 Mbps | 0.981 |
| 1080x1920 CRF 28 | 4.89 MB | 1.89 Mbps | 0.978 |
| 810x1440 CRF 24 | 4.69 MB | 1.81 Mbps | 0.979 |
| **720x1280 CRF 24 (shipped)** | **3.86 MB** | **1.49 Mbps** | **0.978** |
| 720x1280 CRF 26 | 3.06 MB | 1.18 Mbps | 0.974 |

720p CRF 24 is the knee — the same SSIM as 1080p CRF 28 for a megabyte less —
and it lands within 2% of the desktop film's own size and bitrate, so whatever
connection carries one carries the other. **CRF 26 is the lever** if 0.8 MB ever
matters more than the last 0.004 of SSIM.

**The burnt-in title card was cut, matching the desktop film.** "EVERY GREAT
JOURNEY BEGINS WITH A VISION." runs **9.85s–15.15s** in this render — measured
by sampling the frame band at 0.1s steps, not guessed, and ~0.3s earlier than
the desktop file's 10.3–15.4, so **do not reuse those numbers on a new render**.
The cut is 9.8–15.2, taking 27.1s to 21.7s. Rebuild with:

```
ffmpeg -ignore_editlist 1 -i <source> \
  -vf "select='not(between(t,9.8,15.2))',setpts=N/FRAME_RATE/TB,scale=720:1280:flags=lanczos" \
  -an -c:v libx264 -crf 24 -preset slow -movflags +faststart -g 48 \
  -pix_fmt yuv420p assets/hero-mobile.mp4
```

Keeping the card would have been defensible — on a portrait phone it renders
properly rather than as fragments — but the desktop film has it cut, and one
brand showing two different things by viewport is worse than either. Putting it
back is one edit: drop the `select`/`setpts` pair.

**`.gitignore` only blocks root-level `*.mp4`**, so this commits and ships with
the repo, as `assets/services-film.mp4` already does. It adds 3.9 MB to what
Netlify clones per deploy.

**One property worth knowing: with Sanity unreachable there is no hero video at
all**, on either orientation. The asset fallback lives inside `paint()`, which
only runs once the home query resolves. The still underneath is what shows, and
that is now correct in both orientations — which is the part that matters.

Measured at 390x844, 360x640, 412x915, 280x653 and 768x1024: the portrait film
mounts, reveals and plays (`readyState` 4, `paused:false`), with the portrait
still behind it. At 844x390 and 1440x900: the desktop film, unchanged. Under
`--force-prefers-reduced-motion`: no video at either orientation. No horizontal
overflow and no console errors anywhere.

The About plate has the opposite property — it is `object-fit:contain` and its
file is the plate's own ratio, so it shows whole on a phone with nothing cropped.

**The connection and file-size refusals are GONE (5 Nov), at the client's
explicit instruction.** The video is fetched on every connection, revealed on
the first decoded frame, and never taken away again.

What was removed, all of it from `mountVideo()`:

| removed | what it did |
|---|---|
| `max-width:620px` | no handset ever saw any video |
| `saveData` | skipped on data-saver |
| `/2g/` on `effectiveType` | skipped on a 2G-class link |
| `heavy` + `3g` | skipped the hero on 3G |
| 20s give-up | deleted a video that had not "earned" the reveal |
| three-stall `retire()` | took a *playing* video away again |
| the reveal gate | `canplaythrough`, buffered runway, or N seconds of unbroken playback |

They all made the same trade, and it was right once: they were written for a
**265MB 4K master**, where fetching the file genuinely could cost a visitor
more than it gave them. The files are web encodes now — the hero is 3.94 MB at
1.50 Mbps, the About plate 0.59 MB — and at that size the honest answer is to
try, show it the moment there is a frame, and leave it alone. The gate was
also what made the client see a static photograph on their phone.

Measured locally against live Sanity data at 390x844, after:

| link | revealed | then |
|---|---|---|
| 12 Mbps | 5.2s | stays |
| 4 Mbps | 15.6s | stays |
| 2 Mbps | 13.0s | stays |
| 1.2 Mbps | 23.4s | stays |

Before the change, 4 / 2 / 1.2 Mbps all ended on the still.

**`prefers-reduced-motion` is the one refusal kept**, and deliberately: it is
not a guess about someone's bandwidth but an explicit instruction from their
operating system not to show looping motion. Verified still skipping — 0 videos
mounted under `--force-prefers-reduced-motion`.

**What remains does not withhold the video.** It still pauses off-screen and on
a hidden tab (battery, and it resumes); a genuine `error`, or a
`NotAllowedError` from `play()`, still removes the element, because in both
cases there is nothing to show and nothing to wait for — iOS Low Power Mode is
the real case. The photograph underneath is never touched, so a failed file
leaves a still rather than a black box.

**The accepted cost:** a visitor on a poor connection now gets the video late,
and possibly stuttering, instead of a clean still. That is the trade that was
asked for. If it ever needs reversing, the whole of it is in `mountVideo()`.

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

**The still underneath is a FRAME OF THE FILM, and that is a fix not a
flourish.** `heroImage` is still empty on the `homepage` document, so the
fallback comes from the markup — but that used to be a **487KB base64 night
skyline assigned from a script at the foot of the body**, under a film that is
a sunlit interior. The dissolve was a change of scene, and a visitor whose
video never arrived was left on an unrelated blue cityscape. That is the
"stale blue background" the client reported on 5 Nov.

It is now **`assets/hero-still.jpg`** (1280x720, 64KB, a frame of the film),
set in the stylesheet on `.hero-media`. A video that cannot load now costs the
motion and nothing else. `paint()` still overrides it the moment the CMS
carries a `heroImage`.

**Removing the blob took `index.html` from 884KB to 220KB** — a 75% cut, and
not cosmetic: `mountVideo()` does not start fetching until `load`, so on a
phone at 4 Mbps the document now arrives in ~0.4s instead of ~1.7s and the
film gets that time back to buffer in. This closes item 2 of *Performance →
Still to do*.

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
  full-width stage.** The reason used to be the rotating seal: it is a *sibling*
  of `.why-feature`, because the plate is `overflow:hidden` and the seal
  overhung its corner, so it only stayed pinned there while the stage was
  exactly the plate's width. **That seal was removed on 9 Nov at the client's
  request** — the plate carries no mark now — but keep the stage narrow anyway,
  because it is also what gives the 2:1 crop its width.
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
and the ratio still exactly 2.000 after the seal was removed.

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

**`stages` is the field that decides which listing a project appears on, and
it is an ARRAY (7 Nov).** `completed` / `ongoing` / `redevelopment`, tick as
many as apply, at least one required. `status` is only the badge text on the
photograph and is optional: blank falls back to the first listing's label. That
split is what lets a Completed project carry a "Ready Possession" badge.

**It was a single-value radio until 7 Nov, and the reason it changed is worth
keeping.** The client asked for Krishna Niwas and Shanti Niwas on *both*
Ongoing and Redevelopment. That is not a slip: **"Ongoing" says how far built a
project is and "Redevelopment" says what kind of project it is** — two
different questions that the one radio had been conflating, so a redevelopment
under construction had to give up one of its two true answers. Those two
properties are the only ones in both lists today.

- **The old `stage` string is kept, hidden and read-only.** Deleting it would
  throw away the only record of how each project was filed before the change,
  and an unknown field left in a document shows as a schema warning on every
  edit. `stagesOf(p)` still falls back to it, then to `status`, so a document
  created by an older path or restored from history lands on the right listing
  instead of vanishing.
- **The Studio folder filter is `$stage in stages`, not `==`** — a project in
  two listings has to appear in both folders. The folder is a view of the site,
  not a filing cabinet with one slot per item.
- **The `project-by-stage` template seeds the ARRAY** (`{stages: [stage]}`), so
  creating a project inside a folder still files it automatically; tick a
  second box if it belongs on two pages.
- A **Not yet filed** folder lists anything with neither field set, so a stray
  document can't go invisible.
- Renaming any of the three values means changing it in `STAGES` in the config
  *and* in `STATUS` / `STAGE_LABEL` / `stagesOf` in all three pages.

`studio/scripts/stages-migrate.mjs` did the move. **It patches drafts as well
as published documents, and that is not optional** — see *Drafts shadow the
live site*.

**Drafts shadow the live site, and this bit twice now.** A token-authenticated
`getCliClient()` query returns drafts; the public API does not. When the
listings were migrated there were **six unpublished drafts**, five of them
minutes old — the client was refiling by hand in the Studio at the same moment.
Two consequences, both of which any future script has to handle:

- **Patching only the published document is not enough.** The draft would still
  carry the old field, so the next press of Publish would quietly undo the
  change. `stages-migrate.mjs` patches a project's draft to match whenever it
  patches the project.
- **An ORPHAN draft — one with no published twin — must be left alone.** It is
  a document that has never been on the site, so it is somebody's work in
  progress. There is one today: `drafts.26839014-0fed-4e80-9bb1-5ffe9f513cac`,
  a **duplicate Rajlaxxmi Park** created at 10:40:39 on 7 Nov and untouched two
  seconds later. It looks like an accidental create. Publish or delete it in
  the Studio; nothing automated should adopt it.

This is the same trap recorded under *An unpublished project is the same as no
project* — a draft is invisible to visitors, so the two views of the dataset
disagree, and `*[_id in path("drafts.**")]` is what settles it.

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
**The id must be set in thirteen places**: `studio/.env` and the `SANITY` block in
the `<head>` of each of the twelve HTML files. That is more files than before but
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

- **`seal-top.png` is no longer referenced by anything** (259KB). Section III's
  copy of it went on 9 Nov and Section IV's — the mark over the team photograph
  — went the same day, both at the client's request. The file is still on disk
  and still ships with the repo; it is client artwork, so it was left rather
  than deleted, and `git rm` is all it takes.
- **`seal-bottom.png` (716KB) is no longer referenced either, since 12 Nov.**
  The client asked for the Est. 2004 medallion beside the Section IV closing
  quote to go, so `.seal why-seal2` and its `<img>` came out of `index.html`.
  **No seal is drawn anywhere on the site now.** Both files are still on disk
  and still ship — client artwork, the same call as `sold-out.png`.
  - **`.why-quote` had to become one column with it.** It was
    `grid-template-columns:1fr auto`, the second track being the medallion;
    an empty track still contributes its `gap`, so the quote would have sat
    off-centre under a full-width rule. It is `1fr` and centred now, which is
    what the phone tier below it already did — the two agree instead of
    disagreeing. **That rule is in the shared block, so the change went into
    all twelve files**; only `index.html` has the markup.
  - **The `.seal*` rules are now dead in all twelve files** and were left
    there, the same call as `.hs-field > label` and the phone tier's
    `.sv-slot` — a selector that matches nothing in a block that must stay
    byte-identical costs nothing. `.seal-face`, `.seal-spin.auto` and
    `.seal-spin.scroll` were dead long before this.
- Committed and referenced: `seal-bottom.png`, `sketch-tower.jpg`, `house-sketch.jpg`, `floor-plan.jpg`, `floor-plan-l.jpg`, `assets/project-blueprint-left.png`, `assets/project-floral-right.png` (760x424, **no alpha** — every use of it is `mix-blend-mode:multiply` over a cream ground, on the three collection pages, `testimonials.html` and now the owner detail panel on `index.html`).
- `assets/contact-render.jpg` is the faded tower render at the foot of `contact.html`'s left column (1088x460, 60KB, JPEG q88). Its ground is `#F8F6F2`, the same as the section, so it needs no band or border — see *The left column: four cards under the heading*. It came in at 1088px and displays up to 922 CSS px, so it is soft on retina; a wider export would fix it.
- `assets/saathi-icon.png` is Saathi's robot mark (192x192, 24KB, **real alpha channel**), cut from the client's 612x612 artwork. Unlike `oc-received.png` its ground was **not** colour-keyed — the robot is white on a blue disc, so keying white would have eaten the robot. The disc was located by its own bounding box and the alpha is a supersampled ellipse. See *Saathi, the rule-based assistant*.
- `assets/oc-received.png` is the **OC RECEIVED** mark on every collection card (272x262, 21KB, **real alpha channel**). Keyed out of the client's flat red-on-white original by colour-to-alpha against white, which un-composites the anti-aliased edges instead of leaving a halo, then quantised to 128 colours; verified against the source by recompositing over white. Its ratio is declared in the CSS as `aspect-ratio:272/262`, so a re-crop means changing that line.
- `assets/sold-out.png` (506x294, 24KB) was the SOLD OUT stamp and is **referenced by nothing** since 9 Nov. Client artwork, so it was left on disk and still ships — the same call as `seal-top.png`. `git rm` is all it takes.
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
- The About plate is `assets/about-plate.jpg` — **the client's gold wireframe
  elevation on black since 16 Nov** (805×1062). It was an excavator on a blue
  site (810×1212), which is what a visitor saw for the second or two before
  the CMS video arrived, and the two had nothing to do with each other. The
  old file is `git show 4c31db8:assets/about-plate.jpg`. It is set as
  `background-image` on `.ab-photo` in CSS.
  - **IT IS PADDED TO THE PLATE'S RATIO, NOT CROPPED TO IT**, and that is the
    one thing to preserve if it is ever replaced. `.ab-photo` is `5/6.6`
    (0.7576) with `background-size:cover`, and the artwork came in at 0.6685 —
    `cover` would have taken roughly 12% off the top and bottom, which on a
    building is the roof and the car park. Its ground is pure `#000`, so 47px
    of its own black was added down each side to bring it to 805×1062 (0.7580,
    a sub-pixel difference) and the artwork itself was never resampled.
    **A replacement at any other ratio will crop** — pad it the same way.
  - It is 1062px tall against a plate that displays at up to 600 CSS px, so it
    is **slightly under 2x on a retina screen**. Upscaling would have added no
    detail; a taller export from the client would. Same note as
    `contact-render.jpg` and the associates plate. It used to be copied off the hero by the About IIFE; that JS is gone, so **don't reintroduce an inline `style.backgroundImage` there** — it would override the stylesheet. The one deliberate exception is the home-page content block, which sets an inline background **only when the `homepage` document actually carries a photograph**; with the field empty the stylesheet keeps this file. It is now only the **fallback under the CMS video** — the `homepage`
  document carries a 630x830 `aboutVideo` and no `aboutImage`, so this file shows
  only while the video is loading, on phones, on data-saver, under
  `prefers-reduced-motion`, or if the file fails. The plate keeps the `5/6.6`
  ratio exactly (it is the video's ratio) and is sized by height — see *The About
  section holds one screen*.
- `quote-strip.png` (the Vikram Raajlaxmi quote banner) has been **deleted** — Section III's `.sp-quote-img` figure was removed earlier. Recoverable from git if the quote is ever wanted back.
- The root-level `Generate_*.jpeg` / `download.png` / `Minimalist_*.jpeg` source art has been **deleted** — it was working material, not site assets. `footer.png`, `Services_start.png`, the seals and the sketches are all still referenced and remain.
- **Favicon**: `favicon.ico` (16/32/48, at the repo root so browsers find it unprompted) plus `assets/favicon-32.png`, `assets/favicon-192.png` and `assets/apple-touch-icon.png` (180). All twelve pages link them from `<head>`, right after `</title>`. Cut from the logo's building glyph with its dark ground **keyed out to transparency** (unmatted, so no dark fringe survives onto a light tab bar), squared up and centred with ~12% margin — the mark has to survive being read at 16px, so it sits deliberately large in frame.
- The logo ships as **two external PNGs**, `assets/logo.png` (brown/charcoal ink, for ivory grounds) and `assets/logo-light.png` (gold/cream ink, for the dark navbar **and the footer** — `.ft-mark`, which used to be the word RAAJLAXMI set in Cinzel with a tagline span under it; the artwork already carries both, so the text version was removed), ~14KB each with a transparent ground.
  - **Both were re-cut on 12 Nov from the client's `main-loggo.png`** (1157x291, at the repo root, untracked working art). That file is the LIGHT-ink version only — gold `#C89747` wordmark with a near-white `#FEFEFE` tagline — so it is `logo-light.png` as supplied, and `logo.png` is the same artwork recoloured: the wordmark to `#A96431` and the tagline to `#171312`, which are the inks the previous over-ivory logo used, so nothing else on the page had to move. The building glyph (everything left of x=292, the gap between glyph and wordmark running 263–321) is untouched in both.
  - **The recolour works because the artwork is alpha-antialiased**, not blended against a background: the wordmark is one exact RGB over varying alpha, so mapping that colour and keeping the alpha re-inks it with no halo. Re-cutting from a future master means checking that still holds.
  - **The `width`/`height` attributes had to change with the files** — 966x240 to **1157x291**, four occurrences per page (three on `project.html`, which has no footer), all twelve files. Every logo is sized by `height` with `width:auto`, so the attributes only reserve space; left stale they would have reserved the wrong box.
  - **The favicons were NOT re-cut.** They are the building glyph, which is unchanged in the new artwork, so they still match. The nav carries both stacked inside `.brand`; `.nav-wrap.on-light` crossfades between them via opacity, replacing the old `filter:` hack. Regenerating either from a new master means keying out its flat background and re-cutting both variants — edit them as a pair or the two states drift.

## Known content placeholders

**`projects-ongoing.html` / `projects-redevelopment.html`** are copies of `projects.html` with four differences: the `<title>`, the `.col-head` label/title/intro, `STATUS` hard-coded instead of read from the URL, and the Western Line banner swapped: the ongoing page carries its own (`assets/projects/western-line-ongoing.jpg`, "Rising Along the Western Line" — Vasai / Virar / Saphale, five projects), and the redevelopment page carries the **associates plate** (`assets/projects/associates.jpg`) in that slot instead — it has no corridor banner of its own. Both banners are client artwork used whole, same rules as the completed one: the band takes the artwork's ground colour so it dissolves, and below 760px it scrolls sideways at a fixed 900px because the station names are painted in. The redevelopment page additionally carries **placeholder cards** and one extra rule in its Sanity handler — `if(!result.some(inStatus)) return;` — so the live list is ignored while it contains no redevelopment project, which would otherwise blank the page. Publish one with that status and the placeholders are never seen again.

- **The dataset is the client's own**, with real photography; the seeded
  placeholders are long gone. For the live counts see *What the CMS holds* in
  the handover at the top, and **re-run them rather than trusting any number
  written down here** — the count has gone 16 → 14 → 16 across ten days, and
  the client refiles as well as adds and deletes.
- **The Redevelopment page's placeholders are no longer reachable** (four
  projects are filed there since 7 Nov), but the markup and the
  `if(!result.some(inStatus)) return;` guard both remain and are still
  correct: with Sanity unreachable the placeholders are what shows, which is
  the same fallback every other page makes.
- **`Raajlaxmi Tower`'s slug is the literal string `Raajlaxmi Tower`** — a capital and a
  space, not kebab-case — so its detail link is `project.html?p=Raajlaxmi%20Tower`. It
  resolves, but it is the only slug in the dataset like that and it should be corrected to
  `raajlaxmi-tower` in the Studio. Nothing in the code needs changing when it is: both the
  cards and the banner hotspots read the slug live.
- ~~**`Midas Heights` is painted on the Western line banner but has no `project` document**~~
  — moot since 12 Nov: the mark is covered by `.cor-mask` and its hotspot is
  gone. Publishing the project would NOT bring the logo back; the patch would
  have to be removed first.
- ~~**No project is filed as Redevelopment yet**~~ — **four are, since 7 Nov**, so that page's three placeholder cards (`[Society name]`, `[Locality]`, `[n] BHK`) are never shown to a visitor again. The markup and the `if(!result.some(inStatus)) return;` guard are both still in the file and still correct: with Sanity unreachable the placeholders are what shows, which is the same fallback every other page makes.
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
- `project.html` carries its own placeholders, each marked with a `PLACEHOLDER` comment: **every figure in the fact bar** (~1,15,000 sq.ft, 8 towers, ~640+ units, Completed) is from the client's mock and unverified, as are the landmark distances and the direct line. Its five gallery shots are seeded `picsum.photos/seed/rl-rk-*` placeholders. **Three projects now carry a `brochure` PDF** (Nakshatra Auris, Rajlaxxmi Park, Shanti Niwas), so those show "View Brochure"; the other twelve still fall back to "Request Brochure" pointing at the enquiry form.
- **Romal Kirti has been DELETED from the dataset** (gone as of 6 Nov; it was published on 29 Oct). `project.html?p=romal-kirti` now resolves to nothing, and the hand-written fallback in `project.html` — which is still that property, and still the unverified mock content — describes a project the client no longer lists. The fallback only shows when the page is opened with **no** `?p=` at all, which nothing on the site links to, so this is a latent oddity rather than a live bug.
- **Counts on 9 Nov: 15 published projects — Completed 9, Ongoing 4, Redevelopment 3.** Krishna Niwas is in two listings, so those add to 16. Nothing is unfiled. Re-check rather than trusting it: the client adds, deletes and refiles, sometimes while you are working. (Seven still carry a stale `soldOut: true` in their data; the field is out of the schema and off the cards — see *Every collection card carries the OC RECEIVED mark*.)
- **Two badges disagree with their listing, and only one of them is a mistake.** Re-measured 9 Nov: **Shanti Niwas** is filed Redevelopment but its badge reads **Ongoing**, and **Shakun Solitaire** is Completed but reads **Ready Possession**. The second is the status/stage split doing exactly the job it exists for — a finished building that is ready to move into. The first looks like a leftover. Clearing `status` makes a badge follow its listing. (The older note here named Raajlaxmi Avenue and said both read "Completed"; that is no longer true — the client has edited these since.)
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
`seal-top.png` (259KB) and `seal-bottom.png` (**716KB**). Section III's copy was
both removed on 9 Nov, so **one remains** — `seal-bottom.png`, by the closing
quote in Section IV. `seal-top.png` is not requested by any page now. They sat
in Sections III and IV when this was written, well below the fold, and together they were ~975KB of decoration
competing with the first screen on a cold load. Nothing about how they look
changed.

### Still to do

1. ~~**`seal-bottom.png` is 716KB for a 620×620 mark**~~ — **moot since
   12 Nov.** The medallion was removed from Section IV at the client's
   request, so no page requests this file any more and the home page is 716KB
   lighter on a cold load. The file still ships with the repo; `git rm` on it
   and `seal-top.png` saves another ~975KB per deploy.
2. ~~`index.html` carries ~665KB of base64 (the hero JPEG)~~ — **done, 5 Nov.**
   The blob is gone and the file is **220KB**, down from 884KB; the still is
   `assets/hero-still.jpg`, a frame of the film, set from CSS. See *The still
   underneath is a FRAME OF THE FILM*. A further step to AVIF/WebP with
   `srcset` is still available but the 64KB JPEG is no longer the problem.
2b. ~~**THE HERO VIDEO IS STILL 15MB**~~ — **both halves fixed, 5 Nov.**
   The file is now **3.94 MB at 1.50 Mbps, 22.1s** (`homepage-web.mp4`,
   `file-602ab4bb…`), re-encoded at CRF 26 for SSIM 0.983 **with the burnt-in
   title card cut out** (original 10.3s–15.4s). Rebuild it with:

   ```
   ffmpeg -ignore_editlist 1 -i <source> \
     -vf "select='not(between(t,10.3,15.4))',setpts=N/FRAME_RATE/TB" \
     -an -c:v libx264 -crf 26 -preset slow -movflags +faststart -g 48 \
     -pix_fmt yuv420p homepage-web.mp4
   ```

   **The smaller file was only half of it, and not the important half.** See
   *The video buffers paused* below — the reason it failed had almost nothing
   to do with size.
3. Subset or self-host the Google Fonts (Archivo Black, Cinzel, Cormorant Garamond, Inter, Playfair Display — five families on every page).
4. Give the hero plate `fetchpriority="high"` to improve LCP.
