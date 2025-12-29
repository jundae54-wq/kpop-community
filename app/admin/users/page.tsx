import { createAdminClient } from '@/utils/supabase/admin'
import Link from 'next/link'
import { banUser, deleteUser } from '../admin-actions'
import { ConfirmDeleteButton } from '@/components/admin/ConfirmDeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    return (
        <div className="p-8 text-white">
            <h1 className="text-2xl font-bold mb-4">Admin Check</h1>
            <p>If you see this, the page render is working effectively.</p>
            <p>Please check logs to see if metadata or event handler errors persist.</p>
        </div>
    )
}
