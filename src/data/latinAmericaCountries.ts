/**
 * Lista de países Latinoamericanos para formularios de registro.
 * Usado en: información empresarial (países de operación) e información personal (país del usuario).
 */
export const LATIN_AMERICA_COUNTRIES = [
  { title: 'Argentina', value: 'AR' },
  { title: 'Belice', value: 'BZ' },
  { title: 'Bolivia', value: 'BO' },
  { title: 'Brasil', value: 'BR' },
  { title: 'Chile', value: 'CL' },
  { title: 'Colombia', value: 'CO' },
  { title: 'Costa Rica', value: 'CR' },
  { title: 'Cuba', value: 'CU' },
  { title: 'República Dominicana', value: 'DO' },
  { title: 'Ecuador', value: 'EC' },
  { title: 'El Salvador', value: 'SV' },
  { title: 'Guatemala', value: 'GT' },
  { title: 'Guyana', value: 'GY' },
  { title: 'Haití', value: 'HT' },
  { title: 'Honduras', value: 'HN' },
  { title: 'México', value: 'MX' },
  { title: 'Nicaragua', value: 'NI' },
  { title: 'Panamá', value: 'PA' },
  { title: 'Paraguay', value: 'PY' },
  { title: 'Perú', value: 'PE' },
  { title: 'Puerto Rico', value: 'PR' },
  { title: 'Surinam', value: 'SR' },
  { title: 'Uruguay', value: 'UY' },
  { title: 'Venezuela', value: 'VE' },
] as const;

export type LatinAmericaCountryCode = typeof LATIN_AMERICA_COUNTRIES[number]['value'];
