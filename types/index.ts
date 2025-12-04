export type Recipe = {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    prep_time_minutes: number;
    cook_time_minutes: number;
    category_id: string | null;
    created_at: string;
    difficulty?: string | null; // 'easy', 'medium', 'hard'
    servings?: number;
    recipe_ingredients?: RecipeIngredient[];
    recipe_categories?: RecipeCategory | null;
    recipe_steps?: RecipeStep[];
    recipe_nutrition?: RecipeNutrition[];
    ratings?: Rating[];
    average_rating?: AverageRating; // Calculated average rating
    tags?: Tag[];
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

export type RecipeNutrition = {
    id: string;
    recipe_id: string;
    name: string;
    amount: string;
    unit?: string;
};

export type Rating = {
    id: string;
    recipe_id: string;
    user_id: string;
    rating: number;
};

export type User = {
    id: string;
    email: string;
    created_at: string;
};

export type AverageRating = {
    rating: number;
    count: number;
};

export type Tag = {
    id: string;
    name: string;
    type?: string;
};

export type Favorite = {
    user_id: string;
    recipe_id: string;
    created_at: string;
};

