/* Undo replace-hero-video.mjs, putting the homepage's video fields back to the
   exact values it recorded before it wrote. A field that was empty before is
   unset again rather than left pointing at the new file.

   The original assets were never deleted, so this always has something to
   point back at.

   Run:  npx sanity exec scripts/revert-videos.mjs --with-user-token [-- --dry]
*/
import {getCliClient} from 'sanity/cli'
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REVERT = path.join(HERE, '.video-revert.json')
const DRY = process.argv.slice(2).includes('--dry')

if (!fs.existsSync(REVERT)) {
  console.error(`no undo file at ${REVERT} — nothing recorded to revert to`)
  process.exit(1)
}
const saved = JSON.parse(fs.readFileSync(REVERT, 'utf8'))
console.log(`undo recorded at ${saved.savedAt}`)
console.log('restoring:', JSON.stringify(saved.previousAssets, null, 2))

const client = getCliClient()
const set = {}, unset = []
for (const [field, value] of Object.entries(saved.fields)) {
  if (value == null) unset.push(field); else set[field] = value
}
console.log(`\nset: ${Object.keys(set).join(', ') || '(none)'}   unset: ${unset.join(', ') || '(none)'}`)
if (DRY) { console.log('--dry: nothing written'); process.exit(0) }

let p = client.patch('homepage')
if (Object.keys(set).length) p = p.set(set)
if (unset.length) p = p.unset(unset)
await p.commit()

const after = await client.fetch(
  `*[_id=="homepage"][0]{"hero":heroVideo.asset->{_id,size},"about":aboutVideo.asset->{_id,size}}`
)
console.log('reverted. now:')
console.log(JSON.stringify(after, null, 2))
