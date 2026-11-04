/* Replace the hero and/or About video on the `homepage` singleton with a
   web-encoded copy.

   WHY THIS EXISTS
   The client uploaded camera/edit masters into both slots. The hero was
   3840x2160, 24fps, 81.5 Mbps, 265.6 MB, with a 317 kbps AAC track on a video
   the site plays MUTED; the About plate was 630x830 at 11 Mbps, 6.13 MB for
   4.5 seconds. A visitor needs 81.5 Mbps SUSTAINED to keep up with the hero,
   which no consumer connection delivers, so it buffered, played, starved and
   paused. Measured on a 12 Mbps link: 24 seconds of wall clock bought 1.63
   seconds of playback.

   REVERSIBILITY
   Nothing is ever deleted. Before writing, this records the EXACT field values
   it is about to overwrite into `scripts/.video-revert.json`, so
   `revert-videos.mjs` can put them back verbatim — including restoring a field
   to empty if it started empty. The original assets stay in the dataset.

   Run:
     npx sanity exec scripts/replace-hero-video.mjs --with-user-token -- --hero <file> [--about <file>] [--dry]
*/
import {getCliClient} from 'sanity/cli'
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REVERT = path.join(HERE, '.video-revert.json')

const client = getCliClient()
const argv = process.argv.slice(2)
const arg = (n) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : null }
const DRY = argv.includes('--dry')

const jobs = [['heroVideo', arg('--hero')], ['aboutVideo', arg('--about')]].filter(([, f]) => f)
if (!jobs.length) { console.error('nothing to do: pass --hero <file> and/or --about <file>'); process.exit(1) }

/* a draft would let the client publish the old file back over this */
const drafts = await client.fetch(`*[_id=="drafts.homepage"][0]._id`)
if (drafts) {
  console.error('REFUSING: drafts.homepage exists. Publish or discard it first,')
  console.error('otherwise publishing that draft restores the old video.')
  process.exit(1)
}

/* the RAW field values, which is what a faithful revert needs — not the
   dereferenced asset */
const before = await client.fetch(`*[_id=="homepage"][0]{heroVideo, aboutVideo}`)
const sizes  = await client.fetch(
  `*[_id=="homepage"][0]{"hero":heroVideo.asset->{_id,size,originalFilename},"about":aboutVideo.asset->{_id,size,originalFilename}}`
)
console.log('BEFORE:')
console.log(JSON.stringify(sizes, null, 2))

const patch = {}, unset = []
for (const [field, file] of jobs) {
  const abs = path.resolve(file)
  const size = fs.statSync(abs).size
  console.log(`\n${field}: uploading ${path.basename(abs)} (${(size / 1048576).toFixed(2)} MB)`)
  if (DRY) { console.log('  --dry, not uploading'); continue }
  const asset = await client.assets.upload('file', fs.createReadStream(abs), {
    filename: path.basename(abs), contentType: 'video/mp4',
  })
  console.log(`  uploaded ${asset._id}`)
  patch[field] = {_type: 'file', asset: {_type: 'reference', _ref: asset._id}}
}

if (DRY) { console.log('\n--dry: nothing written, no revert file saved'); process.exit(0) }

/* write the undo BEFORE the change, so a failure mid-commit still leaves one */
const revertDoc = {}
for (const [field] of jobs) revertDoc[field] = before ? (before[field] ?? null) : null
fs.writeFileSync(REVERT, JSON.stringify({
  savedAt: new Date().toISOString(),
  note: 'field values as they were before replace-hero-video.mjs ran; null means the field was empty',
  fields: revertDoc,
  previousAssets: sizes,
}, null, 2))
console.log(`\nundo saved: ${REVERT}`)

await client.patch('homepage').set(patch).commit()
console.log('homepage patched:', Object.keys(patch).join(', '))

const after = await client.fetch(
  `*[_id=="homepage"][0]{"hero":heroVideo.asset->{_id,size,url},"about":aboutVideo.asset->{_id,size,url}}`
)
console.log('AFTER:')
console.log(JSON.stringify(after, null, 2))
console.log('\nto undo:  npx sanity exec scripts/revert-videos.mjs --with-user-token')
