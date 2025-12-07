import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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
        const formData = await request.formData()

        const content = formData.get('content') as string
        const recipeId = formData.get('recipe_id') as string
        const userId = formData.get('user_id') as string
        const file = formData.get('file') as File | null

        if (!content || !recipeId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        let imageUrl = null

        if (file) {
            // Upload Image
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabaseAdmin
                .storage
                .from('community-photos') // Using the same bucket as agreed
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
                .from('community-photos')
                .getPublicUrl(filePath)

            imageUrl = publicUrl
        }

        // Insert into Database
        const { data: comment, error: dbError } = await supabaseAdmin
            .from('comments')
            .insert({
                content,
                recipe_id: recipeId,
                user_id: userId,
                image_url: imageUrl
            })
            .select(`
        *,
        profiles (
            full_name,
            avatar_url
        )
      `)
            .single()

        if (dbError) {
            throw dbError
        }

        return NextResponse.json({ success: true, comment })

    } catch (error: any) {
        console.error('Error in comments/create:', error)

        // Rollback: Delete image if it was uploaded
        if (uploadedImagePath) {
            await supabaseAdmin
                .storage
                .from('community-photos')
                .remove([uploadedImagePath])
                .catch(err => console.error('Error deleting image during rollback:', err))
        }

        return NextResponse.json(
            { error: `Error publicando comentario: ${error.message || 'Error desconocido'}` },
            { status: 500 }
        )
    }
}
