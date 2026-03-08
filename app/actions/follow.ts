'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkFollowStatus(groupId: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { isFollowing: false, wantsEmail: false }

    const { data, error } = await supabase
        .from('group_followers')
        .select('wants_email')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .maybeSingle()

    if (error || !data) {
        return { isFollowing: false, wantsEmail: false }
    }

    return { isFollowing: true, wantsEmail: data.wants_email }
}

export async function toggleFollow(groupId: number, currentStatus: boolean, path: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Please log in to follow groups.' }
    }

    if (currentStatus) {
        // Unfollow
        const { error } = await supabase
            .from('group_followers')
            .delete()
            .eq('user_id', user.id)
            .eq('group_id', groupId)

        if (error) return { error: error.message }
    } else {
        // Follow (default to false for emails initially, they can toggle it separately)
        const { error } = await supabase
            .from('group_followers')
            .insert({ user_id: user.id, group_id: groupId, wants_email: false })

        if (error) return { error: error.message }
    }

    revalidatePath(path)
    revalidatePath('/community')
    revalidatePath('/news')
    
    return { success: true }
}

export async function toggleEmailNotification(groupId: number, wantsEmail: boolean, path: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated.' }
    }

    const { error } = await supabase
        .from('group_followers')
        .update({ wants_email: wantsEmail })
        .eq('user_id', user.id)
        .eq('group_id', groupId)

    if (error) return { error: error.message }

    revalidatePath(path)
    return { success: true }
}
