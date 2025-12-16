"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useSnackbar } from "@/components/ui/Snackbar";
import { useRouter } from "next/navigation";
import { getFavorites } from "@/lib/api/favorites";
import { Recipe } from "@/types";
import { RecipeCard } from "@/components/RecipeCard";
import { Loader2 } from "lucide-react";

export default function FavoritesPage() {
    const { supabaseUser, isLoading: authLoading } = useAuth();
    const { showSnackbar } = useSnackbar();
    const router = useRouter();
    const [favorites, setFavorites] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !supabaseUser) {
            showSnackbar("Debes iniciar sesión para ver tus favoritos", "error");
            router.push("/");
        }
    }, [supabaseUser, authLoading, showSnackbar, router]);
    useEffect(() => {
        async function fetchFavoritesData() {
            if (!supabaseUser) return;

            try {
                const data = await getFavorites(supabaseUser.id);

                setFavorites(data);
            } catch (error) {
                console.error("Error fetching favorites:", error);
                showSnackbar("Error al cargar favoritos", "error");
            } finally {
                setLoading(false);
            }
        }

        if (supabaseUser) {
            fetchFavoritesData();
        }
    }, [supabaseUser, showSnackbar]);

    if (authLoading || (loading && supabaseUser)) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
        );
    }

    if (!supabaseUser) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Mis Favoritos
            </h1>

            {favorites.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p className="text-xl">No tienes recetas favoritas aún.</p>
                    <p className="mt-2">¡Explora y guarda las que más te gusten!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    );
}
