'use server'

import { revalidatePath } from 'next/cache'
import { redirect, isRedirectError } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { incrementPoints, checkAndAwardDailyLoginBonus } from '@/utils/points'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect('/login?error=' + encodeURIComponent('Email ou senha inválidos'))
    }

    if (data.user) {
        // Daily Login Bonus
        await checkAndAwardDailyLoginBonus(data.user.id)

        revalidatePath('/', 'layout')
        redirect('/')
    }

}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const fullName = formData.get('fullName') as string

    if (password !== confirmPassword) {
        redirect('/signup?error=' + encodeURIComponent('As senhas não coincidem'))
    }

    // Determine the base URL for the redirect
    // 1. In Vercel production, use necessary env vars
    // 2. Fallback to origin header (client likely knows best)
    // 3. Last resort: localhost
    let origin = 'http://localhost:3000'

    if (process.env.NEXT_PUBLIC_SITE_URL) {
        origin = process.env.NEXT_PUBLIC_SITE_URL
    } else if (process.env.VERCEL_URL) {
        origin = `https://${process.env.VERCEL_URL}`
    } else {
        const headerOrigin = (await headers()).get('origin')
        if (headerOrigin) origin = headerOrigin
    }

    // Ensure no trailing slash
    origin = origin.replace(/\/$/, '')

    // Check if nickname (full_name) is already taken
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('full_name', fullName) // Case-insensitive check
        .single()

    if (existingProfile) {
        redirect('/signup?error=' + encodeURIComponent('Este apelido já está em uso. Escolha outro.'))
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${origin}/auth/callback?next=/signup/verified`,
                data: {
                    full_name: fullName,
                    avatar_url: `https://api.dicebear.com/9.x/lorelei/svg?seed=${Math.random()}`,
                }
            },
        })

        if (error) {
            console.error('Signup error:', error)
            // Handle specific "User already registered" error
            if (error.message.includes('already registered') || error.message.includes('unique constraint')) {
                redirect('/login?message=' + encodeURIComponent('Este email já está cadastrado. Faça login.'))
            }
            if (error.message.includes('Error sending confirmation email')) {
                redirect('/signup?error=' + encodeURIComponent('Erro ao enviar email de confirmação. Tente novamente mais tarde.'))
            }
            redirect('/signup?error=' + encodeURIComponent(error.message))
        }

        // If signup is successful but user identity is null, it usually means email exists but unconfirmed (if enumeration protection is on)
        // OR it's just a normal unconfirmed signup. Supabase doesn't easily distinguish without Admin API.
        // But for verified users trying to signup again, Supabase usually returns an error or fake success.

    } catch (e: any) {
        if (isRedirectError(e)) {
            throw e
        }
        console.error('Unexpected signup error:', e)
        redirect('/signup?error=' + encodeURIComponent('Algo deu errado. Tente novamente.'))
    }

    revalidatePath('/', 'layout')
    redirect('/signup/confirmation')
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

    // Award points
    await incrementPoints(user.id, 10)

    revalidatePath('/', 'layout')
    redirect('/')
}

// ... (existing code for deletePost/deleteComment) ...

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

    // Award points
    await incrementPoints(user.id, 2)

    revalidatePath(`/p/${postId}`)
}

const ADMIN_EMAIL = 'jundae54@gmail.com'

export async function deletePost(formData: FormData) {
    const supabase = await createClient()
    const postId = formData.get('postId') as string

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 1. Fetch Post to check author and group
    const { data: post } = await supabase.from('posts').select('author_id, group_id').eq('id', postId).single()

    if (!post) {
        redirect('/')
    }

    // 2. Check Permissions
    const isAuthor = post.author_id === user.id
    const isSuperAdmin = user.email === ADMIN_EMAIL
    let isModerator = false

    if (post.group_id) {
        const { data: mod } = await supabase
            .from('group_moderators')
            .select('*')
            .eq('user_id', user.id)
            .eq('group_id', post.group_id)
            .single()
        if (mod) isModerator = true
    }

    if (!isAuthor && !isSuperAdmin && !isModerator) {
        // Unauthorized
        console.error('Unauthorized delete attempt')
        redirect('/') // or show error
    }

    // 3. Delete
    const { error } = await supabase.from('posts').delete().eq('id', postId)

    if (error) {
        console.error('Delete failed:', error)
        redirect('/admin?error=Failed to delete post')
    }

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function deleteComment(formData: FormData) {
    const supabase = await createClient()
    const commentId = formData.get('commentId') as string
    const postId = formData.get('postId') as string // Pass postId for redirect

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 1. Fetch Comment to check author
    const { data: comment } = await supabase.from('comments').select('author_id, post_id').eq('id', commentId).single()
    if (!comment) return

    // 2. Fetch Post to check group (for moderator)
    const { data: post } = await supabase.from('posts').select('group_id').eq('id', comment.post_id).single()

    // 3. Check Permissions
    const isAuthor = comment.author_id === user.id
    const isSuperAdmin = user.email === ADMIN_EMAIL
    let isModerator = false

    if (post?.group_id) {
        const { data: mod } = await supabase
            .from('group_moderators')
            .select('*')
            .eq('user_id', user.id)
            .eq('group_id', post.group_id)
            .single()
        if (mod) isModerator = true
    }

    if (!isAuthor && !isSuperAdmin && !isModerator) {
        return // Unauthorized
    }

    const { error } = await supabase.from('comments').delete().eq('id', commentId)

    if (error) {
        console.error('Comment delete failed:', error)
    }

    revalidatePath(`/p/${comment.post_id}`)
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

export async function requestPasswordReset(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    // Determine the base URL for the redirect
    // 1. In Vercel production, use necessary env vars
    // 2. Fallback to origin header (client likely knows best)
    // 3. Last resort: localhost
    let origin = 'http://localhost:3000'

    if (process.env.NEXT_PUBLIC_SITE_URL) {
        origin = process.env.NEXT_PUBLIC_SITE_URL
    } else if (process.env.VERCEL_URL) {
        origin = `https://${process.env.VERCEL_URL}`
    } else {
        const headerOrigin = (await headers()).get('origin')
        if (headerOrigin) origin = headerOrigin
    }

    // Ensure no trailing slash
    origin = origin.replace(/\/$/, '')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/update-password`,
    })

    if (error) {
        console.error('Password reset error:', error)
        // For security reasons, often we don't want to explicitly say if email exists or not, 
        // but here we are being explicit for UX.
        redirect('/reset-password?error=' + encodeURIComponent('Não foi possível enviar o email. Tente novamente.'))
    }

    redirect('/reset-password/confirmation')
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        redirect('/update-password?error=' + encodeURIComponent('As senhas não coincidem'))
    }

    if (password.length < 6) {
        redirect('/update-password?error=' + encodeURIComponent('A senha deve ter pelo menos 6 caracteres'))
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        console.error('Password update error:', error)
        redirect('/update-password?error=' + encodeURIComponent('Falha ao atualizar senha'))
    }

    revalidatePath('/', 'layout')
    revalidatePath('/', 'layout')
    redirect('/login?message=' + encodeURIComponent('Senha atualizada com sucesso! Faça login.'))
}

export async function checkNicknameAvailability(nickname: string) {
    const supabase = await createClient()

    const { data } = await supabase
        .from('profiles')
        .select('id')
        .ilike('full_name', nickname)
        .single()

    return !!data // Returns true if nickname exists (taken), false if available
}
