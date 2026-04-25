import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";


export async function FetchDisabledSeats() {
    const extras = Constants.expoConfig.extra ?? {};
    const API_URL = extras.API_URL as string;
    const API_KEY = extras.API_KEY as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        const token = await AsyncStorage.getItem('token');
        
        if(!token) {
            throw new Error('No token found. Please login again.');
        }

        const res = await fetch(`${API_URL}vessel/disabled-seats`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`,
                'Authorization': `${token}`
            }
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