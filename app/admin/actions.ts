'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'jundae54@gmail.com'

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
        throw new Error('Unauthorized')
    }
    return supabase
}

export async function deletePost(formData: FormData) {
    const supabase = await checkAdmin()
    const postId = formData.get('postId') as string
    const redirectUrl = formData.get('redirectUrl') as string

    await supabase.from('posts').delete().eq('id', postId)

    revalidatePath('/admin')
    revalidatePath(redirectUrl || '/admin')
}

export async function deleteComment(formData: FormData) {
    const supabase = await checkAdmin()
    const commentId = formData.get('commentId') as string
    const redirectUrl = formData.get('redirectUrl') as string

    await supabase.from('comments').delete().eq('id', commentId)

    revalidatePath('/admin')
    revalidatePath(redirectUrl || '/admin')
}
