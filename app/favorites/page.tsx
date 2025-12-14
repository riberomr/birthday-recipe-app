"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useSnackbar } from "@/components/ui/Snackbar";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Recipe } from "@/types";
import { RecipeCard } from "@/components/RecipeCard";
import { Loader2 } from "lucide-react";
import { getAverageRating } from "@/lib/utils";

export default function FavoritesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { showSnackbar } = useSnackbar();
    const router = useRouter();
    const [favorites, setFavorites] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            showSnackbar("Debes iniciar sesión para ver tus favoritos", "error");
            router.push("/");
        }
    }, [user, authLoading, showSnackbar, router]);

    useEffect(() => {
        async function fetchFavorites() {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from("favorites")
                    .select(`
                        recipe_id,
                        recipes (
                        *,
                        ratings (rating)
                        )
                    `)
                    .eq("user_id", user.id);

                if (error) throw error;
                console.log(data)
                // Transform data to match Recipe type (handling the join)
                const recipes = data.map((item: any) => {
                    const average_rating = getAverageRating(item.recipes.ratings)
                    return {
                        ...item.recipes,
                        average_rating
                    }
                }) as Recipe[];
                setFavorites(recipes);
            } catch (error) {
                console.error("Error fetching favorites:", error);
                showSnackbar("Error al cargar favoritos", "error");
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchFavorites();
        }
    }, [user, supabase, showSnackbar]);

    if (authLoading || (loading && user)) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
        );
    }

    if (!user) return null;

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
