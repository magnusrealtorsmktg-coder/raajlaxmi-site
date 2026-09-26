/* One-off: give every project a slug derived from its name, skipping any
   document that already has one. Run with:
     npx sanity exec scripts/add-slugs.mjs --with-user-token            */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()
const docs = await client.fetch('*[_type=="project"]{_id,name,"slug":slug.current}')

let tx = client.transaction()
let n = 0
for (const d of docs) {
  if (d.slug) continue
  const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  tx = tx.patch(d._id, (p) => p.set({slug: {_type: 'slug', current: slug}}))
  console.log(`${d.name} -> ${slug}`)
  n++
}
if (n) { await tx.commit(); console.log(`patched ${n} documents`) }
else console.log('nothing to do')
