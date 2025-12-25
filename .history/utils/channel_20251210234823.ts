import { supabase } from "./supabase";

export const seatSelection = async (seat: string | number, tripID: number) => {
    await supabase.from('seats_channels').insert(
        { trip_id: tripID, seat_number: seat, event_type: 'selected' }
    );
} 

export const seatRemoval = async (seat: string | number, tripID: number) => {
    await supabase.from('seats_channels').insert(
        { trip_id: tripID, seat_number: seat, event_type: 'removed' }
    )
}