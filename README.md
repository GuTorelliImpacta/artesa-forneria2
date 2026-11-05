# Artesã Forneria — site institucional

Site estático (Astro + Tailwind CSS v4, TypeScript). Quase sem JavaScript (~4 KB gzip). Direção editorial: Cormorant Garamond + Inter, marrom/creme/terracota.

## Comandos
```
npm install
npm run dev        # desenvolvimento
npm run build      # gera dist/
npm run lint       # astro check + validações (contraste, metadados, dados, CSP)
npm test           # testes da lógica de horários
python3 -I scripts/preparar-imagens.py   # refaz recortes/favicons a partir de assets-cliente/
```

## Como editar (sem mexer em componentes)
Tudo fica em `src/content/`:
- **`horarios.json`** — `semana` (dia 0 = domingo; `abre`/`fecha` em "HH:MM", `null` = fechado) e `excecoes` para feriados: `{ "data": "2026-12-25", "fechado": true }` ou com `abre`/`fecha` próprios. O "Aberto agora", o composer de reserva, as tabelas e o JSON-LD leem daqui.
- **`cardapio.json`** — preencha `categorias` com `{ "nome", "itens": [{ "nome", "ingredientes": [], "preco": 59.9, "tags": [], "destaque": true }] }`. Vazio = página mostra "Cardápio completo no delivery".
- **`config.json`** — endereço, telefone, WhatsApp, e-mail, Instagram. Campos a preencher quando o dono confirmar: `delivery.yoogaUrl` (hoje a raiz `delivery.yooga.app`; trocar pela URL da loja), `mapa.embedUrl` / `mapa.coordenadas`, `razaoSocial`, `cnpj`, `confirmado.fermentacao72h` (troca o H1 para "Pizza de 72 horas…" e liga o relógio 0–72 h), `reservas.mostrarComposer`.
- **`faq.json`** — só perguntas com `publicado: true` e resposta aparecem (e entram no JSON-LD FAQPage).

## Analytics
Google Analytics 4. Defina `PUBLIC_GA_ID` (formato `G-XXXXXXXXXX`, fornecido pela empresa) no painel da Vercel; vazio = nada é carregado. O consentimento começa negado (`public/ga-init.js`). Eventos: `click_menu`, `click_reservation`, `whatsapp_click`, `maps_click`, `form_start`, `form_submit` (+ `click_call`, `view_cardapio`). Links ganham o evento pelo destino; use `data-evt="..."` para forçar.

## Deploy (Vercel)
`vercel.json` já traz headers de segurança (CSP, HSTS…), redirects 301 das URLs antigas do WordPress e cache. Saída: `dist/`. Nenhum CSS/JS inline: a CSP não usa `unsafe-inline`.

## Pastas
`assets-cliente/` originais (fora do build) · `src/assets/` recortes otimizados · `public/` favicon, OG, fontes.

## Componentes
`Header`, `MobileMenu`, `Hero`, `StorySection`, `ProcessSection`, `MenuSection`, `ProductCard`, `ExperienceGallery`, `TestimonialsSection`, `LocationSection`, `ReservationForm`, `FloatingMobileCTA`, `Footer` (+ `MapEmbed`, `Horarios`, `Faq`, `Foto`, `Seo`). Avaliações reais: `src/content/avaliacoes.json`.
