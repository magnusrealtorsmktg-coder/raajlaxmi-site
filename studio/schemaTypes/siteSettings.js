/* The things that are the same on every page: the social handles and the
   contact details in the footer.

   A singleton with the fixed id "site-settings". Every page reads it, so one
   edit here changes all eight — which is the point: the telephone number used
   to be written into each file by hand. */

export default {
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',

  groups: [
    {name: 'social', title: 'Social handles', default: true},
    {name: 'contact', title: 'Footer contact'},
  ],

  fields: [
    {
      name: 'social',
      title: 'Social handles',
      type: 'array',
      description:
        'The round icons in the footer, in order. Only the ones you add are shown — leave the list empty and the row disappears rather than linking nowhere, which is what the hard-coded icons did.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Which network',
              type: 'string',
              options: {
                list: [
                  {title: 'Instagram', value: 'instagram'},
                  {title: 'Facebook', value: 'facebook'},
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'YouTube', value: 'youtube'},
                  {title: 'X / Twitter', value: 'x'},
                  {title: 'WhatsApp', value: 'whatsapp'},
                ],
              },
              validation: (R) => R.required(),
            },
            {
              name: 'url',
              title: 'Link',
              type: 'url',
              description: 'The full address, starting with https:// — or a wa.me link for WhatsApp.',
              validation: (R) => R.required().uri({scheme: ['http', 'https']}),
            },
          ],
          preview: {
            select: {title: 'platform', subtitle: 'url'},
          },
        },
      ],
      group: 'social',
    },

    {
      name: 'phone',
      title: 'Telephone',
      type: 'string',
      description: 'As it should be printed — e.g. "+91 77740 00939". The dialling link is built from it.',
      group: 'contact',
    },
    {
      name: 'email',
      title: 'Email address',
      type: 'string',
      group: 'contact',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 3,
      description: 'Press Enter for a line break.',
      group: 'contact',
    },
    {
      name: 'copyright',
      title: 'Copyright line',
      type: 'string',
      description: 'The small line at the very bottom. Leave blank to keep what is in the page.',
      group: 'contact',
    },
  ],

  preview: {
    prepare: () => ({title: 'Site settings'}),
  },
}
