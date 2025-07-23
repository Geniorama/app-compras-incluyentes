import dataCIIU from '@/data/ciiu';

export interface CIIUOption {
  value: string;
  label: string;
}

export const getCIIUOptions = (): CIIUOption[] => {
  return dataCIIU.map(item => ({
    value: item.clasificacion_ciiu,
    label: item.clasificacion_ciiu
  }));
};

export const findCIIUByValue = (value: string): CIIUOption | undefined => {
  const found = dataCIIU.find(item => item.clasificacion_ciiu === value);
  if (found) {
    return {
      value: found.clasificacion_ciiu,
      label: found.clasificacion_ciiu
    };
  }
  return undefined;
};

// Determina el sector a partir del código CIIU
export function getSectorFromCIIU(clasificacion_ciiu: string): 'COMERCIO' | 'MANUFACTURA' | 'SERVICIOS' | undefined {
  // El código CIIU está al inicio, por ejemplo: G4511 ** ...
  const code = clasificacion_ciiu.trim().charAt(0).toUpperCase();
  if (code === 'G') return 'COMERCIO';
  if (code === 'C') return 'MANUFACTURA';
  // Servicios: H, I, J, K, L, M, N, O, P, Q, R, S
  if ('HIJKLMNOPQRS'.includes(code)) return 'SERVICIOS';
  return undefined;
} 