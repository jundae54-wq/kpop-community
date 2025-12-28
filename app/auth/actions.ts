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
        redirect('/login?error=' + encodeURIComponent('Email ou senha inválidos'))
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    // Prioritize run-time origin (headers) over build-time env vars
    // This ensures redirect matches the domain the user is actually on (custom domain or vercel.app)
    const requestOrigin = (await headers()).get('origin')
    const origin = requestOrigin ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    try {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${origin}/auth/callback`,
                data: {
                    full_name: fullName,
                    avatar_url: `https://api.dicebear.com/9.x/lorelei/svg?seed=${Math.random()}`,
                }
            },
        })

        if (error) {
            console.error('Signup error:', error)
            redirect('/signup?error=' + encodeURIComponent(error.message))
        }
    } catch (e: any) {
        if (e?.message?.includes('NEXT_REDIRECT')) {
            throw e // Let Next.js redirect handle it
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

export async function requestPasswordReset(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const origin = process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
        (await headers()).get('origin') || 'http://localhost:3000'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/update-password`,
    })

    if (error) {
        console.error('Password reset error:', error)
        redirect('/reset-password?error=' + encodeURIComponent('Falha ao enviar email. Verifique o endereço.'))
    }

    redirect('/reset-password?message=' + encodeURIComponent('Email enviado! Verifique sua caixa de entrada.'))
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
    redirect('/login?message=' + encodeURIComponent('Senha atualizada com sucesso! Faça login.'))
}
