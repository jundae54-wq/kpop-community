export type Profile = {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    website: string | null
    updated_at: string | null
}

export type Group = {
    id: number
    name: string
    slug: string
    description: string | null
    created_at: string
    type: 'idol' | 'actor'
}

export type Post = {
    id: number
    title: string
    content: string | null
    author_id: string
    group_id: number | null
    created_at: string
    updated_at: string | null
    image_url: string | null
    views: number

    // Relations (Joined)
    author?: Profile
    group?: Group
    _count?: {
        comments: number
    }
}

export type Comment = {
    id: number
    post_id: number
    author_id: string
    content: string
    created_at: string

    // Relations
    author?: Profile
}

export type Notification = {
    id: number
    user_id: string
    actor_id: string
    post_id: number | null
    comment_id: number | null
    type: 'comment' | 'like'
    is_read: boolean
    created_at: string

    // Relations
    actor?: Profile
    post?: Post
}
