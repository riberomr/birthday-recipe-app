"use client";

import { useAuth } from "@/components/AuthContext";
import { useSnackbar } from "@/components/ui/Snackbar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Recipe } from "@/types";
import { useFavorites } from "@/hooks/queries/useFavorites";
import { useToggleFavorite } from "@/hooks/mutations/useToggleFavorite";

interface FavoriteButtonProps {
    recipe: Recipe;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function FavoriteButton({ recipe, className, size = "md" }: FavoriteButtonProps) {
    const { supabaseUser } = useAuth();
    const { showSnackbar } = useSnackbar();

    const { data: favorites } = useFavorites(supabaseUser?.id);
    const { mutate: toggleFav, isPending } = useToggleFavorite();

    const isFavorite = favorites?.some(r => r.id === recipe.id) ?? false;

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!supabaseUser) {
            showSnackbar("Debes iniciar sesión para agregar a favoritos", "error");
            return;
        }

        toggleFav(recipe, {
            onSuccess: () => {
                showSnackbar(isFavorite ? "Eliminado de favoritos" : "Agregado a favoritos", "success");
            },
            onError: () => {
                showSnackbar("Error al actualizar favoritos", "error");
            }
        });
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
                "rounded-full [@media(hover:hover)]:hover:bg-primary/10 transition-colors",
                isFavorite ? "text-destructive [@media(hover:hover)]:hover:text-destructive/90" : "text-muted-foreground [@media(hover:hover)]:hover:text-primary",
                sizeClasses[size],
                className
            )}
            onClick={handleToggleFavorite}
            disabled={isPending}
        >
            <Heart
                className={cn(
                    iconSizes[size],
                    isFavorite ? "fill-current" : ""
                )}
            />
        </Button>
    );
}
