"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthContext"
import { LogIn, LogOut, User as UserIcon } from "lucide-react"
import { usePathname } from "next/navigation"

export function LoginButton() {
    const { user, login, logout, isLoading } = useAuth()
    const pathname = usePathname()
    const isCreatingRecipe = pathname === "/recipes/create"

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
                            src={user.user_metadata.avatar_url}
                            alt={user.user_metadata.full_name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="hidden sm:inline">{user.user_metadata.full_name}</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout()}
                    disabled={isCreatingRecipe}
                    className="text-gray-500 hover:text-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={() => login()}
            className="border-pink-200 hover:bg-pink-50 text-pink-600 dark:border-pink-800 dark:hover:bg-pink-950 dark:text-pink-400"
        >
            <LogIn className="h-4 w-4 mr-2" />
            Entrar con Google
        </Button>
    )
}
