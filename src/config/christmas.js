const env = import.meta.env;

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toNumberList = (v) => {
  if (!v) return [];
  const raw = Array.isArray(v) ? v.join(",") : String(v);
  return raw
    .split(",")
    .map((s) => toNumber(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
};

export const SMARTICO_PROJECT_KEY = String(env.VITE_SMARTICO_PROJECT_KEY || "").trim();
export const SMARTICO_BRAND_KEY = String(env.VITE_SMARTICO_BRAND_KEY || "").trim();

export const SMARTICO_PUBLIC_DEMO_USER_ENABLED =
  String(env.VITE_SMARTICO_PUBLIC_DEMO_USER || "").trim() === "1" ||
  String(env.VITE_SMARTICO_PUBLIC_DEMO_USER || "").trim().toLowerCase() === "true";

export const CAMPAIGN_MISSION_IDS = toNumberList(env.VITE_CAMPAIGN_MISSION_IDS);
export const CAMPAIGN_TOURNAMENT_ID = toNumber(env.VITE_CAMPAIGN_TOURNAMENT_ID);
export const CAMPAIGN_TOURNAMENT_NAME = String(env.VITE_CAMPAIGN_TOURNAMENT_NAME || "").trim();
export const CAMPAIGN_DAILY_GIFT_ID = toNumber(env.VITE_CAMPAIGN_DAILY_GIFT_ID);
export const CAMPAIGN_DAILY_GIFT_ACTION = String(env.VITE_CAMPAIGN_DAILY_GIFT_ACTION || "daily_gift").trim();

export const CAMPAIGN_PLAY_URL = String(env.VITE_CAMPAIGN_PLAY_URL || "/").trim();
