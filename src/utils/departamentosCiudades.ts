import cities from "@/data/cities";

export interface Option {
  value: string;
  label: string;
}

// Normaliza un string para usarlo como value
function normalizeValue(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Obtiene la lista de departamentos como { value, label }
export function getDepartamentosOptions(): Option[] {
  return cities.map(dep => ({
    value: normalizeValue(dep.departamento),
    label: dep.departamento
  }));
}

// Obtiene la lista de ciudades de un departamento (por value) como { value, label }
export function getCiudadesOptionsByDepartamento(departamentoValue: string): Option[] {
  const dep = cities.find(
    d => normalizeValue(d.departamento) === departamentoValue
  );
  if (!dep) return [];
  return dep.ciudades.map(ciudad => ({
    value: normalizeValue(ciudad),
    label: ciudad
  }));
}

// Obtiene el label de un departamento a partir de su value
export function getDepartamentoLabel(value: string): string | undefined {
  const dep = cities.find(d => normalizeValue(d.departamento) === value);
  return dep?.departamento;
}

// Obtiene el label de una ciudad a partir de su value y departamento
export function getCiudadLabel(departamentoValue: string, ciudadValue: string): string | undefined {
  const dep = cities.find(d => normalizeValue(d.departamento) === departamentoValue);
  if (!dep) return undefined;
  const ciudad = dep.ciudades.find(c => normalizeValue(c) === ciudadValue);
  return ciudad;
} 