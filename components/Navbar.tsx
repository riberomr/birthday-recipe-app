"use client"

import Link from "next/link"
import { ChefHat } from "lucide-react"
import { ProfileMenu } from "@/components/ProfileMenu"

export function Navbar() {
    return (
        <nav className="nav-glass print:hidden">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/recipes" className="flex items-center gap-2 [@media(hover:hover)]:hover:opacity-80 transition-opacity">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <ChefHat className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent hidden sm:block">
                        Recetario La María
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <ProfileMenu />
                </div>
            </div>
        </nav>
    )
}
