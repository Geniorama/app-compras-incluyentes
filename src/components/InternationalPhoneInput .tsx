import { TextInput } from "flowbite-react";
import ReactFlagsSelect from "react-flags-select";
import { useState } from "react";
import countryCodes from "@/utils/countryCodes";
import { TextInputProps } from "flowbite-react";
import { ChangeHandler } from "react-hook-form";

interface InternationalPhoneInputProps extends Omit<TextInputProps, "onChange"> {
  onChange?: ChangeHandler; // Acepta un ChangeHandler de react-hook-form
  value?: string; // Prop para manejar el valor inicial
}

export default function InternationalPhoneInput(props: InternationalPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState("CO");
  const [phoneNumber, setPhoneNumber] = useState(props.value || "");

  const getCountryCode = (countryCode: string) => {
    return countryCodes[countryCode] || "+00"; // Valor predeterminado
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value;
    setPhoneNumber(phoneNumber);

    // Llama al ChangeHandler proporcionado por react-hook-form
    if (props.onChange) {
      props.onChange({
        target: {
          value: `${getCountryCode(selectedCountry)}${phoneNumber}`,
        },
        type: "change",
      });
    }
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

      {/* Campo de número de teléfono */}
      <TextInput
        {...props}
        className="flex-grow"
        value={phoneNumber}
        onChange={handlePhoneChange}
      />
    </div>
  );
}