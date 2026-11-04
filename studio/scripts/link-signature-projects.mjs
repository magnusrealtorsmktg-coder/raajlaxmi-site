/* One-off: make every Signature Projects card on the home page a REFERENCE to a
   real, PUBLISHED `project` document, so the client edits one record and both
   the home page and the collection page follow.

     npx sanity exec scripts/link-signature-projects.mjs --with-user-token -- --dry
     npx sanity exec scripts/link-signature-projects.mjs --with-user-token

   Why it exists. The four cards were typed into the `homepage` document by hand
   -- a name, a category, a location, a paragraph and a photograph, with no
   project behind them. Three of the four happened to be spelled the same as a
   published project, so the page's name-match fallback found them a "View
   Project" link. Shanti Niwas did not: its project had been created in the
   Studio and left as an UNPUBLISHED DRAFT, which the public API cannot see, so
   the card's button removed itself. That is the design working correctly on
   content that was never published.

   And because the typed-in card fields are OVERRIDES, editing a project changed
   the collection page and left the home page still saying the old thing -- so
   "add details to the project" did not reach the home page at all.

   What it does, per card:
     1. finds the project -- an existing reference first, then a forgiving name
        match (the page's own key: case and punctuation folded, doubled letters
        collapsed, so Rajlaxxmi and Raajlaxmi agree);
     2. PUBLISHES it when it exists only as a draft, and CREATES it when there is
        no document at all, from what the card already says;
     3. copies the card's text onto the project wherever the project is EMPTY,
        so nothing written on the home page is lost when the card stops saying
        it itself;
     4. points the card at the project and clears every card field that has
        become REDUNDANT.

   Three things it is careful about:

   - It never references a `drafts.` id. A reference to a draft resolves to
     nothing for a visitor, which is the bug it is here to fix.
   - It patches the home page's DRAFT as well as the published document when a
     draft exists, so a later Publish in the Studio cannot quietly revert this.
   - IT ONLY CLEARS AN OVERRIDE THAT NOW SAYS THE SAME AS THE PROJECT. Where the
     card and the project genuinely disagree -- "Luxury Living" on the card
     against "Residential" on the project -- the card keeps its own word and
     nothing on the live page moves. Which of the two is right is the client's
     call, not a migration's, and the Studio now shows those as the only filled
     fields in the card's override fieldset, which is where that decision gets
     made. Delete one there and the project's wording takes over for good.

   Idempotent: a card already pointing at a published project with nothing left
   to clear is reported and skipped. Nothing is overwritten on a project that
   already carries its own value -- with one named exception below, which is a
   stale seed value rather than anything the client wrote. */
import {getCliClient} from 'sanity/cli'

const DRY = process.argv.includes('--dry')
const client = getCliClient()

/* the page's own matcher, copied so the two cannot drift apart silently */
const key = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, '').replace(/(.)\1+/g, '$1')
const txt = (v) => (typeof v === 'string' ? v.trim() : '')
const pubId = (id) => String(id).replace(/^drafts\./, '')

/* `Nakshatra Auris` is the seeded `project-raajlaxmi-villa` document under a new
   name: the client renamed it and the villa copy stayed behind, so a tower is
   advertising "Exclusive villas" on the collection page today. The card's own
   line is what is live on the home page and is at least about a tower, so it
   wins. Matched on the exact stale string, so this stops being a rule the
   moment anybody edits that field. */
const STALE_BLURB = 'Exclusive villas offering privacy, luxury and a lifestyle beyond compare.'

const [home, homeDraft, published, drafts] = await Promise.all([
  client.fetch(`*[_id=="homepage"][0]`),
  client.fetch(`*[_id=="drafts.homepage"][0]{_id,signatureCards}`),
  client.fetch(`*[_type=="project" && !(_id in path("drafts.**"))]{_id,name,category,location,blurb,image,"slug":slug.current}`),
  client.fetch(`*[_type=="project" && _id in path("drafts.**")]{_id,name}`),
])
if (!home) throw new Error('no homepage document')

const byKey = new Map()
for (const p of published) { const k = key(p.name); if (k && !byKey.has(k)) byKey.set(k, p) }
const draftByKey = new Map()
for (const d of drafts) { const k = key(d.name); if (k && !draftByKey.has(k)) draftByKey.set(k, d) }

const cards = Array.isArray(home.signatureCards) ? home.signatureCards : []
if (!cards.length) throw new Error('homepage has no signatureCards')

/* the draft carries its own copy of the array; patch a card there only when the
   two agree, so a client edit in progress is never silently overwritten */
const draftCards = Array.isArray(homeDraft && homeDraft.signatureCards) ? homeDraft.signatureCards : []
const sameInDraft = (c) => {
  const d = draftCards.find((x) => x && x._key === c._key)
  return d ? JSON.stringify(d) === JSON.stringify(c) : false
}

let tx = client.transaction()
let writes = 0
const log = []
/* project id -> the fields this run is about to set on it */
const pending = new Map()

for (const c of cards) {
  const label = txt(c.name) || '(unnamed card)'
  let proj = c.project && c.project._ref ? published.find((p) => p._id === pubId(c.project._ref)) : null
  if (!proj) proj = byKey.get(key(c.name)) || null

  /* ---- 1a. it exists, but only as an unpublished draft ---- */
  if (!proj) {
    const d = draftByKey.get(key(c.name))
    if (d) {
      const full = await client.getDocument(d._id)
      const doc = {...full, _id: pubId(d._id)}
      delete doc._rev; delete doc._updatedAt; delete doc._createdAt
      /* fill what the card knows and the draft does not, BEFORE it goes live */
      if (!txt(doc.category)    && txt(c.category))    doc.category = txt(c.category)
      if (!txt(doc.location)    && txt(c.location))    doc.location = txt(c.location)
      if (!txt(doc.blurb)       && txt(c.description)) doc.blurb    = txt(c.description)
      if (!doc.image            && c.image)            doc.image    = c.image
      tx = tx.createOrReplace(doc).delete(d._id)
      proj = {...doc, slug: doc.slug && doc.slug.current}
      published.push(proj); byKey.set(key(doc.name), proj)
      log.push(`PUBLISH draft "${doc.name}" -> ${doc._id}` +
               `  (stage=${doc.stage}, project.html?p=${proj.slug})`)
      writes++
    }
  }

  /* ---- 1b. no document at all: build one from what the card says ---- */
  if (!proj) {
    const slug = txt(c.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (!slug) { log.push(`SKIP ${label}: no name to build a project from`); continue }
    const doc = {
      _id: 'project-' + slug,
      _type: 'project',
      name: txt(c.name),
      slug: {_type: 'slug', current: slug},
      /* Completed, because the cards it sits beside are completed and the
         photograph is of a finished building. One radio in the Studio moves it
         -- and left unset it would sit in "Not yet filed", where nobody looks. */
      stage: 'completed',
      status: 'Completed',
      order: 100,
    }
    if (txt(c.category))    doc.category = txt(c.category)
    if (txt(c.location))    doc.location = txt(c.location)
    if (txt(c.description)) doc.blurb    = txt(c.description)
    if (c.image && c.image.asset) doc.image = c.image
    tx = tx.createIfNotExists(doc)
    proj = {...doc, slug}
    published.push(proj); byKey.set(key(doc.name), proj)
    log.push(`CREATE project "${doc.name}" -> ${doc._id}  (project.html?p=${slug})`)
    writes++
  } else if (!log.some((l) => l.startsWith('PUBLISH') && l.includes(`"${proj.name}"`))) {
    /* ---- 2. fill the project's empty fields from the card ---- */
    const set = {}
    if (!txt(proj.category)    && txt(c.category))    set.category = txt(c.category)
    if (!txt(proj.location)    && txt(c.location))    set.location = txt(c.location)
    if (!txt(proj.blurb)       && txt(c.description)) set.blurb    = txt(c.description)
    if (!proj.image            && c.image)            set.image    = c.image
    /* a trailing space reads as nothing and sorts as something */
    if (txt(proj.category) && proj.category !== txt(proj.category)) set.category = txt(proj.category)
    if (txt(proj.blurb) === STALE_BLURB && txt(c.description)) set.blurb = txt(c.description)

    if (Object.keys(set).length) {
      tx = tx.patch(proj._id, (p) => p.set(set))
      pending.set(proj._id, set)
      for (const [k, v] of Object.entries(set))
        log.push(`  ${label}: project.${k} = ${JSON.stringify(String(v && v.asset ? '[image]' : v).slice(0, 62))}`)
      writes++
    }
  }

  /* ---- 3. point the card at it, and drop only what has become redundant ---- */
  const alreadyLinked = c.project && pubId(c.project._ref) === proj._id && !String(c.project._ref).startsWith('drafts.')

  /* the project as it will read AFTER this run, so a value copied up a moment
     ago counts as redundant rather than as a disagreement */
  const now = {...proj, ...(pending.get(proj._id) || {})}
  const asset = (v) => (v && v.asset && v.asset._ref) || ''
  const same = {
    name:        txt(c.name)        === txt(now.name),
    category:    txt(c.category)    === txt(now.category),
    location:    txt(c.location)    === txt(now.location),
    description: txt(c.description) === txt(now.blurb),
    image:       asset(c.image)     === asset(now.image),
    /* a bare `project.html` has no ?p= on it, so it is the Romal Kirti
       fallback page -- never this card's own project, and never a link */
    link:        !txt(c.link) || txt(c.link).replace(/^\.\//, '') === 'project.html',
  }
  const filled = (f) => c[f] !== undefined && c[f] !== null && c[f] !== ''
  const leftovers = Object.keys(same).filter((f) => filled(f) && same[f])
  const kept = Object.keys(same).filter((f) => filled(f) && !same[f])
  for (const f of kept)
    log.push(`  ! ${label}: card ${f} ${JSON.stringify(txt(c[f]) || '[image]')} ` +
             `differs from the project's ${JSON.stringify(txt(f === 'description' ? now.blurb : now[f]) || '[image]')}` +
             ` -- kept as an override, nothing moves on the page`)

  if (!alreadyLinked || leftovers.length) {
    const edit = (id) => {
      const path = `signatureCards[_key=="${c._key}"]`
      tx = tx.patch(id, (p) => {
        let q = p
        if (!alreadyLinked) q = q.set({[`${path}.project`]: {_type: 'reference', _ref: proj._id}})
        if (leftovers.length) q = q.unset(leftovers.map((f) => `${path}.${f}`))
        return q
      })
    }
    edit(home._id)
    if (homeDraft && sameInDraft(c)) edit(homeDraft._id)
    log.push(`LINK  ${label} -> ${proj._id}` +
             (leftovers.length ? `   (cleared card ${leftovers.join(', ')})` : '') +
             (homeDraft ? (sameInDraft(c) ? '   [+draft]' : '   [draft DIFFERS, left alone]') : ''))
    writes++
  } else {
    log.push(`ok    ${label} already linked, nothing to clear`)
  }
}

console.log(log.join('\n'))
if (!writes) { console.log('\nnothing to do'); process.exit(0) }
if (DRY) { console.log(`\n--dry: ${writes} change(s) NOT committed`); process.exit(0) }
await tx.commit()
console.log(`\ncommitted ${writes} change(s)`)
