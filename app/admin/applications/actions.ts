'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reviewApplication(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Admin check (simple email check for now, matching middleware/other parts)
    if (!user || user.email !== 'jundae54@gmail.com') {
        return { error: 'Unauthorized' }
    }

    const applicationId = formData.get('applicationId')
    const action = formData.get('action') // 'approve' | 'reject'

    if (!applicationId || !action) {
        return { error: 'Invalid data' }
    }

    if (action === 'reject') {
        const { error } = await supabase
            .from('manager_applications')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('id', applicationId)

        if (error) return { error: 'Failed to reject' }
    } else if (action === 'approve') {
        // Transaction manually:
        // 1. Get application details
        const { data: app } = await supabase
            .from('manager_applications')
            .select('*')
            .eq('id', applicationId)
            .single()

        if (!app) return { error: 'Application not found' }

        // 2. Insert into group_moderators
        const { error: modError } = await supabase
            .from('group_moderators')
            .insert({ group_id: app.group_id, user_id: app.user_id })

        if (modError) {
            console.error('Error adding moderator:', modError)
            return { error: 'Failed to add moderator' }
        }

        // 3. Update application status
        const { error: updateError } = await supabase
            .from('manager_applications')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', applicationId)

        if (updateError) return { error: 'Failed to update status' }
    }

    revalidatePath('/admin/applications')
    revalidatePath('/community')
    return { success: true }
}
