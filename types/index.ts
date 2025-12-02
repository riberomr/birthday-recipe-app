export type Recipe = {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    prep_time_minutes: number;
    cook_time_minutes: number;
    category_id: string | null;
    created_at: string;
    recipe_ingredients?: RecipeIngredient[];
    recipe_categories?: RecipeCategory | null;
    recipe_steps?: RecipeStep[];
};

export type RecipeCategory = {
    id: string;
    name: string;
};

export type RecipeIngredient = {
    id: string;
    recipe_id: string;
    name: string;
    amount: string | null;
    optional: boolean;
};

export type RecipeStep = {
    id: string;
    recipe_id: string;
    step_order: number;
    content: string;
};
