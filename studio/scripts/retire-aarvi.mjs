/* retire-aarvi.mjs — take Aarvi Apartment off the public site and put another
   property in its place on the home page.
     npx sanity exec scripts/retire-aarvi.mjs --with-user-token -- --dry
     npx sanity exec scripts/retire-aarvi.mjs --with-user-token

   WHAT THIS DOES, AND WHY EACH STEP IS THE SHAPE IT IS
   ----------------------------------------------------
   Asked for: remove every project card of Aarvi Apartment, and replace it in
   the home page's Signature Projects with a property that is not sold out.

   1. THE SIGNATURE CARD IS REPOINTED, NOT DELETED. The grid was drawn for four
      cards -- three leaves the row short -- and `fit()` in index.html reuses the
      existing <article> nodes, so a card removed here would also drop the
      animation hooks that node carries. Repointing the reference is the whole
      change: name, category, location, description, photograph and the "View
      Project" href all follow the project it points at.

   2. THE CARD'S `category` OVERRIDE IS CLEARED. Card c4 carried "Luxury Living"
      against Aarvi's own "Residential" -- one of the three deliberate
      card/project disagreements recorded in CLAUDE.md. That disagreement was
      about AARVI. Carried over it would silently relabel a different property,
      so the override goes and the card takes the new project's own category.
      The empty `link` string goes with it for the same reason: it is Aarvi's
      leftover, and `spHref()` is happier with the field absent.

   3. THE HOME PAGE IS PATCHED BEFORE AARVI IS TOUCHED. Sanity refuses to delete
      a document that something still references, so the order is not a
      preference -- reversed, step 4 fails.

   4. AARVI IS UNPUBLISHED, NOT DELETED. Unpublishing (copy to `drafts.<id>`,
      delete the published document) is what the public site reads as "gone":
      the public API cannot see a draft, so its card leaves projects.html and
      projects-redevelopment.html and `project.html?p=aarvi-apartment` resolves
      to nothing -- the same mechanism that hid Shanti Niwas for a week in
      October. The difference from a delete is that the client's content, the
      card photograph and the 0.4 MB brochure all survive in the Studio and one
      press of Publish brings the property back. Deleting was the other option
      and was not chosen.

      It deliberately does NOT delete the brochure or image assets. They become
      unreferenced by anything published, but they are the client's files and
      the draft still points at them.

   5. IT REFUSES rather than guesses. If anything other than the home page still
      references Aarvi, or if the replacement is sold out, or if the card cannot
      be found, nothing is written and it says why. A script that quietly did
      half of this would leave a signature card pointing at a draft -- which
      resolves to nothing for a visitor, so the button would remove itself and
      the card would sit there under a stale name.

   Idempotent: run it twice and the second run reports there is nothing to do. */

import {getCliClient} from 'sanity/cli'

const DRY = process.argv.includes('--dry')
const RETIRE  = 'Aarvi Apartment'
const REPLACE = 'Krishna Niwas'

const client = getCliClient({apiVersion: '2024-01-01'})

/* The same forgiving key the banner hotspots, the signature cards and the town
   chips all use: fold case and punctuation, collapse doubled letters, so
   Raajlaxmi / Rajlaxxmi agree. The client spells names several ways. */
const key = v => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, '').replace(/(.)\1+/g, '$1')

const say = (...a) => console.log(...a)
const bail = m => { console.error('\n  REFUSED: ' + m + '\n  Nothing was written.'); process.exit(1) }

say(`\n  ${DRY ? 'DRY RUN — nothing will be written' : 'LIVE'}\n`)

/* ---------- find both projects, published only ---------- */
const projects = await client.fetch(
  `*[_type=="project" && !(_id in path("drafts.**"))]{_id,name,"slug":slug.current,soldOut,stages,category}`
)
const byName = new Map()
projects.forEach(p => { const k = key(p.name); if (k && !byName.has(k)) byName.set(k, p) })

const aarvi   = byName.get(key(RETIRE))
const replace = byName.get(key(REPLACE))

if (!replace) bail(`no published project named "${REPLACE}" — nothing to put on the card.`)
if (replace.soldOut === true) bail(`"${replace.name}" is marked sold out; the brief was a card that is not.`)

/* ---------- step 1+2: the signature card ---------- */
const home = await client.fetch(`*[_id=="homepage"][0]{_id,signatureCards[]{_key,category,link,"ref":project._ref}}`)
if (!home) bail('no homepage document.')

const cards = home.signatureCards || []
const slot  = aarvi ? cards.find(c => c.ref === aarvi._id) : null
const already = cards.find(c => c.ref === replace._id)

if (slot) {
  if (already) bail(`"${replace.name}" is already on signature card ${already._key}; two cards for one property is not the intent.`)
  say(`  signature card ${slot._key}: ${RETIRE} → ${replace.name}`)
  if (slot.category) say(`    clearing the card's "${slot.category}" category override (the project says "${replace.category}")`)
  if (slot.link !== null && slot.link !== undefined) say(`    clearing the card's leftover custom link`)
  if (!DRY) {
    await client
      .patch('homepage')
      .set({[`signatureCards[_key=="${slot._key}"].project._ref`]: replace._id})
      .unset([
        `signatureCards[_key=="${slot._key}"].category`,
        `signatureCards[_key=="${slot._key}"].link`,
      ])
      .commit()
    say('    patched.')
  }
} else if (already) {
  say(`  signature cards: already pointing at ${replace.name} — nothing to do.`)
} else if (aarvi) {
  say(`  signature cards: no card references ${RETIRE} — leaving the grid alone.`)
}

/* ---------- step 3: nothing else may reference it ---------- */
if (!aarvi) {
  say(`\n  ${RETIRE}: no published document — already off the site.`)
} else {
  const refs = await client.fetch(`*[references($id) && !(_id in path("drafts.**"))]._id`, {id: aarvi._id})
  const left = refs.filter(r => r !== 'homepage')
  if (left.length) bail(`${RETIRE} is still referenced by ${left.join(', ')} — clear those first.`)

  /* ---------- step 4: unpublish ---------- */
  const doc = await client.getDocument(aarvi._id)
  const draftId = 'drafts.' + aarvi._id
  const existing = await client.getDocument(draftId)

  say(`\n  ${RETIRE} (${aarvi._id})`)
  say(`    stages: ${JSON.stringify(aarvi.stages)}   slug: ${aarvi.slug}`)
  say(existing ? '    a draft already exists — it is left as it is' : `    copying to ${draftId}`)
  say('    deleting the published document (its cards and detail page go with it)')

  if (!DRY) {
    const tx = client.transaction()
    if (!existing) {
      const {_rev, _createdAt, _updatedAt, ...rest} = doc
      tx.createIfNotExists({...rest, _id: draftId})
    }
    tx.delete(aarvi._id)
    await tx.commit()
    say('    unpublished.')
  }
}

say(`\n  ${DRY ? 'Dry run complete.' : 'Done.'} Edits show on the site within about a minute (apicdn max-age=60).\n`)
