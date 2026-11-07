/* Moves every project from the single `stage` string to the `stages` array,
   and applies the refiling the client asked for on 7 Nov 2026.

     npx sanity exec scripts/stages-migrate.mjs --with-user-token -- --dry
     npx sanity exec scripts/stages-migrate.mjs --with-user-token

   WHY THE FIELD CHANGED SHAPE: `stage` was one of three values, so a project
   could be on one listing. The client asked for Krishna Niwas and Shanti
   Niwas on BOTH Ongoing and Redevelopment, which is not a mistake — "ongoing"
   says how far built a project is and "redevelopment" says what kind of
   project it is. A redevelopment under construction is honestly both, and the
   old field had to drop one of the two answers.

   IT DOES TWO SEPARATE THINGS, and only the first is a migration:

   1. Seeds `stages` from `stage` on every project that has none. Lossless and
      safe to re-run — a project already carrying `stages` is left alone.
   2. Applies MOVES, the seven below. These are the client's instruction and
      they REPLACE whatever the project was filed as: Rajlaxxmi Park is listed
      as Ongoing, not Completed-and-Ongoing. That reading is confirmed by the
      client having already moved Aarvi Apartment to Redevelopment by hand in
      the Studio before asking.

   `stage` IS NOT CLEARED. The pages still read it as a fallback, the Studio
   keeps it hidden and read-only, and it is the only record of what each
   project was filed as before today. Nothing is gained by deleting it and a
   restored document would lose its listing.

   RE-RUNNING IS SAFE but it is not a no-op for the seven: it puts them back
   the way this file says. Change the lists here, or untick in the Studio —
   not both.

   IT PATCHES DRAFTS TOO, AND THAT IS NOT OPTIONAL. A token-authenticated
   client sees drafts; the website does not. When this ran, six projects had
   unpublished drafts, five of them minutes old — the client was refiling by
   hand in the Studio at the same time. Patching only the published document
   would leave those drafts carrying the old single `stage` and no `stages`,
   so the next time anyone pressed Publish the listing would quietly revert to
   one page. So every draft that shadows a project this script touches gets
   the same `stages`.

   AN ORPHAN DRAFT — one with no published twin — IS LEFT ALONE and printed.
   It is a document that has never existed on the site, so it is somebody's
   work in progress, and the one found here is an accidental duplicate. This
   script will not quietly adopt it. */
import {getCliClient} from 'sanity/cli'

const DRY = process.argv.includes('--dry')

/* The listings each named project should end up in, exactly as asked for.
   Two appear in both lists; that is the point of the change. */
const MOVES = {
  'Rajlaxxmi Park': ['ongoing'],
  'Raajlaxmi Meenakshi': ['ongoing'],
  'Krishna Niwas': ['ongoing', 'redevelopment'],
  'Shanti Niwas': ['ongoing', 'redevelopment'],
  'Raajlaxmi Solitaire': ['ongoing'],
  'Raajlaxmi Avenue': ['redevelopment'],
  'Aarvi Apartment': ['redevelopment'],
}

/* Same forgiving key as the banner hotspots and the signature cards: case and
   punctuation folded, doubled letters collapsed, so `Rajlaxxmi` and
   `Raajlaxmi` agree. The dataset does not spell these consistently. */
const key = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/(.)\1+/g, '$1')

const same = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i])

const client = getCliClient()
const all = await client.fetch('*[_type=="project"]{_id,name,stage,stages}')

const pub = all.filter((d) => !d._id.startsWith('drafts.'))
const drafts = all.filter((d) => d._id.startsWith('drafts.'))
const pubIds = new Set(pub.map((d) => d._id))
const draftOf = new Map(drafts.filter((d) => pubIds.has(d._id.slice(7))).map((d) => [d._id.slice(7), d]))
const orphans = drafts.filter((d) => !pubIds.has(d._id.slice(7)))

console.log(`${pub.length} published, ${drafts.length} draft(s)\n`)

const want = new Map(Object.entries(MOVES).map(([n, v]) => [key(n), {name: n, stages: v}]))
const hit = new Set()
let tx = client.transaction()
let n = 0

for (const d of pub) {
  const k = key(d.name)
  const move = want.get(k)
  if (move) hit.add(k)

  /* a move wins; otherwise seed the array from the old field, once */
  const target = move ? move.stages : Array.isArray(d.stages) && d.stages.length ? d.stages : d.stage ? [d.stage] : null

  if (!target) {
    console.log('  NO LISTING AT ALL —', d.name, '(left for a human)')
    continue
  }
  const how = move ? 'MOVE  ' : 'seed  '
  if (same(d.stages, target)) {
    console.log(`  --    — ${d.name}: already ${JSON.stringify(target)}`)
  } else {
    console.log(`  ${how}— ${d.name}: ${JSON.stringify(d.stages || d.stage)} -> ${JSON.stringify(target)}`)
    tx = tx.patch(d._id, (p) => p.set({stages: target}))
    n++
  }

  /* keep the draft in step, or pressing Publish would undo this */
  const dr = draftOf.get(d._id)
  if (dr && !same(dr.stages, target)) {
    console.log(`          + its draft: ${JSON.stringify(dr.stages || dr.stage)} -> ${JSON.stringify(target)}`)
    tx = tx.patch(dr._id, (p) => p.set({stages: target}))
    n++
  }
}

const missed = [...want.values()].filter((v) => !hit.has(key(v.name))).map((v) => v.name)
if (missed.length) console.log('\nNO PROJECT MATCHED:', missed.join(', '))

if (orphans.length) {
  console.log('\nUNPUBLISHED DRAFTS WITH NO PUBLISHED PROJECT — left untouched:')
  for (const o of orphans) console.log(`  ${o.name}  ${o._id}`)
  console.log('  These have never been on the site. Publish or delete them in the Studio.')
}

if (DRY) {
  console.log(`\ndry run — ${n} document(s) would change`)
} else if (n) {
  await tx.commit()
  console.log(`\ndone — ${n} document(s) patched`)
} else {
  console.log('\nnothing to change')
}
