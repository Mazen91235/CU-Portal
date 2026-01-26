import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import store from "./services/redux/Store.ts";
import { LoadingProvider } from "./contexts/providers/LoadingProvider.tsx";
import { Toasts } from "./components/toast/Toast.tsx";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <HelmetProvider>
                    <LoadingProvider>
                        <Toasts />
                        <App />
                    </LoadingProvider>
                </HelmetProvider>
            </Provider>
        </BrowserRouter>
    </StrictMode>,
);
