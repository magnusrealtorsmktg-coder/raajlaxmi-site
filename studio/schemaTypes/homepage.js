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
    {name: 'why', title: 'Why Raajlaxmi'},
    {name: 'signature', title: 'Signature Projects'},
    {name: 'owners', title: 'Meet Our Owners'},
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
    /* The hero's background. A video wins over a photograph, and a photograph
       wins over the picture built into index.html — so the client can replace
       the skyline without anyone touching the file. */
    {
      name: 'heroImage',
      title: 'Background photograph',
      type: 'image',
      options: {hotspot: true},
      description:
        'Replaces the night skyline behind the headline. It is cropped to fill whatever shape the screen is, so set the hotspot on the part that must stay visible. A wide, dark-ish picture works best — the headline sits over the left of it in white. Leave blank to keep the built-in skyline.',
      group: 'hero',
    },
    {
      name: 'heroVideo',
      title: 'Background video',
      type: 'file',
      options: {accept: 'video/mp4,video/webm,video/quicktime'},
      description:
        'Plays silently on a loop behind the headline, and is used instead of the photograph above when both are set. Keep it short and small — under about 10 seconds and 8MB — because every visitor downloads it. It is skipped on phones and when a visitor has data-saving on, so set a photograph above as well: that is what they will see.',
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
      name: 'aboutVideo',
      title: 'Video instead of the photograph',
      type: 'file',
      options: {accept: 'video/mp4,video/webm,video/quicktime'},
      description:
        'Plays silently on a loop in place of the photograph above. Keep it short and small — under about 10 seconds and 8MB. It is skipped on phones and for visitors with data-saving on, so set the photograph as well: that is what they will see.',
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

    /* ---------------- WHY RAAJLAXMI ---------------- */
    {
      name: 'whyLabel',
      title: 'Small label',
      type: 'string',
      group: 'why',
    },
    {
      name: 'whyHeading',
      title: 'Heading',
      type: 'array',
      of: [{type: 'string'}],
      description: 'One line per row. Two lines is the design — the gold full stop is added for you.',
      group: 'why',
    },
    {
      name: 'whyIntro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
      group: 'why',
    },
    {
      name: 'whyImage',
      title: 'Banner photograph',
      type: 'image',
      options: {hotspot: true},
      description:
        'The wide picture under the heading — currently the group photograph. It is cropped wide, so set the hotspot on the people.',
      group: 'why',
    },
    {
      name: 'whyVideo',
      title: 'Video instead of that photograph',
      type: 'file',
      options: {accept: 'video/mp4,video/webm,video/quicktime'},
      description:
        'Same rules as the others: silent, looping, skipped on phones and for data-saving visitors. Set the photograph above as well.',
      group: 'why',
    },
    {
      name: 'whyRows',
      title: 'The numbered points',
      type: 'array',
      description: 'Four is the design. They are numbered 01, 02, 03… for you — do not type the numbers.',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'title', title: 'Heading', type: 'string', validation: (R) => R.required()},
            {name: 'text', title: 'Paragraph', type: 'text', rows: 3},
          ],
          preview: {select: {title: 'title', subtitle: 'text'}},
        },
      ],
      group: 'why',
    },
    {
      name: 'whyTimeline',
      title: 'The timeline',
      type: 'array',
      description: 'The dated points down the gold line. Four is the design.',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'year', title: 'Year', type: 'string', validation: (R) => R.required()},
            {
              name: 'text',
              title: 'What happened',
              type: 'text',
              rows: 2,
              description: 'Press Enter for a line break.',
            },
          ],
          preview: {
            select: {title: 'year', subtitle: 'text'},
            prepare: ({title, subtitle}) => ({title, subtitle: (subtitle || '').replace(/\n/g, ' ')}),
          },
        },
      ],
      group: 'why',
    },
    {
      name: 'whyQuote',
      title: 'Closing quote',
      type: 'text',
      rows: 3,
      description: 'No quotation marks — the section draws its own.',
      group: 'why',
    },
    {
      name: 'whyQuoteBy',
      title: 'Quote — who said it',
      type: 'string',
      description: 'The line under the quote. The dash is added for you.',
      group: 'why',
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
        'The featured projects on the home page. Four is what the grid was drawn for — fewer will leave the row short, more will wrap to a second row. ' +
        'The quickest way to fill a card is to pick a project and leave the rest of it blank.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'project',
              title: 'Which project?',
              type: 'reference',
              to: [{type: 'project'}],
              description:
                'Pick one of your projects and the card fills itself in — the name, category, ' +
                'location, short description, photograph and the "View Project" button all follow ' +
                'that project, so editing the project keeps this card current. Everything below is ' +
                'then optional: fill a field in only to say something different here than on the ' +
                'collection card.',
            },
            {
              name: 'name',
              title: 'Project name',
              type: 'string',
              description: 'Leave blank to use the chosen project\'s own name.',
              validation: (R) =>
                R.custom((value, context) =>
                  value || (context && context.parent && context.parent.project)
                    ? true
                    : 'Pick a project above, or type a name here.'),
            },
            {
              name: 'category',
              title: 'Category',
              type: 'string',
              description: 'The small line above the name — e.g. "Residential". Blank uses the chosen project\'s own.',
            },
            {
              name: 'location',
              title: 'Location',
              type: 'string',
              description: 'Blank uses the chosen project\'s own.',
            },
            {
              name: 'description',
              title: 'Short description',
              type: 'text',
              rows: 3,
              description: 'Blank uses the chosen project\'s short description.',
            },
            {
              name: 'image',
              title: 'Card photograph',
              type: 'image',
              options: {hotspot: true},
              description: 'Blank uses the chosen project\'s card image.',
            },
            {
              name: 'link',
              title: 'Custom link',
              type: 'string',
              description:
                'Leave this blank. "View Project" then opens the chosen project\'s own detail page, ' +
                'which is what you want for every card. Only set it to send this one card somewhere ' +
                'else instead — a full web address, or project.html?p=the-slug.',
            },
          ],
          preview: {
            /* Either half of the card may be empty: a card that only points at a
               project has no name of its own to show, and one typed in by hand has
               no project to read. Show whichever is there. */
            select: {
              title: 'name',
              subtitle: 'location',
              media: 'image',
              refName: 'project.name',
              refLocation: 'project.location',
              refImage: 'project.image',
            },
            prepare: (sel) => ({
              title: sel.title || sel.refName || 'Pick a project',
              subtitle: sel.subtitle || sel.refLocation,
              media: sel.media || sel.refImage,
            }),
          },
        },
      ],
      group: 'signature',
    },

    /* ---------------- MEET OUR OWNERS ---------------- */
    {
      name: 'ownersLabel',
      title: 'Small label',
      type: 'string',
      description: 'The little line above the heading — currently "Our Leadership".',
      group: 'owners',
    },
    {
      ...lines('ownersHeading', 'Heading', 'One line per row. The design is a single row — "Meet Our Owners" — but a second will stack beneath it. Type the full stop or leave it off; the gold one is kept either way.'),
      group: 'owners',
    },
    {
      name: 'ownersIntro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
      group: 'owners',
    },
    {
      name: 'owners',
      title: 'The owners',
      type: 'array',
      description:
        'One card each. Six is what the grid was drawn for — three across, two rows. Fewer simply leaves the last row short; more wraps to a third row. Until someone is added here the whole section is left off the home page.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Name',
              type: 'string',
              description: 'As it should read on the card — e.g. "Mr. Hemant Deepak Sampat".',
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
              title: 'One line about them',
              type: 'text',
              rows: 2,
              description: 'The small line at the foot of the card — e.g. "16+ years of experience in sales and strategy."',
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
      group: 'owners',
    },
  ],

  preview: {
    prepare: () => ({title: 'Home page'}),
  },
}
