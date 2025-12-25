import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { LoadingProvider } from "./contexts/providers/LoadingProvider.tsx";
import App from "./App.tsx";
import store from "./services/redux/Store.ts";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <LoadingProvider>
                    <App />
                </LoadingProvider>
            </Provider>
        </BrowserRouter>
    </StrictMode>
);
