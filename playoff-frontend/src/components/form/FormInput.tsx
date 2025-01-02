import React from "react";

interface FormInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  required = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700" htmlFor={id}>
      {label}
    </label>
    <input
      type={type}
      id={id}
      className="w-full p-3 mt-1 border border-gray-300 rounded-2xl"
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
);

export default FormInput;
