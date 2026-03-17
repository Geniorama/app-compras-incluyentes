"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "ci-accessibility";

interface A11ySettings {
  fontSize: 0 | 1 | 2; // 0=normal, 1=grande, 2=muy grande
  highContrast: boolean;
  grayscale: boolean;
}

const defaults: A11ySettings = { fontSize: 0, highContrast: false, grayscale: false };

const FONT_CLASSES = ["", "a11y-font-lg", "a11y-font-xl"] as const;

export default function AccessibilityBar() {
  const [settings, setSettings] = useState<A11ySettings>(defaults);

  // Cargar preferencias guardadas
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSettings(JSON.parse(saved) as A11ySettings);
    } catch {
      // ignorar errores de parsing
    }
  }, []);

  // Aplicar clases al elemento <html>
  useEffect(() => {
    const html = document.documentElement;

    // Tamaño de fuente
    html.classList.remove("a11y-font-lg", "a11y-font-xl");
    if (settings.fontSize > 0) html.classList.add(FONT_CLASSES[settings.fontSize]);

    // Alto contraste
    html.classList.toggle("a11y-high-contrast", settings.highContrast);

    // Escala de grises
    html.classList.toggle("a11y-grayscale", settings.grayscale);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignorar
    }
  }, [settings]);

  const update = useCallback((patch: Partial<A11ySettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => setSettings(defaults), []);

  const iconClass = "w-5 h-5 inline-block";

  return (
    <>
      {/* Enlace de salto al contenido principal (visible solo con foco) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[9999] focus:bg-[#193DC0] focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:rounded-br-md focus:outline-none"
      >
        Ir al contenido principal
      </a>

      {/* Barra de accesibilidad */}
      <div
        role="navigation"
        aria-label="Herramientas de accesibilidad"
        className="fixed top-0 left-0 w-full z-40 bg-[#193DC0] text-white text-xs border-b border-blue-800 print:hidden"
      >
        <div className="container mx-auto px-4 flex flex-wrap items-center gap-x-1 gap-y-1 py-1 justify-end">
          <span className="text-white/70 mr-2 hidden sm:inline" aria-hidden="true">
            Accesibilidad:
          </span>

          {/* Disminuir fuente */}
          <button
            onClick={() => update({ fontSize: Math.max(0, settings.fontSize - 1) as 0 | 1 | 2 })}
            aria-label="Disminuir tamaño de texto"
            title="Disminuir tamaño de texto"
            disabled={settings.fontSize === 0}
            className="px-2 py-0.5 rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <span className="font-bold text-sm" aria-hidden="true">A-</span>
          </button>

          {/* Tamaño normal */}
          <button
            onClick={() => update({ fontSize: 0 })}
            aria-label="Tamaño de texto normal"
            title="Tamaño de texto normal"
            aria-pressed={settings.fontSize === 0}
            className={`px-2 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-white transition ${
              settings.fontSize === 0 ? "bg-white/30" : "hover:bg-white/20"
            }`}
          >
            <span className="font-bold text-sm" aria-hidden="true">A</span>
          </button>

          {/* Aumentar fuente */}
          <button
            onClick={() => update({ fontSize: Math.min(2, settings.fontSize + 1) as 0 | 1 | 2 })}
            aria-label="Aumentar tamaño de texto"
            title="Aumentar tamaño de texto"
            disabled={settings.fontSize === 2}
            className="px-2 py-0.5 rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <span className="font-bold text-base" aria-hidden="true">A+</span>
          </button>

          <span className="w-px h-4 bg-white/30 mx-1" aria-hidden="true" />

          {/* Alto contraste */}
          <button
            onClick={() => update({ highContrast: !settings.highContrast })}
            aria-label={settings.highContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
            title={settings.highContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
            aria-pressed={settings.highContrast}
            className={`px-2 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-white transition flex items-center gap-1 ${
              settings.highContrast ? "bg-white/30" : "hover:bg-white/20"
            }`}
          >
            {/* Ícono sol/contraste */}
            <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3zm0 16V5a7 7 0 0 1 0 14z" />
            </svg>
            <span className="hidden sm:inline">Contraste</span>
          </button>

          {/* Escala de grises */}
          <button
            onClick={() => update({ grayscale: !settings.grayscale })}
            aria-label={settings.grayscale ? "Desactivar escala de grises" : "Activar escala de grises"}
            title={settings.grayscale ? "Desactivar escala de grises" : "Activar escala de grises"}
            aria-pressed={settings.grayscale}
            className={`px-2 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-white transition flex items-center gap-1 ${
              settings.grayscale ? "bg-white/30" : "hover:bg-white/20"
            }`}
          >
            {/* Ícono círculo mitad gris */}
            <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 3a9 9 0 0 1 0 18V3z" />
            </svg>
            <span className="hidden sm:inline">Grises</span>
          </button>

          <span className="w-px h-4 bg-white/30 mx-1" aria-hidden="true" />

          {/* Restablecer */}
          <button
            onClick={reset}
            aria-label="Restablecer opciones de accesibilidad"
            title="Restablecer opciones de accesibilidad"
            className="px-2 py-0.5 rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white transition flex items-center gap-1"
          >
            {/* Ícono reset */}
            <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="hidden sm:inline">Restablecer</span>
          </button>
        </div>
      </div>
    </>
  );
}
