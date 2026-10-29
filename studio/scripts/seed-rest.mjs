/* Fills the Why Raajlaxmi part of the home page, the contact page and the site
   settings with the copy currently written into the HTML, and uploads the Why
   banner photograph — so the client opens filled-in forms.

   The Why fields are PATCHED onto the existing homepage document (set-if-missing
   would leave them blank, and createOrReplace would wipe the client's hero and
   About edits). Everything else is a fresh singleton, so those are created
   outright.

     npx sanity exec scripts/seed-rest.mjs --with-user-token                   */
import {getCliClient} from 'sanity/cli'
import {createReadStream} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, resolve, basename} from 'node:path'

const client = getCliClient()
const here = dirname(fileURLToPath(import.meta.url))

async function upload(rel) {
  try {
    const file = resolve(here, '../..', rel)
    const a = await client.assets.upload('image', createReadStream(file), {filename: basename(file)})
    console.log('uploaded', rel)
    return {_type: 'image', asset: {_type: 'reference', _ref: a._id}}
  } catch (err) {
    console.warn('could not upload', rel, '—', err.message)
    return undefined
  }
}

const whyImage = await upload('assets/why-team.jpg')

/* ---------- Why Raajlaxmi, patched onto the existing home page ---------- */
const why = {
  whyLabel: 'Why Raajlaxmi',
  whyHeading: ['The Difference', 'Is In Every Detail.'],
  whyIntro:
    "At Raajlaxmi, excellence isn't simply promised — it is reflected in every material, " +
    'every location and every detail that shapes the homes we create.',
  whyRows: [
    {
      _key: 'r1',
      title: 'Timeless Architecture',
      text:
        'Our designs are inspired by global architectural principles — blending elegance, ' +
        'functionality and innovation to create spaces that stand the test of time.',
    },
    {
      _key: 'r2',
      title: 'Prime Locations',
      text:
        "Every Raajlaxmi residence is strategically placed in the city's most desirable " +
        'neighbourhoods — close to everything that matters, yet far from the ordinary.',
    },
    {
      _key: 'r3',
      title: 'World-Class Craftsmanship',
      text:
        'We use the finest materials and collaborate with the best minds in the industry to ' +
        'deliver perfection in every detail, inside and out.',
    },
    {
      _key: 'r4',
      title: 'Trusted Legacy',
      text:
        'Over two decades of honesty, transparency and commitment have helped us build not ' +
        'only homes, but lasting relationships.',
    },
  ],
  whyTimeline: [
    {_key: 't1', year: '2004', text: 'Founded on trust\nBuilt on values'},
    {_key: 't2', year: '2008', text: 'First luxury project\ndelivered'},
    {_key: 't3', year: '2016', text: '50+ projects\ncompleted'},
    {_key: 't4', year: '2026', text: 'Continuing the legacy\nBuilding for generations'},
  ],
  whyQuote: 'Luxury is measured not by what is added, but by what is perfected.',
  whyQuoteBy: 'Raajlaxmi Group',
  ...(whyImage ? {whyImage} : {}),
}

await client.patch('homepage').set(why).commit()
console.log('patched the Why Raajlaxmi fields onto the home page')

/* ---------- the contact page ---------- */
await client.createOrReplace({
  _id: 'contact-page',
  _type: 'contactPage',
  label: 'Contact Us',
  heading: ['Let’s Begin Your', 'Next'],
  headingHighlight: 'Chapter.',
  introText:
    'Whether you’re searching for your dream residence or exploring an investment, our team ' +
    'is here to help you find the right address.',
  /* PLACEHOLDER: these four were invented for the build — check every one */
  items: [
    {_key: 'i1', title: 'Call Us', text: '+91 9890823288', link: 'tel:+919890823288'},
    {
      _key: 'i2',
      title: 'Email Us',
      text: 'info@raajlaxmigroup.com',
      link: 'mailto:info@raajlaxmigroup.com',
    },
    {
      _key: 'i3',
      title: 'Visit Us',
      text: 'Shanti Niwas Opp Saraswati School\nStation Road, Virar West',
    },
    {_key: 'i4', title: 'Business Hours', text: 'Monday – Saturday\n10:00 AM – 7:00 PM'},
  ],
  cardTitle: 'Book a Private Consultation',
  cardText:
    'Tell us about your requirements and a member of our team will be in touch to arrange a ' +
    'time that suits you.',
  cardButton: 'Send Message',
  thanksTitle: 'Thank you',
  locationTitle: 'Our Location',
  locationText:
    'On Station Road, a short walk from Virar station. Visitors are always welcome — an ' +
    'appointment simply means we can give you our full attention.',
  locationButton: 'Get Directions',
  geo: {_type: 'geopoint', lat: 19.5754841, lng: 72.8032063},
})
console.log('seeded contact-page')

/* ---------- site settings ---------- */
await client.createOrReplace({
  _id: 'site-settings',
  _type: 'siteSettings',
  /* The four footer icons all pointed at "#". Left empty on purpose: the row
     hides itself until there are real handles, which is better than four
     buttons that go nowhere. */
  social: [],
  phone: '+91 77740 00939',
  email: 'info@raajlaxmigroup.com',
  address: 'Shanti Niwas, Opp. Saraswati School,\nStation Road, Virar West',
  copyright: '© 2026 Raajlaxmi Group. All rights reserved.',
})
console.log('seeded site-settings (social handles left empty — add the real ones)')
