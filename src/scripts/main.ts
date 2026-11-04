// Único ponto de entrada de JS: status "aberto agora", composer e relógio. Sem dependências.
import { statusAgora, type Horarios } from '../lib/horarios';

document.documentElement.classList.add('js');

const el = document.getElementById('dados-horarios');
const horarios: Horarios | null = el ? JSON.parse(el.textContent || 'null') : null;

function atualizaStatus() {
  if (!horarios) return;
  const s = statusAgora(horarios);
  const barra = document.querySelector<HTMLElement>('[data-status]');
  const txt = document.querySelector<HTMLElement>('[data-status-txt]');
  if (!barra || !txt) return;
  barra.dataset.aberto = s.aberto ? 'sim' : 'nao';
  txt.textContent = s.texto;
  // destaca a linha de hoje nas tabelas
  const hoje = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: horarios.fuso });
  const map: Record<string, string> = { Monday: 'Segunda a quarta', Tuesday: 'Segunda a quarta', Wednesday: 'Segunda a quarta', Thursday: 'Quinta', Friday: 'Sexta e sábado', Saturday: 'Sexta e sábado', Sunday: 'Domingo' };
  document.querySelectorAll<HTMLElement>('.horarios tr[data-dias]').forEach((tr) => tr.classList.toggle('hoje', tr.dataset.dias === map[hoje]));
}
atualizaStatus();
setInterval(atualizaStatus, 60_000);

if (document.querySelector('[data-composer-form]') && horarios) {
  import('./composer').then((m) => m.iniciaComposer(horarios));
}
if (document.querySelector('[data-relogio]')) {
  import('./relogio').then((m) => m.iniciaRelogio());
}
if (document.body.dataset.evento) {
  const nome = document.body.dataset.evento;
  const tenta = (n = 0) => {
    const u = (window as unknown as { umami?: { track: (e: string) => void } }).umami;
    if (u) u.track(nome);
    else if (n < 20) setTimeout(() => tenta(n + 1), 250);
  };
  tenta();
}
