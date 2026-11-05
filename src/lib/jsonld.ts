import { config, H, abs, faqPublicado, deliveryUrl } from './site';

const DIA_SCHEMA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function restaurante() {
  // Agrupa dias com o mesmo horário para manter o JSON-LD enxuto.
  const grupos = new Map<string, string[]>();
  for (const d of H.semana) {
    if (!d.abre || !d.fecha) continue;
    const k = `${d.abre}|${d.fecha}`;
    grupos.set(k, [...(grupos.get(k) ?? []), DIA_SCHEMA[d.dia]]);
  }
  const e = config.endereco;
  const obj: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': abs('/#restaurante'),
    name: config.nome,
    url: abs('/'),
    image: [abs('/og.jpg')],
    logo: abs('/icon-512.png'),
    telephone: config.telefone.e164,
    email: config.email,
    servesCuisine: ['Pizza', 'Italiana'],
    hasMenu: abs('/cardapio/'),
    address: {
      '@type': 'PostalAddress',
      streetAddress: e.rua,
      addressLocality: e.cidade,
      addressRegion: e.uf,
      postalCode: e.cep,
      addressCountry: 'BR',
    },
    openingHoursSpecification: [...grupos].map(([k, dias]) => {
      const [opens, closes] = k.split('|');
      return { '@type': 'OpeningHoursSpecification', dayOfWeek: dias, opens, closes };
    }),
    sameAs: [config.instagram.url],
  };
  if (config.mapa.coordenadas) {
    const c = config.mapa.coordenadas as { lat: number; lng: number };
    obj.geo = { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng };
  }
  if (config.reservas.aceitaReservaConfirmado) obj.acceptsReservations = true;
  if (deliveryUrl) obj.potentialAction = { '@type': 'OrderAction', target: deliveryUrl };
  return obj;
}

export function faqPage() {
  if (faqPublicado.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqPublicado.map((p) => ({
      '@type': 'Question',
      name: p.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: p.resposta },
    })),
  };
}
