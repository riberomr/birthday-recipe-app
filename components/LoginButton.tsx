"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthContext"
import { LogIn, LogOut, User as UserIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useModal } from "@/hooks/useModal"

export function LoginButton() {
    const { user, login, logout, isLoading } = useAuth()
    const pathname = usePathname()
    const isCreatingRecipe = pathname === "/recipes/create"
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
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-pink-600 dark:text-pink-400">
                    <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900 overflow-hidden border-2 border-pink-200 dark:border-pink-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={user.photoURL || ''}
                            alt={user.displayName || 'User'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="hidden sm:inline">{user.displayName}</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout()}
                    disabled={isCreatingRecipe}
                    className="text-gray-500 [@media(hover:hover)]:hover:text-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isCreatingRecipe ? "No puedes salir mientras creas una receta" : "Salir"}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Salir
                </Button>
            </div>
        )
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleLoginClick}
            className="border-pink-200 [@media(hover:hover)]:hover:bg-pink-50 text-pink-600 dark:border-pink-800 dark:[@media(hover:hover)]:hover:bg-pink-950 dark:text-pink-400"
        >
            <LogIn className="h-4 w-4 mr-2" />
            Iniciar Sesión
        </Button >
    )
}
