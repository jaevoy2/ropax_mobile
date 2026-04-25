import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';


export async function FetchTrips(trip_date: string) {
    const extras = Constants.expoConfig?.extra ?? {};
    const API_KEY = extras.API_KEY as string;
    const API_URL = extras.API_URL as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        const token = await AsyncStorage.getItem('token');
        
        if(!token) {
            throw new Error('No token found. Please login again.');
        }
        
        const res = await fetch(`${API_URL}trips/schedule`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`,
                'Authorization': `${token}`
            },
            body: JSON.stringify({ trip_date })
        });
        const response = await res.json();

        if(!res.ok) {
            throw new Error(response.message)
        }

        return response;
    }catch(error) {
        throw error;
    }

}

