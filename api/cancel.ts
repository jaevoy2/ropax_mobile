import Constants from "expo-constants";


export async function CancelPaxBooking(bookingId: number, reason: string, recipient: string, charge: number, refundAmnt: number) {
    const extras = Constants.expoConfig.extra ?? {};
    const API_URL = extras.API_URL as string;
    const API_KEY = extras.API_KEY as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        const res = await fetch(`${API_URL}cancel-booking`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`
            },
            body: JSON.stringify({ 
                booking_id: bookingId,
                reason,
                recipient,
                charge,
                refundAmnt
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