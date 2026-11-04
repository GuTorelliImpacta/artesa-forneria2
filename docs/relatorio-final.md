# Relatório final

## Feito
Home, Cardápio, Nossa casa, Contato, Privacidade e 404; dados em JSON; status "Aberto agora" (fuso America/Sao_Paulo, exceções); composer de reserva sem backend; relógio de fermentação no scroll; mapa Google incorporado; JSON-LD, sitemap, robots, OG; headers e redirects 301 em `vercel.json`.

## QA (local, build de produção)
- Lighthouse mobile (/, /cardapio/, /contato/, /nossa-casa/): 99–100 nas 4 categorias; LCP 1,8 s na Home (0,8–1,5 s nas demais), CLS ≈ 0, TBT ≈ 0.
- axe (WCAG 2.1 AA) a 360 e 1440 px nas 6 páginas: 0 violações. Sem scroll horizontal a 360 px. Sem erro de CSP no console.
- JS total ≈ 4 KB gzip. `npm run lint` e `npm test` passam.
- Ciclo de correção: contraste das linhas "hoje" e dos passos esmaecidos (axe) corrigido; preload da imagem do hero (LCP 2,0 → 1,8 s).
- Não testado aqui (sem rede para Google): carregamento real do iframe do Maps e redirects da Vercel (só após deploy).

## [CONFIRMAR] em aberto (nada disso entra como fato)
1. 72 h, forno a lenha, massas frescas, seleção de vinhos, pequenos produtores. O site só diz "fermentação longa" e "feita à mão" (texto do spec). Flags em `config.json > confirmado`.
2. Cardápio completo (sabores, preços, bebidas). Enquanto vazio, a página oferece WhatsApp.
3. Se aceita reserva e política (tolerância, grupo máx., rolha). O composer está ligado; desligue em `reservas.mostrarComposer` se não aceitar. `acceptsReservations` fora do JSON-LD.
4. Horários oficiais e feriados (usei os do Google Maps).
5. URL da loja no Yooga (botão "Pedir delivery" oculto até lá).
6. Código de incorporação do Maps / coordenadas / avaliações reais (nenhuma exibida).
7. História real, pizzaiolo, razão social e CNPJ (privacidade avisa que serão informados).
8. Autorização de imagem. Todos os rostos foram recortados fora; `mesa-molhos.jpg` (marcas de terceiros) não é usada.
9. Originais das fotos (≥ 2000 px). Hoje ~1200 px: hero em medalhão ≤ 440 px.
10. Domínio/DNS, Facebook e TikTok (não linkados; só Instagram).

## Fotos pendentes
Fachada, salão vazio, 4–6 pizzas em close, forno em operação, mãos abrindo a massa, vinhos, sobremesa, letreiro, logo em SVG/PNG transparente (cores do logo foram amostradas de um JPEG de 894 px).

## Para o dono
- Perfil da Empresa no Google: categorias "Pizzaria" e "Restaurante italiano", horários com domingo/feriados, site com `?utm_source=google&utm_medium=organic&utm_campaign=perfil`, cardápio → `/cardapio/`, reserva → WhatsApp, corrigir "Irmaos" para "Irmãos", fotos semanais, responder avaliações.
- DNS (Registro.br) apontando para a Vercel; manter os redirects até o Google reindexar.
- Instagram: colocar o link do site na bio.
