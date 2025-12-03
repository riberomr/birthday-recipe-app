import { getRecipe } from "@/lib/getRecipes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, ChefHat, Play, Camera } from "lucide-react"
import { notFound } from "next/navigation"
import { StarRating } from "@/components/StarRating"
import { CommentSection } from "@/components/CommentSection"
import { DownloadButton } from "@/components/DownloadButton"

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
        <div className="min-h-screen bg-white dark:bg-zinc-950 pb-20 print:bg-white print:pb-0">
            {/* Print Header - Only visible when printing */}
            <div className="hidden print:block text-center mb-8 pt-8">
                <h1 className="text-4xl font-bold text-black mb-2">{recipe.title}</h1>
                <p className="text-gray-600 italic">Una receta de Kawaii Recipes</p>
            </div>

            {/* Hero Image */}
            <div className="relative h-72 md:h-96 w-full bg-pink-100 dark:bg-zinc-800 print:hidden">
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

            <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10 print:mt-0 print:px-0 print:max-w-none">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-6 border border-pink-100 dark:border-pink-900/50 print:shadow-none print:border-0 print:p-0">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4 print:hidden">
                            <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                                {recipe.title}
                            </h1>
                            <div className="flex gap-2">
                                <DownloadButton />
                            </div>
                        </div>

                        {/* Print-only description styling */}
                        <p className="text-gray-600 dark:text-gray-300 print:text-black print:text-lg print:mb-6">
                            {recipe.description}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 py-4 border-t border-b border-gray-100 dark:border-gray-800 print:border-gray-300 print:text-black">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Prep: {recipe.prep_time_minutes}m</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ChefHat className="h-4 w-4" />
                                <span>Cocción: {recipe.cook_time_minutes}m</span>
                            </div>
                            <div className="flex items-center gap-2 print:hidden">
                                <StarRating recipeId={id} rating={4} readonly size="sm" />
                                <span>(4.0)</span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-8">
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 print:text-black print:border-b print:border-black print:pb-2">
                                    Ingredientes
                                </h2>
                                <ul className="space-y-2">
                                    {recipe.recipe_ingredients?.map((ingredient) => (
                                        <li
                                            key={ingredient.id}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-pink-50/50 dark:bg-zinc-800/50 print:bg-transparent print:p-0 print:border-b print:border-gray-100"
                                        >
                                            <div className="h-2 w-2 mt-2 rounded-full bg-pink-400 flex-shrink-0 print:bg-black" />
                                            <span className="text-gray-700 dark:text-gray-300 print:text-black">
                                                <span className="font-medium">{ingredient.amount}</span>{" "}
                                                {ingredient.name}
                                                {ingredient.optional && (
                                                    <span className="text-gray-400 text-sm ml-2 print:text-gray-600">
                                                        (Opcional)
                                                    </span>
                                                )}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 print:text-black print:border-b print:border-black print:pb-2">
                                    Preparación
                                </h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-300 print:text-black">
                                    {recipe.recipe_steps?.map((step) => (
                                        <div key={step.id} className="flex gap-4">
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold print:bg-gray-100 print:text-black print:border print:border-gray-300">
                                                {step.step_order}
                                            </div>
                                            <p className="pt-1">{step.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {recipe.recipe_nutrition && recipe.recipe_nutrition.length > 0 && (
                            <div className="mt-8 p-6 bg-pink-50/50 dark:bg-zinc-800/30 rounded-2xl print:bg-transparent print:p-0 print:mt-4 print:border-t print:border-gray-300 print:pt-4">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 print:text-black">
                                    Información Nutricional
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {recipe.recipe_nutrition.map((item) => (
                                        <div key={item.id} className="bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-sm border border-pink-100 dark:border-pink-900/50 print:shadow-none print:border print:border-gray-200">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">{item.name}</p>
                                            <p className="text-lg font-bold text-pink-600 dark:text-pink-400 print:text-black">
                                                {item.amount} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Social Features - Hidden on Print */}
                        <div className="mt-12 space-y-8 print:hidden">
                            <div className="border-t border-pink-100 dark:border-pink-900/50 pt-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                                        Fotos de la Comunidad
                                    </h3>
                                    <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                                        <Camera className="mr-2 h-4 w-4" />
                                        Subir Foto
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {/* Placeholder for community photos */}
                                    <div className="aspect-square rounded-xl bg-pink-50 dark:bg-zinc-800 flex items-center justify-center text-pink-200">
                                        <Camera size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-pink-100 dark:border-pink-900/50 pt-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                                        Calificar Receta
                                    </h3>
                                    <StarRating recipeId={id} size="lg" />
                                </div>
                                <CommentSection recipeId={id} />
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
