/* Clears `soldOut` off every project, published and draft.

     npx sanity exec scripts/retire-sold-out.mjs --with-user-token -- --dry
     npx sanity exec scripts/retire-sold-out.mjs --with-user-token

   WHY THIS EXISTS. The sold-out idea was dropped on 9 Nov 2026 at the
   client's request: the SOLD OUT stamp is gone from the collection cards, the
   sort that pushed those cards to the foot of the list is gone, and the
   `soldOut` field is gone from the schema. None of that touches the DATA —
   seven projects still carry `soldOut: true`, and a value with no field
   behind it shows as an "unknown field" warning on every edit in the Studio
   until it is unset. This unsets it.

   IT PATCHES DRAFTS AS WELL AS PUBLISHED DOCUMENTS, and that is not optional.
   A token-authenticated query sees drafts and the public API does not, so a
   draft left carrying the field would put it straight back on the next press
   of Publish. That trap has bitten this project twice — see CLAUDE.md,
   "Drafts shadow the live site". Orphan drafts (no published twin) are
   patched too: they are somebody's work in progress and the warning would
   greet them there as well, but nothing else about them is touched.

   IT IS SAFE TO RE-RUN. `unset` on a field that is already absent is a no-op,
   and the script only ever names that one field — nothing else on a document
   is read, written or reordered. Running it twice prints "nothing to do".

   AFTER THIS, REDEPLOY THE STUDIO so the form matches the schema:
     cd studio && npm run build && npx sanity deploy --no-build -y
   Claude Code cannot run that — the classifier blocks `sanity deploy`. */
import {getCliClient} from 'sanity/cli'

const DRY = process.argv.includes('--dry')
const client = getCliClient({apiVersion: '2024-01-01'})

const docs = await client.fetch(
  `*[_type=="project" && defined(soldOut)]{_id, name, soldOut}`
)

if (!docs.length) {
  console.log('nothing to do — no project carries `soldOut`.')
  process.exit(0)
}

const drafts = docs.filter((d) => d._id.startsWith('drafts.'))
console.log(
  `${docs.length} document${docs.length === 1 ? '' : 's'} carry \`soldOut\`` +
    ` (${docs.length - drafts.length} published, ${drafts.length} draft):`
)
for (const d of docs) {
  const kind = d._id.startsWith('drafts.') ? 'draft    ' : 'published'
  console.log(`  ${kind}  ${String(d.soldOut).padEnd(5)}  ${d.name || d._id}`)
}

if (DRY) {
  console.log('\n--dry: nothing written.')
  process.exit(0)
}

let tx = client.transaction()
for (const d of docs) tx = tx.patch(d._id, (p) => p.unset(['soldOut']))
await tx.commit()
console.log(`\ncleared \`soldOut\` from ${docs.length} document(s).`)
console.log('now redeploy the Studio: cd studio && npm run build && npx sanity deploy --no-build -y')
