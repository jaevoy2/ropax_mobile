import { supabase } from "./supabase";




export const seatSelection = async (seat: string | number, tripID: number, deviceID: string) => {
    const { data, error } = await supabase.from('seat_channels').insert(
        { trip_id: tripID, seat_number: seat, event_type: 'selected', device_id: deviceID }
    );

    if (error) {
        console.log("Supabase insert error:", error);
        throw error;
    }

    return data;
};


export const seatRemoval = async (seat: string | number, tripID: number, deviceID: string) => {
    await supabase.from('seats_channels').insert(
        { trip_id: tripID, seat_number: seat, event_type: 'removed', device_id: deviceID }
    )
}