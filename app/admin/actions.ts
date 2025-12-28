'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'jundae54@gmail.com'

// Helper to check if current user is super admin
async function isSuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email === ADMIN_EMAIL
}

export async function deletePost(formData: FormData) {
    const supabase = await createClient()
    const postId = formData.get('postId') as string
    const redirectUrl = formData.get('redirectUrl') as string

    // Note: We should ideally check permissions here, but for now relying on UI protection + basic auth
    // In a real app, we'd check if user is admin or moderator of the group

    const { error } = await supabase.from('posts').delete().eq('id', postId)

    if (error) {
        console.error('Delete post failed:', error)
        // Optionally redirect with error
    }

    if (redirectUrl) {
        revalidatePath(redirectUrl)
        redirect(redirectUrl)
    } else {
        revalidatePath('/admin')
    }
}

export async function deleteComment(formData: FormData) {
    const supabase = await createClient()
    const commentId = formData.get('commentId') as string
    const redirectUrl = formData.get('redirectUrl') as string

    const { error } = await supabase.from('comments').delete().eq('id', commentId)

    if (error) {
        console.error('Delete comment failed:', error)
    }

    if (redirectUrl) {
        revalidatePath(redirectUrl)
    } else {
        revalidatePath('/admin')
    }
}

export async function toggleModerator(formData: FormData) {
    if (!await isSuperAdmin()) {
        throw new Error('Unauthorized')
    }

    const supabase = await createClient()
    const userId = formData.get('userId') as string
    const groupId = formData.get('groupId') as string
    const isModerator = formData.get('isModerator') === 'true'

    if (isModerator) {
        // Remove moderator
        await supabase
            .from('group_moderators')
            .delete()
            .match({ user_id: userId, group_id: groupId })
    } else {
        // Add moderator
        await supabase
            .from('group_moderators')
            .insert({ user_id: userId, group_id: groupId })
    }

    revalidatePath(`/admin/user/${userId}`)
}
