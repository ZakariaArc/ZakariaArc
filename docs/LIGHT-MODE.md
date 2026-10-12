# Complete light theme

Status: the owner approved the complete light design on 12 October 2026 for publication to ZakariaArc/ZakariaArc main. Live profile checks follow publication.

The hero uses a dark source with prefers-color-scheme: dark and a light fallback. Every other component uses two adjacent pictures, one per theme. Each picture places its uncombined max-width: 600px source first, followed by a prefers-color-scheme desktop source. The fallback img carries GitHub's matching #gh-dark-mode-only or #gh-light-mode-only visibility fragment. The same hero scales responsively in both layouts. No README JavaScript, page CSS, filters or external font loads are needed.

Live testing found that GitHub rewrites a source containing prefers-color-scheme to a theme-wide query and discards an additional width condition. Separating theme visibility from responsive selection prevents dark mobile images appearing on desktop. Both existing desktop and mobile assets remain unchanged. GitHub documents the visibility fragments in its [theme-context changelog](https://github.blog/changelog/2021-11-24-specify-theme-context-for-images-in-markdown/).

All prior dark assets remain unchanged except PicTracker and its two project grids, where the owner requested removal of the Personal badge. Light SVGs preserve the exact original geometry and Poppins outlines, using a deliberate ink, off-white, chip and border palette in scripts/light-theme.mjs. The original ALX mark is recolored to black. Contribution intensity progresses from pale gray to black. The original orange album bytes are unchanged.

Build: npm run build:assets. Cached statistics rebuild: npm run build:stats. Both maintain light companions. Preview: npm run preview:build, then npm run preview. Review parameters: theme=light and layout=desktop or layout=mobile. Without layout, native responsive queries apply.

## Raster provenance

Light SVG companions reuse the licensed icons, official ALX mark and Poppins outlines documented in assets/THIRD-PARTY.md. Character, album and brand rights remain with their respective owners.

Tool: built-in image_gen, edit mode; one existing dark target per call. Original dark files were never overwritten. The generated light artwork was resized and encoded to the existing dimensions; no CSS inversion or photographic-negative processing was used. Project and coast JPEGs use quality 85; the hero is PNG.

### hero

Edit target: assets/hero.png

Saved asset: assets/hero-light.png

Final prompt:

Use case: style-transfer. Asset type: GitHub profile hero banner, light theme companion to this exact dark banner. Input image is the EDIT TARGET. Rebuild the artwork on clean warm white and very pale gray paper with crisp black manga ink. Preserve the exact wide 3:1 layout, Baki Hanma identity, face, pose, right-side placement, crop, city silhouettes and moon. Preserve the exact brush lettering, location and scale: "Zakaria" and "Archach"; preserve the four small words "DEVELOP", "LEARN", "SOLVE", "BUILD" and their positions. Change the white title to expressive black brush ink, the background to white/off-white, atmospheric clouds and city to very subtle gray. Baki must remain detailed black and gray manga linework with luminous white negative space. This is a premium restrained light-mode edition, not a photographic negative, not a global inversion. Keep all typography content, relative dimensions, composition, whitespace, and subject fidelity. No new content or decoration. Output wide 2172x724 composition.

### coast

Edit target: assets/moonlit-coast.jpg

Saved asset: assets/moonlit-coast-light.jpg

Final prompt:

Use case: style-transfer. Asset type: light theme coastal background for a GitHub music card. Input is the EDIT TARGET. Create a carefully drawn monochrome light edition of this exact coast: warm white sky and off-white water, fine black manga ink lines defining the sea, gray distant horizon, black palm tree and foliage at far right, pale moon. Preserve the same wide 3:1 composition and all subject placement. Left half must remain extremely pale and quiet so dark text can sit above it. Right shore and palms retain beautiful crisp black ink with soft light gray atmospheric depth. No text, labels, album, controls, added objects, gradients to black, or border. Not an inverted negative. Output wide 2172x724.

### e-esj

Edit target: assets/project-art/e-esj.jpg

Saved asset: assets/project-art/e-esj-light.jpg

Final prompt:

Use case: style-transfer. Asset type: faded background of a light-theme healthcare project card. Input is the EDIT TARGET. Rebuild this same composition as polished black and graphite illustration on warm white paper. Preserve the stethoscope at lower right and airy hospital glass windows at upper right, same perspective and crop. Left 55 percent should be nearly blank white/off-white negative space for dark UI text. Medical subject must be precise, tasteful and legible at card scale. Right half has black and dark gray fine outlines, soft silver shading and pale gray architecture, never a large dark background. Maintain wide 1942x809 composition. No text, UI, watermark, logos, added subjects. Not an image inversion.

### nticemploi

Edit target: assets/project-art/nticemploi.jpg

Saved asset: assets/project-art/nticemploi-light.jpg

Final prompt:

Use case: style-transfer. Asset type: faded background of a light-theme academic timetable project card. Input is the EDIT TARGET. Rebuild the exact university corridor composition in elegant black and graphite architectural ink on white/off-white paper. Preserve the perspective, glass classroom doors, ceiling lines and bright windows primarily at right. Left 55 percent must be nearly blank white for dark card text. Crisp sparse gray and black geometry, subtle light gray shading, a premium quiet daytime academy setting. Keep the existing wide 1942x809 layout, crop and subject. No text, people, UI, logos or watermark. Avoid dense dark surfaces and photographic-negative effects.

### tracksnap

Edit target: assets/project-art/tracksnap.jpg

Saved asset: assets/project-art/tracksnap-light.jpg

Final prompt:

Use case: style-transfer. Asset type: faded background of a light-theme music project card. Input is the EDIT TARGET. Create a carefully illustrated light version of this same vinyl record turntable and over-ear headphones at right. Black fine ink contours, graphite and silver details, clean off-white studio surface, subtle pale gray shadows. Preserve object identity, right-side placement, exact perspective, wide crop and composition. The left 55 percent remains almost empty white/off-white for dark UI lettering. The black vinyl record should look naturally black with reflective gray grooves. No text, logos, added objects, borders or UI. Maintain wide 1942x809 composition. Do not make a photographic negative.

### pictracker

Edit target: assets/project-art/pictracker.jpg

Saved asset: assets/project-art/pictracker-light.jpg

Final prompt:

Use case: style-transfer. Asset type: faded background for a light-theme profile picture tracking project card. Input is the EDIT TARGET. Rebuild this exact abstract avatar version-history illustration on white/off-white: dominant circular anonymous bust profile picture on the right, subtle connected smaller avatar circles and timeline/history arc, faint outlined profile card fragments at far right. Black and graphite fine outlines with pale gray fills and restrained shadows. Preserve same right-heavy composition and subject purpose: monitoring changes to public username profile pictures. Left 55 percent must be almost blank white negative space for dark UI copy. Wide 1942x809 crop. No real faces, text, labels, logos, colored lights, lenses, cameras, borders or added UI copy. No global negative inversion.
