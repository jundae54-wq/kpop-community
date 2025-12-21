
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^["']|["']$/g, '')
    }
})

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL']!, env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!)

async function check() {
    const { data, error } = await supabase.from('profiles').select('*')
    console.log('Profiles:', data)
    console.log('Error:', error)
}
check()
