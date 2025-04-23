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

  // Función para extraer el código de país y el número
  const parsePhoneNumber = (fullNumber: string) => {
    // Asegurarse de que el número comience con +
    const normalizedNumber = fullNumber.startsWith('+') ? fullNumber : `+${fullNumber}`;
    // Buscar cualquier secuencia de dígitos después del +
    const match = normalizedNumber.match(/^\+(\d+)/);
    if (match) {
      const fullCode = match[1];
      // Encontrar el código de país más largo que coincida
      for (let i = Math.min(4, fullCode.length); i > 0; i--) {
        const potentialCode = fullCode.substring(0, i);
        const remainingNumber = fullCode.substring(i);
        if (Object.values(countryCodes).some(code => code === `+${potentialCode}`)) {
          return {
            countryCode: potentialCode,
            number: remainingNumber
          };
        }
      }
    }
    // Si no se puede parsear, devolver el número sin el +
    return {
      countryCode: "57", // Código por defecto para Colombia
      number: fullNumber.replace(/[^\d]/g, '')
    };
  };

  // Función para actualizar el valor completo del teléfono
  const updateFullPhoneNumber = (number: string, country: string) => {
    const cleanNumber = number.replace(/[^\d]/g, ''); // Eliminar todo excepto números
    const fullNumber = `${getCountryCode(country)}${cleanNumber}`;
    
    if (props.onChange && props.name) {
      const event = {
        target: {
          name: props.name,
          value: fullNumber,
          type: 'tel',
        },
      };
      
      props.onChange(event);
    }
  };

  // Manejar cambios en el número de teléfono
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d]/g, ''); // Solo permitir números
    setPhoneNumber(newNumber);
    updateFullPhoneNumber(newNumber, selectedCountry);
  };

  // Manejar cambios en el país seleccionado
  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    updateFullPhoneNumber(phoneNumber, code);
  };

  // Inicializar y actualizar el valor cuando cambia props.value
  useEffect(() => {
    if (props.value) {
      const parsed = parsePhoneNumber(props.value);
      setPhoneNumber(parsed.number);

      // Encontrar el código de país correspondiente
      const countryEntry = Object.entries(countryCodes).find(
        ([_, code]) => code === `+${parsed.countryCode}`
      );
      if (countryEntry) {
        setSelectedCountry(countryEntry[0]);
      }
    } else {
      setPhoneNumber("");
      setSelectedCountry("CO"); // Valor por defecto
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