/* Add the missing ₹25 – 35 Lacs band to the hero's Budget dropdown.
 *
 * WHY. `heroBudgetOptions` jumped from "₹18 – 25 Lacs" straight to
 * "₹35 – 45 Lacs", so nothing covered ₹25–35 and a project priced in that gap
 * was unreachable by budget — Priti Darpan, at "26 Lacs Onwards", matched no
 * band at all. The bands are free text and nothing makes them contiguous, so
 * this will need checking again whenever they are edited.
 *
 * Run:
 *   cd studio
 *   npx sanity exec scripts/add-budget-band.mjs --with-user-token -- --dry
 *   npx sanity exec scripts/add-budget-band.mjs --with-user-token
 *
 * Idempotent: inserts nothing if a band covering the gap is already there.
 * It inserts in PLACE rather than appending, because the dropdown is read in
 * the order it is stored and a band out of sequence reads as a mistake.
 *
 * IT PATCHES THE PUBLISHED DOCUMENT AND THE DRAFT SEPARATELY, and that is not
 * tidiness. A token-authenticated `*[_type=="homepage"][0]` returns the DRAFT
 * when one exists, so the obvious version of this script wrote the band into
 * `drafts.homepage` and reported success while the live site saw nothing —
 * the same trap that has bitten this project twice before. Publishing the
 * draft instead is NOT a fix: the homepage draft currently also holds a
 * different About video and a mobile hero film that have never been
 * published, and pushing those live is the client's decision, not this
 * script's. So the published document is patched in place, and the draft is
 * patched too so the band survives whenever they do press Publish.
 */
import {getCliClient} from 'sanity/cli'

const DRY = process.argv.slice(2).includes('--dry')
const BAND = '₹25 – 35 Lacs' /* ₹25 – 35 Lacs, en dash, matching its neighbours */
const AFTER = '₹18 – 25 Lacs'

const client = getCliClient({apiVersion: '2023-05-03'})

/* "₹25 – 35 Lacs", "25-35 lacs" and "₹25 — 35 Lacs" are the same band */
const key = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

/* BY ID, never `*[_type=="homepage"][0]` — see the note above */
const ids = ['homepage', 'drafts.homepage']
let wrote = 0

for (const id of ids) {
  const doc = await client.fetch('*[_id==$id][0]{_id,heroBudgetOptions}', {id})
  if (!doc) { console.log(`\n${id}: does not exist, skipped`); continue }

  const options = Array.isArray(doc.heroBudgetOptions) ? [...doc.heroBudgetOptions] : []
  if (options.some((o) => key(o) === key(BAND))) {
    console.log(`\n${id}: already has the band, left alone`)
    continue
  }

  const at = options.findIndex((o) => key(o) === key(AFTER))
  if (at === -1) options.unshift(BAND)
  else options.splice(at + 1, 0, BAND)

  console.log(`\n${id}:`)
  options.forEach((o, i) => console.log(`  [${i}] ${o}${key(o) === key(BAND) ? '   <- added' : ''}`))

  if (DRY) { wrote++; continue }
  await client.patch(id).set({heroBudgetOptions: options}).commit()
  wrote++
}

console.log(
  DRY ? `\n--dry: would write ${wrote} document(s). Re-run without --dry to apply.`
      : `\nwrote ${wrote} document(s)`
)
