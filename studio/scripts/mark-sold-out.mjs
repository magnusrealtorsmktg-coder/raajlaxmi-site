/* Marks the eight properties the client reported as sold on 7 Nov 2026.

     npx sanity exec scripts/mark-sold-out.mjs --with-user-token -- --dry
     npx sanity exec scripts/mark-sold-out.mjs --with-user-token

   WHY A SCRIPT AND NOT EIGHT CLICKS: `soldOut` ships as a new field, so the
   Studio has to be redeployed before the toggle exists in the form at all.
   This sets the eight without waiting for that, and it is how the list was
   verified against the live dataset rather than typed from a screenshot.

   IT IS A ONE-OFF AND IT IS SAFE TO RE-RUN. It patches only `soldOut`, only
   on the names below, and it never clears the flag on anything else — a
   ninth property sold next month is a tick in the Studio, not an edit here.
   It is deliberately NOT the reverse of itself: if the client un-ticks one by
   hand, running this again would put it back, so re-run it only to repair
   these eight.

   THE NAMES ARE MATCHED FORGIVINGLY, the same way the collection banner's
   hotspots and the signature cards do it (`nameKey` / `spKey`): case and
   punctuation folded, doubled letters collapsed, so `Rajlaxxmi` and
   `Raajlaxmi` agree. The dataset spells these inconsistently and an exact
   match would silently skip one.

   It prints every project it did NOT match, because a name that quietly
   matched nothing is the one failure mode that looks like success. */
import {getCliClient} from 'sanity/cli'

const DRY = process.argv.includes('--dry')

/* The first eight cards of the Completed view, in the order they render —
   Raajlaxmi Apartment through Priti Darpan. Two of them carry an "Ongoing"
   badge and one "Ready Possession"; that is correct and is why `soldOut` is
   its own field rather than a value of `status`. */
const SOLD = [
  'Raajlaxmi Apartment',
  'Nakshatra Auris',
  'Raajlaxmi Tower',
  'Shakun Solitaire',
  'Midas Glory',
  'Midas Enclave',
  'Raajlaxmi Avenue',
  'Priti Darpan',
]

const key = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/(.)\1+/g, '$1')

const client = getCliClient()
const docs = await client.fetch('*[_type=="project"]{_id,name,soldOut}')

const want = new Map(SOLD.map((n) => [key(n), n]))
const hit = new Set()
let tx = client.transaction()
let n = 0

for (const d of docs) {
  const k = key(d.name)
  if (!want.has(k)) continue
  hit.add(k)
  if (d.soldOut === true) {
    console.log('  already sold out —', d.name)
    continue
  }
  console.log('  marking sold out —', d.name)
  tx = tx.patch(d._id, (p) => p.set({soldOut: true}))
  n++
}

const missed = [...want.entries()].filter(([k]) => !hit.has(k)).map(([, n]) => n)
if (missed.length) console.log('\nNO PROJECT MATCHED:', missed.join(', '))

if (DRY) {
  console.log(`\ndry run — ${n} document(s) would change`)
} else if (n) {
  await tx.commit()
  console.log(`\ndone — ${n} document(s) patched`)
} else {
  console.log('\nnothing to change')
}
