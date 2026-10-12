// Local review only. GitHub's API sanitizes the README; CSS approximates its presentation.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'preview');
await mkdir(out, { recursive: true });
const markdown = await readFile(resolve(root, 'README.md'), 'utf8');
const response = await fetch('https://api.github.com/markdown', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'User-Agent': 'ZakariaArc-local-preview', Accept: 'application/vnd.github+json' },
  body: JSON.stringify({ text: markdown, mode: 'gfm', context: 'ZakariaArc/ZakariaArc' }),
});
if (!response.ok) throw new Error(`GitHub Markdown API: ${response.status}`);
const rendered = await response.text();
await writeFile(resolve(out, 'github-rendered.html'), rendered);
const css = await fetch('https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown.css');
if (!css.ok) throw new Error(`Preview CSS: ${css.status}`);
await writeFile(resolve(out, 'github-markdown.css'), await css.text());
// The API returns relative repo assets; keep them local, including any normalized raw URL.
const body = rendered.replaceAll('https://raw.githubusercontent.com/ZakariaArc/ZakariaArc/main/assets/', '../assets/').replace(/(src|srcset|href)="assets\//g, '$1="../assets/');
const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Zakaria Archach · README preview</title><link rel="stylesheet" href="github-markdown.css"><style>
:root{color-scheme:dark;--page:#010409;--ink:#d1d9e0;--frame:#3d444d}*{box-sizing:border-box}body{margin:0;background:var(--page);color:var(--ink);font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.review-bar{max-width:950px;margin:28px auto 20px;padding:0 25px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;color:#9198a1}.review-bar strong{color:var(--ink);font-weight:500}.review-bar span{margin-right:auto}.review-bar button{font:inherit;color:var(--ink);border:1px solid var(--frame);background:transparent;border-radius:5px;padding:6px 12px;cursor:pointer}.review-bar a{color:inherit}.frame{max-width:950px;margin:0 auto 40px;border:1px solid var(--frame);border-radius:6px;overflow:hidden}.file-label{padding:16px 24px;font:12px ui-monospace,monospace;color:#9198a1;background:var(--surface)}.markdown-body{padding:24px 30px 30px;--bgColor-default:#0d1117;--fgColor-default:#e6edf3;background:#0d1117;color:#e6edf3}.markdown-body summary{cursor:pointer}.light{color-scheme:light;--page:#f6f8fa;--ink:#1f2328;--frame:#d1d9e0}.light .markdown-body{--bgColor-default:#fff;--fgColor-default:#1f2328;--borderColor-muted:#d1d9e0b3;--fgColor-accent:#0969da;--bgColor-muted:#f6f8fa;background:#fff;color:#1f2328}.light .markdown-body h2{border-color:#d1d9e0}.light .markdown-body a{color:#0969da}.light .markdown-body code{background:#eff1f3}.light .file-label{background:#fff}@media(max-width:600px){.review-bar{margin:16px auto;padding:0 16px}.frame{border-left:0;border-right:0;border-radius:0}.markdown-body{padding:16px}.file-label{padding:14px 16px}}
body:not(.light) a[href$="#gh-light-mode-only"],body.light a[href$="#gh-dark-mode-only"]{display:none}
</style></head><body><nav class="review-bar"><strong>LOCAL README PREVIEW</strong><span>GitHub-sanitized content · approximate GitHub styling</span><button id="theme" type="button">Light theme</button><a href="README-source.txt">Source</a></nav><main class="frame"><div class="file-label">ZakariaArc / README.md</div><article class="markdown-body">${body}</article></main><script>
const sources=[...document.querySelectorAll('picture source')].map(source=>({source,media:source.media}));
const reviewLayout=new URLSearchParams(location.search).get('layout');
function syncPictures(){const dark=!document.body.classList.contains('light');for(const {source,media} of sources){const needsDark=media.includes('(prefers-color-scheme: dark)');const sizeQuery=media.replace(/\\(prefers-color-scheme: dark\\)\\s*(and\\s*)?/g,'').trim();source.media=reviewLayout?((!needsDark||dark)&&(!sizeQuery||reviewLayout==='mobile')?'all':'not all'):needsDark?(dark?(sizeQuery||'all'):'not all'):media;} }

document.getElementById('theme').onclick=()=>{const light=document.body.classList.toggle('light');document.getElementById('theme').textContent=light?'Dark theme':'Light theme';syncPictures();};
if(new URLSearchParams(location.search).get('theme')==='light')document.getElementById('theme').click();else syncPictures();
</script></body></html>`;
await writeFile(resolve(out, 'index.html'), page);
await writeFile(resolve(out, 'README-source.txt'), markdown);
console.log('Built preview/index.html from GitHub-sanitized README HTML. This does not publish anything.');
