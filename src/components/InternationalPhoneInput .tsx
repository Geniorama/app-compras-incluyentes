import { TextInput } from "flowbite-react";
import ReactFlagsSelect from "react-flags-select";
import { useState } from "react";
import countryCodes from "@/utils/countryCodes";

export default function InternationalPhoneInput() {
  // Estado para almacenar el código del país seleccionado
  const [selectedCountry, setSelectedCountry] = useState("US");

  // Función para obtener el código de teléfono basado en el país seleccionado
  const getCountryCode = (countryCode: string) => {
    return countryCodes[countryCode] // Valor por defecto si no se encuentra el código
  };

  return (
    <div className="flex gap-2">
      {/* Selector de banderas */}
      <div className="flex items-center">
        <ReactFlagsSelect
          selected={selectedCountry}
          onSelect={(code) => setSelectedCountry(code)}
          className="w-20 custom-dropdown-width"
          searchable
          showOptionLabel={true}
          showSelectedLabel={false}
          placeholder="Selecciona un país"
          optionsSize={12}
          
        />
        <span className="ml-2 text-gray-600">
          {getCountryCode(selectedCountry)}
        </span>
      </div>

      {/* Campo de número de teléfono */}
      <TextInput
        id="phone-number"
        placeholder="Número de teléfono"
        required
        color="blue"
        className="flex-grow"
        theme={{
          field: {
            input: {
              base: "border-slate-200 focus:border-blue-600 w-full",
            },
          },
        }}
      />
    </div>
  );
}