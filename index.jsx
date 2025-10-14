import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';  // agora App está na mesma pasta

const root = ReactDOM.createRoot(document.getElementById('root'));

let rendered = false;
const renderApp = () => {
    if (rendered) return;
    rendered = true;
    root.render(<App />);
};

const isSmarticoReady = () => {
    const s = window._smartico;
    return !!(s && (s.api || s.checkSuccessfullyIdentify?.()));
};

// loading placeholder
root.render(
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        Loading Smartico script...
    </div>
);

const login = setInterval(() => {
    if (isSmarticoReady()) {
        clearInterval(login);
        renderApp();
    }
}, 50);

setTimeout(() => {
    if (!rendered) {
        clearInterval(login);
        renderApp();
    }
}, 8000);