/* The wording around the reviews on testimonials.html, plus the client photo
   slider that sits under them.

   A singleton: one document, fixed id "testimonials-page" (see
   sanity.config.js → structure). The reviews themselves are separate
   `testimonial` documents.

   Same rule as the other pages: a blank field LEAVES the markup alone rather
   than erasing it. The one exception is the photo slider, which is hidden
   entirely until there are photographs — an empty slider is worse than none. */

export default {
  name: 'testimonialsPage',
  title: 'Testimonials page',
  type: 'document',

  groups: [
    {name: 'intro', title: 'Heading', default: true},
    {name: 'gallery', title: 'Client photos'},
    {name: 'closing', title: 'Closing strip'},
  ],

  fields: [
    {
      name: 'label',
      title: 'Small label',
      type: 'string',
      group: 'intro',
    },
    {
      name: 'heading',
      title: 'Heading',
      type: 'array',
      of: [{type: 'string'}],
      description: 'One line per row. Two lines is the design.',
      group: 'intro',
    },
    {
      name: 'headingHighlight',
      title: 'Heading — the gold words',
      type: 'string',
      description:
        'Added to the end of the last heading line and set in gold — currently "Promise.". Leave blank for no gold ending.',
      group: 'intro',
    },
    {
      name: 'introText',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
      group: 'intro',
    },

    /* ---- the photo slider under the reviews ---- */
    {
      name: 'galleryLabel',
      title: 'Small label',
      type: 'string',
      description: 'The little line above the photographs — e.g. "Our Clients".',
      group: 'gallery',
    },
    {
      name: 'galleryTitle',
      title: 'Heading',
      type: 'string',
      group: 'gallery',
    },
    {
      name: 'galleryIntro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 2,
      group: 'gallery',
    },
    {
      name: 'gallery',
      title: 'Photographs',
      type: 'array',
      description:
        'The slider under the reviews — handover photographs, families in their homes, key ceremonies. Add as many as you like; they slide sideways. The whole slider stays hidden until there is at least one.',
      options: {layout: 'grid'},
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Printed under the photograph. Optional.',
            },
            {
              name: 'alt',
              title: 'Describe the photograph',
              type: 'string',
              description:
                'For screen readers and search — "the Mehta family on handover day", not "photo". Falls back to the caption.',
            },
          ],
        },
      ],
      group: 'gallery',
    },

    /* ---- the strip at the foot of the page ---- */
    {
      name: 'stripTitle',
      title: 'Heading',
      type: 'string',
      group: 'closing',
    },
    {
      name: 'stripHighlight',
      title: 'Heading — the gold words',
      type: 'string',
      description: 'Added to the end of that heading in gold — currently "Trust.".',
      group: 'closing',
    },
    {
      name: 'stripText',
      title: 'Paragraph',
      type: 'text',
      rows: 3,
      group: 'closing',
    },
    {
      name: 'stripButton',
      title: 'Button',
      type: 'string',
      group: 'closing',
    },
  ],

  preview: {
    prepare: () => ({title: 'Testimonials page'}),
  },
}
