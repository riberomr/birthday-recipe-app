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
            <div className="flex items-center gap-4 bg-primary/5 dark:bg-muted/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-primary">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Porciones:</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setServings(servings - 1)}
                        className="p-2 rounded-full bg-primary/10 text-primary [@media(hover:hover)]:hover:bg-primary/20 transition-colors disabled:opacity-50 print:hidden"
                        disabled={servings === 1}
                    >
                        <Minus />
                    </button>
                    <span
                        className="h-10 w-10 border border-primary/20 focus-visible:ring-primary bg-background flex items-center justify-center rounded-full"
                    >
                        {servings}
                    </span>
                    <button
                        type="button"
                        onClick={() => setServings(servings + 1)}
                        className="p-2 rounded-full bg-primary/10 text-primary [@media(hover:hover)]:hover:bg-primary/20 transition-colors print:hidden"
                    >
                        <Plus />
                    </button>
                </div>
            </div>

            <ul className="space-y-2">
                {ingredients.map((ingredient) => (
                    <li
                        key={ingredient.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 dark:bg-muted/50 print:bg-transparent print:p-0 print:border-b print:border-border"
                    >
                        <div className="h-2 w-2 mt-2 rounded-full bg-primary flex-shrink-0 print:bg-black" />
                        <span className="text-foreground print:text-black">
                            <span className="font-medium">{scaleAmount(ingredient.amount, factor)}</span>{" "}
                            {ingredient.name}
                            {ingredient.optional && (
                                <span className="text-muted-foreground text-sm ml-2 print:text-gray-600">
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
