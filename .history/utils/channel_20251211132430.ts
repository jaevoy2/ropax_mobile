import { supabase } from "./supabase";


export const seatSelection = async (seat: string | number, tripID: number) => {
    await supabase.from('seats').insert(
        { trip_id: tripID, seat_number: seat, event_type: 'selected'}
    );
} 

export const seatRemoval = async (seat: string | number, tripID: number) => {

    console.log('removing seat via channel', seat, tripID);
    await supabase.from('seats').update(
        { event_type: 'removed' }
    )
    .eq('trip_id', tripID)
    .eq('seat_number', seat)
}