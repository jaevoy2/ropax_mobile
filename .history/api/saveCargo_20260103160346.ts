import { CargoTotalAndNote, PaxCargoProperties } from '@/context/cargoProps';
import { TripContextProps } from '@/context/trip';
import Constants from 'expo-constants';



export async function SaveCargo(trip: TripContextProps, cargoProps: PaxCargoProperties, totalAndNote: CargoTotalAndNote) {
    const extras = Constants.expoConfig?.extra ?? {};
    const API_KEY = extras.API_KEY as string;
    const API_URL = extras.API_URL as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        const res = await fetch(`${API_URL}save/expenses`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`
            },
            body: JSON.stringify({
                cargo_option_id: cargoProps.cargoOptionID,
                quantity: cargoProps.quantity,
                note: totalAndNote?.note,
                amount: totalAndNote.totalAmount,
                trip_id: trip.id
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

