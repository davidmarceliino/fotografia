# DESIGN — Atlas de Luz

## Conceito

Placa de observatório: placa de latão gravada sobre noite. O mapa do ABC vira
constelação dos bairros de atendimento. Tom autoral, quieto, tátil — sem
clichê de fotógrafo (nada de gradiente roxo, cards iguais ou glassmorphism).

## Tokens (`:root`)

Cores: `--noite:#0d0b09`, `--noite-2:#14110d`, `--osso:#ece2d0`,
`--texto-fraco:#8a7c68` (AA sobre noite; corrige o antigo #6f6353 ≈3.4:1),
`--lata:#c29a5c`, `--cobre:#c9713f`, `--linha:rgba(194,154,92,.22)`.
Espaço base 8px (`--e1..--e8` = 8→128). Raio 2px (placas), 0 (imagens).
Foco: outline 2px `--lata` + offset.

## Tipografia

- Display: Big Shoulders Display 500/700 — títulos, uppercase, tabular-nums.
- Texto: IBM Plex Sans 400/500 — corpo 1rem/1.6, medida máx 66ch.
- Detalhe: IM Fell English itálico — legendas, epígrafes, estrela-id.
- Escala fluida com clamp() (h2 ≈ clamp(2rem,5vw,3.5rem)).

## Layout

Conteúdo máx 1200px, gutter 24px (32px ≥1440). Seções com padding --e6/--e8.
Assimetrias: placa hero, atlas full-bleed, cartas editoriais. Respiro
generoso — o vazio é parte do desenho.

## Componentes

- `.placa` — hero: nome display + subtítulo IM Fell + 2 CTAs.
- `.faixa` — marquee de cidades (pausa em hover/focus; off em reduced-motion).
- `.estrela` — card-mapa SVG inline; hover/fixo brilha e destaca `data-cat`.
- `.filtro` — chips com `aria-pressed`; ativo preenchido em lata.
- `.mini` — linhas de preço com thumb (compartham a lupa com o atlas).
- `.carta` — depoimento em placa, aspas em IM Fell.
- `#reticulo` — grade SVG fixa atrás do conteúdo (pointer-events:none).

## Movimento

Só `transform`/`opacity`. Reveal por seção via `[data-reveal]` (IntersectionObserver).
Marquee CSS. Contador do hero (JS, dispara 1×). Tudo sob `prefers-reduced-motion`.

## Acessibilidade (AA)

Contraste verificado por cálculo; foco visível em todo interativo; skip link;
alvos ≥44px; `aria-pressed` nos filtros; dialog com focus-trap e Esc;
form com label + `aria-live` no status; alt descritivo nas imagens.

## Imagens

`srcset`+`sizes` no hero, `loading="lazy"` + `decoding="async"` nas demais,
width/height para evitar layout shift. Estrelas sem foto usam placeholder
CSS (não quebra). Fallback: onerror → esconde img e mostra placa de texto.
