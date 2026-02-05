import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export async function reviewCategoryRequest(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Admin check
    if (!user || user.email !== 'jundae54@gmail.com') {
        return { error: 'Unauthorized' }
    }

    // Use Service Role client for DB operations to bypass RLS
    const adminSupabase = createAdminClient()

    const requestId = formData.get('requestId')
    const action = formData.get('action') // 'approve' | 'reject'

    if (!requestId || !action) {
        return { error: 'Invalid data' }
    }

    if (action === 'reject') {
        const { error } = await adminSupabase
            .from('category_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId)

        if (error) return { error: 'Failed to reject' }
    } else if (action === 'approve') {
        // 1. Get request details
        const { data: req } = await adminSupabase
            .from('category_requests')
            .select('*')
            .eq('id', requestId)
            .single()

        if (!req) return { error: 'Request not found' }

        // 2. Create Group
        const { error: createError } = await adminSupabase
            .from('groups')
            .insert({
                name: req.name,
                type: req.type
            })

        if (createError) {
            console.error('Error creating group:', createError)
            return { error: 'Failed to create group' }
        }

        // 3. Update request status
        const { error: updateError } = await adminSupabase
            .from('category_requests')
            .update({ status: 'approved' })
            .eq('id', requestId)

        if (updateError) return { error: 'Failed to update status' }
    }

    revalidatePath('/admin/requests')
    revalidatePath('/community') // Update selector list
    return { success: true }
}
