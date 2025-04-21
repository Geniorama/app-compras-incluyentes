import { TextInput } from "flowbite-react";
import ReactFlagsSelect from "react-flags-select";
import { useState, useEffect } from "react";
import countryCodes from "@/utils/countryCodes";
import { TextInputProps } from "flowbite-react";
import { ChangeHandler } from "react-hook-form";

interface InternationalPhoneInputProps extends Omit<TextInputProps, "onChange"> {
  onChange?: ChangeHandler;
  value?: string;
  name?: string;
}

export default function InternationalPhoneInput(props: InternationalPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState("CO");
  const [phoneNumber, setPhoneNumber] = useState("");

  const getCountryCode = (countryCode: string) => {
    return countryCodes[countryCode] || "+57"; // Por defecto Colombia
  };

  // Función para actualizar el valor completo del teléfono
  const updateFullPhoneNumber = (number: string, country: string) => {
    const cleanNumber = number.replace(/^0+/, ''); // Eliminar ceros al inicio
    const fullNumber = `${getCountryCode(country)}${cleanNumber}`;
    
    if (props.onChange && props.name) {
      const event = {
        target: {
          name: props.name,
          value: fullNumber,
          type: 'tel',
        },
      } as React.ChangeEvent<HTMLInputElement>;
      
      props.onChange(event);
    }
  };

  // Manejar cambios en el número de teléfono
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/\D/g, ''); // Solo permitir números
    setPhoneNumber(newNumber);
    updateFullPhoneNumber(newNumber, selectedCountry);
  };

  // Manejar cambios en el país seleccionado
  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    updateFullPhoneNumber(phoneNumber, code);
  };

  // Inicializar el valor si se proporciona
  useEffect(() => {
    if (props.value) {
      // Extraer el número sin el código de país
      const match = props.value.match(/^\+\d{1,4}(.*)$/);
      if (match) {
        setPhoneNumber(match[1]);
      } else {
        setPhoneNumber(props.value.replace(/\D/g, '')); // Limpiar no números
      }
    }
  }, [props.value]);

  return (
    <div className="flex gap-2">
      <div className="flex items-center">
        <ReactFlagsSelect
          selected={selectedCountry}
          onSelect={handleCountryChange}
          className="w-20 custom-dropdown-width"
          searchable
          searchPlaceholder="Buscar"
          showOptionLabel={true}
          showSelectedLabel={false}
          placeholder="Selecciona un país"
          optionsSize={12}
          aria-label="Selecciona un país"
        />
        <span className="ml-2 text-gray-600">
          {getCountryCode(selectedCountry)}
        </span>
      </div>

      <TextInput
        {...props}
        value={phoneNumber}
        onChange={handlePhoneChange}
        type="tel"
        pattern="[0-9]*"
        inputMode="numeric"
        className="flex-grow"
        placeholder="Número sin código de país"
      />
    </div>
  );
}