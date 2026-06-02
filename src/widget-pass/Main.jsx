import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./styles.scss";
import { Player } from "@lottiefiles/react-lottie-player";
import FishBoatBlue from "./animations/Halloween Bat Floating.json";
import FishBoatOrange from "./animations/Halloween Spider.json";
import OneFish from "./animations/Halloween Spooky Ghost Floating.json";
import GhostAnimation from "./animations/Ghost Green.json";
import Missions from "../widget-mission/main.jsx";
import {
  CAMPAIGN_DAILY_GIFT_ID,
  CAMPAIGN_MISSION_IDS,
  CAMPAIGN_TOURNAMENT_ID,
  CAMPAIGN_TOURNAMENT_NAME,
} from "../config/christmas.js";
// IDs centralizados (importados do config)
const MISSION_IDS = CAMPAIGN_MISSION_IDS;
import Mickey from "./animations/Mickey.json";
import DisneyHostar from "./animations/Disney Logo.json";

// Desativa todas as animações temporariamente
const DISABLE_ANIMATIONS = false;

const SCROLL_OFFSET = 200;

const fishPositions = [
  { top: "317PX", left: "-1px", transform: "rotateY(180deg)" },
];

const animations = [
  {
    key: "FishBoatBlue",
    src: FishBoatBlue,
    style: { bottom: "140px", left: "26px", pointerEvents: "none" },
  },
  {
    key: "FishBoatOrange",
    src: FishBoatOrange,
    style: { bottom: "90%", right: "112px", transform: "rotateY(180deg)" },
  },
  // { key: "OneFish", src: OneFish, style: fishPositions[0] },
];

const getRandomPosition = () => {
  const randomIndex = Math.floor(Math.random() * fishPositions.length);
  return fishPositions[randomIndex];
};

// Helper para resolver a imagem da ilha por nível/índice
const getLevelImageUrl = (level, disabled, index) => {
  if (!level) return "";
  // Conjunto de imagens ativas disponíveis (inclui as que faltavam)
  const activeImages = [
    "https://casa.example.com/CRM/Widgets+CRM/Halloween+Map/img/presentesdiarios3.0.webp",
    "https://casa.example.com/CRM/Widgets+CRM/Halloween+Map/img/torneio.webp",
    "https://casa.example.com/CRM/Widgets+CRM/Halloween+Map/img/caldeirao3.0+(2).webp",
    "https://casa.example.com/CRM/Widgets+CRM/Halloween+Map/img/teste8.webp",
  ];
  const i = Number.isFinite(index) ? index % activeImages.length : 0;
  const activeUrl = activeImages[i];
  return activeUrl;
};

const LevelMap = () => {
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState([]);
  const levelContainerRef = useRef(null);
  const [showCard, setShowCard] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(null);
  const animationRef = useRef(null);
  const [fishPosition, setFishPosition] = useState(fishPositions[0]);
  // Mickey easter egg + Hostar overlay
  const [mickeyVisible, setMickeyVisible] = useState(false);
  const [mickeyPosition, setMickeyPosition] = useState({
    top: "24px",
    left: "24px",
  });
  const [hostarActive, setHostarActive] = useState(false);
  const [pendingDisneyLevel, setPendingDisneyLevel] = useState(null);
  const [mickeyMessage, setMickeyMessage] = useState("Ei!");
  const hostarTimerRef = useRef(null);
  const smarticoApi = window?._smartico?.api;

  const mickeyMessages = useMemo(
    () => ["Viagem para Disney\n com R$0,10", "Ei, vai perder\n essa chance?"],
    []
  );

  // Posições predefinidas para o Mickey surgir (cantos e áreas próximas às construções)
  const mickeyPositions = useMemo(
    () => [
      { bottom: "220px", left: "22px" },
      { bottom: "120px", right: "26px" },
    ],
    []
  );

  const getRandomMickeyPosition = useCallback(
    () => mickeyPositions[Math.floor(Math.random() * mickeyPositions.length)],
    [mickeyPositions]
  );



  // Ciclo de spawn do Mickey (aparece 2x, 5s cada e intervalo de 3s)
  useEffect(() => {
    let firstShowTO;
    let firstHideTO;
    let secondShowTO;
    let secondHideTO;

    const appear = () => {
      setMickeyPosition(getRandomMickeyPosition());
      const msg = mickeyMessages[Math.floor(Math.random() * mickeyMessages.length)];
      setMickeyMessage(msg);
      setMickeyVisible(true);
    };

    // 1ª aparição
    firstShowTO = setTimeout(() => {
      appear();
      firstHideTO = setTimeout(() => {
        setMickeyVisible(false);
        // 2ª aparição 3s depois de sumir
        secondShowTO = setTimeout(() => {
          appear();
          secondHideTO = setTimeout(() => {
            setMickeyVisible(false);
          }, 5000);
        }, 3000); 
      }, 5000); 
    }, 500); 

    return () => {
      clearTimeout(firstShowTO);
      clearTimeout(firstHideTO);
      clearTimeout(secondShowTO);
      clearTimeout(secondHideTO);
    };
  }, [getRandomMickeyPosition, mickeyMessages]);

  // Finaliza Hostar: fecha overlay e abre modal Disney (com fallback de 3s)
  const finalizeHostar = () => {
    if (hostarTimerRef.current) {
      clearTimeout(hostarTimerRef.current);
      hostarTimerRef.current = null;
    }
    if (pendingDisneyLevel) {
      setCurrentLevel(pendingDisneyLevel);
      setShowCard(true);
      setPendingDisneyLevel(null);
    }
    setHostarActive(false);
  };

  // Clique no Mickey: ativa Hostar, rola para o topo e só depois abre modal
  const handleMickeyClick = () => {
    setHostarActive(true);

    if (levelContainerRef.current) {
      levelContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const sorted = [...levels].sort((a, b) => a.id - b.id).slice(0, 4);
    const disneyLevel = sorted[3] || sorted[sorted.length - 1];
    setPendingDisneyLevel(disneyLevel || null);

    // Fallback: garante máximo de 3s
    if (hostarTimerRef.current) clearTimeout(hostarTimerRef.current);
    hostarTimerRef.current = setTimeout(finalizeHostar, 3000);
  };

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!smarticoApi || typeof smarticoApi.getLevels !== "function") {
        if (active) {
          setLevels([]);
          setLoading(false);
        }
        return;
      }

      try {
        const levelsResponse = await smarticoApi.getLevels();
        if (active) setLevels(Array.isArray(levelsResponse) ? levelsResponse : []);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [smarticoApi]);

  useEffect(() => {
    if (!loading && levelContainerRef.current) {
      levelContainerRef.current.scrollTop =
        levelContainerRef.current.scrollHeight;
    }
  }, [loading]);

  const handleAnimationComplete = () => {
    const newPosition = getRandomPosition();
    setFishPosition(newPosition);
  };

  const handleOnClick = (key) => {
    if (animationRef.current && key === "OneFish") {
      window?._smartico?.action?.("FISH");
    }
  };

  const scrollContainer = (scrollOffset) => {
    if (levelContainerRef.current) {
      levelContainerRef.current.scrollBy({
        top: scrollOffset,
        behavior: "smooth",
      });
    }
  };

  const handleScrollUp = () => {
    scrollContainer(-SCROLL_OFFSET);
  };

  const handleScrollDown = () => {
    scrollContainer(SCROLL_OFFSET);
  };

  const handleMouseDown = (e) => {
    if (levelContainerRef.current) {
      levelContainerRef.current.isDragging = true;
      levelContainerRef.current.startY = e.clientY;
      levelContainerRef.current.scrollStartY =
        levelContainerRef.current.scrollTop;
      levelContainerRef.current.classList.add("dragging");
    }
  };

  const handleMouseMove = (e) => {
    if (levelContainerRef.current && levelContainerRef.current.isDragging) {
      const dy = e.clientY - levelContainerRef.current.startY;
      levelContainerRef.current.scrollTop =
        levelContainerRef.current.scrollStartY - dy;
    }
  };

  const handleMouseUp = () => {
    if (levelContainerRef.current) {
      levelContainerRef.current.isDragging = false;
      levelContainerRef.current.classList.remove("dragging");
    }
  };

  const handleMouseLeave = () => {
    if (levelContainerRef.current) {
      levelContainerRef.current.isDragging = false;
      levelContainerRef.current.classList.remove("dragging");
    }
  };

  // Limpeza do timer do Hostar ao desmontar
  useEffect(() => {
    return () => {
      if (hostarTimerRef.current) {
        clearTimeout(hostarTimerRef.current);
        hostarTimerRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return null;
  }

  return (
    <div
      className={`levels-wrapper ${
        DISABLE_ANIMATIONS ? "disable-animations" : ""
      }`}
    >
      <div className="levels-content-overlay" />
      <div
        className="levels-container"
        ref={levelContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="levels-content">
          <div className="levels-main-background">
            <div className="levels-map-road" />
            <div className="level-items-container">
              {levels
                .sort((a, b) => a.id - b.id)
                .slice(0, 4)
                .map((level, index) => (
                  <div key={level.id}>
                    <LevelItem
                      level={level}
                      index={index}
                      setShowCard={setShowCard}
                      setCurrentLevel={setCurrentLevel}
                    />
                  </div>
                ))}
            </div>
          </div>
          {!DISABLE_ANIMATIONS && (
            <div>
              {animations.map((animation) => (
                <div
                  className={`animation-container ${
                    animation.key === "OneFish" ? "fish" : ""
                  }`}
                  key={animation.key}
                  style={
                    animation.key === "OneFish" ? fishPosition : animation.style
                  }
                  onClick={() => handleOnClick(animation.key)}
                >
                  <Player
                    ref={animation.key === "OneFish" ? animationRef : null}
                    src={animation.src}
                    style={{ width: "100%", height: "100%" }}
                    autoplay={true}
                    loop={true}
                    background="transparent"
                    onEvent={(event) => {
                      if (event === "loop" && animation.key === "OneFish") {
                        handleAnimationComplete();
                      }
                    }}
                  ></Player>
                </div>
              ))}

              {/* Mickey Easter Egg */}
              {mickeyVisible && (
                <div
                  className="animation-container mickey"
                  style={{
                    ...mickeyPosition,
                    pointerEvents: "auto",
                    zIndex: 2,
                    width: "110px",
                    height: "110px",
                  }}
                  onClick={handleMickeyClick}
                >
                  {/* Balão de conversa */}
                  <div
                    className="mickey-bubble"
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#fff",
                      color: "#222",
                      fontWeight: 700,
                      borderRadius: "18px",
                      padding: "8px 12px",
                      marginBottom: "10px",
                      lineHeight: "1.3",
                      textAlign: "center",
                      fontSize: "12px",
                      whiteSpace: "break-spaces",
                      wordBreak: "normal",
                      letterSpacing: "0.1px",
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.18), inset 0 0 10px rgba(0,0,0,0.03)",
                      textShadow: "none",
                      backdropFilter: "blur(1px)",
                      pointerEvents: "none",
                      display: "inline-block",
                    }}
                  >
                    {mickeyMessage}
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        top: "100%",
                        width: 0,
                        height: 0,
                        borderLeft: "7px solid transparent",
                        borderRight: "7px solid transparent",
                        borderBottom: "10px solid #fff",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.18))",
                        pointerEvents: "none",
                      }}
                    />
                  </div>

                  <Player
                    src={Mickey}
                    style={{ width: "100%", height: "100%" }}
                    autoplay={true}
                    loop={true}
                    background="transparent"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overlay do Hostar girando */}
      {hostarActive && (
        <div
          className="hostar-overlay"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            pointerEvents: "none",
          }}
        >
          <div className="hostar-spinner" style={{ pointerEvents: "none" }}>
            <Player
              src={DisneyHostar}
              style={{ width: "220px", height: "220px" }}
              autoplay={true}
              loop={false}
              background="transparent"
              speed={1.5}
              onEvent={(event) => {
                if (event === "complete") {
                  finalizeHostar();
                }
              }}
            />
          </div>
        </div>
      )}

      {showCard && currentLevel && (
        <LevelCardModal
          level={currentLevel}
          showCard={showCard}
          setShowCard={setShowCard}
          levelIndex={levels.indexOf(currentLevel)}
        />
      )}

      <div className="levels-scroll-buttons">
        <div className="button-container" onClick={handleScrollUp}>
          <div className="button-nav up" />
        </div>
        <div className="button-container" onClick={handleScrollDown}>
          <div className="button-nav down" />
        </div>
      </div>
      <div className="levels-hint-message">
        <div className="hint-container">
          <div className="hint-icon" />
          <div className="hint-message">
            Arraste para cima e para baixo para navegar
          </div>
        </div>
      </div>
    </div>
  );
};

// Configurações personalizadas para cada modal
const modalConfigs = [
  {
    title: "PRESENTE DE ARREPIAR",
    content: {
      logic:
        "De 03:00 às 23:59 do dia 31.10 o usuário terá acesso ao presente diário dentro da gamificação.",
      distribution: [],
    },
  },
  {
    title: "TORNEIO DE HALLOWEEN",
    content: {
      frequency: "03–00h",
      date: "31/10",
      prize: "R$31k + Giros",
      scoring: "R$1 = 1 pt. Ranking por pontos.",
      distribution: [
        { position: "1º", prize: "R$10k" },
        { position: "2º", prize: "R$7k" },
        { position: "3º", prize: "R$5k" },
        { position: "4º", prize: "R$3,5k" },
        { position: "5º", prize: "R$1,5k" },
        { position: "6º", prize: "R$800" },
        { position: "7º", prize: "R$600" },
        { position: "8º", prize: "R$400" },
        { position: "9º", prize: "R$200" },
        { position: "10–30º", prize: "R$100" },
        { position: "31º+", prize: "20 Giros Big Bass H3" },
      ],
    },
  },
  {
    title: "CALDEIRÃO - HALLOWEEN",
    content: {
      distribution: [],
    },
  },
  {
    title: "VIAGEM PARA DISNEY",
    subtitle: "",
    content: {
      logic:
        "A cada R$0,10 apostados nos slots PG, você pode ganhar Giros Extras, um PS5 temático de Halloween ou uma viagem para a Disney.",
      period: "Das 03h até 23h59 do dia 31/10",
      description:
        "Os bônus e prêmios serão sorteados e distribuídos de forma aleatória nesta ação.",
      prizes: [
        "Wild Bandito - Giros Extras",
        "Mr. Hallow-Win - Giros Extras",
        "Big Bass Bonanza Halloween 3 - Giros Extras",
        "Werewolf’s Hunt - Giros Extras",
        "Mystic Potion - Giros Extras",
        "PS5",
        "Bilhete Premiado valendo uma Viagem Disney",
      ],
      distribution: [],
    },
  },
];

// Funções auxiliares para filtrar missões
const toArray = (value) => (Array.isArray(value) ? value : [value]);

const normalizeText = (text) => {
  if (!text) return "";
  return text.toString().toLowerCase().trim();
};

const getLevelHints = (level) => {
  if (!level?.hints) return [];
  return toArray(level.hints).map((hint) => normalizeText(hint));
};

const matchesLevel = (mission, level) => {
  if (!mission || !level) return false;

  const missionName = normalizeText(mission.name);
  const levelHints = getLevelHints(level);

  return levelHints.some((hint) => missionName.includes(hint));
};

// Componente para botões sobrepostos às missões
const MissionOverlayButtons = ({ level, levelIndex, maxItems = 2 }) => {
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState([]);
  const smarticoApi = window?._smartico?.api;

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        const ids = MISSION_IDS.map(Number);
        if (!smarticoApi || typeof smarticoApi.getMissions !== "function") {
          setMissions(ids.length ? ids.map((id) => ({ id, name: `Missão ${id}` })) : []);
          return;
        }
        const missionsList = await smarticoApi.getMissions({
          onUpdate: (ms) => {
            const asMap = new Map((Array.isArray(ms) ? ms : []).map((m) => [Number(m.id), m]));
            const orderedByIds = ids.map((id) => asMap.get(id)).filter(Boolean);
            const byId = orderedByIds;
            const byLevel = (Array.isArray(ms) ? ms : []).filter((mission) => matchesLevel(mission, level));
            let selected = (byId.length ? byId : byLevel).slice(0, maxItems);
            if (!selected.length && ids.length) {
              selected = ids.map((id) => ({ id, name: `Missão ${id}` }));
            }
            setMissions(selected);
          },
        });

        if (missionsList && Array.isArray(missionsList)) {
          const asMap = new Map(missionsList.map((m) => [Number(m.id), m]));
          const orderedByIds = ids.map((id) => asMap.get(id)).filter(Boolean);
          const byId = orderedByIds;
          const byLevel = missionsList.filter((mission) =>
            matchesLevel(mission, level)
          );
          let selected = (byId.length ? byId : byLevel).slice(0, maxItems);
          if (!selected.length && ids.length) {
            selected = ids.map((id) => ({ id, name: `Missão ${id}` }));
          }
          setMissions(selected);
        }
      } catch (err) {
        void err;
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, [level, levelIndex, maxItems, smarticoApi]);

  const handleMissionClick = (mission, index) => {
    // Direciona especificamente o 1º botão para dl-missions e o 2º para dl-missions-2
    const preferred = index === 0 ? "dl-missions" : "dl-missions-2";
    const aPreferred = document.getElementById(preferred);
    if (aPreferred) {
      aPreferred.click();
      return;
    }
    // Fallback: tenta o outro anchor, depois avisa
    const fallback = index === 0 ? "dl-missions-2" : "dl-missions";
    const aFallback = document.getElementById(fallback);
    if (aFallback) {
      aFallback.click();
      return;
    }
  };

  if (loading || !missions.length) {
    return null;
  }

  return (
    <div className="mission-overlay-buttons">
      {missions.map((mission, index) => (
        <button
          key={mission.id}
          className="mission-overlay-btn"
          onClick={() => handleMissionClick(mission, index)}
          aria-label={`Executar missão: ${mission.name}`}
        >
          {/* Botão transparente sobreposto */}
        </button>
      ))}
    </div>
  );
};

export default LevelMap;

// Bloco dinâmico de Torneio: busca e exibe o torneio ativo/mais próximo
function TournamentDynamicBlock() {
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const smarticoApi = window?._smartico?.api;

  useEffect(() => {
    const load = async () => {
      if (!smarticoApi || typeof smarticoApi.getTournamentsList !== "function") {
        setLoading(false);
        setTournament(null);
        return;
      }
      const onUpdate = (list) => {
        const arr = Array.isArray(list) ? list : [];
        const byId = arr.find((t) => Number(t.id) === Number(CAMPAIGN_TOURNAMENT_ID));
        if (byId) {
          setTournament(byId);
          return;
        }
        const nameQuery = String(CAMPAIGN_TOURNAMENT_NAME || "").trim().toLowerCase();
        if (nameQuery) {
          const byName = arr.find((t) => String(t?.name || "").toLowerCase().includes(nameQuery));
          if (byName) {
            setTournament(byName);
            return;
          }
        }
        setTournament(null);
      };
      const res = await smarticoApi.getTournamentsList({ onUpdate });
      onUpdate(res);
      setLoading(false);
    };
    load();
  }, [smarticoApi]);

  if (loading) return null;
  if (!tournament) {
    return (
      <div className="tournament-layout" role="region" aria-label="Torneio">
        <div className="no-missions">Nenhum torneio ativo encontrado.</div>
      </div>
    );
  }

  const openTournament = () => {
    // Prioriza o href já configurado no index.html
    const a = document.getElementById("dl-tournaments");
    if (a) {
      a.click();
      return;
    }
    // Fallback: usa dp com o ID selecionado (se existir)
    const dp = window?._smartico?.dp;
    const selectedId = tournament?.id ?? CAMPAIGN_TOURNAMENT_ID;
    const deepLink = `dp:gf_tournaments&id=${selectedId}`;
    if (typeof dp === "function") {
      dp(deepLink);
      return;
    }
  };

  return (
    <div className="tournament-layout" role="region" aria-label="Torneio ativo">
      <section className="tournament-image">
        <img
          src="https://casa.example.com/CRM/Widgets+CRM/Halloween+Map/img/banner-torneio.webp"
          alt={tournament?.name || "Torneio"}
          className="tournament-banner"
        />
      </section>
      <div className="tournament-info">
        <h3 className="tournament-title">{tournament?.name || "Torneio"}</h3>
        <div className="tournament-stats-grid">
          <div className="stat-card">
            <div className="stat-label">Premiação</div>
            <div className="stat-value">
              {tournament?.prize_pool_short ?? tournament?.prize_pool ?? "—"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Registro</div>
            <div className="stat-value">
              {Number.isFinite(Number(tournament?.registration_count))
                ? tournament.registration_count
                : "—"}
              /
              {Number.isFinite(Number(tournament?.players_max_count))
                ? tournament.players_max_count
                : "—"}
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="cta-btn" onClick={openTournament}>
            Participar do Torneio
          </button>
        </div>
      </div>
    </div>
  );
}

const LevelItem = ({ level, index, setShowCard, setCurrentLevel }) => {
  if (level === undefined) {
    return null;
  }

  // Todos desbloqueados
  const disabled = false;

  const handleClick = () => {
    if (disabled) return; // bloqueado: não abre modal
    setCurrentLevel(level);
    setShowCard(true);
  };

  const imageUrl = getLevelImageUrl(level, disabled, index);
  // Fallback para garantir visibilidade enquanto validamos URLs remotas
  const safeImageUrl = imageUrl;

  return (
    <>
      <div
        key={level.id}
        className={`level-item level-${index} ${disabled ? "disabled" : ""}`}
        aria-disabled={disabled}
        title={disabled ? "Bloqueado" : level.name}
      >
        {index === 1 && !DISABLE_ANIMATIONS && (
          <div className="ghost-animation">
            <Player
              src={GhostAnimation}
              style={{ width: "100%", height: "100%" }}
              autoplay={true}
              loop={true}
              background="transparent"
            />
          </div>
        )}
        <button
          type="button"
          className="level-image-btn"
          style={{ backgroundImage: `url("${safeImageUrl}")` }}
          onClick={disabled ? undefined : handleClick}
          aria-label={level.name}
          disabled={disabled}
        />
        {disabled && <div className="lock-icon" />}
        <div className="level-name">{level.name}</div>
      </div>
    </>
  );
};

const LevelCardModal = ({ level, showCard, setShowCard, levelIndex }) => {
  if (level === undefined) {
    return null;
  }

  // Obtém a configuração do modal baseada no levelIndex
  const modalConfig = modalConfigs[levelIndex] || null;

  // Gera classe específica para cada modal
  const getModalClass = () => {
    if (!modalConfig) return "";

    const titleMap = {
      "VIAGEM PARA DISNEY": "disney-modal",
      "CALDEIRÃO - HALLOWEEN": "giftbox-modal",
      "PRESENTE DE ARREPIAR": "presente-modal",
      "TORNEIO DE HALLOWEEN": "torneio-modal",
    };

    return titleMap[modalConfig.title] || "";
  };

  return (
    <div
      className={`level-card-wrapper ${
        showCard ? "active" : ""
      } ${getModalClass()}`}
    >
      <div className={`level-card ${getModalClass()}`}>
        <div
          className="level-card-close"
          onClick={() => setShowCard(false)}
          role="button"
          aria-label="Fechar"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowCard(false);
            }
          }}
        >
          <div className="level-card-close-btn" />
        </div>
        <div className="level-card-content">
          {modalConfig ? (
            <div className="custom-modal-content">
              <div className="modal-header">
                {modalConfig.title === "VIAGEM PARA DISNEY" ? (
                  <>
                    <h2 className="modal-title disney-mobile-title">{modalConfig.title}</h2>
                    <div className="disney-header">
                    <img
                      className="disney-header-img"
                      src="https://casa.example.com/CRM/Banners+-+Promos/31.10/CRM_BANNER_HALLOWEEN.webp"
                      alt="Banner da promoção"
                      loading="lazy"
                    />
                    <div className="disney-header-overlay" />
                    <div className="disney-header-copy">
                      <h2 className="modal-title">{modalConfig.title}</h2>
                      {modalConfig.subtitle && (
                        <p className="modal-subtitle">{modalConfig.subtitle}</p>
                      )}
                      <div className="prize-carousel" aria-label="Prêmios em destaque">
                        <div className="prize-track">
                          <ul className="prize-list">
                            <li className="prize giros bandito">Wild Bandito - Giros Extras</li>
                            <li className="prize giros hallowwin">Mr. Hallow-Win - Giros Extras</li>
                            <li className="prize giros bigbass">Big Bass Halloween 3 - Giros Extras</li>
                            <li className="prize giros werewolf">Werewolf’s Hunt - Giros Extras</li>
                            <li className="prize giros mystic">Mystic Potion - Giros Extras</li>
                            <li className="prize major ps5">PS5</li>
                            <li className="prize major trip">Bilhete Premiado valendo uma Viagem Disney</li>
                          </ul>
                          {/* clone para efeito contínuo */}
                          <ul className="prize-list clone">
                            <li className="prize giros bandito">Wild Bandito - Giros Extras</li>
                            <li className="prize giros hallowwin">Mr. Hallow-Win - Giros Extras</li>
                            <li className="prize giros bigbass">Big Bass Halloween 3 - Giros Extras</li>
                            <li className="prize giros werewolf">Werewolf’s Hunt - Giros Extras</li>
                            <li className="prize giros mystic">Mystic Potion - Giros Extras</li>
                            <li className="prize major ps5">PS5</li>
                            <li className="prize major trip">Bilhete Premiado valendo uma Viagem Disney</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  </>
                ) : (
                  <h2 className="modal-title">{modalConfig.title}</h2>
                )}
              </div>
              <div className="modal-body">
                {/* Torneio de Halloween */}
                {modalConfig.title === "TORNEIO DE HALLOWEEN" && (
                  <TournamentDynamicBlock />
                )}

                {/* Presente de Arrepiar */}
                {modalConfig.title === "PRESENTE DE ARREPIAR" && (
                  <section
                    className="present-layout"
                    aria-label="PRESENTE DE ARREPIAR"
                  >
                    <h3 className="present-title">Como funciona</h3>
                    <p className="present-desc">{modalConfig.content.logic}</p>
                    <div className="modal-actions">
                      <button
                        className="cta-btn"
                        onClick={() => {
                          // Prioriza o href já configurado no index.html
                          const giftAnchor = document.getElementById("dl-daily-gift");
                          if (giftAnchor) {
                            giftAnchor.click();
                            return;
                          }
                          // Fallback: deep link via dp com ID local
                          const dp = window?._smartico?.dp;
                          const deepLink = `dp:gf_section&id=${CAMPAIGN_DAILY_GIFT_ID}`;
                          if (typeof dp === "function") {
                            dp(deepLink);
                            return;
                          }
                        }}
                      >
                        Abrir Presente Diário
                      </button>
                    </div>
                  </section>
                )}

                {/* Gift Box Halloween */}
                {modalConfig.title === "CALDEIRÃO - HALLOWEEN" && (
                  <section
                    className="giftbox-layout"
                    aria-label="Gift Box Halloween"
                  >
                    <div className="missions-wrapper">
                      {/* Missões do Caldeirão: duas empilhadas */}
                      <Missions
                        level={level}
                        levelIndex={levelIndex}
                        maxItems={2}
                      />
                      {/* Botões sobrepostos clicáveis */}
                      <MissionOverlayButtons
                        level={level}
                        levelIndex={levelIndex}
                        maxItems={2}
                      />
                    </div>
                  </section>
                )}

                {/* Viagem para Disney */}
                {modalConfig.title === "VIAGEM PARA DISNEY" && (
                  <section
                    className="disney-layout"
                    aria-label="VIAGEM PARA DISNEY"
                  >
                    <section className="disney-details">
                      <dl className="details">
                        <div className="row">
                          <dt>Lógica</dt>
                          <dd>{modalConfig.content.logic}</dd>
                        </div>

                        <div className="row">
                          <dt>Período</dt>
                          <dd>{modalConfig.content.period}</dd>
                        </div>
                        <div className="row">
                          <dt>Descrição</dt>
                          <dd>{modalConfig.content.description}</dd>
                        </div>
                      </dl>
                    </section>
                    <div className="modal-actions">
                      {(() => {
                        const url = "https://casa.example.com";
                        return (
                          <a
                            className="cta-btn"
                            href={url}
                            target="_self"
                            onClick={(e) => {
                              try {
                                e.preventDefault();
                                // Navega na mesma aba, sem abrir nova janela e sem usar dp
                                window.location.assign(url);
                              } catch {
                                // Fallback simples caso assign falhe
                                window.open(url, "_self");
                              }
                            }}
                          >
                            Jogue e Concorra
                          </a>
                        );
                      })()}
                    </div>
                  </section>
                )}
              </div>
            </div>
          ) : (
            <Missions level={level} levelIndex={levelIndex} />
          )}
        </div>
      </div>
    </div>
  );
};
