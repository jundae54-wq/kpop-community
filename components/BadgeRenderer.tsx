import { Group } from '@/types/database'

type BadgeRendererProps = {
    badgeId: string | null
    groups: Group[]
    className?: string
}

export function BadgeRenderer({ badgeId, groups, className = "" }: BadgeRendererProps) {
    if (!badgeId || !badgeId.startsWith('badge_')) return null

    const groupId = parseInt(badgeId.split('_')[1])
    const group = groups.find(g => g.id === groupId)

    if (!group) return null

    // Generate a simple colored badge or icon based on group name
    // For now, text badge
    return (
        <span
            className={`inline-flex items-center justify-center px-1.5 py-0.5 mx-1 rounded text-[10px] font-bold bg-zinc-800 border border-white/10 text-zinc-300 ${className}`}
            title={group.name}
        >
            {group.name.slice(0, 3).toUpperCase()}
        </span>
    )
}
