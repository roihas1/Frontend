import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context type
interface SuccessMessageContextType {
  showSuccessMessage: (message: string) => void;
}

// Create the SuccessMessageContext with a default value of null
const SuccessMessageContext = createContext<SuccessMessageContextType | null>(null);

interface SuccessMessageProviderProps {
  children: ReactNode;
}

export const SuccessMessageProvider: React.FC<SuccessMessageProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Function to show success messages
  const showSuccessMessage = (message: string) => {
    setMessage(message);
    setOpen(true);
    setTimeout(() => {
      setOpen(false);
    }, 5000); // Display for 5 seconds
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <SuccessMessageContext.Provider value={{ showSuccessMessage }}>
      {children}
      {open && message && (
        <div className="fixed top-4 right-4 z-50 max-w-xs w-full p-4 mb-4 text-sm text-green-700 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800">
          <div className="flex items-start justify-between">
            {/* Success Message */}
            <div className="flex-1 space-y-1">
              <p className="font-medium">{message}</p>
            </div>

            {/* Close Button */}
            <div className="flex-shrink-0 ml-3">
              <button
                onClick={handleClose}
                className="p-2 text-green-800 bg-green-200 rounded-full hover:bg-green-300 focus:outline-none dark:text-green-400 dark:bg-gray-700 dark:hover:bg-gray-600"
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
    </SuccessMessageContext.Provider>
  );
};

// Custom hook to use the success message context
export const useSuccessMessage = () => {
  const context = useContext(SuccessMessageContext);
  if (!context) {
    throw new Error('useSuccessMessage must be used within a SuccessMessageProvider');
  }
  return context;
};
