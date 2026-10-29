/* The chrome around a listing page — everything on projects.html,
   projects-ongoing.html and projects-redevelopment.html that is NOT a project
   card: the heading, the intro, the banner artwork and the consultation strip.

   There are four of these, each with a fixed id, and each is a singleton
   reached from the sidebar (see sanity.config.js → structure):

     collection-all            → projects.html            (browse everything)
     collection-completed      → projects.html?status=completed
     collection-ongoing        → projects-ongoing.html
     collection-redevelopment  → projects-redevelopment.html

   There are four rather than three because projects.html does double duty: it
   is both the browse-all page and the Completed view, and the two want
   different headings.

   Same rule as the home page: a blank field LEAVES the markup alone rather
   than erasing it, so the pages can never come up empty. */

export default {
  name: 'collectionPage',
  title: 'Listing page',
  type: 'document',

  fields: [
    {
      name: 'pageTitle',
      title: 'Which page this is',
      type: 'string',
      readOnly: true,
      description: 'Set when the page was created — it tells you which of the listings you are editing.',
    },
    {
      name: 'label',
      title: 'Small label',
      type: 'string',
      description: 'The little line above the heading — e.g. "Our Collection".',
    },
    {
      name: 'heading',
      title: 'Heading',
      type: 'array',
      of: [{type: 'string'}],
      description: 'One line per row. Two lines is the design — the second ends with the gold full stop, which is added for you.',
    },
    {
      name: 'intro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
    },
    {
      name: 'bannerLabel',
      title: 'Banner — small label',
      type: 'string',
      description: 'The little line above the banner — e.g. "Completed Projects". Leave blank to hide it.',
    },
    {
      name: 'bannerTitle',
      title: 'Banner — heading',
      type: 'string',
      description: 'The heading above the banner. The gold full stop is added for you.',
    },
    {
      name: 'banner',
      title: 'Banner artwork',
      type: 'image',
      description:
        'The wide plate under the cards. The copy in these banners is painted into the picture, so whatever it says, repeat it in the description below — that is what screen readers and Google read.',
      fields: [
        {
          name: 'alt',
          title: 'What the banner says',
          type: 'text',
          rows: 3,
          description: 'Write out the text that is printed inside the artwork.',
        },
      ],
    },
    {
      name: 'emptyMessage',
      title: 'When nothing matches',
      type: 'string',
      description:
        'Shown when a filter leaves no properties — e.g. if someone picks a city with nothing in it. Leave blank for the built-in wording.',
    },

    /* ---- the consultation strip at the foot of the page ---- */
    {
      name: 'ctaTitle',
      title: 'Closing strip — heading',
      type: 'string',
    },
    {
      name: 'ctaText',
      title: 'Closing strip — paragraph',
      type: 'text',
      rows: 3,
    },
    {
      name: 'ctaButton',
      title: 'Closing strip — button',
      type: 'string',
    },
  ],

  preview: {
    select: {title: 'pageTitle', subtitle: 'label', media: 'banner'},
    prepare: ({title, subtitle, media}) => ({
      title: title || 'Listing page',
      subtitle,
      media,
    }),
  },
}
