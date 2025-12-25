import LoadingSpinner from '@/components/LoadingSpinner'

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-sm text-zinc-400">Carregando...</p>
            </div>
        </div>
    )
}
