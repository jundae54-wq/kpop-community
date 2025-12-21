
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^["']|["']$/g, '') // remove quotes
    }
})

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env.local')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    console.log('Seeding data...')

    // 1. Insert Actor
    const { data: actor, error: actorError } = await supabase
        .from('groups')
        // Note: Assuming 'type' column exists now.
        .insert({ name: 'Kim Soo-hyun', slug: 'kim-soo-hyun', type: 'actor' })
        .select()

    if (actorError) {
        console.error('Error inserting actor:', actorError.message)
    } else {
        console.log('Inserted Actor:', actor)
    }
}

seed()
