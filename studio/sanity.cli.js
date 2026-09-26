import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  /* the hosted Studio at https://raajlaxmi.sanity.studio — pinning the id
     keeps `npm run deploy` from prompting for it again */
  deployment: {
    appId: 'dxnhkgf9v6worx1e67z8s1cg',
  },

  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'REPLACE_WITH_PROJECT_ID',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
})
