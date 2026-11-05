// Eventos de conversão (GA4 via gtag, quando PUBLIC_GA_ID existir). Sem ID, não faz nada.
type Gtag = (cmd: 'event', name: string, params?: Record<string, unknown>) => void;
export function track(nome: string, params: Record<string, unknown> = {}) {
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  g?.('event', nome, { page_path: location.pathname, ...params });
}

/** Deriva o evento pelo destino do link; [data-evt] tem prioridade. */
export function iniciaCliques() {
  document.addEventListener('click', (ev) => {
    const a = (ev.target as Element).closest('a');
    if (!a) return;
    const explicito = a.dataset.evt;
    const href = a.getAttribute('href') || '';
    let nome = explicito;
    if (!nome) {
      if (href.includes('wa.me')) nome = 'whatsapp_click';
      else if (/google\.[^/]+\/maps/.test(href)) nome = 'maps_click';
      else if (href.startsWith('tel:')) nome = 'click_call';
    }
    if (nome) track(nome, { link: href.slice(0, 120) });
    // links do WhatsApp também contam como clique em reservar quando a intenção é reserva
    if (!explicito && href.includes('wa.me') && /reserv/i.test(decodeURIComponent(href))) track('click_reservation', { link: 'whatsapp' });
  });
}
