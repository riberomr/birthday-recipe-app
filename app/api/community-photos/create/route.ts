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

        const comment = formData.get('comment') as string
        const userId = formData.get('user_id') as string
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            )
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 401 }
            )
        }

        // Upload Image
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('community-photos')
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

        // Insert into Database
        const { data: photo, error: dbError } = await supabaseAdmin
            .from('community_photos')
            .insert({
                image_url: publicUrl,
                comment: comment,
                user_id: userId
            })
            .select()
            .single()

        if (dbError) {
            throw dbError
        }

        return NextResponse.json({ success: true, photo })

    } catch (error: any) {
        console.error('Error in community-photos/create:', error)

        // Rollback: Delete image if it was uploaded
        if (uploadedImagePath) {
            await supabaseAdmin
                .storage
                .from('community-photos')
                .remove([uploadedImagePath])
                .catch(err => console.error('Error deleting image during rollback:', err))
        }

        return NextResponse.json(
            { error: `Error subiendo la foto: ${error.message || 'Error desconocido'}` },
            { status: 500 }
        )
    }
}
