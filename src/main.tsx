import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from "./contexts/AuthContext"

// Initialize Google Analytics from localStorage so it persists across refreshes
function initGoogleAnalyticsFromLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    const id = localStorage.getItem('ga_measurement_id');
    if (!id) return;

    // Avoid duplicate injection
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${id}"]`)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    const configScript = document.createElement('script');
    configScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);} 
      gtag('js', new Date());
      gtag('config', '${id}');
      window.GA_MEASUREMENT_ID = '${id}';
    `;
    document.head.appendChild(configScript);
  } catch (err) {
    // no-op
  }
}

initGoogleAnalyticsFromLocalStorage();

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
