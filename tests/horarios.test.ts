import test from 'node:test';
import assert from 'node:assert/strict';
import { statusAgora, agoraNoFuso, datasAbertas, slotsDoDia, type Horarios } from '../src/lib/horarios.ts';
import h from '../src/content/horarios.json' with { type: 'json' };

const H = h as unknown as Horarios;
// Instantes em UTC; São Paulo é UTC-3 o ano todo (sem horário de verão desde 2019).
const sp = (iso: string) => agoraNoFuso(H.fuso, new Date(iso));

test('quinta 19h = aberto, fecha 23h', () => {
  const s = statusAgora(H, sp('2026-11-05T22:00:00Z'));
  assert.equal(s.aberto, true);
  assert.match(s.texto, /23h/);
});
test('quinta 17h = fechado, abre hoje às 18h', () => {
  const s = statusAgora(H, sp('2026-11-05T20:00:00Z'));
  assert.equal(s.aberto, false);
  assert.match(s.texto, /hoje às 18h/);
});
test('sábado 23h10 aberto (fecha 23h30)', () => {
  assert.equal(statusAgora(H, sp('2026-11-08T02:10:00Z')).aberto, true);
});
test('domingo 12h-17h', () => {
  assert.equal(statusAgora(H, sp('2026-11-08T15:00:00Z')).aberto, true);  // dom 12h SP
  assert.equal(statusAgora(H, sp('2026-11-08T20:00:00Z')).aberto, false); // dom 17h SP
});
test('segunda/terça/quarta fechado; próxima abertura quinta', () => {
  for (const d of ['2026-11-02', '2026-11-03', '2026-11-04']) {
    const s = statusAgora(H, sp(`${d}T18:00:00Z`));
    assert.equal(s.aberto, false);
    assert.match(s.texto, /quinta às 18h|amanhã|hoje/);
  }
  assert.match(statusAgora(H, sp('2026-11-02T18:00:00Z')).texto, /quinta às 18h/);
  assert.match(statusAgora(H, sp('2026-11-04T18:00:00Z')).texto, /amanhã às 18h/);
});
test('fuso: 01h UTC de sexta ainda é quinta em SP', () => {
  assert.equal(sp('2026-11-06T01:00:00Z').dia, 4);
});
test('exceção de feriado fecha o dia', () => {
  const hx: Horarios = { ...H, excecoes: [{ data: '2026-11-05', fechado: true }] };
  const s = statusAgora(hx, sp('2026-11-05T22:00:00Z'));
  assert.equal(s.aberto, false);
  assert.match(s.texto, /amanhã às 18h/);
});
test('datas abertas só qui-dom', () => {
  const ds = datasAbertas(H, 60, sp('2026-11-02T15:00:00Z'));
  assert.ok(ds.length > 20);
  assert.ok(ds.every((d) => [4, 5, 6, 0].includes(d.dia)));
  assert.ok(ds[ds.length - 1].iso <= '2027-01-01');
});
test('slots', () => {
  assert.deepEqual(slotsDoDia('18:00', '23:00').slice(-1), ['22:30']);
  assert.equal(slotsDoDia('12:00', '17:00')[0], '12:00');
});
