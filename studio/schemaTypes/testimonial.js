/* One document per client review — the cards in the carousel on
   testimonials.html. Field names match what that page reads in its GROQ query;
   renaming one here means renaming it there too. */

export default {
  name: 'testimonial',
  title: 'Review',
  type: 'document',

  fields: [
    {
      name: 'quote',
      title: 'What they said',
      type: 'text',
      rows: 5,
      description: 'The review itself. No quotation marks — the card draws its own.',
      validation: (R) => R.required(),
    },
    {
      name: 'name',
      title: 'Who said it',
      type: 'string',
      description: 'e.g. "The Mehta Family" or "Mr. Arvind Sharma".',
      validation: (R) => R.required(),
    },
    {
      name: 'at',
      title: 'Which home',
      type: 'string',
      description: 'The line under the name — e.g. "Priti Darpan, Saphale".',
    },
    {
      name: 'portrait',
      title: 'Photograph',
      type: 'image',
      options: {hotspot: true},
      description:
        'The small round picture beside the name. It is cropped to a circle, so set the hotspot on the face. Leave blank and a plain tone is shown instead.',
    },
    {
      name: 'googleUrl',
      title: 'Google review link',
      type: 'url',
      description:
        'Paste the link to this review on Google. A small Google button appears in the corner of the card and opens it in a new tab — leave this empty and no button is shown. To get it: find the review on your Google Business profile, use Share, and copy the link.',
      validation: (R) => R.uri({scheme: ['http', 'https']}),
    },
    {
      name: 'stars',
      title: 'Stars',
      type: 'number',
      description: 'Out of five. Leave blank for five.',
      validation: (R) => R.min(1).max(5).integer(),
    },
    {
      name: 'order',
      title: 'Position',
      type: 'number',
      description: 'Lower numbers come first in the carousel. Leave blank and the oldest go first.',
    },
  ],

  orderings: [
    {
      title: 'Position',
      name: 'order',
      by: [
        {field: 'order', direction: 'asc'},
        {field: '_createdAt', direction: 'asc'},
      ],
    },
  ],

  preview: {
    select: {title: 'name', subtitle: 'at', media: 'portrait'},
  },
}
