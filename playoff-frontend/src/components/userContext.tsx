// UserContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface UserContextType {
  role: string;
  setRole: (role: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<string>('user'); // Default role

  useEffect(() => {
    // Check if the role is saved in localStorage when the app starts
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole); // Set the role from localStorage if present
    }
  }, []);

  return (
    <UserContext.Provider value={{ role, setRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
