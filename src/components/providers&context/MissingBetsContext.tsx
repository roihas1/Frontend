import React, { ReactNode, createContext, useContext, useState } from "react";

interface MissingBetsContextType {
  refreshTrigger: boolean;
  triggerRefresh: () => void;
}

const MissingBetsContext = createContext<MissingBetsContextType>({
  refreshTrigger: false,
  triggerRefresh: () => {},
});

// interface MissingBetsProviderProps {
//   children: ReactNode;
// }

export const MissingBetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const triggerRefresh = () => setRefreshTrigger((prev) => !prev);

  return (
    <MissingBetsContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </MissingBetsContext.Provider>
  );
};

export const useMissingBets = () => useContext(MissingBetsContext);
