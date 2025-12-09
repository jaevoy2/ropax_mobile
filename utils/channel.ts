import { supabase } from "./supabase";

export const channel = supabase.channel('seat_selection')
    .on('broadcast', { event: 'seat_select' }, (payload) => {
        console.log('Seat selected:', payload);
    })
    .subscribe();

export function broadcastSeatSelection(seat: string | number) {
    channel.send({
        type: 'broadcast',
        event: 'seat_select',
        payload: { seat }
    })
}

export function broadcastSeatRemoval(seat: string | number) {
    channel.send({
        type: 'broadcast',
        event: 'seat_remove',
        payload: { seat }
    })
}