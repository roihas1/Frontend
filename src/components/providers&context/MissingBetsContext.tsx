import React, { ReactNode, createContext, useContext, useState } from "react";

interface MissingBetsContextType {
  refreshTrigger: boolean;
  triggerRefresh: () => void;
  missingBetsCount: number;
  setMissingBetsCount: (count: number) => void;
}

const MissingBetsContext = createContext<MissingBetsContextType>({
  refreshTrigger: false,
  triggerRefresh: () => {},
  missingBetsCount: 0,
  setMissingBetsCount: () => {},
});

// interface MissingBetsProviderProps {
//   children: ReactNode;
// }

export const MissingBetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [missingBetsCount, setMissingBetsCount] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => !prev);

  return (
    <MissingBetsContext.Provider
      value={{
        refreshTrigger,
        triggerRefresh,
        missingBetsCount,
        setMissingBetsCount,
      }}
    >
      {children}
    </MissingBetsContext.Provider>
  );
};

export const useMissingBets = () => useContext(MissingBetsContext);
