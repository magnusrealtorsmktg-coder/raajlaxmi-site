# Raajlaxmi Studio

Sanity Studio for the site's project content. It drives **four** pages:

| Studio folder | Page |
|---|---|
| Completed | `projects.html?status=completed` |
| Ongoing | `projects-ongoing.html` |
| Redevelopment | `projects-redevelopment.html` |
| *(all of them)* | `projects.html` — the full collection |

…and every project's **detail page** at `project.html?p=<slug>`.

Everything else on the site is still hand-edited HTML.

## One-time setup

1. Finish creating the project at <https://manage.sanity.io> (the "Raajlaxmi Site"
   dialog). Copy the **Project ID** from *Settings → General*.

2. Put the id in **two** places:

   - `studio/.env` — copy `.env.example` to `.env` and fill in
     `SANITY_STUDIO_PROJECT_ID`.
   - `projects.html`, `projects-ongoing.html`, `projects-redevelopment.html` **and**
     `project.html` — the `SANITY` block near the top of each one's section script:

     ```js
     const SANITY = {
       projectId : 'yourProjectId',
       dataset   : 'production',
       apiVersion: '2024-01-01',
     };
     ```

     While `projectId` is empty the page simply renders its built-in cards, so
     nothing breaks before this step.

3. Allow the site to read the API. In *Settings → API → CORS origins*, add:

   - `https://stirring-basbousa-6d4b4b.netlify.app`
   - `http://127.0.0.1:8000` (for local previews)

   Leave "Allow credentials" **off** — the site reads with no token.

4. Make sure the dataset is public (*Settings → API → Datasets*). A private
   dataset would need a token, and a token in a static page is a token given
   away to everyone.

## Running the Studio

```bash
cd studio
npm install
npm run dev          # http://localhost:3333
```

The Studio is also hosted, so content can be edited from any machine with no
terminal at all:

**<https://raajlaxmi.sanity.studio>**

Redeploy it after any schema change:

```bash
npm run deploy
```

## Adding a project

The sidebar has a folder per listing — **Completed**, **Ongoing**,
**Redevelopment**. Create the project inside the folder it belongs to and its
**Listing** field is filled in for you. That field is the only thing that decides
which page the project appears on; it always appears on the full collection too.

A project that somehow has no Listing set shows under **Not yet filed**, so it
can't go missing.

Field notes:

- **Listing** — Completed / Ongoing / Redevelopment. Required.
- **Status badge** — optional. The pill on the photograph. Leave it empty and it
  shows the Listing. Set it when the badge should say something else, e.g. a
  Completed project whose badge should read "Ready Possession".
- **URL slug** — required, and it is what makes "View Details" work: the button
  opens `project.html?p=<slug>`. Press *Generate* to derive it from the name.
- **Location** must stay in `Area, City` form — the pages build their city filter
  chips from the text before the comma.
- **Detail page** — an override. Leave it empty for every project; it exists only
  to point one card at a hand-built page instead of the shared one.
- Everything under **Detail page** (collapsed) fills `project.html?p=<slug>`:
  gallery, Project Highlights, the four-cell fact bar (from the first four
  **Specification list** rows), amenities, address, map pin and landmarks. Leave
  any of it blank and that part is simply not drawn.
- **Floor plans** is currently not shown anywhere — the rebuilt detail page has
  no floor-plan section. The field is kept so the drawings aren't lost.

Publish, then reload the page — the cards come from Sanity within a few seconds
(the CDN caches briefly).

## How the site reads it

Each collection page fetches one GROQ query over plain HTTP — no SDK, no build
step, no token — and filters the result in the browser:

```
*[_type=="project"]|order(order asc,_createdAt asc){
  name,stage,status,category,location,blurb,config,area,detailUrl,
  "slug":slug.current,"imageUrl":image.asset->url
}
```

`project.html?p=<slug>` runs its own query for the one document.

If a query fails, returns nothing, or `projectId` is blank, the cards written
into the file are shown instead — so no page ever renders empty.

**Migrating existing documents**: `stage` is new. A document that predates it
falls back to its old status badge, so `Ongoing` and `Completed` documents keep
working untouched. `Ready Possession` ones match no listing until you open them
and set **Listing** to Completed — that is the one thing worth doing in a pass.
