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
