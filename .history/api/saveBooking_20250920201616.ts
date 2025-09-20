import { InfantProps, PassengerProps } from "@/context/passenger";
import Constants from "expo-constants";


export async function SaveBooking(id: number, webCode: string, getPassengers: () => PassengerProps[], getInfants: () => InfantProps[]) {
    const passengers = getPassengers();
    const infants = getInfants();
    const extras = Constants.expoConfig?.extra ?? {};
    const API_KEY = extras.API_KEY as string;
    const API_URL = extras.API_URL as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        const res = await fetch(`${API_URL}booking/save`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`
            },
            body: JSON.stringify({
                station_id: 1,
                trip_id: id,
                web_code: webCode,
                passengers: passengers.map((p: any) => ({
                    firstname: p.name?.split(',')[1],
                    last_name: p.name?.split(',')[0],
                    gender: p.gender,
                    age: p.age,
                    address: p.address ?? '',
                    nationality: p?.nationality,
                    accommodation_id: p.accommodationID,
                    passenger_type_id: p.passType_id,
                    seat_no: p.seatNumber,

                    infants: p.infant?.map((i: any) => ({
                        first_name: i.name.split(',')[1],
                        last_name: i.name.split(',')[0],
                        age: i.age,
                        address: p.address ?? '',
                        nationality: p.nationality ?? '',
                        accommodation_id: p.accommodationID,
                        seat_no: 'N/A',
                    }))
                }))
            })
        });
    
        const response = await res.json();
    
        if(!res.ok) {
            throw new Error(response.message);
        }

        return response;

    } catch(error) {
        throw error;
    }

}