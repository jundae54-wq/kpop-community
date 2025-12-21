'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect('/login?error=Invalid email or password')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const origin = (await headers()).get('origin')

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                full_name: fullName,
                avatar_url: `https://api.dicebear.com/9.x/micah/svg?seed=${Math.random()}`, // Random avatar
            }
        },
    })

    if (error) {
        redirect('/login?error=Could not create user')
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check email to continue sign in process')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function createPost(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const groupIdRaw = formData.get('groupId') as string

    if (!groupIdRaw) {
        redirect('/write?error=Please select a category')
    }

    const groupId = parseInt(groupIdRaw)

    const { error } = await supabase.from('posts').insert({
        title,
        content,
        author_id: user.id,
        group_id: groupId,
    })

    if (error) {
        console.error(error)
        redirect('/write?error=Failed to create post')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function deletePost(formData: FormData) {
    const supabase = await createClient()
    const postId = formData.get('postId') as string

    const { error } = await supabase.from('posts').delete().eq('id', postId)

    if (error) {
        console.error('Delete failed:', error)
        redirect('/admin?error=Failed to delete post')
    }

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function createComment(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const postId = formData.get('postId') as string
    const content = formData.get('content') as string

    const { error } = await supabase.from('comments').insert({
        post_id: parseInt(postId),
        content,
        author_id: user.id,
    })

    if (error) {
        console.error('Comment failed:', error)
        redirect(`/p/${postId}?error=Failed to post comment`)
    }

    revalidatePath(`/p/${postId}`)
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const fullName = formData.get('fullName') as string
    const avatarUrl = formData.get('avatarUrl') as string

    const { error } = await supabase.from('profiles').update({
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (error) {
        console.error('Profile update failed:', error)
        // In a real app we'd handle errors better
        return { error: 'Failed to update profile' }
    }

    revalidatePath('/profile')
    revalidatePath('/') // Update navbar avatar
}
