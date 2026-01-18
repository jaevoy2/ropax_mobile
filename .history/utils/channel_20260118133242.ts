import { supabase } from "./supabase";


export const seatSelection = async (seat: string | number, tripID: number) => {
    const { data, error } = await supabase.from('seats_selections').insert([
        { trip_id: tripID, seat_number: seat },
    ]).select()
    
    return { data, error }

} 

export const seatRemoval = async (seat: string | number, tripID: number) => {
    await supabase.from('seats_selections').delete()
    .eq('trip_id', tripID)
    .eq('seat_number', seat)
}