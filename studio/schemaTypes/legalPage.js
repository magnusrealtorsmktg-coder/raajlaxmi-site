/* One of the three legal pages, as an editable document.

   There are exactly three, with fixed ids, one per file:

     legal-privacy     -> privacy.html
     legal-terms       -> terms.html
     legal-disclaimer  -> disclaimer.html

   Same arrangement as `collectionPage`, which has four fixed ids for the same
   reason: one schema, one page-side block, no per-page code to keep in step.

   THE RULE HERE IS NOT THE REST OF THE SITE'S. Everywhere else the markup is a
   design fallback and the CMS is the real content. On these three pages the
   markup is a legal position: if Sanity is unreachable, the text written into
   the HTML is what a visitor is held to. So a blank field leaves the markup
   alone rather than clearing it, and anyone editing here should keep the copy
   in the file in step rather than letting the two drift.

   None of this is legal advice. The copy shipped with the site is a drafted
   starting point for an Indian real-estate developer and carries [bracketed
   blanks] where it needs facts only the client has. It wants a lawyer's eye
   before launch. */

export default {
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',

  fields: [
    {
      name: 'label',
      title: 'Small label',
      type: 'string',
      description: 'The little line above the heading — currently "Legal".',
    },
    {
      name: 'title',
      title: 'Page title',
      type: 'string',
      description:
        'Also used for the browser tab, as "<title> — Raajlaxmi Group". The gold full stop is added for you.',
      validation: (R) => R.required(),
    },
    {
      name: 'updated',
      title: 'Last updated',
      type: 'date',
      description:
        'Printed under the title as "Last updated 2 November 2026". Change it whenever the wording changes — on a legal page the date is part of the content.',
      options: {dateFormat: 'D MMMM YYYY'},
    },
    {
      name: 'intro',
      title: 'Opening paragraph',
      type: 'text',
      rows: 4,
      description: 'The lead paragraph, before the numbered clauses.',
    },
    {
      name: 'sections',
      title: 'Clauses',
      type: 'array',
      description:
        'The numbered sections, in order. They are numbered 01, 02, 03… for you by position — do not type the numbers, and inserting one in the middle renumbers the rest by itself.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'heading',
              title: 'Heading',
              type: 'string',
              validation: (R) => R.required(),
            },
            {
              name: 'body',
              title: 'Text',
              type: 'text',
              rows: 10,
              description:
                'Plain text. Leave a blank line between paragraphs and they are set as separate paragraphs; a web address or an email address anywhere in it becomes a link by itself. No other markup is needed, and none is interpreted.',
            },
          ],
          preview: {
            select: {title: 'heading', subtitle: 'body'},
            prepare: (s) => ({
              title: s.title,
              subtitle: (s.subtitle || '').replace(/\s+/g, ' ').slice(0, 90),
            }),
          },
        },
      ],
    },
    {
      name: 'noteTitle',
      title: 'Closing panel — heading',
      type: 'string',
      description: 'The gold-tinted panel at the foot of the page.',
    },
    {
      name: 'noteBody',
      title: 'Closing panel — text',
      type: 'text',
      rows: 5,
    },
  ],

  preview: {
    select: {title: 'title', subtitle: 'updated'},
    prepare: (s) => ({
      title: s.title || 'Legal page',
      subtitle: s.subtitle ? 'Last updated ' + s.subtitle : 'No date set',
    }),
  },
}
