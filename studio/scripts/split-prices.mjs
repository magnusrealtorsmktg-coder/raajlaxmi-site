/* Split a free-text `price` into a price per configuration.
 *
 * WHY THIS EXISTS. On 14 Nov six projects were priced like
 *
 *     42 Lacs Onwards for 1 BHK & 60 Lacs Onwards for 2 BHK
 *
 * and the budget filter read the "1" of "1 BHK" as one rupee: the range ran
 * from ₹1 to infinity and every band matched every project, so "Under ₹25
 * Lacs" returned two ₹42-Lac projects. The parser has been fixed so those
 * strings are read correctly, but the real answer is a price that is only a
 * price — `sizes[].price`, beside the configuration it belongs to. This moves
 * the existing strings into that shape.
 *
 * IT IS NOT DESTRUCTIVE. The free-text `price` is LEFT IN PLACE unless you
 * pass --clear-price; with rows filled the site stops printing it either way,
 * so leaving it costs nothing and keeps a copy of what the client wrote.
 * A configuration already in `sizes` has its price set and its area left
 * alone; a configuration not there yet is appended with no area.
 *
 * Run:
 *   cd studio
 *   npx sanity exec scripts/split-prices.mjs --with-user-token -- --dry
 *   npx sanity exec scripts/split-prices.mjs --with-user-token
 *   npx sanity exec scripts/split-prices.mjs --with-user-token -- --clear-price
 *
 * Idempotent: a row that already has a price is never overwritten.
 */
import {getCliClient} from 'sanity/cli'

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry')
const CLEAR = argv.includes('--clear-price')

const client = getCliClient({apiVersion: '2023-05-03'})

/* "42 Lacs Onwards for 1 BHK & 60 Lacs Onwards for 2 BHK"
 *   -> [{price: '42 Lacs Onwards', config: '1 BHK'}, …]
 *
 * Split on "&", "," or " and " FIRST, then on " for " inside each piece. A
 * chunk with no " for " in it names no configuration and is skipped — that is
 * a project with one price for everything ("26 Lacs Onwards"), which the
 * one-line field already says correctly and which has nothing to split.
 */
function split(raw) {
  const text = String(raw || '').trim()
  if (!text) return []
  return text
    .split(/\s*&\s*|\s*,\s*|\s+and\s+/i)
    .map((chunk) => {
      const m = chunk.trim().match(/^(.*?\S)\s+for\s+(\S.*)$/i)
      if (!m) return null
      const price = m[1].trim()
      const config = m[2].trim().replace(/[.;]+$/, '')
      /* a "price" with no digit in it is not one */
      if (!/\d/.test(price) || !config) return null
      return {price, config}
    })
    .filter(Boolean)
}

/* "1 BHK", "1BHK" and "1 bhk" are one configuration */
const key = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

const rnd = () => Math.random().toString(16).slice(2, 14)

const docs = await client.fetch(
  '*[_type=="project" && defined(price) && price != ""]{_id,name,price,sizes}'
)

let changed = 0
for (const doc of docs) {
  const parts = split(doc.price)
  if (!parts.length) {
    console.log(`-  ${doc.name}: "${doc.price}" names no configuration, left alone`)
    continue
  }

  const sizes = Array.isArray(doc.sizes) ? doc.sizes.map((z) => ({...z})) : []
  const notes = []

  for (const part of parts) {
    const row = sizes.find((z) => key(z.config) === key(part.config))
    if (row) {
      if (row.price) { notes.push(`${part.config} already priced, kept`); continue }
      row.price = part.price
      notes.push(`${part.config} <- ${part.price}`)
    } else {
      sizes.push({_key: rnd(), _type: 'object', config: part.config, price: part.price})
      notes.push(`${part.config} added, ${part.price}`)
    }
  }

  const touched = notes.some((n) => !n.includes('already priced'))
  if (!touched && !CLEAR) {
    console.log(`=  ${doc.name}: already done`)
    continue
  }

  console.log(`${DRY ? '~' : '*'}  ${doc.name}: ${notes.join('; ')}${CLEAR ? '; price cleared' : ''}`)
  if (DRY) { changed++; continue }

  let patch = client.patch(doc._id).set({sizes})
  if (CLEAR) patch = patch.unset(['price'])
  await patch.commit()
  changed++
}

console.log(
  `\n${DRY ? 'would change' : 'changed'} ${changed} of ${docs.length} priced projects` +
  (DRY ? '  (re-run without --dry to apply)' : '')
)
