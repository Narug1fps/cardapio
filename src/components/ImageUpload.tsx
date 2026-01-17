'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import { supabase } from '@/lib/supabase'
import { useToast } from './Toast'

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    label: string
    aspectRatio?: 'square' | 'banner'
}

export function ImageUpload({ value, onChange, label, aspectRatio = 'square' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { error } = useToast()

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = event.target.files?.[0]
            if (!file) return

            // Create unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `uploads/${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('restaurant-assets')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('restaurant-assets')
                .getPublicUrl(filePath)

            onChange(publicUrl)
        } catch (e) {
            console.error('Upload error:', e)
            error('Erro ao fazer upload da imagem')
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--menu-text-secondary)' }}>
                {label}
            </label>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
            />

            {value ? (
                <div className="relative group">
                    <img
                        src={value}
                        alt="Preview"
                        className={`w-full rounded-xl object-cover ${aspectRatio === 'banner' ? 'h-32' : 'aspect-square'
                            }`}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white transition-colors"
                        >
                            <FiUpload className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onChange('')}
                            className="p-2 bg-red-500/80 rounded-lg hover:bg-red-500 text-white transition-colors"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={`w-full bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${aspectRatio === 'banner' ? 'h-32' : 'aspect-square'
                        }`}
                    style={{ color: 'var(--menu-text-secondary)' }}
                >
                    {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                    ) : (
                        <>
                            <FiImage className="w-8 h-8" />
                            <span className="text-xs">Clique para adicionar</span>
                        </>
                    )}
                </button>
            )}
        </div>
    )
}
