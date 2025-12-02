import { getRecipe } from "@/lib/getRecipes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, ChefHat, Play } from "lucide-react"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

interface RecipePageProps {
    params: Promise<{
        id: string
    }>
}
export default async function RecipePage({ params }: RecipePageProps) {
    const { id } = await params

    const recipe = await getRecipe(id)

    if (!recipe) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 pb-20">
            {/* Hero Image */}
            <div className="relative h-72 md:h-96 w-full bg-pink-100 dark:bg-zinc-800">
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
                <Link href="/recipes" className="absolute top-4 left-4">
                    <Button variant="secondary" size="icon" className="rounded-full shadow-md">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
            </div>

            <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-6 border border-pink-100 dark:border-pink-900/50">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                                {recipe.title}
                            </h1>
                            {recipe.recipe_categories && (
                                <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                    {recipe.recipe_categories.name}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300">
                            {recipe.description}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 py-4 border-t border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Prep: {recipe.prep_time_minutes}m</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ChefHat className="h-4 w-4" />
                                <span>Cocción: {recipe.cook_time_minutes}m</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                Ingredientes
                            </h2>
                            <ul className="space-y-2">
                                {recipe.recipe_ingredients?.map((ingredient) => (
                                    <li
                                        key={ingredient.id}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-pink-50/50 dark:bg-zinc-800/50"
                                    >
                                        <div className="h-2 w-2 mt-2 rounded-full bg-pink-400 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">{ingredient.amount}</span>{" "}
                                            {ingredient.name}
                                            {ingredient.optional && (
                                                <span className="text-gray-400 text-sm ml-2">
                                                    (Opcional)
                                                </span>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                Preparación
                            </h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-300">
                                {recipe.recipe_steps?.map((step) => (
                                    <div key={step.id} className="flex gap-4">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
                                            {step.step_order}
                                        </div>
                                        <p className="pt-1">{step.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button for Cooking Mode */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-20">
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
