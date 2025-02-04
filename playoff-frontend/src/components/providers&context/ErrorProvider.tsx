import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context type
interface ErrorContextType {
  showError: (message: string) => void;
}

// Create the ErrorContext with a default value of null
const ErrorContext = createContext<ErrorContextType | null>(null);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Function to show error messages
  const showError = (message: string) => {
    setError(message);
    setOpen(true);
    setTimeout(() => {
      setOpen(false);
    }, 5000); // Display for 5 seconds
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      {open && error && (
        <div className="fixed top-4 right-4 z-50 max-w-xs w-full p-4 mb-4 text-sm text-colors-nba-red border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800">
          <div className="flex items-start justify-between">
            {/* Error Message */}
            <div className="flex-1 space-y-1">
              <p className="font-medium">{error}</p>
            </div>

            {/* Close Button */}
            <div className="flex-shrink-0 ml-3">
              <button
                onClick={handleClose}
                className="p-2 text-red-800 bg-red-200 rounded-full hover:bg-red-300 focus:outline-none dark:text-red-400 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
};

// Custom hook to use the error context
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
