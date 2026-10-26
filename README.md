# Spooky Rewards Widget

Mapa de recompensas com tema de Halloween, com missões, torneio, presente diário e uma promoção com sorteio de prêmios, feito em React e Vite.

Desenvolvido profissionalmente para a **UX Group**, empresa dona das marcas de apostas **Reals, Bingo e BetGo**. É um widget de gamificação integrado à plataforma **Smartico**. Este repositório é uma versão sem as marcas: chaves, IDs de campanha, domínios e imagens das marcas foram trocados por variáveis de ambiente e imagens genéricas.

## Funcionalidades

- **Mapa de níveis** com rolagem por arraste e botões, usando os níveis de `window._smartico.api.getLevels()`
- **Animações Lottie** (morcego, aranha e fantasma) e um personagem que aparece no mapa com mensagens e leva direto ao modal da promoção
- **Modais por nível**:
  - **Presente diário**: explica a regra e abre o presente por deep link
  - **Torneio**: escolhe o torneio pelo ID (ou pelo nome) em `getTournamentsList()` e mostra o prêmio total, as inscrições e o botão de participar
  - **Caldeirão**: missões de `getMissions()`, com prioridade para os IDs configurados e atualização pelo `onUpdate`
  - **Promoção**: banner com um carrossel infinito de prêmios e um botão para a URL da campanha
- **Deep links `dp:`** da Smartico (`gf_tournaments`, `gf_missions`, `gf_section`) em links ocultos, com os IDs preenchidos ao carregar a página
- **Funciona sem a Smartico**: sem as chaves configuradas, o layout aparece normalmente
- **Moldura de celular** no desktop, já que o layout é pensado primeiro para mobile

## Stack

- React 19
- Vite 7, com `@vitejs/plugin-react` e `@vitejs/plugin-legacy`
- Sass (SCSS)
- `@lottiefiles/react-lottie-player`
- ESLint 9

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

| Variável | Uso |
| --- | --- |
| `VITE_SMARTICO_PROJECT_KEY` / `VITE_SMARTICO_BRAND_KEY` | Quando preenchidas, carregam `libs.smartico.ai/smartico.js` e chamam `init` |
| `VITE_SMARTICO_PUBLIC_DEMO_USER` | `true` para usar o usuário `public-demo` |
| `VITE_CAMPAIGN_MISSION_IDS` | IDs das missões, separados por vírgula |
| `VITE_CAMPAIGN_TOURNAMENT_ID` / `VITE_CAMPAIGN_TOURNAMENT_NAME` | Torneio da campanha |
| `VITE_CAMPAIGN_DAILY_GIFT_ID` / `VITE_CAMPAIGN_DAILY_GIFT_ACTION` | Presente diário |
| `VITE_CAMPAIGN_PLAY_URL` | Destino do botão "Jogue e Concorra" |

Build de produção e lint:

```bash
npm run build
npm run lint
```

## Estrutura

```
index.jsx               ponto de entrada: renderização, carregamento da Smartico e deep links
src/config/             leitura das variáveis da campanha
src/widget-pass/        mapa de níveis, modais, animações e estilos
src/widget-mission/     lista e carrossel de missões
src/widget-tourments/   lista de torneios
public/img/             ilustrações do mapa e ícones
```
