// Relógio de fermentação: o anel avança com o scroll na seção do processo.
const PASSOS: string[] = [];

export function iniciaRelogio() {
  const svg = document.querySelector<SVGElement>('[data-relogio]');
  const secao = document.querySelector<HTMLElement>('[data-processo]');
  if (!svg || !secao) return;
  const txt = svg.querySelector<SVGTextElement>('[data-relogio-txt]')!;
  const titulo = document.querySelector<HTMLElement>('[data-relogio-titulo]')!;
  const passoTxt = document.querySelector<HTMLElement>('[data-relogio-passo]')!;
  const passos = [...secao.querySelectorAll<HTMLElement>('[data-passo]')];
  const h72 = svg.dataset.h72 === '1';
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  passos.forEach((p) => PASSOS.push(p.querySelector('h3')?.textContent || ''));

  let ativo = -1;
  const aplica = (p: number) => {
    svg.style.setProperty('--p', p.toFixed(4));
    const i = Math.min(passos.length - 1, Math.floor(p * passos.length * 0.9999));
    txt.textContent = h72 ? `${Math.round(p * 72)} h` : `${i + 1}/${passos.length}`;
    if (i !== ativo) {
      ativo = i;
      passos.forEach((el, k) => el.classList.toggle('ativo', k === i));
      titulo.textContent = PASSOS[i];
      passoTxt.textContent = `Passo ${i + 1} de ${passos.length}`;
    }
  };

  if (reduz) {
    passos.forEach((el) => el.classList.add('ativo'));
    svg.style.setProperty('--p', '1');
    txt.textContent = h72 ? '72 h' : 'tempo';
    return;
  }

  let ticking = false;
  const calc = () => {
    ticking = false;
    const r = secao.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 quando o topo da seção chega a 70% da tela; 1 quando o fim chega a 60%.
    const ini = vh * 0.7;
    const total = r.height - vh * 0.1;
    aplica(Math.max(0, Math.min(1, (ini - r.top) / total)));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(calc); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  calc();
}
