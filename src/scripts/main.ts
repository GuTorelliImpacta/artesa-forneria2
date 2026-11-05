// Único ponto de entrada de JS: header, status "aberto agora", reservas e eventos. Sem dependências.
import { statusAgora, type Horarios } from '../lib/horarios';
import { iniciaCliques, track } from './track';

document.documentElement.classList.add('js');

// Header transparente sobre o hero; sólido ao rolar.
const header = document.querySelector<HTMLElement>('[data-header]');
if (header && header.dataset.transparente === '1') {
  const aplica = () => header.classList.toggle('rolou', scrollY > 24);
  aplica();
  addEventListener('scroll', aplica, { passive: true });
}

// Menu mobile: fecha ao escolher um item ou ao pressionar Esc.
const menu = document.querySelector<HTMLDetailsElement>('[data-menu-m]');
if (menu) {
  menu.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) menu.open = false; });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary')?.focus(); } });
}

// Status e horários
const el = document.getElementById('dados-horarios');
const horarios: Horarios | null = el ? JSON.parse(el.textContent || 'null') : null;
function atualizaStatus() {
  if (!horarios) return;
  const s = statusAgora(horarios);
  document.querySelectorAll<HTMLElement>('[data-status]').forEach((barra) => {
    barra.dataset.aberto = s.aberto ? 'sim' : 'nao';
    const txt = barra.querySelector<HTMLElement>('[data-status-txt]');
    if (txt) txt.textContent = s.texto;
  });
  const hoje = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: horarios.fuso });
  const map: Record<string, string> = { Monday: 'Segunda a quarta', Tuesday: 'Segunda a quarta', Wednesday: 'Segunda a quarta', Thursday: 'Quinta', Friday: 'Sexta e sábado', Saturday: 'Sexta e sábado', Sunday: 'Domingo' };
  document.querySelectorAll<HTMLElement>('.horarios tr[data-dias]').forEach((tr) => tr.classList.toggle('hoje', tr.dataset.dias === map[hoje]));
}
atualizaStatus();
setInterval(atualizaStatus, 60_000);

// Reservas via WhatsApp
if (document.querySelector('[data-reserva-form]') && horarios) {
  import('./reserva').then((m) => m.iniciaReserva(horarios));
}

// Entrada suave das seções
const revs = document.querySelectorAll('.rev');
if (revs.length && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  revs.forEach((r) => io.observe(r));
} else revs.forEach((r) => r.classList.add('in'));

iniciaCliques();
if (document.body.dataset.evento) track(document.body.dataset.evento);
