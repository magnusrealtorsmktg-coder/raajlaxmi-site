/* The home page, as one editable document.

   This is a *singleton*: there is exactly one, with the fixed id "homepage"
   (see sanity.config.js → structure). The client edits it; index.html reads it
   and paints it over the hand-written markup.

   One rule, and it is the opposite of project.html's: an empty field here
   LEAVES the markup alone rather than erasing it. The copy written into
   index.html is real, designed content — not another project's leftovers — so
   a blank field means "nothing to say about this", not "clear the page". That
   is what lets the client fill this in one piece at a time without the home
   page going blank in between. */

const lines = (name, title, description) => ({
  name,
  title,
  description,
  type: 'array',
  of: [{type: 'string'}],
})

export default {
  name: 'homepage',
  title: 'Home page',
  type: 'document',

  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'about', title: 'About'},
    {name: 'signature', title: 'Signature Projects'},
  ],

  fields: [
    /* ---------------- HERO ---------------- */
    {
      ...lines(
        'heroHeadline',
        'Headline',
        'One line per row — each animates in on its own. Three lines is what the design was drawn for; more will still work but will crowd the screen on a phone.',
      ),
      group: 'hero',
    },
    {
      name: 'heroSub',
      title: 'Sub-headline',
      type: 'text',
      rows: 3,
      description: 'The paragraph under the headline.',
      group: 'hero',
    },
    {
      ...lines('heroPropertyOptions', 'Property options', 'The choices in the "Property" dropdown, in order.'),
      group: 'hero',
    },
    {
      ...lines('heroLocationOptions', 'Location options', 'The choices in the "Location" dropdown, in order.'),
      group: 'hero',
    },
    {
      ...lines('heroBudgetOptions', 'Budget options', 'The choices in the "Budget" dropdown, in order.'),
      group: 'hero',
    },
    {
      name: 'heroButton',
      title: 'Button label',
      type: 'string',
      description: 'The button under the three dropdowns.',
      group: 'hero',
    },

    /* ---------------- ABOUT ---------------- */
    {
      name: 'aboutLabel',
      title: 'Small label',
      type: 'string',
      description: 'The little line above the section — currently "About Raajlaxmi".',
      group: 'about',
    },
    {
      name: 'aboutGhost',
      title: 'Ghost word',
      type: 'string',
      description: 'The large faint word set behind the copy — currently "Legacy". One word reads best.',
      group: 'about',
    },
    {
      ...lines('aboutHeading', 'Heading', 'One line per row. Two lines is the design.'),
      group: 'about',
    },
    {
      name: 'aboutParagraphs',
      title: 'Paragraphs',
      type: 'array',
      of: [{type: 'text', rows: 3}],
      description: 'One paragraph per row. Add or remove rows freely.',
      group: 'about',
    },
    {
      name: 'aboutImage',
      title: 'Photograph',
      type: 'image',
      options: {hotspot: true},
      description:
        'The plate beside the copy. It is cropped tall (roughly 5:6.6), so a portrait photograph suits it best — set the hotspot to keep the subject in frame.',
      group: 'about',
    },
    {
      name: 'stats',
      title: 'The figures',
      type: 'array',
      description:
        'The counting numbers under the copy — four is the design. Each one counts up from zero when the section comes into view.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'value',
              title: 'Number',
              type: 'number',
              description: 'Digits only — no "+" and no word. Those go in the two fields below.',
              validation: (R) => R.required(),
            },
            {
              name: 'decimals',
              title: 'Decimal places',
              type: 'number',
              description: 'Leave blank for whole numbers. Set to 1 for a figure like 0.9, or it will round to 1.',
            },
            {
              name: 'unit',
              title: 'Word after the number',
              type: 'string',
              description: 'Optional, set in dark ink — e.g. "Million" in "0.9 Million+".',
            },
            {
              name: 'suffix',
              title: 'Symbol after that',
              type: 'string',
              description: 'Optional, set in gold — usually "+".',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'text',
              rows: 2,
              description: 'The label under the figure. Press Enter for a line break.',
              validation: (R) => R.required(),
            },
          ],
          preview: {
            select: {value: 'value', unit: 'unit', suffix: 'suffix', caption: 'caption'},
            prepare: ({value, unit, suffix, caption}) => ({
              title: `${value ?? ''}${unit ? ' ' + unit : ''}${suffix || ''}`,
              subtitle: (caption || '').replace(/\n/g, ' '),
            }),
          },
        },
      ],
      group: 'about',
    },

    /* ---------------- SIGNATURE PROJECTS ---------------- */
    {
      name: 'signatureLabel',
      title: 'Small label',
      type: 'string',
      group: 'signature',
    },
    {
      ...lines('signatureHeading', 'Heading', 'One line per row. Two lines is the design.'),
      group: 'signature',
    },
    {
      name: 'signatureIntro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
      group: 'signature',
    },
    {
      name: 'signatureCards',
      title: 'The four cards',
      type: 'array',
      description:
        'The featured projects on the home page. Four is what the grid was drawn for — fewer will leave the row short, more will wrap to a second row.',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'name', title: 'Project name', type: 'string', validation: (R) => R.required()},
            {name: 'category', title: 'Category', type: 'string', description: 'The small line above the name — e.g. "Residential".'},
            {name: 'location', title: 'Location', type: 'string'},
            {name: 'description', title: 'Short description', type: 'text', rows: 3},
            {name: 'image', title: 'Card photograph', type: 'image', options: {hotspot: true}},
            {
              name: 'link',
              title: 'Link',
              type: 'string',
              description:
                'Where "View Project" goes. Use project.html?p=the-slug to point at a project\'s detail page, or leave blank to keep the card unlinked.',
            },
          ],
          preview: {
            select: {title: 'name', subtitle: 'location', media: 'image'},
          },
        },
      ],
      group: 'signature',
    },
  ],

  preview: {
    prepare: () => ({title: 'Home page'}),
  },
}
