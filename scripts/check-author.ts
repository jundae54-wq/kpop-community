
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
    // 1. Get recent posts
    const { data: posts } = await supabase.from('posts').select('*, author:profiles(*)').order('created_at', { ascending: false }).limit(3)
    console.log('Recent Posts Authors:', posts?.map(p => p.author))

    // 2. Get all profiles
    const { data: profiles } = await supabase.from('profiles').select('*')
    console.log('All Profiles:', profiles)

    // 3. Check Auth Users (Metadata) - this requires service role but let's see minimal info via profiles first.
}

check()
