import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createPost } from '../auth/actions'

export default async function WritePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?message=Please log in to write a post')
    }

    // Fetch groups for the dropdown
    const { data: groups } = await supabase
        .from('groups')
        .select('id, name, type')
        .order('name')

    const idols = groups?.filter(g => g.type === 'idol') || []
    const actors = groups?.filter(g => g.type === 'actor') || []

    return (
        <div className="mx-auto max-w-xl py-12 px-4">
            <h1 className="text-2xl font-bold text-white mb-6">Write a Post</h1>

            <form action={createPost} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        className="w-full rounded-lg border border-white/10 bg-zinc-900 p-4 text-white placeholder-zinc-500 focus:border-brand focus:ring-1 focus:ring-brand transition-colors outline-none"
                        placeholder="What's happening in K-Pop?"
                    />
                </div>

                <div>
                    <label htmlFor="groupId" className="block text-sm font-medium text-zinc-300 mb-2">Category</label>
                    <div className="relative">
                        <select
                            name="groupId"
                            id="groupId"
                            required
                            className="w-full appearance-none rounded-xl border border-input bg-zinc-900 p-4 text-white focus:border-brand focus:ring-1 focus:ring-brand transition-all outline-none invalid:text-zinc-500 hover:border-zinc-700"
                            defaultValue=""
                        >
                            <option value="" disabled className="bg-zinc-900 text-zinc-500">Select a category</option>
                            {idols.length > 0 && (
                                <optgroup label="Idols" className="bg-zinc-900 text-zinc-400 font-bold">
                                    {idols.map((group) => (
                                        <option key={group.id} value={group.id} className="bg-zinc-900 text-white font-normal py-1">
                                            {group.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {actors.length > 0 && (
                                <optgroup label="Actors" className="bg-zinc-900 text-zinc-400 font-bold">
                                    {actors.map((group) => (
                                        <option key={group.id} value={group.id} className="bg-zinc-900 text-white font-normal py-1">
                                            {group.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-zinc-300 mb-2">Content</label>
                    <textarea
                        name="content"
                        id="content"
                        rows={6}
                        className="w-full rounded-lg border border-white/10 bg-zinc-900 p-4 text-white placeholder-zinc-500 focus:border-brand focus:ring-1 focus:ring-brand transition-colors outline-none resize-none"
                        placeholder="Share your thoughts..."
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-brand/90 transition-all"
                    >
                        Publish Post
                    </button>
                </div>
            </form>
        </div>
    )
}
