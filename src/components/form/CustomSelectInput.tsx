import { SelectChangeEvent, Select, MenuItem } from "@mui/material";
import React, { useState } from "react";

interface CustomSelectInputProps {
  id: string;
  value: string;
  label: string;
  options?: string[];
  optionsObject?: { name: string; seed: number }[] ;
  optionsForCompare?: { id: string; name: string }[];
  onChange: (event: SelectChangeEvent<string>) => void;
  isDisabled?: boolean;
  searchBar?: boolean;
}

const CustomSelectInput: React.FC<CustomSelectInputProps> = ({
  id,
  value,
  label,
  options,
  optionsObject,
  optionsForCompare,
  onChange,
  isDisabled,
 
}) => {
 
  const [open, setOpen] = useState<boolean>(false);
  
    const handleOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };

    
  return (
    <Select
      id={id}
      value={value || ""}
      label={"Select" +label}
      name={label}
      onChange={onChange}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      sx={{
        borderRadius: "1rem",
      }}
      MenuProps={{
        PaperProps: {
          style: {
            maxHeight: 300,
          },
        },
      }}
      disabled={isDisabled}
    >
      <MenuItem disabled>{options?.length === 0 ? label :"Select"} </MenuItem>

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
        {optionsForCompare && 
        optionsForCompare.map((option) => (
          <MenuItem key={option.name} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
    </Select>
  );
};
export default CustomSelectInput;
