/* Fills the four "Listing page" documents with the wording that is currently
   written into projects.html, projects-ongoing.html and
   projects-redevelopment.html, and uploads the two banner plates, so the
   client opens filled-in forms rather than blank ones.

   Safe to re-run on a fresh dataset. It createOrReplaces, so re-running it
   AFTER the client has edited will discard their changes.

     npx sanity exec scripts/seed-collections.mjs --with-user-token           */
import {getCliClient} from 'sanity/cli'
import {createReadStream} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, resolve, basename} from 'node:path'

const client = getCliClient()
const here = dirname(fileURLToPath(import.meta.url))
const asset = (rel) => resolve(here, '../..', rel)

async function upload(rel) {
  try {
    const file = asset(rel)
    const a = await client.assets.upload('image', createReadStream(file), {filename: basename(file)})
    console.log('uploaded', rel, '→', a._id)
    return {_type: 'image', asset: {_type: 'reference', _ref: a._id}}
  } catch (err) {
    console.warn('could not upload', rel, '—', err.message)
    return null
  }
}

const westernLine = await upload('assets/projects/western-line.jpg')
const ongoingLine = await upload('assets/projects/western-line-ongoing.jpg')
const associates = await upload('assets/projects/associates.jpg')

/* the copy painted into each banner, written out for screen readers */
const ALT_COMPLETED =
  'Completed projects along the Western line. Vasai: Rajlaxmi Apartment, Raajlaxmi Towers, ' +
  'Shakun Solitaire (Vasai East). Nallasopara: Midas Glory and Midas Enclave (Nalasopara East), ' +
  'Nakshatra Auris. Virar: Midas Heights (Virar West), Raajlaxmi Avenue. Saphale: Priti Chaaya, ' +
  'Priti Darpan and Priti Pearrl (Saphale West), Rajlaxxmi Park.'

const ALT_ASSOCIATES =
  'Raajlaxmi Group associates and consultants — redeveloping homes, rebuilding lives. ' +
  'Architects: Sanat Mehta, Ajay Wade, Chirag Mistry, Kuldeep Patil, Umesh Kekre, Sanjay Narang, ' +
  'Himesh Gupta, Roshan Patil, and Kaushik Patel & Associates. Engineers: Sailesh Pandey, ' +
  'Sanjay Belnekar, Mukesh Kumar, and Sura & Associates. Chartered Accountants: Bharat Majithia ' +
  'and Vivek Sankhala. Advocates: Kalpana Mhatre, Yogesh Virarkar, N.B Deshmukh, and Anisha Shastri.'

/* the consultation strip is the same on all three pages */
const CTA = {
  ctaTitle: "Can't Find What You're Looking For?",
  ctaText:
    'Our property advisors will help you discover the perfect residence tailored to your lifestyle.',
  ctaButton: 'Schedule a Consultation',
}

const withBanner = (img, alt) => (img ? {banner: {...img, alt}} : {})

const PAGES = [
  {
    _id: 'collection-all',
    pageTitle: 'All projects — projects.html',
    label: 'Our Collection',
    heading: ['Explore All Our', 'Developments'],
    intro: 'Discover homes crafted with passion and precision across prime locations in Mumbai and beyond.',
    bannerLabel: 'Completed Projects',
    bannerTitle: 'Delivered Along the Western Line',
    ...withBanner(westernLine, ALT_COMPLETED),
  },
  {
    _id: 'collection-completed',
    pageTitle: 'Completed — projects.html?status=completed',
    label: 'Completed Projects',
    heading: ['Delivered, and', 'Lived In'],
    intro: 'Buildings that are finished, handed over and occupied — the record the rest of the work rests on.',
    bannerLabel: 'Completed Projects',
    bannerTitle: 'Delivered Along the Western Line',
    ...withBanner(westernLine, ALT_COMPLETED),
  },
  {
    _id: 'collection-ongoing',
    pageTitle: 'Ongoing — projects-ongoing.html',
    label: 'Ongoing Development',
    heading: ['Taking Shape', 'Right Now'],
    intro:
      'Homes under construction across the western suburbs — follow a build from foundation to handover, ' +
      'and book a site visit while there is still a choice of floor.',
    bannerLabel: 'Ongoing Projects',
    bannerTitle: 'Rising Along the Western Line',
    ...withBanner(ongoingLine, 'Rising along the Western line — ongoing projects at Vasai, Virar and Saphale.'),
  },
  {
    _id: 'collection-redevelopment',
    pageTitle: 'Redevelopment — projects-redevelopment.html',
    label: 'Redevelopment',
    heading: ['New Life For', 'Older Buildings'],
    intro:
      'Society redevelopment handled end to end — approvals, rehousing and a finished building the ' +
      'members are glad they waited for.',
    ...withBanner(associates, ALT_ASSOCIATES),
  },
]

for (const page of PAGES) {
  await client.createOrReplace({_type: 'collectionPage', ...CTA, ...page})
  console.log('seeded', page._id)
}
