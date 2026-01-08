import { Recipe, RecipeCategory } from "@/types"
import { auth } from "@/lib/firebase/client";

// getBaseUrl is implemented because it is not possible to use environment variables directly on the server side.
// It resolves the base URL differently depending on whether the code is running in the browser or on the server.
// But in production, the base URL is the same for both the browser and the server.

function getBaseUrl() {
    //if process.env.NEXT_PUBLIC_APP_URL is not defined, return '' for production
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    else return ''
}

export async function getCategories(): Promise<RecipeCategory[]> {
    try {
        const response = await fetch(`${getBaseUrl()}/api/recipes/categories`);
        if (!response.ok) {
            console.error("Error fetching categories");
            return [];
        }
        const { data } = await response.json();
        return data || [];
    } catch (error) {
        console.error("Error fetching or parsing categories:", error);
        return [];
    }
}

export type RecipeFilters = {
    search?: string
    category?: string
    difficulty?: string
    time?: string
    tags?: string[]
    user_id?: string
}

export async function getRecipes(
    page: number = 1,
    limit: number = 6,
    filters: RecipeFilters = {}
): Promise<{ recipes: Recipe[]; total: number }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.time) params.append('time', filters.time);
    if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
    if (filters.user_id) params.append('user_id', filters.user_id);

    try {
        const response = await fetch(`${getBaseUrl()}/api/recipes?${params.toString()}`);

        if (!response.ok) {
            console.error("Error fetching recipes");
            return { recipes: [], total: 0 };
        }

        const { data } = await response.json();
        return { recipes: data.recipes || [], total: data.total || 0 };
    } catch (error) {
        console.error("Error fetching or parsing recipes:", error);
        return { recipes: [], total: 0 };
    }
}

export async function getRecipe(id: string): Promise<Recipe | null> {
    try {
        const response = await fetch(`${getBaseUrl()}/api/recipes/${id}`);

        if (!response.ok) {
            console.error("Error fetching recipe");
            return null;
        }

        const { data } = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching or parsing recipe:", error);
        return null;
    }
}

type RecipeCommunityPhoto = {
    image_url: string
}
export async function getRecipeCommunityPhotos(recipeId: string): Promise<RecipeCommunityPhoto[] | null> {
    try {
        const response = await fetch(`${getBaseUrl()}/api/recipes/${recipeId}/photos`);

        if (!response.ok) {
            console.error("Error fetching community photos");
            return null;
        }

        const { data } = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching or parsing community photos:", error);
        return null;
    }
}

export async function createRecipe(formData: FormData) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");


    try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/create-recipe-with-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        let result;
        try {
            result = await response.json();
        } catch (error) {
            throw new Error('Error al procesar la respuesta del servidor');
        }

        if (!response.ok) {
            throw new Error(result.error || 'Error desconocido al crear la receta');
        }

        return result;
    } catch (error: any) {
        throw new Error(error.message || 'Error desconocido al crear la receta');
    }
}

export async function updateRecipe(recipeId: string, formData: FormData) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const token = await user.getIdToken();

    // Append recipe_id to formData
    formData.append('recipe_id', recipeId);

    try {
        const response = await fetch(`/api/update-recipe-with-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        let result;
        try {
            result = await response.json();
        } catch (error) {
            throw new Error('Error al procesar la respuesta del servidor');
        }

        if (!response.ok) {
            throw new Error(result.error || 'Error desconocido al actualizar la receta');
        }

        return result;
    } catch (error: any) {
        throw new Error(error.message || 'Error desconocido al actualizar la receta');
    }
}

/**
 * Performs a logical delete of a recipe.
 *
 * This function sets the `is_deleted` flag to true in the database, effectively hiding the recipe
 * from the application UI while preserving the data for potential restoration or audit purposes.
 * It does NOT remove the record from the database.
 *
 * We separate logical and permanent delete operations to ensure safety and prevent accidental data loss.
 * Logical delete is the default action for users.
 *
 * @param id - The unique identifier of the recipe to delete.
 * @returns A promise that resolves to the API response result.
 * @throws Error if the user is not authenticated or the operation fails.
 */
export async function deleteRecipe(id: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const token = await user.getIdToken();

    try {
        const response = await fetch(`/api/recipes/${id}/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        let result;
        try {
            result = await response.json();
        } catch (error) {
            throw new Error('Error al procesar la respuesta del servidor');
        }

        if (!response.ok) {
            throw new Error(result.error || 'Error desconocido al eliminar la receta');
        }

        return result;
    } catch (error: any) {
        throw new Error(error.message || 'Error desconocido al eliminar la receta');
    }
}

/**
 * Performs a permanent (physical) delete of a recipe.
 *
 * This function IRREVERSIBLY removes the recipe record from the database.
 * Once executed, the data cannot be recovered. This should be used with extreme caution,
 * typically for administrative purposes or GDPR compliance.
 *
 * We keep this separate from the standard delete to enforce a clear distinction between
 * reversible (soft) and irreversible (hard) actions.
 *
 * @param id - The unique identifier of the recipe to permanently delete.
 * @returns A promise that resolves to the API response result.
 * @throws Error if the user is not authenticated or the operation fails.
 */
export async function deleteRecipePermanently(id: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const token = await user.getIdToken();

    try {
        const response = await fetch(`/api/recipes/${id}/permanent-delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        let result;
        try {
            result = await response.json();
        } catch (error) {
            throw new Error('Error al procesar la respuesta del servidor');
        }

        if (!response.ok) {
            throw new Error(result.error || 'Error desconocido al eliminar la receta permanentemente');
        }

        return result;
    } catch (error: any) {
        throw new Error(error.message || 'Error desconocido al eliminar la receta permanentemente');
    }
}

