/* One document per card in Section V — Our Collection.
   Field names match what projects.html reads in its GROQ query; renaming a
   field here means renaming it there too. */
export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fieldsets: [
    {
      name: 'detail',
      title: 'Detail page',
      description:
        'Everything on project.html?p=<slug> — leave any of it blank and that part is ' +
        'simply not shown on the page.',
      options: {collapsible: true, collapsed: true},
    },
  ],
  fields: [
    {
      name: 'name',
      title: 'Project name',
      type: 'string',
      description: 'Shown as the card heading, e.g. "Raajlaxmi Heights".',
      validation: (R) => R.required(),
    },
    {
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      description:
        'Used for the detail page address, e.g. a slug of "romal-kirti" is served at ' +
        'project.html?p=romal-kirti. Press Generate to derive it from the name.',
      options: {source: 'name', maxLength: 60},
      validation: (R) => R.required(),
    },
    {
      name: 'image',
      title: 'Card image',
      type: 'image',
      description:
        'The photograph on the card. Landscape crops work best (roughly 700×540). ' +
        'Use the hotspot tool to set what must stay in frame when it is cropped.',
      options: {hotspot: true},
    },
    {
      /* TICK BOXES, NOT A RADIO, SINCE 7 NOV — a project can be listed in more
         than one place. "Ongoing" says how far built it is and
         "Redevelopment" says what kind of project it is; those are two
         different questions, and a redevelopment under construction is
         honestly both. The old single `stage` could not say that: asked for
         Krishna Niwas and Shanti Niwas on both pages, it had to lose one. */
      name: 'stages',
      title: 'Listings',
      type: 'array',
      of: [{type: 'string'}],
      description:
        'Which pages this project is listed on — tick as many as apply. ' +
        'Completed → projects.html?status=completed, Ongoing → projects-ongoing.html, ' +
        'Redevelopment → projects-redevelopment.html. It always appears on the full ' +
        'collection as well. A project under construction on a redevelopment plot is ' +
        'both Ongoing and Redevelopment.',
      options: {
        list: [
          {title: 'Completed', value: 'completed'},
          {title: 'Ongoing', value: 'ongoing'},
          {title: 'Redevelopment', value: 'redevelopment'},
        ],
        layout: 'grid',
      },
      validation: (R) => R.required().min(1).unique(),
    },
    {
      /* SUPERSEDED BY `stages`, KEPT AND HIDDEN — not deleted. Every document
         was migrated by `studio/scripts/stages-migrate.mjs`, but the pages
         still read this as a fallback (`stagesOf`), so a document created by
         some older path, or restored from history, still lands on the right
         listing instead of vanishing. Hidden rather than removed because an
         unknown field left in a document shows as a schema warning on every
         edit, and because deleting it would throw away the only record of what
         each project was filed as before the change. */
      name: 'stage',
      title: 'Listing (superseded)',
      type: 'string',
      hidden: true,
      readOnly: true,
    },
    {
      name: 'status',
      title: 'Status badge',
      type: 'string',
      description:
        'The pill on the photograph. Leave empty and it shows the Listing above. ' +
        'Set it when the badge should read something the listing does not, e.g. a ' +
        'Completed project whose badge should say "Ready Possession".',
    },
    {
      /* A FLAG, NOT A `status` STRING. "Sold Out" could have been typed into
         the badge above, but the listing has to SORT on this — sold-out
         properties go to the foot of the collection — and sorting on free
         text means one typo ("Sold out", "SOLD OUT", "Sold-out") silently
         puts a card back at the top. A boolean cannot be misspelled.
         It is also independent of the listing: an Ongoing project can be sold
         out off-plan, which is true of two of the eight today. */
      name: 'soldOut',
      title: 'Sold out',
      type: 'boolean',
      initialValue: false,
      description:
        'Tick this and the card drops to the bottom of the collection with a SOLD OUT ' +
        'stamp across it. The project keeps its own page and stays fully readable — ' +
        'it is marked as gone, not hidden.',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Small gold label above the name, e.g. "Residential", "Luxury Villas".',
      validation: (R) => R.required(),
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description:
        'Written as "Area, City" — the site builds the city filter chips from the part ' +
        'before the comma, so keep that format.',
      validation: (R) => R.required(),
    },
    {
      name: 'blurb',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'One or two lines. Long copy is clamped on the card.',
      validation: (R) => R.max(180).warning('Longer than this gets clipped on the card.'),
    },
    {
      name: 'config',
      title: 'Configuration',
      type: 'string',
      description: 'Beds line, e.g. "2, 3 & 4 BHK" or "Office Spaces".',
    },
    {
      name: 'area',
      title: 'Area',
      type: 'string',
      description: 'e.g. "850 – 1800 Sq. Ft."',
    },
    {
      name: 'price',
      title: 'Price',
      type: 'string',
      description:
        'Printed on the project\'s card and again on its detail page — e.g. "₹1.8 Cr*" or "Price on request". Write it exactly as it should appear, symbol and all. Leave it empty and no price is shown anywhere.',
    },
    {
      name: 'detailUrl',
      title: 'Detail page',
      type: 'string',
      description:
        'Optional override. Leave this empty — "View Details" then opens the shared ' +
        'detail page at project.html?p=<slug>, which is what you want for every ' +
        'project. Only set it to send one card at a hand-built page instead.',
    },

    /* ---------- detail page (project.html?p=<slug>) ---------- */
    {
      name: 'gallery',
      title: 'Gallery images',
      type: 'array',
      description:
        'The slideshow at the top of the detail page. The first image is shown first. ' +
        'Landscape, roughly 1400×1160. With none, the card image is used on its own.',
      fieldset: 'detail',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              title: 'Describe the image',
              type: 'string',
              description: 'Read aloud by screen readers, e.g. "Living room".',
            },
          ],
        },
      ],
    },
    {
      name: 'overview',
      title: 'Overview paragraph',
      type: 'text',
      rows: 5,
      description: 'The Project Highlights paragraph on the detail page.',
      fieldset: 'detail',
    },
    /* The copy painted over the gallery. Without these the page falls back to
       the project's own name and configuration, which reads fine but is the
       same shape for every project. */
    {
      name: 'heroEyebrow',
      title: 'Over-photo — small label',
      type: 'string',
      description: 'The little line above the headline on the photograph — e.g. "Premium Residences".',
      fieldset: 'detail',
    },
    {
      name: 'heroHeading',
      title: 'Over-photo — headline',
      type: 'string',
      description:
        'The large line on the photograph. Leave blank to use the project name. Press Enter for a line break.',
      fieldset: 'detail',
    },
    {
      name: 'heroText',
      title: 'Over-photo — sentence',
      type: 'text',
      rows: 2,
      description: 'The sentence under that headline. Leave blank to build one from the configuration and location.',
      fieldset: 'detail',
    },
    {
      name: 'highlightsTitle',
      title: 'Highlights heading',
      type: 'string',
      description: 'The heading above the paragraph below — "Project Highlights" unless you change it.',
      fieldset: 'detail',
    },
    {
      /* A FILE, NOT A LINK (6 Nov). This was `brochureUrl`, a string the client
         would have had to host a PDF somewhere else to fill — which meant
         there was nowhere to put the brochure they actually have. No project
         ever had the old field set, so nothing was lost in the swap.

         Sanity serves its assets `content-disposition: inline`, so the button
         opens the PDF in the browser's own viewer rather than downloading a
         file nobody asked for. Add `?dl=name.pdf` to the URL if a forced
         download is ever wanted instead. */
      name: 'brochure',
      title: 'Brochure (PDF)',
      type: 'file',
      options: {accept: 'application/pdf'},
      description:
        'The PDF the brochure button opens, in a new tab. Leave it empty and the button reads ' +
        '"Request Brochure" and sends people to the enquiry form instead. Aim for under 10MB: a ' +
        'bigger file still works, but it is a long wait on a phone before the first page appears.',
      fieldset: 'detail',
      /* A WARNING, NEVER A BLOCK. The size is not in the asset reference, so
         this has to go and ask for it — which is also why it is a warning: a
         slow or failed lookup must never stop someone publishing. */
      validation: (Rule) =>
        Rule.custom(async (value, context) => {
          const ref = value && value.asset && value.asset._ref;
          if (!ref) return true;
          let size = 0;
          try {
            size = await context
              .getClient({apiVersion: '2024-01-01'})
              .fetch('*[_id==$id][0].size', {id: ref});
          } catch (e) {
            return true;
          }
          const mb = size / 1048576;
          return mb > 25
            ? `This brochure is ${mb.toFixed(0)}MB. It will still open, but a visitor on a phone ` +
              `waits a long time for the first page — try to get it under 10MB.`
            : true;
        }).warning(),
    },
    {
      name: 'phone',
      title: 'Direct line',
      type: 'string',
      description: 'The telephone number printed at the foot of the detail page. Leave blank to hide it.',
      fieldset: 'detail',
    },
    {
      name: 'specs',
      title: 'Specification list',
      type: 'array',
      description:
        'The detail page fact bar. The first four fill it — e.g. Total Area, Towers, ' +
        'Units, Possession.',
      fieldset: 'detail',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', title: 'Label', type: 'string', validation: (R) => R.required()},
            {name: 'value', title: 'Value', type: 'string', validation: (R) => R.required()},
          ],
          preview: {select: {title: 'label', subtitle: 'value'}},
        },
      ],
    },
    {
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      description:
        'Shown with a line icon each. The first six appear on the detail page.',
      fieldset: 'detail',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {
                list: [
                  {title: 'Gym', value: 'gym'},
                  {title: 'Pool', value: 'pool'},
                  {title: 'Clubhouse', value: 'club'},
                  {title: "Children's play", value: 'play'},
                  {title: 'Garden', value: 'garden'},
                  {title: 'Planning', value: 'planning'},
                  {title: 'Parking', value: 'parking'},
                  {title: 'Security', value: 'security'},
                  {title: 'Lift', value: 'lift'},
                  {title: 'Power backup', value: 'power'},
                ],
              },
              validation: (R) => R.required(),
            },
            {name: 'label', title: 'Label', type: 'string', validation: (R) => R.required()},
          ],
          preview: {select: {title: 'label', subtitle: 'icon'}},
        },
      ],
    },
    {
      name: 'floorPlans',
      title: 'Floor plans',
      type: 'array',
      description:
        'NOTE: the rebuilt detail page has no floor-plan section, so nothing here is ' +
        'shown on the site at the moment. Kept so the drawings are not lost.',
      fieldset: 'detail',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'title', title: 'Title', type: 'string', description: 'e.g. "2 BHK — Typical Floor"'},
            {name: 'caption', title: 'Caption', type: 'string', description: 'e.g. "850 – 1,050 Sq. Ft. · carpet area"'},
            {name: 'image', title: 'Drawing', type: 'image', validation: (R) => R.required()},
          ],
          preview: {select: {title: 'title', subtitle: 'caption', media: 'image'}},
        },
      ],
    },
    {
      name: 'address',
      title: 'Street address',
      type: 'text',
      rows: 3,
      description: 'Line breaks are kept.',
      fieldset: 'detail',
    },
    {
      name: 'geo',
      title: 'Map pin',
      type: 'geopoint',
      description:
        'Drop a pin and the detail page shows a live Google map. Without one it falls ' +
        'back to the drawn map, which also works offline.',
      fieldset: 'detail',
    },
    {
      name: 'landmarks',
      title: 'Nearby landmarks',
      type: 'array',
      description: 'The distance list beside the map.',
      fieldset: 'detail',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', title: 'Place', type: 'string', validation: (R) => R.required()},
            {name: 'distance', title: 'Distance', type: 'string', description: 'e.g. "2.4 km"'},
          ],
          preview: {select: {title: 'label', subtitle: 'distance'}},
        },
      ],
    },

    {
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers appear first. Ties fall back to creation date.',
      initialValue: 100,
    },
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'displayOrder',
      by: [{field: 'order', direction: 'asc'}, {field: '_createdAt', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'name', subtitle: 'location', stage: 'stage', media: 'image'},
    prepare({title, subtitle, stage, media}){
      const label = {completed: 'Completed', ongoing: 'Ongoing', redevelopment: 'Redevelopment'}[stage]
      return {title, subtitle: [label, subtitle].filter(Boolean).join(' · '), media}
    },
  },
}
