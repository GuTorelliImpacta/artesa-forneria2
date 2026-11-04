import { datasAbertas, slotsDoDia, rotuloData, type Horarios } from '../lib/horarios';

export function iniciaComposer(h: Horarios) {
  const raiz = document.querySelectorAll<HTMLElement>('[data-composer]');
  raiz.forEach((r) => monta(r, h));
}

function monta(raiz: HTMLElement, h: Horarios) {
  const form = raiz.querySelector<HTMLFormElement>('[data-composer-form]')!;
  const fallback = raiz.querySelector<HTMLElement>('[data-composer-fallback]');
  const max = Number(raiz.dataset.max || 20);
  const dias = Number(raiz.dataset.dias || 60);
  const numero = (raiz.dataset.wa || '').replace(/\D/g, '');
  const nome = form.elements.namedItem('nome') as HTMLInputElement;
  const data = form.elements.namedItem('data') as HTMLSelectElement;
  const hora = form.elements.namedItem('hora') as HTMLSelectElement;
  const pessoas = form.elements.namedItem('pessoas') as HTMLInputElement;

  const abertas = datasAbertas(h, dias);
  const opt = (v: string, t: string) => Object.assign(document.createElement('option'), { value: v, textContent: t });
  data.append(opt('', 'Escolha o dia'));
  abertas.forEach((d) => data.append(opt(d.iso, rotuloData(d.iso, d.dia))));

  const preencheHoras = () => {
    hora.replaceChildren(opt('', data.value ? 'Escolha o horário' : 'Escolha o dia antes'));
    const d = abertas.find((x) => x.iso === data.value);
    if (d) slotsDoDia(d.abre, d.fecha).forEach((s) => hora.append(opt(s, s.replace(':', 'h').replace(/h00$/, 'h'))));
    hora.disabled = !d;
  };
  preencheHoras();
  data.addEventListener('change', preencheHoras);

  const erro = (campo: HTMLElement, id: string, msg: string) => {
    const p = document.getElementById(id)!;
    p.textContent = msg;
    if (msg) campo.setAttribute('aria-invalid', 'true'); else campo.removeAttribute('aria-invalid');
    return !msg;
  };
  // Remove caracteres de controle e espaços extras; o texto é codificado com encodeURIComponent.
  const limpa = (s: string) => s.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const n = limpa(nome.value);
    const q = Number(pessoas.value);
    const okNome = erro(nome, 'e-nome', n.length < 2 ? 'Informe seu nome (mínimo 2 letras).' : '');
    const okData = erro(data, 'e-data', abertas.some((x) => x.iso === data.value) ? '' : 'Escolha um dia em que estamos abertos.');
    const d = abertas.find((x) => x.iso === data.value);
    const okHora = erro(hora, 'e-hora', d && slotsDoDia(d.abre, d.fecha).includes(hora.value) ? '' : 'Escolha um horário dentro do funcionamento.');
    const okQtd = erro(pessoas, 'e-pessoas', Number.isInteger(q) && q >= 1 && q <= max ? '' : `Informe de 1 a ${max} pessoas.`);
    if (!(okNome && okData && okHora && okQtd)) {
      (form.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus();
      return;
    }
    const msg = [
      'Olá! Quero reservar uma mesa na Artesã Forneria.',
      `Nome: ${n}`,
      `Data: ${rotuloData(d!.iso, d!.dia)}`,
      `Horário: ${hora.value}`,
      `Pessoas: ${q}`,
      '(Sei que a reserva só vale após a confirmação da casa.)',
    ].join('\n');
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
    const u = (window as unknown as { umami?: { track: (e: string) => void } }).umami;
    u?.track('submit_reserva_composer');
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  form.hidden = false;
  if (fallback) fallback.hidden = true;
}
