// Lógica pura de horários: usada no build (HTML estático, JSON-LD) e no navegador (status "aberto agora").
export interface Dia { dia: number; nome: string; abre: string | null; fecha: string | null }
export interface Excecao { data: string; fechado?: boolean; abre?: string; fecha?: string; nota?: string }
export interface Horarios { fuso: string; semana: Dia[]; excecoes: Excecao[] }
export interface Status {
  aberto: boolean;
  texto: string;       // curto, para a faixa
  detalhe: string;     // frase completa
}

const DIAS_CURTOS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const DIAS_ABREV = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
/** "18:00" -> "18h"; "23:30" -> "23h30" */
export const fmtHora = (hhmm: string): string => {
  const [h, m] = hhmm.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
};

/** Data/hora atual no fuso informado, sem depender do fuso do aparelho. */
export function agoraNoFuso(fuso: string, d: Date = new Date()) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)!.value;
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday'));
  return {
    iso: `${g('year')}-${g('month')}-${g('day')}`,
    dia,
    min: Number(g('hour')) * 60 + Number(g('minute')),
  };
}

/** Soma dias a uma data ISO (aritmética em UTC, sem horário de verão envolvido). */
export function somaDias(iso: string, n: number): { iso: string; dia: number } {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return { iso: dt.toISOString().slice(0, 10), dia: dt.getUTCDay() };
}

/** Intervalo de funcionamento de uma data (considera exceções). */
export function intervaloDoDia(h: Horarios, iso: string, dia: number): { abre: string; fecha: string; nota?: string } | null {
  const ex = h.excecoes.find((e) => e.data === iso);
  if (ex) {
    if (ex.fechado || !ex.abre || !ex.fecha) return null;
    return { abre: ex.abre, fecha: ex.fecha, nota: ex.nota };
  }
  const s = h.semana.find((x) => x.dia === dia);
  if (!s || !s.abre || !s.fecha) return null;
  return { abre: s.abre, fecha: s.fecha };
}

export function statusAgora(h: Horarios, agora = agoraNoFuso(h.fuso)): Status {
  const hoje = intervaloDoDia(h, agora.iso, agora.dia);
  if (hoje && agora.min >= toMin(hoje.abre) && agora.min < toMin(hoje.fecha)) {
    return {
      aberto: true,
      texto: `Aberto agora · fecha às ${fmtHora(hoje.fecha)}`,
      detalhe: `Aberto agora. Fechamos hoje às ${fmtHora(hoje.fecha)}.`,
    };
  }
  // próxima abertura nos próximos 14 dias
  for (let i = 0; i <= 14; i++) {
    const alvo = i === 0 ? { iso: agora.iso, dia: agora.dia } : somaDias(agora.iso, i);
    const it = intervaloDoDia(h, alvo.iso, alvo.dia);
    if (!it) continue;
    if (i === 0 && agora.min >= toMin(it.abre)) continue; // já passou (fechou hoje)
    const quando = i === 0 ? 'hoje' : i === 1 ? 'amanhã' : DIAS_CURTOS[alvo.dia];
    const t = `${quando} às ${fmtHora(it.abre)}`;
    return { aberto: false, texto: `Fechado agora · abre ${t}`, detalhe: `Fechado agora. Abrimos ${t}.` };
  }
  return { aberto: false, texto: 'Fechado agora', detalhe: 'Fechado agora.' };
}

/** Datas abertas nos próximos `dias` dias (inclui hoje se ainda der tempo). */
export function datasAbertas(h: Horarios, dias: number, agora = agoraNoFuso(h.fuso)) {
  const out: { iso: string; dia: number; abre: string; fecha: string }[] = [];
  for (let i = 0; i <= dias; i++) {
    const alvo = i === 0 ? { iso: agora.iso, dia: agora.dia } : somaDias(agora.iso, i);
    const it = intervaloDoDia(h, alvo.iso, alvo.dia);
    if (!it) continue;
    if (i === 0 && agora.min >= toMin(it.fecha) - 30) continue;
    out.push({ iso: alvo.iso, dia: alvo.dia, abre: it.abre, fecha: it.fecha });
  }
  return out;
}

/** Horários de 30 em 30 min, do abre até 30 min antes de fechar. */
export function slotsDoDia(abre: string, fecha: string): string[] {
  const out: string[] = [];
  for (let m = toMin(abre); m <= toMin(fecha) - 30; m += 30) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return out;
}

export const rotuloData = (iso: string, dia: number): string => {
  const [, m, d] = iso.split('-');
  return `${DIAS_ABREV[dia]} ${d}/${m}`;
};

/** Agrupa dias consecutivos com o mesmo horário, na ordem qui, sex, sáb, dom: para exibição compacta. */
export function resumoSemana(h: Horarios): { rotulo: string; horario: string }[] {
  const ordem = [1, 2, 3, 4, 5, 6, 0];
  return ordem.map((d) => {
    const s = h.semana.find((x) => x.dia === d)!;
    return { rotulo: s.nome, horario: s.abre && s.fecha ? `${fmtHora(s.abre)} às ${fmtHora(s.fecha)}` : 'Fechado' };
  });
}
