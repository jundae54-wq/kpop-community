'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Notification } from '@/types/database'

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchNotifications()
        // Optional: Set up an interval or realtime subscription here
    }, [])

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                actor:profiles!actor_id(*),
                post:posts(*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (data && !error) {
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.is_read).length)
        }
    }

    const markAsRead = async (id: number) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-zinc-400 hover:text-white transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 z-50 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl backdrop-blur-xl">
                        <div className="border-b border-white/10 px-4 py-3">
                            <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-zinc-500">
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <Link
                                        key={notification.id}
                                        href={notification.post_id ? `/p/${notification.post_id}` : '#'}
                                        onClick={() => markAsRead(notification.id)}
                                        className={`block border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/5 ${!notification.is_read ? 'bg-brand/5' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Avatar placeholder */}
                                            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white">
                                                {notification.actor?.username?.[0] || '?'}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm text-gray-300">
                                                    <span className="font-semibold text-white">
                                                        {notification.actor?.username || 'Someone'}
                                                    </span>
                                                    {' '}
                                                    {notification.type === 'comment' ? 'commented on your post' : 'liked your post'}
                                                </p>
                                                {notification.post && (
                                                    <p className="text-xs text-zinc-500 line-clamp-1">
                                                        "{notification.post.title}"
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-zinc-600">
                                                    {new Date(notification.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand" />
                                            )}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
