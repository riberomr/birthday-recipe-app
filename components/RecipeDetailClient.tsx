"use client"

import { useRecipe } from "@/hooks/queries/useRecipe"
import { useQuery } from "@tanstack/react-query"
import { getRecipeCommunityPhotos } from "@/lib/api/recipes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, ChefHat, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { DisplayRating } from "@/components/DisplayRating"
import { CommentSection } from "@/components/CommentSection"
import { DownloadButton } from "@/components/DownloadButton"
import { ShareButtons } from "@/components/ShareButtons"
import { IngredientScaler } from "@/components/IngredientScaler"
import CommunityPhotosCarousel from "@/components/CommunityRecipesPhotoCarrousel"
import { FavoriteButton } from "@/components/FavoriteButton"
import { RatingSection } from "@/components/RatingSection"
import { RecipeActionsMenu } from "@/components/RecipeActionsMenu"

interface RecipeDetailClientProps {
    id: string
}

export function RecipeDetailClient({ id }: RecipeDetailClientProps) {
    const router = useRouter()
    const { data: recipe, isLoading, isError } = useRecipe(id)

    const { data: communityPhotos } = useQuery({
        queryKey: ["recipes", id, "community-photos"],
        queryFn: () => getRecipeCommunityPhotos(id),
    })

    const showAverageRating = process.env.NEXT_PUBLIC_ENABLE_AVERAGE_RATING === 'true';

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="h-72 md:h-96 w-full bg-muted animate-pulse rounded-3xl" />
                    <div className="space-y-4">
                        <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                    </div>
                </div>
            </div>
        )
    }

    if (isError || !recipe) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Receta no encontrada 😢</h1>
                <Button onClick={() => router.push("/recipes")}>Volver a Recetas</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-32 print:bg-white print:pb-0">
            {/* Print Header - Only visible when printing */}
            <div className="hidden print:block text-center mb-8 pt-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">{recipe.title}</h1>
            </div>

            {/* Hero Image */}
            <div className="relative h-72 md:h-96 w-full bg-primary/10 dark:bg-muted print:hidden">
                {recipe.image_url ? (
                    <Image
                        src={recipe.image_url}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-6xl">
                        🥘
                    </div>
                )}
                <Link href="/recipes" className="absolute top-4 left-4 z-20">
                    <Button variant="secondary" size="icon" className="rounded-full shadow-md bg-background/80 backdrop-blur-md hover:bg-background dark:bg-background/50 dark:hover:bg-background/70 min-h-[44px] min-w-[44px]">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Volver a recetas</span>
                    </Button>
                </Link>
                <div className="absolute top-4 right-4 z-20">
                    <FavoriteButton
                        recipe={recipe}
                        className="rounded-full shadow-lg bg-white/90 backdrop-blur-md hover:bg-white dark:bg-black/60 dark:hover:bg-black/80 min-h-[44px] min-w-[44px]"
                    />
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10 print:mt-0 print:px-0 print:max-w-none">
                <div className="bg-card rounded-3xl shadow-xl p-6 border border-primary/10 dark:border-primary/20 print:shadow-none print:border-0 print:p-0">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between gap-4 print:hidden">
                            <div className="flex-1 self-center">
                                <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                                    {recipe.title}
                                </h1>

                            </div>
                            <div className="flex gap-2">
                                <RecipeActionsMenu recipeId={recipe.id} ownerId={recipe.user_id} title={recipe.title} />
                            </div>

                        </div>
                        {recipe.profile && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground flex-wrap">
                                <span>Receta compartida por:</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-primary/20">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={recipe.profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                            alt={recipe.profile?.full_name || 'Usuario'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="font-medium text-primary">
                                        {recipe.profile?.full_name || 'Usuario'}
                                    </span>
                                </div>
                            </div>
                        )}


                        {/* Print-only description styling */}
                        <p className="text-muted-foreground print:text-black print:text-lg print:mb-6">
                            {recipe.description}
                        </p>
                        <div className="flex sm:flex-row flex-col justify-between gap-6 text-sm text-muted-foreground py-4 border-t border-b border-border print:border-gray-300 print:text-black">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Prep: {recipe.prep_time_minutes}m</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ChefHat className="h-4 w-4" />
                                    <span>Cocción: {recipe.cook_time_minutes}m</span>
                                </div>
                            </div>
                            {showAverageRating && (
                                <div className="flex items-center gap-2 print:hidden">
                                    <DisplayRating rating={recipe.average_rating?.rating || 0} size="sm" showCount={false} />
                                    <span data-testid="average-rating">{recipe.average_rating?.rating} ({recipe.average_rating?.count})</span>
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-8">
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-foreground print:text-black print:border-b print:border-black print:pb-2">
                                    Ingredientes
                                </h2>
                                <IngredientScaler
                                    initialServings={recipe.servings || 4}
                                    ingredients={recipe.recipe_ingredients || []}
                                />
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-foreground print:text-black print:border-b print:border-black print:pb-2">
                                    Preparación
                                </h2>
                                <div className="space-y-4 text-muted-foreground print:text-black">
                                    {(recipe.recipe_steps || []).map((step) => (
                                        <div key={step.id} className="flex gap-4">
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold print:bg-gray-100 print:text-black print:border print:border-gray-300">
                                                {step.step_order}
                                            </div>
                                            <p className="pt-1">{step.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {recipe.recipe_nutrition && recipe.recipe_nutrition.length > 0 && (
                            <div className="mt-8 p-6 bg-primary/5 dark:bg-muted/30 rounded-2xl print:bg-transparent print:p-0 print:mt-4 print:border-t print:border-gray-300 print:pt-4">
                                <h2 className="text-xl font-bold text-foreground mb-1 print:text-black">
                                    Información Nutricional
                                </h2>
                                <p className="text-sm text-muted-foreground mb-4 print:text-gray-600">
                                    Estos son los valores aproximados por porción
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {recipe.recipe_nutrition.map((item) => (
                                        <div key={item.id} className="bg-card p-3 rounded-xl shadow-sm border border-primary/10 dark:border-primary/20 print:shadow-none print:border print:border-gray-200">
                                            <p className="text-sm text-muted-foreground print:text-gray-600">{item.name}</p>
                                            <p className="text-lg font-bold text-primary print:text-black">
                                                {item.amount} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2 print:hidden mt-4">
                            <div className="flex-1">
                                Puedes compartir o descargar la receta
                            </div>
                            <ShareButtons title={recipe.title} />
                            <DownloadButton />
                        </div>
                        {/* Social Features - Hidden on Print */}
                        <div className="mt-8 space-y-8 print:hidden">
                            <div className="border-t border-primary/10 dark:border-primary/20 pt-8">
                                <div className="flex items-center justify-between mb-6 flex-col">
                                    <h3 className="text-2xl font-bold text-primary">
                                        Fotos de la Comunidad
                                    </h3>
                                    {communityPhotos && communityPhotos.length > 0 &&
                                        <CommunityPhotosCarousel photos={communityPhotos} />
                                    }
                                    {communityPhotos && communityPhotos.length === 0 &&
                                        <div className="text-muted-foreground">
                                            No hay fotos de la comunidad
                                        </div>
                                    }
                                </div>
                            </div>

                            <div className="border-t border-primary/10 dark:border-primary/20 pt-8">
                                <RatingSection recipeId={id} initialAverageRating={recipe.average_rating} />
                                <div className="mt-12 print:hidden">
                                    <CommentSection recipeId={id} recipeOwnerId={recipe.user_id} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Floating Action Button for Cooking Mode - Hidden on Print */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-20 print:hidden">
                <Link href={`/recipes/${recipe.id}/cook`} className="w-full max-w-md">
                    <Button
                        variant="kawaii"
                        size="lg"
                        className="w-full text-lg shadow-xl py-6 rounded-2xl"
                    >
                        <Play className="mr-2 h-5 w-5 fill-current" />
                        Modo Cocina
                    </Button>
                </Link>
            </div>
        </div>
    )
}
