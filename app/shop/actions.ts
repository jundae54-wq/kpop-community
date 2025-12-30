'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function buyItem(formData: FormData) {
    const itemType = formData.get('itemType') as string
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Item Definitions (Hardcoded for V1)
    const ITEMS: Record<string, { price: number; name: string }> = {
        'shiny_nickname': { price: 100, name: 'Shiny Nickname' }
    }

    const item = ITEMS[itemType]
    if (!item) {
        redirect('/shop?error=Invalid Item')
    }

    // 1. Check Balance
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single()

    if (!profile || (profile.points || 0) < item.price) {
        redirect('/shop?error=Not enough points')
    }

    // 2. Deduct Points & Apply Effect
    const { error } = await supabase.from('profiles').update({
        points: (profile.points || 0) - item.price,
        active_effect: itemType // For now, buying it immediately equips it. logic could be more complex later (inventory).
    }).eq('id', user.id)

    if (error) {
        console.error('Purchase failed:', error)
        redirect('/shop?error=Purchase failed')
    }

    revalidatePath('/', 'layout')
    redirect('/shop?success=Item purchased!')
}
