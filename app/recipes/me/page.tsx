"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { useSnackbar } from "@/components/ui/Snackbar";
import { useRouter } from "next/navigation";
import { RecipeCard } from "@/components/RecipeCard";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyRecipes } from "@/hooks/queries/useMyRecipes";

export default function MyRecipesPage() {
    const { profile, isLoading: authLoading } = useAuth();
    const { showSnackbar } = useSnackbar();
    const router = useRouter();

    const {
        data,
        isLoading: recipesLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useMyRecipes();

    useEffect(() => {
        if (!authLoading && !profile) {
            showSnackbar("Debes iniciar sesión para ver tus recetas", "error");
            router.push("/recipes");
        }
    }, [profile, authLoading, showSnackbar, router]);

    useEffect(() => {
        if (isError) {
            showSnackbar("Error al cargar mis recetas", "error");
        }
    }, [isError, showSnackbar]);

    if (authLoading || (recipesLoading && profile)) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" data-testid="loader" />
            </div>
        );
    }

    if (!profile) return null;

    const recipes = data ? data.pages.flatMap(page => page.recipes) : [];

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
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recipes.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </div>

                    {hasNextPage && (
                        <div className="flex justify-center">
                            <Button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                variant="outline"
                            >
                                {isFetchingNextPage ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Cargando...
                                    </>
                                ) : (
                                    "Cargar más"
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
