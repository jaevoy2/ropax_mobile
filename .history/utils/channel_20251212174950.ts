import { supabase } from "./supabase";


export const seatSelection = async (seat: string | number, tripID: number) => {
    await supabase.from('seats_selections').insert(
        { trip_id: tripID, seat_number: seat}
    );
} 

export const seatRemoval = async (seat: string | number, tripID: number) => {
    await supabase.from('seats_selections').delete()
    .eq('trip_id', tripID)
    .eq('seat_number', seat)
}