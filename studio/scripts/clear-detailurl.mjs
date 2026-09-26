/* Heights was seeded with detailUrl "project.html", which predates the shared
   ?p=<slug> page. Clearing it lets every project use the same route. */
import {getCliClient} from 'sanity/cli'
const client = getCliClient()
const docs = await client.fetch('*[_type=="project" && defined(detailUrl)]{_id,name}')
let tx = client.transaction()
for (const d of docs) { tx = tx.patch(d._id, (p) => p.unset(['detailUrl'])); console.log('cleared', d.name) }
if (docs.length) await tx.commit()
console.log(docs.length ? 'done' : 'nothing to clear')
