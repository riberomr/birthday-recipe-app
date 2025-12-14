"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginButton } from "@/components/LoginButton"
import { ChefHat, Heart, PlusCircle } from "lucide-react"
import { useAuth } from "@/components/AuthContext"
import { Button } from "@/components/ui/button"
import { useSnackbar } from "@/components/ui/Snackbar"

export function Navbar() {
    const { user } = useAuth()
    const { showSnackbar } = useSnackbar()

    return (
        <nav className="w-full border-b border-pink-100 dark:border-pink-900/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="bg-pink-100 dark:bg-pink-900/50 p-2 rounded-full">
                        <ChefHat className="h-5 w-5 text-pink-500" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent hidden sm:block">
                        Kawaii Recipes
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-950"
                        onClick={() => {
                            if (!user) {
                                showSnackbar("Debes iniciar sesión para ver tus favoritos", "error");
                            } else {
                                window.location.href = "/favorites";
                            }
                        }}
                    >
                        <Heart className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Favoritos</span>
                    </Button>
                    {user && (
                        <Link href="/recipes/create">
                            <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-950">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Nueva Receta</span>
                            </Button>
                        </Link>
                    )}
                    <ThemeToggle />
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />
                    <LoginButton />
                </div>
            </div>
        </nav>
    )
}
