"use client";

import { useState } from "react";
import { RecipeIngredient } from "@/types";
import { Minus, Plus, Users } from "lucide-react";
import { scaleAmount } from "@/lib/utils";

interface IngredientScalerProps {
    initialServings: number;
    ingredients: RecipeIngredient[];
}

export function IngredientScaler({ initialServings, ingredients }: IngredientScalerProps) {
    const [servings, setServings] = useState(initialServings);

    const factor = servings / initialServings;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 bg-pink-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Porciones:</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setServings(servings - 1)}
                        className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors disabled:opacity-50"
                        disabled={servings === 1}
                    >
                        <Minus />
                    </button>
                    <span
                        className="h-10 w-10 border-pink-200 focus-visible:ring-pink-400 bg-white dark:bg-zinc-900 flex items-center justify-center rounded-full"
                    >
                        {servings}
                    </span>
                    <button
                        type="button"
                        onClick={() => setServings(servings + 1)}
                        className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
                    >
                        <Plus />
                    </button>
                </div>
            </div>

            <ul className="space-y-2">
                {ingredients.map((ingredient) => (
                    <li
                        key={ingredient.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-pink-50/50 dark:bg-zinc-800/50 print:bg-transparent print:p-0 print:border-b print:border-gray-100"
                    >
                        <div className="h-2 w-2 mt-2 rounded-full bg-pink-400 flex-shrink-0 print:bg-black" />
                        <span className="text-gray-700 dark:text-gray-300 print:text-black">
                            <span className="font-medium">{scaleAmount(ingredient.amount, factor)}</span>{" "}
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
    );
}
