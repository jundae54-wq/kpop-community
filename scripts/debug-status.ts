
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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

    const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL']!, env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!)

    async function debug() {
        console.log('--- DEBUG START ---')

        // 1. Check Groups
        const { data: groups, error: groupError } = await supabase.from('groups').select('*')
        if (groupError) console.log('Group Error:', groupError.message)
        else console.log(`Groups Count: ${groups?.length}`)

        // 2. Check Profiles
        const { data: profiles, error: profileError } = await supabase.from('profiles').select('*')
        if (profileError) console.log('Profile Error:', profileError.message)
        else console.log(`Profiles Count: ${profiles?.length}`)

        console.log('--- DEBUG END ---')
    }
    debug()
} catch (e) { console.error(e) }
