export default function Loading() {
    return (
        <div className="mx-auto max-w-2xl py-8 px-4 animate-pulse">
            {/* Trending Skeleton */}
            <div className="mb-10">
                <div className="h-6 w-48 bg-zinc-800 rounded mb-4"></div>
                <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-5 h-40"></div>
            </div>

            {/* Type Nav Skeleton */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="h-24 rounded-2xl bg-zinc-900/40 border border-zinc-800"></div>
                <div className="h-24 rounded-2xl bg-zinc-900/40 border border-zinc-800"></div>
            </div>

            {/* Feed Skeleton */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-zinc-800 rounded"></div>
                <div className="h-8 w-24 bg-zinc-800 rounded-full"></div>
            </div>

            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-zinc-900/50 p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-full bg-zinc-800"></div>
                            <div className="space-y-1">
                                <div className="h-4 w-24 bg-zinc-800 rounded"></div>
                                <div className="h-3 w-16 bg-zinc-800 rounded"></div>
                            </div>
                        </div>
                        <div className="h-6 w-3/4 bg-zinc-800 rounded mb-2"></div>
                        <div className="h-4 w-full bg-zinc-800 rounded mb-1"></div>
                        <div className="h-4 w-2/3 bg-zinc-800 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}
