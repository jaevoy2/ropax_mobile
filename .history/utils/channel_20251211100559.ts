import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "./supabase";


let deviceID = await AsyncStorage.getItem('device_id');

if(!deviceID) {
    deviceID == uuidv4();
    await AsyncStorage.setItem('device_id', deviceID!);
}

export const seatSelection = async (seat: string | number, tripID: number) => {
    await supabase.from('seats_channels').insert(
        { trip_id: tripID, seat_number: seat, event_type: 'selected', device_id: deviceID }
    );
} 

export const seatRemoval = async (seat: string | number, tripID: number) => {
    await supabase.from('seats_channels').insert(
        { trip_id: tripID, seat_number: seat, event_type: 'removed', device_id: deviceID }
    )
}