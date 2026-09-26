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
      name: 'stage',
      title: 'Listing',
      type: 'string',
      description:
        'Which page this project is listed on. Completed → projects.html?status=completed, ' +
        'Ongoing → projects-ongoing.html, Redevelopment → projects-redevelopment.html. ' +
        'It always appears on the full collection as well.',
      options: {
        list: [
          {title: 'Completed', value: 'completed'},
          {title: 'Ongoing', value: 'ongoing'},
          {title: 'Redevelopment', value: 'redevelopment'},
        ],
        layout: 'radio',
      },
      validation: (R) => R.required(),
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
      name: 'price',
      title: 'Price line',
      type: 'string',
      description: 'Shown in the fact bar, e.g. "₹1.8 Cr*". Leave empty to hide it.',
      fieldset: 'detail',
    },
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
