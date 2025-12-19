"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useSnackbar } from "@/components/ui/Snackbar";
import { useRouter } from "next/navigation";
import { getFavorites } from "@/lib/api/favorites";
import { Recipe } from "@/types";
import { RecipeCard } from "@/components/RecipeCard";
import { Link, Loader2, PlusCircle } from "lucide-react";
import { getRecipes } from "@/lib/api/recipes";
import { Button } from "@/components/ui/button";

export default function MyRecipesPage() {
    const { supabaseUser, isLoading: authLoading } = useAuth();
    const { showSnackbar } = useSnackbar();
    const router = useRouter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !supabaseUser) {
            showSnackbar("Debes iniciar sesión para ver tus recetas", "error");
            router.push("/");
        }
    }, [supabaseUser, authLoading, showSnackbar, router]);

    useEffect(() => {
        async function fetchMyRecipesData(userId: string) {
            try {
                const data = await getRecipes(undefined, undefined, { user_id: userId });

                setRecipes(data.recipes);
            } catch (error) {
                console.error("Error fetching my recipes:", error);
                showSnackbar("Error al cargar mis recetas", "error");
            } finally {
                setLoading(false);
            }
        }

        if (supabaseUser) {
            fetchMyRecipesData(supabaseUser.id);
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
                Mis Recetas
            </h1>

            {recipes.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p className="text-xl">No tienes recetas creadas aún.</p>
                    <p className="mt-2">Crea una desde el siguiente botón
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-pink-600 [@media(hover:hover)]:hover:text-pink-700 [@media(hover:hover)]:hover:bg-pink-50 dark:text-pink-400 dark:[@media(hover:hover)]:hover:bg-pink-950 min-h-[44px] min-w-[44px]"
                            aria-label="Crear nueva receta"
                            onClick={() => router.push("/recipes/create")}
                        >
                            <PlusCircle className="h-5 w-5 sm:mr-2" />
                            <span className="hidden sm:inline">Nueva Receta</span>
                        </Button>
                    </p>

                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    );
}
