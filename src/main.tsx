import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerSW } from "virtual:pwa-register";
import { getErrorMessage } from "./api/getErrorMessage";
import { notify } from "./components/common/notify";

registerSW({ immediate: true });

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const fallback = query.meta?.errorMessage;
      if (typeof fallback !== "string" || fallback.length === 0) {
        return;
      }
      const message = getErrorMessage(error, fallback);
      if (message) {
        notify.error(message);
      }
    },
  }),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
