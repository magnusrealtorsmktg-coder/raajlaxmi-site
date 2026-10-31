/* Moves "Meet Our Owners" off the home-page document and onto its own.

   The section used to be a marquee between Why Raajlaxmi and Brands We Use on
   index.html, so its fields were a fifth group on the "homepage" singleton. It
   is its own page now (owners.html), so the content is its own document:
   "owners-page", of type ownersPage.

   This script is NOT one of the seeds. It does not createOrReplace and it
   invents nothing — it copies what the client has written across, then clears
   the old fields off the home page so the Studio stops reporting them as
   unknown. Safe to re-run: it refuses to overwrite anything already on the
   owners page, so a second run after an edit there is a no-op.

   The portraits are carried as image references, so nothing is re-uploaded and
   the hotspots survive.

     cd studio && npx sanity exec scripts/move-owners.mjs --with-user-token   */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

const home = await client.fetch(
  '*[_id=="homepage"][0]{ownersLabel,ownersHeading,ownersIntro,owners}',
)

if (!home) {
  console.log('no "homepage" document — nothing to move')
  process.exit(0)
}

const has = (v) => (Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim() !== '' : v != null)

/* Make sure the document exists before patching it, without touching it if it
   is already there. */
await client.createIfNotExists({_id: 'owners-page', _type: 'ownersPage'})

const page = await client.fetch('*[_id=="owners-page"][0]{label,heading,intro,owners}')

/* Only fields the owners page does not already have. Whatever is there was put
   there by the client and wins — this script is a one-way move, not a sync. */
const set = {}
if (has(home.ownersLabel) && !has(page.label)) set.label = home.ownersLabel
if (has(home.ownersHeading) && !has(page.heading)) set.heading = home.ownersHeading
if (has(home.ownersIntro) && !has(page.intro)) set.intro = home.ownersIntro
if (has(home.owners) && !has(page.owners)) set.owners = home.owners

if (Object.keys(set).length) {
  await client.patch('owners-page').set(set).commit()
  console.log(
    'owners-page ←',
    Object.keys(set).join(', '),
    set.owners ? `(${set.owners.length} ${set.owners.length === 1 ? 'person' : 'people'})` : '',
  )
} else {
  console.log('owners-page already has its content — nothing copied')
}

/* Clear the old fields. The schema no longer declares them, so left in place
   they show up in the Studio as "Unknown field found" on the home page. */
const stale = ['ownersLabel', 'ownersHeading', 'ownersIntro', 'owners'].filter((k) => k in home && home[k] != null)

if (stale.length) {
  await client.patch('homepage').unset(stale).commit()
  console.log('homepage → cleared', stale.join(', '))
} else {
  console.log('homepage had no owners fields left to clear')
}

console.log('\ndone. owners.html reads "owners-page" first and falls back to the')
console.log('home-page document, so the page was never empty in between.')
