
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local')
try {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const env: Record<string, string> = {}
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            env[key.trim()] = value.trim().replace(/^["']|["']$/g, '')
        }
    })

    const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
    const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] // Use anon key for now, see if RLS blocks. 
    // Ideally we use service role key if we want to bypass RLS, but verifying Client behavior (Anon) is better for "Write Page" debug.

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    async function diagnose() {
        console.log('Testing connection...')

        // 1. Try to fetch groups with 'type'
        const { data, error } = await supabase.from('groups').select('id, name, type')

        if (error) {
            console.error('Error fetching groups:', error)
            if (error.message.includes('type')) {
                console.log('HINT: The "type" column might be missing. Did you run the migration?')
            }
        } else {
            console.log('Groups fetch success:', data)
            if (data.length === 0) {
                console.log('HINT: Table is empty. You need to insert data.')
            }
        }
    }

    diagnose()

} catch (e) {
    console.error('Error loading env:', e)
}
