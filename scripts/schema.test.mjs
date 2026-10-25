import test from 'node:test';
import assert from 'node:assert/strict';
import {build,parseCSV} from './build.mjs';
import {validateSnapshot,safeURL,youtubeURL,formEndpoint} from './schema.mjs';
const settings=(await build({localAssets:true})).data.settings;
const seed={schemaVersion:1,revision:'test',repository:'test/content',generatedAt:new Date().toISOString(),data:{
  roster:[{name:'Artist B',genre:'',type:'current',link:'https://open.spotify.com/artist/example'},{name:'Artist A',genre:'',type:'current',link:'https://open.spotify.com/artist/example2'}],collaborators:[],
  releases:[{cat:'TEST-1',title:'A release',artist:'Artist',project:'SINGLE',year:2026,spotify:'https://open.spotify.com/track/example',cover:'/covers/test.png',hue:0,youtube:'',featured:true,featuredOrder:1,top:true,topOrder:1,catalogVisible:true}],
  merch:[{id:'TEST-1',name:'Product',price:100,link:'https://example.com/buy',images:['/merch/test.png']}],socials:[],settings:structuredClone(settings)}};
seed.data.settings.newsletter={enabled:false,heading:'Newsletter',description:'Test',endpoint:''};
const copy=()=>structuredClone(seed);
test('current editable files compile successfully',async()=>validateSnapshot(await build({localAssets:true})));
test('quoted commas, escaped quotes and newlines are parsed as one field',()=>{assert.deepEqual(parseCSV('name,note\n"A, B","a ""quote""\nand a new line"\n').map(r=>r.cells),[['name','note'],['A, B','a "quote"\nand a new line']]);});
test('malformed quotes are rejected instead of skipping records',()=>{assert.throws(()=>parseCSV('a,b\n"unclosed,b'));assert.throws(()=>parseCSV('a,b\n"a"bad,b'));});
test('validation preserves intentional file order',()=>{const c=copy();c.data.roster.reverse();c.data.releases.reverse();c.data.merch.reverse();const before=JSON.stringify(c);validateSnapshot(c);assert.equal(JSON.stringify(c),before);});
test('empty lists are valid and never repopulated with old items',()=>{const c=copy();for(const k of ['roster','collaborators','releases','merch','socials'])c.data[k]=[];assert.equal(validateSnapshot(c).data.merch.length,0);});
test('duplicate release IDs fail',()=>{const c=copy();c.data.releases.push(c.data.releases[0]);assert.throws(()=>validateSnapshot(c),/unique stable ID/);});
test('unsafe or credential-bearing links fail',()=>{for(const u of ['javascript:alert(1)','data:text/html,hi','http://example.com','https://me:secret@example.com','https://localhost/test'])assert.throws(()=>safeURL(u,'test'));});
test('known public HTTPS links and local fallback image paths pass',()=>{safeURL('https://open.spotify.com/track/abc','link');safeURL('/covers/real.webp','image',{image:true});});
test('malformed prices fail',()=>{const c=copy();c.data.merch[0].price=-1;assert.throws(()=>validateSnapshot(c),/price/);});
test('display order and capacity violations fail',()=>{const c=copy();const r=c.data.releases.filter(r=>r.featured);r[0].featuredOrder=9;assert.throws(()=>validateSnapshot(c),/featuredOrder/);});
test('exact audio IDs accepted, malformed video and lookalike hosts rejected',()=>{youtubeURL('https://music.youtube.com/watch?v=lU36RsYI23I','audio');for(const u of ['https://youtube.com.evil.test/watch?v=lU36RsYI23I','https://youtu.be/wrong'])assert.throws(()=>youtubeURL(u,'audio'));});
test('unconfigured newsletter stays disabled, enabled requires destination',()=>{const c=copy();assert.equal(c.data.settings.newsletter.enabled,false);c.data.settings.newsletter.enabled=true;assert.throws(()=>validateSnapshot(c),/enabled form/);});
test('forms accept only public Formspark submission endpoints',()=>{formEndpoint('https://submit-form.com/abcDEF12','form',true);assert.throws(()=>formEndpoint('https://dashboard.formspark.io/account','form',true));assert.throws(()=>formEndpoint('https://submit-form.com/a?key=secret','form',true));});
test('contact and newsletter cannot accidentally share a form',()=>{const c=copy();c.data.settings.newsletter.enabled=true;c.data.settings.newsletter.endpoint=c.data.settings.contact.endpoint;assert.throws(()=>validateSnapshot(c),/separate newsletter/);});
test('invalid schema versions fail closed',()=>{const c=copy();c.schemaVersion=99;assert.throws(()=>validateSnapshot(c));});
