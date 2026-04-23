"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

    html.classList.remove("a11y-font-lg", "a11y-font-xl");
    if (settings.fontSize > 0) html.classList.add(FONT_CLASSES[settings.fontSize]);

    html.classList.toggle("a11y-high-contrast", settings.highContrast);
    html.classList.toggle("a11y-grayscale", settings.grayscale);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignorar
    }
  }, [settings]);

  // Cerrar con tecla Escape y devolver foco al botón
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Mover el foco al panel al abrirlo
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

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

      {/* Botón flotante */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú de accesibilidad"
        aria-expanded={open}
        aria-controls="a11y-panel"
        title="Opciones de accesibilidad"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#193DC0] text-white shadow-lg flex items-center justify-center hover:bg-[#142f99] focus:outline-none focus:ring-4 focus:ring-blue-300 transition print:hidden"
      >
        <svg
          className="w-7 h-7"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm7 5v2l-5 1v3l2 7-2 .6-2-6h-.8l-2 6L7 20l2-7v-3L4 9V7l5 1h6l4-1z" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 print:hidden"
        />
      )}

      {/* Panel lateral derecho */}
      <aside
        id="a11y-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Herramientas de accesibilidad"
        tabIndex={-1}
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50 bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 focus:outline-none print:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between bg-[#193DC0] text-white px-4 py-3">
          <h2 className="text-sm font-semibold">Accesibilidad</h2>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
            aria-label="Cerrar menú de accesibilidad"
            className="p-1 rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-5 text-sm text-gray-800 overflow-y-auto h-[calc(100%-3rem)]">
          {/* Tamaño de texto */}
          <div>
            <h3 className="font-semibold mb-2">Tamaño de texto</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => update({ fontSize: Math.max(0, settings.fontSize - 1) as 0 | 1 | 2 })}
                aria-label="Disminuir tamaño de texto"
                title="Disminuir tamaño de texto"
                disabled={settings.fontSize === 0}
                className="flex-1 px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#193DC0] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span className="font-bold" aria-hidden="true">A-</span>
              </button>
              <button
                onClick={() => update({ fontSize: 0 })}
                aria-label="Tamaño de texto normal"
                title="Tamaño de texto normal"
                aria-pressed={settings.fontSize === 0}
                className={`flex-1 px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-[#193DC0] transition ${
                  settings.fontSize === 0
                    ? "bg-[#193DC0] text-white border-[#193DC0]"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                <span className="font-bold" aria-hidden="true">A</span>
              </button>
              <button
                onClick={() => update({ fontSize: Math.min(2, settings.fontSize + 1) as 0 | 1 | 2 })}
                aria-label="Aumentar tamaño de texto"
                title="Aumentar tamaño de texto"
                disabled={settings.fontSize === 2}
                className="flex-1 px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#193DC0] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span className="font-bold text-base" aria-hidden="true">A+</span>
              </button>
            </div>
          </div>

          {/* Alto contraste */}
          <div>
            <h3 className="font-semibold mb-2">Contraste</h3>
            <button
              onClick={() => update({ highContrast: !settings.highContrast })}
              aria-label={settings.highContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
              title={settings.highContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
              aria-pressed={settings.highContrast}
              className={`w-full flex items-center justify-between px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-[#193DC0] transition ${
                settings.highContrast
                  ? "bg-[#193DC0] text-white border-[#193DC0]"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3zm0 16V5a7 7 0 0 1 0 14z" />
                </svg>
                Alto contraste
              </span>
              <span className="text-xs opacity-80">{settings.highContrast ? "ON" : "OFF"}</span>
            </button>
          </div>

          {/* Escala de grises */}
          <div>
            <h3 className="font-semibold mb-2">Escala de grises</h3>
            <button
              onClick={() => update({ grayscale: !settings.grayscale })}
              aria-label={settings.grayscale ? "Desactivar escala de grises" : "Activar escala de grises"}
              title={settings.grayscale ? "Desactivar escala de grises" : "Activar escala de grises"}
              aria-pressed={settings.grayscale}
              className={`w-full flex items-center justify-between px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-[#193DC0] transition ${
                settings.grayscale
                  ? "bg-[#193DC0] text-white border-[#193DC0]"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 3a9 9 0 0 1 0 18V3z" />
                </svg>
                Escala de grises
              </span>
              <span className="text-xs opacity-80">{settings.grayscale ? "ON" : "OFF"}</span>
            </button>
          </div>

          {/* Restablecer */}
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={reset}
              aria-label="Restablecer opciones de accesibilidad"
              title="Restablecer opciones de accesibilidad"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#193DC0] transition"
            >
              <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Restablecer
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
