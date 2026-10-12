# Profile maintenance

The profile is `README.md` plus local assets. GitHub's navigation, sidebar, avatar, and page background are outside the README's control. Nothing in this implementation changes them.

## Edit and regenerate

Requires Node.js 22 or later. Run `npm ci` once to install the pinned `opentype.js` build dependency.

```powershell
npm ci
node scripts/build-assets.mjs
node scripts/update-stats.mjs
node scripts/build-preview.mjs
node scripts/serve-preview.mjs
```

Open `http://127.0.0.1:4173/preview/index.html`. The preview uses the GitHub Markdown API's sanitized HTML with locally stored `github-markdown-css@5.8.1`. This confirms supported markup but is an approximation of GitHub's final page layout, image proxy, and theme CSS. It is not a published GitHub profile. `preview/` is intentionally ignored by Git. The server binds only to loopback and serves only `assets/` and `preview/`.

Edit project display data in `data/profile.json`, then run the asset generator. Keep the native project notes and image alt text in `README.md` consistent with the data. Icons, fonts, branding, and artwork are local; visitors do not depend on a font or icon CDN. `scripts/fetch-design-resources.mjs` can restore the pinned source resources when needed.

Poppins Regular, Medium, and SemiBold are converted to SVG paths at build time by `scripts/typography.mjs`. This keeps the font reliable in GitHub's image sandbox. Section headings have dark/light and mobile variants. GitHub controls the font used by native disclosure text and links. The project grid has a two-column desktop composition and a four-card mobile composition; coursework changes from four columns to two.

## Statistics

The snapshot is generated from public, unauthenticated GitHub endpoints. See `data/public-stats.json` for retrieval time, date range, counts, and methodology. Statistics are explicitly dated; they are not live or lifetime totals. Refresh manually with `node scripts/update-stats.mjs` before publishing future updates. No scheduled commits or push workflow is installed.

Repository counts include public forks. Stars mean stars received on public repositories. Contribution counts are exactly those exposed by GitHub's logged-out calendar, which may include anonymized private activity if the account has chosen to show it. The private repository names, code, and details are not collected by this script. Calendar HTML is not a stable API; validation rejects unexpected formats and keeps the last successful assets if fetching fails.

## Project facts and privacy

- e-ESJ: healthcare and medical teleconsultation; Next.js, NestJS, TypeScript, MySQL. Private.
- NTICEmploi: class timetable management; HTML, CSS, JavaScript, Cloudflare Workers. Private.
- TrackSnap: Spotify/music project; Node.js, Express, MongoDB. Private.
- PicTracker: tracks profile picture changes for public usernames; React, Node.js, Express, MongoDB. Personal project, with no public source link asserted.
- TechTrack: public ALX capstone with curated programming video courses, HTML/CSS/JavaScript, Bootstrap, and jQuery.

The first three purposes were provided by the owner and cross-checked read-only. PicTracker's purpose was recovered from the owner's existing PicTracker chat; its frontend and server dependency metadata were checked read-only. Framework labels were verified against dependency metadata. No private source, README, credentials, or configuration values have been copied into this repository. Private projects intentionally have no public source link. TechTrack appears in the ALX section to keep coursework separate from independent projects.

The Connect section is removed at the owner's request. No LinkedIn, résumé, or inferred email address is included.

## Music

`assets/channel-orange.jpg` is the unchanged original artwork provided by the owner. The player SVG embeds its bytes so it works as a standalone image without an external image fetch. The card is a selected track, not a live listening feed. Its controls are artwork; the entire card opens the official full audio at 424 seconds. The separate selected-track text line has been removed.

- [Official Pyramids audio](https://www.youtube.com/watch?v=dMV31MWIjLE&t=424s)
- [Apple Music album listing, 09:52 track duration](https://music.apple.com/us/album/channel-orange/1440765580)
- [YouTube timestamp sharing](https://support.google.com/youtube/answer/57741?hl=en)

## Rendering research and decisions

Graphics have accessible text alternatives. Semantic headings, native project notes, and native coursework links preserve navigation and readable content. Responsive project, coursework, stack, player, and activity assets keep their layout at narrower widths. No JavaScript, iframe, inline page CSS, or live audio controls are used in the README. The local preview's theme button is review tooling only.

- [GitHub's markup pipeline and sanitization](https://github.com/github/markup)
- [GitHub README quickstart and picture sources](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github)
- [SVG as an image: external resource restrictions](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_as_an_image)
- [Profile contribution reference](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference)
- [Public repository API](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user)
- [DenverCoder1: individually linked graphic layout](https://github.com/DenverCoder1/DenverCoder1)
- [Abhishek Naidu: artwork alongside native text](https://github.com/abhisheknaiidu/abhisheknaiidu)
- [Readme-stats reliability and generated-asset guidance](https://github.com/anuraghazra/github-readme-stats#deploy-on-your-own-recommended)

Tables were considered, but GitHub controls their padding and borders, and they do not stack cleanly on mobile. A single profile image was rejected because it cannot preserve readable text and separate links. Third-party dynamic stats images were replaced by validated, self-hosted snapshots to avoid visitor-time service failures.

## Publication

The owner approved the finalized design for publication to the main branch of ZakariaArc/ZakariaArc. Build scripts do not push, edit remote repositories, change visibility, or alter profile settings. For future updates, inspect the complete staged contents before committing, push only to this profile repository, then verify https://github.com/ZakariaArc in the browser. Keep preview output, dependencies, credentials, and private source outside the published tree.

The owner separately approved the complete light theme on 12 October 2026 for publication to main. Its raster prompts, asset paths, theme source order, and build instructions are in [LIGHT-MODE.md](LIGHT-MODE.md). `npm run build:assets` builds the existing dark graphics followed by their light companions. Statistics refreshes update both themes atomically from the same snapshot. PicTracker's Personal badge has been removed at the owner's request.
