import Constants from 'expo-constants';



export async function FetchTrips() {
    const extras = Constants.expoConfig?.extra ?? {};
    const API_KEY = extras.API_KEY as string;
    const API_URL = extras.API_URL as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        const res = await fetch(`http://192.168.254.100:8000/api/trips`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`
            }
        });

        const response = await res.json();

        if(!res.ok) {
            console.log(API_KEY, API_URL, ORIGIN);
            throw new Error(response.message);
        }

        return response;
    }catch(error) {
        throw error;
    }

}

