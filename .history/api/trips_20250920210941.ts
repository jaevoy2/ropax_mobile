import Constants from 'expo-constants';


export async function FetchTrips() {
    const extras = Constants.expoConfig?.extra ?? {};
    const API_KEY = extras.API_KEY as string;
    const API_URL = extras.API_URL as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        const res = await fetch(`${API_URL}trips/schedule`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`
            }
        });
        const response = await res.json();
        console.log(API_KEY);

        if(!res.ok) {
            throw new Error(response.message)
        }

        return response;
    }catch(error) {
        throw error;
    }

}

