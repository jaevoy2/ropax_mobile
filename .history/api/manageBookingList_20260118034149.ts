import Constants from "expo-constants";

export async function FetchManageBookingList(date: string, search: string | null) {
    const extras = Constants.expoConfig?.extra ?? {};
    const API_KEY = extras.API_KEY as string;
    const API_URL = extras.API_URL as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        const res = await fetch(`${API_URL}manage-booking/list`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'Origin': ORIGIN
            },
            body: JSON.stringify({ date, search })
        });

        const response = await res.json();

        if(!res.ok) {
            throw new Error('Error', response.message);
        }

        return response;
    }catch (error) {
        throw error;
    }
}