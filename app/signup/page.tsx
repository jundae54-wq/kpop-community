import { signup } from '../auth/actions'
import Link from 'next/link'

export default async function SignupPage(props: {
    searchParams: Promise<{ message: string; error: string }>
}) {
    const searchParams = await props.searchParams
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        Join <span className="text-brand">K-Community</span>
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Create your account to start posting!
                    </p>
                </div>

                <form className="mt-8 space-y-6">
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="fullName" className="sr-only">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                className="relative block w-full rounded-lg border-0 bg-zinc-800 py-3 px-4 text-white placeholder-zinc-400 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-brand sm:text-sm sm:leading-6"
                                placeholder="Full Name (Nickname)"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full rounded-lg border-0 bg-zinc-800 py-3 px-4 text-white placeholder-zinc-400 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-brand sm:text-sm sm:leading-6"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full rounded-lg border-0 bg-zinc-800 py-3 px-4 text-white placeholder-zinc-400 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-brand sm:text-sm sm:leading-6"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {searchParams?.message && (
                        <p className="mt-2 text-center text-sm text-emerald-400 bg-emerald-400/10 p-2 rounded">
                            {searchParams.message}
                        </p>
                    )}

                    {searchParams?.error && (
                        <p className="mt-2 text-center text-sm text-red-400 bg-red-400/10 p-2 rounded">
                            {searchParams.error}
                        </p>
                    )}

                    <div>
                        <button
                            formAction={signup}
                            className="group relative flex w-full justify-center rounded-lg bg-brand px-3 py-3 text-sm font-semibold text-white hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand transition-all duration-200"
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-zinc-400">Already have an account? </span>
                        <Link href="/login" className="font-semibold text-brand hover:text-brand/80">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
