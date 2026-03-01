import Link from 'next/link'

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-brand selection:text-white">
            {/* Hero Section */}
            <section className="relative px-6 py-24 text-center overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/20 via-zinc-950 to-zinc-950 -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/10 rounded-full blur-3xl -z-10" />

                <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-pink-500 whitespace-nowrap">K-Community</span>
                </h1>
                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    More than just a news feed. It&apos;s your safe, curated space to discover the latest from Korea and connect with real fans without the noise.
                </p>
            </section>

            {/* Features Container */}
            <section className="max-w-5xl mx-auto px-6 py-12 space-y-24">

                {/* Feature 1: News */}
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-brand/10 text-brand mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold">Lightning Fast News in Portuguese</h2>
                        <p className="text-zinc-400 text-lg">
                            Stop using translation tools. We deliver the absolute fastest K-Entertainment news directly from Korean sources. Be the first to know and become the ultimate K-Pop insider among your friends with our 24/7 natural Portuguese translations.
                        </p>
                    </div>
                    <div className="flex-1 w-full bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="space-y-4">
                            <div className="h-4 w-1/3 bg-zinc-800 rounded animate-pulse" />
                            <div className="h-20 w-full bg-zinc-800 rounded" />
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-brand/20 text-brand text-xs rounded-full">News</span>
                                <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full">Translated</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature 2: Community */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-500/10 text-blue-400 mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold">Your Dedicated Fandom Spaces</h2>
                        <p className="text-zinc-400 text-lg">
                            Tired of algorithm chaos and fan wars? We provide dedicated, moderated community boards for specific Idols and Actors. Connect with people who share your passion in a toxic-free environment.
                        </p>
                    </div>
                    <div className="flex-1 w-full bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <div className="flex flex-wrap gap-3">
                            {['BTS', 'BLACKPINK', 'NewJeans', 'Stray Kids', 'Cha Eun-woo'].map((tag) => (
                                <div key={tag} className="px-4 py-2 bg-zinc-800/80 border border-white/5 rounded-xl text-sm font-medium hover:border-blue-500/30 hover:bg-zinc-800 transition-colors cursor-default">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Feature 3: Rewards */}
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-yellow-500/10 text-yellow-500 mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.612a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.53a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.612a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold">Earn Perks Daily</h2>
                        <p className="text-zinc-400 text-lg">
                            We value your presence. Earn points just by logging in daily, dropping comments, or creating posts. Spend those points in our shop for custom profile colors and exclusive badges that show off your stan status.
                        </p>
                    </div>
                    <div className="flex-1 w-full bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center py-10">
                        <div className="text-4xl animate-bounce mb-2">🎁</div>
                        <div className="text-xl font-bold text-yellow-500">+10 Points</div>
                        <p className="text-sm text-zinc-500 mt-1">Daily Login Bonus</p>
                    </div>
                </div>

            </section>

            {/* CTA Section */}
            <section className="text-center py-24 px-6 border-t border-white/5 bg-zinc-900/20">
                <h2 className="text-3xl font-bold mb-6">Ready to dive in?</h2>
                <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                    Configure your profile, pick your favorite category, and introduce yourself to the community.
                </p>
                <Link
                    href="/community"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-brand rounded-full hover:bg-brand/90 hover:scale-105 transition-all shadow-lg shadow-brand/20"
                >
                    Start Exploring
                </Link>
            </section>
        </div>
    )
}
