import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function envFile(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(fs.readFileSync(file, 'utf8').split(/\r?\n/).flatMap(line => {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    return match ? [[match[1], match[2].trim().replace(/^(['"])(.*)\1$/, '$2')]] : [];
  }));
}
const env = {...envFile(path.join(root,'.env.local')), ...envFile(path.join(root,'supabase/functions/.env.local')), ...process.env};
const base = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;
if (!base || !key) throw new Error('Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.');
const headers = {apikey:key, Authorization:`Bearer ${key}`};
const reportPath = path.join(root,'output/integration-status.json');
const previous = process.argv.includes('--retry-failed') && fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath,'utf8')) : null;
const results = previous ? previous.results.filter(r=>r.ok) : [];
async function check(name, url, options = {}, summarize) {
  if (results.some(r=>r.name===name)) return;
  try {
    const response = await fetch(url, {...options, signal:AbortSignal.timeout(45000)});
    const item = {name,status:response.status,ok:response.ok};
    if (summarize && response.ok) Object.assign(item, await summarize(response));
    results.push(item);
  } catch {results.push({name,ok:false,error:'Request unavailable or timed out'});}
}
await Promise.all([
  check('Supabase Auth settings', `${base}/auth/v1/settings`,{headers}, async r=>{const a=await r.json();return {emailEnabled:a.external?.email,autoConfirm:a.mailer_autoconfirm}}),
  ...['events','trips','gallery','game_day_gallery','game_day_scoreboards','game_day_events','testimonials','team_members','ticket_tiers'].map(table=>check(`Public data: ${table}`,`${base}/rest/v1/${table}?select=id&limit=1`,{headers})),
  ...['pay','verify-payment','payment-callback','cloudinary-upload','send-confirmation-email'].map(name=>check(`Function preflight: ${name}`,`${base}/functions/v1/${name}`,{method:'OPTIONS',headers:{...headers,Origin:'http://localhost:5173','Access-Control-Request-Method':'POST'}},async r=>({allowedOrigin:r.headers.get('access-control-allow-origin')}))),
]);
if (env.RESEND_API_KEY) await check('Resend domains','https://api.resend.com/domains',{headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`}},async r=>({domains:(await r.json()).data?.map(({name,status})=>({name,status}))}));
const required=['PAYMENT_API_URL','DCM_PARTNER_CODE','CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET','RESEND_API_KEY','HUBTEL_CLIENT_ID','HUBTEL_CLIENT_SECRET'];
const report={checkedAt:new Date().toISOString(),project:new URL(base).hostname.split('.')[0],mode:'Read-only: public queries, auth settings, CORS preflights and provider status. No bookings, uploads, payments or messages are created.',localServerConfiguration:required.map(name=>({name,present:Boolean(env[name])})),results};
fs.mkdirSync(path.join(root,'output'),{recursive:true});
fs.writeFileSync(path.join(root,'output/integration-status.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(results.some(r=>!r.ok))process.exitCode=1;
