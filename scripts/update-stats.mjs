/**
 * Refresh the local profile statistics with public GitHub data only.
 * Run: node scripts/update-stats.mjs
 * Rebuild cards without a network request: node scripts/update-stats.mjs --cached
 * Requires Node.js 22+ and npm ci for Poppins outlines. No token, cookies, or git writes.
 *
 * REST reference: https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user
 * Contributions: https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference
 * The public calendar can include anonymized private contribution counts when the
 * profile owner has already elected to display them. It does not expose details.
 * GitHub's calendar HTML is not a stable API; fail closed if its format changes.
 */
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { outlineSvgText, type } from './typography.mjs';
import { lightSvg } from './light-theme.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const USER = 'ZakariaArc';
const DAY = 86_400_000;
const COLORS = ['#191f24', '#454e56', '#7d878f', '#b6bec4', '#f4f4f2'];
const escapeXml = (value) => String(value).replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));
const integer = (value, label) => {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`Invalid ${label}.`);
  return value;
};
const dateLabel = (date) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
const format = (number) => number.toLocaleString('en-US');

async function get(url, api = false) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ZakariaArc-public-profile-snapshot',
      Accept: api ? 'application/vnd.github+json' : 'text/html',
      'Accept-Language': 'en-US',
      ...(api ? { 'X-GitHub-Api-Version': '2022-11-28' } : {}),
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}; existing snapshot retained.`);
  return api ? response.json() : response.text();
}

async function getRepositories() {
  const repositories = [];
  for (let page = 1; page <= 100; page++) {
    const batch = await get(`https://api.github.com/users/${USER}/repos?type=owner&per_page=100&page=${page}`, true);
    if (!Array.isArray(batch)) throw new Error('Unexpected repository response.');
    for (const repo of batch) {
      if (repo.private !== false || repo.owner?.login?.toLowerCase() !== USER.toLowerCase()) {
        throw new Error('Repository response did not match the public owner scope.');
      }
      integer(repo.id, 'repository ID');
      integer(repo.stargazers_count, 'star count');
    }
    repositories.push(...batch);
    if (batch.length < 100) {
      if (new Set(repositories.map((repo) => repo.id)).size !== repositories.length) {
        throw new Error('Duplicate repositories found; retry the snapshot.');
      }
      return repositories;
    }
  }
  throw new Error('Repository pagination limit reached; existing snapshot retained.');
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}

export function parseCalendar(html) {
  const rangeStart = html.match(/data-from="(\d{4}-\d{2}-\d{2}) /)?.[1];
  const rangeEnd = html.match(/data-to="(\d{4}-\d{2}-\d{2}) /)?.[1];
  const totalMatch = html.match(/id="js-contribution-activity-description"[^>]*>\s*([\d,]+)\s+contributions?\b/);
  if (!rangeStart || !rangeEnd || !totalMatch) throw new Error('GitHub calendar metadata changed.');
  const reportedTotal = integer(Number(totalMatch[1].replaceAll(',', '')), 'reported contribution count');
  const tooltips = new Map();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const attr = attributes(match[1]);
    if (!attr.for?.startsWith('contribution-day-component-')) continue;
    const countMatch = match[2].trim().match(/^(No|[\d,]+) contributions? on /);
    if (!countMatch) throw new Error('GitHub contribution tooltip format changed.');
    tooltips.set(attr.for, countMatch[1] === 'No' ? 0 : Number(countMatch[1].replaceAll(',', '')));
  }
  const days = [];
  for (const match of html.matchAll(/<td\b([^>]*)>/g)) {
    const attr = attributes(match[1]);
    if (!attr['data-date']) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(attr['data-date']) || !tooltips.has(attr.id)) {
      throw new Error('Calendar day has no verified date or count.');
    }
    const level = integer(Number(attr['data-level']), 'contribution level');
    if (level > 4) throw new Error('Unexpected contribution level.');
    const count = integer(tooltips.get(attr.id), 'daily contribution count');
    if ((count === 0) !== (level === 0)) throw new Error('Contribution level/count mismatch.');
    days.push({ date: attr['data-date'], count, level });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  const expectedLength = Math.round((Date.parse(rangeEnd) - Date.parse(rangeStart)) / DAY) + 1;
  if (days.length < 350 || days.length > 380 || days.length !== expectedLength) {
    throw new Error('Expected a complete rolling-year contribution calendar.');
  }
  for (let index = 0; index < days.length; index++) {
    const expectedDate = new Date(Date.parse(rangeStart) + index * DAY).toISOString().slice(0, 10);
    if (days[index].date !== expectedDate) throw new Error('Calendar contains missing or duplicate days.');
  }
  const total = days.reduce((sum, day) => sum + day.count, 0);
  if (total !== reportedTotal) throw new Error('Calendar total does not match the daily counts.');
  return { from: rangeStart, to: rangeEnd, total, activeDays: days.filter((day) => day.count > 0).length, days };
}

function frame(height, title, description, body, width = 900) {
  return outlineSvgText(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="8" fill="#090c0e" stroke="#252a2e"/>
  <g font-family="Arial, Helvetica, sans-serif">${body}
  </g>
</svg>\n`);
}

export function renderStats(data) {
  const c = data.contributions;
  const metrics = [
    { value: data.repositories.publicCount, label: 'PUBLIC REPOSITORIES', detail: 'Owned repositories, including forks' },
    { value: data.repositories.starsReceived, label: 'STARS RECEIVED', detail: 'Across public repositories' },
    { value: c.total, label: 'CONTRIBUTIONS SHOWN', detail: 'GitHub profile calendar' },
    { value: c.activeDays, label: 'ACTIVE DAYS', detail: 'Days with at least one contribution' },
  ];
  const description = `${USER}: ${data.repositories.publicCount} public repositories; ${data.repositories.starsReceived} stars received. ${c.total} contributions shown across ${c.activeDays} active days from ${c.from} through ${c.to}. Fetched ${data.fetchedAt}. Publicly visible data, not a lifetime commit count.`;
  let body = `
    <text x="26" y="29" fill="#93999e" font-size="10" letter-spacing="2">GITHUB / PUBLIC SNAPSHOT</text>
    <text x="874" y="29" fill="#93999e" font-size="11" text-anchor="end">${dateLabel(data.fetchedAt.slice(0, 10))} UTC</text>`;
  metrics.forEach((metric, index) => {
    const x = 26 + index * 221;
    if (index > 0) body += `\n    <path d="M${x - 13} 57v83" stroke="#252a2e"/>`;
    body += `
    <text x="${x}" y="94" fill="#f4f4f2" font-size="39" font-weight="600">${format(metric.value)}</text>
    <text x="${x}" y="120" fill="#d7dadd" font-size="10" letter-spacing="1.1">${metric.label}</text>
    <text x="${x}" y="140" fill="#93999e" font-size="10">${metric.detail}</text>`;
  });
  body += `
    <path d="M26 160h848" stroke="#252a2e"/>
    <text x="26" y="183" fill="#93999e" font-size="10">Activity window: ${dateLabel(c.from)} - ${dateLabel(c.to)}</text>
    <text x="874" y="183" fill="#93999e" font-size="10" text-anchor="end">Saved snapshot · updated manually</text>`;
  return frame(204, 'GitHub statistics - public snapshot', description, body);
}

export function renderContributions(data) {
  const c = data.contributions;
  const start = new Date(`${c.from}T00:00:00Z`);
  const firstSunday = start.getTime() - start.getUTCDay() * DAY;
  const weeks = Math.ceil((start.getUTCDay() + c.days.length) / 7);
  const step = Math.min(15.2, 809 / weeks);
  const cell = step - 3.5;
  const x0 = 63;
  const y0 = 71;
  let body = `
    <text x="26" y="30" fill="#f4f4f2" font-size="14" font-weight="600">${format(c.total)} contributions</text>
    <text x="874" y="30" fill="#93999e" font-size="11" text-anchor="end">${dateLabel(c.from)} - ${dateLabel(c.to)}</text>`;
  let lastMonth = '';
  for (const day of c.days) {
    const date = new Date(`${day.date}T00:00:00Z`);
    const week = Math.floor((date.getTime() - firstSunday) / (7 * DAY));
    const month = day.date.slice(0, 7);
    // Label weeks at the month transition. Avoid a near-overlapping final label.
    if (month !== lastMonth && (weeks - week > 2)) {
      body += `\n    <text x="${(x0 + week * step).toFixed(1)}" y="57" fill="#93999e" font-size="10">${new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(date)}</text>`;
    }
    lastMonth = month;
    body += `\n    <rect x="${(x0 + week * step).toFixed(1)}" y="${(y0 + date.getUTCDay() * step).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="1.8" fill="${COLORS[day.level]}"><title>${day.date}: ${day.count} ${day.count === 1 ? 'contribution' : 'contributions'}</title></rect>`;
  }
  for (const [day, label] of [[1, 'Mon'], [3, 'Wed'], [5, 'Fri']]) {
    body += `\n    <text x="26" y="${(y0 + day * step + 9).toFixed(1)}" fill="#93999e" font-size="10">${label}</text>`;
  }
  body += `
    <text x="26" y="199" fill="#93999e" font-size="10">As displayed on the public GitHub profile · snapshot ${data.fetchedAt.slice(0, 10)} UTC</text>
    <text x="733" y="199" fill="#93999e" font-size="10">Less</text>`;
  COLORS.forEach((color, index) => {
    body += `\n    <rect x="${761 + index * 15}" y="190" width="11" height="11" rx="1.5" fill="${color}"/>`;
  });
  body += '\n    <text x="843" y="199" fill="#93999e" font-size="10">More</text>';
  return frame(224, 'GitHub contribution activity', `${format(c.total)} contributions shown on the public GitHub profile from ${c.from} through ${c.to}, across ${c.activeDays} active days. All ${c.days.length} cells use GitHub-reported daily counts and intensity levels. Public counts can include anonymized private contributions if the account has chosen to display them. Snapshot fetched ${data.fetchedAt}.`, body);
}

export function renderStatsMobile(data) {
  const c = data.contributions;
  const metrics = [
    { value: data.repositories.publicCount, label: 'Public repositories' },
    { value: data.repositories.starsReceived, label: 'Stars received' },
    { value: c.total, label: 'Contributions shown' },
    { value: c.activeDays, label: 'Active days' },
  ];
  let body = `
    <text x="20" y="28" fill="#93999e" font-size="12" letter-spacing="1.2">GITHUB / PUBLIC SNAPSHOT</text>
    <text x="20" y="51" fill="#93999e" font-size="14">${dateLabel(data.fetchedAt.slice(0, 10))} UTC</text>
    <path d="M210 73v144M20 143h380" stroke="#252a2e"/>`;
  metrics.forEach((metric, index) => {
    const x = index % 2 === 0 ? 20 : 231;
    const y = index < 2 ? 98 : 193;
    body += icon(['folder-git-2', 'star', 'git-branch', 'calendar-days'][index], x + 137, y - 24, 21, '#7b858c');
    body += `
    <text x="${x}" y="${y}" fill="#f4f4f2" font-size="36" font-weight="600">${format(metric.value)}</text>
    <text x="${x}" y="${y + 25}" fill="#d7dadd" font-size="15">${metric.label}</text>`;
  });
  body += `
    <path d="M20 239h380" stroke="#252a2e"/>
    <text x="20" y="265" fill="#93999e" font-size="14">Activity: ${dateLabel(c.from)} - ${dateLabel(c.to)}</text>`;
  return frame(284, 'GitHub statistics - public snapshot', `${USER}: ${data.repositories.publicCount} owned public repositories, including forks; ${data.repositories.starsReceived} stars received across those repositories. ${c.total} contributions shown across ${c.activeDays} active days from ${c.from} through ${c.to}. Fetched ${data.fetchedAt}. Publicly visible data, not a lifetime commit count.`, body, 420);
}

export function renderContributionsMobile(data) {
  const c = data.contributions;
  const start = new Date(`${c.from}T00:00:00Z`);
  const firstSunday = start.getTime() - start.getUTCDay() * DAY;
  const weeks = Math.ceil((start.getUTCDay() + c.days.length) / 7);
  const weeksPerStrip = Math.ceil(weeks / 2);
  const step = 346 / weeksPerStrip;
  const cell = step - 2.5;
  const strips = [[], []];
  for (const day of c.days) {
    const date = new Date(`${day.date}T00:00:00Z`);
    const week = Math.floor((date.getTime() - firstSunday) / (7 * DAY));
    strips[Math.floor(week / weeksPerStrip)].push({ ...day, week, weekday: date.getUTCDay() });
  }
  let body = `
    <text x="20" y="31" fill="#f4f4f2" font-size="20" font-weight="600">${format(c.total)} contributions</text>
    <text x="20" y="54" fill="#93999e" font-size="14">Public profile · all ${c.days.length} recorded days</text>`;
  body += icon('calendar-range', 376, 18, 22, '#b6babe');
  strips.forEach((days, stripIndex) => {
    const y0 = 95 + stripIndex * 132;
    body += `\n    <text x="20" y="${y0 - 14}" fill="#d7dadd" font-size="14">${dateLabel(days[0].date)} - ${dateLabel(days.at(-1).date)}</text>`;
    for (const day of days) {
      const x = 53 + (day.week - stripIndex * weeksPerStrip) * step;
      const y = y0 + day.weekday * step;
      body += `\n    <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="1.8" fill="${COLORS[day.level]}"><title>${day.date}: ${day.count} ${day.count === 1 ? 'contribution' : 'contributions'}</title></rect>`;
    }
    for (const [weekday, label] of [[1, 'Mo'], [3, 'We'], [5, 'Fr']]) {
      body += `\n    <text x="20" y="${(y0 + weekday * step + 10).toFixed(1)}" fill="#93999e" font-size="12">${label}</text>`;
    }
  });
  body += '\n    <text x="220" y="345" fill="#93999e" font-size="14">Less</text>';
  COLORS.forEach((color, index) => {
    body += `\n    <rect x="${259 + index * 17}" y="334" width="13" height="13" rx="1.5" fill="${color}"/>`;
  });
  body += `
    <text x="352" y="345" fill="#93999e" font-size="14">More</text>
    <path d="M20 360h380" stroke="#252a2e"/>
    <text x="20" y="384" fill="#93999e" font-size="14">Snapshot ${dateLabel(data.fetchedAt.slice(0, 10))} UTC</text>`;
  return frame(404, 'GitHub contribution activity - mobile calendar', `${format(c.total)} contributions shown on the public GitHub profile from ${c.from} through ${c.to}, across ${c.activeDays} active days. The calendar is split into two chronological strips. All ${c.days.length} cells use GitHub-reported daily counts and intensity levels; no dates are omitted or repeated. Public counts can include anonymized private contributions if the account has chosen to display them. Snapshot fetched ${data.fetchedAt}.`, body, 420);
}

function icon(name, x, y, size = 20, color = '#b6babe') {
  const source = readFileSync(resolve(ROOT, `assets/icons/lucide/${name}.svg`), 'utf8');
  const body = source.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function activityFrame(width, height, data, body) {
  const description = `${USER}: ${data.repositories.publicCount} public repositories, ${data.repositories.starsReceived} stars received, ${data.contributions.total} contributions shown, ${data.contributions.activeDays} active days. Exact daily calendar from ${data.contributions.from} through ${data.contributions.to}. Snapshot ${data.fetchedAt}.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">GitHub statistics and contribution activity</title><desc id="desc">${escapeXml(description)}</desc>${body}</svg>\n`;
}

export function renderActivity(data) {
  const text = (value, x, y, size = 14, options = {}) => type(value, x, y, size, { fill: '#b6babe', ...options });
  const panel = (x, width) => `<rect x="${x + .5}" y=".5" width="${width - 1}" height="501" rx="7" fill="#070b0e" stroke="#242d32"/>`;
  let body = panel(0, 248) + panel(262, 638);
  body += icon('chart-no-axes-combined', 20, 20) + text('GitHub Stats', 51, 37, 17, { fill: '#f1f3f2', weight: 500 });
  const metrics = [
    ['folder-git-2', 'Public repositories', data.repositories.publicCount],
    ['star', 'Stars received', data.repositories.starsReceived],
    ['git-branch', 'Contributions shown', data.contributions.total],
    ['calendar-days', 'Active days', data.contributions.activeDays],
  ];
  metrics.forEach(([glyph, label, value], index) => {
    const y = 89 + index * 96;
    body += icon(glyph, 21, y - 15, 18) + text(label, 51, y, 12.5) + text(format(value), 22, y + 38, 30, { fill: '#f1f3f2', weight: 500 });
    if (index < 3) body += `<path d="M20 ${y + 60}h208" stroke="#202a30"/>`;
  });
  body += text(`Saved ${dateLabel(data.fetchedAt.slice(0, 10))} UTC`, 21, 482, 10, { fill: '#7b858c' });
  body += icon('calendar-range', 282, 20) + text('Contribution Activity', 312, 37, 17, { fill: '#f1f3f2', weight: 500 });
  const c = data.contributions;
  const start = new Date(`${c.from}T00:00:00Z`);
  const firstSunday = start.getTime() - start.getUTCDay() * DAY;
  const weeks = Math.ceil((start.getUTCDay() + c.days.length) / 7);
  const weeksPerStrip = Math.ceil(weeks / 2);
  const step = 568 / weeksPerStrip;
  const cell = step - 3;
  const strips = [[], []];
  for (const day of c.days) {
    const date = new Date(`${day.date}T00:00:00Z`);
    const week = Math.floor((date.getTime() - firstSunday) / (7 * DAY));
    strips[Math.floor(week / weeksPerStrip)].push({ ...day, week, weekday: date.getUTCDay() });
  }
  strips.forEach((days, index) => {
    const x0 = 308, y0 = 82 + index * 210;
    let lastMonth = '';
    for (const day of days) {
      const week = day.week - index * weeksPerStrip;
      const month = day.date.slice(0, 7);
      if (month !== lastMonth && weeksPerStrip - week > 2) body += text(new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(new Date(`${day.date}T00:00:00Z`)), x0 + week * step, y0 - 14, 10);
      lastMonth = month;
      body += `<rect x="${(x0 + week * step).toFixed(2)}" y="${(y0 + day.weekday * step).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="2" fill="${COLORS[day.level]}"><title>${day.date}: ${day.count} contributions</title></rect>`;
    }
    for (const [day, label] of [[1, 'Mon'], [3, 'Wed'], [5, 'Fri']]) body += text(label, 282, y0 + day * step + 12, 8.5);
    body += text(`${dateLabel(days[0].date)} - ${dateLabel(days.at(-1).date)}`, 308, y0 + 162, 10, { fill: '#7b858c' });
  });
  body += `<path d="M282 260h594" stroke="#202a30"/>`;
  body += text('Less', 733, 484, 9);
  COLORS.forEach((color, index) => { body += `<rect x="${761 + index * 15}" y="474" width="11" height="11" rx="1" fill="${color}"/>`; });
  body += text('More', 846, 484, 9);
  return activityFrame(900, 502, data, body);
}

export function renderActivityMobile(data) {
  const content = (svg) => svg.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<(title|desc) id="[^"]*">[\s\S]*?<\/\1>/g, '');
  return activityFrame(420, 700, data, content(renderStatsMobile(data)) + `<g transform="translate(0 296)">${content(renderContributionsMobile(data))}</g>`);
}

function validateSnapshot(data) {
  if (data.schemaVersion !== 1 || data.username !== USER || !Number.isFinite(Date.parse(data.fetchedAt))) {
    throw new Error('Invalid cached public snapshot metadata.');
  }
  integer(data.repositories?.publicCount, 'public repository count');
  integer(data.repositories?.starsReceived, 'stars received');
  const c = data.contributions;
  if (!c || !/^\d{4}-\d{2}-\d{2}$/.test(c.from) || !/^\d{4}-\d{2}-\d{2}$/.test(c.to) || !Array.isArray(c.days)) {
    throw new Error('Invalid cached calendar metadata.');
  }
  const expectedLength = Math.round((Date.parse(c.to) - Date.parse(c.from)) / DAY) + 1;
  if (c.days.length < 350 || c.days.length > 380 || c.days.length !== expectedLength) {
    throw new Error('Cached calendar is incomplete.');
  }
  c.days.forEach((day, index) => {
    if (day.date !== new Date(Date.parse(c.from) + index * DAY).toISOString().slice(0, 10)) {
      throw new Error('Cached calendar dates are not continuous.');
    }
    integer(day.count, 'cached contribution count');
    integer(day.level, 'cached contribution level');
    if (day.level > 4 || (day.count === 0) !== (day.level === 0)) throw new Error('Invalid cached contribution level.');
  });
  if (c.total !== c.days.reduce((sum, day) => sum + day.count, 0) || c.activeDays !== c.days.filter((day) => day.count > 0).length) {
    throw new Error('Cached calendar totals do not match the daily counts.');
  }
}

function cardFiles(data) {
  const dark = [
    ['assets/stats.svg', renderStats(data)],
    ['assets/contributions.svg', renderContributions(data)],
    ['assets/stats-mobile.svg', renderStatsMobile(data)],
    ['assets/contributions-mobile.svg', renderContributionsMobile(data)],
    ['assets/activity.svg', renderActivity(data)],
    ['assets/activity-mobile.svg', renderActivityMobile(data)],
  ];
  return [...dark, ...dark.map(([file, svg]) => [file.replace(/\.svg$/, '-light.svg'), lightSvg(svg)])];
}

async function replaceSnapshot(files) {
  // Prepare every output before replacing anything. Restore prior bytes on a
  // write/rename failure so a failed refresh never knowingly leaves mixed data.
  const originals = new Map();
  const temporary = [];
  const changed = [];
  try {
    for (const [relative, content] of files) {
      const path = resolve(ROOT, relative);
      await mkdir(dirname(path), { recursive: true });
      originals.set(path, await readFile(path).catch((error) => { if (error.code === 'ENOENT') return null; throw error; }));
      const tempPath = `${path}.${process.pid}.tmp`;
      temporary.push(tempPath);
      await writeFile(tempPath, content.replace(/[ \t]+$/gm, ''), { flag: 'wx' });
    }
    for (const [index, [relative]] of files.entries()) {
      const path = resolve(ROOT, relative);
      await rename(temporary[index], path);
      changed.push(path);
    }
  } catch (error) {
    for (const path of changed) {
      const original = originals.get(path);
      if (original === null) await rm(path, { force: true });
      else await writeFile(path, original);
    }
    throw error;
  } finally {
    await Promise.all(temporary.map((path) => rm(path, { force: true })));
  }
}

export async function refresh({ cached = false } = {}) {
  if (cached) {
    const data = JSON.parse(await readFile(resolve(ROOT, 'data/public-stats.json'), 'utf8'));
    validateSnapshot(data);
    await replaceSnapshot(cardFiles(data));
    console.log(`Rebuilt desktop and mobile cards from the saved ${data.fetchedAt} snapshot. No network requests; saved data unchanged.`);
    return;
  }
  const [profile, repositories, calendarHtml] = await Promise.all([
    get(`https://api.github.com/users/${USER}`, true),
    getRepositories(),
    get(`https://github.com/users/${USER}/contributions`),
  ]);
  if (profile.login?.toLowerCase() !== USER.toLowerCase()) throw new Error('Unexpected GitHub user.');
  if (integer(profile.public_repos, 'public repository count') !== repositories.length) {
    throw new Error('Repository count changed during collection; retry for a consistent snapshot.');
  }
  const contributions = parseCalendar(calendarHtml);
  const fetchedAt = new Date().toISOString();
  if (contributions.to !== fetchedAt.slice(0, 10)) {
    throw new Error('Calendar is not current for the UTC snapshot date; retry later.');
  }
  const data = {
    schemaVersion: 1,
    username: USER,
    fetchedAt,
    sources: {
      profile: `https://api.github.com/users/${USER}`,
      repositories: `https://api.github.com/users/${USER}/repos?type=owner&per_page=100`,
      contributions: `https://github.com/users/${USER}/contributions`,
    },
    methodology: {
      repositories: 'Public repositories owned by the account, including forks; checked against the public user API count.',
      starsReceived: 'Sum of stargazers_count across those public repositories; not stars given by the account.',
      contributions: 'Exact daily tooltip counts and intensity levels from the logged-out public profile calendar. Not a lifetime commit count. May include anonymized private contribution counts already made public by the account.',
      refresh: 'Manual local refresh only; no authentication, private content, remote mutation, or automatic publishing.',
    },
    repositories: { publicCount: repositories.length, starsReceived: repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0) },
    contributions,
  };
  const files = [
    ['data/public-stats.json', `${JSON.stringify(data, null, 2)}\n`],
    ...cardFiles(data),
  ];
  await replaceSnapshot(files);
  console.log(`Updated public snapshot for ${USER}: ${repositories.length} public repositories, ${data.repositories.starsReceived} stars received, ${contributions.total} contributions (${contributions.from} to ${contributions.to}).`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const run = args.length === 0 || (args.length === 1 && args[0] === '--cached')
    ? refresh({ cached: args[0] === '--cached' })
    : Promise.reject(new Error('Usage: node scripts/update-stats.mjs [--cached]'));
  run.catch((error) => {
    console.error(`Refresh failed: ${error.message}`);
    process.exitCode = 1;
  });
}
