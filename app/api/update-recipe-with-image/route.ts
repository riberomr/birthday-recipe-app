import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest, getSupabaseUserFromFirebaseUid } from '@/lib/auth/requireAuth'

export async function POST(request: Request) {
    // Initialize Supabase client with Service Role Key for backend operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json(
            { error: 'Server configuration error: Missing Supabase keys' },
            { status: 500 }
        )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    let uploadedImagePath: string | null = null

    try {
        // 1. Verify Authentication
        const decodedToken = await getUserFromRequest(request);
        if (!decodedToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Get User from Supabase
        const user = await getSupabaseUserFromFirebaseUid(
            decodedToken.uid,
            decodedToken.email,
            decodedToken.name,
            decodedToken.picture
        );

        const formData = await request.formData()

        // Extract fields
        const recipeId = formData.get('recipe_id') as string
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const prepTime = parseInt(formData.get('prep_time') as string) || 0
        const cookTime = parseInt(formData.get('cook_time') as string) || 0
        const difficulty = formData.get('difficulty') as string
        const servings = parseInt(formData.get('servings') as string) || 4

        if (!recipeId) {
            return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 })
        }

        // 3. Verify Ownership
        const { data: existingRecipe, error: fetchError } = await supabaseAdmin
            .from('recipes')
            .select('user_id, image_url')
            .eq('id', recipeId)
            .single()

        if (fetchError || !existingRecipe) {
            return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
        }

        if (existingRecipe.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden: You do not own this recipe' }, { status: 403 })
        }

        // Extract JSON fields
        const ingredients = JSON.parse(formData.get('ingredients') as string)
        const steps = JSON.parse(formData.get('steps') as string)
        const nutrition = JSON.parse(formData.get('nutrition') as string)
        const tags = JSON.parse(formData.get('tags') as string)

        // Handle Image Upload
        const file = formData.get('file') as File | null
        let imageUrl = existingRecipe.image_url

        if (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabaseAdmin
                .storage
                .from('recipes')
                .upload(filePath, file, {
                    contentType: file.type,
                    upsert: false
                })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                return NextResponse.json(
                    { error: `Falló la subida de imagen: ${uploadError.message}` },
                    { status: 500 }
                )
            }

            uploadedImagePath = filePath

            const { data: { publicUrl } } = supabaseAdmin
                .storage
                .from('recipes')
                .getPublicUrl(filePath)

            imageUrl = publicUrl

            // Optional: Delete old image if it exists and is different
            // Note: Parsing the old path from URL might be needed if we want to delete it.
            // For now, we skip deletion to avoid accidental data loss of shared resources, 
            // but in production we should clean up.
        } else {
            // Check if image was cleared
            const keepImage = formData.get('keep_image') === 'true'
            if (!keepImage) {
                imageUrl = null
            }
        }

        // Update Recipe
        const { error: updateError } = await supabaseAdmin
            .from('recipes')
            .update({
                title,
                description,
                prep_time_minutes: prepTime,
                cook_time_minutes: cookTime,
                image_url: imageUrl,
                difficulty,
                servings,
                updated_at: new Date().toISOString()
            })
            .eq('id', recipeId)

        if (updateError) throw updateError

        // Update Related Data - Strategy: Delete all and re-insert
        // This is transactional enough for this app.

        // Delete old data
        await supabaseAdmin.from('recipe_ingredients').delete().eq('recipe_id', recipeId)
        await supabaseAdmin.from('recipe_steps').delete().eq('recipe_id', recipeId)
        await supabaseAdmin.from('recipe_nutrition').delete().eq('recipe_id', recipeId)
        await supabaseAdmin.from('recipe_tags').delete().eq('recipe_id', recipeId)

        // Insert New Data
        // Ingredients
        if (ingredients.length > 0) {
            const { error: ingError } = await supabaseAdmin
                .from('recipe_ingredients')
                .insert(ingredients.map((ing: any) => ({
                    recipe_id: recipeId,
                    name: ing.name,
                    amount: ing.amount || null,
                    optional: ing.optional
                })))
            if (ingError) throw ingError
        }

        // Steps
        if (steps.length > 0) {
            const { error: stepError } = await supabaseAdmin
                .from('recipe_steps')
                .insert(steps.map((step: any, index: number) => ({
                    recipe_id: recipeId,
                    step_order: index + 1,
                    content: step.content
                })))
            if (stepError) throw stepError
        }

        // Nutrition
        if (nutrition.length > 0) {
            const { error: nutError } = await supabaseAdmin
                .from('recipe_nutrition')
                .insert(nutrition.map((item: any) => ({
                    recipe_id: recipeId,
                    name: item.name,
                    amount: item.amount,
                    unit: item.unit || null
                })))
            if (nutError) throw nutError
        }

        // Tags
        if (tags.length > 0) {
            const { error: tagError } = await supabaseAdmin
                .from('recipe_tags')
                .insert(tags.map((tagId: string) => ({
                    recipe_id: recipeId,
                    tag_id: tagId
                })))
            if (tagError) throw tagError
        }

        if (existingRecipe.image_url && uploadedImagePath) {
            const filename = existingRecipe.image_url.split("/").pop();
            const { error: updateImageError } = await supabaseAdmin
                .storage
                .from('recipes')
                .remove([filename])
            if (updateImageError) throw updateImageError
        }

        return NextResponse.json({ success: true, recipeId })

    } catch (error: any) {
        console.error('Error in update-recipe-with-image:', error)

        // Rollback: Delete new image if it was uploaded
        if (uploadedImagePath) {
            await supabaseAdmin
                .storage
                .from('recipes')
                .remove([uploadedImagePath])
                .catch(err => console.error('Error deleting image during rollback:', err))
        }

        return NextResponse.json(
            { error: `Error actualizando la receta: ${error.message || 'Error desconocido'}` },
            { status: 500 }
        )
    }
}
