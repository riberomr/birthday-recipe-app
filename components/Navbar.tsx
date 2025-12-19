"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginButton } from "@/components/LoginButton"
import { ChefHat, Heart, PlusCircle } from "lucide-react"
import { useAuth } from "@/components/AuthContext"
import { Button } from "@/components/ui/button"
import { useSnackbar } from "@/components/ui/Snackbar"

import { useRouter } from "next/navigation"

export function Navbar() {
    const { user } = useAuth()
    const { showSnackbar } = useSnackbar()
    const router = useRouter()

    return (
        <nav className="nav-glass print:hidden">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 [@media(hover:hover)]:hover:opacity-80 transition-opacity">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <ChefHat className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent hidden sm:block">
                        Recetario La María
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary [@media(hover:hover)]:hover:text-primary/80 [@media(hover:hover)]:hover:bg-primary/10 min-h-[44px] min-w-[44px]"
                        aria-label="Ver favoritos"
                        onClick={() => {
                            if (!user) {
                                showSnackbar("Debes iniciar sesión para ver tus favoritos", "error");
                            } else {
                                router.push("/favorites");
                            }
                        }}
                    >
                        <Heart className="h-5 w-5 sm:mr-2" />
                        <span className="hidden sm:inline">Favoritos</span>
                    </Button>
                    {user && (
                        <Link href="/recipes/create">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary [@media(hover:hover)]:hover:text-primary/80 [@media(hover:hover)]:hover:bg-primary/10 min-h-[44px] min-w-[44px]"
                                aria-label="Crear nueva receta"
                            >
                                <PlusCircle className="h-5 w-5 sm:mr-2" />
                                <span className="hidden sm:inline">Nueva Receta</span>
                            </Button>
                        </Link>
                    )}
                    <ThemeToggle />
                    <div className="w-px h-6 bg-border" />
                    <LoginButton />
                </div>
            </div>
        </nav>
    )
}
