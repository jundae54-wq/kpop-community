import SignupForm from './signup-form'

export default async function SignupPage(props: {
    searchParams: Promise<{ message: string; error: string }>
}) {
    const searchParams = await props.searchParams
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        Junte-se à <span className="text-brand">K-Community</span>
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Crie sua conta para começar a postar!
                    </p>
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

                <SignupForm />
            </div>
        </div>
    )
}
