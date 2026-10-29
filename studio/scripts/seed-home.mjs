/* Fills the "Home page" singleton with the copy that is currently written into
   index.html, so the client opens a filled-in form rather than a blank one and
   can edit what is actually on the site.

   It also uploads assets/about-plate.jpg as the About photograph, so that field
   shows the picture that is live rather than sitting empty.

   Safe to re-run: it createOrReplaces the one document with id "homepage".

     npx sanity exec scripts/seed-home.mjs --with-user-token                  */
import {getCliClient} from 'sanity/cli'
import {createReadStream} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, resolve} from 'node:path'

const client = getCliClient()
const here = dirname(fileURLToPath(import.meta.url))
const plate = resolve(here, '../../assets/about-plate.jpg')

let aboutImage
try {
  const asset = await client.assets.upload('image', createReadStream(plate), {
    filename: 'about-plate.jpg',
  })
  aboutImage = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}
  console.log('uploaded about-plate.jpg →', asset._id)
} catch (err) {
  console.warn('could not upload the About plate, leaving that field empty:', err.message)
}

const stat = (_key, value, caption, extra = {}) => ({_key, value, caption, ...extra})

await client.createOrReplace({
  _id: 'homepage',
  _type: 'homepage',

  /* ---- hero ---- */
  heroHeadline: ['Live', 'Above', 'The City'],
  heroSub:
    'A limited collection of forty-eight private residences, oriented to the horizon — ' +
    'where evening arrives in gold and the skyline is yours alone.',
  heroPropertyOptions: ['3 BHK', '4 BHK', 'Penthouse', 'Sky villa'],
  /* NOTE: the four localities written into index.html are in Lucknow, not the
     Vasai–Virar corridor this developer builds in. Seeded with the corridor
     instead — change them in the Studio if that is wrong. */
  heroLocationOptions: ['Vasai', 'Nallasopara', 'Virar', 'Saphale'],
  heroBudgetOptions: ['₹1 – 2 Cr', '₹2 – 4 Cr', '₹4 – 7 Cr', '₹7 Cr +'],
  heroButton: 'View residences',

  /* ---- about ---- */
  aboutLabel: 'About Raajlaxmi',
  aboutGhost: 'Legacy',
  aboutHeading: ['Building More Than', 'Homes.'],
  aboutParagraphs: [
    'At Raajlaxmi Group, we are committed to delivering exceptional real estate projects with timely possession and completion.',
    'Our strong track record reflects our dedication, reliability, and successful project delivery.',
    'When you choose Raajlaxmi Group, you’re choosing a partner that guarantees quality, timely delivery, and a seamless experience.',
  ],
  ...(aboutImage ? {aboutImage} : {}),
  stats: [
    stat('s1', 13, 'Years of\nExcellence', {suffix: '+'}),
    stat('s2', 1300, 'Happy Families\nHave Trusted Us', {suffix: '+'}),
    stat('s3', 0.9, 'Sq.Ft\nDeveloped', {decimals: 1, unit: 'Million', suffix: '+'}),
    stat('s4', 1, 'Sq.Ft Under\nConstruction & Upcoming', {unit: 'Million', suffix: '+'}),
  ],

  /* ---- signature projects ---- */
  signatureLabel: 'Signature Projects',
  signatureHeading: ['Crafted Spaces.', 'Timeless Living.'],
  signatureIntro:
    'Handpicked residential and luxury developments that reflect our commitment to ' +
    'design excellence, quality and elevated living.',
  signatureCards: [
    {
      _key: 'c1',
      name: 'Raajlaxmi Heights',
      category: 'Residential',
      location: 'Borivali West, Mumbai',
      description: 'A premium residential community designed for modern families seeking comfort and convenience.',
      link: 'project.html',
    },
    {
      _key: 'c2',
      name: 'Raajlaxmi Villa',
      category: 'Residential',
      location: 'Juhu, Mumbai',
      description: 'Exclusive villa residences crafted for privacy, elegance and a refined lifestyle.',
      link: '',
    },
    {
      _key: 'c3',
      name: 'Raajlaxmi Crest',
      category: 'Residential',
      location: 'Kandivali East, Mumbai',
      description: 'Iconic tower residences offering breathtaking views and world-class amenities.',
      link: '',
    },
    {
      _key: 'c4',
      name: 'Raajlaxmi Essence',
      category: 'Luxury Living',
      location: 'Malad West, Mumbai',
      description: 'Thoughtfully designed homes that blend luxury, space and functionality in perfect harmony.',
      link: '',
    },
  ],
})

console.log('seeded the "homepage" document')
