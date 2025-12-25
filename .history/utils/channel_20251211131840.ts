import { supabase } from "./supabase";


export const seatSelection = async (seat: string | number, tripID: number) => {
    await supabase.from('seats').insert(
        { trip_id: tripID, seat_number: seat, event_type: 'selected'}
    );
} 

export const seatRemoval = async (seat: string | number, tripID: number) => {
    console.log('removing seat via channel', seat, tripID);

    const { data, error } = await supabase.from('seats').insert({
        trip_id: tripID,
        seat_number: seat,
        event_type: 'removed'
    });

    if (error) {
        console.log("❌ Supabase Error:", error);
    } else {
        console.log("✅ Seat removed inserted:", data);
    }
};
