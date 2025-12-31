'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function buyItem(formData: FormData) {
    const itemType = formData.get('itemType') as string
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Item Definitions
    // Static items
    const ITEMS: Record<string, { price: number; name: string; type: 'effect' | 'badge' }> = {
        'shiny_nickname': { price: 100, name: 'Shiny Nickname', type: 'effect' }
    }

    let item: { price: number; name: string; type: 'effect' | 'badge' } | undefined = ITEMS[itemType]
    let dbItemType = item?.type || 'badge' // Default to badge if dynamic

    // Dynamic Badges (Check if itemType starts with 'badge_')
    if (!item && itemType.startsWith('badge_')) {
        const groupId = parseInt(itemType.split('_')[1])
        if (!isNaN(groupId)) {
            const { data: group } = await supabase.from('groups').select('name').eq('id', groupId).single()
            if (group) {
                item = { price: 50, name: `Nó de ${group.name}`, type: 'badge' } // 50 pts per badge
                dbItemType = 'badge'
            }
        }
    }

    if (!item) {
        redirect('/shop?error=Item Inválido')
    }


    // Purchase Condition Check (Post/Comment Activity)
    if (dbItemType === 'badge' && itemType.startsWith('badge_')) {
        const groupId = parseInt(itemType.split('_')[1])
        if (!isNaN(groupId)) {
            // Check Posts
            const { count: postCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', user.id)
                .eq('group_id', groupId)

            if ((postCount || 0) < 1) {
                redirect('/shop?error=Requer pelo menos 1 post nesta comunidade!')
            }

            // Check Comments (Join with posts to filter by group_id)
            const { count: commentCount } = await supabase
                .from('comments')
                .select('*, post:posts!inner(group_id)', { count: 'exact', head: true })
                .eq('author_id', user.id)
                .eq('post.group_id', groupId)

            if ((commentCount || 0) < 1) {
                redirect('/shop?error=Requer pelo menos 1 comentário nesta comunidade!')
            }
        }
    }

    // 1. Check Balance
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single()

    if (!profile || (profile.points || 0) < item.price) {
        redirect('/shop?error=Pontos insuficientes')
    }

    // 2. Check if already owned (for unique items like badges/effects)
    // You can buy duplicates if we want, but for badges maybe limit to 1? 
    // Let's limit 1 for now to prevent accidental double purchase.
    const { data: owned } = await supabase
        .from('user_inventory')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemType)
        .single()

    if (owned) {
        redirect('/shop?error=Item já adquirido')
    }

    // 3. Transaction (Deduct Points & Add to Inventory)
    // Note: Ideally use a stored procedure for atomicity, but individual calls are ok for MVP
    const { error: updateError } = await supabase.from('profiles').update({
        points: (profile.points || 0) - item.price,
        // Also auto-equip active effect if it's an effect type (legacy behavior support)
        ...(dbItemType === 'effect' ? { active_effect: itemType } : {})
    }).eq('id', user.id)

    if (updateError) {
        console.error('Purchase failed (point deduction):', updateError)
        redirect('/shop?error=Falha na compra')
    }

    const { error: insertError } = await supabase.from('user_inventory').insert({
        user_id: user.id,
        item_id: itemType,
        item_type: dbItemType,
    })

    if (insertError) {
        // Rollback points (best effort)
        console.error('Purchase failed (inventory insert):', insertError)
        await supabase.from('profiles').update({
            points: (profile.points || 0) // Restore
        }).eq('id', user.id)
        redirect('/shop?error=Falha na compra')
    }

    revalidatePath('/', 'layout')
    redirect('/shop?success=Item comprado com sucesso!')
}

export async function equipBadge(formData: FormData) {
    const itemId = formData.get('itemId') as string
    const slot = formData.get('slot') as 'left' | 'right' // 'left' or 'right'
    const action = formData.get('action') as 'equip' | 'unequip'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    if (action === 'unequip') {
        const updateData = slot === 'left' ? { badge_left: null } : { badge_right: null }
        await supabase.from('profiles').update(updateData).eq('id', user.id)
    } else {
        // Verify ownership
        const { data: owned } = await supabase
            .from('user_inventory')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_id', itemId)
            .single()

        if (!owned) {
            redirect('/shop?error=Item não possui')
        }

        const updateData = slot === 'left' ? { badge_left: itemId } : { badge_right: itemId }
        await supabase.from('profiles').update(updateData).eq('id', user.id)
    }

    revalidatePath('/shop')
    revalidatePath('/', 'layout')
}

export async function equipEffect(formData: FormData) {
    const itemId = formData.get('itemId') as string
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Verify ownership
    const { data: owned } = await supabase
        .from('user_inventory')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .single()

    // Also allow unequip if empty string/null passed? 
    // For now assuming equip logic.

    if (!owned && itemId !== 'none') {
        redirect('/shop?error=Item não possui')
    }

    await supabase.from('profiles').update({
        active_effect: itemId === 'none' ? null : itemId
    }).eq('id', user.id)

    revalidatePath('/shop')
    revalidatePath('/')
}
