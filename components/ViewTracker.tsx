'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ViewTracker({ postId }: { postId: number }) {
    useEffect(() => {
        // Simple increment logic
        const increment = async () => {
            const supabase = createClient()

            // Try RPC first (preferred for atomicity)
            const { error } = await supabase.rpc('increment_views', { row_id: postId })

            if (error) {
                // Fallback or ignore (if RPC not exists, we can't easily increment securely from client without RLS allowing update)
                // For now, we assume RPC exists. Validating RLS for direct update 'views = views + 1' is hard from client.
                console.error('Error incrementing views:', error)
            }
        }

        increment()
    }, [postId])

    return null
}
