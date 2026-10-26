import React, { useEffect, useRef, useState } from "react";

const statusClazz = (tournament) => {
  if (tournament) {
    if (tournament.is_upcoming) return "aguardando";
    if (tournament.is_in_progress) return "iniciado";
    if (tournament.is_cancelled) return "cancelado";
    if (tournament.is_finished) return "finalizado";
  }
  return "";
};

const Tournaments = () => {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [timeLeftForTournaments, setTimeLeftForTournaments] = useState({});
  const carouselRef = useRef(null);

  const smarticoApi = window?._smartico?.api;

  const enableSmoothScrolling = () => {
    if (carouselRef.current) {
      carouselRef.current.classList.add("smooth-scrolling");
    }
  };

  const disableSmoothScrolling = () => {
    if (carouselRef.current) {
      carouselRef.current.classList.remove("smooth-scrolling");
    }
  };

  const onDragStart = (e) => {
    disableSmoothScrolling();
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleLeftArrowClick = () => {
    enableSmoothScrolling();
    if (carouselRef.current) {
      carouselRef.current.scrollLeft -= 250;
    }
  };

  const handleRightArrowClick = () => {
    enableSmoothScrolling();
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += 250;
    }
  };

  const tournamentsUpdates = (tournaments) => {
    if (tournaments && tournaments.length > 0) {
      setTournaments(tournaments);
    }
  };

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!smarticoApi || typeof smarticoApi.getTournamentsList !== "function") {
        if (active) {
          setTournaments([]);
          setLoading(false);
        }
        return;
      }

      try {
        const tournamentsResponse = await smarticoApi.getTournamentsList({
          onUpdate: tournamentsUpdates,
        });
        if (active) setTournaments(Array.isArray(tournamentsResponse) ? tournamentsResponse : []);
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
    const calculateTimeLeft = (targetTime) => {
      const now = new Date().getTime();
      const timeDiff = targetTime - now;

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        return { days, hours, minutes, seconds };
      } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    const updateTournamentTimes = () => {
      const updatedTimeLeft = {};
      tournaments?.forEach((tournament) => {
        const targetTime = tournament.is_in_progress
          ? new Date(tournament.end_time).getTime()
          : new Date(tournament.start_time).getTime();
        updatedTimeLeft[tournament.instance_id] = calculateTimeLeft(targetTime);
      });
      setTimeLeftForTournaments(updatedTimeLeft);
    };

    const interval = setInterval(updateTournamentTimes, 1000);

    return () => clearInterval(interval);
  }, [tournaments]);

  if (loading) return null;
  if (!tournaments || tournaments.length === 0) return null;

  return (
    <div className="tournament-container">
      <div className="tournament-header">
        <div className="tournament-header-title">Torneios</div>
        <div
          className="view-all-button"
          onClick={() => document.getElementById('dl-tournaments')?.click()}
        >
          Ver todos
        </div>
      </div>
      <div
        className="cards-container"
        ref={carouselRef}
        onMouseDown={onDragStart}
        onMouseLeave={onDragEnd}
        onMouseUp={onDragEnd}
        onMouseMove={onDragMove}
        onTouchStart={(e) => onDragStart(e.touches[0])}
        onTouchEnd={onDragEnd}
        onTouchMove={(e) => onDragMove(e.touches[0])}
      >
        {tournaments.map((tournament) => {
          const timeLeft = timeLeftForTournaments[tournament.instance_id] || {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
          return (
            <div className="tournament-card" key={tournament.instance_id}>
              <div
                className="tournament-content"
                style={{ backgroundImage: `url('${tournament.image1}')` }}
              >
                <div className={`tournament-status ${statusClazz(tournament)}`}>
                  {statusClazz(tournament)}
                </div>
                <div className="overlay"></div>
                {tournament.ribbon && (
                  <div className={`ribbon ${tournament.ribbon}`}>
                    {tournament.ribbon}
                  </div>
                )}
                <div
                  className="tournament-title"
                  dangerouslySetInnerHTML={{ __html: tournament.name }}
                ></div>
              </div>
              <div className="tournament-info">
                <div className="info-section">
                  <div className="info-title">Premiação</div>
                  <div className="info-value">
                    {tournament.prize_pool_short
                      ? tournament.prize_pool_short
                      : "No prize"}
                  </div>
                </div>
                <div className="info-section">
                  <div className="info-title">Registro</div>
                  <div className="info-value">
                    {tournament.registration_count}/
                    {tournament.players_max_count}
                  </div>
                </div>
              </div>
              <div className="tournament-bottom">
                <div className="tournament-timer">
                  <div className="timer-value">
                    <span className="time-section">
                      {String(timeLeft.days).padStart(2, "0")}
                      <span className="time-unit">D</span>
                    </span>
                    <span className="time-section">
                      {String(timeLeft.hours).padStart(2, "0")}
                      <span className="time-unit">H</span>
                    </span>
                    <span className="time-section">
                      {String(timeLeft.minutes).padStart(2, "0")}
                      <span className="time-unit">M</span>
                    </span>
                    <span className="time-section">
                      {String(timeLeft.seconds).padStart(2, "0")}
                      <span className="time-unit">S</span>
                    </span>
                  </div>
                </div>
                <div
                  className={`join-button`}
                  onClick={() => document.getElementById('dl-tournaments')?.click()}
                >
                  <p>{tournament.is_user_registered ? "Registered" :"Registre-se"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="navigation">
        <div className="nav-button prev-button" onClick={handleLeftArrowClick}>
          {"<-"}
        </div>
        <div className="nav-button next-button" onClick={handleRightArrowClick}>
          {"->"}
        </div>
      </div>
    </div>
  );
};

export default Tournaments;
