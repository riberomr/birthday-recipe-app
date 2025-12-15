"use client";

import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";

export function GoogleLoginButton() {
    const { login } = useAuth();

    return (
        <Button onClick={() => login()}>
            Iniciar sesión con Google
        </Button>
    );
}