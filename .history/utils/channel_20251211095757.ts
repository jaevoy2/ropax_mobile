import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";



export const seatSelection = async (seat: string | number, tripID: number) => {
    let deviceID = await AsyncStorage.getItem('device_id');

    if(!deviceID) {
        deviceID == crypto.randomUUID();
        await AsyncStorage.setItem('device_id', deviceID!);
    }

    await supabase.from('seats_channels').insert(
        { trip_id: tripID, seat_number: seat, event_type: 'selected', device_id: deviceID }
    );
} 

export const seatRemoval = async (seat: string | number, tripID: number) => {
    await supabase.from('seats_channels').insert(
        { trip_id: tripID, seat_number: seat, event_type: 'removed' }
    )
}