'use client' // Error components must be Client Components

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-lg">
                <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong!</h2>
                <p className="text-zinc-300 mb-6">
                    {error.message || 'An unexpected error occurred in the Admin Dashboard.'}
                </p>

                {error.message.includes('Environment') && (
                    <div className="bg-black/30 p-4 rounded text-sm text-left text-zinc-400 mb-6 font-mono">
                        <p className="mb-2 text-yellow-400">Possible Fix:</p>
                        <p>1. Check Vercel Environment Variables.</p>
                        <p>2. Ensure <strong>SUPABASE_SERVICE_ROLE_KEY</strong> is set.</p>
                        <p>3. Redeploy the project.</p>
                    </div>
                )}

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={
                            // Attempt to recover by trying to re-render the segment
                            () => reset()
                        }
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-colors"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
