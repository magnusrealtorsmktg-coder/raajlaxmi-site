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
/* One page-content document per listing, with a fixed id. There are four
   rather than three because projects.html does double duty — it is both the
   browse-all page and the Completed view, and the two want different
   headings. */
const PAGE_DOC = {
  all: 'collection-all',
  completed: 'collection-completed',
  ongoing: 'collection-ongoing',
  redevelopment: 'collection-redevelopment',
}

/* "Page content" + "Projects" inside each category folder, so the client edits
   the wording of a listing and the properties on it in the same place. */
const stageFolder = (S, value, title) =>
  S.listItem()
    .id(value)
    .title(title)
    .child(
      S.list()
        .id(value + '-inner')
        .title(title)
        .items([
          S.listItem()
            .id(value + '-page')
            .title('Page content')
            .child(
              S.document()
                .schemaType('collectionPage')
                .documentId(PAGE_DOC[value])
                .title(title + ' — page content'),
            ),
          S.divider(),
          S.listItem()
            .id(value + '-projects')
            .title('Projects')
            .child(
              S.documentList()
                .id(value + '-list')
                .title(title + ' projects')
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
        ]),
    )

const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      /* The home page is a singleton — one document, fixed id, no "create new".
         Opening it goes straight to the form rather than to a list of one. */
      S.listItem()
        .id('homepage')
        .title('Home page')
        .child(S.document().schemaType('homepage').documentId('homepage').title('Home page')),
      S.divider(),

      S.listItem()
        .id('all-projects')
        .title('All Projects')
        .child(
          S.list()
            .id('all-projects-inner')
            .title('All Projects')
            .items([
              /* the wording on the browse-everything page itself */
              S.listItem()
                .id('all-page')
                .title('Page content')
                .child(
                  S.document()
                    .schemaType('collectionPage')
                    .documentId(PAGE_DOC.all)
                    .title('All projects — page content'),
                ),
              S.divider(),
              ...STAGES.map(([value, title]) => stageFolder(S, value, title)),
              S.divider(),
              /* the safety net: anything with no stage set would otherwise be
                 invisible in the three folders above */
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
                .id('every-project')
                .title('Every project')
                .child(S.documentTypeList('project').title('Every project')),
            ]),
        ),
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
      /* drop the singleton's generic template so it cannot be created a second
         time from the global "create" menu — it is reached through the sidebar */
      ...prev.filter((t) => !['homepage', 'collectionPage'].includes(t.schemaType)),
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
