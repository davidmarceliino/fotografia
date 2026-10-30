# PRODUTO — Atlas de Luz

## O que é

Landing page única (HTML/CSS/JS puro, sem framework) de um fotógrafo autoral que atende
4 cidades do ABC paulista (São Bernardo, Santo André, São Caetano, Diadema). É cartão de
portfólio + orçamento: quem chega precisa entender a proposta em 10s, ver trabalhos e
pedir orçamento pelo WhatsApp/formulário.

## Objetivo da página

1. transmitir identidade autoral (não template genérico);
2. levar ao contato (WhatsApp com mensagem pronta + formulário → mailto);
3. ranquear localmente (SEO local: title/description por cidade, JSON-LD).

## Público

Busca "fotógrafo em São Bernardo do Campo" e compara 3–5 sites em 1 minuto. Valoriza
prova visual (galeria), clareza de preço (tabela) e proximidade (atende a cidade dele).

## Seções (contrato de IDs/classes — não renomear)

carregador `#carregador` · barra fixa `#trilhoBarra/#estadoLuz/#cidade` · placa `#inicio`
· faixa marquee `.faixa` · manifesto `#manifesto` · atlas `#atlas` (12 `.estrela`,
filtros `.filtro[data-cat]`, `mapa.dataset.cat`, `#placaDados`, `.lupa` dialog) ·
método `#processo` · tarifas `#tarifas` (mini `#mini`, `data-thumb`) · cartas `#cartas`
· colofão `#colofao` (`#formulario`, `#status`) · retículo `#mirax/#miray/#miradot`.

## Dados

Contato é placeholder (`ola@seudominio.com.br`, `wa.me/5511900000000`, "FULANO DE TAL")
— não inventar substitutos reais. Preços e depoimentos são do conteúdo existente.

## Restrições

Redesign sobre código existente: preservar conteúdo, `img/`, `srcset` e o contrato de
seletores usado pelo `js/atlas.js`. Sem framework, sem build. Trabalhar em blocos
pequenos de saída (já houve 3 cortes por limite de tokens).
