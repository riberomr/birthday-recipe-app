"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X } from "lucide-react";

type SnackbarType = "success" | "error" | "info";

interface SnackbarContextType {
    showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error("useSnackbar must be used within a SnackbarProvider");
    }
    return context;
};

interface SnackbarProviderProps {
    children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [type, setType] = useState<SnackbarType>("info");

    const showSnackbar = useCallback((msg: string, snackType: SnackbarType = "info") => {
        setMessage(msg);
        setType(snackType);
        setIsOpen(true);
        setTimeout(() => {
            setIsOpen(false);
        }, 1000000);
    }, []);

    const closeSnackbar = () => setIsOpen(false);

    const getBackgroundColor = () => {
        switch (type) {
            case "success":
                return "bg-green-500";
            case "error":
                return "bg-red-500";
            default:
                return "bg-blue-500";
        }
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            {isOpen && (
                <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-full shadow-lg text-white flex items-center gap-4 z-50 min-h-[56px] max-w-[90vw] md:max-w-md ${getBackgroundColor()} transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in`}>
                    <span className="flex-1 text-center leading-tight sm:w-max">{message}</span>
                    <button onClick={closeSnackbar} className="[@media(hover:hover)]:hover:opacity-80 flex-shrink-0">
                        <X size={18} />
                    </button>
                </div>
            )}
        </SnackbarContext.Provider>
    );
};
