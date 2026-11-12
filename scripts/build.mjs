import {readFile,writeFile,appendFile,mkdir,stat,realpath,readdir} from 'node:fs/promises';
import {resolve,dirname,basename,relative,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSnapshot,safeURL,formEndpoint,youtubeURL} from './schema.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const fail=(file,line,message)=>{throw new Error(`${file}${line?` row ${line}`:''}: ${message}`);};

// RFC-style quotes, commas, double quotes and embedded newlines. No spreadsheet dependency.
export function parseCSV(text,file='CSV'){
  text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],field='',quoted=false,afterQuote=false,line=1,start=1;
  const cell=()=>{row.push(field.trim());field='';afterQuote=false;};
  const finish=()=>{cell();if(row.some(s=>s!==''))rows.push({cells:row,line:start});row=[];start=line+1;};
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;afterQuote=true;}}else{field+=c;if(c==='\n')line++;}continue;}
    if(c==='"'){if(field.trim())fail(file,line,'a quote inside text must be doubled inside a quoted field');quoted=true;field='';}
    else if(c===','){cell();}
    else if(c==='\n'){finish();line++;}
    else if(c==='\r'&&text[i+1]==='\n'){}
    else if(afterQuote&&!/\s/.test(c))fail(file,line,'unexpected characters after a closing quote');
    else if(!afterQuote)field+=c;
  }
  if(quoted)fail(file,line,'unclosed quote');if(field||row.length||afterQuote)finish();return rows;
}
const headers={
  'current-artists.csv':['name','genre','link'],'alumni-artists.csv':['name','genre','link'],
  'releases.csv':['id','title','artist','project','year','link','cover','in_catalogue','catalogue_title','catalogue_link','catalogue_cover','hue'],
  'new-releases.csv':['release_id','youtube','playback_title'],'shelf.csv':['release_id','title','cover','link'],
  'shop.csv':['id','name','price','link','images'],'socials.csv':['label','handle','url'],
};
// Explain a wrong value count in words an editor can act on.
export function columnMessage(header,cells){
  return cells.length<header.length
    ?`has ${cells.length} values but needs ${header.length}: ${header.join(', ')}. A comma is probably missing; empty columns still need their commas.`
    :`has ${cells.length} values but needs ${header.length}. Put double quotes around text that contains a comma, like "A, B".`;
}
const lineOf=new WeakMap();
async function csv(file){
  const rows=parseCSV(await readFile(resolve(root,'content',file),'utf8'),file),header=rows.shift()?.cells;
  if(JSON.stringify(header)!==JSON.stringify(headers[file]))fail(file,1,`keep this header exactly: ${headers[file].join(',')}`);
  return rows.map(({cells,line})=>{if(cells.length!==header.length)fail(file,cells[0]?`${line} (${cells[0]})`:line,columnMessage(header,cells));const row=Object.fromEntries(header.map((name,i)=>[name,cells[i]]));lineOf.set(row,line);return row;});
}
// Accept the forms editors naturally copy from GitHub: a %20-encoded path or the file's GitHub page.
export function imagePath(value){
  let v=value.trim();
  const page=v.match(/^https:\/\/github\.com\/[^/]+\/[^/]+\/(?:blob|raw)\/[^/]+\/(images\/.+)$/);
  if(page)v=page[1];
  if(!v.startsWith('https://')&&/%[0-9A-Fa-f]{2}/.test(v)){try{v=decodeURIComponent(v);}catch{}}
  return v;
}
// Suggest the next unused ID in the most common numbered pattern, e.g. 5.5-067.
export function nextId(ids){
  const groups=new Map();
  for(const id of ids){const m=id.match(/^(.*?)(\d+)$/);if(!m)continue;const g=groups.get(m[1])??{count:0,max:0,width:m[2].length};g.count++;g.max=Math.max(g.max,Number(m[2]));groups.set(m[1],g);}
  const [prefix,g]=[...groups].sort((a,b)=>b[1].count-a[1].count)[0]??['',{max:0,width:3}];
  return prefix+String(g.max+1).padStart(g.width,'0');
}
export async function build({repository='NotRithik/fivepointfive-content',revision='local-check',localAssets=false}={}){
  if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository))throw new Error('Invalid repository identity');
  const fileChecks=new Set();
  const image=async(raw,path)=>{
    if(!raw)return '';
    const value=imagePath(raw);
    if(value.startsWith('https://'))return safeURL(value,path,{image:true});
    if(!/^images\/[A-Za-z0-9_./ -]+$/.test(value)||value.split('/').includes('..')||!['.png','.jpg','.jpeg','.webp'].includes(extname(value).toLowerCase()))throw new Error(`${path}: "${raw}" is not an image path. Upload a PNG, JPG or WebP to images/ and write its path exactly as shown there, like images/covers/new-single.jpg`);
    const filename=resolve(root,value),actual=await realpath(filename).catch(async()=>{
      const near=(await readdir(dirname(filename)).catch(()=>[])).find(f=>f.toLowerCase()===basename(value).toLowerCase());
      throw new Error(`${path}: there is no file at ${value}. ${near?`Did you mean ${relative(root,resolve(dirname(filename),near))}? Capital letters must match.`:'Upload it first, and copy its exact name from the images folder.'}`);
    });
    if(!actual.startsWith(resolve(root,'images')+'/'))throw new Error(`${path}: image resolves outside images/`);
    const info=await stat(filename);if(!info.isFile()||info.size>15*1024*1024)throw new Error(`${path}: image must be a file smaller than 15 MB`);fileChecks.add(value);
    return localAssets?'/'+value.slice('images/'.length):`https://raw.githubusercontent.com/${repository}/${revision}/${value.split('/').map(encodeURIComponent).join('/')}`;
  };
  const artists=async(file,type)=>(await csv(file)).map(r=>({...r,type}));
  const roster=await artists('current-artists.csv','current'),collaborators=await artists('alumni-artists.csv','collab');
  const releases=[];
  const releaseRows=await csv('releases.csv'),seen=new Map(),suggest=nextId(releaseRows.map(r=>r.id));
  for(const r of releaseRows){
    const at=`releases.csv row ${lineOf.get(r)} (${r.id||r.title})`;
    if(!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(r.id))throw new Error(`${at}: the ID can only use letters, numbers, dots and hyphens, like ${suggest}`);
    if(seen.has(r.id)){const first=seen.get(r.id);throw new Error(`releases.csv: the ID ${r.id} is used twice, by ${first.title} (row ${first.line}) and ${r.title} (row ${lineOf.get(r)}). Every release needs its own ID; give the new one the next unused ID, ${suggest}.`);}
    seen.set(r.id,{title:r.title,line:lineOf.get(r)});
    if(!['yes','no'].includes(r.in_catalogue))throw new Error(`${at}: in_catalogue must be yes or no (found "${r.in_catalogue}")`);
    if(!/^\d{4}$/.test(r.year))throw new Error(`${at}: year must be four digits, like 2026 (found "${r.year}")`);
    if(!['','0','1','2','3'].includes(r.hue))throw new Error(`${at}: hue must be 0, 1, 2, 3 or left empty (found "${r.hue}")`);
    releases.push({cat:r.id,title:r.title,artist:r.artist,project:r.project,year:Number(r.year),spotify:r.link,cover:await image(r.cover,`${r.id}.cover`),hue:r.hue===''?0:Number(r.hue),youtube:'',featured:false,top:false,catalogVisible:r.in_catalogue==='yes',catalogTitle:r.catalogue_title,catalogLink:r.catalogue_link,catalogCover:await image(r.catalogue_cover,`${r.id}.catalogue_cover`)});
  }
  const byId=new Map(releases.map(r=>[r.cat,r]));
  const apply=async(file,fn,max)=>{const rows=await csv(file);if(rows.length>max)throw new Error(`${file} has ${rows.length} records, but the ${file==='shelf.csv'?'wall shelf':'front crate'} only holds ${max}. Remove or replace a line so there are at most ${max}.`);const used=new Set();for(const [i,row]of rows.entries()){const at=`${file} row ${lineOf.get(row)}`;const release=byId.get(row.release_id);if(!release)throw new Error(`${at}: there is no release with ID ${row.release_id} in releases.csv. Add it there first, or check the ID.`);if(used.has(row.release_id))throw new Error(`${at}: ${row.release_id} is already listed above. Each record can appear once.`);used.add(row.release_id);await fn(row,release,i);}};
  await apply('new-releases.csv',(row,r,i)=>{youtubeURL(row.youtube,`new-releases.csv ${row.release_id}`);r.featured=true;r.featuredOrder=i+1;r.youtube=row.youtube;r.playbackTitle=row.playback_title;},7);
  await apply('shelf.csv',async(row,r,i)=>{r.top=true;r.topOrder=i+1;r.topTitle=row.title;r.topCover=await image(row.cover,`shelf.csv ${row.release_id}.cover`);r.topLink=row.link;},5);
  const merch=[];for(const p of await csv('shop.csv')){if(!/^\d+(\.\d{1,2})?$/.test(p.price))throw new Error(`shop.csv ${p.id}: price is rupees as digits, no currency symbol or thousands separator`);merch.push({...p,price:Number(p.price),images:await Promise.all(p.images.split('|').map(s=>s.trim()).filter(Boolean).map(src=>image(src,`shop.csv ${p.id}.images`)))});}
  const settings=JSON.parse(await readFile(resolve(root,'content/settings.json'),'utf8'));
  for(const key of ['logo_light','logo_dark','wall_artwork','new_releases_label','catalogue_label'])settings[key]=await image(settings[key],`settings.${key}`);
  const snapshot={schemaVersion:1,repository,revision,generatedAt:new Date().toISOString(),data:{roster,collaborators,releases,merch,socials:await csv('socials.csv'),settings}};
  validateSnapshot(snapshot);return snapshot;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const args=process.argv.slice(2),localAssets=args.includes('--local-assets');
    const get=(k,f)=>{const i=args.indexOf(k);return i>=0?args[i+1]:f;};
    const snapshot=await build({repository:process.env.GITHUB_REPOSITORY||'NotRithik/fivepointfive-content',revision:process.env.GITHUB_SHA||'local-check',localAssets});
    if(!args.includes('--check')){const output=resolve(root,get('--out','build/content.json'));await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(snapshot,null,2)+'\n');}
    const d=snapshot.data,summary=`Content valid: ${d.roster.length} current, ${d.collaborators.length} alumni, ${d.releases.filter(r=>r.catalogVisible).length} catalogue releases, ${d.releases.filter(r=>r.featured).length} homepage records, ${d.releases.filter(r=>r.top).length} shelf picks, ${d.merch.length} products. File order preserved.`;
    console.log(summary);
    if(args.includes('--check')&&process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,`### ✅ ${summary}\n`);
  }catch(error){
    console.error(`\nCONTENT NOT PUBLISHED\n${error.message}\nFix the named file and commit again. The website keeps its last good content.\n`);
    // Show the reason on the run page itself, not only inside the log.
    if(process.env.GITHUB_ACTIONS){
      console.log(`::error title=Content not published::${error.message.replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A')}`);
      if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,`### ❌ Content not published\n\n**${error.message}**\n\nFix that file and commit again. Until it is fixed, every later save also shows a red cross, even saves to other files. The website keeps showing its last good content.\n`);
    }
    process.exitCode=1;
  }
}
