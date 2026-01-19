'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { bulkDeleteComments, adminDeleteComment } from '../admin-actions'
import { ConfirmDeleteButton } from '@/components/admin/ConfirmDeleteButton'

type Comment = {
    id: number
    content: string
    created_at: string
    author: { full_name: string | null } | null
    post: {
        title: string
        group: { name: string } | null
    } | null
    post_id: number
}

type Props = {
    initialComments: Comment[]
}

export default function AdminCommentList({ initialComments }: Props) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isPending, startTransition] = useTransition()

    // Handle Select All
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(initialComments.map(c => c.id.toString())))
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
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} comments?`)) return

        startTransition(async () => {
            await bulkDeleteComments(Array.from(selectedIds))
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
                                checked={initialComments.length > 0 && selectedIds.size === initialComments.length}
                                className="rounded border-zinc-700 bg-zinc-800 text-brand focus:ring-brand"
                            />
                        </th>
                        <th className="p-4 font-medium w-1/2">Content</th>
                        <th className="p-4 font-medium">Author</th>
                        <th className="p-4 font-medium">Post/Group</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {initialComments.map((comment) => (
                        <tr key={comment.id} className={`hover:bg-white/5 transition-colors ${selectedIds.has(comment.id.toString()) ? 'bg-brand/5' : ''}`}>
                            <td className="p-4">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(comment.id.toString())}
                                    onChange={() => handleSelect(comment.id.toString())}
                                    className="rounded border-zinc-700 bg-zinc-800 text-brand focus:ring-brand"
                                />
                            </td>
                            <td className="p-4">
                                <div className="text-white line-clamp-2">{comment.content}</div>
                                <div className="text-xs text-zinc-500 mt-1">
                                    {new Date(comment.created_at).toLocaleString()}
                                </div>
                            </td>
                            <td className="p-4 text-zinc-300">
                                {comment.author?.full_name || 'Unknown'}
                            </td>
                            <td className="p-4">
                                <div className="text-zinc-400 text-xs">
                                    on <Link href={`/p/${comment.post_id}`} className="text-zinc-300 hover:text-white underline">{comment.post?.title}</Link>
                                </div>
                                <div className="text-zinc-500 text-[10px] mt-0.5">
                                    in {comment.post?.group?.name || 'General'}
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <ConfirmDeleteButton
                                    action={adminDeleteComment}
                                    itemId={comment.id.toString()}
                                    itemType="comment"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
