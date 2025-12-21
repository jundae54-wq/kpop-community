
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

    const url = env['NEXT_PUBLIC_SUPABASE_URL']
    const key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

    console.log('Checking Supabase Connection...')
    console.log('URL:', url ? url.substring(0, 20) + '...' : 'MISSING')

    if (!url || !key) throw new Error('Missing Env Vars')

    const supabase = createClient(url, key)

    async function verify() {
        // 1. Check Groups
        const { data: groups, error: gErr } = await supabase.from('groups').select('*')
        if (gErr) {
            console.error('Groups Fetch Error:', gErr.message)
            if (gErr.code === 'PGRST205') console.error('CRITICAL: Table "groups" does not exist.')
        } else {
            console.log('Groups Found:', groups.length)
            console.log('Sample:', groups.slice(0, 2))
        }

        // 2. Check Profiles
        const { data: profiles, error: pErr } = await supabase.from('profiles').select('*')
        if (pErr) console.error('Profiles Fetch Error:', pErr.message)
        else console.log('Profiles Found:', profiles.length)
    }

    verify()

} catch (e) {
    console.error('Script Error:', e)
}
