import React, { useState, useEffect } from "react"; // ✅ importa hooks
import "./App.css";
import LevelMap from "./widget-pass/Main.jsx";

function App() {
  // exemplo caso queira usar
  const [count, setCount] = useState(0);
  const [smarticoReady, setSmarticoReady] = useState(false);

  useEffect(() => {
    console.log("App montado ✅");
  }, []);

  useEffect(() => {
    const checkReady = () => {
      if (window._smartico && window._smartico.api) {
        setSmarticoReady(true);
        return true;
      }
      return false;
    };

    if (checkReady()) return;
    const id = setInterval(() => {
      if (checkReady()) {
        clearInterval(id);
      }
    }, 300);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {smarticoReady ? (
        <LevelMap />
      ) : (
        <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center'}}>Loading Smartico script...</div>
      )}
    </>
  );
}

export default App;
