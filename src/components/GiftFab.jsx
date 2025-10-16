/* global */

import { useEffect, useRef, useState } from "react";
import { startCountdownToMidnight } from "../functions/midnight";
// import { runPromoTimers } from "../functions/promoTimers"; // <- não precisa mais
import Main from "../widget-mission/main";
import Tournaments from "../widget-tourments/Main";


export default function GiftFab() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [tournamentsOpen, setTournamentsOpen] = useState(false);

  const midnightIntervalRef = useRef(null);
  const tournamentsModalRef = useRef(null);

  // Fecha o widget de torneios ao clicar fora
  useEffect(() => {
    if (!tournamentsOpen) return;
    function handleClickOutside(e) {
      if (tournamentsModalRef.current && !tournamentsModalRef.current.contains(e.target)) {
        setTournamentsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tournamentsOpen]);

  // Sem dependências do gift-float: nenhuma inicialização extra necessária

  useEffect(() => {
    midnightIntervalRef.current = startCountdownToMidnight();
    return () => {
      if (midnightIntervalRef.current)
        clearInterval(midnightIntervalRef.current);
      document.body.classList.remove("gift-overlay-open");
    };
  }, []);

  // ====== Handlers ======
  function openMainModal() {
    setMenuOpen(true);
    setTimeout(() => {
      const nodes = document.querySelectorAll(
        ".button-with-label, .btn-label, .round-btn"
      );
      for (let i = 0; i < nodes.length; i++) {
        setTimeout(() => nodes[i].classList.add("float-in"), i * 100);
      }
    }, 0);
    document.body.classList.add("gift-overlay-open");
  }

  function closeMainModal() {
    const nodes = document.querySelectorAll(
      ".button-with-label, .btn-label, .round-btn"
    );
    nodes.forEach((n) => n.classList.remove("float-in"));
    setTimeout(() => {
      setMenuOpen(false);
      if (!promoOpen) {
        document.body.classList.remove("gift-overlay-open");
      }
    }, 300);
  }

  function openPromoModal() {
    setPromoOpen(true);
    document.body.classList.add("gift-overlay-open");
  }

  function closePromoModal() {
    setPromoOpen(false);
    if (!menuOpen) {
      document.body.classList.remove("gift-overlay-open");
    }
  }

  return (
    <>
      {/* =============== Floating Buttons =============== */}
      <div
        id="gift-float-btn"
        className="round-btn"
        style={{ display: menuOpen ? "none" : "flex" }}
        onClick={openMainModal}
        title="Abrir menu"
      ></div>

      <div
        id="gift-close-btn"
        className=""
        style={{
          display: menuOpen ? "flex" : "none",
          position: "fixed",
          bottom: 145,
          right: 30,
          zIndex: 10000,
        }}
        onClick={() => {
          closeMainModal();
          if (promoOpen) closePromoModal();
        }}
        title="Fechar"
      >
        <div className="x-close">
          <img
            className="btn-x-close"
            src="https://casa.example.com/CRM/Icones/icon%2Bbtn.webp"
            alt="Fechar"
          />
        </div>
      </div>

      {/* =============== Overlay e Modal Principal =============== */}
      <div
        id="gift-float-overlay"
        style={{ display: menuOpen ? "block" : "none" }}
        onClick={closeMainModal}
      />

      <div
        id="gift-float-modal"
        style={{ display: menuOpen ? "flex" : "none", flexDirection: "column" }}
      >
        {/* header */}
        <div className="button-with-label" style={{ marginBottom: 12 }}>
          <div
            className="btn-label"
            style={{ display: "inline-flex", alignItems: "center", flexDirection: "column" }}
          >
            <strong>OFERTA MISTERIOSA</strong>
            <span id="countdown" style={{ fontWeight: 600 }}>
              --:--:--
            </span>
          </div>
          <div className="round-btn" aria-hidden="true">
            <img
              src="https://casa.example.com/CRM/Icones/quiz.webp"
              alt=""
            />
          </div>
        </div>

        {/* PROMOÇÕES */}
        <div
          className="button-with-label"
          id="promo-btn"
          role="button"
          tabIndex={0}
          onClick={openPromoModal}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openPromoModal();
          }}
        >
          <div className="btn-label">PROMOÇÕES</div>
          <div className="round-btn" aria-hidden="true">
            <img
              src="https://casa.example.com/CRM/Icones/presete.webp"
              alt=""
            />
          </div>
        </div>

        {/* TORNEIOS */}
        <div
          className="button-with-label"
          id="tournaments-btn"
          role="button"
          tabIndex={0}
          onClick={() => setTournamentsOpen((open) => !open)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setTournamentsOpen((open) => !open);
          }}
        >
          <div className="btn-label">TORNEIOS</div>
          <div className="round-btn" aria-hidden="true">
            <img
              src="https://casa.example.com/CRM/Icones/trofeu.webp"
              alt=""
            />
          </div>
        </div>

        {/* INBOX */}
        <div
          className="button-with-label"
          id="promo-btn"
          role="button"
          tabIndex={0}
        >
          <div className="btn-label">NOTIFICAÇÕES</div>
          <div
            className="round-btn"
            onClick={() => document.getElementById('dl-missions')?.click()}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                document.getElementById('dl-missions')?.click();
              }
            }}
          >
            <img
              src="https://casa.example.com/CRM/Icones/icone-notificacoes.webp"
              alt=""
            />
          </div>
        </div>
      </div>

      {/* =============== MODAL: Promoções (mostra o WIDGET) =============== */}
      {(promoOpen || tournamentsOpen) && (
        <div
          id="gift-promo-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 19999,
          }}
          onClick={() => {
            if (promoOpen) closePromoModal();
            if (tournamentsOpen) setTournamentsOpen(false);
          }}
        >
          <div
            id="gift-promo-modal"
            ref={tournamentsOpen ? tournamentsModalRef : undefined}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 380,
              width: '100%',
              paddingBottom: 8,
              zIndex: 21000,
              position: 'fixed',
              top: '50%',
              right: '80px',
              transform: 'translateY(-50%)',
              pointerEvents: 'auto',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)',
              background: 'none',
            }}
          >
            {promoOpen && <Main />}
            {tournamentsOpen && <Tournaments />}
          </div>
        </div>
      )}
    </>
  );
}
