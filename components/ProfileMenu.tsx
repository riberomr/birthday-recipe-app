"use client"

import Link from "next/link"
import { useAuth } from "@/components/AuthContext"
import { useTheme } from "next-themes"
import { useModal } from "@/hooks/ui/useModal"
import {
    User,
    LogOut,
    Moon,
    Sun,
    Menu,
    HatGlasses,
    Heart,
    PlusCircle,
    Info,
    Album
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function ProfileMenu() {
    const { profile, logout } = useAuth()
    const { setTheme, theme } = useTheme()
    const { open: openLoginModal } = useModal('login-confirmation')

    const handleLoginClick = () => {
        openLoginModal({
            onConfirm: async () => {
                await login()
            }
        })
    }

    // We need the login function to pass to the modal if that's how it's wired
    const { login } = useAuth()

    const LoginItem = () => (
        <DropdownMenuItem onClick={handleLoginClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Iniciar Sesión</span>
        </DropdownMenuItem>
    )

    const toggleTheme = (e: React.MouseEvent) => {
        e.preventDefault()
        setTheme(theme === "light" ? "dark" : "light")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 md:w-auto md:px-2 rounded-full md:rounded-md">
                    {profile ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || "Usuario"} />
                                <AvatarFallback>{profile.full_name?.slice(0, 2).toUpperCase() || "US"}</AvatarFallback>
                            </Avatar>
                            <span className="hidden md:inline font-medium text-sm max-w-[100px] truncate">
                                {profile.full_name || "Usuario"}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-primary">
                            <Menu className="h-6 w-6" />
                            <span className="hidden md:inline font-medium">Menú</span>
                        </div>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {profile ? "Mi Cuenta" : "Bienvenido"}
                        </p>
                        {profile?.email && (
                            <p className="text-xs leading-none text-muted-foreground">
                                {profile.email}
                            </p>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    {profile ? (
                        <>
                            {/* <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel> */}
                            <Link href="/recipes/me">
                                <DropdownMenuItem>
                                    <Album className="mr-2 h-4 w-4" />
                                    <span>Mis Recetas</span>
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/favorites">
                                <DropdownMenuItem>
                                    <Heart className="mr-2 h-4 w-4" />
                                    <span>Favoritos</span>
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/recipes/create">
                                <DropdownMenuItem>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    <span>Crear Receta</span>
                                </DropdownMenuItem>
                            </Link>
                        </>
                    ) : (
                        <LoginItem />
                    )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuLabel>Información</DropdownMenuLabel>
                    <Link href="/about">
                        <DropdownMenuItem>
                            <Info className="mr-2 h-4 w-4" />
                            <span>Sobre Nosotros</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/privacy">
                        <DropdownMenuItem>
                            <HatGlasses className="mr-2 h-4 w-4" />
                            <span>Privacidad</span>
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuLabel>Ajustes</DropdownMenuLabel>
                    <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        onClick={toggleTheme}
                        className="justify-between"
                    >
                        <div className="flex items-center">
                            {theme === 'dark' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                            <span>Modo Oscuro</span>
                        </div>
                        {/* Visual toggle switch indicator */}
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </DropdownMenuItem>

                    {profile && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                                onClick={() => logout()}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Cerrar Sesión</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
