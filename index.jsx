import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./src/index.css";
import App from "./src/App.jsx";
import {
  CAMPAIGN_DAILY_GIFT_ID,
  CAMPAIGN_MISSION_IDS,
  CAMPAIGN_TOURNAMENT_ID,
  SMARTICO_BRAND_KEY,
  SMARTICO_PROJECT_KEY,
  SMARTICO_PUBLIC_DEMO_USER_ENABLED,
} from "./src/config/christmas.js";

const rootEl = document.getElementById("root");
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);

const setAnchorHref = (id, href) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.setAttribute("href", href);
};

const updateDeepLinks = () => {
  const tournamentId = Number.isFinite(Number(CAMPAIGN_TOURNAMENT_ID)) ? Number(CAMPAIGN_TOURNAMENT_ID) : 0;
  const dailyGiftId = Number.isFinite(Number(CAMPAIGN_DAILY_GIFT_ID)) ? Number(CAMPAIGN_DAILY_GIFT_ID) : 0;
  const missionIds = Array.isArray(CAMPAIGN_MISSION_IDS) ? CAMPAIGN_MISSION_IDS : [];

  setAnchorHref("dl-tournaments", `dp:gf_tournaments&id=${tournamentId || 0}`);
  setAnchorHref("dl-daily-gift", `dp:gf_section&id=${dailyGiftId || 0}`);
  setAnchorHref("dl-missions", `dp:gf_missions&id=${missionIds[0] || 0}`);
  setAnchorHref("dl-missions-2", `dp:gf_missions&id=${missionIds[1] || missionIds[0] || 0}`);
};

updateDeepLinks();

const loadScriptOnce = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const s = document.createElement("script");
    s.async = true;
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Falha ao carregar script: ${src}`));
    document.head.appendChild(s);
  });

const maybeInitSmartico = async () => {
  const projectKey = String(SMARTICO_PROJECT_KEY || "").trim();
  const brandKey = String(SMARTICO_BRAND_KEY || "").trim();
  if (!projectKey || !brandKey) return;

  if (window.location.hostname === "localhost") {
    window._smartico_allow_localhost = true;
  }

  if (SMARTICO_PUBLIC_DEMO_USER_ENABLED) {
    window._smartico_user_id = "public-demo";
  }

  try {
    await loadScriptOnce("https://libs.smartico.ai/smartico.js");
    const s = window._smartico;
    if (s && typeof s.init === "function") {
      s.init(projectKey, { brand_key: brandKey });
    }
  } catch (err) {
    void err;
  } finally {
    updateDeepLinks();
  }
};

maybeInitSmartico();
