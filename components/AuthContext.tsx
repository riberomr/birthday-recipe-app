"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth'; // Keep this for now as FirebaseUser is our custom type but we need the raw firebase user for auth state
import { useFirebaseAuth } from '@/features/auth/hooks/useAuth';
import { FirebaseUser, Profile } from '@/types';
import { useInitProfile } from '@/hooks/queries/useInitProfile';

type AuthContextType = {
    firebaseUser: User | FirebaseUser | null; // Our custom subset
    profile: Profile | null | undefined;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, loading, loginWithGoogle, logout } = useFirebaseAuth();
    const { data: profile, isLoading: isProfileLoading } = useInitProfile(user);

    const firebaseUser: FirebaseUser | null = user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
    } : null;

    return (
        <AuthContext.Provider value={{
            firebaseUser,
            profile,
            login: loginWithGoogle,
            logout,
            isLoading: loading || (!!user && isProfileLoading)
        }}>
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
