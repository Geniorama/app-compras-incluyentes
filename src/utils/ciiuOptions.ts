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
  return dataCIIU.find(item => item.clasificacion_ciiu === value);
}; 