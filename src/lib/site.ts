import config from '../content/config.json';
import horarios from '../content/horarios.json';
import cardapio from '../content/cardapio.json';
import faq from '../content/faq.json';
import avaliacoes from '../content/avaliacoes.json';
import { fmtHora, type Horarios } from './horarios';

export { config, horarios, cardapio, faq, avaliacoes };
export const H = horarios as Horarios;

const e = config.endereco;
export const enderecoLinha1 = e.rua;
export const enderecoLinha2 = `${e.bairro}, ${e.cidade} - ${e.uf}, ${e.cep}`;
export const enderecoCompleto = `${e.rua} - ${e.bairro}, ${e.cidade} - ${e.uf}, ${e.cep}`;

export const waLink = (texto: string = config.mensagemWhatsapp) =>
  `https://wa.me/${config.whatsapp.numero}?text=${encodeURIComponent(texto)}`;
export const telLink = `tel:${config.telefone.e164}`;
export const rotaLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(enderecoCompleto.replace('Irmãos', 'Irmaos'))}`;
export const mapaAbrirLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto.replace('Irmãos', 'Irmaos'))}`;
export const avaliacoesLink = config.avaliacoesUrl;
export const mapaEmbed =
  config.mapa.embedUrl ??
  'https://www.google.com/maps?q=' + encodeURIComponent('R. Padre Charton, 109 - Vila Irmaos Arnoni, São Paulo - SP, 02375-070') + '&output=embed';
export const deliveryUrl: string | null = config.delivery.yoogaUrl;
export const temCardapio = (cardapio.categorias as unknown[]).length > 0;
export const faqPublicado = faq.perguntas.filter((p) => p.publicado && p.resposta);

export const SITE = config.url;
export const abs = (p: string) => new URL(p, SITE).toString();

/** Linhas agrupadas de horário para exibição (qui, sex e sáb, dom). */
export function linhasHorario() {
  const s = (d: number) => H.semana.find((x) => x.dia === d)!;
  const f = (d: number) => `${fmtHora(s(d).abre!)} às ${fmtHora(s(d).fecha!)}`;
  return [
    { dias: 'Quinta', horario: f(4) },
    { dias: 'Sexta e sábado', horario: f(5) },
    { dias: 'Domingo', horario: f(0) },
    { dias: 'Segunda a quarta', horario: 'Fechado' },
  ];
}
