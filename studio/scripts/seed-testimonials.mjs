/* Fills the testimonials page and creates the five reviews that are currently
   written into testimonials.html, so the client opens filled-in forms.

   NOTE: those five are **written copy, not real clients** — names, quotes and
   portraits were all invented for the build. They are seeded so the page keeps
   working and so the shape is obvious, but every one of them should be
   replaced before launch. That is what the warning in the page content says.

   Safe to re-run on a fresh dataset: it createOrReplaces by fixed id, so it
   will discard edits made to these five in the Studio.

     npx sanity exec scripts/seed-testimonials.mjs --with-user-token          */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

await client.createOrReplace({
  _id: 'testimonials-page',
  _type: 'testimonialsPage',

  label: 'Testimonials',
  heading: ['Words That Reflect', 'Our'],
  headingHighlight: 'Promise.',
  introText:
    'Real experiences from homeowners who trusted Raajlaxmi to create the place they live in.',

  galleryLabel: 'Our Clients',
  galleryTitle: 'The Families Behind the Keys',
  galleryIntro:
    'Handover days, housewarmings and the people who now live in the buildings above.',
  gallery: [],

  stripTitle: 'Every Home Begins With',
  stripHighlight: 'Trust.',
  stripText:
    'Our greatest achievement is the confidence our clients place in us — from the first ' +
    'conversation to the day they receive their keys.',
  stripButton: 'Book a Private Consultation',
})
console.log('seeded testimonials-page')

const REVIEWS = [
  {
    quote:
      'From the first visit to the day we moved in, everything was handled with such care and ' +
      'professionalism. The quality and attention to detail are truly exceptional.',
    name: 'The Mehta Family',
    at: 'Raajlaxmi Heights, Mumbai',
  },
  {
    quote:
      'Raajlaxmi doesn’t just build homes, they build trust. Every commitment was delivered ' +
      'with honesty and excellence.',
    name: 'Mr. Arvind Sharma',
    at: 'Raajlaxmi Crest, Mumbai',
  },
  {
    quote:
      'The craftsmanship, the amenities and the entire community are beyond anything we ' +
      'imagined. Proud to be a part of the Raajlaxmi family.',
    name: 'Mrs. Pooja Iyer',
    at: 'Raajlaxmi Villa, Mumbai',
  },
  {
    quote:
      'We were shown the same drawings we were finally handed the keys to. Nothing was quietly ' +
      'changed along the way, and that is rarer than it should be.',
    name: 'Mr. & Mrs. Deshpande',
    at: 'Raajlaxmi Enclave, Mumbai',
  },
  {
    quote:
      'Two monsoons in and the building still feels new. You only learn what a builder’s word is ' +
      'worth after you have lived in the house.',
    name: 'Ms. Ritika Nair',
    at: 'Raajlaxmi Essence, Mumbai',
  },
]

for (const [i, r] of REVIEWS.entries()) {
  await client.createOrReplace({
    _id: `testimonial-seed-${i + 1}`,
    _type: 'testimonial',
    order: (i + 1) * 10,
    stars: 5,
    ...r,
  })
  console.log('seeded review', i + 1, '—', r.name)
}

console.log('\nREMINDER: these five are invented copy. Replace them with real clients.')
