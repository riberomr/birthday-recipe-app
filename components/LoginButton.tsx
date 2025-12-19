"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthContext"
import { LogIn } from "lucide-react"
import { useModal } from "@/hooks/useModal"
import { UserMenu } from "@/components/UserMenu"

export function LoginButton() {
    const { user, login, isLoading } = useAuth()
    const { open } = useModal('login-confirmation')

    const handleLoginClick = () => {
        open({
            onConfirm: async () => {
                await login()
            }
        })
    }

    if (isLoading) {
        return <Button variant="ghost" disabled>Loading...</Button>
    }

    if (user) {
        return <UserMenu />
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleLoginClick}
            className="border-primary/20 [@media(hover:hover)]:hover:bg-primary/10 text-primary"
        >
            <LogIn className="h-4 w-4 mr-2" />
            Iniciar Sesión
        </Button >
    )
}
