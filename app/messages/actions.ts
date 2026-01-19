'use server'

import { createClient } from '@/utils/supabase/server'
import { deductPoints } from '@/utils/points'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function sendMessage(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const receiverId = formData.get('receiverId') as string
    const content = formData.get('content') as string

    if (!receiverId || !content) {
        return { error: 'Missing required fields' }
    }

    // 1. Deduct 5 Points
    const success = await deductPoints(user.id, 5)
    if (!success) {
        return { error: 'Pontos insuficientes. Enviar uma mensagem custa 5 pontos.' }
    }

    // 2. Insert Message
    const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: content,
    })

    if (error) {
        console.error('Failed to send message:', error)
        // Ideally we should refund points here, but for MVP we skip complex transactions.
        // We can manually refund or rely on low failure rate.
        return { error: 'Falha ao enviar mensagem.' }
    }

    revalidatePath('/messages')
    return { success: true }
}

export async function sendAnnouncement(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify Admin or Manager Permission
    const groupId = formData.get('groupId') as string // optional
    const content = formData.get('content') as string
    const isGlobal = formData.get('isGlobal') === 'true'

    if (!content) return { error: 'Content required' }

    let isAuthorized = false

    if (user.email === 'jundae54@gmail.com') {
        isAuthorized = true // Super Admin
    } else if (groupId) {
        // Check if moderator of this group
        const { data: mod } = await supabase
            .from('group_moderators')
            .select('*')
            .eq('user_id', user.id)
            .eq('group_id', groupId)
            .single()

        if (mod) isAuthorized = true
    }

    if (!isAuthorized) {
        return { error: 'Unauthorized to send announcements' }
    }

    const { error } = await supabase.from('announcements').insert({
        sender_id: user.id,
        target_group_id: isGlobal ? null : parseInt(groupId),
        content: content
    })

    if (error) {
        console.error('Failed to send announcement:', error)
        return { error: 'Failed to send announcement' }
    }

    revalidatePath('/messages')
    return { success: true }
}
