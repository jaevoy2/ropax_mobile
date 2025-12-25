import { supabase } from "./supabase";

export const channel = supabase.channel('seat_selection')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'seats_channels' }, (payload) => {
        console.log('Seat selected:', payload);

    })
    .subscribe();
