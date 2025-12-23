import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client-side client (singleton)
// Uses a Proxy to avoid crashing at module evaluation time if env vars are missing
export const supabase = (() => {
    if (supabaseUrl && supabaseAnonKey) {
        return createClient(supabaseUrl, supabaseAnonKey)
    }

    console.warn('Supabase keys missing, using fallback Proxy')

    return new Proxy({} as any, {
        get: (_target, prop) => {
            // Allow access to 'then' to avoid promises treating it weirdly if await-ed?
            if (prop === 'then') return undefined
            throw new Error(`Supabase client is not initialized. Missing env vars: URL=${!!supabaseUrl}, Key=${!!supabaseAnonKey}`)
        }
    })
})()

// Server-side client with Service Role
export const getServiceSupabase = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
    }
    if (!supabaseUrl) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL for service client')
    }
    return createClient(supabaseUrl, serviceRoleKey)
}
