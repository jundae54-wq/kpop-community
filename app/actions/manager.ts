'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyForManager(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Você precisa estar logado.' }
    }

    const groupId = formData.get('groupId')
    const reason = formData.get('reason')

    if (!groupId || !reason) {
        return { error: 'Dados inválidos.' }
    }

    // Check if pending application exists
    const { data: existing } = await supabase
        .from('manager_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .single()

    if (existing) {
        return { error: 'Você já tem uma solicitação pendente para este grupo.' }
    }

    const { error } = await supabase
        .from('manager_applications')
        .insert({
            user_id: user.id,
            group_id: groupId,
            reason: reason,
            status: 'pending'
        })

    if (error) {
        console.error('Error applying:', error)
        return { error: 'Erro ao enviar solicitação.' }
    }

    revalidatePath('/community')
    return { success: true }
}
