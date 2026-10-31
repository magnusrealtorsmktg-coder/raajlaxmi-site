/* The Owners page, as one editable document.

   This is a *singleton*: there is exactly one, with the fixed id "owners-page"
   (see sanity.config.js → structure). owners.html reads it and paints it over
   the hand-written markup.

   These fields used to be a fifth group on the "homepage" document, when the
   owners were a marquee between Why Raajlaxmi and Brands We Use. They moved
   here with the section itself; `scripts/move-owners.mjs` carries the client's
   entries across and clears the old fields off the home page. Until that is
   run, owners.html falls back to reading them from "homepage", so the page is
   never empty in between.

   The rule is the home page's, not project.html's: an empty field LEAVES the
   markup alone rather than erasing it. The exception is the list of people —
   publishing anyone replaces the bracketed placeholder rows outright, because
   a real owner shown next to "[Owner name]" is worse than either on its own. */

const lines = (name, title, description) => ({
  name,
  title,
  description,
  type: 'array',
  of: [{type: 'string'}],
})

export default {
  name: 'ownersPage',
  title: 'Owners page',
  type: 'document',

  fields: [
    {
      name: 'label',
      title: 'Small label',
      type: 'string',
      description: 'The little line above the heading — currently "Our Leadership".',
    },
    lines(
      'heading',
      'Heading',
      'One line per row. The design is a single row — "Meet Our Owners" — but a second will stack beneath it. Type the full stop or leave it off; the gold one is kept either way.',
    ),
    {
      name: 'intro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
    },
    {
      name: 'owners',
      title: 'The owners',
      type: 'array',
      description:
        'One row each, in this order: the portrait on the left, everything you write here on the right. Add as many as you like — the rows simply continue down the page. Publishing anyone here replaces the placeholder rows on the page.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Name',
              type: 'string',
              description: 'As it should read on the page — e.g. "Mr. Hemant Deepak Sampat".',
              validation: (R) => R.required(),
            },
            {
              name: 'role',
              title: 'Role',
              type: 'text',
              rows: 3,
              description:
                'The gold line under the name. Set in capitals by the page, so type it normally — e.g. "Board Member – Sales Strategy & Administration | People-Centric Leader".',
            },
            {
              name: 'bio',
              title: 'About them',
              type: 'text',
              rows: 6,
              description:
                'The paragraph beside the portrait. This has room now that it is not sitting on top of the photograph — a few sentences read better here than one line.',
            },
            {
              name: 'photo',
              title: 'Portrait',
              type: 'image',
              options: {hotspot: true},
              description:
                'A portrait, taller than it is wide. The plate is 5:6 and nothing covers it any more, so the whole picture is on show — set the hotspot on the face and the crop follows it.',
            },
          ],
          preview: {
            select: {title: 'name', subtitle: 'role', media: 'photo'},
          },
        },
      ],
    },
  ],

  preview: {
    prepare: () => ({title: 'Owners page'}),
  },
}
