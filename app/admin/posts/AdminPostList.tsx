'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { bulkDeletePosts, adminDeletePost, togglePostVisibility } from '../admin-actions'
import { ConfirmDeleteButton } from '@/components/admin/ConfirmDeleteButton'

type Post = {
    id: string
    title: string
    content: string
    author: { full_name: string | null } | null
    group: { name: string } | null
    is_hidden: boolean | null
}

type Props = {
    initialPosts: Post[]
}

export default function AdminPostList({ initialPosts }: Props) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isPending, startTransition] = useTransition()

    // Handle Select All
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(initialPosts.map(p => p.id)))
        } else {
            setSelectedIds(new Set())
        }
    }

    // Handle Single Select
    const handleSelect = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    // Handle Bulk Delete
    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} posts?`)) return

        startTransition(async () => {
            await bulkDeletePosts(Array.from(selectedIds))
            setSelectedIds(new Set()) // Clear selection
        })
    }

    return (
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden overflow-x-auto">
            {selectedIds.size > 0 && (
                <div className="bg-brand/10 p-4 border-b border-brand/20 flex items-center justify-between">
                    <span className="text-brand font-medium text-sm">
                        {selectedIds.size} selected
                    </span>
                    <button
                        onClick={handleBulkDelete}
                        disabled={isPending}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isPending ? 'Deleting...' : 'Delete Selected'}
                    </button>
                </div>
            )}
            <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-white/5 text-zinc-400">
                    <tr>
                        <th className="p-4 w-12">
                            <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={initialPosts.length > 0 && selectedIds.size === initialPosts.length}
                                className="rounded border-zinc-700 bg-zinc-800 text-brand focus:ring-brand"
                            />
                        </th>
                        <th className="p-4 font-medium">Title</th>
                        <th className="p-4 font-medium">Author</th>
                        <th className="p-4 font-medium">Group</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {initialPosts.map((post) => (
                        <tr key={post.id} className={`hover:bg-white/5 transition-colors ${selectedIds.has(post.id) ? 'bg-brand/5' : ''}`}>
                            <td className="p-4">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(post.id)}
                                    onChange={() => handleSelect(post.id)}
                                    className="rounded border-zinc-700 bg-zinc-800 text-brand focus:ring-brand"
                                />
                            </td>
                            <td className="p-4 max-w-xs">
                                <Link href={`/p/${post.id}`} className="block truncate font-medium text-white hover:text-brand">
                                    {post.title}
                                </Link>
                                <div className="text-xs text-zinc-500 mt-1 truncate">{post.content}</div>
                            </td>
                            <td className="p-4 text-zinc-300">
                                {post.author?.full_name || 'Unknown'}
                            </td>
                            <td className="p-4 text-zinc-400">
                                {post.group?.name || 'General'}
                            </td>
                            <td className="p-4">
                                {post.is_hidden ? (
                                    <span className="text-xs text-amber-500 font-medium">Hidden</span>
                                ) : (
                                    <span className="text-xs text-green-500 font-medium">Visible</span>
                                )}
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <form action={async (formData) => {
                                        await togglePostVisibility(formData)
                                    }}>
                                        <input type="hidden" name="postId" value={post.id} />
                                        <input type="hidden" name="isHidden" value={post.is_hidden ? 'true' : 'false'} />
                                        <button className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-white/5 hover:bg-white/10 rounded transition-colors">
                                            {post.is_hidden ? 'Show' : 'Hide'}
                                        </button>
                                    </form>
                                    <ConfirmDeleteButton
                                        action={adminDeletePost}
                                        itemId={post.id}
                                        itemType="post"
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
