# Artesã Forneria — site institucional

Site estático (Astro + Tailwind CSS v4, TypeScript). Quase sem JavaScript (~4 KB gzip). Spec original: ver o documento de implementação do projeto.

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
- **`config.json`** — endereço, telefone, WhatsApp, e-mail, Instagram. Campos a preencher quando o dono confirmar: `delivery.yoogaUrl`, `mapa.embedUrl` / `mapa.coordenadas`, `razaoSocial`, `cnpj`, `confirmado.fermentacao72h` (troca o H1 para "Pizza de 72 horas…" e liga o relógio 0–72 h), `reservas.mostrarComposer`.
- **`faq.json`** — só perguntas com `publicado: true` e resposta aparecem (e entram no JSON-LD FAQPage).

## Analytics
Umami (sem cookies). Defina `PUBLIC_UMAMI_ID` (ver `.env.example`) no painel do Vercel. Vazio = desligado. Eventos: `click_whatsapp`, `click_call`, `click_route`, `click_delivery`, `view_cardapio`, `submit_reserva_composer`.

## Deploy (Vercel)
`vercel.json` já traz headers de segurança (CSP, HSTS…), redirects 301 das URLs antigas do WordPress e cache. Saída: `dist/`. Nenhum CSS/JS inline: a CSP não usa `unsafe-inline`.

## Pastas
`assets-cliente/` originais (fora do build) · `src/assets/` recortes otimizados · `public/` favicon, OG, fontes.
