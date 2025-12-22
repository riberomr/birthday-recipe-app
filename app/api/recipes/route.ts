import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

function getAverageRating(ratings: any[]): number {
    const totalRatings = ratings.length;
    const totalRating = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    const averageRating = totalRating / totalRatings;
    return averageRating || 0;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '6');

        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const difficulty = searchParams.get('difficulty');
        const time = searchParams.get('time');
        const tags = searchParams.get('tags')?.split(',').filter(Boolean);
        const userId = searchParams.get('user_id');

        const hasTagsFilter = !!(tags && tags.length > 0);

        let query = supabaseAdmin
            .from("recipes")
            .select(`
                *,
                recipe_ingredients (*),
                recipe_categories (*),
                ratings (rating),
                recipe_tags${hasTagsFilter ? '!inner' : ''} (
                    tag_id,
                    tags (*)
                ),
                profile:profiles (
                    id,
                    email,
                    full_name,
                    avatar_url,
                    updated_at
                )
            `, { count: 'exact' })
            .eq("is_deleted", false);

        // Apply filters
        if (category) {
            query = query.eq("category_id", category);
        }

        if (difficulty) {
            query = query.eq("difficulty", difficulty);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            query = query.or(`title.ilike.%${searchLower}%,description.ilike.%${searchLower}%`);
        }

        if (time) {
            if (time === "fast") {
                query = query.lt("cook_time_minutes", 20);
            } else if (time === "medium") {
                query = query.gte("cook_time_minutes", 20);
                query = query.lte("cook_time_minutes", 60);
            } else if (time === "slow") {
                query = query.gt("cook_time_minutes", 60);
            }
        }

        if (tags && tags.length > 0) {
            query = query.in("recipe_tags.tag_id", tags);
        }

        if (userId) {
            query = query.eq("user_id", userId);
        }

        // Pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to).order("created_at", { ascending: false });

        const { data, error, count } = await query;

        if (error) {
            console.error("Error fetching recipes:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const recipes = (data || []).map((recipe) => {
            const average_rating = getAverageRating(recipe.ratings || []);
            return { ...recipe, average_rating };
        });

        return NextResponse.json({ data: { recipes, total: count || 0 }, error: null });

    } catch (error: any) {
        console.error("Error in recipes route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
