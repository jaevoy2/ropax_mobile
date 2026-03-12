import { supabase } from "./supabase";


export const seatSelection = async (seat: string | number, tripID: number, stationId: number, color: string) => {
    const { data, error } = await supabase.from('seats_selections').insert(
        { trip_id: tripID, seat_number: seat, station_id: stationId, status: 'held', color: color }
    );
    return { data, error }

} 

export const seatRemoval = async (seat: string | number, tripID: number) => {
    await supabase.from('seats_selections').delete()
    .eq('trip_id', tripID)
    .eq('seat_number', seat)
}