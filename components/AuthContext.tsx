"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useFirebaseAuth } from '@/features/auth/hooks/useAuth';
import { SupabaseUser } from '@/types';

type AuthContextType = {
    user: User | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    supabaseUser: SupabaseUser | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, loading, loginWithGoogle, logout } = useFirebaseAuth();

    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    const [loadingSupabaseUser, setLoadingSupabaseUser] = useState(true);

    useEffect(() => {
        const fetchMe = async () => {
            if (user) {
                const token = await user.getIdToken();

                const response = await fetch('/api/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },

                });
                const data = await response.json();
                setLoadingSupabaseUser(false);
                setSupabaseUser(data.user);
            }
            if (!user && !loading) {
                setLoadingSupabaseUser(false);
                setSupabaseUser(null);
            }
        }
        fetchMe();
    }, [user, loading]);

    return (
        <AuthContext.Provider value={{ user, supabaseUser, login: loginWithGoogle, logout, isLoading: loading || loadingSupabaseUser }}>
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
