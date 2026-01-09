import { createClient } from './supabase/server'

export async function incrementPoints(userId: string, amount: number) {
    const supabase = await createClient()

    // Using rpc is atomic and safer for counters, but for simplicity and V1 we can fetch and update.
    // However, Supabase (Postgres) supports `inc`?
    // Let's effectively do: update profiles set points = points + amount where id = userId

    // Since we don't have a custom RPC for this yet, we will do a direct RPC call if we create one,
    // OR just use plain SQL via rpc if we had one.
    // But since we can't create RPCs easily without SQL editor access (we have migrations but applying them is manual for user),
    // let's try to stick to standard specific update if possible, or read-modify-write (optimistic locking not strictly needed for fun points).

    // READ-MODIFY-WRITE approach (easiest without custom RPC)
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', userId).single()

    if (profile) {
        const newPoints = (profile.points || 0) + amount
        const { error } = await supabase
            .from('profiles')
            .update({ points: newPoints })
            .eq('id', userId)

        if (error) {
            console.error('Error incrementing points:', error)
        }
    }
}
}

export async function checkAndAwardDailyLoginBonus(userId: string) {
    const supabase = await createClient()
    const { data: profile } = await supabase.from('profiles').select('points, last_login_reward').eq('id', userId).single()

    if (!profile) return

    const now = new Date()
    const lastReward = profile.last_login_reward ? new Date(profile.last_login_reward) : null

    // Check if reward was collected "today" (simple check: same date string in local/UTC?)
    // Better: Check if lastReward < today_start_of_day
    // Or just "20 hours ago".
    // User requested "Once a day".
    // Let's use: if (!lastReward || lastReward.getDate() !== now.getDate() || lastReward.getMonth() !== now.getMonth() || lastReward.getFullYear() !== now.getFullYear())
    // This resets at midnight local/server time (UTC usually).

    let shouldAward = false
    if (!lastReward) {
        shouldAward = true
    } else {
        // Compare UTC dates
        const isSameDay =
            lastReward.getUTCFullYear() === now.getUTCFullYear() &&
            lastReward.getUTCMonth() === now.getUTCMonth() &&
            lastReward.getUTCDate() === now.getUTCDate()

        if (!isSameDay) {
            shouldAward = true
        }
    }

    if (shouldAward) {
        const newPoints = (profile.points || 0) + 10 // Daily Bonus Amount
        await supabase
            .from('profiles')
            .update({
                points: newPoints,
                last_login_reward: now.toISOString()
            })
            .eq('id', userId)

        console.log(`Awarded daily login bonus to ${userId}`)
    } else {
        console.log(`Daily bonus already collected for ${userId}`)
    }
}
