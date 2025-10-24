import React, { createRef, useEffect, useRef, useState } from "react";

const missionStatus = (m) => {
  if (!m) return "";
  if (m.is_locked) return "Bloqueada";
  if (m.is_completed) return "Concluída";
  if (m.is_in_progress || m.is_opted_in) return "Em andamento";
  if (m.is_requires_optin) return "Requer opt-in";
  return "Disponível";
};

const getStatusClassName = (m) => {
  if (!m) return "";
  if (m.is_locked) return "locked";
  if (m.is_completed) return "completed";
  if (m.is_in_progress || m.is_opted_in) return "in-progress";
  if (m.is_requires_optin) return "requires-optin";
  return "available";
};

const ScrollItems = ({ className, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef(null);

  const onDragStart = (e) => {
    const pageX = e.pageX ?? e?.touches?.[0]?.pageX ?? 0;
    setIsDragging(true);
    setStartX(pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };
  const onDragEnd = () => setIsDragging(false);
  const onDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault?.();
    const pageX = e.pageX ?? e?.touches?.[0]?.pageX ?? 0;
    const x = pageX - carouselRef.current.offsetLeft;
    carouselRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
  };

  return (
    <div
      className={className}
      ref={carouselRef}
      onMouseDown={onDragStart}
      onMouseLeave={onDragEnd}
      onMouseUp={onDragEnd}
      onMouseMove={onDragMove}
      onTouchStart={onDragStart}
      onTouchEnd={onDragEnd}
      onTouchMove={onDragMove}
    >
      {children}
    </div>
  );
};

const toArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
};

const normalizeText = (v) => (v || "").toString().trim().toLowerCase();

const getLevelHints = (level, levelIndex) => {
  const id = level?.id;
  const name = normalizeText(level?.name);
  const index = Number.isFinite(levelIndex) ? Number(levelIndex) : undefined;
  const cd = level?.custom_data || {};
  const tags = [
    ...toArray(cd.mission_tags),
    ...toArray(cd.tags),
    ...toArray(cd.level_tags),
  ]
    .map(normalizeText)
    .filter(Boolean);
  return { id, name, index, tags };
};

// Extrai um possível número da missão (1,2,3...) baseado em várias chaves e no nome
const getMissionNumber = (mission) => {
  if (!mission) return undefined;
  const cd = mission.custom_data || {};
  const numCandidates = [
    mission.number,
    mission.index,
    mission.order,
    mission.position,
    cd.number,
    cd.index,
    cd.order,
    cd.position,
  ].map((v) => (v != null ? Number(v) : undefined)).filter((v) => Number.isFinite(v));
  if (numCandidates.length) return numCandidates[0];
  const name = (mission.name || "").toString();
  const m = name.match(/miss[ãa]o\s*(\d+)/i);
  if (m && Number(m[1])) return Number(m[1]);
  return undefined;
};

// Helper para verificar se uma missão pertence ao nível/insígnia atual
const matchesLevel = (mission, level, levelIndex) => {
  if (!level || !mission) return false;
  const { id: lvlId, name: lvlName, index: idx, tags: lvlTags } = getLevelHints(level, levelIndex);

  const cd = mission?.custom_data || {};

  const idCandidates = [
    mission.level_id,
    mission.levelId,
    mission.level,
    mission.segment_id,
    mission.group_id,
    cd.level_id,
    cd.levelId,
    cd.level,
    cd.segment_id,
    cd.group_id,
    ...toArray(mission.level_ids),
    ...toArray(cd.level_ids),
  ];

  const indexCandidates = [mission.level_index, mission.levelIndex, cd.level_index, cd.levelIndex];

  const nameCandidates = [mission.level_name, mission.group_name, mission.segment, cd.level_name, cd.group_name, cd.segment];

  const tagCandidates = [
    ...toArray(mission.tags),
    ...toArray(cd.tags),
  ].map(normalizeText);

  // Match por id
  if (lvlId != null && idCandidates.some((v) => Number(v) === Number(lvlId))) {
    return true;
  }

  // Match por índice
  if (idx != null && indexCandidates.some((v) => Number(v) === Number(idx))) {
    return true;
  }

  // Match por nome exato
  if (lvlName && nameCandidates.some((n) => normalizeText(n) === lvlName)) {
    return true;
  }

  // Match por tags
  if (lvlTags.length && tagCandidates.length) {
    const overlap = lvlTags.some((t) => tagCandidates.includes(t));
    if (overlap) return true;
  }

  // Fallback: nome do nível presente no nome da missão
  if (lvlName && normalizeText(mission.name).includes(lvlName)) {
    return true;
  }

  return false;
};

const Missions = ({ level, levelIndex, maxItems = 1 }) => {
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState([]);
  const [activeMission, setActiveMission] = useState(null);
  const [timeLeftForMissions, setTimeLeftForMissions] = useState({});

  const missionsContainerRef = useRef(null);
  const missionRefs = useRef([]);

  const smarticoApi = window?._smartico?.api;
  const smarticoDP = window?._smartico?.dp;

  missionRefs.current = missions.map((_, i) => missionRefs.current[i] ?? createRef());

  const calculateTimeLeft = (mission) => {
    const now = Date.now();
    const end = mission.dt_start + mission.time_limit_ms;
    const diff = end - now;
    if (diff < 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds };
  };

  const handleExpand = (missionId) => {
    setActiveMission((prev) => (prev === missionId ? null : missionId));
    setTimeout(() => {
      const idx2 = missions.findIndex((m) => m.id === missionId);
      if (idx2 !== -1 && missionsContainerRef.current) {
        const el = missionRefs.current[idx2].current;
        if (el) {
          const missionTop = el.getBoundingClientRect().top;
          const containerTop = missionsContainerRef.current.getBoundingClientRect().top;
          const scrollPosition = missionTop - containerTop + missionsContainerRef.current.scrollTop - 12;
          missionsContainerRef.current.scrollTo({ top: scrollPosition, behavior: "smooth" });
        }
      }
    }, 0);
  };

  // Seleciona missões com base no nível/insígnia, respeitando maxItems
  const pickSingleMission = (list) => {
    const arr = Array.isArray(list) ? list : [];
    const hints = getLevelHints(level, levelIndex);
    const byLevel = level ? arr.filter((m) => matchesLevel(m, level, levelIndex)) : arr;

    // Ordenar por número conhecido quando possível para previsibilidade
    const sortByNumber = (xs) =>
      xs.slice().sort((a, b) => {
        const na = getMissionNumber(a) ?? Number.MAX_SAFE_INTEGER;
        const nb = getMissionNumber(b) ?? Number.MAX_SAFE_INTEGER;
        return na - nb;
      });

    // Quando queremos mais de 1 missão, devolvemos as primeiras correspondentes
    if (maxItems > 1) {
      const src = byLevel.length ? sortByNumber(byLevel) : sortByNumber(arr);
      return src.slice(0, maxItems);
    }

    // Preferir missão cujo número bata com o índice da insígnia (index + 1)
    const preferNumber = typeof hints.index === 'number' ? hints.index + 1 : undefined;
    const candidateByNumber = byLevel.find((m) => getMissionNumber(m) === preferNumber) || arr.find((m) => getMissionNumber(m) === preferNumber);
    if (candidateByNumber) return [candidateByNumber];

    // Caso não tenha candidato por número, usar pela posição do índice
    if (byLevel.length > 0) {
      const pos = hints.index != null ? hints.index % byLevel.length : 0;
      return [byLevel[pos]];
    }

    // Sem correspondência: escolher uma missão geral pelo índice
    if (arr.length > 0) {
      const pos = hints.index != null ? hints.index % arr.length : 0;
      return [arr[pos]];
    }

    return [];
  };

  useEffect(() => {
    const load = async () => {
      if (!smarticoApi) {
        setMissions([]);
        setLoading(false);
        return;
      }
      const hints = getLevelHints(level, levelIndex);
      const res = await smarticoApi.getMissions({
        ...hints,
        onUpdate: (ms) => {
          setMissions(pickSingleMission(ms));
        },
      });
      setMissions(pickSingleMission(res));
      setLoading(false);
    };
    load();
  }, [smarticoApi, level, levelIndex]);

  useEffect(() => {
    const id = setInterval(() => {
      const next = {};
      missions.forEach((m) => {
        next[m.id] = calculateTimeLeft(m);
      });
      setTimeLeftForMissions(next);
    }, 20000);
    return () => clearInterval(id);
  }, [missions]);

  if (loading) return null;

  return (
    <div className="missions-container">
      

      <div className="missions-list" ref={missionsContainerRef}>
        {missions.map((mission, index) => {
          const timeLeft = timeLeftForMissions[mission.id];
          return (
            <button
              ref={missionRefs.current[index]}
              className={`mission ${activeMission === mission.id ? "active" : ""}`}
              onClick={() => {
                const a = document.getElementById('dl-missions');
                if (a) a.click();
              }}
              key={mission.id}
            >
              <div className="mission-block">
                <div className="mission-left">
                  <div className="image" style={{ backgroundImage: `url('${mission.image}')` }} />
                </div>

                <div className="mission-right">
                  <div className="mission-info">
                    <div className="name" dangerouslySetInnerHTML={{ __html: mission.name }} />
                    {/* <div className={`status ${getStatusClassName(mission)}`}>{missionStatus(mission)}</div> */}
                  </div>

                  {mission.reward && (
                    <div className="reward">
                      <span>Recompensas:</span> {mission.reward}
                    </div>
                  )}
                </div>
              </div>

              {mission.progress > 0 && (
                <div className="progress-bar-block">
                  <div className="progress-bar-text">
                    <div className="label">Progress</div>
                    <div className="numbers">{mission.progress} <span>/ 100%</span></div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${mission.progress}%` }} />
                  </div>
                </div>
              )}

              <div className="tasks">
                {mission.tasks.map((t) => (
                  <div className={`task ${t.is_completed ? "completed" : ""}`} key={t.id}>
                    <div className="task-icon">✔</div>
                    <div className="task-name" dangerouslySetInnerHTML={{ __html: t.name }} />
                    {t.points_reward > 0 && <div className="task-reward">{t.points_reward} pts</div>}
                  </div>
                ))}
              </div>

              {timeLeft && (
                <div className="time">
                  <div className="time-text">Mission duration</div>
                  <div className="timer">
                    {timeLeft.days > 0 && (
                      <div className="time-number">{timeLeft.days.toString().padStart(2, "0")}</div>
                    )}
                    <div className="time-number">{timeLeft.hours.toString().padStart(2, "0")}</div>
                    <div className="time-delimiter">:</div>
                    <div className="time-number">{timeLeft.minutes.toString().padStart(2, "0")}</div>
                    <div className="time-delimiter">:</div>
                    <div className="time-number">{timeLeft.seconds.toString().padStart(2, "0")}</div>
                  </div>
                </div>
              )}
            </button>
          );
        })}

        {missions.length === 0 && (
          <div className="no-missions">Nenhuma missão vinculada a esta insígnia.</div>
        )}
      </div>
    </div>
  );
};

export default Missions;