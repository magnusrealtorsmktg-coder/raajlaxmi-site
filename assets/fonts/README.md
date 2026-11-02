# Valuta Solid — the file this folder is waiting for

The four counting figures in Section II of `index.html` (`.ab-num`) are set in
**Valuta Solid**. The face is not on Google Fonts and no file has been supplied,
so the `@font-face` rule in `index.html` is a hook: it names these filenames and
falls back to Cormorant Garamond until one of them exists.

Drop the font in here under one of these names and the numbers change with no
code edit:

    assets/fonts/valuta-solid.woff2    <- preferred
    assets/fonts/valuta-solid.woff     <- optional older-browser fallback
    assets/fonts/valuta-solid.otf      <- works, but 3-5x the bytes of woff2

`.woff2` is the one worth having. Converting from `.otf`/`.ttf`:

    # https://github.com/fonttools/fonttools
    pip install fonttools brotli
    fonttools ttLib.woff2 compress -o valuta-solid.woff2 ValutaSolid.otf

**Check the licence before this ships.** A desktop font licence does not cover
serving the file from a web server — webfont embedding is a separate grant from
most foundries. The site is public, so the file here is downloadable by anyone.

Two things to look at once it is in, because a solid display face sets wider and
heavier than Cormorant Garamond:

- Section II **holds exactly one screen** by design (see CLAUDE.md). If the
  figures grow, re-check 1440x900, 1366x768, 1024x640 and 1280x620.
- "1500+" and "0.9 Million+" are the longest lines in those cards. Confirm they
  still sit on one line at phone widths.
