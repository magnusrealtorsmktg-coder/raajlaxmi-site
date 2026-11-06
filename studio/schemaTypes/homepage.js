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
      title: 'Background video (wide screens)',
      type: 'file',
      options: {accept: 'video/mp4,video/webm,video/quicktime'},
      description:
        'Plays silently on a loop behind the search box on laptops, desktops and tablets held sideways, and is used instead of the photograph above when both are set. Give it a LANDSCAPE shape — a tall video here is cropped to the sides. Keep it small, around 4MB, because every visitor downloads it. Set a photograph above as well: that is what shows while this loads, and if it fails.',
      group: 'hero',
    },
    {
      name: 'heroVideoMobile',
      title: 'Background video (phones, held upright)',
      type: 'file',
      options: {accept: 'video/mp4,video/webm,video/quicktime'},
      description:
        'A PORTRAIT cut of the same film, for phones and tablets held upright. A wide video on an upright phone loses about three quarters of its width, which is why this exists. Leave it empty and the site uses the portrait film built into it. A phone turned sideways gets the wide video above, not this one.',
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
        'Each card is one of your projects: pick it, and the name, category, location, description, photograph and the ' +
        '"View Project" button all follow that project. To change what a card says, or to add a gallery, a price or ' +
        'specifications behind it, open the project itself — the home page and the collection page then agree by themselves.',
      of: [
        {
          type: 'object',
          /* The overrides are collapsed, and that is the point of this whole
             object. A card is meant to BE a project: pick one and everything
             follows it, so the gallery, the price, the overview and the specs
             the client adds to that project reach the home page and the detail
             page together, with nothing to retype. Left open, the override
             fields read as the form -- which is how all four cards came to be
             typed in by hand with no project behind them at all, and how one of
             them ended up pointing at nothing.
             An override that IS filled still shows through the collapsed
             summary, which is what makes the two or three deliberate
             disagreements easy to find and settle. */
          fieldsets: [
            {
              name: 'overrides',
              title: 'Say something different on this card (optional)',
              description:
                'Leave all of this empty. The card already shows what the project says, and ' +
                'editing the project updates the home page and the collection page together. ' +
                'Fill a field in here only when this one card should read differently from ' +
                'the project — and clear it again to hand the wording back to the project.',
              options: {collapsible: true, collapsed: true},
            },
          ],
          fields: [
            {
              name: 'project',
              title: 'Which project?',
              type: 'reference',
              to: [{type: 'project'}],
              description:
                'Pick one of your projects and the card fills itself in — the name, category, ' +
                'location, short description, photograph and the "View Project" button all follow ' +
                'that project, so editing the project keeps this card current. Open the project ' +
                'to add its gallery, price, overview, specifications and amenities; those appear ' +
                'on its own page, which is where "View Project" goes.',
              validation: (R) => R.required(),
            },
            {
              fieldset: 'overrides',
              name: 'name',
              title: 'Project name',
              type: 'string',
              description: 'Leave blank to use the chosen project\'s own name.',
            },
            {
              fieldset: 'overrides',
              name: 'category',
              title: 'Category',
              type: 'string',
              description: 'The small line above the name — e.g. "Residential". Blank uses the chosen project\'s own.',
            },
            {
              fieldset: 'overrides',
              name: 'location',
              title: 'Location',
              type: 'string',
              description: 'Blank uses the chosen project\'s own.',
            },
            {
              fieldset: 'overrides',
              name: 'description',
              title: 'Short description',
              type: 'text',
              rows: 3,
              description: 'Blank uses the chosen project\'s short description.',
            },
            {
              fieldset: 'overrides',
              name: 'image',
              title: 'Card photograph',
              type: 'image',
              options: {hotspot: true},
              description: 'Blank uses the chosen project\'s card image.',
            },
            {
              fieldset: 'overrides',
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
  ],

  preview: {
    prepare: () => ({title: 'Home page'}),
  },
}
