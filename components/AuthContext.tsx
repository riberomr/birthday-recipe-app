"use client"

import React, { createContext, useContext } from 'react';
import { User } from 'firebase/auth';
import { useFirebaseAuth } from '@/features/auth/hooks/useAuth';

type AuthContextType = {
    user: User | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, loading, loginWithGoogle, logout } = useFirebaseAuth();

    return (
        <AuthContext.Provider value={{ user, login: loginWithGoogle, logout, isLoading: loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
