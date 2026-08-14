/**
 * Marcas de obligatorio/opcional para las etiquetas de los formularios.
 * Se usan junto a la leyenda `<RequiredLegend />` al inicio del formulario.
 */

/**
 * Asterisco rojo de campo obligatorio. Por defecto se oculta al lector de
 * pantalla, que ya anuncia la obligatoriedad por el atributo `required` del
 * control. Con `announce` se agrega el texto equivalente para los controles
 * personalizados que no lo tienen (ej. SearchableSelect).
 */
export const Required = ({ announce = false }: { announce?: boolean }) => (
  <>
    <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
    {announce && <span className="sr-only"> (obligatorio)</span>}
  </>
);

/** Aclaración de campo opcional. */
export const Optional = () => (
  <span className="text-gray-500 font-normal ml-1">(opcional)</span>
);

/** Leyenda que explica el asterisco. Va al inicio del formulario. */
export const RequiredLegend = ({ className = '' }: { className?: string }) => (
  <p className={`text-sm text-gray-500 ${className}`}>
    Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
  </p>
);
