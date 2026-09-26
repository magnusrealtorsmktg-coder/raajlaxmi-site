# Raajlaxmi Group — site

A static marketing site for Raajlaxmi Group. Eight hand-written HTML pages, no
build step, no package manager, no dependencies. Netlify publishes the
directory as-is, so whatever is on disk is what ships.

## The pages

| File | What it is |
|------|------------|
| `index.html` | Home — Hero, About, Signature Projects, Why Raajlaxmi, Brands We Use |
| `projects.html` | Our Collection; `?status=completed` gives the Completed view |
| `projects-ongoing.html` | The same collection UI locked to Ongoing |
| `projects-redevelopment.html` | The same, locked to Redevelopment |
| `project.html` | One property's detail page — `project.html?p=<slug>` |
| `testimonials.html` | Client voices |
| `services.html` | Services, journey rails and FAQ |
| `contact.html` | Enquiry page |

Each page is one self-contained document: `<style>` in `<head>`, markup in
`<body>`, one `<script>` at the end.

## Running it

Open any page directly in a browser, or serve the directory when you need real
HTTP (relative image paths, `curl` checks):

```bash
python3 -m http.server 8000   # → http://127.0.0.1:8000/index.html
```

There is no automated test suite. Verification is by eye at 1440×900,
1024×800 and 420×860, with a pass under `prefers-reduced-motion` and one with
the network off — the layout is designed to hold with photography blocked.

## Content management

`studio/` is a Sanity Studio whose only schema is `project`. It feeds the three
collection pages and the detail page; every other page is hand-edited HTML.

```bash
cd studio && npm install && npm run dev      # local Studio
cd studio && npm run deploy                  # publish to raajlaxmi.sanity.studio
```

A project's `stage` (`completed` / `ongoing` / `redevelopment`) decides which
listing it appears on. Setup notes are in `studio/README.md`.

## Working on this

`CLAUDE.md` carries the detailed architecture notes — the duplicated shared
chrome across all eight files, the page loader's constraints, the adaptive
navbar, and the current content placeholders. Read it before making structural
changes; several of its rules exist because of specific bugs.
