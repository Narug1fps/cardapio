import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET() {
    try {
        const supabase = getServiceSupabase()
        const bucketName = 'restaurant-assets'

        // Tenta listar buckets para ver se existe
        const { data: buckets, error: listError } = await supabase.storage.listBuckets()

        if (listError) {
            console.error('Error listing buckets:', listError)
            return NextResponse.json({ error: 'Failed to list buckets', details: listError }, { status: 500 })
        }

        const bucketExists = buckets.find(b => b.name === bucketName)

        if (bucketExists) {
            return NextResponse.json({
                success: true,
                message: `Bucket '${bucketName}' already exists.`
            })
        }

        // Se não existe, cria
        const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
        })

        if (error) {
            console.error('Error creating bucket:', error)
            return NextResponse.json({ error: 'Failed to create bucket', details: error }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: `Bucket '${bucketName}' created successfully.`,
            data
        })

    } catch (error) {
        console.error('Setup error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 })
    }
}
