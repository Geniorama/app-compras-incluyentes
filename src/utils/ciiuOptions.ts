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