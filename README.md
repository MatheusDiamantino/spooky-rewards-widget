# Spooky Rewards Widget

Widget mobile-first em React/Vite com integração opcional com Smartico. O app renderiza normalmente mesmo sem Smartico configurado; quando configurado, carrega o SDK e habilita deep links `dp:` para abrir seções (torneios, missões, daily gift).

## Rodar localmente

```bash
npm install
npm run dev
```

## Build/Lint

```bash
npm run lint
npm run build
```

## Variáveis de ambiente

Copie o arquivo de exemplo e preencha as variáveis:

```bash
copy .env.example .env
```

- `VITE_SMARTICO_PROJECT_KEY` e `VITE_SMARTICO_BRAND_KEY`: quando definidos, o app carrega `https://libs.smartico.ai/smartico.js` e executa `init`.
- `VITE_SMARTICO_PUBLIC_DEMO_USER`: `true|false` (ou `1|0`). Quando habilitado, define `window._smartico_user_id = "public-demo"` antes do `init`.
- `VITE_CAMPAIGN_MISSION_IDS`: lista separada por vírgula (ex.: `35083,35093`).
- `VITE_CAMPAIGN_TOURNAMENT_ID`: id numérico do torneio.
- `VITE_CAMPAIGN_TOURNAMENT_NAME`: nome opcional para fallback/lookup.
- `VITE_CAMPAIGN_DAILY_GIFT_ID`: id numérico do daily gift.
- `VITE_CAMPAIGN_DAILY_GIFT_ACTION`: action string (default `daily_gift`).

## Deep links

O `index.html` mantém anchors ocultos com `href` “neutro” (`id=0`). Em runtime o `index.jsx` atualiza esses anchors com os IDs vindos do `.env`:

- `#dl-tournaments` → `dp:gf_tournaments&id=...`
- `#dl-missions` / `#dl-missions-2` → `dp:gf_missions&id=...`
- `#dl-daily-gift` → `dp:gf_section&id=...`

## Estrutura

- `index.jsx`: bootstrapping (render do React + loader do Smartico + atualização dos deep links)
- `src/config/christmas.js`: leitura de env e configuração da campanha
- `src/widget-pass/`: layout principal do widget
- `src/widget-mission/` e `src/widget-tourments/`: widgets de missões e torneios
