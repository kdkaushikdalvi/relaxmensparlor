import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force clear outdated caches on app load
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.update();
    });
  });
  
  // Clear all caches to ensure fresh content
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        // Only clear workbox caches
        if (name.includes('workbox') || name.includes('precache')) {
          caches.delete(name);
        }
      });
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
