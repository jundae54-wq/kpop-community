'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAIL = 'jundae54@gmail.com'

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
        throw new Error('Unauthorized')
    }
}

export async function banUser(formData: FormData) {
    await checkAdmin()
    const admin = createAdminClient()
    const userId = formData.get('userId') as string
    const banDuration = formData.get('banDuration') as string // 'permanent' or hours

    if (banDuration === 'permanent') {
        const { error } = await admin.auth.admin.updateUserById(userId, {
            ban_duration: '876000h' // 100 years
        })
        if (error) console.error('Ban failed:', error)
    } else {
        // Unban
        const { error } = await admin.auth.admin.updateUserById(userId, {
            ban_duration: '0'
        })
        if (error) console.error('Unban failed:', error)
    }

    revalidatePath('/admin/users')
}

export async function deleteUser(formData: FormData) {
    await checkAdmin()
    const admin = createAdminClient()
    const userId = formData.get('userId') as string

    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) console.error('Delete user failed:', error)

    revalidatePath('/admin/users')
}

export async function togglePostVisibility(formData: FormData) {
    await checkAdmin()
    const supabase = await createClient() // Can use regular client if RLS allows or admin for surety
    const admin = createAdminClient()

    const postId = formData.get('postId') as string
    const isHidden = formData.get('isHidden') === 'true'

    const { error } = await admin.from('posts')
        .update({ is_hidden: !isHidden }) // Toggle
        .eq('id', postId)

    if (error) console.error('Toggle visibility failed:', error)

    revalidatePath('/admin/posts')
}

export async function adminDeletePost(formData: FormData) {
    await checkAdmin()
    const admin = createAdminClient()
    const postId = formData.get('postId') as string

    const { error } = await admin.from('posts').delete().eq('id', postId)
    if (error) console.error('Delete post failed:', error)

    revalidatePath('/admin/posts')
}

export async function adminDeleteComment(formData: FormData) {
    await checkAdmin()
    const admin = createAdminClient()
    const commentId = formData.get('commentId') as string

    const { error } = await admin.from('comments').delete().eq('id', commentId)
    if (error) console.error('Delete comment failed:', error)

    revalidatePath('/admin/comments')
}

export async function bulkDeletePosts(postIds: string[]) {
    await checkAdmin()
    const admin = createAdminClient()

    if (!postIds || postIds.length === 0) return

    const { error } = await admin.from('posts').delete().in('id', postIds)
    if (error) console.error('Bulk delete failed:', error)

    revalidatePath('/admin/posts')
}
export async function bulkDeleteComments(commentIds: string[]) {
    await checkAdmin()
    const admin = createAdminClient()

    if (!commentIds || commentIds.length === 0) return

    const { error } = await admin.from('comments').delete().in('id', commentIds)
    if (error) console.error('Bulk delete comments failed:', error)

    revalidatePath('/admin/comments')
}
