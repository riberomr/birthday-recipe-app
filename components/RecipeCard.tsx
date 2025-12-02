import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Recipe } from "@/types"

interface RecipeCardProps {
    recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <Link href={`/recipes/${recipe.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow border-pink-100 dark:border-pink-900/50 h-full flex flex-col">
                <div className="relative h-48 w-full bg-pink-100 dark:bg-zinc-800">
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
                </div>
                <CardHeader className="p-4 pb-2">
                    <h3 className="font-bold text-lg text-pink-600 dark:text-pink-400 line-clamp-1">
                        {recipe.title}
                    </h3>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {recipe.description}
                    </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 text-xs text-gray-500 flex items-center gap-2">
                    <Clock size={14} />
                    <span>{recipe.prep_time_minutes + recipe.cook_time_minutes} min</span>
                </CardFooter>
            </Card>
        </Link>
    )
}
