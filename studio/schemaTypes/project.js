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
        'Upcoming → projects-upcoming.html, ' +
        'Redevelopment → projects-redevelopment.html. It always appears on the full ' +
        'collection as well. A project under construction on a redevelopment plot is ' +
        'both Ongoing and Redevelopment.',
      options: {
        list: [
          {title: 'Completed', value: 'completed'},
          {title: 'Ongoing', value: 'ongoing'},
          {title: 'Upcoming', value: 'upcoming'},
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
    /* `soldOut` IS BACK (14 Nov, the client's request), but it is not what it
       was. The old one hung a stamp over the photograph and pushed the card to
       the foot of the collection; this one only puts the stamp in the card's
       footer, beside View Details. THE ORDER OF THE COLLECTION IS UNCHANGED —
       a sold-out project stays exactly where `order` puts it.

       It was removed on 9 Nov and `scripts/retire-sold-out.mjs` has since been
       run, so every document starts clean: no project carries a stale `true`
       and nothing lights up on its own. */
    {
      name: 'soldOut',
      title: 'Sold out',
      type: 'boolean',
      initialValue: false,
      description:
        'Puts the SOLD OUT stamp in the corner of this project\u2019s card, next to ' +
        'View Details. It changes nothing else \u2014 the card keeps its place in the ' +
        'list and its OC RECEIVED mark.',
    },
    {
      /* THE OC MARK WAS UNCONDITIONAL UNTIL 16 NOV, on every card including
         the Ongoing ones, which cannot hold a certificate yet. The client
         supplied the nine properties that actually have one; this is the
         field that says so per project.

         UNTIL IT IS FILLED IN, the pages fall back to a list of those nine
         names written into the card block of index.html and the four
         collection files. A value here - ticked OR cleared - wins over that
         list outright, so it takes effect the moment it is set. Once every
         project carries the field those lists are dead and should go. */
      name: 'ocReceived',
      title: 'OC received',
      type: 'boolean',
      description:
        'Shows the OC RECEIVED stamp on the corner of this project\u2019s ' +
        'photograph. Tick it only where an Occupancy Certificate has actually ' +
        'been issued - a project still under construction cannot have one.',
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
      /* The per-configuration breakdown the card prints when it has one:
         "315 \u2013 373 Sq. Ft. for 1 BHK", one row each. It REPLACES the
         Configuration and Area pair on the card when filled, and those two
         stay as they are \u2014 they still feed the detail page's fact bar and
         its heading line, and they are what the card falls back to. So a
         project with nothing here looks exactly as it did. */
      name: 'sizes',
      title: 'Configurations \u2014 size and price',
      type: 'array',
      description:
        'One row per flat type: the size and the price for THAT flat. Fill it ' +
        'in and the card lists them \u2014 "315 \u2013 373 Sq. Ft. for 1 BHK", ' +
        'with the price under each \u2014 instead of the single Configuration, ' +
        'Area and Price lines above. Leave it empty and nothing changes.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'config',
              title: 'Configuration',
              type: 'string',
              description: 'e.g. "1 BHK", "2 BHK", "Shop".',
              validation: (R) => R.required(),
            },
            {
              name: 'area',
              title: 'Area',
              type: 'string',
              description:
                'e.g. "315 \u2013 373 Sq. Ft.". Written exactly as it should read. ' +
                'Optional \u2014 leave it empty to price a configuration without ' +
                'quoting a size.',
            },
            {
              /* THE PRICE OF THIS FLAT, AND NOTHING ELSE IN IT.
                 This field exists because the single free-text Price above it
                 could not be filtered on: written as "42 Lacs Onwards for 1
                 BHK & 60 Lacs Onwards for 2 BHK", the budget search read the
                 "1" of "1 BHK" as one rupee, the range started at zero and
                 every band matched every project. Keeping the configuration
                 out of the price string is the whole point \u2014 so do NOT
                 write "for 1 BHK" in here, that is the Configuration field
                 beside it. */
              name: 'price',
              title: 'Price',
              type: 'string',
              description:
                'This flat\'s price ONLY \u2014 e.g. "\u20B942 Lacs Onwards". Do not ' +
                'write the configuration in here; that is the field beside ' +
                'this one. Written exactly as it should appear, symbol and ' +
                'all. This is what the budget search reads.',
            },
          ],
          preview: {
            select: {title: 'config', subtitle: 'area', description: 'price'},
            prepare: ({title, subtitle, description}) => ({
              title: title,
              subtitle: [subtitle, description].filter(Boolean).join('  \u00B7  '),
            }),
          },
        },
      ],
    },
    {
      name: 'price',
      title: 'Price (one line, all configurations)',
      type: 'string',
      description:
        'The fallback, for a project with ONE price — e.g. "₹1.8 Cr*" or "Price on request". ' +
        'Write it exactly as it should appear, symbol and all. ' +
        'IF A FLAT TYPE HAS ITS OWN PRICE, PUT IT IN "Configurations" ABOVE INSTEAD: ' +
        'a price written here as "42 Lacs Onwards for 1 BHK & 60 Lacs Onwards for 2 BHK" ' +
        'cannot be filtered on reliably, because the budget search has to guess which ' +
        'numbers are money. Filled in above, this line is not printed at all.',
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
      name: 'walkthrough',
      title: '3D walkthrough (video)',
      type: 'file',
      options: {accept: 'video/mp4,video/webm,video/quicktime'},
      description:
        'An MP4 walkthrough of the property. Attach one and a "3D Walkthrough" button ' +
        'appears on the detail page, which plays it in an overlay; leave it empty and no ' +
        'button is shown at all. Aim for 1080p and under 50MB \u2014 the file is streamed, ' +
        'but every megabyte is counted against the monthly bandwidth allowance.',
      fieldset: 'detail',
      /* Same shape as the brochure's rule below, and the same reasoning: a
         WARNING, never a block. The asset reference does not carry the size,
         so this goes and asks for it, which is exactly why a slow or failed
         lookup has to let the publish through. */
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
          return mb > 150
            ? `This walkthrough is ${mb.toFixed(0)}MB. It will still play, but it is a long ` +
              `wait on mobile data and a large slice of the monthly bandwidth \u2014 try to ` +
              `get it under 50MB.`
            : true;
        }).warning(),
    },
    {
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
        'Add as many as the project has — the first six appear on the detail page. ' +
        'Type the name; the icon is optional and is chosen from the name when you ' +
        'leave it blank.',
      // ADD AN AMENITY WITHOUT TOUCHING THE CODE (17 Nov). This list used to be
      // a closed set: `icon` was required, and project.html ran
      // `.filter(a => ICON[a.icon])`, so an amenity whose key that page did not
      // know VANISHED — no icon, no row, no error. Adding one therefore meant
      // a developer editing two files, which is not something a client can do.
      //
      // Now `icon` is optional and project.html never drops a row. It resolves
      // the mark in three steps: the chosen icon, else one guessed from the
      // label (its ICON_GUESS table reads 'Jogging Track', 'CCTV', 'Rainwater
      // Harvesting' and so on), else a neutral tick. So a brand new amenity
      // always appears, and the worst case is a generic mark beside the
      // client's own words rather than silence.
      //
      // The list below is a convenience, not a contract. Every value in it
      // should still exist in ICON in project.html — one that does not now
      // falls back to the guess instead of disappearing, but it is sloppy.
      //
      // THERE IS NO 'Other (plain tick)' TO PICK ANY MORE (18 Nov). The tick
      // is what an unrecognised name falls back to, and that is all it is: 87
      // of the 99 amenity labels in the dataset were carrying `icon: 'check'`
      // from a seed, and because `check` is a real key in ICON it won over the
      // guess and the name was never read. The client was looking at a column
      // of ticks. project.html now treats a stored `check` as no choice at
      // all, so offering it here would be offering a setting that does
      // nothing.
      fieldset: 'detail',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description:
                'Optional. Leave it blank and the icon is picked from the name ' +
                'below — "Jogging Track", "CCTV", "Rainwater Harvesting" and most ' +
                'other ordinary names are recognised. Anything unrecognised gets a ' +
                'plain tick, so the amenity always shows.',
              options: {
                list: [
                  {title: 'Gym', value: 'gym'},
                  {title: 'Pool', value: 'pool'},
                  {title: 'Clubhouse', value: 'club'},
                  {title: "Children's play", value: 'play'},
                  {title: 'Garden', value: 'garden'},
                  {title: 'Landscaped garden', value: 'landscape'},
                  {title: 'Common green space', value: 'green'},
                  {title: 'Gazebo', value: 'gazebo'},
                  {title: 'Terrace / deck', value: 'terrace'},
                  {title: 'Jogging track', value: 'jogging'},
                  {title: 'Yoga / wellness', value: 'yoga'},
                  {title: 'Indoor games', value: 'indoor'},
                  {title: 'Sports court', value: 'sports'},
                  {title: 'Banquet hall', value: 'banquet'},
                  {title: 'Temple', value: 'temple'},
                  {title: 'Shops / retail', value: 'shop'},
                  {title: 'Parking', value: 'parking'},
                  {title: 'EV charging', value: 'ev'},
                  {title: 'Lift', value: 'lift'},
                  {title: 'Security', value: 'security'},
                  {title: 'CCTV', value: 'cctv'},
                  {title: 'Intercom', value: 'intercom'},
                  {title: 'Fire safety', value: 'fire'},
                  {title: 'Power backup', value: 'power'},
                  {title: 'Solar', value: 'solar'},
                  {title: 'Water / rainwater', value: 'water'},
                  {title: 'Wi-Fi', value: 'wifi'},
                  {title: 'Planning', value: 'planning'},
                  {title: 'Kitchen', value: 'kitchen'},
                  {title: 'Sanitary / bath', value: 'bath'},
                  {title: 'Door', value: 'door'},
                  {title: 'Windows', value: 'window'},
                  {title: 'Flooring', value: 'floor'},
                  {title: 'School / play group', value: 'school'},
                  {title: 'Electrical', value: 'electric'},
                  {title: 'Waste management', value: 'waste'},
                  {title: 'Footpath / internal road', value: 'path'},
                  {title: 'Street lighting', value: 'streetlight'},
                  {title: 'Star gazing', value: 'star'},
                  {title: 'Barbeque', value: 'bbq'},
                  {title: 'Seating / senior citizen', value: 'bench'},
                  {title: 'Swing', value: 'swing'},
                ],
              },
            },
            {
              name: 'label',
              title: 'Name',
              type: 'string',
              description:
                'What the buyer reads, in your own words — e.g. "Rooftop Jogging Track".',
              validation: (R) => R.required(),
            },
          ],
          // THE ROW SAYS WHAT WILL HAPPEN TO IT. A blank icon used to leave
          // the row's second line empty, which reads as something missing
          // rather than something optional — and this field is the one a
          // client is most likely to meet an invented amenity in. It does NOT
          // name the icon the site will guess: that table lives in
          // project.html and a copy here would be a second list to keep in
          // step, which is the thing the rewrite got rid of.
          preview: {
            select: {title: 'label', subtitle: 'icon'},
            prepare({title, subtitle}){
              return {
                title: title || 'Untitled amenity',
                subtitle: subtitle || 'icon chosen from the name',
              }
            },
          },
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
      const label = {completed: 'Completed', ongoing: 'Ongoing', upcoming: 'Upcoming', redevelopment: 'Redevelopment'}[stage]
      return {title, subtitle: [label, subtitle].filter(Boolean).join(' · '), media}
    },
  },
}
