# Relatório — evolução da versão 2

## Alterações
- **Identidade:** paleta editorial (marrom #29231E, creme #F2EBDD, terracota #873E30, oliva, cinza quente) + ouro #D6A667 só como destaque sobre marrom; Cormorant Garamond (títulos) e Inter (textos), auto-hospedadas. Terracota fica perto do tijolo do logo; o disco do logo foi mantido.
- **Header** transparente sobre o hero, sólido e com blur ao rolar; menu mobile (details) que fecha ao escolher item/Esc.
- **Home** com as 7 seções do spec: Hero (foto real da pizza), Essência, Processo (3 etapas com foto), Cardápio, Experiência (galeria com scroll-snap no celular), Avaliações, Localização + Reservas.
- **Reservas via WhatsApp:** nome, data (só dias abertos, 60 dias), horário (dentro do funcionamento), pessoas (1–20) e observações; validação com `aria`, mensagem no formato do spec, feedback visual e link de fallback se o navegador bloquear o pop-up.
- **Barra fixa no celular** com Cardápio e Reservar (respeita safe-area). Ligar/Rota ficam na seção de localização.
- **Analytics GA4** pronto e desligado (sem `PUBLIC_GA_ID`): `click_menu`, `click_reservation`, `whatsapp_click`, `maps_click`, `form_start`, `form_submit`. Consentimento negado por padrão. Umami removido.
- **Removidos:** relógio de fermentação e faixa de status fixa (o "Aberto agora" agora é uma pílula no hero e na seção de horários).

## Componentes
Criados: `Hero`, `StorySection`, `ProcessSection`, `MenuSection`, `ProductCard`, `ExperienceGallery`, `TestimonialsSection`, `LocationSection`, `MobileMenu`, `src/scripts/track.ts`, `public/ga-init.js`, `src/content/avaliacoes.json`.
Renomeados/refeitos: `Topo→Header`, `BarraAcoes→FloatingMobileCTA`, `Rodape→Footer`, `Composer→ReservationForm`, `MapaEmbed→MapEmbed`. Páginas `cardapio`, `nossa-casa`, `contato`, `404`, privacidade ajustadas. Removidos: `Relogio`, `relogio.ts`.

## Testes (build de produção local, servidor com os headers do vercel.json)
- axe WCAG 2.1 AA a 360 e 1440 px nas 6 páginas: 0 violações (após focar a galeria rolável). Sem scroll horizontal. Console sem erros/CSP.
- Lighthouse mobile: Home 98–99 em desempenho (LCP 2,2 s simulado; meta era 2,0), demais páginas 100, acessibilidade/SEO 100, boas práticas 100 (nossa-casa 96 por "imagem de baixa resolução": letreiro/adega têm ~220–310 px de origem).
- Ponta a ponta com Playwright: menu mobile, header ao rolar, formulário (erros, mensagem, eventos, feedback), status aberto/fechado em 3 horários, barra fixa só no celular.
- `npm run lint` e `npm test` passam.
- Não testado aqui (sem acesso ao Google): iframe real do Maps; redirects da Vercel.

## Depende do cliente
1. **Texto do hero/essência/processo** ("ingredientes selecionados", "fermentação cuidadosa", tempo de descanso) foi usado como veio no spec; validar com a casa.
2. **URL da loja no Yooga:** hoje `https://delivery.yooga.app` (raiz, não da loja). Botão "Explorar cardápio completo" abre ali.
3. **Cardápio:** 4–6 pizzas com foto, nome, ingredientes e preço. Só há 2 fotos reais de pizza, então a seção mostra 2 cards com legenda do que se vê (sem nome/preço). Preencher `cardapio.json` (`destaque: true`).
4. **Avaliações reais** (nome público, nota, texto, fonte, data) em `avaliacoes.json`. Por ora só o link para o Google.
5. **Fotos pendentes:** forno em operação, preparo da massa/fermentação, ingredientes frescos, mesas e decoração, pizzas individuais. A etapa "O tempo da fermentação" usa a borda da pizza e "A seleção dos ingredientes" usa uma mesa de degustação (recortada sem embalagens de marca).
6. **GA4:** ID real e decisão sobre banner de consentimento.
7. Autorização de imagem (todos os rostos continuam recortados), horários/feriados, razão social/CNPJ, domínio/DNS.
