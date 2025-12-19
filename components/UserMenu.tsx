"use client"

import { useAuth } from "@/components/AuthContext"
import { usePathname, useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, LogOut, BookOpenCheck } from "lucide-react"

export function UserMenu() {
    const { user, logout } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    const isCreatingRecipe = pathname === "/recipes/create"

    if (!user) return null

    const handleLogout = () => {
        if (isCreatingRecipe) {
            return // Don't allow logout while creating recipe
        }
        logout()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-primary [@media(hover:hover)]:hover:opacity-80 transition-opacity outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg px-2 py-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden border-2 border-primary/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={user.displayName || 'User'}
                        className="w-full h-full object-cover"
                    />
                </div>
                <span className="hidden sm:inline">{user.displayName}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                    onClick={() => router.push('/recipes/me')}
                    className="cursor-pointer [@media(hover:hover)]:hover:bg-primary/10"
                >
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    <span>Mis Recetas</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => router.push('/favorites')}
                    className="cursor-pointer [@media(hover:hover)]:hover:bg-primary/10"
                >
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Favoritos</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isCreatingRecipe}
                    className="cursor-pointer [@media(hover:hover)]:hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isCreatingRecipe ? "No puedes salir mientras creas una receta" : "Cerrar sesión"}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
