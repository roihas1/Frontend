import React from "react";
import { MenuItem, MenuItemProps } from "@mui/material";

interface StyledMenuItemProps extends MenuItemProps {
  onClick: () => void;
  children: React.ReactNode;
}

const StyledMenuItem: React.FC<StyledMenuItemProps> = ({
  onClick,
  children,
  ...rest
}) => {
  return (
    <MenuItem
      onClick={onClick}
      sx={{
        margin: "4px 0",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
        backgroundColor: "#f5f5f5",
        "&:hover": {
          backgroundColor: "#4A7BD8", // Brighter version of #1D428A
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          color: "white", // White text on hover for contrast
        },
      }}
      {...rest}
    >
      {children}
    </MenuItem>
  );
};

export default StyledMenuItem;
