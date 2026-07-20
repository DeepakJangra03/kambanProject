import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { apiFetch } from "./lib/api";
// Centralized API Base URL routing for production
const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
if (!isLocalhost) {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
        const url = typeof input === 'string' ? input : input.url;
        if (url.startsWith('/api/')) {
            const newUrl = `${window.location.origin}${url}`;
            return originalFetch(newUrl, init);
        }
        return originalFetch(input, init);
    };
}

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
