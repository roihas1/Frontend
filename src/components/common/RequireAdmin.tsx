import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../providers&context/userContext";

interface RequireAdminProps {
  children: React.ReactNode;
}

const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const { role } = useUser();
  const isAdmin = role === "ADMIN";

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
