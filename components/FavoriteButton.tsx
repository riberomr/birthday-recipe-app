"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { checkIsFavorite, toggleFavorite } from "@/lib/api/favorites";
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
    const { supabaseUser } = useAuth();
    const { showSnackbar } = useSnackbar();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (supabaseUser) {
            checkIfFavorite();
        }
    }, [supabaseUser, recipeId]);

    const checkIfFavorite = async () => {
        try {
            const isFav = await checkIsFavorite(supabaseUser!.id, recipeId);
            setIsFavorite(isFav);
        } catch (error) {
            // Ignore error
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!supabaseUser) {
            showSnackbar("Debes iniciar sesión para agregar a favoritos", "error");
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            const newStatus = await toggleFavorite(supabaseUser.id, recipeId, isFavorite);
            setIsFavorite(newStatus);
            showSnackbar(newStatus ? "Agregado a favoritos" : "Eliminado de favoritos", "success");
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
                "rounded-full [@media(hover:hover)]:hover:bg-pink-100 dark:[@media(hover:hover)]:hover:bg-pink-900/30 transition-colors",
                isFavorite ? "text-red-500 [@media(hover:hover)]:hover:text-red-600" : "text-gray-400 [@media(hover:hover)]:hover:text-pink-500",
                sizeClasses[size],
                className
            )}
            onClick={handleToggleFavorite}
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
