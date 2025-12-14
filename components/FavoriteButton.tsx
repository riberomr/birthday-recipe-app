"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthContext";
import { useSnackbar } from "@/components/ui/Snackbar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
    recipeId: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function FavoriteButton({ recipeId, className, size = "md" }: FavoriteButtonProps) {
    const { user } = useAuth();
    const { showSnackbar } = useSnackbar();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkIfFavorite();
        }
    }, [user, recipeId]);

    const checkIfFavorite = async () => {
        try {
            const { data, error } = await supabase
                .from("favorites")
                .select("*")
                .eq("user_id", user?.id)
                .eq("recipe_id", recipeId)
                .single();

            if (data) {
                setIsFavorite(true);
            }
        } catch (error) {
            // Ignore error if not found (it just means it's not a favorite)
        }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            showSnackbar("Debes iniciar sesión para agregar a favoritos", "error");
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            if (isFavorite) {
                const { error } = await supabase
                    .from("favorites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("recipe_id", recipeId);

                if (error) throw error;
                setIsFavorite(false);
                showSnackbar("Eliminado de favoritos", "success");
            } else {
                const { error } = await supabase
                    .from("favorites")
                    .insert([{ user_id: user.id, recipe_id: recipeId }]);

                if (error) throw error;
                setIsFavorite(true);
                showSnackbar("Agregado a favoritos", "success");
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            showSnackbar("Error al actualizar favoritos", "error");
        } finally {
            setLoading(false);
        }
    };

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12"
    };

    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6"
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors",
                isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-pink-500",
                sizeClasses[size],
                className
            )}
            onClick={toggleFavorite}
            disabled={loading}
        >
            <Heart
                className={cn(
                    iconSizes[size],
                    isFavorite ? "fill-current" : "",
                    loading ? "animate-pulse" : ""
                )}
            />
        </Button>
    );
}
