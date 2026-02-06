'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function removeManager(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== 'jundae54@gmail.com') {
        return { error: 'Unauthorized' }
    }

    const groupId = formData.get('groupId')
    const userId = formData.get('userId')

    if (!groupId || !userId) {
        return { error: 'Invalid data' }
    }

    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase
        .from('group_moderators')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)

    if (error) {
        console.error('Remove Manager Error:', error)
        return { error: 'Failed to remove manager' }
    }

    revalidatePath('/admin/groups')
    return { success: true }
}
