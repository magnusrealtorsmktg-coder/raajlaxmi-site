/* Everything on contact.html. A singleton with the fixed id "contact-page".

   Same rule as the other pages: a blank field leaves the markup alone rather
   than erasing it, so a half-filled document can never strip the page back.

   The form itself is not in here — it has no backend yet, so there is nothing
   to configure beyond its wording. */

export default {
  name: 'contactPage',
  title: 'Contact page',
  type: 'document',

  groups: [
    {name: 'intro', title: 'Heading', default: true},
    {name: 'details', title: 'Contact details'},
    {name: 'form', title: 'Enquiry card'},
    {name: 'location', title: 'Location'},
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
      description: 'Added to the end of the last line and set in gold — currently "Chapter.".',
      group: 'intro',
    },
    {
      name: 'introText',
      title: 'Intro paragraph',
      type: 'text',
      rows: 4,
      group: 'intro',
    },

    {
      name: 'items',
      title: 'The four boxes',
      type: 'array',
      description:
        'Call Us / Email Us / Visit Us / Business Hours. Four is the design — they sit in a two-by-two grid.',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'title', title: 'Heading', type: 'string', validation: (R) => R.required()},
            {
              name: 'text',
              title: 'What it says',
              type: 'text',
              rows: 2,
              description: 'Press Enter for a line break.',
              validation: (R) => R.required(),
            },
            {
              name: 'link',
              title: 'Make it a link',
              type: 'string',
              description:
                'Optional. A telephone number as tel:+919890823288, an address as mailto:… , or a full https:// link. Leave blank for plain text.',
            },
          ],
          preview: {
            select: {title: 'title', subtitle: 'text'},
            prepare: ({title, subtitle}) => ({title, subtitle: (subtitle || '').replace(/\n/g, ' ')}),
          },
        },
      ],
      group: 'details',
    },

    {
      name: 'cardTitle',
      title: 'Card heading',
      type: 'string',
      description: 'The heading on the enquiry card — currently "Book a Private Consultation".',
      group: 'form',
    },
    {
      name: 'cardText',
      title: 'Card paragraph',
      type: 'text',
      rows: 3,
      group: 'form',
    },
    {
      name: 'cardButton',
      title: 'Button',
      type: 'string',
      group: 'form',
    },
    {
      name: 'thanksTitle',
      title: 'After sending — heading',
      type: 'string',
      description: 'Shown once someone submits the form.',
      group: 'form',
    },
    {
      name: 'thanksText',
      title: 'After sending — message',
      type: 'text',
      rows: 3,
      description:
        'Leave blank to keep the built-in line, which greets the sender by their first name.',
      group: 'form',
    },

    {
      name: 'locationTitle',
      title: 'Heading',
      type: 'string',
      group: 'location',
    },
    {
      name: 'locationText',
      title: 'Paragraph',
      type: 'text',
      rows: 4,
      group: 'location',
    },
    {
      name: 'locationButton',
      title: 'Button',
      type: 'string',
      description: 'The button that opens directions — currently "Get Directions".',
      group: 'location',
    },
    {
      name: 'geo',
      title: 'Map pin',
      type: 'geopoint',
      description:
        'Drop the pin on the office. It drives both the embedded map and the directions button. Leave it alone to keep the current location.',
      group: 'location',
    },
  ],

  preview: {
    prepare: () => ({title: 'Contact page'}),
  },
}
