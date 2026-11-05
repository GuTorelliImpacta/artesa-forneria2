import { datasAbertas, slotsDoDia, rotuloData, type Horarios } from '../lib/horarios';
import { track } from './track';

export function iniciaReserva(h: Horarios) {
  document.querySelectorAll<HTMLElement>('[data-reserva]').forEach((r) => monta(r, h));
}

function monta(raiz: HTMLElement, h: Horarios) {
  const form = raiz.querySelector<HTMLFormElement>('[data-reserva-form]')!;
  const fallback = raiz.querySelector<HTMLElement>('[data-reserva-fallback]');
  const feedback = raiz.querySelector<HTMLElement>('[data-reserva-feedback]')!;
  const max = Number(raiz.dataset.max || 20);
  const dias = Number(raiz.dataset.dias || 60);
  const numero = (raiz.dataset.wa || '').replace(/\D/g, '');
  const nome = form.elements.namedItem('nome') as HTMLInputElement;
  const data = form.elements.namedItem('data') as HTMLSelectElement;
  const hora = form.elements.namedItem('hora') as HTMLSelectElement;
  const pessoas = form.elements.namedItem('pessoas') as HTMLInputElement;
  const obs = form.elements.namedItem('obs') as HTMLTextAreaElement;
  const btn = form.querySelector<HTMLElement>('[data-reserva-btn]')!;

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

  // Mensura o início do preenchimento uma única vez.
  form.addEventListener('focusin', () => track('form_start'), { once: true });

  const erro = (campo: HTMLElement, id: string, msg: string) => {
    document.getElementById(id)!.textContent = msg;
    if (msg) campo.setAttribute('aria-invalid', 'true'); else campo.removeAttribute('aria-invalid');
    return !msg;
  };
  // Remove controles e espaços extras (mantém quebras de linha nas observações); o texto vai por encodeURIComponent.
  const limpa = (s: string, n: number) => s.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ').replace(/[ \t]+/g, ' ').trim().slice(0, n);
  // Ao corrigir um campo, o erro some.
  [nome, data, hora, pessoas].forEach((c) => c.addEventListener('input', () => c.removeAttribute('aria-invalid')));

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    feedback.hidden = true;
    const n = limpa(nome.value, 60);
    const q = Number(pessoas.value);
    const d = abertas.find((x) => x.iso === data.value);
    const okNome = erro(nome, 'e-nome', n.length < 2 ? 'Informe seu nome (mínimo 2 letras).' : '');
    const okData = erro(data, 'e-data', d ? '' : 'Escolha um dia em que estamos abertos.');
    const okHora = erro(hora, 'e-hora', d && slotsDoDia(d.abre, d.fecha).includes(hora.value) ? '' : 'Escolha um horário dentro do funcionamento.');
    const okQtd = erro(pessoas, 'e-pessoas', Number.isInteger(q) && q >= 1 && q <= max ? '' : `Informe de 1 a ${max} pessoas.`);
    const o = limpa(obs.value, 200);
    const okObs = erro(obs, 'e-obs', obs.value.length > 200 ? 'Use até 200 caracteres.' : '');
    if (!(okNome && okData && okHora && okQtd && okObs)) {
      (form.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus();
      return;
    }
    const msg = [
      'Olá! Gostaria de fazer uma reserva na Artesã Forneria.',
      '',
      `Nome: ${n}`,
      `Data: ${rotuloData(d!.iso, d!.dia)}`,
      `Horário: ${hora.value}`,
      `Quantidade de pessoas: ${q}`,
      `Observações: ${o || 'Nenhuma'}`,
    ].join('\n');
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
    track('form_submit', { pessoas: q });
    track('click_reservation', { origem: 'formulario' });
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    // Feedback visual; se o navegador bloqueou a janela, o link manual resolve.
    feedback.replaceChildren();
    const t = document.createElement('p');
    t.append(w ? 'Pronto! Abrimos o WhatsApp com a sua mensagem. Basta enviar. ' : 'Quase lá! Toque no link para abrir o WhatsApp com a sua mensagem. ');
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.textContent = 'Abrir WhatsApp novamente';
    t.append(a);
    feedback.append(t);
    feedback.hidden = false;
    btn.textContent = 'Enviar novamente';
  });

  form.hidden = false;
  if (fallback) fallback.hidden = true;
}
