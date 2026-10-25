// Pure validation shared by the publisher and the website. No dependencies.
const fail=(path,message)=>{throw new Error(`${path}: ${message}`);};
const record=(v,p)=>{if(!v||typeof v!=='object'||Array.isArray(v))fail(p,'expected an object');return v;};
const text=(v,p,max=240,optional=false)=>{if(typeof v!=='string'||v.length>max||(!optional&&!v.trim())||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v))fail(p,`expected ${optional?'optional ':''}text, at most ${max} characters`);return v;};
const list=(v,p,max)=>{if(!Array.isArray(v)||v.length>max)fail(p,`expected a list with at most ${max} items`);return v;};
const number=(v,p,min,max)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail(p,`expected a number between ${min} and ${max}`);};
const bool=(v,p)=>{if(typeof v!=='boolean')fail(p,'expected true or false');};
export function safeURL(value,path,{optional=false,image=false}={}){
  text(value,path,2048,optional);if(!value&&optional)return value;
  if(image&&/^\/(?!\/)[A-Za-z0-9_./% -]+$/.test(value)&&!value.split('/').includes('..'))return value;
  let u;try{u=new URL(value);}catch{fail(path,'use a complete https:// URL');}
  if(u.protocol!=='https:'||u.username||u.password||u.hostname==='localhost'||/^127\.|^0\.|^10\.|^192\.168\.|^169\.254\./.test(u.hostname))fail(path,'use a public HTTPS URL without credentials');
  return value;
}
export function formEndpoint(v,p,enabled){
  text(v,p,200,true);if(!v){if(enabled)fail(p,'an enabled form needs its own Formspark submission URL');return;}
  if(!/^https:\/\/submit-form\.com\/[A-Za-z0-9_-]{5,100}$/.test(v))fail(p,'use the public https://submit-form.com/... URL, not a dashboard link or secret key');
}
export function youtubeURL(v,p){
  if(!v)return;text(v,p,500);
  let u;try{u=new URL(v);}catch{fail(p,'invalid YouTube URL');}
  const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v');
  if(u.protocol!=='https:'||!['youtu.be','youtube.com','www.youtube.com','music.youtube.com'].includes(u.hostname)||!id||!/^[-_A-Za-z0-9]{11}$/.test(id))fail(p,'use the exact YouTube/YouTube Music audio URL with an 11-character video ID');
}
export function validateSnapshot(input){
  const s=record(input,'snapshot');if(s.schemaVersion!==1)fail('schemaVersion','unsupported version');
  text(s.revision,'revision',80);text(s.generatedAt,'generatedAt',40);text(s.repository,'repository',150);
  const d=record(s.data,'data');const ids=new Set();
  for(const [group,type,max] of [['roster','current',20],['collaborators','collab',200]]){
    const names=new Set();for(const [i,a] of list(d[group],group,max).entries()){
      const p=`${group}[${i+1}]`;record(a,p);text(a.name,p+'.name',80);text(a.genre,p+'.genre',100,true);safeURL(a.link,p+'.link');
      if(a.type!==type)fail(p+'.type',`expected ${type}`);if(names.has(a.name.toLowerCase()))fail(p,'duplicate artist');names.add(a.name.toLowerCase());
    }
  }
  const featured=[],shelf=[];
  for(const [i,r] of list(d.releases,'releases',1200).entries()){
    const p=`releases[${i+1}]`;record(r,p);text(r.cat,p+'.id',80);if(!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(r.cat)||ids.has(r.cat))fail(p+'.id','use a unique stable ID');ids.add(r.cat);
    text(r.title,p+'.title',150);text(r.artist,p+'.artist',240);text(r.project,p+'.project',150,true);number(r.year,p+'.year',1900,2200);if(!Number.isInteger(r.year))fail(p+'.year','must be a whole year');
    safeURL(r.spotify,p+'.link');safeURL(r.cover,p+'.cover',{image:true,optional:true});youtubeURL(r.youtube,p+'.youtube');
    number(r.hue,p+'.hue',0,3);bool(r.catalogVisible,p+'.catalogVisible');bool(r.featured,p+'.featured');bool(r.top,p+'.top');
    for(const key of ['catalogTitle','topTitle','playbackTitle'])if(r[key]!==undefined)text(r[key],p+'.'+key,200,true);
    for(const key of ['catalogCover','topCover'])if(r[key]!==undefined)safeURL(r[key],p+'.'+key,{image:true,optional:true});
    for(const key of ['catalogLink','topLink'])if(r[key]!==undefined)safeURL(r[key],p+'.'+key,{optional:true});
    if(r.featured){number(r.featuredOrder,p+'.featuredOrder',1,7);featured.push(r.featuredOrder);}
    if(r.top){number(r.topOrder,p+'.topOrder',1,5);shelf.push(r.topOrder);}
  }
  for(const [name,orders]of [['new-releases',featured],['shelf',shelf]]){const sorted=[...orders].sort((a,b)=>a-b);if(sorted.some((v,i)=>v!==i+1))fail(name,'selection order must be consecutive and unique');}
  const products=new Set();for(const [i,p]of list(d.merch,'shop',200).entries()){
    const k=`shop[${i+1}]`;record(p,k);text(p.id,k+'.id',80);if(products.has(p.id))fail(k,'duplicate product ID');products.add(p.id);text(p.name,k+'.name',150);number(p.price,k+'.price',0,100000000);safeURL(p.link,k+'.link');
    const imgs=list(p.images,k+'.images',12);if(!imgs.length)fail(k+'.images','include at least one product photo');imgs.forEach((v,j)=>safeURL(v,`${k}.images[${j+1}]`,{image:true}));
  }
  const socialNames=new Set();for(const [i,p]of list(d.socials,'socials',6).entries()){
    const k=`socials[${i+1}]`;record(p,k);text(p.label,k+'.label',20);text(p.handle,k+'.handle',80,true);safeURL(p.url,k+'.url');if(socialNames.has(p.label))fail(k,'duplicate label');socialNames.add(p.label);
  }
  const c=record(d.settings,'settings');text(c.site_name,'settings.site_name',70);text(c.contact_email,'settings.contact_email',100);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.contact_email))fail('settings.contact_email','invalid email address');
  for(const key of ['logo_light','logo_dark','wall_artwork','new_releases_label','catalogue_label'])safeURL(c[key],`settings.${key}`,{image:true});
  const contact=record(c.contact,'settings.contact');bool(contact.enabled,'contact.enabled');bool(contact.notificationsEnabled,'contact.notificationsEnabled');if(contact.provider!=='formspark')fail('contact.provider','only formspark is supported');formEndpoint(contact.endpoint,'contact.endpoint',contact.enabled);
  const newsletter=record(c.newsletter,'settings.newsletter');bool(newsletter.enabled,'newsletter.enabled');text(newsletter.heading,'newsletter.heading',120);text(newsletter.description,'newsletter.description',400);formEndpoint(newsletter.endpoint,'newsletter.endpoint',newsletter.enabled);
  if(newsletter.enabled&&newsletter.endpoint===contact.endpoint)fail('newsletter.endpoint','use a separate newsletter form so messages and signups stay separate');
  return input;
}
