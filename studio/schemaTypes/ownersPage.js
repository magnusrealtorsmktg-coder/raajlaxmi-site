/* Meet Our Owners — the home page's portrait marquee, as one editable document.

   This is a *singleton*: there is exactly one, with the fixed id "owners-page"
   (see sanity.config.js → structure). index.html reads it and paints it over
   the hand-written cards in Section XI.

   The id is a leftover and is kept deliberately. These fields began as a fifth
   group on the "homepage" document; on 31 Oct the section was given a page of
   its own and `scripts/move-owners.mjs` moved them here; later the same day the
   page was dropped and the marquee went back to the home page — but the content
   stayed put, because the client had filled it in by then and moving a document
   a second time to tidy up an id would have risked their work for nothing.

   The rule is the home page's, not project.html's: an empty field LEAVES the
   markup alone rather than erasing it. The list of people is the exception, and
   goes further than the rest of the home page: publishing anyone replaces the
   placeholder cards outright, and publishing NOBODY removes the whole section,
   because "[Owner name]" six times on a public home page is worse than no
   section at all. */

const lines = (name, title, description) => ({
  name,
  title,
  description,
  type: 'array',
  of: [{type: 'string'}],
})

export default {
  name: 'ownersPage',
  title: 'Meet Our Owners',
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
        'One card each, on the home page. They run past as a slow right-to-left strip, and hovering one holds the strip still and dims the others. Add as many as you like — the strip works out how many copies it needs. Until someone is added here the whole section is left off the home page.',
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
              rows: 8,
              description:
                'Shown when someone opens this person from the home page — hovering their card enlarges it and opens a panel with the portrait on the left and this on the right. It is NOT printed on the card itself, so there is room: a few paragraphs read better here than one line, and the panel scrolls if it runs long. Blank simply leaves that half of the panel to the name and the role.',
            },
            {
              name: 'photo',
              title: 'Portrait',
              type: 'image',
              options: {hotspot: true},
              description:
                'A portrait, taller than it is wide. The card is 3:4 and the copy sits over the bottom third, so leave room there — set the hotspot on the face if the crop needs steering.',
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
    prepare: () => ({title: 'Meet Our Owners'}),
  },
}
