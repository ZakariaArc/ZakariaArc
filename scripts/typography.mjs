// Poppins outlines keep SVG image typography independent of GitHub font loading.
import opentype from 'opentype.js';
import { fileURLToPath } from 'node:url';
const fonts=new Map([['400','Regular'],['500','Medium'],['600','SemiBold']].map(([weight,name])=>[weight,opentype.loadSync(fileURLToPath(new URL(`../assets/fonts/Poppins-${name}.ttf`,import.meta.url)))]));
export const escapeXml=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const fontFor=w=>fonts.get(Number(w)>=600?'600':Number(w)>=500?'500':'400');
export function measure(value,size=16,weight=400,tracking=0){
 const font=fontFor(weight),glyphs=font.stringToGlyphs(String(value)),scale=size/font.unitsPerEm;
 return glyphs.reduce((width,g,i)=>width+(g.advanceWidth+(i?font.getKerningValue(glyphs[i-1],g):0))*scale+(i?tracking:0),0);
}
export function type(value,x,y,size=16,{fill='#eff2f1',weight=400,anchor='start',tracking=0,opacity=1}={}){
 const font=fontFor(weight),glyphs=font.stringToGlyphs(String(value)),scale=size/font.unitsPerEm;
 const width=measure(value,size,weight,tracking);
 let cursor=Number(x)-(anchor==='middle'?width/2:anchor==='end'?width:0),d='';
 for(let i=0;i<glyphs.length;i++){
  if(i)cursor+=font.getKerningValue(glyphs[i-1],glyphs[i])*scale+tracking;
  d+=glyphs[i].getPath(cursor,Number(y),size).toPathData(2);
  cursor+=glyphs[i].advanceWidth*scale;
 }
 return `<path data-font="Poppins" aria-label="${escapeXml(value)}" d="${d}" fill="${fill}"${opacity===1?'':` opacity="${opacity}"`}/>`;
}
const decode=s=>s.replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&(lt|gt|amp|quot|apos);/g,(_,s)=>({lt:'<',gt:'>',amp:'&',quot:'"',apos:"'"}[s]));
export function outlineSvgText(svg){
 return svg.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g,(_,attrs,value)=>{
  const a=Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
  if(value.includes('<'))throw new Error('Nested SVG text is unsupported; use simple text nodes.');
  return type(decode(value),Number(a.x||0),Number(a.y||0),Number(a['font-size']||16),{fill:a.fill||'#eff2f1',weight:Number(a['font-weight']||400),anchor:a['text-anchor']||'start',tracking:Number(a['letter-spacing']||0),opacity:Number(a.opacity||1)});
 });
}
