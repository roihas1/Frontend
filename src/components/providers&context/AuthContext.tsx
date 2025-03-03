// src/components/providers&context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthStatus: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  // Function to check authentication status
  const checkAuthStatus = () => {
    const token = Cookies.get("auth_token");
    setIsLoggedIn(!!token); // True if token exists, false otherwise
  };

  // Initial check on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const logout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("tokenExpiry");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, checkAuthStatus, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
