'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Toggle Like
export async function toggleLike(postId: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Check if liked
    const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

    if (existingLike) {
        // Unlike
        await supabase.from('likes').delete().eq('id', existingLike.id)
    } else {
        // Like
        await supabase.from('likes').insert({
            user_id: user.id,
            post_id: postId
        })
    }

    revalidatePath(`/p/${postId}`)
    revalidatePath('/')
    revalidatePath('/community')
    revalidatePath('/news')
}

// Toggle Pin (Admin/Mod Only)
export async function togglePin(postId: number, groupId?: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data: post } = await supabase.from('posts').select('is_pinned').eq('id', postId).single()

    if (!post) return { error: 'Post not found' }

    // Check Admin
    const isSuperAdmin = user.email === 'jundae54@gmail.com'
    let isModerator = false

    if (groupId) {
        const { data: mod } = await supabase
            .from('group_moderators')
            .select('*')
            .eq('user_id', user.id)
            .eq('group_id', groupId)
            .single()
        if (mod) isModerator = true
    }

    if (!isSuperAdmin && !isModerator) {
        return { error: 'Permission denied' }
    }

    // Toggle
    await supabase.from('posts').update({ is_pinned: !post.is_pinned }).eq('id', postId)

    revalidatePath(`/p/${postId}`)
    revalidatePath('/community')
    revalidatePath('/news')
}
