import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const downloads=[
 ...['Regular','Medium','SemiBold'].map(weight=>[`assets/fonts/Poppins-${weight}.ttf`,`https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-${weight}.ttf`]),
 ['assets/fonts/OFL.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/OFL.txt'],
 ['assets/brand/alx-official.svg','https://www.alxafrica.com/wp-content/uploads/2026/02/footer-logo.svg'],
 ...['boxes','layers','graduation-cap','music-2','chart-no-axes-combined','heart-pulse','calendar-days','headphones','book-open','arrow-up-right','lock-keyhole','chevron-right','play','skip-back','skip-forward','shuffle','repeat-2','volume-2','heart','code-xml','terminal','database','braces','git-branch','folder-git-2','calendar-range','star','camera'].map(name=>[`assets/icons/lucide/${name}.svg`,`https://cdn.jsdelivr.net/npm/lucide-static@0.468.0/icons/${name}.svg`]),
 ['assets/icons/mysql-mark.svg','https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/mysql/mysql-original.svg'],
 ['assets/icons/linux-mark.svg','https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/linux/linux-plain.svg'],
 ['assets/icons/lucide/LICENSE','https://raw.githubusercontent.com/lucide-icons/lucide/0.468.0/LICENSE'],
 ['assets/icons/DEVICON-LICENSE','https://raw.githubusercontent.com/devicons/devicon/v2.16.0/LICENSE'],
];
const results=await Promise.allSettled(downloads.map(async([path,url])=>{
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error(`${path}: HTTP ${response.status}`);
 await mkdir(dirname(resolve(root,path)),{recursive:true});
 await writeFile(resolve(root,path),Buffer.from(await response.arrayBuffer()));
 return path;
}));
for(const [i,r] of results.entries())if(r.status==='rejected')console.error(downloads[i][0],r.reason.message);
if(results.some(r=>r.status==='rejected'))process.exitCode=1;
else console.log(`Saved ${downloads.length} official font, brand and icon resources locally.`);
