import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {type,measure,escapeXml as esc} from './typography.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(await readFile(resolve(root,'data/profile.json'),'utf8'));
const C={bg:'#070b0e',border:'#242d32',white:'#f1f3f2',muted:'#b6babe',dim:'#7b858c'};
const put=async(path,content)=>{await mkdir(dirname(resolve(root,path)),{recursive:true});await writeFile(resolve(root,path),content);};
const raster=async file=>`data:image/jpeg;base64,${(await readFile(resolve(root,file))).toString('base64')}`;
const coast=await raster('assets/moonlit-coast.jpg'),cover=await raster('assets/channel-orange.jpg');
const projectArt=new Map(await Promise.all(data.projects.filter(p=>p.slug!=='techtrack').map(async p=>[p.slug,await raster(`assets/project-art/${p.slug}.jpg`)])));
const svg=(w,h,title,desc,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc>${body}</svg>\n`;
const rect=(x,y,w,h,fill=C.bg,stroke=C.border,r=7)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const txt=(x,y,s,size=16,fill=C.white,weight=400,extra={})=>type(s,x,y,size,{fill,weight,...extra});
const inner=s=>s.replace(/^[\s\S]*?<svg\b[^>]*>/,'').replace(/<\/svg>\s*$/,'').replace(/<\?xml[^>]*\?>|<!--[^]*?-->|<title[^>]*>[^]*?<\/title>/g,'');
const lucideFiles=new Map();
async function icon(name,x,y,size=24,color=C.white,stroke=1.7){
 if(!lucideFiles.has(name))lucideFiles.set(name,inner(await readFile(resolve(root,`assets/icons/lucide/${name}.svg`),'utf8')));
 return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${lucideFiles.get(name)}</svg>`;
}
const brandFiles=new Map();
async function brand(slug,x,y,size=24,color=C.white){
 if(!brandFiles.has(slug)){
  const raw=await readFile(resolve(root,slug==='mysql'?'assets/icons/mysql-mark.svg':slug==='linux'?'assets/icons/linux-mark.svg':`assets/icons/${slug}.svg`),'utf8');
  brandFiles.set(slug,{viewBox:raw.match(/viewBox="([^"]+)"/)?.[1]||'0 0 24 24',body:inner(raw)});
 }
 const b=brandFiles.get(slug);return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${b.viewBox}" fill="${color}">${b.body.replace(/fill="(?!none)[^"]*"/g,`fill="${color}"`)}</svg>`;
}
const alxSource=await readFile(resolve(root,'assets/brand/alx-official.svg'),'utf8');
const alx=(x,y,w=120,opacity=1)=>`<svg x="${x}" y="${y}" width="${w}" height="${w*41/80}" viewBox="0 0 80 41" opacity="${opacity}">${inner(alxSource)}</svg>`;
const frame=(w,h)=>rect(.5,.5,w-1,h-1);
const fade=(id,w,h,src,opacity=.22)=>`<defs><linearGradient id="${id}-fade"><stop offset="0" stop-color="white" stop-opacity="0"/><stop offset=".42" stop-color="white" stop-opacity=".05"/><stop offset="1" stop-color="white"/></linearGradient><mask id="${id}-mask"><rect width="${w}" height="${h}" fill="url(#${id}-fade)"/></mask><clipPath id="${id}-clip"><rect x="1" y="1" width="${w-2}" height="${h-2}" rx="7"/></clipPath></defs><image x="0" y="0" width="${w}" height="${h}" href="${src}" preserveAspectRatio="xMaxYMid slice" mask="url(#${id}-mask)" clip-path="url(#${id}-clip)" opacity="${opacity}"/>`;
const chipIcons={'React':'react','Next.js':'nextdotjs','NestJS':'nestjs','TypeScript':'typescript','MySQL':'mysql','HTML / CSS':'html5','JavaScript':'javascript','Node.js':'nodedotjs','MongoDB':'mongodb','Bootstrap':'braces','jQuery':'code-xml','Express':'code-xml','Cloudflare Workers':'terminal'};
async function chips(values,x,y,{size=11.5,height=27,gap=7}={}){
 let result='';for(const value of values){const width=measure(value,size,400)+36,which=chipIcons[value];result+=rect(x,y,width,height,'#0e1418','#283137',4);result+=which&&['braces','code-xml','terminal'].includes(which)?await icon(which,x+8,y+7,13,C.muted):which?await brand(which,x+8,y+7,13,C.muted):'';result+=txt(x+27,y+18.5,value,size,C.muted);x+=width+gap;}return result;
}
async function privacyBadge(x,y,label='Private'){const width=80;return rect(x,y,width,24,'#10161a','#303a41',4)+await icon(label==='Private'?'lock-keyhole':'code-xml',x+8,y+6,12,C.muted)+txt(x+26,y+16.5,label,10.3,C.muted);}
const projectIcons={health:'heart-pulse',calendar:'calendar-days',music:'headphones',courses:'book-open',pictures:'camera'};
async function projectCard(p){
 const w=480,h=198;let body=frame(w,h)+fade(p.slug,w,h,projectArt.get(p.slug),.58);
 body+=`<path d="M405 0 270 198M470 0 335 198" stroke="#7d8b94" stroke-width="19" opacity=".025"/>`;
 body+=await icon(projectIcons[p.icon],24,25,28)+txt(66,48,p.name,24,C.white,600)+(p.badge?await privacyBadge(376,27,p.badge):'');
 body+=txt(24,91,p.description[0],16.4,C.muted)+txt(24,116,p.description[1],16.4,C.muted)+await chips(p.tech,24,150,{size:p.slug==='e-esj'?10.6:11.2});
 return svg(w,h+10,p.name,`${p.visibility}. ${p.description.join(' ')} Technologies: ${p.tech.join(', ')}.`,body);
}
for(const p of data.projects.filter(p=>p.slug!=='techtrack'))await put(`assets/projects/${p.slug}.svg`,await projectCard(p));
const cardBodies=[];
for(const p of data.projects.filter(p=>p.slug!=='techtrack'))cardBodies.push(inner(await projectCard(p)).replace(/<desc[^>]*>[\s\S]*?<\/desc>/g,''));
for(const mobile of [false,true]){
 const scale=mobile?.875:443/480,w=mobile?420:900,h=mobile?733:380;
 const body=cardBodies.map((card,i)=>`<g transform="translate(${mobile?0:i%2*457} ${mobile?i*186:Math.floor(i/2)*197}) scale(${scale})">${card}</g>`).join('');
 await put(`assets/projects/grid${mobile?'-mobile':''}.svg`,svg(w,h,'Featured Projects','e-ESJ: healthcare and teleconsultation. NTICEmploi: class timetables. TrackSnap: Spotify and music. These three repositories are private. PicTracker: profile picture change tracking for public usernames, a personal project.',body));
}
for(const [slug,label,glyph] of [['projects','Featured Projects','boxes'],['learning','ALX Africa - Learning Journey','graduation-cap'],['stack','Tech Stack','layers'],['music','Now Playing','music-2'],['activity','GitHub Stats & Activity','chart-no-axes-combined']])for(const mobile of [false,true])for(const light of [false,true]){
 const w=mobile?420:900,h=48,color=light?'#242a30':C.white,size=mobile&&label.length>24?21:23;
 await put(`assets/sections/${slug}${mobile?'-mobile':''}${light?'-light':''}.svg`,svg(w,h,label,label,await icon(glyph,0,12,26,color)+txt(41,34,label,size,color,500)));
}
let alxBody=frame(900,152)+alx(29,45,128)+`<path d="M186 26v100" stroke="${C.border}"/>`+txt(214,48,'ALX Africa',24,C.white,500)+rect(372,27,87,24,'#11181c','#303a41',4)+txt(415.5,43.5,'Learning',10.8,C.muted,400,{anchor:'middle'})+txt(214,81,'My software engineering coursework,',16,C.muted)+txt(214,106,'from foundations to applied projects.',16,C.muted);
for(const [i,glyph,label] of [[0,'layers','Foundations'],[1,'code-xml','Projects'],[2,'terminal','Systems']]){const x=623+i*89;alxBody+=await icon(glyph,x+20,53,24,C.muted)+txt(x+32,102,label,10.3,C.muted,400,{anchor:'middle'});}
await put('assets/alx.svg',svg(900,152,'ALX Africa - my learning journey','Official ALX logo. My software engineering coursework, from foundations to applied projects.',alxBody));
const alxMobile=frame(420,175)+alx(21,29,90)+txt(136,45,'ALX Africa',24,C.white,500)+txt(136,71,'Learning journey',12,C.muted)+txt(21,115,'Software engineering coursework.',16,C.muted)+txt(21,144,'Foundations, projects and systems.',15,C.muted);
await put('assets/alx-mobile.svg',svg(420,175,'ALX Africa - learning journey','Official ALX logo with my software engineering learning journey.',alxMobile));
const cap=data.projects.find(p=>p.slug==='techtrack');
let capBody=frame(900,96)+await icon('book-open',23,24,28)+txt(66,45,'TechTrack',21,C.white,500)+txt(66,71,'Curated programming video courses · no account required.',13.4,C.muted)+txt(875,31,'PUBLIC / ALX CAPSTONE',10,C.dim,400,{anchor:'end',tracking:1.1})+await icon('arrow-up-right',856,54,21,C.white);
await put('assets/alx-capstone.svg',svg(900,96,'TechTrack - ALX capstone',`${cap.description.join(' ')} ${cap.tech.join(', ')}. Open the public repository.`,capBody));
let capMobile=frame(420,125)+await icon('book-open',19,21,25)+txt(56,42,'TechTrack',22,C.white,500)+txt(399,37,'ALX CAPSTONE',9.5,C.dim,400,{anchor:'end'})+txt(20,77,'Curated programming video courses.',15,C.muted)+txt(20,101,'No account required.',14,C.muted)+await icon('arrow-up-right',375,85,20,C.white);
await put('assets/alx-capstone-mobile.svg',svg(420,125,'TechTrack - ALX capstone','Public programming video course platform. Open TechTrack on GitHub.',capMobile));
for(const [slug,title,glyph,subtitle] of [['c','C & algorithms','braces','Pointers · trees · sorting'],['python','Python & databases','database','Python · SQL · ORM'],['frontend','Frontend engineering','code-xml','HTML · CSS · React'],['systems','Linux & infrastructure','terminal','Shell · networks · servers']]){
 await put(`assets/learning/${slug}.svg`,svg(220,68,title,subtitle,frame(220,68)+await icon(glyph,15,22,22,C.muted)+txt(48,29,title,10.5,C.white,500)+txt(48,48,subtitle,8.8,C.dim)));
}
for(const mobile of [false,true]){
 const w=mobile?420:900,h=mobile?158:72,bw=mobile?203:214.5;let body='';
 const areas=[['C & algorithms','braces','Pointers · trees · sorting'],['Python & databases','database','Python · SQL · ORM'],['Frontend engineering','code-xml','HTML · CSS · React'],['Linux & infrastructure','terminal','Shell · networks · servers']];
 for(const [i,[title,glyph,subtitle]] of areas.entries()){
  const x=mobile?i%2*217:i*228.5,y=mobile?Math.floor(i/2)*86:0;
  body+=rect(x+.5,y+.5,bw-1,71)+await icon(glyph,x+13,y+25,21,C.muted)+txt(x+43,y+31,title,12.1,C.white,500)+txt(x+43,y+51,subtitle,10,C.dim);
 }
 await put(`assets/learning/grid${mobile?'-mobile':''}.svg`,svg(w,h,'ALX coursework areas','C and algorithms; Python and databases; frontend engineering; Linux and infrastructure. Repository links are in the coursework index below.',body));
}
async function stack(mobile){
 const w=mobile?420:900,h=mobile?280:106,cols=mobile?5:13;let body='';
 for(let i=0;i<data.technologies.length;i++){const [slug,label]=data.technologies[i],col=i%cols,row=Math.floor(i/cols),slot=mobile?84:900/13,x=col*slot+3,y=row*92+2,bw=slot-6;body+=rect(x,y,bw,86,'#080e12','#202a30',5)+await brand(slug,x+(bw-37)/2,y+13,37)+txt(x+bw/2,y+72,label,label.length>9?9.1:10.4,C.muted,400,{anchor:'middle'});}
 return svg(w,h,'Tech stack',data.technologies.map(x=>x[1]).join(', '),body);
}
await put('assets/stack.svg',await stack(false));await put('assets/stack-mobile.svg',await stack(true));
for(const [slug,label] of data.technologies)await put(`assets/tech/${slug}.svg`,svg(82,96,label,`${label} official mark.`,frame(82,96)+await brand(slug,21,13,40)+txt(41,79,label,label.length>9?10:11,C.muted,400,{anchor:'middle'})));
const album=(x,y,size)=>`<image x="${x}" y="${y}" width="${size}" height="${size}" href="${cover}"/>`+rect(x-.5,y-.5,size+1,size+1,'none','#626a6d',2);
const time=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const progress=(x,y,w)=>`<rect x="${x}" y="${y}" width="${w}" height="3" rx="1.5" fill="#62696d" opacity=".55"/><rect x="${x}" y="${y}" width="${w*data.music.position/data.music.duration}" height="3" rx="1.5" fill="${C.white}"/><circle cx="${x+w*data.music.position/data.music.duration}" cy="${y+1.5}" r="4" fill="${C.white}"/>`;
async function controls(x,y){return await icon('shuffle',x,y+6,19,C.muted)+await icon('skip-back',x+48,y+4,21,C.white)+`<circle cx="${x+112}" cy="${y+14}" r="20" fill="${C.white}"/>`+await icon('play',x+103,y+4,21,C.bg,2)+await icon('skip-forward',x+155,y+4,21,C.white)+await icon('repeat-2',x+205,y+6,19,C.muted);}
let music=frame(900,232)+fade('music',900,232,coast,.82)+album(18,18,196)+txt(245,61,'Pyramids',27,C.white,600)+txt(245,91,'Frank Ocean',18,C.muted)+txt(875,31,'OPEN ON YOUTUBE',9.5,C.muted,400,{anchor:'end',tracking:1.1})+await icon('heart',436,46,20,C.white);
music+=await controls(245,120)+await icon('volume-2',692,145,21,C.muted);
for(let i=0;i<33;i++){const h=5+(Math.sin(i*1.73)+1)*12;music+=`<rect x="${736+i*4}" y="${171-h}" width="2" height="${h}" fill="#8d979e" opacity=".38"/>`;}
music+=progress(245,184,628)+txt(245,213,`${time(data.music.position)} / ${time(data.music.duration)}`,12,C.muted);
await put('assets/music.svg',svg(900,232,'Pyramids - Frank Ocean','Static music card with original channel ORANGE artwork. Open the official audio at 07:04 of 09:52.',music));
let musicMobile=frame(420,295)+fade('music-mobile',420,295,coast,.5)+album(16,16,133)+txt(170,53,'Pyramids',25,C.white,600)+txt(170,84,'Frank Ocean',16,C.muted)+txt(170,110,'channel ORANGE',10.5,C.dim)+txt(17,180,'OPEN ON YOUTUBE',9.5,C.muted,400,{tracking:1.2})+await controls(90,198)+progress(18,250,384)+txt(18,278,`${time(data.music.position)} / ${time(data.music.duration)}`,12,C.muted);
await put('assets/music-mobile.svg',svg(420,295,'Pyramids - Frank Ocean','Open the official audio at 07:04. Original channel ORANGE artwork with a moonlit coast.',musicMobile));
console.log('Built Poppins graphics, consistent icons, 2×2 project tiles, official ALX branding and coastal music cards.');

for(const [slug,label,glyph] of [['projects','Project notes & technology','folder-git-2'],['coursework','Coursework index & capstone details','graduation-cap']])for(const mobile of [false,true])for(const light of [false,true]){
 const w=mobile?420:900,h=mobile?52:44;
 const color=light?'#424a52':C.muted;
 let body=await icon(glyph,5,mobile?16:13,20,color)+txt(36,mobile?32:28,label,mobile?16:13.8,color,500);
 await put(`assets/disclosures/${slug}${mobile?'-mobile':''}${light?'-light':''}.svg`,svg(w,h,label,`Expand or collapse ${label.toLowerCase()}.`,body));
}
for(const mobile of [false,true])for(const light of [false,true]){
 const w=mobile?420:900,h=mobile?56:34,ink=light?'#545d66':C.muted;
 let body=txt(0,mobile?19:23,'Dated snapshots of public GitHub data',mobile?15.3:12,ink);
 const x=mobile?0:320,y=mobile?44:23;
 const size=mobile?15.5:12;
 body+=txt(x,y,'Current activity',size,ink,500)+await icon('arrow-up-right',x+measure('Current activity',size,500)+8,y-12,14,ink);
 await put(`assets/stats-footer${mobile?'-mobile':''}${light?'-light':''}.svg`,svg(w,h,'Dated snapshots of public GitHub data - Current activity','Open the GitHub profile for current contribution activity.',body));
}
