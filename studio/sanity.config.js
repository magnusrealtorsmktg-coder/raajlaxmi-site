import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes/index.js'

/* Both ids also live in projects.html, projects-ongoing.html and
   projects-redevelopment.html — see the SANITY block in each one's <script>. */

/* The three listings the site is organised around. The value is what goes in a
   document's `stage` field and what the pages filter on, so changing one of
   these strings means changing it in all three pages too. */
const STAGES = [
  ['completed', 'Completed'],
  ['ongoing', 'Ongoing'],
  ['redevelopment', 'Redevelopment'],
]

/* One folder per listing, so the Studio sidebar mirrors the site. Creating a
   project inside a folder pre-fills its stage (see `templates` below), which
   is the whole point — you should not have to remember to set it. */
const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      ...STAGES.map(([value, title]) =>
        S.listItem()
          .id(value)
          .title(title)
          .child(
            S.documentList()
              .id(value + '-list')
              .title(title)
              .filter('_type == "project" && stage == $stage')
              .params({stage: value})
              .defaultOrdering([
                {field: 'order', direction: 'asc'},
                {field: '_createdAt', direction: 'asc'},
              ])
              .initialValueTemplates([
                S.initialValueTemplateItem('project-by-stage', {stage: value}),
              ]),
          ),
      ),
      S.divider(),
      /* the safety net: anything with no stage set would otherwise be invisible
         in the three folders above */
      S.listItem()
        .id('unfiled')
        .title('Not yet filed')
        .child(
          S.documentList()
            .id('unfiled-list')
            .title('Projects with no listing set')
            .filter('_type == "project" && !defined(stage)'),
        ),
      S.listItem()
        .id('all')
        .title('All projects')
        .child(S.documentTypeList('project').title('All projects')),
    ])

export default defineConfig({
  name: 'raajlaxmi',
  title: 'Raajlaxmi Site',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'REPLACE_WITH_PROJECT_ID',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      {
        id: 'project-by-stage',
        title: 'Project',
        schemaType: 'project',
        parameters: [{name: 'stage', type: 'string'}],
        value: ({stage}) => ({stage}),
      },
    ],
  },
})
