import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // Initialize Supabase client with Service Role Key for backend operations
    // We do this inside the handler to avoid build-time errors if env vars are missing
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
        const formData = await request.formData()

        // Extract fields
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const prepTime = parseInt(formData.get('prep_time') as string) || 0
        const cookTime = parseInt(formData.get('cook_time') as string) || 0
        const difficulty = formData.get('difficulty') as string
        const servings = parseInt(formData.get('servings') as string) || 4
        const userId = formData.get('user_id') as string

        // Extract JSON fields
        const ingredients = JSON.parse(formData.get('ingredients') as string)
        const steps = JSON.parse(formData.get('steps') as string)
        const nutrition = JSON.parse(formData.get('nutrition') as string)
        const tags = JSON.parse(formData.get('tags') as string)

        // Handle Image Upload
        const file = formData.get('file') as File | null
        let imageUrl = null

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
        } else {
            // Allow creating without image if user didn't select one, or handle as error if mandatory
            // For now, we'll allow it but the prompt implies we are adding support for it.
            // If the user sends a URL string (e.g. from previous logic), we could handle it, 
            // but the prompt focuses on file upload. 
            // Let's check if there's an 'image_url' string passed as fallback?
            // The prompt says "Enviar esa imagen... usando FormData".
            // We'll assume if no file, no image, or maybe an existing URL string.
            const existingUrl = formData.get('image_url') as string
            if (existingUrl) imageUrl = existingUrl
        }

        // Insert Recipe
        const { data: recipe, error: recipeError } = await supabaseAdmin
            .from('recipes')
            .insert({
                title,
                description,
                prep_time_minutes: prepTime,
                cook_time_minutes: cookTime,
                image_url: imageUrl,
                difficulty,
                servings,
                user_id: userId
            })
            .select()
            .single()

        if (recipeError) {
            throw recipeError // Trigger catch block for rollback
        }

        // Insert Related Data
        // Ingredients
        if (ingredients.length > 0) {
            const { error: ingError } = await supabaseAdmin
                .from('recipe_ingredients')
                .insert(ingredients.map((ing: any) => ({
                    recipe_id: recipe.id,
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
                    recipe_id: recipe.id,
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
                    recipe_id: recipe.id,
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
                    recipe_id: recipe.id,
                    tag_id: tagId
                })))
            if (tagError) throw tagError
        }

        return NextResponse.json({ success: true, recipeId: recipe.id })

    } catch (error: any) {
        console.error('Error in create-recipe-with-image:', error)

        // Rollback: Delete image if it was uploaded
        if (uploadedImagePath) {
            await supabaseAdmin
                .storage
                .from('recipes')
                .remove([uploadedImagePath])
                .catch(err => console.error('Error deleting image during rollback:', err))
        }

        return NextResponse.json(
            { error: `Error creando la receta: ${error.message || 'Error desconocido'}` },
            { status: 500 }
        )
    }
}
