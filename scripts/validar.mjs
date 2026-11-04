// Validações do projeto: contraste WCAG AA dos tokens, metadados, integridade de dados e HTML gerado (dist/).
import fs from 'node:fs';
import path from 'node:path';

let falhas = 0;
const ok = (c, msg) => { console.log(`${c ? '✔' : '✘'} ${msg}`); if (!c) falhas++; };

// 1. Contraste
const css = fs.readFileSync('src/styles/global.css', 'utf8');
const tok = Object.fromEntries([...css.matchAll(/--color-([\w-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]]));
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const cr = (a, b) => { const [x, y] = [lum(tok[a]), lum(tok[b])].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pares = [
  ['creme', 'carvao', 4.5], ['areia', 'carvao', 4.5], ['areia', 'carvao-2', 4.5], ['creme', 'carvao-2', 4.5],
  ['carvao', 'creme', 4.5], ['carvao', 'tijolo-texto', 0], ['tijolo-texto', 'creme', 4.5],
  ['creme', 'tijolo-botao', 4.5], ['cobre', 'carvao', 4.5], ['cobre', 'carvao-2', 4.5],
  ['tijolo', 'carvao', 3], // só gráfico/texto grande
];
for (const [a, b, min] of pares) if (min) ok(cr(a, b) >= min, `contraste ${a} / ${b} = ${cr(a, b).toFixed(2)} (mín ${min})`);
console.log(`ℹ tijolo sobre carvão = ${cr('tijolo', 'carvao').toFixed(2)} (só elementos gráficos)`);

// 2. Dados
const cfg = JSON.parse(fs.readFileSync('src/content/config.json', 'utf8'));
ok(cfg.endereco.cep === '02375-070' && cfg.whatsapp.numero === '5511916501473', 'endereço/WhatsApp conforme fatos confirmados');
const hor = JSON.parse(fs.readFileSync('src/content/horarios.json', 'utf8'));
const h = (d) => `${hor.semana[d].abre}-${hor.semana[d].fecha}`;
ok(h(4) === '18:00-23:00' && h(5) === '18:00-23:30' && h(6) === '18:00-23:30' && h(0) === '12:00-17:00' && [1, 2, 3].every((d) => !hor.semana[d].abre), 'horarios.json conforme Maps');

// 3. HTML gerado
if (!fs.existsSync('dist')) { console.log('dist/ ausente: rode npm run build'); process.exit(falhas ? 1 : 0); }
const htmls = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && htmls.push(p); } })('dist');
for (const f of htmls) {
  const s = fs.readFileSync(f, 'utf8');
  const t = /<title>([^<]*)<\/title>/.exec(s)?.[1] ?? '';
  const d = /<meta name="description" content="([^"]*)"/.exec(s)?.[1] ?? '';
  ok(t.length > 0 && t.length <= 60, `${f}: title ${t.length} car.`);
  ok(d.length > 0 && d.length <= 155, `${f}: description ${d.length} car.`);
  ok(/<link rel="canonical"/.test(s) && /og:image/.test(s), `${f}: canonical + OG`);
  ok(/<html lang="pt-BR"/.test(s), `${f}: lang pt-BR`);
  ok(!/<style[ >]/.test(s) && !/ style="/.test(s), `${f}: sem CSS inline (CSP)`);
  ok(![...s.matchAll(/<script(?![^>]*(?:src=|type="application\/(?:ld\+)?json"))[^>]*>/g)].length, `${f}: sem JS inline executável (CSP)`);
  ok(![...s.matchAll(/<img\b[^>]*>/g)].some((m) => !/\salt(=|\s|>)/.test(m[0])), `${f}: toda img tem alt`);
  ok(!/aggregateRating|"review"/i.test(s), `${f}: sem nota/avaliação inventada`);
  for (const m of s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) { try { JSON.parse(m[1]); } catch { ok(false, `${f}: JSON-LD inválido`); } }
  for (const m of s.matchAll(/<a [^>]*target="_blank"[^>]*>/g)) ok(/noopener/.test(m[0]), `${f}: target=_blank com noopener`);
}
const home = fs.readFileSync('dist/index.html', 'utf8');
const ld = JSON.parse(/<script type="application\/ld\+json">(\{"@context":"https:\/\/schema.org","@type":"Restaurant".*?)<\/script>/s.exec(home)[1]);
ok(ld.openingHoursSpecification.length === 3 && ld.address.postalCode === '02375-070', 'JSON-LD Restaurant com horários e endereço');
ok(!('acceptsReservations' in ld), 'acceptsReservations ausente (não confirmado)');
const gz = (await import('node:zlib')).gzipSync;
let js = 0;
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') && (js += gz(fs.readFileSync(p)).length); } })('dist/_astro');
ok(js <= 30 * 1024, `JS total ${(js / 1024).toFixed(1)} KB gzip (≤ 30)`);
process.exit(falhas ? 1 : 0);
