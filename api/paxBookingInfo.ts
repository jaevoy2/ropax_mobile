import Constants from "expo-constants";


export async function FetchPaxBookingInfo(bookingId: number, paxId: number) {
    try {
        const extras = Constants.expoConfig.extra ?? {};
        const API_URL = extras.API_URL as string;
        const API_KEY = extras.API_KEY as string;
        const ORIGIN = extras.ORIGIN as string;
    
        const res = await fetch(`${API_URL}passenger-info`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`
            },
            body: JSON.stringify({ bookingId, paxId })
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