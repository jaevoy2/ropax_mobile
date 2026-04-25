import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";


export async function CancelPaxBooking(bookingId: number, reason: string, charge: number, refundAmnt: number, tripDate: string, tripScheduleId: number, selectAll: boolean, passenger_ids: number[], isByManagement: boolean) {
    const extras = Constants.expoConfig.extra ?? {};
    const API_URL = extras.API_URL as string;
    const API_KEY = extras.API_KEY as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        const token = await AsyncStorage.getItem('token');
        
        if(!token) {
            throw new Error('No token found. Please login again.');
        }

        const res = await fetch(`${API_URL}cancel-booking`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`,
                'Authorization': `${token}`
            },
            body: JSON.stringify({ 
                booking_id: bookingId,
                reason,
                charge,
                refundAmnt,
                tripDate,
                selectAll,
                passenger_ids,
                tripScheduleId,
                isByManagement
            })
        });
    
        const response = await res.json();

        if(!res.ok) {
            throw new Error(response.message);
        }

        return response;
    }catch(error) {
        throw error;
    }
}