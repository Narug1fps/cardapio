import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key length:', serviceRoleKey ? serviceRoleKey.length : 0)

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing keys')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function test() {
    const { data, error } = await supabase.from('categories').select('*')
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Categories found:', data ? data.length : 0)
        console.log(JSON.stringify(data, null, 2))

        const { data: dishes, error: errorDishes } = await supabase.from('dishes').select('*')
        if (errorDishes) {
            console.error('Error Dishes:', errorDishes)
        } else {
            console.log('Dishes found:', dishes ? dishes.length : 0)
        }
    }
}

test()
