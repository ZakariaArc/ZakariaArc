# Local verification

This record covers checks on the finalized profile implementation. The local browser preview uses GitHub-sanitized Markdown with approximate GitHub CSS. Live rendering and GitHub's image proxy must also be checked at https://github.com/ZakariaArc after publication.

## Current refinement

- Poppins Regular, Medium, and SemiBold are outlined in generated SVGs, including both disclosure labels and the linked statistics footer. Expanded notes retain GitHub's native text typography.
- Lucide supplies consistent interface icons. Technology marks use Simple Icons and Devicon. The ALX logo is the actual white mark from ALX Africa's official website.
- Featured projects use a balanced two-column desktop grid and four stacked mobile cards. Coursework remains in its own section, with a responsive four-column/two-column subject grid and native repository links in the coursework index.
- Each featured project has its own generated, fading background: medical equipment, a university corridor, a turntable, and a digital avatar history timeline. PicTracker replaces the featured coursework tile; its description and stack were checked against the existing PicTracker chat and local dependencies. Artwork prompts are recorded in PROJECT-ART.md. PicTracker uses the wording "Profile picture" without a hyphen.
- The player uses a moonlit coast background and the original album cover. The extra selected-track line was removed. Authored long dashes were replaced with ASCII hyphens.
- Both disclosure controls use transparent, borderless Poppins labels with dark and light variants, removing the indented boxed edges caused by GitHub's native disclosure arrows.
- Disclosure images use GitHub-retained align="absmiddle", which computes to vertical-align: middle and centers the native arrow beside the image. Both controls were visually checked in preview/screenshots/centered-disclosures.jpg.
- The desktop contribution calendar is split into two chronological strips. Cells are 18.04px square instead of 8.72px, with equal horizontal and vertical spacing. The full card is 502px tall instead of 260px. The statistics panel uses larger values and matching vertical spacing.
- Connect, LinkedIn, and résumé content are absent. No inferred email address is included.

## Checks

- All 47 README image/source references resolve locally. All 116 SVG files parse as XML. The README contains no scripts, iframes, inline styles, or audio elements.
- Final desktop and 360px mobile screenshots were inspected with all images loaded. The desktop uses two project columns; mobile stacks all four cards, keeps each disclosure arrow beside its label, and splits the calendar into two readable halves. The preceding refinement also passed a narrower 890px desktop check. No horizontal overflow was observed.
- Dark and light previews were inspected. Theme-specific heading images select correctly in the preview. Responsive sources activate for projects, ALX, coursework, stack, music, and activity.
- Semantic headings have meaningful image alternatives. Project notes and the complete coursework index remain native readable text. Both disclosure controls were opened and closed; the coursework index exposes 18 repository links.
- Music links retain the official audio URL and t=424s. Original album JPEG bytes match the supplied ChannelOrange.jpg exactly. The player is a selected track with static artwork controls and external playback.
- The saved 10 October 2026 UTC snapshot remains unchanged: 25 public repositories, 0 received stars, 640 contributions, and 51 active days across 371 consecutive dates. All 371 desktop calendar cells are square and use the saved GitHub-reported date, count, and intensity.
- A simulated network failure preserved all seven statistics outputs. The cached rebuild ran offline, was byte-for-byte deterministic, and retained the snapshot timestamp.
- JavaScript syntax checks and git diff --check passed. A prepublication scan of all 153 intended files found no credential patterns or sensitive configuration files. Only this profile repository is included; local previews and dependencies are ignored.
- All 20 distinct README HTTPS links returned HTTP 200, including all 18 public project/coursework repositories and the official Pyramids audio at 424 seconds.
- The three Private badges and the privacy paragraph were removed at the owner's request. PicTracker's Personal badge was subsequently removed in the complete light-theme update below.

## Screenshots

Local ignored review artifacts:

- preview/screenshots/desktop-v4-dark.jpg
- preview/screenshots/desktop-v4-light.jpg
- preview/screenshots/mobile-v4-dark.jpg
- preview/screenshots/mobile-v4-light.jpg

The preview's theme switch and optional layout=mobile/desktop query are review tooling, not part of the README. The layout query pins responsive image selection during screenshots to avoid capture-time source switching; the default preview retains native media queries. Publication is authorized by the owner. The final live check must verify the profile's image proxy, native theme behavior, relative asset rewriting, and content width without redesigning the approved presentation.

## Complete light theme - 12 October 2026, local review

The owner approved this subsequent change on 12 October 2026 after reviewing full desktop screenshots of both themes. The following checks were completed before publication.

- Added six purpose-designed light raster assets and 39 SVG companions. All 55 light/dark SVG pairs have identical geometry and accessible content. All 155 SVGs parse as XML.
- All 16 README pictures now support both themes. All 62 image/source references resolve locally. The original 20 distinct HTTPS destinations are unchanged. GitHub's Markdown API retained the complete picture/source markup, responsive media queries, links and native disclosures.
- Hash comparison against all 136 original assets found exactly three changed files: PicTracker's card and the two project grids containing it. Their sole visual change is removal of the requested Personal badge. All other original assets, including the dark hero, coast, cards, ALX, stack, player, statistics, fonts, section labels and album artwork, retain their original bytes.
- Desktop was checked at a native 1000px CSS viewport and mobile at a native 360px CSS viewport, using unpinned responsive sources. Both themes selected the expected 16 images, all loaded, with no horizontal overflow. The 600px breakpoint preserves the original layouts.
- Both disclosure controls open and close. The coursework index retains 18 repository links; both disclosure images compute to vertical-align: middle.
- All four activity variants retain the same 371 unique daily contribution cells, count data and square cell geometry. The saved snapshot was not refreshed. The orange album JPEG is embedded unchanged in both light music assets, and the music link retains t=424s.
- Full README screenshots were saved to preview/screenshots/theme-review-desktop-light.jpg and theme-review-desktop-dark.jpg. Mobile captures are theme-review-mobile-light.jpg and theme-review-mobile-dark.jpg in the same ignored directory.
- Syntax checks and git diff --check passed. The 201 intended repository files were checked for credential patterns and sensitive filenames with no matches. The sole remote remains ZakariaArc/ZakariaArc, and main still points to bbe5a45d14b446b13e3c7fb51ec7bbe06a312a6b.
- Live GitHub verification of the new images follows the approved publication. The local screenshots use GitHub-sanitized markup with approximate GitHub styling, not a newly published live profile.
