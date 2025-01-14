import { SelectChangeEvent, Select, MenuItem } from "@mui/material";
import React from "react";

interface CustomSelectInputProps {
  id: string;
  value: string;
  label: string;
  options?: string[];
  optionsObject?: { name: string; seed: number }[];
  onChange: (event: SelectChangeEvent<string>) => void;
}

const CustomSelectInput: React.FC<CustomSelectInputProps> = ({
  id,
  value,
  label,
  options,
  optionsObject,
  onChange,
}) => {
  return (
    <Select
      id={id}
      value={value || ""}
      label={label}
      name={label}
      onChange={onChange}
      sx={{
        borderRadius: "1rem",
      }}
    >
      <MenuItem disabled>Select {label}</MenuItem>
      {/* If 'options' is passed */}
      {options &&
        options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      {/* If 'optionsObject' is passed */}
      {optionsObject &&
        optionsObject.map((option) => (
          <MenuItem key={option.name} value={option.name}>
            {option.name}
          </MenuItem>
        ))}
    </Select>
  );
};
export default CustomSelectInput;
