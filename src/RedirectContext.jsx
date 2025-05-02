import React, { createContext, useContext, useState } from "react";

// Creazione del contesto
const RedirectContext = createContext();

// Provider che gestisce lo stato
export const RedirectProvider = ({ children }) => {
    const [redirectSessionId, setRedirectSessionId] = useState(null);

    return (
        <RedirectContext.Provider value={{ redirectSessionId, setRedirectSessionId }}>
            {children}
        </RedirectContext.Provider>
    );
};

// Hook personalizzato per usare facilmente il contesto
export const useRedirect = () => {
    return useContext(RedirectContext);
};