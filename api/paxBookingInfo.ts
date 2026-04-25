import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";



export async function FetchPaxBookingInfo(bookingId: number, paxId: number, refNum: string) {
    const extras = Constants.expoConfig.extra ?? {};
    const API_URL = extras.API_URL as string;
    const API_KEY = extras.API_KEY as string;
    const ORIGIN = extras.ORIGIN as string;
    
    try {
        const token = await AsyncStorage.getItem('token');
        
        if(!token) {
            throw new Error('No token found. Please login again.');
        }
        
        const res = await fetch(`${API_URL}passenger-info`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`,
                'Authorization': `${token}`
            },
            body: JSON.stringify({ bookingId, paxId, refNum })
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