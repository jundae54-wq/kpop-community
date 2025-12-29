'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Global Error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md">
                <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                <p className="text-zinc-400 text-sm mb-6">
                    {error.message || 'An unexpected error occurred.'}
                </p>
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-white text-black font-medium rounded hover:bg-zinc-200 transition-colors"
                >
                    Try again
                </button>
            </div>
        </div>
    )
}
