import Link from "next/link"
import Image from "next/image"
import { Clock, ChefHat } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Recipe } from "@/types"
import { StarRating } from "@/components/StarRating"
import { FavoriteButton } from "@/components/FavoriteButton"

interface RecipeCardProps {
    recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <Link href={`/recipes/${recipe.id}`}>
            <Card className="card-base overflow-hidden [@media(hover:hover)]:hover:shadow-lg transition-shadow h-full flex flex-col">
                <div className="relative h-48 w-full bg-muted">
                    {recipe.image_url ? (
                        <Image
                            src={recipe.image_url}
                            alt={recipe.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-4xl">
                            🥘
                        </div>
                    )}
                    <div
                        className="absolute top-2 right-2 z-10"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <FavoriteButton recipe={recipe} size="sm" className="bg-background/80 backdrop-blur-sm [@media(hover:hover)]:hover:bg-background dark:bg-background/50 dark:[@media(hover:hover)]:hover:bg-background/70 min-h-[44px] min-w-[44px]" />
                    </div>
                </div>
                <CardHeader className="p-4 pb-2">
                    <h3 className="font-bold text-lg text-primary line-clamp-1">
                        {recipe.title}
                    </h3>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {recipe.description}
                    </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col items-start gap-2">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock size={14} />
                        <span className="text-xs">{recipe.prep_time_minutes + recipe.cook_time_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <ChefHat size={14} />
                        <span className="text-xs">{recipe.cook_time_minutes} min cook</span>
                    </div>
                    <div className="mt-1 flex justify-between items-center w-full">
                        <StarRating recipeId={recipe.id} readonly size="sm" />
                        <span className="text-xs text-muted-foreground">{recipe.average_rating?.rating} ({recipe.average_rating?.count})</span>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}

